import { useState } from "react";
import { C } from "../../tokens";

const TICKETS = [
  {
    id:"TK-1041", name:"Sarah Mitchell", email:"sarah.m@gmail.com",
    avatar:"SM", avatarColor:"#E55266",
    subject:"Where is my order? It's been 6 days",
    preview:"Hi, I placed an order last Tuesday and haven't received any tracking...",
    status:"resolved", type:"Order Status", time:"2m ago", unread:false,
    messages:[
      { from:"customer", text:"Hi, I placed order #4872 last Tuesday and haven't received any tracking info yet. Can you help?", time:"10:42 AM" },
      { from:"ai",       text:"Hi Sarah! Order #4872 shipped yesterday via UPS — tracking number 1Z999AA10123456784. Estimated delivery is tomorrow between 2–6 PM. You'll get an email when it's out for delivery!", time:"10:42 AM" },
      { from:"customer", text:"Oh great, thank you! That's really helpful.", time:"10:44 AM" },
    ],
  },
  {
    id:"TK-1040", name:"James Okonkwo", email:"james.ok@yahoo.com",
    avatar:"JO", avatarColor:"#5BADFF",
    subject:"Wrong item received in my package",
    preview:"I ordered the black leather wallet but received the brown one...",
    status:"escalated", type:"Wrong Item", time:"18m ago", unread:true,
    messages:[
      { from:"customer",   text:"I ordered the black leather wallet (SKU: WLT-BLK-L) but I received the brown version. This was supposed to be a gift.", time:"10:24 AM" },
      { from:"ai",         text:"Hi James, I'm so sorry about this! I've flagged your order for priority correction. A prepaid return label has been sent and a replacement black wallet ships within 24 hours. I've also added a 15% discount for the inconvenience.", time:"10:24 AM" },
      { from:"customer",   text:"I haven't received the return label email yet.", time:"10:31 AM" },
      { from:"escalation", text:"AI escalated to human support — customer did not receive return label after 2 attempts.", time:"10:38 AM" },
    ],
  },
  {
    id:"TK-1039", name:"Priya Sharma", email:"priya.s@outlook.com",
    avatar:"PS", avatarColor:"#3ECFB2",
    subject:"Can I change my shipping address?",
    preview:"I just placed an order 10 mins ago, is it too late...",
    status:"resolved", type:"Order Edit", time:"35m ago", unread:false,
    messages:[
      { from:"customer", text:"I placed order #4869 about 10 minutes ago. I put in the wrong shipping address — can this be changed?", time:"9:58 AM" },
      { from:"ai",       text:"Hi Priya! Great news — your order hasn't been processed for fulfilment yet. I can update the address now. Could you confirm the correct one?", time:"9:58 AM" },
      { from:"customer", text:"It should be 42 Maple Drive, Austin TX 78701", time:"10:01 AM" },
      { from:"ai",       text:"Done! Shipping address updated to 42 Maple Drive, Austin TX 78701. Confirmation email on its way!", time:"10:01 AM" },
    ],
  },
  {
    id:"TK-1038", name:"David Chen", email:"d.chen@proton.me",
    avatar:"DC", avatarColor:"#F0A04B",
    subject:"Product quality issue — stitching coming apart",
    preview:"I've only had the bag for 3 weeks and the stitching...",
    status:"pending", type:"Quality Issue", time:"1h ago", unread:true,
    messages:[
      { from:"customer", text:"I've only had the bag for 3 weeks and the stitching on the handle is already coming apart. Unacceptable for this price.", time:"9:14 AM" },
      { from:"ai",       text:"Hi David, I'm truly sorry — a quality issue after 3 weeks is completely unacceptable and falls within our guarantee. Could you share a quick photo so I can document this and arrange a replacement immediately?", time:"9:14 AM" },
    ],
  },
];

