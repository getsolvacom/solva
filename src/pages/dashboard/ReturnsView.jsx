import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../../tokens";
import {
  DollarSign, Shield, AlertTriangle, CheckCircle2, Zap, Send, Paperclip,
  User, Search, Clock as ClockIcon,
  Smile, Bold, Italic, ChevronUp, Clock, Calendar,
} from "lucide-react";
import AvatarMenu from "./AvatarMenu";
import { useStore } from "../../hooks/useStore";
import { supabase } from "../../lib/supabase";

const RETURNS = [
  {
    id:"RT-0544", name:"Chloe Martins", email:"chloe.m@gmail.com",
    avatar:"CM", avatarColor:"#3ECFB2",
    product:"Leather Crossbody Bag", productEmoji:"👜",
    variant:"Caramel / Medium", orderRef:"#5021", orderValue:148.00,
    reason:"wrong_size", reasonLabel:"Wrong Size",
    status:"deflected", timeAgo:"34m ago",
    marginSaved:148.00,
    offer:{ type:"Exchange", detail:"Exchanged for Small — free shipping both ways", icon:"🔄" },
    conversation:[
      { from:"customer", text:"Hi, I ordered the Leather Crossbody Bag in medium but it's a bit too big for me. I'd like to return it.", time:"10:08 AM" },
      { from:"ai",       text:"Hi Chloe! Before processing a return — we have the same bag in Small, which is 20% more compact. I can arrange an exchange with free shipping both ways at no cost to you. Would that work?", time:"10:08 AM" },
      { from:"customer", text:"Oh I didn't know there was a small! Yes, I'd love to try that instead.", time:"10:11 AM" },
      { from:"ai",       text:"Wonderful! Exchange arranged. Prepaid return label sent to your inbox and your Small ships as soon as we receive yours. Thank you Chloe!", time:"10:11 AM" },
    ],
  },
  {
    id:"RT-0543", name:"Kevin Adewale", email:"kevin.a@yahoo.com",
    avatar:"KA", avatarColor:"#F0A04B",
    product:"Premium Denim Jacket", productEmoji:"🧥",
    variant:"Indigo / Size L", orderRef:"#5019", orderValue:229.00,
    reason:"changed_mind", reasonLabel:"Changed Mind",
    status:"deflected", timeAgo:"1h ago",
    marginSaved:206.10,
    offer:{ type:"Store Credit", detail:"$22.90 store credit applied (10% of order)", icon:"💳" },
    conversation:[
      { from:"customer", text:"I'd like to return the denim jacket. I changed my mind after seeing it in person.", time:"9:42 AM" },
      { from:"ai",       text:"Hi Kevin! Before processing — how about keeping the jacket and receiving $22.90 store credit (10% of your order) right now? The credit never expires. Would that change things?", time:"9:42 AM" },
      { from:"customer", text:"You know what, that's fair. I'll keep it.", time:"9:47 AM" },
      { from:"ai",       text:"Great choice! Your $22.90 store credit has been added — you'll see it at checkout automatically. Enjoy the jacket Kevin!", time:"9:47 AM" },
    ],
  },
  {
    id:"RT-0542", name:"Fatima Al-Hassan", email:"fatima.h@proton.me",
    avatar:"FA", avatarColor:"#5BADFF",
    product:"Silk Blouse", productEmoji:"👚",
    variant:"Ivory / Size S", orderRef:"#5017", orderValue:97.50,
    reason:"defect", reasonLabel:"Product Defect",
    status:"processed", timeAgo:"2h ago",
    marginSaved:0,
    offer:{ type:"Full Refund", detail:"Defect confirmed — full refund processed", icon:"💸" },
    conversation:[
      { from:"customer", text:"The silk blouse has a small tear near the collar. Unacceptable at this price point.", time:"8:55 AM" },
      { from:"ai",       text:"Hi Fatima, I sincerely apologise — this is completely unacceptable. Your full refund of $97.50 has been processed and a prepaid return label is in your inbox. Credit appears within 3–5 business days.", time:"8:55 AM" },
      { from:"customer", text:"Thank you. I appreciate the quick response.", time:"9:02 AM" },
    ],
  },
  {
    id:"RT-0541", name:"Luca Moretti", email:"luca.m@gmail.com",
    avatar:"LM", avatarColor:"#992A67",
    product:"Merino Wool Sweater", productEmoji:"🧶",
    variant:"Forest Green / XL", orderRef:"#5015", orderValue:185.00,
    reason:"changed_mind", reasonLabel:"Changed Mind",
    status:"pending", timeAgo:"3h ago",
    marginSaved:0,
    offer:{ type:"Exchange Offered", detail:"AI offering slim fit alternative — awaiting customer decision", icon:"⏳" },
    conversation:[
      { from:"customer", text:"I'd like to return my merino sweater. I just don't think I'll wear it.", time:"8:10 AM" },
      { from:"ai",       text:"Hi Luca! Since you're unsure about wearing it — if it's a fit issue, I can arrange an exchange for a different size at no cost. What's the main concern — fit, style, or something else?", time:"8:10 AM" },
      { from:"customer", text:"Mainly the fit I think. It feels a bit boxy.", time:"8:15 AM" },
      { from:"ai",       text:"Got it! We have the same sweater in a Slim Fit cut — slightly narrower through the body. Want me to set up the exchange?", time:"8:15 AM" },
    ],
  },
];

