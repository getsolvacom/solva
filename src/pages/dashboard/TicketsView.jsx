import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../../tokens";
import {
  Send, Paperclip, XCircle, ShieldAlert, CheckCircle2, AlertCircle,
  ArrowUpRight, AlertTriangle, User, Search, Zap,
  Smile, Bold, Italic, ChevronUp, Clock, Calendar, Bookmark, RefreshCw,
} from "lucide-react";
import AvatarMenu from "./AvatarMenu";
import { useStore } from "../../hooks/useStore";
import { supabase } from "../../lib/supabase";
import { DemoContext } from "../../context/DemoContext";

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
  resolved:  { label:"Resolved",  color:"#3ECFB2", bg:"rgba(62,207,178,.10)",  icon:<CheckCircle2 size={12} strokeWidth={2}/> },
  escalated: { label:"Escalated", color:"#FF5272", bg:"rgba(255,82,114,.10)",  icon:<ArrowUpRight size={12} strokeWidth={2}/> },
  pending:   { label:"Pending",   color:"#F0A04B", bg:"rgba(240,160,75,.10)",  icon:<AlertCircle size={12} strokeWidth={2}/> },
};

const EMOJIS = ["😊","👍","🙏","❤️","🎉","✅","👋","💪","🚀","⭐","😄","🤝","📦","💯","⚡","🔥"];
const SCHEDULE_OPTS = [
  "Tomorrow morning (8:00 AM)",
  "Tomorrow afternoon (1:00 PM)",
  "Monday morning (8:00 AM)",
];

function parseMarkdown(text) {
  const regex = /(\*\*(.+?)\*\*|_(.+?)_)/g;
  const parts = [];
  let lastIndex = 0, match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ t:"text", v:text.slice(lastIndex, match.index) });
    if (match[0].startsWith("**")) parts.push({ t:"bold",   v:match[2] });
    else                            parts.push({ t:"italic", v:match[3] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) parts.push({ t:"text", v:text.slice(lastIndex) });
  return parts;
}

function renderMd(text) {
  const parts = parseMarkdown(text);
  if (parts.length === 1 && parts[0].t === "text") return text;
  return parts.map((p, i) =>
    p.t === "bold"   ? <strong key={i} style={{fontWeight:700}}>{p.v}</strong> :
    p.t === "italic" ? <em key={i}>{p.v}</em> :
    <span key={i}>{p.v}</span>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
      @keyframes slideRight{from{opacity:0;transform:translateX(18px);}to{opacity:1;transform:translateX(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes blink{0%,100%{opacity:1;}50%{opacity:.15;}}
      @keyframes typingDot{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}
      @keyframes spin{to{transform:rotate(360deg)}}
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
      .fmt-btn{cursor:pointer;border:none;outline:none;transition:all .12s;font-family:'Outfit',sans-serif;background:transparent;min-width:44px;min-height:44px;padding:10px;border-radius:8px;display:flex;align-items:center;justify-content:center;}
      .fmt-btn:hover{background:rgba(229,82,102,.09);}
      .emoji-btn{cursor:pointer;border:none;background:none;font-size:20px;padding:6px;border-radius:6px;line-height:1;transition:background .1s;display:flex;align-items:center;justify-content:center;}
      .emoji-btn:hover{background:rgba(229,82,102,.13);}
      .sched-opt{display:flex;align-items:center;gap:8px;padding:11px 14px;width:100%;background:transparent;border:none;color:var(--sub);font-size:13px;font-family:'Outfit',sans-serif;cursor:pointer;white-space:nowrap;text-align:left;transition:background .12s;min-height:44px;}
      .sched-opt:hover{background:rgba(229,82,102,.09);color:#E55266;}
      .fmt-btn-sm{cursor:pointer;border:none;outline:none;transition:all .12s;font-family:'Outfit',sans-serif;background:transparent;width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;}
      .fmt-btn-sm:hover{background:rgba(229,82,102,.09);}

      /* ── AI Suggestions strip ── */
      .tv-suggestions{flex-shrink:0;border-top:1px solid var(--border);background:var(--surface);padding:10px 24px;}
      .tv-suggestions-toggle{display:none;}

      /* ── Mobile layout ── */
      .tv-back-btn{display:none;}
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
        .tv-messages{padding-left:12px!important;padding-right:12px!important;padding-bottom:100px!important;}
        .tv-suggestions{padding:8px 14px!important;}
        .tv-suggestions-toggle{display:flex!important;align-items:center;justify-content:space-between;width:100%;}
        .tv-suggestions-chips-hidden{display:none!important;}
        .tv-suggestions-chips{margin-top:7px!important;}
        .tv-draft-box{max-height:52vh!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;padding:12px 14px calc(140px + env(safe-area-inset-bottom))!important;}
        .tv-reply-box{padding:8px 12px!important;padding-bottom:calc(8px + env(safe-area-inset-bottom))!important;position:fixed!important;bottom:0!important;left:0!important;right:0!important;z-index:500!important;background:var(--surface)!important;border-top:1px solid var(--border-hi)!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}
        .msg-bubble-inner{max-width:86%!important;}
      }
      .ls-mob .tv-workspace{flex-direction:row!important;overflow:hidden!important;flex:1!important;min-height:0!important;}
      .ls-mob .tv-list{width:40%!important;flex:none!important;border-right:1px solid var(--border)!important;overflow-y:auto!important;height:100%!important;}
      .ls-mob .tv-list-hidden{display:flex!important;flex-direction:column!important;}
      .ls-mob .tv-chat{width:60%!important;flex:none!important;display:flex!important;flex-direction:column!important;height:100%!important;overflow:hidden!important;}
      .ls-mob .tv-chat-hidden{display:flex!important;flex-direction:column!important;}
      .ls-mob .tv-chat-header-meta{display:flex!important;}
      .ls-mob .tv-back-btn{display:none!important;}
      .ls-mob .tv-messages{padding-bottom:16px!important;}
      .ls-mob .tv-suggestions{padding:6px 16px!important;}
      .ls-mob .tv-suggestions-toggle{display:none!important;}
      .ls-mob .tv-suggestions-chips-hidden{display:flex!important;flex-wrap:wrap!important;}
      .ls-mob .tv-reply-box{padding:8px 14px!important;position:relative!important;bottom:auto!important;left:auto!important;right:auto!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}
      .ls-mob .msg-bubble-inner{max-width:72%!important;}
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
        <AlertTriangle size={16} strokeWidth={2} style={{color:"#FF5272",flexShrink:0}}/>
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
              fontSize:10, display:"inline-flex", alignItems:"center", gap:3,
            }}>
              {isAgent ? <><User size={12} strokeWidth={2}/>AGENT</> : <><Zap size={12} strokeWidth={2}/>SOLVA AI</>}
            </span>
          )}
          <span style={{fontSize:10.5,color:C.muted}}>{msg.time}</span>
          {isCustomer && <span style={{fontSize:10.5,color:C.sub,fontWeight:500}}>Customer</span>}
        </div>
        <div style={{
          padding:"11px 15px", borderRadius:14,
          borderBottomLeftRadius:isCustomer?4:14,
          borderBottomRightRadius:isCustomer?14:4,
          background: isCustomer ? C.card : isAgent ? "rgba(78,2,105,.22)" : "rgba(229,82,102,.10)",
          border:`1px solid ${isCustomer ? C.border : isAgent ? "rgba(78,2,105,.38)" : "rgba(229,82,102,.20)"}`,
          fontSize:13.5, color:C.text, lineHeight:1.65, wordBreak:"break-word",
        }}>
          {renderMd(msg.text)}
        </div>
      </div>
    </div>
  );
}

