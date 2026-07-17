import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const cronSecret = req.headers.get('x-cron-secret');
  const expectedSecret = Deno.env.get('CRON_SECRET');
  if (!expectedSecret || cronSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  try {
    const secretKeys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      secretKeys.default ?? ''
    );

    const { data: claimed, error: claimError } = await supabase.rpc('claim_due_scheduled_messages', { batch_size: 20 });

    if (claimError) {
      console.error('Failed to claim due messages:', claimError);
      return new Response(JSON.stringify({ error: 'Claim failed', details: claimError.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!claimed || claimed.length === 0) {
      return new Response(JSON.stringify({ processed: 0, sent: 0, failed: 0 }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    let sentCount = 0;
    let failedCount = 0;

    for (const msg of claimed) {
      try {
        const sendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${msg.from_name || 'Support'} <support@support.getsolva.app>`,
            to: [msg.to_email],
            reply_to: msg.reply_to || undefined,
            subject: msg.subject,
            text: msg.body,
          }),
        });

        if (!sendRes.ok) {
          const errBody = await sendRes.text();
          console.error(`Send failed for message ${msg.id}:`, errBody);
          await supabase
            .from('scheduled_messages')
            .update({ status: 'failed', error: errBody, attempts: (msg.attempts || 0) + 1, updated_at: new Date().toISOString() })
            .eq('id', msg.id);
          failedCount++;
          continue;
        }

        const resendData = await sendRes.json();

        // Ticket replies additionally mirror the sent message onto the ticket
        // itself, matching send-ticket-reply's contract. The email is already
        // out by this point, so nothing here may throw or `continue`: either
        // would let this row miss its 'sent' update and be re-claimed on a
        // later tick, sending the customer a duplicate.
        if (msg.type === 'ticket_reply') {
          try {
            const { data: ticket, error: ticketFetchError } = await supabase
              .from('tickets')
              .select('messages')
              .eq('id', msg.ref_id)
              .maybeSingle();

            if (ticketFetchError) {
              console.error(`Sent OK but failed to fetch ticket ${msg.ref_id} for message ${msg.id}:`, ticketFetchError);
            } else if (!ticket) {
              console.error(`Sent OK but no ticket exists for ref_id ${msg.ref_id} (message ${msg.id}) — ticket update skipped`);
            } else {
              const updatedMessages = [
                ...(Array.isArray(ticket.messages) ? ticket.messages : []),
                { from: 'agent', time: new Date().toISOString(), text: msg.body },
              ];

              const { error: ticketUpdateError } = await supabase
                .from('tickets')
                .update({
                  messages: updatedMessages,
                  status: 'resolved',
                  approved_at: new Date().toISOString(),
                  sent_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('id', msg.ref_id);

              if (ticketUpdateError) {
                console.error(`Sent OK but failed to update ticket ${msg.ref_id} for message ${msg.id}:`, ticketUpdateError);
              }
            }
          } catch (ticketErr) {
            console.error(`Sent OK but ticket sync threw for message ${msg.id}:`, ticketErr);
          }
        }

        if (msg.type === 'return_reply') {
          const { data: returnRow, error: returnFetchError } = await supabase.from('returns').select('messages').eq('id', msg.ref_id).maybeSingle();

          if (returnFetchError) {
            console.error(`Failed to fetch return ${msg.ref_id} for message mirroring:`, returnFetchError);
          } else if (returnRow) {
            const updatedMessages = [
              ...(Array.isArray(returnRow.messages) ? returnRow.messages : []),
              { from: 'agent', text: msg.body, time: new Date().toISOString() },
            ];
            const { error: returnUpdateError } = await supabase.from('returns').update({
              messages: updatedMessages,
              updated_at: new Date().toISOString(),
            }).eq('id', msg.ref_id);

            if (returnUpdateError) {
              console.error(`Failed to update return ${msg.ref_id} after scheduled send:`, returnUpdateError);
            }
          } else {
            console.error(`No return found for id ${msg.ref_id} — scheduled reply sent but could not be mirrored.`);
          }
        }

        if (msg.type === 'return_deflection') {
          const { data: returnRow, error: returnFetchError } = await supabase.from('returns').select('messages').eq('id', msg.ref_id).maybeSingle();

          if (returnFetchError) {
            console.error(`Failed to fetch return ${msg.ref_id} for deflection message mirroring:`, returnFetchError);
          } else if (returnRow) {
            const updatedMessages = [
              ...(Array.isArray(returnRow.messages) ? returnRow.messages : []),
              { from: 'ai', text: msg.body, time: new Date().toISOString() },
            ];
            const { error: returnUpdateError } = await supabase.from('returns').update({
              messages: updatedMessages,
              updated_at: new Date().toISOString(),
            }).eq('id', msg.ref_id);

            if (returnUpdateError) {
              console.error(`Failed to update return ${msg.ref_id} after automatic deflection send:`, returnUpdateError);
            }
          } else {
            console.error(`No return found for id ${msg.ref_id} — deflection sent but could not be mirrored.`);
          }
        }

        const { error: updateError } = await supabase
          .from('scheduled_messages')
          .update({
            status: 'sent',
            sent_at: new Date().toISOString(),
            resend_email_id: resendData?.id || null,
            attempts: (msg.attempts || 0) + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', msg.id);

        if (updateError) {
          console.error(`Sent OK but failed to update message ${msg.id}:`, updateError);
        }

        sentCount++;
      } catch (err) {
        console.error(`Unexpected error sending message ${msg.id}:`, err);
        await supabase
          .from('scheduled_messages')
          .update({ status: 'failed', error: String(err), attempts: (msg.attempts || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', msg.id);
        failedCount++;
      }
    }

    return new Response(
      JSON.stringify({ processed: claimed.length, sent: sentCount, failed: failedCount }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('scheduler-tick error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