const STATUS_R = {
  deflected: { label:"Deflected", color:"#3ECFB2", bg:"rgba(62,207,178,.10)"  },
  processed: { label:"Processed", color:"#FF5272", bg:"rgba(255,82,114,.10)"  },
  pending:   { label:"Pending",   color:"#F0A04B", bg:"rgba(240,160,75,.10)"  },
};

const REASON_CFG = {
  wrong_size:       { label:"Wrong Size",       color:"#5BADFF"  },
  changed_mind:     { label:"Changed Mind",     color:"#F0A04B"  },
  defect:           { label:"Product Defect",   color:"#FF5272"  },
  wrong_item:       { label:"Wrong Item",       color:"#FF5272"  },
  not_as_described: { label:"Not as Described", color:"#992A67"  },
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

function SkeletonBlock({ width = "100%", height = 16, radius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: `linear-gradient(90deg, var(--dim) 25%, var(--border) 50%, var(--dim) 75%)`,
      backgroundSize: "200% 100%",
      animation: "skeletonShimmer 1.4s ease infinite",
      flexShrink: 0,
      ...style,
    }}/>
  );
}

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
      @keyframes saveShine{0%{background-position:-200% center;}100%{background-position:200% center;}}
      @keyframes toastSlideIn{from{opacity:0;transform:translateX(70px);}to{opacity:1;transform:translateX(0);}}
      @keyframes toastFadeOut{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(70px);}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .fu{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
      .sr{animation:slideRight .5s cubic-bezier(.16,1,.3,1) both;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .return-row{cursor:pointer;transition:background .14s;border-left:3px solid transparent;}
      .return-row:hover{background:rgba(229,82,102,.05)!important;}
      .kpi-card{transition:transform .2s,box-shadow .2s;cursor:default;}
      .kpi-card:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(0,0,0,.5);}
      .msg-bubble{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) both;}
      .blink{animation:blink 2.4s ease infinite;}
      .saved-shine{background:linear-gradient(90deg,#3ECFB2,#5BADFF,#3ECFB2);background-size:200% auto;animation:saveShine 3s linear infinite;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
      .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:600;white-space:nowrap;}
      .toast-in{animation:toastSlideIn .35s cubic-bezier(.16,1,.3,1) both;}
      .toast-out{animation:toastFadeOut .3s ease forwards;}
      input,textarea{font-family:'Outfit',sans-serif;outline:none;}
      .fmt-btn{cursor:pointer;border:none;outline:none;transition:all .12s;font-family:'Outfit',sans-serif;background:transparent;min-width:44px;min-height:44px;padding:10px;border-radius:8px;display:flex;align-items:center;justify-content:center;}
      .fmt-btn:hover{background:rgba(229,82,102,.09);}
      .emoji-btn{cursor:pointer;border:none;background:none;font-size:20px;padding:6px;border-radius:6px;line-height:1;transition:background .1s;display:flex;align-items:center;justify-content:center;}
      .emoji-btn:hover{background:rgba(229,82,102,.13);}
      .sched-opt{display:flex;align-items:center;gap:8px;padding:11px 14px;width:100%;background:transparent;border:none;color:#D2B4C8;font-size:13px;font-family:'Outfit',sans-serif;cursor:pointer;white-space:nowrap;text-align:left;transition:background .12s;min-height:44px;}
      .sched-opt:hover{background:rgba(229,82,102,.09);color:#E55266;}
      .fmt-btn-sm{cursor:pointer;border:none;outline:none;transition:all .12s;font-family:'Outfit',sans-serif;background:transparent;width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;}
      .fmt-btn-sm:hover{background:rgba(229,82,102,.09);}

      /* ── Mobile layout ── */
      .rv-back-btn{display:none;}
      @media(max-width:767px){
        .rv-root{overflow-x:hidden!important;height:auto!important;flex:none!important;}
        .rv-topbar{height:auto!important;padding:10px 14px!important;}
        .rv-kpi-strip{grid-template-columns:1fr 1fr!important;}
        .rv-kpi-card{border-right:1px solid #200026!important;border-bottom:1px solid #200026!important;}
        .rv-kpi-card:nth-child(2n){border-right:none!important;}
        .rv-kpi-card:nth-child(3),.rv-kpi-card:nth-child(4){border-bottom:none!important;}
        .rv-workspace{flex-direction:column!important;overflow:visible!important;}
        .rv-list{width:100%!important;flex-shrink:0!important;border-right:none!important;border-bottom:1px solid #200026;}
        .rv-list-hidden{display:none!important;}
        .rv-detail{width:100%!important;overflow:visible!important;height:auto!important;}
        .rv-detail-hidden{display:none!important;}
        .rv-detail-meta{display:none!important;}
        .rv-detail-header{padding:11px 14px!important;}
        .rv-detail-body{overflow:visible!important;flex:none!important;padding:14px!important;padding-bottom:100px!important;}
        .rv-two-col{grid-template-columns:1fr!important;}
        .rv-back-btn{display:flex!important;align-items:center;}
        .rv-reply-box{padding:8px 12px!important;padding-bottom:calc(8px + env(safe-area-inset-bottom))!important;position:fixed!important;bottom:0!important;left:0!important;right:0!important;z-index:500!important;background:#0C000F!important;border-top:1px solid #3D0050!important;backdrop-filter:blur(8px)!important;-webkit-backdrop-filter:blur(8px)!important;}
      }
      .ls-mob .rv-root{height:100dvh!important;overflow:hidden!important;flex:1!important;}
      .ls-mob .rv-workspace{flex-direction:row!important;overflow:hidden!important;flex:1!important;min-height:0!important;}
      .ls-mob .rv-list{width:40%!important;flex:none!important;border-right:1px solid #200026!important;border-bottom:none!important;overflow-y:auto!important;height:100%!important;}
      .ls-mob .rv-list-hidden{display:flex!important;flex-direction:column!important;}
      .ls-mob .rv-detail{width:60%!important;flex:none!important;overflow:hidden!important;height:100%!important;display:flex!important;flex-direction:column!important;}
      .ls-mob .rv-detail-hidden{display:flex!important;flex-direction:column!important;}
      .ls-mob .rv-detail-body{overflow-y:auto!important;flex:1!important;min-height:0!important;padding:12px 16px!important;}
      .ls-mob .rv-detail-meta{display:flex!important;}
      .ls-mob .rv-back-btn{display:none!important;}
      .ls-mob .rv-two-col{grid-template-columns:1fr 1fr!important;}
      .ls-mob .rv-reply-box{padding:8px 14px!important;position:relative!important;bottom:auto!important;left:auto!important;right:auto!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;}
      @keyframes skeletonShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
    `}</style>
  );
}

function Bubble({ msg, idx }) {
  const isCustomer = msg.from === "customer";
  const isAgent    = msg.from === "agent";
  const isRight    = !isCustomer;
  return (
    <div className="msg-bubble" style={{animationDelay:`${idx*.07}s`,display:"flex",justifyContent:isRight?"flex-end":"flex-start",margin:"6px 0"}}>
      <div style={{maxWidth:"72%",display:"flex",flexDirection:"column",alignItems:isRight?"flex-end":"flex-start",gap:5}}>
        <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:2}}>
          {isAgent    && <span className="tag" style={{color:C.amber,background:"rgba(240,160,75,.10)",fontSize:10,display:"inline-flex",alignItems:"center",gap:3}}><User size={12} strokeWidth={2}/>AGENT</span>}
          {msg.from==="ai" && <span className="tag" style={{color:C.coral,background:"rgba(229,82,102,.10)",fontSize:10,display:"inline-flex",alignItems:"center",gap:3}}><Zap size={12} strokeWidth={2}/>SOLVA AI</span>}
          <span style={{fontSize:10.5,color:C.muted}}>{msg.time}</span>
          {isCustomer && <span style={{fontSize:10.5,color:C.sub,fontWeight:500}}>Customer</span>}
        </div>
        <div style={{padding:"11px 15px",borderRadius:14,borderBottomLeftRadius:isCustomer?4:14,borderBottomRightRadius:isCustomer?14:4,background:isCustomer?C.card:isAgent?"rgba(240,160,75,.10)":"rgba(229,82,102,.10)",border:`1px solid ${isCustomer?C.border:isAgent?"rgba(240,160,75,.20)":"rgba(229,82,102,.20)"}`,fontSize:13.5,color:C.text,lineHeight:1.65,wordBreak:"break-word"}}>
          {renderMd(msg.text)}
        </div>
      </div>
    </div>
  );
}

export default function ReturnsView({ isLandscape, isMobile }) {
  const navigate                                      = useNavigate();
  const { returnId }                                  = useParams();
  const selectedId                                    = returnId || "RT-0544";
  const mobilePanel                                   = returnId ? "detail" : "list";
  const [filter,              setFilter]              = useState("All");
  const [search,              setSearch]              = useState("");
  const [statusOverrides,     setStatusOverrides]     = useState({});
  const [overrideToast,       setOverrideToast]       = useState(false);
  const [overrideToastFading, setOverrideToastFading] = useState(false);
  const [chatInput,           setChatInput]           = useState("");
  const [extraMessages,       setExtraMessages]       = useState({});
  const [attachHint,          setAttachHint]          = useState(false);
  const [emojiOpen,           setEmojiOpen]           = useState(false);
  const [schedMenuOpen,       setSchedMenuOpen]       = useState(false);
  const [schedPickOpen,       setSchedPickOpen]       = useState(false);
  const [activeFormat,        setActiveFormat]        = useState(null);
  const [schedToast,          setSchedToast]          = useState(false);
  const [schedToastFading,    setSchedToastFading]    = useState(false);
  const [schedToastMsg,       setSchedToastMsg]       = useState("Message scheduled ✓");
  const [customPickOpen, setCustomPickOpen] = useState(false);
  const [pickDay,   setPickDay]   = useState(new Date().getDate());
  const [pickMonth, setPickMonth] = useState(new Date().getMonth() + 1);
  const [pickYear,  setPickYear]  = useState(new Date().getFullYear());
  const [pickHour,  setPickHour]  = useState(9);
  const [pickMin,   setPickMin]   = useState(0);
  const [pickAmpm,  setPickAmpm]  = useState("AM");

  const { store } = useStore();

  const [aiDeflection, setAiDeflection] = useState(null);
  const [aiDeflectionLoading, setAiDeflectionLoading] = useState(false);
  const [realReturns, setRealReturns] = useState(null);
  const [returnsLoading, setReturnsLoading] = useState(true);

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

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setReturnsLoading(false); return; }
        const { data: storeData } = await supabase
          .from('stores').select('id')
          .eq('user_id', user.id).eq('is_active', true).maybeSingle();
        if (!storeData) { setReturnsLoading(false); return; }
        const { data: returns } = await supabase
          .from('returns').select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false });
        if (returns && returns.length > 0) {
          const mapped = returns.map((r, idx) => ({
            id: r.id,
            name: r.customer_name || r.customer_email || 'Unknown',
            email: r.customer_email || '',
            avatar: (r.customer_name || 'UN').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2),
            avatarColor: [C.teal, C.amber, C.blue, C.magenta][idx % 4],
            product: r.product_name || 'Product',
            productEmoji: '📦',
            variant: '',
            orderRef: r.order_id || '—',
            orderValue: parseFloat(r.order_value || 0),
            reason: r.reason || 'changed_mind',
            reasonLabel: r.reason || 'Return Request',
            status: r.deflected ? 'deflected' : r.status || 'pending',
            timeAgo: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : '',
            marginSaved: r.deflected ? parseFloat(r.order_value || 0) : 0,
            offer: {
              type: r.deflected_offer || 'Exchange Offered',
              detail: r.ai_deflection_response || 'AI deflection response generated',
              icon: r.deflected ? '🔄' : '⏳',
            },
            conversation: r.ai_deflection_response ? [
              { from:'customer', text: r.return_reason || 'Customer requested return', time: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : '' },
              { from:'ai', text: r.ai_deflection_response, time: r.updated_at ? new Date(r.updated_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : '' },
            ] : [
              { from:'customer', text: r.return_reason || 'Customer requested return', time: r.created_at ? new Date(r.created_at).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}) : '' },
            ],
          }));
          setRealReturns(mapped);
        } else {
          setRealReturns([]);
        }
      } catch (err) {
        console.error('Returns fetch error:', err);
        setRealReturns([]);
      } finally {
        setReturnsLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const returnSource = realReturns && realReturns.length > 0 ? realReturns : RETURNS;
  const filtered = returnSource.filter(r => {
    const mf =
      filter==="All"       ? true :
      filter==="Deflected" ? r.status==="deflected" :
      filter==="Processed" ? r.status==="processed" :
      filter==="Pending"   ? r.status==="pending"   : true;
    return mf && (r.name.toLowerCase().includes(search.toLowerCase()) || r.product.toLowerCase().includes(search.toLowerCase()));
  });

  const selected      = returnSource.find(r => r.id === selectedId);
  const totalSaved    = returnSource.filter(r=>r.status==="deflected").reduce((s,r)=>s+r.marginSaved,0);
  const deflectRate   = returnSource.length > 0 ? Math.round((returnSource.filter(r=>r.status==="deflected").length / returnSource.length) * 100) : 0;
  const counts        = {
    All:       returnSource.length,
    Pending:   returnSource.filter(r=>r.status==="pending").length,
    Deflected: returnSource.filter(r=>r.status==="deflected").length,
    Processed: returnSource.filter(r=>r.status==="processed").length,
  };

  const effectiveStatus = selected && statusOverrides[selected.id] === "manual_override"
    ? { label:"Manual Override", color:C.amber, bg:"rgba(240,160,75,.10)" }
    : selected ? STATUS_R[selected.status] : null;

  const allMessages = selected
    ? [...selected.conversation, ...(extraMessages[selectedId]||[])]
    : [];

  function handleReturnSelect(id) {
    navigate("/dashboard/returns/" + id);
  }

  function handleOverride() {
    setStatusOverrides(prev => ({...prev, [selectedId]:"manual_override"}));
    setOverrideToast(true);
    setOverrideToastFading(false);
    setTimeout(() => setOverrideToastFading(true), 2700);
    setTimeout(() => { setOverrideToast(false); setOverrideToastFading(false); }, 3000);
  }

  const generateAIDeflection = async () => {
    if (!selected) return;
    setAiDeflectionLoading(true);
    setAiDeflection(null);
    try {
      const response = await fetch('/api/ai/return-deflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          returnReason: selected.reasonLabel + ': ' + selected.conversation[selected.conversation.length - 1].text,
          productName: selected.product,
          customerName: selected.name.split(' ')[0],
          storeName: store?.shop_name || 'our store',
          brandTone: 'friendly',
          maxDiscount: '15%',
        }),
      });
      const data = await response.json();
      if (data.response) {
        setAiDeflection(data.response);
      }
    } catch (error) {
      console.error('Return deflection AI error:', error);
    } finally {
      setAiDeflectionLoading(false);
    }
  };

  function handleSend() {
    if (!chatInput.trim()) return;
    const now  = new Date();
    const time = now.toLocaleTimeString("en-US", {hour:"numeric", minute:"2-digit"});
    setExtraMessages(prev => ({...prev, [selectedId]:[...(prev[selectedId]||[]), {from:"agent", text:chatInput.trim(), time}]}));
    setChatInput("");
  }

  function handleAttach() {
    setAttachHint(true);
    setTimeout(() => setAttachHint(false), 2000);
  }

  function handleEmojiInsert(emoji) {
    setChatInput(v => v + emoji);
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
    const sel    = chatInput.slice(start, end);
    let newVal, newCursor;
    if (sel) {
      newVal    = chatInput.slice(0, start) + marker + sel + marker + chatInput.slice(end);
      newCursor = end + marker.length * 2;
    } else {
      newVal    = chatInput.slice(0, start) + marker + marker + chatInput.slice(end);
      newCursor = start + marker.length;
    }
    setChatInput(newVal);
    requestAnimationFrame(() => { ta.focus(); ta.setSelectionRange(newCursor, newCursor); });
  }

  function fireSchedToast(msg) {
    setSchedToastMsg(msg);
    setSchedToast(true);
    setSchedToastFading(false);
    setTimeout(() => setSchedToastFading(true), 2700);
    setTimeout(() => { setSchedToast(false); setSchedToastFading(false); }, 3000);
  }

  function handleScheduleSend(opt) {
    setSchedPickOpen(false);
    setChatInput("");
    fireSchedToast("Message scheduled ✓");
  }

  function handleCustomDateConfirm() {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const timeStr = `${pickHour}:${String(pickMin).padStart(2,"0")} ${pickAmpm}`;
    const dateStr = `${months[pickMonth-1]} ${pickDay}, ${pickYear}`;
    setCustomPickOpen(false);
    setChatInput("");
    fireSchedToast(`Message scheduled for ${dateStr} at ${timeStr} ✓`);
  }

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
    <div className="rv-root" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",overflowX:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div className="rv-topbar" style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Returns</h1>
          <p style={{fontSize:11.5,color:C.muted}}>${totalSaved.toFixed(2)} margin saved this week · {deflectRate}% deflection rate</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:8,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.22)"}}>
            <div className="blink" style={{width:6,height:6,borderRadius:"50%",background:C.coral}}/>
            <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".04em"}}>SOLVA LIVE</span>
          </div>
          <AvatarMenu />
        </div>
      </div>

      {/* KPI strip */}
      <div className="rv-kpi-strip" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {[
          {label:"Margin Saved",      value:`$${totalSaved.toFixed(2)}`,                              color:C.teal,  icon:<DollarSign size={18} strokeWidth={2}/>},
          {label:"Deflection Rate",   value:`${deflectRate}%`,                                        color:C.coral, icon:<Shield size={18} strokeWidth={2}/>},
          {label:"Total at Risk",     value:`$${returnSource.reduce((s,r)=>s+r.orderValue,0).toFixed(2)}`, color:C.amber, icon:<AlertTriangle size={18} strokeWidth={2}/>},
          {label:"Deflected Returns", value:"24/47",                                                   color:C.blue,  icon:<CheckCircle2 size={18} strokeWidth={2}/>},
        ].map((k,i)=>(
          <div key={i} className="rv-kpi-card kpi-card" style={{padding:"14px 20px",background:C.surface,borderRight:i<3?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${k.color}33`,color:k.color,display:"flex",alignItems:"center",justifyContent:"center"}}>{k.icon}</div>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:k.color}}>{returnsLoading ? <SkeletonBlock width={60} height={18} radius={6}/> : k.value}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace */}
      <div className="rv-workspace" style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* ── Returns list ── */}
        <div
          className={`rv-list${mobilePanel==="detail"?" rv-list-hidden":""}`}
          style={{width:290,flexShrink:0,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.surface}}
        >
          <div style={{padding:"12px 12px 8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
              <Search size={16} strokeWidth={2} style={{color:C.muted,flexShrink:0}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search returns…" style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:13.5}}/>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"0 12px 10px"}}>
            {["All","Pending","Deflected","Processed"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:"4px 10px",borderRadius:100,cursor:"pointer",border:`1px solid ${filter===f?C.coral:C.border}`,background:filter===f?"rgba(229,82,102,.10)":"transparent",color:filter===f?C.coral:C.muted,fontSize:11.5,fontWeight:filter===f?700:400,fontFamily:"'Outfit',sans-serif"}}>
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          {realReturns && realReturns.length === 0 && (
            <div style={{padding:"32px 16px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12,opacity:.4}}>↩️</div>
              <div style={{fontSize:14,fontWeight:600,color:C.sub,marginBottom:6}}>No returns yet</div>
              <div style={{fontSize:12.5,color:C.muted,lineHeight:1.6}}>When customers request returns from your store, they'll appear here automatically.</div>
            </div>
          )}

          <div style={{flex:1,overflowY:"auto"}}>
            {returnsLoading && (
              <div style={{padding:"12px 0"}}>
                {[0,1,2,3].map(i => (
                  <div key={i} style={{padding:"13px 16px",borderBottom:`1px solid ${C.border}`}}>
                    <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                      <SkeletonBlock width={36} height={36} radius={10} style={{flexShrink:0}}/>
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:8}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <SkeletonBlock width={110} height={12}/>
                          <SkeletonBlock width={48} height={12}/>
                        </div>
                        <SkeletonBlock width={140} height={11}/>
                        <div style={{display:"flex",gap:6}}>
                          <SkeletonBlock width={64} height={18} radius={100}/>
                          <SkeletonBlock width={64} height={18} radius={100}/>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filtered.map(r=>{
              const s  = STATUS_R[r.status];
              const rs = REASON_CFG[r.reason];
              return (
                <div key={r.id} className="return-row" onClick={()=>handleReturnSelect(r.id)}
                  style={{padding:"13px 16px",background:selectedId===r.id?"rgba(229,82,102,.07)":"transparent",borderLeft:`3px solid ${selectedId===r.id?C.coral:"transparent"}`,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${r.avatarColor}20`,border:`1px solid ${r.avatarColor}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11.5,fontWeight:700,color:r.avatarColor}}>{r.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{fontSize:13,fontWeight:600,color:C.text}}>{r.name}</span>
                        <span style={{fontSize:13.5,fontWeight:800,color:r.status==="deflected"?C.teal:r.status==="processed"?"#FF5272":C.amber}}>${r.orderValue.toFixed(2)}</span>
                      </div>
                      <div style={{fontSize:12.5,color:C.sub,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",marginBottom:6}}>{r.productEmoji} {r.product}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:6}}>
                        <span className="tag" style={{color:rs.color,background:`${rs.color}12`,fontSize:10}}>{rs.label}</span>
                        <span className="tag" style={{color:s.color,background:s.bg}}>{s.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,background:C.card}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.muted}}>Total refund risk</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>${returnSource.reduce((s,r)=>s+r.orderValue,0).toFixed(2)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
              <span style={{fontSize:12,color:C.muted}}>Margin protected</span>
              <span style={{fontSize:13,fontWeight:700,color:C.teal}}>${totalSaved.toFixed(2)}</span>
            </div>
            <div style={{height:4,borderRadius:3,background:C.dim,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${C.teal},${C.blue})`,width:`${deflectRate}%`}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:10.5,color:C.muted,marginTop:5}}>
              <span>Deflection rate</span>
              <span style={{color:C.teal,fontWeight:700}}>{deflectRate}%</span>
            </div>
          </div>
        </div>

        {/* ── Detail panel ── */}
        {selected && (
          <div
            className={`sr rv-detail${mobilePanel==="list"?" rv-detail-hidden":""}`}
            style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}
          >
            {/* Header */}
            <div className="rv-detail-header" style={{padding:"15px 24px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div className="rv-detail-meta" style={{display:"flex",alignItems:"center",gap:13}}>
                <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:`${selected.avatarColor}20`,border:`1px solid ${selected.avatarColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:selected.avatarColor}}>{selected.avatar}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontSize:15,fontWeight:700,color:C.text}}>{selected.name}</span>
                    <span className="tag" style={{color:REASON_CFG[selected.reason].color,background:`${REASON_CFG[selected.reason].color}12`}}>{REASON_CFG[selected.reason].label}</span>
                    <span className="tag" style={{color:effectiveStatus.color,background:effectiveStatus.bg}}>{effectiveStatus.label}</span>
                  </div>
                  <span style={{fontSize:12,color:C.muted}}>{selected.email} · {selected.id} · Order {selected.orderRef}</span>
                </div>
              </div>
              <button className="rv-back-btn btn-ghost" onClick={()=>navigate("/dashboard/returns")}
                style={{gap:5,color:C.coral,fontSize:13,fontWeight:600,padding:"8px 16px",background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:8}}>
                ← Back to Returns
              </button>
              {selected.status === "pending" && (
                <button
                  className="btn-ghost"
                  onClick={generateAIDeflection}
                  disabled={aiDeflectionLoading}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: `1px solid ${C.coral}`,
                    color: C.coral,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    opacity: aiDeflectionLoading ? 0.6 : 1,
                    marginRight: 8,
                  }}
                >
                  {aiDeflectionLoading ? (
                    <>
                      <div style={{width:12,height:12,borderRadius:'50%',border:`2px solid rgba(229,82,102,.3)`,borderTopColor:C.coral,animation:'spin .7s linear infinite',flexShrink:0}}/>
                      Generating…
                    </>
                  ) : (
                    <><Zap size={13} strokeWidth={2}/>Generate AI Response</>
                  )}
                </button>
              )}
              {selected.status==="pending" && (
                <button className="btn-primary" disabled={statusOverrides[selectedId]==="manual_override"} onClick={handleOverride}
                  style={{padding:"7px 16px",borderRadius:8,color:"#fff",fontWeight:600,fontSize:13,opacity:statusOverrides[selectedId]==="manual_override"?.75:1,cursor:statusOverrides[selectedId]==="manual_override"?"not-allowed":"pointer",display:"flex",alignItems:"center"}}>
                  {statusOverrides[selectedId]==="manual_override"
                    ? <><CheckCircle2 size={16} strokeWidth={2} style={{marginRight:6}}/>Override Active</>
                    : <><Zap size={16} strokeWidth={2} style={{marginRight:6}}/>Override AI</>}
                </button>
              )}
            </div>

            {/* Scrollable body — flex:1, minHeight:0 for independent scroll on desktop/ls-mob */}
            <div className="rv-detail-body" style={{flex:1,overflowY:"auto",minHeight:0,scrollBehavior:"smooth",padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:C.bg}}>

              {selected.status==="deflected" && (
                <div style={{padding:"16px 20px",borderRadius:14,background:"rgba(62,207,178,.07)",border:"1px solid rgba(62,207,178,.20)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:44,height:44,borderRadius:12,flexShrink:0,background:"rgba(62,207,178,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{selected.offer.icon}</div>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:C.teal,marginBottom:3}}>Return Deflected — Margin Saved</div>
                      <div style={{fontSize:12.5,color:C.sub}}>{selected.offer.detail}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div className="saved-shine" style={{fontSize:22,fontWeight:800}}>+${selected.marginSaved.toFixed(2)}</div>
                    <div style={{fontSize:11,color:C.muted}}>margin saved</div>
                  </div>
                </div>
              )}
              {selected.status==="pending" && (
                <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(240,160,75,.06)",border:"1px solid rgba(240,160,75,.18)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:20}}>{selected.offer.icon}</span>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:700,color:C.amber,marginBottom:3}}>{selected.offer.type}</div>
                      <div style={{fontSize:12.5,color:C.sub}}>{selected.offer.detail}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:18,fontWeight:800,color:C.amber}}>${selected.orderValue.toFixed(2)}</div>
                    <div style={{fontSize:11,color:C.muted}}>at risk</div>
                  </div>
                </div>
              )}
              {selected.status==="processed" && (
                <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(255,82,114,.06)",border:"1px solid rgba(255,82,114,.16)",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20}}>{selected.offer.icon}</span>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:700,color:"#FF5272",marginBottom:3}}>{selected.offer.type}</div>
                    <div style={{fontSize:12.5,color:C.sub}}>{selected.offer.detail}</div>
                  </div>
                </div>
              )}

              <div className="rv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                  <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>Returned Item</h3>
                  <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <div style={{width:46,height:46,borderRadius:12,flexShrink:0,background:C.dim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{selected.productEmoji}</div>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:600,color:C.text,marginBottom:4}}>{selected.product}</div>
                      <div style={{fontSize:12,color:C.muted,marginBottom:8}}>{selected.variant}</div>
                      <div style={{fontSize:16,fontWeight:800,color:C.coral}}>${selected.orderValue.toFixed(2)}</div>
                    </div>
                  </div>
                  <div style={{marginTop:14,padding:"9px 12px",borderRadius:9,background:C.surface,border:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:12,color:C.muted}}>Order</span>
                    <span style={{fontSize:12.5,fontWeight:600,color:C.sub}}>{selected.orderRef}</span>
                  </div>
                </div>
                <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                  <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>AI Deflection Offer</h3>
                  <div style={{fontSize:32,marginBottom:10}}>{selected.offer.icon}</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>{selected.offer.type}</div>
                  <div style={{fontSize:12.5,color:C.sub,lineHeight:1.65,marginBottom:12}}>{selected.offer.detail}</div>
                  <span className="tag" style={{
                    color:      selected.status==="deflected"?C.teal:selected.status==="pending"?C.amber:"#FF5272",
                    background: selected.status==="deflected"?"rgba(62,207,178,.10)":selected.status==="pending"?"rgba(240,160,75,.10)":"rgba(255,82,114,.10)",
                    display:"inline-flex", alignItems:"center", gap:5,
                  }}>
                    {selected.status==="deflected"
                      ? <><CheckCircle2 size={14} strokeWidth={2}/>Customer Accepted</>
                      : selected.status==="pending"
                      ? <><ClockIcon size={14} strokeWidth={2}/>Awaiting Response</>
                      : "— Not Applicable"}
                  </span>
                </div>
              </div>

              <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>AI Deflection Conversation</h3>
                {allMessages.map((msg,i)=><Bubble key={i} msg={msg} idx={i}/>)}
              </div>

              {aiDeflection && (
                <div style={{padding:18,borderRadius:14,background:"rgba(229,82,102,.06)",border:"1px solid rgba(229,82,102,.22)"}}>
                  <h3 style={{fontSize:11,fontWeight:700,color:C.coral,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:6}}>
                    <Zap size={13} strokeWidth={2}/>AI Generated Deflection Response
                  </h3>
                  <div style={{whiteSpace:"pre-wrap",fontSize:13.5,color:C.sub,lineHeight:1.75,fontFamily:"'Outfit',sans-serif"}}>
                    {aiDeflection}
                  </div>
                </div>
              )}
            </div>

            {/* Reply box */}
            <div className="rv-reply-box" style={{flexShrink:0,borderTop:`1px solid ${C.border}`,background:C.surface,padding:"10px 16px",paddingBottom:"calc(10px + env(safe-area-inset-bottom))"}}>
              {/* Compact composer card */}
              <div style={{borderRadius:16,background:C.card,border:`1px solid ${C.borderHi}`,padding:"10px 14px"}}>
                {/* Text input */}
                <textarea
                  ref={textareaRef}
                  value={chatInput}
                  onChange={e=>setChatInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleSend();}}}
                  placeholder="Type a message..."
                  rows={1}
                  style={{width:"100%",background:"transparent",border:"none",color:C.text,fontSize:14,lineHeight:1.55,padding:0,minHeight:44,maxHeight:100,overflowY:"auto",resize:"none",display:"block"}}
                />
                {/* Action bar */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:4}}>
                  {/* Left: tools */}
                  <div style={{display:"flex",alignItems:"center",gap:2}}>
                    <button className="fmt-btn-sm" onClick={handleAttach} title="Attach"
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
                      <button className="btn-primary" onClick={handleSend}
                        style={{height:36,padding:"0 16px",color:"#fff",fontWeight:600,fontSize:13,display:"flex",alignItems:"center",gap:5,borderRadius:0,cursor:"pointer"}}>
                        <Send size={14} strokeWidth={2}/>Send
                      </button>
                      <div style={{width:1,background:"rgba(255,255,255,.25)",alignSelf:"stretch",flexShrink:0}}/>
                      <button onClick={()=>{ setSchedMenuOpen(o=>!o); setSchedPickOpen(false); }}
                        style={{width:34,height:36,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:0,cursor:"pointer",background:C.surface,border:`1px solid ${C.border}`}}>
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
              {attachHint && (
                <p style={{fontSize:11,color:C.muted,marginTop:5,display:"flex",alignItems:"center",gap:4,animation:"fadeUp .3s cubic-bezier(.16,1,.3,1) both"}}>
                  <Paperclip size={12} strokeWidth={2}/>File attachment coming soon
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Override toast */}
      {overrideToast && (
        <div className={overrideToastFading?"toast-out":"toast-in"}
          style={{position:"fixed",top:20,right:20,zIndex:9999,background:C.amber,color:"#1A0A00",padding:"12px 20px",borderRadius:10,display:"flex",alignItems:"center",gap:12,fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:14,boxShadow:"0 8px 32px rgba(0,0,0,.45)",maxWidth:360}}>
          <span style={{flex:1}}>⚡ Return switched to manual override</span>
          <button onClick={()=>{ setOverrideToast(false); setOverrideToastFading(false); }}
            style={{cursor:"pointer",background:"none",border:"none",color:"#1A0A00",fontSize:17,fontWeight:700,lineHeight:1,padding:0,flexShrink:0,opacity:.65}}>✕</button>
        </div>
      )}

      {/* Schedule toast */}
      {schedToast && (
        <div className={schedToastFading?"toast-out":"toast-in"}
          style={{position:"fixed",top:20,right:20,zIndex:9999,background:C.teal,color:"#082018",padding:"12px 20px",borderRadius:10,display:"flex",alignItems:"center",gap:12,fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:14,boxShadow:"0 8px 32px rgba(0,0,0,.45)",maxWidth:380}}>
          <span style={{flex:1}}>{schedToastMsg}</span>
          <button onClick={()=>{ setSchedToast(false); setSchedToastFading(false); }}
            style={{cursor:"pointer",background:"none",border:"none",color:"#082018",fontSize:17,fontWeight:700,lineHeight:1,padding:0,flexShrink:0,opacity:.65}}>✕</button>
        </div>
      )}
    </div>
  );
}