const STATUS_T = {
  resolved:  { label:"Resolved",  color:"#3ECFB2", bg:"rgba(62,207,178,.10)"  },
  escalated: { label:"Escalated", color:"#FF5272", bg:"rgba(255,82,114,.10)"  },
  pending:   { label:"Pending",   color:"#F0A04B", bg:"rgba(240,160,75,.10)"  },
};

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
      @keyframes slideRight{from{opacity:0;transform:translateX(18px);}to{opacity:1;transform:translateX(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes blink{0%,100%{opacity:1;}50%{opacity:.15;}}
      @keyframes typingDot{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}
      .fu{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
      .sr{animation:slideRight .5s cubic-bezier(.16,1,.3,1) both;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-primary:disabled{opacity:.45;cursor:not-allowed;pointer-events:none;}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .btn-ghost:disabled{opacity:.4;cursor:not-allowed;pointer-events:none;}
      .ticket-row{cursor:pointer;transition:background .14s,border-color .14s;border-left:3px solid transparent;}
      .ticket-row:hover{background:rgba(229,82,102,.05)!important;}
      .blink{animation:blink 2.4s ease infinite;}
      .typing-dot{width:6px;height:6px;border-radius:50%;background:#B07898;display:inline-block;animation:typingDot 1.2s ease-in-out infinite;}
      .msg-bubble{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both;}
      .filter-tab{cursor:pointer;transition:all .15s ease;font-family:'Outfit',sans-serif;white-space:nowrap;}
      .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:600;white-space:nowrap;}
      input,textarea{font-family:'Outfit',sans-serif;outline:none;resize:none;}

      /* ── Mobile layout ── */
      .tv-back-btn{display:none;}
      .tv-suggestions-toggle{display:none;}
      @media(max-width:767px){
        .tv-workspace{flex-direction:column!important;}
        .tv-list{width:100%!important;flex:1!important;border-right:none!important;}
        .tv-list-hidden{display:none!important;}
        .tv-chat{width:100%!important;flex:1!important;}
        .tv-chat-hidden{display:none!important;}
        .tv-chat-header-meta{display:none!important;}
        .tv-back-btn{display:flex!important;align-items:center;}
        .tv-chat-header{padding:11px 14px!important;}
        .tv-ai-bar{padding:9px 14px!important;}
        .tv-messages{padding-bottom:195px!important;padding-left:12px!important;padding-right:12px!important;}
        .tv-reply-box{position:fixed!important;bottom:0!important;left:0!important;right:0!important;z-index:50!important;padding:10px 14px 14px!important;}
        .tv-suggestions-toggle{display:flex!important;align-items:center;justify-content:space-between;width:100%;}
        .tv-suggestions-chips-hidden{display:none!important;}
        .tv-suggestions-chips{margin-top:7px!important;}
        .msg-bubble-inner{max-width:86%!important;}
      }
    `}</style>
  );
}

function Bubble({ msg, idx }) {
  const isCustomer   = msg.from === "customer";
  const isEscalation = msg.from === "escalation";
  const isAgent      = msg.from === "agent";

  if (isEscalation) return (
    <div className="msg-bubble" style={{animationDelay:`${idx*.07}s`,display:"flex",justifyContent:"center",margin:"8px 0"}}>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:100,background:"rgba(255,82,114,.10)",border:"1px solid rgba(255,82,114,.20)",flexWrap:"wrap"}}>
        <span style={{fontSize:12}}>⚠</span>
        <span style={{fontSize:11.5,color:"#FF5272",fontWeight:600}}>{msg.text}</span>
        <span style={{fontSize:11,color:C.muted}}>· {msg.time}</span>
      </div>
    </div>
  );

  return (
    <div className="msg-bubble" style={{animationDelay:`${idx*.07}s`,display:"flex",justifyContent:isCustomer?"flex-start":"flex-end",margin:"6px 0"}}>
      <div className="msg-bubble-inner" style={{maxWidth:"72%",display:"flex",flexDirection:"column",alignItems:isCustomer?"flex-start":"flex-end",gap:5}}>
        <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:2}}>
          {!isCustomer && (
            <span className="tag" style={{
              color:      isAgent ? C.sub   : C.coral,
              background: isAgent ? "rgba(255,255,255,.06)" : "rgba(229,82,102,.10)",
              fontSize:   10,
            }}>
              {isAgent ? "👤 AGENT" : "⚡ SOLVA AI"}
            </span>
          )}
          <span style={{fontSize:10.5,color:C.muted}}>{msg.time}</span>
          {isCustomer && <span style={{fontSize:10.5,color:C.sub,fontWeight:500}}>Customer</span>}
        </div>
        <div style={{
          padding:"11px 15px",
          borderRadius:14,
          borderBottomLeftRadius:isCustomer?4:14,
          borderBottomRightRadius:isCustomer?14:4,
          background: isCustomer ? C.card : isAgent ? "rgba(78,2,105,.22)" : "rgba(229,82,102,.10)",
          border:`1px solid ${isCustomer ? C.border : isAgent ? "rgba(78,2,105,.38)" : "rgba(229,82,102,.20)"}`,
          fontSize:13.5,color:C.text,lineHeight:1.65,wordBreak:"break-word",
        }}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default function TicketsView() {
  const [filter,          setFilter]          = useState("All");
  const [search,          setSearch]          = useState("");
  const [selectedId,      setSelectedId]      = useState("TK-1041");
  const [reply,           setReply]           = useState("");
  const [statusOverrides, setStatusOverrides] = useState({});
  const [ticketEscalated, setTicketEscalated] = useState({});
  const [ticketClosed,    setTicketClosed]    = useState({});
  const [toast,           setToast]           = useState(null);
  const [extraMessages,   setExtraMessages]   = useState({});
  const [showAttachHint,   setShowAttachHint]  = useState(false);
  const [mobilePanel,      setMobilePanel]     = useState("list");
  const [suggestionsOpen,  setSuggestionsOpen] = useState(false);

  const getStatus = (id, def) => statusOverrides[id] || def;

  const filtered = TICKETS.filter(t => {
    const mf = filter === "All" || getStatus(t.id, t.status) === filter.toLowerCase();
    const ms = t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const selected        = TICKETS.find(t => t.id === selectedId);
  const effectiveStatus = selected ? getStatus(selectedId, selected.status) : null;
  const effectiveMsgs   = selected ? [...selected.messages, ...(extraMessages[selectedId] || [])] : [];

  const counts = {
    All:       TICKETS.length,
    Pending:   TICKETS.filter(t => getStatus(t.id, t.status) === "pending").length,
    Resolved:  TICKETS.filter(t => getStatus(t.id, t.status) === "resolved").length,
    Escalated: TICKETS.filter(t => getStatus(t.id, t.status) === "escalated").length,
  };

  function fireToast(message, color, bg) {
    setToast({ message, color, bg });
    setTimeout(() => setToast(null), 3000);
  }

  function handleEscalate() {
    setStatusOverrides(prev => ({ ...prev, [selectedId]: "escalated" }));
    setTicketEscalated(prev => ({ ...prev, [selectedId]: true }));
    fireToast("Ticket escalated to human agent", "#F0A04B", "rgba(240,160,75,.12)");
  }

  function handleClose() {
    setStatusOverrides(prev => ({ ...prev, [selectedId]: "resolved" }));
    setTicketClosed(prev => ({ ...prev, [selectedId]: true }));
    fireToast("Ticket closed successfully", "#3ECFB2", "rgba(62,207,178,.12)");
  }

  function handleSend() {
    if (!reply.trim()) return;
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setExtraMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), { from: "agent", text: reply.trim(), time }],
    }));
    setReply("");
  }

  function handleAttachment() {
    setShowAttachHint(true);
    setTimeout(() => setShowAttachHint(false), 2000);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleTicketSelect(id) {
    setSelectedId(id);
    setMobilePanel("chat");
  }

  const escalateDisabled = !!(ticketEscalated[selectedId] || ticketClosed[selectedId]);
  const closeDisabled    = !!ticketClosed[selectedId];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>AI Tickets</h1>
          <p style={{fontSize:11.5,color:C.muted}}>1,247 resolved this week · {counts.Pending + counts.Escalated} open</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:8,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.22)"}}>
            <div className="blink" style={{width:6,height:6,borderRadius:"50%",background:C.coral}}/>
            <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".04em"}}>SOLVA LIVE</span>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",cursor:"pointer",background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>E</div>
        </div>
      </div>

      {/* Workspace */}
      <div className="tv-workspace" style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ── Ticket list panel ── */}
        <div
          className={`tv-list${mobilePanel === "chat" ? " tv-list-hidden" : ""}`}
          style={{width:320,flexShrink:0,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.surface}}
        >
          {/* Search */}
          <div style={{padding:"12px 14px 8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
              <span style={{color:C.muted,fontSize:14}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets…" style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:13.5}}/>
            </div>
          </div>

          {/* Filters */}
          <div style={{display:"flex",gap:4,padding:"0 14px 10px",flexWrap:"wrap"}}>
            {["All","Pending","Resolved","Escalated"].map(f=>(
              <button key={f} className="filter-tab" onClick={()=>setFilter(f)}
                style={{padding:"4px 10px",borderRadius:100,border:`1px solid ${filter===f?C.coral:C.border}`,background:filter===f?"rgba(229,82,102,.10)":"transparent",color:filter===f?C.coral:C.muted,fontSize:11.5,fontWeight:filter===f?700:400}}>
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          {/* Stats strip */}
          <div style={{display:"flex",margin:"0 14px 12px",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {[{label:"Auto-resolved",value:"87%",color:C.teal},{label:"Avg response",value:"<1m",color:C.blue},{label:"Escalated",value:"3%",color:"#FF5272"}].map((s,i)=>(
              <div key={i} style={{flex:1,padding:"9px 6px",textAlign:"center",background:C.card,borderRight:i<2?`1px solid ${C.border}`:"none"}}>
                <div style={{fontSize:13.5,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:9.5,color:C.muted,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* List */}
          <div style={{flex:1,overflowY:"auto"}}>
            {filtered.map(t => {
              const st = STATUS_T[getStatus(t.id, t.status)];
              return (
                <div key={t.id} className="ticket-row" onClick={()=>handleTicketSelect(t.id)}
                  style={{padding:"13px 16px",background:selectedId===t.id?"rgba(229,82,102,.07)":"transparent",borderLeft:`3px solid ${selectedId===t.id?C.coral:"transparent"}`,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:34,height:34,borderRadius:10,flexShrink:0,background:`${t.avatarColor}22`,border:`1px solid ${t.avatarColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11.5,fontWeight:700,color:t.avatarColor}}>{t.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:13,fontWeight:t.unread?700:500,color:t.unread?C.text:C.sub,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:140}}>{t.name}</span>
                        <span style={{fontSize:11,color:C.muted,flexShrink:0}}>{t.time}</span>
                      </div>
                      <div style={{fontSize:12.5,fontWeight:t.unread?600:400,color:t.unread?C.text:C.sub,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:5}}>{t.subject}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11.5,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:150}}>{t.preview}</span>
                        <span className="tag" style={{color:st.color,background:st.bg,marginLeft:6}}>{st.label}</span>
                      </div>
                    </div>
                    {t.unread && <div style={{width:7,height:7,borderRadius:"50%",background:C.coral,flexShrink:0,marginTop:4}}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Detail / Chat panel ── */}
        {selected && (
          <div
            className={`sr tv-chat${mobilePanel === "list" ? " tv-chat-hidden" : ""}`}
            style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}
          >
            {/* Panel header */}
            <div className="tv-chat-header" style={{padding:"15px 24px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>

              {/* Customer meta — hidden on mobile via CSS */}
              <div className="tv-chat-header-meta" style={{display:"flex",alignItems:"center",gap:13}}>
                <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:`${selected.avatarColor}22`,border:`1px solid ${selected.avatarColor}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13.5,fontWeight:700,color:selected.avatarColor}}>{selected.avatar}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3}}>
                    <span style={{fontSize:15,fontWeight:700,color:C.text}}>{selected.name}</span>
                    <span className="tag" style={{color:STATUS_T[effectiveStatus].color,background:STATUS_T[effectiveStatus].bg}}>{STATUS_T[effectiveStatus].label}</span>
                  </div>
                  <div style={{fontSize:12,color:C.muted}}>{selected.email} · {selected.id} · {selected.type}</div>
                </div>
              </div>

              {/* Back button — visible on mobile only via CSS */}
              <button
                className="tv-back-btn btn-ghost"
                onClick={() => setMobilePanel("list")}
                style={{gap:5,color:C.coral,fontSize:13,fontWeight:600,padding:"8px 16px",background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:8}}
              >
                ← Back to Tickets
              </button>

              {/* Action buttons */}
              <div style={{display:"flex",gap:8}}>
                <button
                  className="btn-ghost"
                  onClick={handleEscalate}
                  disabled={escalateDisabled}
                  style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(255,82,114,.25)",color:"#FF5272",fontSize:13}}
                >⚠ Escalate</button>
                <button
                  className="btn-primary"
                  onClick={handleClose}
                  disabled={closeDisabled}
                  style={{padding:"7px 16px",borderRadius:8,color:"#fff",fontWeight:600,fontSize:13}}
                >✓ Close Ticket</button>
              </div>
            </div>

            {/* Toast */}
            {toast && (
              <div style={{padding:"9px 24px",flexShrink:0,background:toast.bg,borderBottom:`1px solid ${toast.color}44`,display:"flex",alignItems:"center",gap:8,animation:"fadeUp .3s cubic-bezier(.16,1,.3,1) both"}}>
                <span style={{fontSize:13,color:toast.color,fontWeight:600}}>✓ {toast.message}</span>
              </div>
            )}

            {/* AI summary bar */}
            <div className="tv-ai-bar" style={{padding:"11px 24px",flexShrink:0,background:"rgba(229,82,102,.05)",borderBottom:"1px solid rgba(229,82,102,.14)",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:"rgba(229,82,102,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>⚡</div>
              <span style={{fontSize:12,fontWeight:700,color:C.coral,flexShrink:0}}>SOLVA AI · </span>
              <span style={{fontSize:12.5,color:C.sub}}>
                {effectiveStatus==="resolved"  ? "This ticket was fully resolved by Solva AI without human intervention."
                :effectiveStatus==="escalated" ? "AI attempted resolution twice. Escalated — requires manual follow-up."
                : "AI has responded and is awaiting customer reply."}
              </span>
            </div>

            {/* Messages */}
            <div className="tv-messages" style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",background:C.bg}}>
              {effectiveMsgs.map((m,i) => <Bubble key={i} msg={m} idx={i}/>)}
              {effectiveStatus === "pending" && (
                <div style={{display:"flex",justifyContent:"flex-end",margin:"8px 0"}}>
                  <div style={{padding:"11px 16px",borderRadius:14,borderBottomRightRadius:4,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.18)",display:"flex",gap:5,alignItems:"center"}}>
                    {[0,1,2].map(i=><div key={i} className="typing-dot" style={{animationDelay:`${i*.18}s`}}/>)}
                    <span style={{fontSize:11.5,color:C.muted,marginLeft:6}}>Solva AI is composing a reply…</span>
                  </div>
                </div>
              )}
            </div>

            {/* Reply box */}
            <div className="tv-reply-box" style={{padding:"14px 24px",flexShrink:0,borderTop:`1px solid ${C.border}`,background:C.surface}}>
              <div style={{marginBottom:10}}>
                {/* Toggle chip — visible on mobile only via .tv-suggestions-toggle */}
                <button
                  className="tv-suggestions-toggle btn-ghost"
                  onClick={()=>setSuggestionsOpen(o=>!o)}
                  style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,fontWeight:600}}
                >
                  <span>AI Suggestions</span>
                  <span style={{marginLeft:6}}>{suggestionsOpen?"▲":"▼"}</span>
                </button>
                {/* Chips — always shown on desktop, toggled on mobile */}
                <div
                  className={`tv-suggestions-chips${!suggestionsOpen?" tv-suggestions-chips-hidden":""}`}
                  style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}
                >
                  <span style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase",display:"flex",alignItems:"center",flexShrink:0}}>AI Suggestions:</span>
                  {["I've checked your order and…","A replacement has been arranged…","Your refund is being processed…"].map((s,i)=>(
                    <button key={i} onClick={()=>setReply(s)} className="btn-ghost" style={{padding:"4px 12px",borderRadius:100,border:`1px solid ${C.border}`,color:C.sub,fontSize:12}}>{s}</button>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"flex-end",padding:"12px 16px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`}}>
                <textarea
                  value={reply}
                  onChange={e=>setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a reply or override Solva's AI response…"
                  rows={2}
                  style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:14,lineHeight:1.6}}
                />
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <button className="btn-ghost" onClick={handleAttachment} style={{padding:"8px 10px",borderRadius:8,border:`1px solid ${C.border}`,color:C.sub,fontSize:13}}>📎</button>
                  <button className="btn-primary" onClick={handleSend} style={{padding:"8px 18px",borderRadius:8,color:"#fff",fontWeight:600,fontSize:13}}>Send →</button>
                </div>
              </div>
              {showAttachHint && (
                <p style={{fontSize:11.5,color:C.muted,marginTop:6,paddingLeft:2,animation:"fadeUp .3s cubic-bezier(.16,1,.3,1) both"}}>📎 File attachment coming soon</p>
              )}
              <p style={{fontSize:11.5,color:C.muted,marginTop:8}}>⚡ Solva AI will respond automatically unless you send manually.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
