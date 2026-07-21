/**
 * Shared unread rule for tickets. Single source of truth for TicketsView's
 * "Unread" filter tab and the sidebar badge in useSidebarCounts — the two must
 * never disagree about what unread means.
 *
 * A ticket is unread when the customer's most recent message arrived after the
 * merchant last opened it. merchant_last_viewed_at is written per-ticket when
 * its detail view is opened, not when the list is viewed.
 */
export function isTicketUnread(messages, lastViewedAt) {
  if (!Array.isArray(messages)) return false;
  const lastCustomerMsg = [...messages].reverse().find(m => m.from === 'customer');
  if (!lastCustomerMsg || !lastCustomerMsg.time) return false;
  const msgTime = new Date(lastCustomerMsg.time).getTime();
  if (isNaN(msgTime)) return false;
  if (!lastViewedAt) return true;
  return msgTime > new Date(lastViewedAt).getTime();
}