export default function TicketsView({ isLandscape, isMobile }) {
  const navigate                              = useNavigate();
  const { ticketId }                          = useParams();
  const { isDemoMode }                        = useContext(DemoContext);
  const basePath                              = isDemoMode ? "/demo" : "/dashboard";
  const selectedId                            = ticketId || "TK-1041";
  const mobilePanel                           = ticketId ? "chat" : "list";
  const [filter,          setFilter]          = useState("All");
  const [search,          setSearch]          = useState("");
  const [topicFilter,     setTopicFilter]     = useState("All");
  const [sortOrder,       setSortOrder]       = useState("newest");
  const [reply,           setReply]           = useState("");
  const [statusOverrides, setStatusOverrides] = useState({});
  const [ticketEscalated, setTicketEscalated] = useState({});
  const [ticketClosed,    setTicketClosed]    = useState({});
  const [toast,           setToast]           = useState(null);
  const [extraMessages,   setExtraMessages]   = useState({});
  const [showAttachHint,  setShowAttachHint]  = useState(false);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [emojiOpen,       setEmojiOpen]       = useState(false);
  const [schedMenuOpen,   setSchedMenuOpen]   = useState(false);
  const [schedPickOpen,   setSchedPickOpen]   = useState(false);
  const [activeFormat,    setActiveFormat]    = useState(null);
  const [csatRatings,    setCsatRatings]    = useState({});
  const [csatHover,      setCsatHover]      = useState(null);
  const [bookmarked,     setBookmarked]     = useState({});

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarked(prev => ({ ...prev, [id]: !prev[id] }));
  };
  const [customPickOpen, setCustomPickOpen] = useState(false);
  const [pickDay,   setPickDay]   = useState(new Date().getDate());
  const [pickMonth, setPickMonth] = useState(new Date().getMonth() + 1);
  const [pickYear,  setPickYear]  = useState(new Date().getFullYear());
  const [pickHour,  setPickHour]  = useState(9);
  const [pickMin,   setPickMin]   = useState(0);
  const [pickAmpm,  setPickAmpm]  = useState("AM");

  const { store } = useStore();
  const [realTickets, setRealTickets] = useState(null);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [draftEdits, setDraftEdits] = useState({});
  const [sendingReply, setSendingReply] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendWarning, setSendWarning] = useState(null);
  const [sentTickets, setSentTickets] = useState({});

  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([
    "I've checked your order and…",
    "A replacement has been arranged…",
    "Your refund is being processed…",
  ]);

  const textareaRef   = useRef(null);
  const emojiRef      = useRef(null);
  const schedRef      = useRef(null);

  useEffect(() => {
    if (!emojiOpen) return;
    function h(e) { if (emojiRef.current && !emojiRef.current.contains(e.target)) setEmojiOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [emojiOpen]);

  useEffect(() => {
    if (!schedMenuOpen && !schedPickOpen && !customPickOpen) return;
    function h(e) {
      if (schedRef.current && !schedRef.current.contains(e.target)) {
        setSchedMenuOpen(false); setSchedPickOpen(false); setCustomPickOpen(false);
      }
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [schedMenuOpen, schedPickOpen, customPickOpen]);

  const fetchTickets = async () => {
    try {
      if (isDemoMode) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTicketsLoading(false); return; }
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      if (!storeData) { setTicketsLoading(false); return; }
      const { data: rows } = await supabase
        .from('tickets')
        .select('*')
        .eq('store_id', storeData.id)
        .order('created_at', { ascending: false });
      if (rows && rows.length > 0) {
        const mapped = rows.map(r => ({
          id: r.id,
          name: r.customer_name || 'Customer',
          avatar: (r.customer_name || 'C').slice(0, 2).toUpperCase(),
          avatarColor: '#5BADFF',
          subject: r.subject || 'Support request',
          preview: r.preview || (r.subject || '').slice(0, 60),
          time: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
          status: r.status || 'pending',
          unread: r.status === 'pending',
          messages: Array.isArray(r.messages) ? r.messages : [
            { from: 'customer', text: r.subject || 'Support request', time: '' },
          ],
          tags: r.tags || [],
          source: r.source,
          ai_draft_reply: r.ai_draft_reply,
          sent_at: r.sent_at,
          customer_email: r.customer_email,
        }));
        setRealTickets(mapped);
      } else {
        setRealTickets([]);
      }
    } catch (err) {
      console.error('TicketsView fetch error:', err);
      setRealTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshTickets = async () => {
    if (isDemoMode || refreshing) return;
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSendError(null);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSendWarning(null);
  }, [selectedId]);

  const getStatus = (id, def) => statusOverrides[id] || def;

  const TOPICS = ["All", "Order Status", "Wrong Item", "Shipping", "Return Request", "Discount/Promo", "Product Question"];

  const ticketSource = realTickets && realTickets.length > 0 ? realTickets : TICKETS;

  const filteredByStatus = ticketSource.filter(t => {
    const mf = filter === "All"
      || (filter === "Bookmarked" ? bookmarked[t.id] : getStatus(t.id, t.status) === filter.toLowerCase());
    const ms = t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase());
    return mf && ms;
  });

  const filteredByTopic = topicFilter === "All"
    ? filteredByStatus
    : filteredByStatus.filter(t => {
        const subject = (t.subject || "").toLowerCase();
        const topicMap = {
          "Order Status":     ["order", "where is", "tracking", "status", "shipped"],
          "Wrong Item":       ["wrong", "incorrect", "different", "not what"],
          "Shipping":         ["shipping", "delivery", "deliver", "transit", "courier"],
          "Return Request":   ["return", "refund", "send back", "exchange"],
          "Discount/Promo":   ["discount", "promo", "coupon", "code", "offer"],
          "Product Question": ["product", "size", "color", "material", "spec"],
        };
        const keywords = topicMap[topicFilter] || [];
        return keywords.some(kw => subject.includes(kw));
      });

  const filtered = [...filteredByTopic].sort((a, b) => {
    if (sortOrder === "escalated") {
      const aEsc = getStatus(a.id, a.status) === "escalated" ? 0 : 1;
      const bEsc = getStatus(b.id, b.status) === "escalated" ? 0 : 1;
      return aEsc - bEsc;
    }
    if (sortOrder === "pending") {
      const aPen = getStatus(a.id, a.status) === "pending" ? 0 : 1;
      const bPen = getStatus(b.id, b.status) === "pending" ? 0 : 1;
      return aPen - bPen;
    }
    if (sortOrder === "oldest") return (a.time || "").localeCompare(b.time || "");
    return (b.time || "").localeCompare(a.time || "");
  });

  const selected        = ticketSource.find(t => t.id === selectedId);
  const effectiveStatus = selected ? getStatus(selectedId, selected.status) : null;
  const effectiveMsgs   = selected ? [...(Array.isArray(selected.messages) ? selected.messages : []), ...(extraMessages[selectedId] || [])] : [];
  const draftText       = selected ? (draftEdits[selectedId] ?? selected.ai_draft_reply ?? '') : '';
  const showDraftPanel  = !!(selected && selected.source === 'email' && selected.ai_draft_reply && !selected.sent_at && !sentTickets[selectedId]);

  const counts = {
    All:        ticketSource.length,
    Pending:    ticketSource.filter(t => getStatus(t.id, t.status) === "pending").length,
    Resolved:   ticketSource.filter(t => getStatus(t.id, t.status) === "resolved").length,
    Escalated:  ticketSource.filter(t => getStatus(t.id, t.status) === "escalated").length,
    Bookmarked: ticketSource.filter(t => bookmarked[t.id]).length,
  };

  function fireToast(message, color, bg) {
    setToast({ message, color, bg });
    setTimeout(() => setToast(null), 4000);
  }

  function handleEscalate() {
    if (isDemoMode) return;
    setStatusOverrides(prev => ({ ...prev, [selectedId]: "escalated" }));
    setTicketEscalated(prev => ({ ...prev, [selectedId]: true }));
    fireToast("Ticket escalated to human agent", "#F0A04B", "rgba(240,160,75,.12)");
  }

  function handleClose() {
    if (isDemoMode) return;
    setStatusOverrides(prev => ({ ...prev, [selectedId]: "resolved" }));
    setTicketClosed(prev => ({ ...prev, [selectedId]: true }));
    fireToast("Ticket closed successfully", "#3ECFB2", "rgba(62,207,178,.12)");
  }

  async function handleSendDraft() {
    if (isDemoMode || !selected) return;
    const text = draftText.trim();
    if (!text) return;
    setSendingReply(true);
    setSendError(null);
    setSendWarning(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-ticket-reply', {
        body: { ticketId: selected.id, replyText: text },
      });
      if (error) {
        let msg = error.message || 'Failed to send reply';
        try {
          if (error.context && typeof error.context.json === 'function') {
            const body = await error.context.json();
            if (body?.error) msg = body.error;
          }
        } catch { /* keep default message */ }
        setSendError(msg);
        return;
      }
      if (data?.error) { setSendError(data.error); return; }
      if (data?.warning) {
        // Email sent, but the ticket status update failed to persist.
        // Do NOT show the optimistic success state — keep the draft editable
        // and surface the warning so the merchant can retry or refresh.
        setSendWarning(data.warning);
        return;
      }

      const nowIso = new Date().toISOString();
      const time   = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      setSentTickets(prev => ({ ...prev, [selectedId]: true }));
      setStatusOverrides(prev => ({ ...prev, [selectedId]: "resolved" }));
      setRealTickets(prev => prev ? prev.map(t => t.id === selectedId
        ? { ...t, status: "resolved", sent_at: nowIso }
        : t) : prev);
      setExtraMessages(prev => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] || []), { from: "agent", text, time }],
      }));
      fireToast("Reply sent to customer", C.teal, "rgba(62,207,178,.12)");
    } catch (err) {
      console.error('send-ticket-reply invoke error:', err);
      setSendError(err?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  }

  function handleSend() {
    if (isDemoMode || !reply.trim()) return;
    const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    setExtraMessages(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), { from: "agent", text: reply.trim(), time }],
    }));
    setReply("");
  }

  const generateAIReply = async (ticketText) => {
    if (isDemoMode) return;
    setAiLoading(true);
    try {
      const response = await fetch('/api/ai/ticket-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket: ticketText,
          storeName: store?.shop_name || 'our store',
          brandTone: 'friendly',
        }),
      });
      const data = await response.json();
      if (data.response) {
        const time = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
        setExtraMessages(prev => ({
          ...prev,
          [selectedId]: [...(prev[selectedId] || []), { from: "ai", text: data.response, time }],
        }));
        setStatusOverrides(prev => ({ ...prev, [selectedId]: "resolved" }));
        await generateAISuggestions(ticketText);
      }
    } catch (error) {
      console.error('AI reply error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const generateAISuggestions = async (ticketText) => {
    try {
      const response = await fetch('/api/ai/ticket-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket: `Generate 3 very short reply starters (under 8 words each) for this ticket. Return only the 3 starters separated by | with no numbering or explanation: ${ticketText}`,
          storeName: store?.shop_name || 'our store',
          brandTone: 'friendly',
        }),
      });
      const data = await response.json();
      if (data.response) {
        const suggestions = data.response.split('|').map(s => s.trim()).filter(Boolean).slice(0, 3);
        if (suggestions.length > 0) setAiSuggestions(suggestions);
      }
    } catch (error) {
      console.error('AI suggestions error:', error);
    }
  };

  function handleAttachment() {
    setShowAttachHint(true);
    setTimeout(() => setShowAttachHint(false), 2000);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleTicketSelect(id) {
    navigate(`${basePath}/tickets/` + id);
  }

  function handleEmojiInsert(emoji) {
    setReply(r => r + emoji);
    setEmojiOpen(false);
    textareaRef.current?.focus();
  }

  function handleFormat(type) {
    const ta = textareaRef.current;
    if (!ta) return;
    setActiveFormat(type);
    setTimeout(() => setActiveFormat(null), 300);
    const marker = type === "bold" ? "**" : "_";
    const start  = ta.selectionStart;
    const end    = ta.selectionEnd;
    const sel    = reply.slice(start, end);
    let newVal, newCursor;
    if (sel) {
      newVal    = reply.slice(0, start) + marker + sel + marker + reply.slice(end);
      newCursor = end + marker.length * 2;
    } else {
      newVal    = reply.slice(0, start) + marker + marker + reply.slice(end);
      newCursor = start + marker.length;
    }
    setReply(newVal);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(newCursor, newCursor); });
  }

  function handleScheduleSend(opt) {
    setSchedPickOpen(false);
    setReply("");
    fireToast("Message scheduled ✓", C.teal, "rgba(62,207,178,.12)");
  }

  function handleCustomDateConfirm() {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const timeStr = `${pickHour}:${String(pickMin).padStart(2,"0")} ${pickAmpm}`;
    const dateStr = `${months[pickMonth-1]} ${pickDay}, ${pickYear}`;
    setCustomPickOpen(false);
    setReply("");
    fireToast(`Message scheduled for ${dateStr} at ${timeStr} ✓`, C.teal, "rgba(62,207,178,.12)");
  }

  const escalateDisabled = !!(ticketEscalated[selectedId] || ticketClosed[selectedId]);
  const closeDisabled    = !!ticketClosed[selectedId];
  const csatVals = Object.values(csatRatings).filter(v => v > 0);
  const avgCsat  = csatVals.length > 0 ? (csatVals.reduce((a,b)=>a+b,0)/csatVals.length).toFixed(1) : "—";

  const popupBase = {
    position:"absolute", zIndex:500, right:0, bottom:"calc(100% + 8px)",
    background:C.card, border:`1px solid ${C.borderHi}`,
    borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,.55)",
  };

  const selectSt = {
    flex:1, background:C.surface, border:`1px solid ${C.border}`,
    borderRadius:8, color:C.text, padding:"7px 8px",
    fontSize:13, fontFamily:"'Outfit',sans-serif", cursor:"pointer",
  };

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
          <AvatarMenu />
        </div>
      </div>

      {/* Workspace */}
      <div className="tv-workspace" style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ── Ticket list panel ── */}
        <div
          className={`tv-list${mobilePanel === "chat" ? " tv-list-hidden" : ""}`}
          style={{width:320,flexShrink:0,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.surface}}
        >
          <div style={{padding:"12px 14px 8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{flex:1,display:"flex",alignItems:"center",gap:9,padding:"9px 13px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
                <Search size={16} strokeWidth={2} style={{color:C.muted,flexShrink:0}}/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tickets…" style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:13.5}}/>
              </div>
              <button onClick={isDemoMode ? undefined : refreshTickets} disabled={isDemoMode || refreshing}
                title={isDemoMode ? "Sign up to try this" : "Refresh tickets"}
                style={{width:38,height:38,flexShrink:0,borderRadius:10,background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:(isDemoMode||refreshing)?"not-allowed":"pointer",color:C.muted,opacity:isDemoMode?0.45:1}}>
                <RefreshCw size={15} strokeWidth={2} style={{animation:refreshing?"spin .7s linear infinite":"none"}}/>
              </button>
            </div>
          </div>

          <div style={{display:"flex",gap:4,padding:"0 14px 10px",flexWrap:"wrap"}}>
            {["All","Pending","Resolved","Escalated","Bookmarked"].map(f=>(
              <button key={f} className="filter-tab" onClick={()=>setFilter(f)}
                style={{padding:"4px 10px",borderRadius:100,border:`1px solid ${filter===f?C.coral:C.border}`,background:filter===f?"rgba(229,82,102,.10)":"transparent",color:filter===f?C.coral:C.muted,fontSize:11.5,fontWeight:filter===f?700:400}}>
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px 10px", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 120 }}>
              <select
                value={topicFilter}
                onChange={e => setTopicFilter(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: topicFilter !== "All" ? C.coral : C.muted, fontSize: 12, fontFamily: "'Outfit',sans-serif", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}
              >
                {TOPICS.map(t => <option key={t} value={t} style={{ background: "var(--card)", color: "var(--text)" }}>{t === "All" ? "All Topics" : t}</option>)}
              </select>
            </div>
            <div style={{ position: "relative", flex: 1, minWidth: 120 }}>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                style={{ width: "100%", padding: "6px 10px", borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.muted, fontSize: 12, fontFamily: "'Outfit',sans-serif", outline: "none", cursor: "pointer", appearance: "none", WebkitAppearance: "none" }}
              >
                <option value="newest" style={{ background: "var(--card)" }}>Newest First</option>
                <option value="oldest" style={{ background: "var(--card)" }}>Oldest First</option>
                <option value="escalated" style={{ background: "var(--card)" }}>Escalated First</option>
                <option value="pending" style={{ background: "var(--card)" }}>Pending First</option>
              </select>
            </div>
          </div>

          {realTickets !== null && realTickets.length === 0 && (
            <div style={{margin:"0 14px 10px",padding:"14px 12px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{fontSize:20,marginBottom:6}}>🎫</div>
              <div style={{fontSize:12.5,fontWeight:600,color:C.text,marginBottom:4}}>No tickets yet</div>
              <div style={{fontSize:11.5,color:C.muted}}>Tickets from your Shopify store will appear here once connected.</div>
            </div>
          )}

          <div style={{display:"flex",margin:"0 14px 12px",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            {[{label:"Auto-resolved",value:"87%",color:C.teal},{label:"Avg response",value:"<1m",color:C.blue},{label:"Escalated",value:"3%",color:"#FF5272"},{label:"Satisfaction",value:avgCsat,color:C.amber}].map((s,i)=>(
              <div key={i} style={{flex:1,padding:"9px 6px",textAlign:"center",background:C.card,borderRight:i<3?`1px solid ${C.border}`:"none"}}>
                <div style={{fontSize:13.5,fontWeight:800,color:s.color}}>{s.value}</div>
                <div style={{fontSize:9.5,color:C.muted,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>

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
                        <span style={{fontSize:11.5,color:C.muted,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:120}}>{t.preview}</span>
                        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                          <button
                            onClick={(e) => toggleBookmark(e, t.id)}
                            style={{background:"transparent",border:"none",cursor:"pointer",padding:"2px 3px",display:"flex",alignItems:"center",color:bookmarked[t.id]?C.amber:C.muted,flexShrink:0,transition:"color .15s"}}
                            title={bookmarked[t.id] ? "Remove bookmark" : "Bookmark ticket"}
                          >
                            <Bookmark size={13} strokeWidth={2} fill={bookmarked[t.id] ? C.amber : "none"} />
                          </button>
                          <span className="tag" style={{color:st.color,background:st.bg,gap:4}}>{st.icon}{st.label}</span>
                          {csatRatings[t.id] !== undefined && csatRatings[t.id] > 0 && (
                            <span style={{display:"inline-flex",alignItems:"center",gap:3,fontSize:10.5,padding:"2px 7px",borderRadius:100,background:"rgba(240,160,75,.10)",color:C.amber}}>★ {csatRatings[t.id]}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {t.unread && <div style={{width:7,height:7,borderRadius:"50%",background:C.coral,flexShrink:0,marginTop:4}}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Chat panel ── */}
        {selected && (
          <div
            className={`sr tv-chat${mobilePanel === "list" ? " tv-chat-hidden" : ""}`}
            style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}
          >
            {/* Header */}
            <div className="tv-chat-header" style={{padding:"15px 24px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="tv-chat-header-meta" style={{display:"flex",alignItems:"center",gap:13}}>
                <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:`${selected.avatarColor}22`,border:`1px solid ${selected.avatarColor}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13.5,fontWeight:700,color:selected.avatarColor}}>{selected.avatar}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:3}}>
                    <span style={{fontSize:15,fontWeight:700,color:C.text}}>{selected.name}</span>
                    <span className="tag" style={{color:STATUS_T[effectiveStatus].color,background:STATUS_T[effectiveStatus].bg,gap:4}}>{STATUS_T[effectiveStatus].icon}{STATUS_T[effectiveStatus].label}</span>
                  </div>
                  <div style={{fontSize:12,color:C.muted}}>{selected.email} · {selected.id} · {selected.type}</div>
                </div>
              </div>
              <button className="tv-back-btn btn-ghost" onClick={() => navigate(`${basePath}/tickets`)}
                style={{gap:5,color:C.coral,fontSize:13,fontWeight:600,padding:"8px 16px",background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:8}}>
                ← Back to Tickets
              </button>
              <div style={{display:"flex",gap:8}}>
                <button className="btn-ghost" onClick={isDemoMode ? undefined : handleEscalate} disabled={escalateDisabled || isDemoMode}
                  title={isDemoMode ? "Sign up to try this" : undefined}
                  style={{padding:"7px 14px",borderRadius:8,border:"1px solid rgba(255,82,114,.25)",color:"#FF5272",fontSize:13,display:"flex",alignItems:"center",cursor:isDemoMode?"not-allowed":"pointer",opacity:isDemoMode?0.45:1}}>
                  <ShieldAlert size={16} strokeWidth={2} style={{marginRight:6}}/>Escalate
                </button>
                <button className="btn-primary" onClick={isDemoMode ? undefined : handleClose} disabled={closeDisabled || isDemoMode}
                  title={isDemoMode ? "Sign up to try this" : undefined}
                  style={{padding:"7px 16px",borderRadius:8,color:"#fff",fontWeight:600,fontSize:13,display:"flex",alignItems:"center",cursor:isDemoMode?"not-allowed":"pointer",opacity:isDemoMode?0.45:1}}>
                  <XCircle size={16} strokeWidth={2} style={{marginRight:6}}/>Close Ticket
                </button>
              </div>
            </div>

            {/* Toast bar */}
            {toast && (
              <div style={{padding:"9px 24px",flexShrink:0,background:toast.bg,borderBottom:`1px solid ${toast.color}44`,display:"flex",alignItems:"center",gap:8,animation:"fadeUp .3s cubic-bezier(.16,1,.3,1) both"}}>
                <span style={{fontSize:13,color:toast.color,fontWeight:600}}>✓ {toast.message}</span>
              </div>
            )}

            {/* AI bar */}
            <div className="tv-ai-bar" style={{padding:"11px 24px",flexShrink:0,background:"rgba(229,82,102,.05)",borderBottom:"1px solid rgba(229,82,102,.14)",display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:"rgba(229,82,102,.14)",display:"flex",alignItems:"center",justifyContent:"center",color:C.coral}}><Zap size={14} strokeWidth={2}/></div>
              <span style={{fontSize:12,fontWeight:700,color:C.coral,flexShrink:0}}>SOLVA AI · </span>
              <span style={{fontSize:12.5,color:C.sub}}>
                {effectiveStatus==="resolved"  ? "This ticket was fully resolved by Solva AI without human intervention."
                :effectiveStatus==="escalated" ? "AI attempted resolution twice. Escalated — requires manual follow-up."
                : "AI has responded and is awaiting customer reply."}
              </span>
              <button
                onClick={() => {
                  if (isDemoMode) return;
                  const lastCustomerMsg = [...effectiveMsgs].reverse().find(m => m.from === 'customer');
                  if (lastCustomerMsg) generateAIReply(lastCustomerMsg.text);
                }}
                disabled={isDemoMode || aiLoading || effectiveStatus === 'resolved' || effectiveStatus === 'escalated'}
                title={isDemoMode ? "Sign up to try this" : undefined}
                className="btn-primary"
                style={{
                  marginLeft: 'auto',
                  padding: '6px 14px',
                  borderRadius: 8,
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  flexShrink: 0,
                  cursor: isDemoMode ? "not-allowed" : "pointer",
                  opacity: (isDemoMode || aiLoading || effectiveStatus === 'resolved' || effectiveStatus === 'escalated') ? 0.5 : 1,
                }}
              >
                {aiLoading ? (
                  <>
                    <div style={{width:12,height:12,borderRadius:'50%',border:`2px solid rgba(255,255,255,.3)`,borderTopColor:'#fff',animation:'spin .7s linear infinite',flexShrink:0}}/>
                    Generating…
                  </>
                ) : (
                  <><Zap size={12} strokeWidth={2}/>Generate AI Reply</>
                )}
              </button>
            </div>

            {/* Messages — flex:1, minHeight:0 ensures independent scroll */}
            <div className="tv-messages" style={{flex:1,overflowY:"auto",minHeight:0,scrollBehavior:"smooth",padding:"20px 24px",display:"flex",flexDirection:"column",background:C.bg}}>
              {effectiveMsgs.map((m,i) => <Bubble key={i} msg={m} idx={i}/>)}
              {effectiveStatus === "pending" && (
                <div style={{display:"flex",justifyContent:"flex-end",margin:"8px 0"}}>
                  <div style={{padding:"11px 16px",borderRadius:14,borderBottomRightRadius:4,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.18)",display:"flex",gap:5,alignItems:"center"}}>
                    {[0,1,2].map(i=><div key={i} className="typing-dot" style={{animationDelay:`${i*.18}s`}}/>)}
                    <span style={{fontSize:11.5,color:C.muted,marginLeft:6}}>Solva AI is composing a reply…</span>
                  </div>
                </div>
              )}
              {ticketClosed[selectedId] && csatRatings[selectedId] === undefined && (
                <div style={{padding:"18px 22px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,textAlign:"center",maxWidth:360,margin:"20px auto 0"}}>
                  <div style={{fontSize:24,marginBottom:10}}>✅</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>Rate this resolution</div>
                  <div style={{fontSize:12,color:C.muted,marginBottom:16}}>How satisfied was the customer with this response?</div>
                  <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:14}}>
                    {[1,2,3,4,5].map(star=>(
                      <button key={star}
                        onClick={()=>setCsatRatings(prev=>({...prev,[selectedId]:star}))}
                        onMouseEnter={()=>setCsatHover(star)}
                        onMouseLeave={()=>setCsatHover(null)}
                        style={{fontSize:28,color:star<=(csatHover||csatRatings[selectedId]||0)?C.amber:C.dim,cursor:"pointer",background:"transparent",border:"none",transition:"color .1s",fontFamily:"'Outfit',sans-serif"}}>
                        ★
                      </button>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:C.muted,paddingLeft:4,paddingRight:4,marginBottom:12}}>
                    <span>Very Dissatisfied</span><span>Very Satisfied</span>
                  </div>
                  <button onClick={()=>setCsatRatings(prev=>({...prev,[selectedId]:0}))}
                    style={{fontSize:12,color:C.muted,cursor:"pointer",background:"transparent",border:"none",fontFamily:"'Outfit',sans-serif"}}>
                    Skip
                  </button>
                </div>
              )}
              {ticketClosed[selectedId] && csatRatings[selectedId] !== undefined && csatRatings[selectedId] > 0 && (
                <div style={{padding:"18px 22px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,textAlign:"center",maxWidth:360,margin:"20px auto 0"}}>
                  <div style={{display:"flex",gap:4,justifyContent:"center",marginBottom:10}}>
                    {[1,2,3,4,5].map(star=>(
                      <span key={star} style={{fontSize:24,color:star<=csatRatings[selectedId]?C.amber:C.dim}}>★</span>
                    ))}
                  </div>
                  <div style={{fontSize:14,fontWeight:700,color:C.teal}}>Thank you for the feedback!</div>
                </div>
              )}
            </div>

            {/* AI-drafted reply — review, edit & send for real email-sourced tickets */}
            {showDraftPanel && (
              <div className="tv-draft-box" style={{flexShrink:0,borderTop:`1px solid ${C.border}`,background:C.surface,padding:"12px 24px"}}>
                <div style={{borderRadius:16,background:C.card,border:`1px solid ${C.borderHi}`,padding:"14px 16px"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                    <div style={{width:24,height:24,borderRadius:7,flexShrink:0,background:"rgba(229,82,102,.14)",display:"flex",alignItems:"center",justifyContent:"center",color:C.coral}}><Zap size={13} strokeWidth={2}/></div>
                    <span style={{fontSize:12.5,fontWeight:700,color:C.coral}}>AI-drafted reply</span>
                    <span style={{fontSize:11.5,color:C.muted}}>Review, edit, and send to {selected.customer_email || "the customer"}</span>
                  </div>
                  <textarea
                    value={draftText}
                    onChange={e=>setDraftEdits(prev=>({...prev,[selectedId]:e.target.value}))}
                    disabled={sendingReply}
                    placeholder="Edit the AI draft before sending…"
                    rows={5}
                    style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,color:C.text,fontSize:14,lineHeight:1.6,padding:"11px 13px",minHeight:96,maxHeight:220,overflowY:"auto",resize:"vertical",display:"block"}}
                  />
                  {sendError && (
                    <div style={{marginTop:10,padding:"9px 13px",borderRadius:10,background:"rgba(255,82,114,.10)",border:"1px solid rgba(255,82,114,.25)",display:"flex",alignItems:"center",gap:8}}>
                      <AlertCircle size={14} strokeWidth={2} style={{color:"#FF5272",flexShrink:0}}/>
                      <span style={{fontSize:12,color:"#FF5272",fontWeight:500,wordBreak:"break-word"}}>{sendError}</span>
                    </div>
                  )}
                  {sendWarning && (
                    <div style={{marginTop:10,padding:"9px 13px",borderRadius:10,background:"rgba(240,160,75,.10)",border:"1px solid rgba(240,160,75,.25)",display:"flex",alignItems:"center",gap:8}}>
                      <AlertTriangle size={14} strokeWidth={2} style={{color:C.amber,flexShrink:0}}/>
                      <span style={{fontSize:12,color:C.amber,fontWeight:500,wordBreak:"break-word"}}>{sendWarning}</span>
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:12}}>
                    <button className="btn-primary" onClick={handleSendDraft}
                      disabled={sendingReply || !draftText.trim()}
                      style={{height:38,padding:"0 20px",color:"#fff",fontWeight:600,fontSize:13,borderRadius:8,display:"flex",alignItems:"center",gap:6,cursor:sendingReply?"not-allowed":"pointer"}}>
                      {sendingReply ? (
                        <>
                          <div style={{width:13,height:13,borderRadius:"50%",border:`2px solid rgba(255,255,255,.3)`,borderTopColor:"#fff",animation:"spin .7s linear infinite",flexShrink:0}}/>
                          Sending…
                        </>
                      ) : (
                        <><Send size={14} strokeWidth={2}/>Send Reply</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI suggestions — static block, sits between messages and composer */}
            <div className="tv-suggestions">
              <button className="tv-suggestions-toggle btn-ghost" onClick={()=>setSuggestionsOpen(o=>!o)}
                style={{padding:"5px 12px",borderRadius:100,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,fontWeight:600,cursor:"pointer"}}>
                <span>AI Suggestions</span>
                <span style={{marginLeft:6}}>{suggestionsOpen?"▲":"▼"}</span>
              </button>
              <div className={`tv-suggestions-chips${!suggestionsOpen?" tv-suggestions-chips-hidden":""}`}
                style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:".04em",textTransform:"uppercase",display:"flex",alignItems:"center",flexShrink:0}}>AI Suggestions:</span>
                {aiSuggestions.map((s, i) => (
                  <button key={i} onClick={() => setReply(s)} className="btn-ghost"
                    style={{padding:"4px 12px",borderRadius:100,border:`1px solid ${C.border}`,background:C.card,color:C.text,fontSize:12,cursor:"pointer"}}>{s}</button>
                ))}
              </div>
            </div>

            {/* Reply box */}
            <div className="tv-reply-box" style={{flexShrink:0,borderTop:`1px solid ${C.border}`,background:C.surface,padding:"10px 16px",paddingBottom:"calc(10px + env(safe-area-inset-bottom))"}}>
              {/* Compact composer card */}
              <div style={{borderRadius:16,background:C.card,border:`1px solid ${C.borderHi}`,padding:"10px 14px"}}>
                {/* Text input */}
                <textarea
                  ref={textareaRef}
                  value={reply}
                  onChange={e=>setReply(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a reply..."
                  rows={1}
                  style={{width:"100%",background:"transparent",border:"none",color:C.text,fontSize:14,lineHeight:1.55,padding:0,minHeight:44,maxHeight:100,overflowY:"auto",resize:"none",display:"block"}}
                />
                {/* Action bar */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                  {/* Left: tools */}
                  <div style={{display:"flex",alignItems:"center",gap:2}}>
                    <button className="fmt-btn-sm" onClick={handleAttachment} title="Attach"
                      style={{color:C.muted}}>
                      <Paperclip size={15} strokeWidth={2}/>
                    </button>
                    <div style={{width:1,height:14,background:C.border,margin:"0 3px",flexShrink:0}}/>
                    <button className="fmt-btn-sm" onClick={()=>handleFormat("bold")} title="Bold"
                      style={{color:activeFormat==="bold"?C.coral:C.muted}}>
                      <Bold size={13} strokeWidth={2}/>
                    </button>
                    <button className="fmt-btn-sm" onClick={()=>handleFormat("italic")} title="Italic"
                      style={{color:activeFormat==="italic"?C.coral:C.muted}}>
                      <Italic size={13} strokeWidth={2}/>
                    </button>
                    <div style={{position:"relative"}} ref={emojiRef}>
                      <button className="fmt-btn-sm" onClick={()=>setEmojiOpen(o=>!o)} title="Emoji"
                        style={{color:emojiOpen?C.coral:C.muted}}>
                        <Smile size={15} strokeWidth={2}/>
                      </button>
                      {emojiOpen && (
                        <div style={{
                          position:"absolute", bottom:"calc(100% + 6px)", left:0, zIndex:500,
                          background:C.card, border:`1px solid ${C.borderHi}`,
                          borderRadius:12, boxShadow:"0 8px 32px rgba(0,0,0,.55)",
                          padding:12, display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                          gap:8, width:220,
                        }}>
                          {EMOJIS.map(e=>(
                            <button key={e} className="emoji-btn" onClick={()=>handleEmojiInsert(e)}>{e}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Right: split send */}
                  <div style={{position:"relative"}} ref={schedRef}>
                    <div style={{display:"flex",borderRadius:8,overflow:"hidden"}}>
                      <button className="btn-primary" onClick={isDemoMode ? undefined : handleSend} disabled={isDemoMode}
                        title={isDemoMode ? "Sign up to try this" : undefined}
                        style={{height:36,padding:"0 16px",color:"#fff",fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:5,borderRadius:0,cursor:isDemoMode?"not-allowed":"pointer",opacity:isDemoMode?0.45:1}}>
                        <Send size={14} strokeWidth={2}/>Send
                      </button>
                      <div style={{width:1,background:"rgba(255,255,255,.25)",alignSelf:"stretch",flexShrink:0}}/>
                      <button onClick={()=>{ if (!isDemoMode) { setSchedMenuOpen(o=>!o); setSchedPickOpen(false); } }} disabled={isDemoMode}
                        title={isDemoMode ? "Sign up to try this" : undefined}
                        style={{width:34,height:36,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0,cursor:isDemoMode?"not-allowed":"pointer",background:C.surface,border:`1px solid ${C.border}`,opacity:isDemoMode?0.45:1}}>
                        <ChevronUp size={16} strokeWidth={2.5} style={{color:C.text}}/>
                      </button>
                    </div>

                    {schedMenuOpen && (
                      <div style={{...popupBase,minWidth:164}}>
                        <button className="sched-opt" onClick={()=>{ setSchedMenuOpen(false); setSchedPickOpen(true); }}>
                          <Clock size={14} strokeWidth={2} style={{color:C.muted,flexShrink:0}}/>Schedule send
                        </button>
                      </div>
                    )}

                    {schedPickOpen && (
                      <div style={{...popupBase,minWidth:252}}>
                        <div style={{padding:"10px 14px 4px",fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".06em",textTransform:"uppercase"}}>Send at…</div>
                        {SCHEDULE_OPTS.map(opt=>(
                          <button key={opt} className="sched-opt" onClick={()=>handleScheduleSend(opt)}>
                            <Clock size={13} strokeWidth={2} style={{color:C.muted,flexShrink:0}}/>{opt}
                          </button>
                        ))}
                        <button className="sched-opt" onClick={()=>{ setCustomPickOpen(true); setSchedPickOpen(false); }}>
                          <Calendar size={13} strokeWidth={2} style={{color:C.muted,flexShrink:0}}/>Choose date &amp; time…
                        </button>
                        <div style={{height:6}}/>
                      </div>
                    )}

                    {customPickOpen && (
                      <div style={{
                        position:"absolute", zIndex:600, right:0, bottom:"calc(100% + 8px)",
                        background:C.card, border:`1px solid ${C.borderHi}`,
                        borderRadius:16, padding:20, boxShadow:"0 8px 32px rgba(0,0,0,.55)",
                        minWidth:280,
                      }}>
                        <div style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".06em",textTransform:"uppercase",marginBottom:14}}>Schedule Send</div>
                        <div style={{display:"flex",gap:8,marginBottom:12}}>
                          <select value={pickDay} onChange={e=>setPickDay(+e.target.value)} style={selectSt}>
                            {Array.from({length:31},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}
                          </select>
                          <select value={pickMonth} onChange={e=>setPickMonth(+e.target.value)} style={{...selectSt,flex:2}}>
                            {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m,i)=>(
                              <option key={i} value={i+1}>{m}</option>
                            ))}
                          </select>
                          <select value={pickYear} onChange={e=>setPickYear(+e.target.value)} style={{...selectSt,flex:1.5}}>
                            {[0,1,2].map(o=>{const y=new Date().getFullYear()+o;return<option key={y} value={y}>{y}</option>;})}
                          </select>
                        </div>
                        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}>
                          <select value={pickHour} onChange={e=>setPickHour(+e.target.value)} style={selectSt}>
                            {Array.from({length:12},(_,i)=><option key={i} value={i+1}>{i+1}</option>)}
                          </select>
                          <span style={{color:C.muted,fontWeight:700,flexShrink:0}}>:</span>
                          <select value={pickMin} onChange={e=>setPickMin(+e.target.value)} style={selectSt}>
                            {Array.from({length:60},(_,i)=><option key={i} value={i}>{String(i).padStart(2,"0")}</option>)}
                          </select>
                          <div style={{display:"flex",borderRadius:8,overflow:"hidden",border:`1px solid ${C.border}`,flexShrink:0}}>
                            {["AM","PM"].map(p=>(
                              <button key={p} onClick={()=>setPickAmpm(p)}
                                style={{padding:"7px 10px",fontFamily:"'Outfit',sans-serif",fontSize:12,fontWeight:600,cursor:"pointer",border:"none",
                                  background:pickAmpm===p?"rgba(229,82,102,.18)":"transparent",
                                  color:pickAmpm===p?C.coral:C.muted}}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        <button className="btn-primary" onClick={handleCustomDateConfirm}
                          style={{width:"100%",padding:"11px 0",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,marginBottom:10,cursor:"pointer"}}>
                          Schedule
                        </button>
                        <div style={{textAlign:"center"}}>
                          <button onClick={()=>setCustomPickOpen(false)}
                            style={{background:"none",border:"none",cursor:"pointer",color:C.muted,fontSize:13,fontFamily:"'Outfit',sans-serif",textDecoration:"underline",padding:"4px 8px"}}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {showAttachHint && (
                <p style={{fontSize:11,color:C.muted,marginTop:5,display:"flex",alignItems:"center",gap:4,animation:"fadeUp .3s cubic-bezier(.16,1,.3,1) both"}}>
                  <Paperclip size={12} strokeWidth={2}/>File attachment coming soon
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
