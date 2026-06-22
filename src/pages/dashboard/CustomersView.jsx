import { useState, useEffect } from "react";
import { C } from "../../tokens";
import { supabase } from "../../lib/supabase";
import { Search, Users, Ticket, ShoppingCart, RotateCcw, TrendingUp, Mail, Clock, ChevronRight, X } from "lucide-react";
import AvatarMenu from "./AvatarMenu";

function relativeTime(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CustomersView({ isLandscape, isMobile }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }
      const userId = session.user.id;

      const { data: store } = await supabase
        .from("stores").select("id").eq("user_id", userId).eq("is_active", true).maybeSingle();
      if (!store) { setLoading(false); return; }
      const storeId = store.id;

      const [{ data: tickets }, { data: carts }, { data: returns }] = await Promise.all([
        supabase.from("tickets").select("*").eq("store_id", storeId),
        supabase.from("carts").select("*").eq("store_id", storeId),
        supabase.from("returns").select("*").eq("store_id", storeId),
      ]);

      const map = {};
      const addTo = (records, type) => {
        (records || []).forEach(r => {
          const email = r.customer_email;
          if (!email) return;
          if (!map[email]) {
            map[email] = { email, name: r.customer_name || email, tickets: [], carts: [], returns: [] };
          }
          if (r.customer_name && map[email].name === email) map[email].name = r.customer_name;
          map[email][type].push(r);
        });
      };
      addTo(tickets, "tickets");
      addTo(carts, "carts");
      addTo(returns, "returns");

      const list = Object.values(map).map(c => {
        const totalCartValue = c.carts.reduce((s, r) => s + (parseFloat(r.cart_value) || 0), 0);
        const allDates = [...c.tickets, ...c.carts, ...c.returns].map(r => r.created_at).filter(Boolean);
        const lastContact = allDates.sort().at(-1) || null;
        const ticketCount = c.tickets.length;
        const cartCount = c.carts.length;
        const returnCount = c.returns.length;
        return {
          ...c,
          totalCartValue,
          lastContact,
          ticketCount,
          cartCount,
          returnCount,
          isVIP: totalCartValue > 500 || ticketCount === 0,
          isAtRisk: returnCount >= 2 || c.tickets.some(t => t.escalated === true),
        };
      });

      list.sort((a, b) => (b.lastContact || "").localeCompare(a.lastContact || ""));
      setCustomers(list);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchFilter =
      activeFilter === "all" ? true :
      activeFilter === "vip" ? c.isVIP :
      activeFilter === "at_risk" ? c.isAtRisk : true;
    return matchSearch && matchFilter;
  });

  const filters = [
    { key: "all", label: "All" },
    { key: "vip", label: "VIP" },
    { key: "at_risk", label: "At Risk" },
  ];

  const riskScore = (c) => {
    if (c.isAtRisk) return { label: "High", color: C.red };
    if (c.returnCount >= 1) return { label: "Medium", color: C.amber };
    return { label: "Low", color: C.teal };
  };

  const allEvents = (c) => {
    const evts = [
      ...c.tickets.map(t => ({ ...t, _type: "ticket" })),
      ...c.carts.map(t => ({ ...t, _type: "cart" })),
      ...c.returns.map(t => ({ ...t, _type: "return" })),
    ];
    return evts.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  };

  return (
    <div className="cv-root" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "'Outfit',sans-serif" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:767px){
          .cv-root{overflow-x:hidden!important;height:auto!important;flex:none!important;}
        }
      `}</style>

      {/* Top bar — desktop only */}
      {!isMobile && (
        <div className="cv-topbar" style={{ padding: "0 24px", height: 60, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <div>
            <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 700, color: C.text }}>Customers</h1>
            <p style={{ fontSize: 11.5, color: C.muted }}>{customers.length} unique customer{customers.length !== 1 ? "s" : ""} across all automations</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 8, background: "rgba(229,82,102,.09)", border: "1px solid rgba(229,82,102,.22)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.coral, animation: "blink 2.4s ease infinite" }} />
              <span style={{ fontSize: 11.5, color: C.coral, fontWeight: 700, letterSpacing: ".04em" }}>SOLVA LIVE</span>
            </div>
            <AvatarMenu />
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Left column */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", overflowY: "auto", padding: "20px 24px", gap: 14, background: C.bg }}>

          {/* Mobile title */}
          {isMobile && (
            <div>
              <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 18, fontWeight: 700, color: C.text }}>Customers</h1>
              <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{customers.length} unique customer{customers.length !== 1 ? "s" : ""} across all automations</p>
            </div>
          )}

          {/* Search */}
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.muted, display: "flex", alignItems: "center", pointerEvents: "none" }}>
              <Search size={16} strokeWidth={2} />
            </span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customers by name or email..."
              style={{ width: "100%", borderRadius: 10, border: `1px solid ${C.border}`, background: C.card, padding: "11px 16px 11px 42px", color: C.text, fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8 }}>
            {filters.map(f => (
              <button key={f.key} onClick={() => setActiveFilter(f.key)}
                style={{ padding: "5px 14px", borderRadius: 7, fontSize: 12, fontWeight: activeFilter === f.key ? 700 : 400, cursor: "pointer", border: `1px solid ${activeFilter === f.key ? C.coral : C.border}`, background: activeFilter === f.key ? "rgba(229,82,102,.10)" : "transparent", color: activeFilter === f.key ? C.coral : C.muted, fontFamily: "'Outfit',sans-serif", outline: "none" }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, paddingTop: 60 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${C.dim}`, borderTopColor: C.coral, animation: "spin .7s linear infinite" }} />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, paddingTop: 60, gap: 10 }}>
              <Users size={32} style={{ color: C.muted }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: C.muted }}>No customers yet</div>
              <div style={{ fontSize: 12, color: C.muted, textAlign: "center", maxWidth: 280 }}>Customer data will appear here once your automations start running</div>
            </div>
          ) : filtered.map((c, i) => (
            <div key={c.email} onClick={() => setSelectedCustomer(c)}
              onMouseEnter={() => setHoveredRow(i)} onMouseLeave={() => setHoveredRow(null)}
              style={{ padding: "14px 16px", borderRadius: 12, background: C.card, border: `1px solid ${selectedCustomer?.email === c.email ? C.coral : C.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, marginBottom: 8, transition: "border-color .15s" }}>

              {/* Avatar */}
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                {c.name.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: hoveredRow === i ? C.coral : C.text, transition: "color .15s" }}>{c.name}</span>
                  {c.isVIP && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: "rgba(240,160,75,.12)", color: C.amber }}>⭐ VIP</span>}
                  {c.isAtRisk && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: "rgba(255,82,114,.12)", color: C.red }}>⚠ At Risk</span>}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11.5, color: C.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.email}</span>
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0 }}>{relativeTime(c.lastContact)}</span>
                </div>
              </div>

              {/* Mini stats */}
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {[
                  { icon: <Ticket size={12} strokeWidth={2} />, count: c.ticketCount, color: C.teal },
                  { icon: <ShoppingCart size={12} strokeWidth={2} />, count: c.cartCount, color: C.blue },
                  { icon: <RotateCcw size={12} strokeWidth={2} />, count: c.returnCount, color: C.amber },
                ].map((s, j) => (
                  <div key={j} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "2px 8px", borderRadius: 6, background: s.color + "12", color: s.color }}>
                    {s.icon}{s.count}
                  </div>
                ))}
              </div>

              <ChevronRight size={14} style={{ color: C.muted, flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* Right detail panel */}
        {selectedCustomer && (
          <div style={{ width: 420, flexShrink: 0, borderLeft: `1px solid ${C.border}`, background: C.surface, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Panel header */}
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                <div onClick={() => setSelectedCustomer(null)} style={{ cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", transition: "color .15s" }}>
                  <X size={18} strokeWidth={2} />
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 3 }}>{selectedCustomer.name}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 6, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedCustomer.email}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {selectedCustomer.isVIP && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: "rgba(240,160,75,.12)", color: C.amber }}>⭐ VIP</span>}
                    {selectedCustomer.isAtRisk && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 100, background: "rgba(255,82,114,.12)", color: C.red }}>⚠ At Risk</span>}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: C.muted }}>Last contact: {relativeTime(selectedCustomer.lastContact)}</div>
            </div>

            {/* Panel KPI grid */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {[
                  { icon: <Ticket size={16} strokeWidth={2} />, value: selectedCustomer.ticketCount, label: "Tickets", color: C.teal },
                  { icon: <ShoppingCart size={16} strokeWidth={2} />, value: `$${selectedCustomer.totalCartValue.toFixed(2)}`, label: "Cart Value", color: C.coral },
                  { icon: <RotateCcw size={16} strokeWidth={2} />, value: selectedCustomer.returnCount, label: "Returns", color: C.amber },
                  (() => { const r = riskScore(selectedCustomer); return { icon: <TrendingUp size={16} strokeWidth={2} />, value: r.label, label: "Risk", color: r.color }; })(),
                ].map((k, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: C.card, border: `1px solid ${C.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, color: k.color }}>{k.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: k.color, fontFamily: "'Outfit',sans-serif" }}>{k.value}</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{k.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div style={{ padding: "14px 20px 6px", flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: C.muted, letterSpacing: ".06em", textTransform: "uppercase" }}>Full History</div>
            </div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {allEvents(selectedCustomer).length === 0 ? (
                <div style={{ padding: "20px", fontSize: 12.5, color: C.muted, textAlign: "center" }}>No events yet</div>
              ) : allEvents(selectedCustomer).map((evt, i) => {
                const isTicket = evt._type === "ticket";
                const isCart = evt._type === "cart";
                const color = isTicket ? C.teal : isCart ? C.blue : C.amber;
                const icon = isTicket ? <Ticket size={14} strokeWidth={2} /> : isCart ? <ShoppingCart size={14} strokeWidth={2} /> : <RotateCcw size={14} strokeWidth={2} />;
                const typeLabel = isTicket ? "Support Ticket" : isCart ? "Abandoned Cart" : "Return Request";
                const detail = isTicket ? evt.subject : isCart ? `$${parseFloat(evt.cart_value || 0).toFixed(2)} cart` : evt.reason;
                const status = evt.status;
                return (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 20px", borderBottom: `1px solid ${C.dim}` }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, paddingTop: 3, flexShrink: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                      <span style={{ color }}>{icon}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{typeLabel}</span>
                        {status && (
                          <span style={{ fontSize: 10, padding: "1px 6px", borderRadius: 4, background: color + "14", color, fontWeight: 600 }}>{status}</span>
                        )}
                      </div>
                      {detail && <div style={{ fontSize: 12, color: C.muted, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{detail}</div>}
                      <div style={{ fontSize: 11, color: C.muted }}>{formatDate(evt.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
