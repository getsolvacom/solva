import { useState, useEffect } from "react";
import { C } from "../../tokens";
import { Check } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function ContactSupportModal({ open, onClose }) {
  const [subject,    setSubject]    = useState("");
  const [message,    setMessage]    = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState(false);

  const handleClose = () => {
    setSubject("");
    setMessage("");
    setSubmitting(false);
    setError("");
    setSuccess(false);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") handleClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  const canSend = subject.trim() && message.trim() && !submitting;

  const handleSubmit = async () => {
    if (!canSend) return;
    setSubmitting(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be signed in to contact support.");

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle();

      const { data: insertedRow, error: insertError } = await supabase.from('support_requests').insert({
        user_id: user.id,
        store_id: store?.id || null,
        subject: subject.trim(),
        message: message.trim(),
        context: {
          plan: profile?.plan || null,
          page: window.location.pathname,
          userAgent: navigator.userAgent,
          email: user.email,
        },
      }).select().single();
      if (insertError) throw insertError;

      try {
        await fetch("https://mscwabuwuqoyiccxtsps.supabase.co/functions/v1/notify-support", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ record: insertedRow }),
        });
      } catch (notifyErr) {
        console.error("notify-support call failed:", notifyErr);
      }

      setSuccess(true);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:10010,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}
      onClick={handleClose}
    >
      <style>{`
        @keyframes csSpin{to{transform:rotate(360deg);}}
        .cs-btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:csFlow 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
        .cs-btn-primary:disabled{opacity:.45;cursor:not-allowed;}
        @keyframes csFlow{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        .cs-btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      `}</style>

      <div
        style={{background:C.card,border:"1px solid var(--border-hi)",borderRadius:16,maxWidth:480,width:"92%",padding:28,maxHeight:"85vh",overflowY:"auto",fontFamily:"'Outfit',sans-serif"}}
        onClick={(e)=>e.stopPropagation()}
      >
        {success ? (
          <div style={{textAlign:"center",padding:"12px 0"}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:"rgba(62,207,178,.12)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
              <Check size={26} strokeWidth={2.5} color={C.teal}/>
            </div>
            <h3 style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:8}}>Message sent</h3>
            <p style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,marginBottom:24}}>We'll get back to you at your account email.</p>
            <button className="cs-btn-primary" onClick={handleClose} style={{padding:"10px 24px",borderRadius:9,color:"#fff",fontWeight:700,fontSize:13.5}}>Close</button>
          </div>
        ) : (
          <>
            <h3 style={{fontSize:18,fontWeight:800,color:C.text,marginBottom:6}}>Contact Support</h3>
            <p style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,marginBottom:20}}>Send us a message and we'll reply to your account email within 24 hours.</p>

            <div style={{marginBottom:14}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.muted,marginBottom:6}}>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e)=>setSubject(e.target.value)}
                placeholder="What do you need help with?"
                style={{width:"100%",padding:"10px 14px",borderRadius:8,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none"}}
              />
            </div>

            <div style={{marginBottom:12}}>
              <label style={{display:"block",fontSize:12,fontWeight:700,color:C.muted,marginBottom:6}}>Message</label>
              <textarea
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                rows={5}
                placeholder="Describe the issue you're running into..."
                style={{width:"100%",padding:"10px 14px",borderRadius:8,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text)",fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",resize:"vertical",lineHeight:1.6}}
              />
            </div>

            <p style={{fontSize:11.5,color:"var(--muted)",marginBottom:18}}>Your store and plan details are attached automatically.</p>

            {error && (
              <p style={{fontSize:12.5,color:C.red,marginBottom:14,lineHeight:1.5}}>{error}</p>
            )}

            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="cs-btn-ghost" onClick={handleClose}
                style={{padding:"10px 20px",borderRadius:9,border:"1px solid var(--border)",color:"var(--sub)",fontSize:13,fontWeight:600}}>Cancel</button>
              <button className="cs-btn-primary" onClick={handleSubmit} disabled={!canSend}
                style={{padding:"10px 22px",borderRadius:9,color:"#fff",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:7}}>
                {submitting && (
                  <div style={{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"csSpin .7s linear infinite",flexShrink:0}}/>
                )}
                Send Message
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
