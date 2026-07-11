import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../../tokens";
import { useTheme } from '../../hooks/useTheme';
import { supabase } from "../../lib/supabase";
import { useStore } from "../../hooks/useStore";
import { Store, Mail, Globe, Clock, DollarSign, Briefcase, Smile, Coffee, RotateCcw, Unplug, Trash2, UserPlus, Download, Bell, Bot, ShoppingCart, Lock, Check, AlertTriangle, Users, CreditCard, Zap, Sun, Moon, Monitor, Gift, MessageSquare, GitBranch, Ticket, X, FlaskConical, Plus, Send, ChevronDown, Star, Lightbulb, Link, Activity } from "lucide-react";
import AvatarMenu from "./AvatarMenu";

// ── Comprehensive dropdown options ──
const INDUSTRY_OPTIONS = [
  "Arts & Crafts","Automotive","Baby & Kids","Beauty & Skincare",
  "Books & Stationery","Electronics & Tech","Fashion & Apparel",
  "Food & Beverage","Garden & Outdoors","Health & Wellness",
  "Home & Living","Jewellery & Accessories","Music & Instruments",
  "Office Supplies","Pet Supplies","Photography & Video",
  "Sports & Outdoors","Toys & Games","Travel & Luggage","Other",
];

const TIMEZONE_OPTIONS = [
  "UTC-12 Dateline","UTC-11 Samoa","UTC-10 Hawaii","UTC-9 Alaska",
  "UTC-8 Los Angeles","UTC-7 Denver","UTC-6 Chicago","UTC-5 New York",
  "UTC-4 Halifax","UTC-3 São Paulo","UTC-2 Mid-Atlantic","UTC-1 Azores",
  "UTC+0 London","UTC+1 Lagos / Paris","UTC+2 Johannesburg",
  "UTC+3 Nairobi / Moscow","UTC+4 Dubai","UTC+5 Karachi",
  "UTC+5:30 Mumbai","UTC+6 Dhaka","UTC+7 Bangkok",
  "UTC+8 Singapore / Beijing","UTC+9 Tokyo","UTC+10 Sydney",
  "UTC+11 Solomon Islands","UTC+12 Auckland",
];

const CURRENCY_OPTIONS = [
  "AED — UAE Dirham","AUD — Australian Dollar","BRL — Brazilian Real",
  "CAD — Canadian Dollar","CHF — Swiss Franc","CNY — Chinese Yuan",
  "CZK — Czech Koruna","DKK — Danish Krone","EUR — Euro",
  "GBP — British Pound","GHS — Ghanaian Cedi","HKD — Hong Kong Dollar",
  "HUF — Hungarian Forint","IDR — Indonesian Rupiah","INR — Indian Rupee",
  "JPY — Japanese Yen","KES — Kenyan Shilling","MXN — Mexican Peso",
  "MYR — Malaysian Ringgit","NGN — Nigerian Naira","NOK — Norwegian Krone",
  "NZD — New Zealand Dollar","PHP — Philippine Peso","PLN — Polish Zloty",
  "SAR — Saudi Riyal","SEK — Swedish Krona","SGD — Singapore Dollar",
  "THB — Thai Baht","USD — US Dollar","ZAR — South African Rand",
];

const PLANS = [
  { name:"Starter", price:"$19",  popular:false, features:["AI Support Agent","1,000 tickets/mo","Basic cart recovery","Email support"] },
  { name:"Growth",  price:"$69",  popular:true,  features:["Everything in Starter","5,000 tickets/mo","Advanced cart recovery","Return deflection","Priority support"] },
  { name:"Scale",   price:"$169", popular:false, features:["Everything in Growth","Unlimited tickets","Custom AI training","Dedicated manager","SLA guarantee"] },
];

// ── Automation delay conversion helpers (pure) ──
// Canonical minute values for the preset duration strings used by the delay
// controls. Covers every preset across Email 1/2/3 delays and Response Window.
const DURATION_PRESET_MINUTES = {
  "30 minutes": 30,
  "1 hour":     60,
  "3 hours":    180,
  "6 hours":    360,
  "12 hours":   720,
  "24 hours":   1440,
  "48 hours":   2880,
};

// Converts a duration control's current UI state to an integer number of
// minutes. When `value` is "Custom..." the paired custom number + unit are
// used (e.g. val=5, unit="Hours" → 300; unit="Minutes" → 5; unit="Days" → 7200).
// Returns null when the input can't be parsed into a positive integer.
function durationToMinutes(value, customVal, customUnit) {
  if (value === "Custom...") {
    const n = parseInt(customVal, 10);
    if (!Number.isFinite(n) || n <= 0) return null;
    if (customUnit === "Minutes") return n;
    if (customUnit === "Days") return n * 1440;
    return n * 60; // Hours (default)
  }
  if (Object.prototype.hasOwnProperty.call(DURATION_PRESET_MINUTES, value)) {
    return DURATION_PRESET_MINUTES[value];
  }
  return null;
}

// Converts integer minutes back into duration control state. When the value
// matches a preset, `value` is that preset string. Otherwise it returns a
// "Custom..." representation the existing custom-entry UI can display, choosing
// the largest clean unit (Days → Hours → Minutes).
function minutesToDuration(mins) {
  const n = Number(mins);
  const preset = Object.keys(DURATION_PRESET_MINUTES)
    .find(k => DURATION_PRESET_MINUTES[k] === n);
  if (preset) return { value: preset, val: "", unit: "Hours" };
  if (n > 0 && n % 1440 === 0) return { value: "Custom...", val: String(n / 1440), unit: "Days" };
  if (n > 0 && n % 60 === 0)   return { value: "Custom...", val: String(n / 60),   unit: "Hours" };
  return { value: "Custom...", val: String(n), unit: "Minutes" };
}

// Response Delay is stored in seconds; map to/from its preset strings.
function respDelayToSeconds(value) {
  switch (value) {
    case "30 seconds": return 30;
    case "2 minutes":  return 120;
    case "5 minutes":  return 300;
    default:           return 0; // "Instant"
  }
}
function secondsToRespDelay(secs) {
  switch (Number(secs)) {
    case 30:  return "30 seconds";
    case 120: return "2 minutes";
    case 300: return "5 minutes";
    default:  return "Instant";
  }
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes blink{0%,100%{opacity:1;}50%{opacity:.15;}}
      @keyframes savedPop{0%{opacity:0;transform:scale(.9);}60%{transform:scale(1.04);}100%{opacity:1;transform:scale(1);}}
      @keyframes spin{to{transform:rotate(360deg);}}
      @keyframes toastSlideIn{from{opacity:0;transform:translateX(70px);}to{opacity:1;transform:translateX(0);}}
      @keyframes toastFadeOut{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(70px);}}
      .sv-toast-in{animation:toastSlideIn .35s cubic-bezier(.16,1,.3,1) both;}
      .sv-toast-out{animation:toastFadeOut .3s ease forwards;}
      .fu{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both;}
      .fu1{animation-delay:.05s;}.fu2{animation-delay:.10s;}.fu3{animation-delay:.15s;}.fu4{animation-delay:.20s;}.fu5{animation-delay:.25s;}.fu6{animation-delay:.30s;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .btn-danger{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-danger:hover{background:rgba(255,82,114,.10)!important;border-color:#FF5272!important;}
      .setting-nav-item{cursor:pointer;transition:all .14s ease;border-radius:9px;}
      .setting-nav-item:hover{background:rgba(229,82,102,.07)!important;}
      .tone-card{cursor:pointer;transition:all .18s ease;border-radius:12px;}
      .tone-card:hover{transform:translateY(-2px);}
      .member-row{transition:background .14s;}
      .member-row:hover{background:rgba(255,255,255,.02)!important;}
      .plan-card{transition:transform .2s,box-shadow .2s;}
      .plan-card:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(0,0,0,.5);}
      .toggle-track{cursor:pointer;transition:background .2s ease;display:flex;align-items:center;padding:0 3px;flex-shrink:0;}
      .toggle-thumb{border-radius:50%;background:#fff;transition:transform .22s cubic-bezier(.34,1.56,.64,1);box-shadow:0 1px 4px rgba(0,0,0,.3);}
      .saved-badge{animation:savedPop .4s cubic-bezier(.34,1.56,.64,1) both;}
      .blink{animation:blink 2.4s ease infinite;}
      .section-card{border-radius:14px;background:var(--card);border:1px solid var(--border);padding:24px;margin-bottom:16px;}
      .tag{display:inline-flex;align-items:center;padding:2px 9px;border-radius:100px;font-size:10.5px;font-weight:600;white-space:nowrap;}
      .ss-option{padding:9px 14px;font-size:13.5px;cursor:pointer;transition:background .1s;}
      .ss-option:hover{background:rgba(255,255,255,.05)!important;}
      input,select,textarea{font-family:'Outfit',sans-serif;outline:none;resize:none;}
      .brightness-slider{-webkit-appearance:none;appearance:none;height:5px;border-radius:3px;outline:none;cursor:pointer;}
      .brightness-slider::-webkit-slider-thumb{-webkit-appearance:none;appearance:none;width:18px;height:18px;border-radius:50%;background:#E55266;cursor:pointer;box-shadow:0 1px 6px rgba(229,82,102,.45);transition:transform .15s;}
      .brightness-slider::-webkit-slider-thumb:hover{transform:scale(1.2);}
      .brightness-slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#E55266;cursor:pointer;border:none;box-shadow:0 1px 6px rgba(229,82,102,.45);}
      .brightness-preset-btn{cursor:pointer;transition:all .18s ease;border-radius:10px;font-family:'Outfit',sans-serif;}

      /* ── Mobile ── */
      .sv-back-btn{display:none;}
      .sv-pending-badge-mob{display:none;}
      @media(max-width:767px){
        .sv-root{overflow-x:hidden!important;height:auto!important;flex:none!important;}
        .sv-topbar{height:auto!important;padding:10px 14px!important;}
        .sv-layout{flex-direction:column!important;overflow:visible!important;}
        .sv-nav{width:100%!important;border-right:none!important;border-bottom:1px solid var(--border);overflow:visible!important;height:auto!important;padding:12px 10px!important;}
        .sv-nav-hidden{display:none!important;}
        .sv-content{padding:16px 14px!important;overflow-x:hidden!important;}
        .sv-content-hidden{display:none!important;}
        .sv-back-btn{display:flex!important;align-items:center;margin-bottom:16px;}
        .sv-two-col{grid-template-columns:1fr!important;}
        .sv-three-col{grid-template-columns:1fr!important;}
        .section-card{padding:16px!important;}
        .sv-invite-grid{grid-template-columns:1fr!important;}
        .sv-invoice-header{display:none!important;}
        .sv-invoice-row{display:flex!important;flex-direction:column!important;background:var(--card);border:1px solid var(--border);border-radius:10px;padding:12px!important;margin-bottom:8px!important;gap:8px!important;grid-template-columns:unset!important;}
        .sv-invoice-row:last-child{margin-bottom:0!important;}
        .sv-invoice-date-id{display:flex!important;justify-content:space-between!important;align-items:center!important;}
        .sv-invoice-amount-status{display:flex!important;justify-content:space-between!important;align-items:center!important;}
        .sv-invoice-dl{width:100%!important;display:block!important;}
        .sv-invoice-dl button{width:100%!important;justify-content:center!important;}
        .sv-pending-row{flex-wrap:wrap!important;gap:8px!important;}
        .sv-pending-left{width:100%!important;flex:none!important;}
        .sv-pending-right{width:100%!important;justify-content:space-between!important;}
        .sv-pending-badge-dt{display:none!important;}
        .sv-pending-badge-mob{display:inline-flex!important;align-items:center;}
      }
      .ls-mob .sv-root{flex:1!important;height:100%!important;overflow:hidden!important;}
      .ls-mob .sv-layout{flex-direction:row!important;overflow:hidden!important;flex:1!important;min-height:0!important;}
      .ls-mob .sv-nav{display:none!important;}
      .ls-mob .sv-nav-hidden{display:none!important;}
      .ls-mob .sv-content{flex:1!important;width:100%!important;height:100%!important;overflow-y:auto!important;padding-top:0!important;}
      .ls-mob .sv-content-hidden{display:block!important;}
      .ls-mob .sv-back-btn{display:none!important;}
      .ls-mob .sv-two-col{grid-template-columns:1fr 1fr!important;}
      .ls-mob .sv-three-col{grid-template-columns:1fr 1fr 1fr!important;}
      @media(min-width:768px){
        .sv-nav{display:none!important;}
        .sv-content-hidden{display:block!important;}
        .sv-back-btn{display:none!important;}
      }
    `}</style>
  );
}

// ── SHARED COMPONENTS ──
function Toggle({ on, onToggle, size=42 }) {
  return (
    <div className="toggle-track" onClick={onToggle}
      style={{width:size,height:size*.57,borderRadius:100,background:on?C.coral:C.dim,flexShrink:0}}>
      <div className="toggle-thumb" style={{width:size*.43,height:size*.43,transform:on?`translateX(${size*.43}px)`:"translateX(0)"}}/>
    </div>
  );
}

function FieldLabel({ children, hint }) {
  return (
    <div style={{marginBottom:8}}>
      <label style={{fontSize:12,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"flex",alignItems:"center"}}>{children}</label>
      {hint&&<p style={{fontSize:12,color:C.muted,marginTop:3}}>{hint}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, disabled }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
      style={{width:"100%",padding:"11px 14px",borderRadius:10,background:disabled?C.dim:C.surface,border:`1px solid ${C.border}`,color:disabled?C.muted:C.text,fontSize:14,opacity:disabled?.7:1,cursor:disabled?"not-allowed":"text"}}/>
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <div style={{borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,overflow:"hidden"}}>
      <select value={value} onChange={onChange}
        style={{width:"100%",padding:"11px 14px",background:"transparent",border:"none",color:C.text,fontSize:14,cursor:"pointer",WebkitAppearance:"none"}}>
        {options.map(o=><option key={o} value={o} style={{background:C.card}}>{o}</option>)}
      </select>
    </div>
  );
}

function SearchableSelect({ value, onChange, options }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} style={{position:"relative"}}>
      <div
        onClick={() => { setOpen(p => !p); setQuery(""); }}
        style={{padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${open?C.coral:C.border}`,color:C.text,fontSize:14,cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",userSelect:"none"}}
      >
        <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{value}</span>
        <span style={{color:C.muted,fontSize:11,flexShrink:0,marginLeft:8}}>{open?"▲":"▼"}</span>
      </div>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:10,zIndex:200,boxShadow:"0 8px 28px rgba(0,0,0,.55)",overflow:"hidden"}}>
          <div style={{padding:"8px 8px 6px",borderBottom:`1px solid ${C.border}`}}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search…"
              style={{width:"100%",padding:"7px 10px",borderRadius:7,background:C.card,border:`1px solid ${C.border}`,color:C.text,fontSize:13}}
            />
          </div>
          <div style={{maxHeight:196,overflowY:"auto"}}>
            {filtered.length === 0
              ? <div style={{padding:"12px 14px",fontSize:13,color:C.muted}}>No options found</div>
              : filtered.map(o => (
                <div
                  key={o}
                  className="ss-option"
                  onClick={() => { onChange({ target:{value:o} }); setOpen(false); setQuery(""); }}
                  style={{color:o===value?C.coral:C.sub,background:o===value?"rgba(229,82,102,.08)":"transparent",fontWeight:o===value?600:400}}
                >
                  {o}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

function SaveBar({ onSave, saved, error }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 0 4px"}}>
      <button className="btn-primary" onClick={onSave}
        style={{padding:"10px 28px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14}}>
        Save Changes
      </button>
      {saved&&(
        <div className="saved-badge" style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:9,background:"rgba(62,207,178,.10)",border:"1px solid rgba(62,207,178,.22)"}}>
          <span style={{color:C.teal,fontSize:14}}>✓</span>
          <span style={{fontSize:13.5,fontWeight:600,color:C.teal}}>Changes saved</span>
        </div>
      )}
      {error&&(
        <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:9,background:"rgba(255,82,114,.10)",border:"1px solid rgba(255,82,114,.22)"}}>
          <span style={{color:C.red,fontSize:14}}>!</span>
          <span style={{fontSize:13.5,fontWeight:600,color:C.red}}>{error}</span>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{marginBottom:20}}>
      <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text,marginBottom:4}}>{children}</h2>
      {sub&&<p style={{fontSize:13.5,color:C.muted}}>{sub}</p>}
    </div>
  );
}

// ── SECTIONS ──
function GeneralSection({ storeName, onSaveStoreName, store, userEmail }) {
  const [name,        setName]        = useState(storeName);
  const [email,       setEmail]       = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => { if (store?.shop_name) setName(store.shop_name); }, [store]);
  useEffect(() => { setEmail(userEmail || ''); }, [userEmail]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata?.full_name) {
        setDisplayName(user.user_metadata.full_name);
      }
    });
  }, []);
  const [timezone, setTimezone] = useState("UTC+0 London");
  const [currency, setCurrency] = useState("USD — US Dollar");
  const [industry, setIndustry] = useState("Fashion & Apparel");
  const [saved,    setSaved]    = useState(false);

  const save = async () => {
    await supabase.auth.updateUser({
      data: { full_name: displayName }
    });
    onSaveStoreName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle sub="Basic information about your store and account.">General Settings</SectionTitle>
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:18}}>Store Information</p>
        <div style={{marginBottom:18}}>
          <FieldLabel>Full Name</FieldLabel>
          <TextInput value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Your name"/>
        </div>
        <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
          <div><FieldLabel><Store size={16} strokeWidth={2} style={{marginRight:6}}/>Store Name</FieldLabel><TextInput value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><FieldLabel><Mail size={16} strokeWidth={2} style={{marginRight:6}}/>Account Email</FieldLabel><TextInput value={email} onChange={e=>setEmail(e.target.value)}/></div>
        </div>
        <div>
          <FieldLabel>Store URL</FieldLabel>
          <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`,opacity:.65,cursor:"not-allowed"}}>
            <div style={{padding:"11px 12px",background:C.dim,color:C.muted,display:"flex",alignItems:"center",flexShrink:0,borderRight:`1px solid ${C.border}`}}><Lock size={14} strokeWidth={2}/></div>
            <input value={store?.shop_domain?.replace('.myshopify.com', '') || ''} readOnly style={{flex:1,padding:"11px 12px",background:C.dim,border:"none",color:C.muted,fontSize:14,cursor:"not-allowed"}}/>
            <div style={{padding:"11px 14px",background:C.surface,color:C.muted,fontSize:14,borderLeft:`1px solid ${C.border}`,whiteSpace:"nowrap",display:"flex",alignItems:"center"}}>.myshopify.com</div>
          </div>
          <p style={{fontSize:12,color:C.muted,marginTop:6}}>Store URL is locked. Contact support to transfer stores.</p>
        </div>
      </div>
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:18}}>Regional Settings</p>
        <div className="sv-three-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18}}>
          <div><FieldLabel><Globe size={16} strokeWidth={2} style={{marginRight:6}}/>Industry</FieldLabel><SearchableSelect value={industry} onChange={e=>setIndustry(e.target.value)} options={INDUSTRY_OPTIONS}/></div>
          <div><FieldLabel><Clock size={16} strokeWidth={2} style={{marginRight:6}}/>Timezone</FieldLabel><SearchableSelect value={timezone} onChange={e=>setTimezone(e.target.value)} options={TIMEZONE_OPTIONS}/></div>
          <div><FieldLabel><DollarSign size={16} strokeWidth={2} style={{marginRight:6}}/>Currency</FieldLabel><SearchableSelect value={currency} onChange={e=>setCurrency(e.target.value)} options={CURRENCY_OPTIONS}/></div>
        </div>
      </div>
      <SaveBar onSave={save} saved={saved}/>
    </div>
  );
}

function AIConfigSection() {
  const [tone,           setTone]           = useState(null);
  const [lang,           setLang]           = useState("English");
  const [autoReplyLimit, setAutoReplyLimit] = useState("5");
  const [escEmail,       setEscEmail]       = useState("");
  const [sig,            setSig]            = useState("Warm regards,\nThe Support Team");
  const [conds,          setConds]          = useState({angry:true,refund:true,legal:false,repeat:true});
  const [saved,          setSaved]          = useState(false);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [brandDesc,      setBrandDesc]      = useState("");
  const [customerDesc,   setCustomerDesc]   = useState("");
  const [globalInstr,    setGlobalInstr]    = useState("");
  const [responseDetail, setResponseDetail] = useState("balanced");
  const [faqs,           setFaqs]           = useState([]);
  const [newQ,           setNewQ]           = useState("");
  const [newA,           setNewA]           = useState("");
  const [showFaqForm,    setShowFaqForm]    = useState(false);
  const [testMsg,        setTestMsg]        = useState("");
  const [testReply,      setTestReply]      = useState("");
  const [testLoading,    setTestLoading]    = useState(false);
  const [testHistory,    setTestHistory]    = useState([]);
  const [showTest,       setShowTest]       = useState(false);
  const [langMode,          setLangMode]          = useState("fixed");
  const [knowledgeUrls,     setKnowledgeUrls]     = useState([]);
  const [newUrl,            setNewUrl]            = useState("");
  const [urlError,          setUrlError]          = useState("");
  const [generatingBrand,   setGeneratingBrand]   = useState(false);
  const [generatingCustomer,setGeneratingCustomer]= useState(false);

  useEffect(() => {
    function onLoad(e) {
      const s = e.detail;
      if (s.ai_tone) setTone(s.ai_tone);
      if (s.ai_language) setLang(s.ai_language);
      if (s.ai_auto_reply_limit) setAutoReplyLimit(s.ai_auto_reply_limit);
      if (s.ai_escalation_email) setEscEmail(s.ai_escalation_email);
      if (s.ai_signature) setSig(s.ai_signature);
      if (s.brand_description) setBrandDesc(s.brand_description);
      if (s.customer_description) setCustomerDesc(s.customer_description);
      if (s.global_instructions) setGlobalInstr(s.global_instructions);
      if (s.response_detail) setResponseDetail(s.response_detail);
      if (s.faqs) { try { setFaqs(JSON.parse(s.faqs)); } catch(e) {} }
      if (s.language_mode) setLangMode(s.language_mode);
      if (s.knowledge_urls) { try { setKnowledgeUrls(JSON.parse(s.knowledge_urls)); } catch(e) {} }
      setSettingsLoaded(true);
      if (window.__solvaSettings) {
        const s2 = window.__solvaSettings;
        if (s2.ai_tone) setTone(s2.ai_tone);
        if (s2.ai_language) setLang(s2.ai_language);
        if (s2.ai_auto_reply_limit) setAutoReplyLimit(s2.ai_auto_reply_limit);
        if (s2.ai_escalation_email) setEscEmail(s2.ai_escalation_email);
        if (s2.ai_signature) setSig(s2.ai_signature);
        if (s2.brand_description) setBrandDesc(s2.brand_description);
        if (s2.customer_description) setCustomerDesc(s2.customer_description);
        if (s2.global_instructions) setGlobalInstr(s2.global_instructions);
        if (s2.response_detail) setResponseDetail(s2.response_detail);
        if (s2.faqs) { try { setFaqs(JSON.parse(s2.faqs)); } catch(e) {} }
        if (s2.language_mode) setLangMode(s2.language_mode);
        if (s2.knowledge_urls) { try { setKnowledgeUrls(JSON.parse(s2.knowledge_urls)); } catch(e) {} }
        setSettingsLoaded(true);
      }
    }
    if (!window.__solvaSettings) setSettingsLoaded(true);
    window.addEventListener('solva-settings-loaded', onLoad);
    onLoad({ detail: window.__solvaSettings || {} });
    return () => window.removeEventListener('solva-settings-loaded', onLoad);
  }, []);

  const save = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: storeData } = await supabase
        .from('stores').select('id')
        .eq('user_id', user.id).eq('is_active', true).maybeSingle();
      if (!storeData) return;
      const { data: existing } = await supabase
        .from('store_settings').select('id')
        .eq('store_id', storeData.id).maybeSingle();

      if (existing) {
        await supabase.from('store_settings').update({
          ai_tone: tone,
          ai_language: lang,
          ai_auto_reply_limit: autoReplyLimit,
          ai_escalation_email: escEmail,
          ai_signature: sig,
          brand_description: brandDesc,
          customer_description: customerDesc,
          global_instructions: globalInstr,
          response_detail: responseDetail,
          faqs: JSON.stringify(faqs),
          language_mode: langMode,
          knowledge_urls: JSON.stringify(knowledgeUrls),
          updated_at: new Date().toISOString(),
        }).eq('store_id', storeData.id);
      } else {
        await supabase.from('store_settings').insert({
          store_id: storeData.id,
          ai_tone: tone,
          ai_language: lang,
          ai_auto_reply_limit: autoReplyLimit,
          ai_escalation_email: escEmail,
          ai_signature: sig,
          brand_description: brandDesc,
          customer_description: customerDesc,
          global_instructions: globalInstr,
          response_detail: responseDetail,
          faqs: JSON.stringify(faqs),
          language_mode: langMode,
          knowledge_urls: JSON.stringify(knowledgeUrls),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save AI config error:', err);
    }
  };

  const runTest = async () => {
    if (!testMsg.trim()) return;
    setTestLoading(true);
    const userMsg = testMsg.trim();
    setTestHistory(prev => [...prev, { role: "user", text: userMsg }]);
    setTestMsg("");
    try {
      let currentStoreId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: storeData } = await supabase.from('stores').select('id').eq('user_id', user.id).eq('is_active', true).maybeSingle();
          if (storeData) currentStoreId = storeData.id;
        }
      } catch(e) {}

      const faqSection = faqs && faqs.length > 0
        ? `\n\nSTORE FAQs — when a customer asks something that matches or is similar to these, use the provided answer as your primary reference:\n${faqs.map(f => `Q: ${f.q}\nA: ${f.a}`).join('\n\n')}`
        : '';

      const brandSection = brandDesc
        ? `\n\nABOUT THIS STORE: ${brandDesc}`
        : '';

      const customerSection = customerDesc
        ? `\n\nABOUT THEIR CUSTOMERS: ${customerDesc}`
        : '';

      const instructionsSection = globalInstr
        ? `\n\nMANDATORY RULES — always follow these without exception:\n${globalInstr}`
        : '';

      const lengthInstruction = responseDetail === 'short'
        ? 'Keep responses to 1-2 sentences. Be direct.'
        : responseDetail === 'detailed'
        ? 'Give thorough, complete responses.'
        : 'Be concise but complete. 2-3 sentences is ideal.';

      const toneInstruction = (tone || 'friendly') === 'professional'
        ? 'formal and precise'
        : (tone || 'friendly') === 'casual'
        ? 'relaxed and conversational'
        : 'warm, friendly and helpful';

      const systemPrompt = `You are an AI customer support assistant for ${'your store'}. You are intelligent, helpful, and conversational.

TONE: Be ${toneInstruction}.
LENGTH: ${lengthInstruction}
FORMAT: Write in plain conversational text only. No markdown headers (##), no bullet points with **, no excessive formatting. Just natural sentences.${brandSection}${customerSection}${instructionsSection}${faqSection}

BEHAVIOR RULES:
1. For general greetings, small talk, and conversational messages — respond naturally and warmly using the brand context above.
2. For questions that match or are similar to the FAQs above — use that answer as your primary reference. You may rephrase it naturally but keep the facts accurate.
3. For questions about topics you have context for (brand, products, policies mentioned above) — answer helpfully using that context.
4. For highly specific questions you have no context for (exact shipping rates, technical specs, order-specific details) — politely acknowledge you don't have that specific information and suggest they contact support directly.
5. Never make up specific facts like prices, dates, or policies that aren't provided above.
6. Never refuse to engage in a normal conversation. Always respond helpfully.`;

      const response = await fetch("/api/ai/ticket-resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket: userMsg,
          storeName: "your store",
          brandTone: tone || "friendly",
          storeId: currentStoreId,
          systemPrompt,
        }),
      });
      const data = await response.json();
      const reply = data.response || "I couldn't generate a response. Please try again.";
      setTestReply(reply);
      setTestHistory(prev => [...prev, { role: "ai", text: reply }]);
    } catch (err) {
      setTestHistory(prev => [...prev, { role: "ai", text: "Error generating response. Check your connection." }]);
    } finally {
      setTestLoading(false);
    }
  };

  const generateDescription = async (type) => {
    const isB = type === "brand";
    if (isB) setGeneratingBrand(true);
    else setGeneratingBrand(false);
    if (!isB) setGeneratingCustomer(true);
    try {
      const response = await fetch("/api/ai/ticket-resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticket: isB
            ? `Write a 2-3 sentence brand description for a Shopify store. Tone: ${tone || "friendly"}. Keep it professional and focused on customer service excellence. Return only the description text, no labels or prefixes.`
            : `Write a 2-3 sentence description of the typical customers for a Shopify store. Tone: ${tone || "friendly"}. Focus on what they care about when contacting support. Return only the description text, no labels or prefixes.`,
          storeName: "this store",
          brandTone: tone || "friendly",
        }),
      });
      const data = await response.json();
      if (data.response) {
        if (isB) setBrandDesc(data.response.trim());
        else setCustomerDesc(data.response.trim());
      }
    } catch(err) {
      console.error("Generate error:", err);
    } finally {
      if (isB) setGeneratingBrand(false);
      else setGeneratingCustomer(false);
    }
  };

  const tones = [
    {key:"professional", icon:<Briefcase size={20} strokeWidth={2}/>, label:"Professional", desc:"Formal, precise. Best for B2B or high-ticket."},
    {key:"friendly",     icon:<Smile size={20} strokeWidth={2}/>,     label:"Friendly",     desc:"Warm and helpful. Works for most brands."},
    {key:"casual",       icon:<Coffee size={20} strokeWidth={2}/>,    label:"Casual",       desc:"Relaxed. Great for lifestyle brands."},
  ];

  const LANGUAGES = [
    "English","Spanish","French","German","Portuguese",
    "Italian","Chinese","Japanese","Dutch","Swahili",
  ];

  return (
    <div>
      <SectionTitle sub="Control how Solva AI communicates with your customers.">AI Configuration</SectionTitle>
      {!settingsLoaded && (
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0",color:C.muted,fontSize:13.5}}>
          <div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${C.dim}`,borderTopColor:C.coral,animation:"spin .7s linear infinite",flexShrink:0}}/>
          Loading your AI settings…
        </div>
      )}
      {settingsLoaded && (
        <>
          {tone === null && (
            <div className="section-card fu" style={{marginBottom:22}}>
              <div style={{height:120,borderRadius:10,background:C.dim,opacity:.5}}/>
            </div>
          )}
          {tone !== null && (
            <div className="section-card fu">
              <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Brand Tone</p>
              <div className="sv-three-col" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
                {tones.map(t=>(
                  <div key={t.key} className="tone-card" onClick={()=>setTone(t.key)}
                    style={{
                      padding:"16px 14px",
                      background: tone===t.key?"rgba(229,82,102,.08)":C.surface,
                      border:`1px solid ${tone===t.key?C.coral:C.border}`,
                      boxShadow: tone===t.key?`0 0 0 2px rgba(229,82,102,.22),0 0 22px rgba(229,82,102,.14)`:"none",
                      transition:"all .18s ease",
                    }}>
                    <div style={{marginBottom:10,color:tone===t.key?C.coral:C.sub,display:"flex"}}>{t.icon}</div>
                    <div style={{fontSize:13.5,fontWeight:700,color:tone===t.key?C.coral:C.text,marginBottom:5}}>{t.label}</div>
                    <div style={{fontSize:12,color:C.muted,lineHeight:1.55,marginBottom:10}}>{t.desc}</div>
                    <div style={{display:"flex",alignItems:"center",gap:5,opacity:tone===t.key?1:0,transition:"opacity .18s"}}>
                      <span style={{width:7,height:7,borderRadius:"50%",background:C.teal,display:"inline-block",flexShrink:0}}/>
                      <span style={{fontSize:11,color:C.teal,fontWeight:700}}>Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="section-card fu fu1">
            <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Response Settings</p>
            <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
              <div>
                <FieldLabel hint="How the AI determines which language to respond in.">Response Language</FieldLabel>
                <div style={{ display: "flex", gap: 8, marginBottom: langMode === "fixed" ? 10 : 0, marginTop: 8 }}>
                  {[
                    { key: "fixed", label: "Fixed Language", desc: "Always respond in the selected language." },
                    { key: "auto",  label: "Auto-Detect",    desc: "Match the customer's browser language." },
                  ].map(m => (
                    <div key={m.key} onClick={() => setLangMode(m.key)}
                      style={{
                        flex: 1, padding: "10px 12px", borderRadius: 9, cursor: "pointer",
                        background: langMode === m.key ? "rgba(229,82,102,.08)" : C.surface,
                        border: `1px solid ${langMode === m.key ? C.coral : C.border}`,
                        transition: "all .15s",
                      }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: langMode === m.key ? C.coral : C.text, marginBottom: 3 }}>{m.label}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{m.desc}</div>
                    </div>
                  ))}
                </div>
                {langMode === "fixed" && (
                  <SelectInput value={lang} onChange={e => setLang(e.target.value)} options={LANGUAGES} />
                )}
                {langMode === "auto" && (
                  <div style={{ padding: "10px 14px", borderRadius: 9, background: "rgba(62,207,178,.07)", border: `1px solid rgba(62,207,178,.20)`, marginTop: 0 }}>
                    <span style={{ fontSize: 12.5, color: C.teal, fontWeight: 600 }}>Auto-detect active — AI will match the customer's browser language automatically.</span>
                  </div>
                )}
              </div>
              <div>
                <FieldLabel hint="Max consecutive AI replies before escalating.">Auto-Reply Limit</FieldLabel>
                <SelectInput value={autoReplyLimit} onChange={e=>setAutoReplyLimit(e.target.value)} options={["3","5","7","10","Unlimited"]}/>
              </div>
            </div>
            <div>
              <FieldLabel hint="Appended to every AI-generated email.">Email Signature</FieldLabel>
              <textarea value={sig} onChange={e=>setSig(e.target.value)} rows={3}
                style={{width:"100%",padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:14,lineHeight:1.65}}/>
            </div>
          </div>
          <div className="section-card fu fu2">
            <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Escalation Rules</p>
            <div style={{marginBottom:18}}>
              <FieldLabel hint="Complex tickets forwarded here.">Escalation Email</FieldLabel>
              <TextInput value={escEmail} onChange={e=>setEscEmail(e.target.value)} placeholder="support@yourstore.com"/>
            </div>
            <p style={{fontSize:12,fontWeight:700,color:C.sub,marginBottom:12}}>Escalate automatically when:</p>
            {[
              {key:"angry",  label:"Customer uses angry or threatening language"},
              {key:"refund", label:"Customer requests a refund > $200"},
              {key:"legal",  label:"Legal or compliance language detected"},
              {key:"repeat", label:"Same customer contacts more than 3× in 24h"},
            ].map(c=>(
              <div key={c.key} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",borderBottom:`1px solid ${C.dim}`}}>
                <div onClick={()=>setConds(p=>({...p,[c.key]:!p[c.key]}))}
                  style={{width:18,height:18,borderRadius:5,flexShrink:0,cursor:"pointer",border:`1.5px solid ${conds[c.key]?C.coral:C.border}`,background:conds[c.key]?C.coral:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                  {conds[c.key]&&<Check size={14} strokeWidth={2} style={{color:"#fff"}}/>}
                </div>
                <span style={{fontSize:13.5,color:C.sub}}>{c.label}</span>
              </div>
            ))}
          </div>

          {/* Card A: Brand & Customer Context */}
          <div className="section-card fu fu3" style={{ marginTop: 0 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>AI Context</p>
            <p style={{ fontSize: 12.5, color: C.sub, marginBottom: 18, lineHeight: 1.6 }}>Help SOLVA AI understand your brand and customers so every response feels store-specific.</p>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <FieldLabel hint="Describe your brand, products, and values. The AI uses this in every response.">About Your Brand</FieldLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{brandDesc.length}/500</span>
                  <button
                    onClick={() => generateDescription("brand")}
                    disabled={generatingBrand}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, background: "rgba(229,82,102,.08)", border: `1px solid rgba(229,82,102,.25)`, color: C.coral, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", opacity: generatingBrand ? 0.6 : 1 }}>
                    {generatingBrand ? (
                      <><div style={{ width: 10, height: 10, borderRadius: "50%", border: `1.5px solid rgba(229,82,102,.3)`, borderTopColor: C.coral, animation: "spin .7s linear infinite" }} /> Generating…</>
                    ) : (
                      <><Zap size={11} strokeWidth={2} /> Generate</>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                value={brandDesc}
                onChange={e => setBrandDesc(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="e.g. We sell premium handcrafted leather goods. Our brand values craftsmanship, sustainability, and exceptional customer care. We serve fashion-conscious adults who appreciate quality over quantity."
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13.5, lineHeight: 1.65, fontFamily: "'Outfit',sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <FieldLabel hint="Describe your typical customer. The AI uses this to personalise its tone.">About Your Customers</FieldLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 11, color: C.muted }}>{customerDesc.length}/500</span>
                  <button
                    onClick={() => generateDescription("customer")}
                    disabled={generatingCustomer}
                    style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 7, background: "rgba(229,82,102,.08)", border: `1px solid rgba(229,82,102,.25)`, color: C.coral, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif", opacity: generatingCustomer ? 0.6 : 1 }}>
                    {generatingCustomer ? (
                      <><div style={{ width: 10, height: 10, borderRadius: "50%", border: `1.5px solid rgba(229,82,102,.3)`, borderTopColor: C.coral, animation: "spin .7s linear infinite" }} /> Generating…</>
                    ) : (
                      <><Zap size={11} strokeWidth={2} /> Generate</>
                    )}
                  </button>
                </div>
              </div>
              <textarea
                value={customerDesc}
                onChange={e => setCustomerDesc(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="e.g. Our customers are mostly women aged 25-45 who care about sustainable fashion. They tend to ask about shipping times, product materials, and return policies. They appreciate warm, personal responses."
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13.5, lineHeight: 1.65, fontFamily: "'Outfit',sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>
          </div>

          {/* Card B: Global AI Instructions + Response Detail */}
          <div className="section-card fu fu4">
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>AI Behaviour</p>
            <p style={{ fontSize: 12.5, color: C.sub, marginBottom: 18, lineHeight: 1.6 }}>Custom rules the AI follows in every conversation.</p>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <FieldLabel hint="Write rules the AI must always follow. One per line works best.">Global Instructions</FieldLabel>
                <span style={{ fontSize: 11, color: C.muted }}>{globalInstr.length}/1000</span>
              </div>
              <textarea
                value={globalInstr}
                onChange={e => setGlobalInstr(e.target.value.slice(0, 1000))}
                rows={4}
                placeholder={"e.g.\nNever mention competitor brands.\nAlways address the customer by their first name.\nOffer free shipping on orders over $100.\nEscalate any mention of legal action immediately."}
                style={{ width: "100%", padding: "11px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13.5, lineHeight: 1.65, fontFamily: "'Outfit',sans-serif", resize: "vertical", outline: "none", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <FieldLabel hint="Controls how long and detailed AI responses are.">Response Detail Level</FieldLabel>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 8 }}>
                {[
                  { key: "short",    label: "Short",    desc: "1-2 sentences. Fast and direct." },
                  { key: "balanced", label: "Balanced", desc: "Concise but complete." },
                  { key: "detailed", label: "Detailed", desc: "Thorough, full explanations." },
                ].map(opt => (
                  <div key={opt.key} onClick={() => setResponseDetail(opt.key)}
                    style={{
                      padding: "12px 14px",
                      borderRadius: 10,
                      background: responseDetail === opt.key ? "rgba(229,82,102,.08)" : C.surface,
                      border: `1px solid ${responseDetail === opt.key ? C.coral : C.border}`,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: responseDetail === opt.key ? C.coral : C.text, marginBottom: 4 }}>{opt.label}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5 }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card D: Custom FAQs */}
          <div className="section-card fu fu5">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>Custom FAQs</p>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{faqs.length} FAQ{faqs.length !== 1 ? "s" : ""}</span>
            </div>
            <p style={{ fontSize: 12.5, color: C.sub, marginBottom: 16, lineHeight: 1.6 }}>Train your AI with store-specific knowledge. These Q&A pairs are used in every AI response.</p>

            {faqs.length === 0 && !showFaqForm && (
              <div style={{ textAlign: "center", padding: "24px 0", color: C.muted }}>
                <Bot size={28} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No FAQs yet</div>
                <div style={{ fontSize: 12, marginBottom: 16 }}>Add your first FAQ to make your AI smarter about your store.</div>
              </div>
            )}

            {faqs.map((faq, i) => (
              <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>{faq.q}</div>
                    <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.55 }}>{faq.a}</div>
                  </div>
                  <button onClick={() => setFaqs(prev => prev.filter((_, idx) => idx !== i))}
                    style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", padding: 4, flexShrink: 0 }}>
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}

            {showFaqForm && (
              <div style={{ padding: "16px", borderRadius: 12, background: C.surface, border: `1px solid ${C.borderHi}`, marginBottom: 12 }}>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Question</label>
                  <input value={newQ} onChange={e => setNewQ(e.target.value)}
                    placeholder="e.g. What is your return policy?"
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 9, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 13.5, fontFamily: "'Outfit',sans-serif", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, display: "block", marginBottom: 6 }}>Answer</label>
                  <textarea value={newA} onChange={e => setNewA(e.target.value)}
                    rows={3}
                    placeholder="e.g. We accept returns within 30 days of purchase. Items must be unused and in original packaging. Contact support@yourstore.com to initiate a return."
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 9, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 13.5, fontFamily: "'Outfit',sans-serif", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => {
                    if (!newQ.trim() || !newA.trim()) return;
                    setFaqs(prev => [...prev, { q: newQ.trim(), a: newA.trim() }]);
                    setNewQ(""); setNewA(""); setShowFaqForm(false);
                  }}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, background: "linear-gradient(135deg,#E55266,#992A67,#4E0269)", color: "#fff", fontWeight: 700, fontSize: 13, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                    Save FAQ
                  </button>
                  <button onClick={() => { setShowFaqForm(false); setNewQ(""); setNewA(""); }}
                    style={{ padding: "9px 16px", borderRadius: 8, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontSize: 13, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!showFaqForm && (
              <button onClick={() => setShowFaqForm(true)}
                style={{ width: "100%", padding: "10px", borderRadius: 9, border: `1px dashed ${C.borderHi}`, background: "transparent", color: C.coral, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "'Outfit',sans-serif" }}>
                <Plus size={15} strokeWidth={2} /> Add FAQ
              </button>
            )}
          </div>

          {/* Card E: URL Knowledge Sources */}
          <div className="section-card fu">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase" }}>URL Knowledge Sources</p>
              <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{knowledgeUrls.length} URL{knowledgeUrls.length !== 1 ? "s" : ""}</span>
            </div>
            <p style={{ fontSize: 12.5, color: C.sub, marginBottom: 16, lineHeight: 1.6 }}>Add your store's FAQ page, shipping policy, return policy URLs. The AI uses these pages as knowledge sources when answering customer questions.</p>

            {knowledgeUrls.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: C.muted, marginBottom: 12 }}>
                <Link size={24} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.4 }} />
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>No URLs added yet</div>
                <div style={{ fontSize: 12 }}>Add your policy pages so the AI can reference them automatically.</div>
              </div>
            )}

            {knowledgeUrls.map((url, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: C.surface, border: `1px solid ${C.border}`, marginBottom: 8 }}>
                <Link size={14} strokeWidth={2} style={{ color: C.blue, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12.5, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
                <button onClick={() => setKnowledgeUrls(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", padding: 4, flexShrink: 0 }}>
                  <Trash2 size={14} strokeWidth={2} />
                </button>
              </div>
            ))}

            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newUrl}
                onChange={e => { setNewUrl(e.target.value); setUrlError(""); }}
                placeholder="https://yourstore.com/pages/faq"
                style={{ flex: 1, padding: "10px 14px", borderRadius: 9, background: C.surface, border: `1px solid ${urlError ? C.red : C.border}`, color: C.text, fontSize: 13, fontFamily: "'Outfit',sans-serif", outline: "none" }}
                onKeyDown={e => {
                  if (e.key === "Enter") {
                    if (!newUrl.trim().startsWith("http")) { setUrlError("Please enter a valid URL starting with http:// or https://"); return; }
                    if (knowledgeUrls.includes(newUrl.trim())) { setUrlError("This URL has already been added."); return; }
                    setKnowledgeUrls(prev => [...prev, newUrl.trim()]);
                    setNewUrl(""); setUrlError("");
                  }
                }}
              />
              <button
                onClick={() => {
                  if (!newUrl.trim().startsWith("http")) { setUrlError("Please enter a valid URL starting with http:// or https://"); return; }
                  if (knowledgeUrls.includes(newUrl.trim())) { setUrlError("This URL has already been added."); return; }
                  setKnowledgeUrls(prev => [...prev, newUrl.trim()]);
                  setNewUrl(""); setUrlError("");
                }}
                style={{ padding: "10px 18px", borderRadius: 9, background: "linear-gradient(135deg,#E55266,#992A67,#4E0269)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}>
                Add URL
              </button>
            </div>
            {urlError && <p style={{ fontSize: 12, color: C.red, marginTop: 6 }}>{urlError}</p>}

            <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 9, background: C.dim, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>
                <span style={{ fontWeight: 700, color: C.sub }}>Tip: </span>
                Add your FAQ page, shipping policy, return policy, and about page for best results. The AI will reference these when customers ask related questions.
              </p>
            </div>
          </div>

          {/* Card F: Test Your AI sandbox */}
          <div className="section-card fu fu6">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "rgba(229,82,102,.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FlaskConical size={16} strokeWidth={2} style={{ color: C.coral }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 1 }}>Test Your AI</p>
                  <p style={{ fontSize: 11.5, color: C.muted }}>Simulate a customer conversation before going live</p>
                </div>
              </div>
              <button onClick={() => { setShowTest(v => !v); setTestHistory([]); setTestReply(""); }}
                style={{ padding: "7px 16px", borderRadius: 8, background: showTest ? C.surface : "linear-gradient(135deg,#E55266,#992A67,#4E0269)", border: showTest ? `1px solid ${C.border}` : "none", color: showTest ? C.muted : "#fff", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Outfit',sans-serif" }}>
                {showTest ? "Close Test" : "Open Sandbox"}
              </button>
            </div>

            {showTest && (() => {
              const isTestMobile = window.innerWidth <= 500;
              const testPrompts = [
                "Where is my order? It's been 5 days.",
                "I want to return my item, it doesn't fit.",
                "Do you offer free shipping?",
                "I received the wrong product.",
                "Can I change my shipping address?",
                "What's your refund policy?",
              ];
              const tipCard = (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(229,82,102,.06)", border: `1px solid rgba(229,82,102,.15)`, marginTop: 4 }}>
                  <p style={{ fontSize: 11.5, color: C.sub, lineHeight: 1.6 }}>
                    <span style={{ fontWeight: 700, color: C.coral }}>Tip: </span>
                    Save your AI settings first, then test to see how your brand tone, instructions, and FAQs affect the responses.
                  </p>
                </div>
              );
              const chatMessages = (
                <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, minHeight: 0 }}>
                  {testHistory.length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px 10px", color: C.muted }}>
                      <Bot size={24} strokeWidth={1.5} style={{ marginBottom: 8, opacity: 0.4 }} />
                      <div style={{ fontSize: 12 }}>Type a test message to see how your AI responds</div>
                    </div>
                  )}
                  {testHistory.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "85%", padding: "9px 13px", borderRadius: 12,
                        borderBottomRightRadius: msg.role === "user" ? 3 : 12,
                        borderBottomLeftRadius: msg.role === "ai" ? 3 : 12,
                        background: msg.role === "user" ? "rgba(229,82,102,.12)" : C.card,
                        border: `1px solid ${msg.role === "user" ? "rgba(229,82,102,.25)" : C.border}`,
                        fontSize: 12.5, color: C.text, lineHeight: 1.6,
                      }}>
                        {msg.role === "ai" && (
                          <div style={{ fontSize: 10, fontWeight: 700, color: C.coral, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                            <Bot size={10} strokeWidth={2} /> SOLVA AI
                          </div>
                        )}
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {testLoading && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ padding: "9px 13px", borderRadius: 12, borderBottomLeftRadius: 3, background: C.card, border: `1px solid ${C.border}`, display: "flex", gap: 5, alignItems: "center" }}>
                        {[0,1,2].map(i => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: C.muted, animation: "typingDot 1.2s ease-in-out infinite", animationDelay: `${i*0.18}s` }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );

              if (isTestMobile) {
                return (
                  <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                    {/* 1. Quick Test Prompts — horizontally scrollable row */}
                    <div>
                      <p style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Quick Test Prompts</p>
                      <div style={{ display: "flex", flexDirection: "row", gap: 8, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
                        {testPrompts.map((prompt, i) => (
                          <button key={i} onClick={() => { setTestMsg(prompt); }}
                            style={{ flexShrink: 0, padding: "8px 14px", borderRadius: 20, background: C.surface, border: `1px solid ${C.border}`, color: C.sub, fontSize: 12, cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = C.coral; e.currentTarget.style.color = C.coral; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}>
                            {prompt}
                          </button>
                        ))}
                      </div>
                      {tipCard}
                    </div>

                    {/* 2. Chat area — full width */}
                    <div style={{ borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", height: 300, maxHeight: 300, flexShrink: 0 }}>
                      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", gap: 8 }}>
                        <Bot size={14} strokeWidth={2} style={{ color: C.coral }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>SOLVA AI Preview</span>
                      </div>
                      {chatMessages}
                    </div>

                    {/* 3. Input row — full width */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
                      <input
                        value={testMsg}
                        onChange={e => setTestMsg(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runTest(); } }}
                        placeholder="Type a customer message..."
                        style={{ flex: 1, padding: "11px 14px", borderRadius: 10, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 14, fontFamily: "'Outfit',sans-serif", outline: "none" }}
                      />
                      <button onClick={runTest} disabled={testLoading || !testMsg.trim()}
                        style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 10, background: "linear-gradient(135deg,#E55266,#992A67,#4E0269)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: testLoading || !testMsg.trim() ? 0.5 : 1 }}>
                        <Send size={16} strokeWidth={2} style={{ color: "#fff" }} />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

                    {/* Left — chat simulation */}
                    <div style={{ borderRadius: 12, background: C.bg, border: `1px solid ${C.border}`, display: "flex", flexDirection: "column", overflow: "hidden", height: 360, maxHeight: 360, flexShrink: 0 }}>
                      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", gap: 8 }}>
                        <Bot size={14} strokeWidth={2} style={{ color: C.coral }} />
                        <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>SOLVA AI Preview</span>
                      </div>
                      {chatMessages}
                      <div style={{ padding: "10px 12px", borderTop: `1px solid ${C.border}`, background: C.surface, display: "flex", gap: 8 }}>
                        <input
                          value={testMsg}
                          onChange={e => setTestMsg(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runTest(); } }}
                          placeholder="Type a customer message..."
                          style={{ flex: 1, padding: "9px 12px", borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "'Outfit',sans-serif", outline: "none" }}
                        />
                        <button onClick={runTest} disabled={testLoading || !testMsg.trim()}
                          style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg,#E55266,#992A67,#4E0269)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: testLoading || !testMsg.trim() ? 0.5 : 1 }}>
                          <Send size={14} strokeWidth={2} style={{ color: "#fff" }} />
                        </button>
                      </div>
                    </div>

                    {/* Right — quick test prompts */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <p style={{ fontSize: 11.5, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>Quick Test Prompts</p>
                      {testPrompts.map((prompt, i) => (
                        <button key={i} onClick={() => { setTestMsg(prompt); }}
                          style={{ padding: "10px 14px", borderRadius: 9, background: C.surface, border: `1px solid ${C.border}`, color: C.sub, fontSize: 12.5, cursor: "pointer", textAlign: "left", fontFamily: "'Outfit',sans-serif", transition: "all .14s" }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = C.coral; e.currentTarget.style.color = C.coral; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.sub; }}>
                          {prompt}
                        </button>
                      ))}
                      {tipCard}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <SaveBar onSave={save} saved={saved}/>
        </>
      )}
    </div>
  );
}

function AutomationsSection() {
  const [support,    setSupport]    = useState(true);
  const [returns,    setReturns]    = useState(true);
  const [cart,       setCart]       = useState(true);
  const [cartCode,   setCartCode]   = useState("COMEBACK10");
  const [deflectDisc,setDeflectDisc]= useState("10%");
  const [customDisc, setCustomDisc] = useState("");
  const [delay1,     setDelay1]     = useState("1 hour");
  const [delay1Val,  setDelay1Val]  = useState("");
  const [delay1Unit, setDelay1Unit] = useState("Hours");
  const [delay2,     setDelay2]     = useState("6 hours");
  const [delay2Val,  setDelay2Val]  = useState("");
  const [delay2Unit, setDelay2Unit] = useState("Hours");
  const [delay3,     setDelay3]     = useState("24 hours");
  const [delay3Val,  setDelay3Val]  = useState("");
  const [delay3Unit, setDelay3Unit] = useState("Hours");
  const [ticketLimit,  setTicketLimit]  = useState("Unlimited");
  const [respDelay,    setRespDelay]    = useState("Instant");
  const [respWindow,   setRespWindow]   = useState("24 hours");
  const [saved,        setSaved]        = useState(false);
  const [saveError,    setSaveError]    = useState(null);

  useEffect(() => {
    function onLoad(e) {
      const s = e.detail || window.__solvaSettings;
      if (!s) return;
      if (s.automation_support !== undefined) setSupport(s.automation_support);
      if (s.automation_returns !== undefined) setReturns(s.automation_returns);
      if (s.automation_cart !== undefined) setCart(s.automation_cart);
      if (s.cart_discount_code) setCartCode(s.cart_discount_code);
      // Restore automation delays from store_settings (fall back to defaults on null).
      if (s.cart_delay1_minutes != null) {
        const d = minutesToDuration(s.cart_delay1_minutes);
        setDelay1(d.value); setDelay1Val(d.val); setDelay1Unit(d.unit);
      }
      if (s.cart_delay2_minutes != null) {
        const d = minutesToDuration(s.cart_delay2_minutes);
        setDelay2(d.value); setDelay2Val(d.val); setDelay2Unit(d.unit);
      }
      if (s.cart_delay3_minutes != null) {
        const d = minutesToDuration(s.cart_delay3_minutes);
        setDelay3(d.value); setDelay3Val(d.val); setDelay3Unit(d.unit);
      }
      if (s.return_response_window_minutes != null) {
        setRespWindow(minutesToDuration(s.return_response_window_minutes).value);
      }
      if (s.ai_response_delay_seconds != null) {
        setRespDelay(secondsToRespDelay(s.ai_response_delay_seconds));
      }
    }
    window.addEventListener('solva-settings-loaded', onLoad);
    onLoad({ detail: window.__solvaSettings || {} });
    return () => window.removeEventListener('solva-settings-loaded', onLoad);
  }, []);

  const save = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: storeData } = await supabase
        .from('stores').select('id')
        .eq('user_id', user.id).eq('is_active', true).maybeSingle();
      if (!storeData) return;
      const { data: existing } = await supabase
        .from('store_settings').select('id')
        .eq('store_id', storeData.id).maybeSingle();

      // Convert the delay controls to their stored units, coalescing to the
      // column defaults if a custom entry can't be parsed.
      const delayCols = {
        cart_delay1_minutes:            durationToMinutes(delay1, delay1Val, delay1Unit) ?? 60,
        cart_delay2_minutes:            durationToMinutes(delay2, delay2Val, delay2Unit) ?? 360,
        cart_delay3_minutes:            durationToMinutes(delay3, delay3Val, delay3Unit) ?? 1440,
        return_response_window_minutes: durationToMinutes(respWindow) ?? 1440,
        ai_response_delay_seconds:      respDelayToSeconds(respDelay),
      };

      let error;
      if (existing) {
        ({ error } = await supabase.from('store_settings').update({
          automation_support: support,
          automation_returns: returns,
          automation_cart: cart,
          cart_discount_code: cartCode,
          ...delayCols,
          updated_at: new Date().toISOString(),
        }).eq('store_id', storeData.id));
      } else {
        ({ error } = await supabase.from('store_settings').insert({
          store_id: storeData.id,
          automation_support: support,
          automation_returns: returns,
          automation_cart: cart,
          cart_discount_code: cartCode,
          ...delayCols,
        }));
      }

      if (error) {
        setSaveError(error.message);
        return;
      }
      setSaveError(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save automations error:', err);
      setSaveError(err.message);
    }
  };

  const [winBack,         setWinBack]         = useState(false);
  const [winBackDays,     setWinBackDays]     = useState(60);
  const [winBackDiscType, setWinBackDiscType] = useState("percentage");
  const [winBackDiscVal,  setWinBackDiscVal]  = useState(10);
  const [winBackSaved,    setWinBackSaved]    = useState(false);
  const [winBackMessage,  setWinBackMessage]  = useState("Hey [Customer name], we miss you! Here's [Discount value] off your next order — use code [Discount code] at checkout. Valid for 7 days.");
  const winBackMsgRef = useRef(null);
  const winBackSave = () => { setWinBackSaved(true); setTimeout(()=>setWinBackSaved(false),2500); };

  const insertTag = (tag) => {
    const el = winBackMsgRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newVal = winBackMessage.slice(0, start) + tag + winBackMessage.slice(end);
    setWinBackMessage(newVal.slice(0, 300));
    setTimeout(() => { el.selectionStart = el.selectionEnd = start + tag.length; el.focus(); }, 0);
  };

  const inputStyle = {flex:1,padding:"11px 12px",borderRadius:10,background:C.card,border:`1px solid ${C.borderHi}`,color:C.text,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none"};

  const delayField = (value, setValue, cVal, setCVal, unit, setUnit, presets, label) => (
    <div>
      <FieldLabel>{label}</FieldLabel>
      {value==="Custom..." ? (
        <div style={{display:"flex",gap:7,alignItems:"center"}}>
          <input type="number" value={cVal} onChange={e=>setCVal(e.target.value)} min={1} placeholder="e.g. 8" style={inputStyle}/>
          <div style={{borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,overflow:"hidden",flexShrink:0}}>
            <select value={unit} onChange={e=>setUnit(e.target.value)}
              style={{padding:"11px 10px",background:"transparent",border:"none",color:C.text,fontSize:13,cursor:"pointer",WebkitAppearance:"none",fontFamily:"'Outfit',sans-serif"}}>
              {["Minutes","Hours","Days"].map(u=><option key={u} value={u} style={{background:C.card}}>{u}</option>)}
            </select>
          </div>
          <button onClick={()=>setValue(presets[0])} className="btn-ghost"
            style={{padding:"0 11px",height:44,borderRadius:10,border:`1px solid ${C.border}`,color:C.muted,fontSize:17,flexShrink:0}}>✕</button>
        </div>
      ) : (
        <SelectInput value={value} onChange={e=>setValue(e.target.value)} options={[...presets,"Custom..."]}/>
      )}
    </div>
  );

  const activeCount = [support, returns, cart, winBack].filter(Boolean).length;

  return (
    <div>
      <SectionTitle sub="Enable, disable, and configure each AI automation.">Automations</SectionTitle>

      {/* Section header row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <span style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase"}}>YOUR AUTOMATIONS</span>
        <span style={{fontSize:12,color:C.sub,padding:"3px 10px",borderRadius:100,background:C.dim,border:`1px solid ${C.border}`}}>
          {activeCount} of 4 active
        </span>
      </div>

      {/* 2-column automation card grid */}
      <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>

        {/* AI Support Agent */}
        <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,borderLeft:support?`3px solid ${C.coral}`:`1px solid ${C.border}`,padding:18,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
            <div style={{width:48,height:48,borderRadius:12,background:`${C.teal}22`,display:"flex",alignItems:"center",justifyContent:"center",color:C.teal,flexShrink:0}}>
              <Bot size={22} strokeWidth={2}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>AI Support Agent</div>
              <div style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}>Auto-resolve tickets, order inquiries, and FAQs</div>
            </div>
            <div style={{padding:"3px 10px",borderRadius:100,background:support?"rgba(62,207,178,.10)":C.dim,color:support?C.teal:C.muted,fontSize:11,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>
              {support?"Active":"Paused"}
            </div>
          </div>
          <div style={{overflow:"hidden",maxHeight:support?"600px":"0",opacity:support?1:0,transition:"max-height .35s cubic-bezier(.16,1,.3,1),opacity .25s ease"}}>
            <div style={{paddingTop:14,borderTop:`1px solid ${C.border}`,marginBottom:12}}>
              <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div><FieldLabel hint="How many tickets AI can handle per day.">Daily Ticket Limit</FieldLabel><SelectInput value={ticketLimit} onChange={e=>setTicketLimit(e.target.value)} options={["100","500","1,000","Unlimited"]}/></div>
                <div><FieldLabel hint="Delay before AI sends its reply.">Response Delay</FieldLabel><SelectInput value={respDelay} onChange={e=>setRespDelay(e.target.value)} options={["Instant","30 seconds","2 minutes","5 minutes"]}/></div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
            <Toggle on={support} onToggle={()=>setSupport(v=>!v)}/>
          </div>
        </div>

        {/* Return Deflection */}
        <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,borderLeft:returns?`3px solid ${C.coral}`:`1px solid ${C.border}`,padding:18,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
            <div style={{width:48,height:48,borderRadius:12,background:`${C.amber}22`,display:"flex",alignItems:"center",justifyContent:"center",color:C.amber,flexShrink:0}}>
              <RotateCcw size={22} strokeWidth={2}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Return Deflection</div>
              <div style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}>Offer smart alternatives before processing refunds</div>
            </div>
            <div style={{padding:"3px 10px",borderRadius:100,background:returns?"rgba(62,207,178,.10)":C.dim,color:returns?C.teal:C.muted,fontSize:11,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>
              {returns?"Active":"Paused"}
            </div>
          </div>
          <div style={{overflow:"hidden",maxHeight:returns?"600px":"0",opacity:returns?1:0,transition:"max-height .35s cubic-bezier(.16,1,.3,1),opacity .25s ease"}}>
            <div style={{paddingTop:14,borderTop:`1px solid ${C.border}`,marginBottom:12}}>
              <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div>
                  <FieldLabel hint="Max % discount AI can offer.">Max Deflection Discount</FieldLabel>
                  <SelectInput value={deflectDisc} onChange={e=>setDeflectDisc(e.target.value)} options={["5%","10%","15%","20%","25%","Custom..."]}/>
                  {deflectDisc==="Custom..." && (
                    <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                      <input type="number" value={customDisc} onChange={e=>setCustomDisc(e.target.value)} min={1} max={99} placeholder="e.g. 12" style={{...inputStyle,flex:1}}/>
                      <span style={{fontSize:14,fontWeight:700,color:C.sub,flexShrink:0}}>%</span>
                    </div>
                  )}
                </div>
                <div><FieldLabel hint="How long to wait before processing.">Response Window</FieldLabel><SelectInput value={respWindow} onChange={e=>setRespWindow(e.target.value)} options={["6 hours","12 hours","24 hours","48 hours"]}/></div>
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
            <Toggle on={returns} onToggle={()=>setReturns(v=>!v)}/>
          </div>
        </div>

        {/* Cart Recovery */}
        <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,borderLeft:cart?`3px solid ${C.coral}`:`1px solid ${C.border}`,padding:18,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
            <div style={{width:48,height:48,borderRadius:12,background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",color:C.blue,flexShrink:0}}>
              <ShoppingCart size={22} strokeWidth={2}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Cart Recovery</div>
              <div style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}>3-touch AI sequence to recover abandoned carts</div>
            </div>
            <div style={{padding:"3px 10px",borderRadius:100,background:cart?"rgba(62,207,178,.10)":C.dim,color:cart?C.teal:C.muted,fontSize:11,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>
              {cart?"Active":"Paused"}
            </div>
          </div>
          <div style={{overflow:"hidden",maxHeight:cart?"600px":"0",opacity:cart?1:0,transition:"max-height .35s cubic-bezier(.16,1,.3,1),opacity .25s ease"}}>
            <div style={{paddingTop:14,borderTop:`1px solid ${C.border}`,marginBottom:12}}>
              <div className="sv-three-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
                {delayField(delay1,setDelay1,delay1Val,setDelay1Val,delay1Unit,setDelay1Unit,["30 minutes","1 hour","3 hours","6 hours"],"Email 1 Delay")}
                {delayField(delay2,setDelay2,delay2Val,setDelay2Val,delay2Unit,setDelay2Unit,["3 hours","6 hours","12 hours","24 hours"],"Email 2 Delay")}
                {delayField(delay3,setDelay3,delay3Val,setDelay3Val,delay3Unit,setDelay3Unit,["12 hours","24 hours","48 hours"],"Email 3 Delay")}
              </div>
              <div><FieldLabel hint="Discount code included in Email 2.">Discount Code</FieldLabel><TextInput value={cartCode} onChange={e=>setCartCode(e.target.value)} placeholder="e.g. COMEBACK10"/></div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
            <Toggle on={cart} onToggle={()=>setCart(v=>!v)}/>
          </div>
        </div>

        {/* Win-Back Campaign */}
        <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,borderLeft:winBack?`3px solid ${C.coral}`:`1px solid ${C.border}`,padding:18,display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:13,marginBottom:12}}>
            <div style={{width:48,height:48,borderRadius:12,background:`${C.magenta}22`,display:"flex",alignItems:"center",justifyContent:"center",color:C.magenta,flexShrink:0}}>
              <Gift size={22} strokeWidth={2}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Win-Back Campaign</div>
              <div style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}>Automatically send a discount to customers who haven't ordered recently.</div>
            </div>
            <div style={{padding:"3px 10px",borderRadius:100,background:winBack?"rgba(62,207,178,.10)":C.dim,color:winBack?C.teal:C.muted,fontSize:11,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>
              {winBack?"Active":"Paused"}
            </div>
          </div>
          <div style={{overflow:"hidden",maxHeight:winBack?"600px":"0",opacity:winBack?1:0,transition:"max-height .35s cubic-bezier(.16,1,.3,1),opacity .25s ease"}}>
            <div style={{paddingTop:14,borderTop:`1px solid ${C.border}`,marginBottom:12}}>
              <div style={{marginBottom:16}}>
                <FieldLabel hint="Recommended: 60 days">Send win-back after X days of no orders</FieldLabel>
                <input type="number" value={winBackDays} onChange={e=>setWinBackDays(e.target.value)} min={1}
                  style={{width:"100%",padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
              </div>
              <div style={{marginBottom:16}}>
                <FieldLabel>Discount Type</FieldLabel>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {[{key:"percentage",label:"Percentage (%)"},{key:"fixed",label:"Fixed Amount ($)"}].map(opt=>(
                    <button key={opt.key} onClick={()=>setWinBackDiscType(opt.key)}
                      style={{padding:"9px 18px",borderRadius:100,border:`1px solid ${winBackDiscType===opt.key?C.coral:C.border}`,background:winBackDiscType===opt.key?"rgba(229,82,102,.10)":"transparent",color:winBackDiscType===opt.key?C.coral:C.sub,fontWeight:winBackDiscType===opt.key?700:400,fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .15s",outline:"none"}}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:16}}>
                <FieldLabel>{winBackDiscType==="percentage"?"Discount Value (%)":"Discount Amount ($)"}</FieldLabel>
                <input type="number" value={winBackDiscVal} onChange={e=>setWinBackDiscVal(e.target.value)} min={1}
                  style={{width:"100%",padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none"}}/>
              </div>
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <FieldLabel hint="Personalise the message sent to inactive customers.">Win-Back Message</FieldLabel>
                  <span style={{fontSize:11,color:C.muted}}>{winBackMessage.length}/300</span>
                </div>
                <textarea
                  ref={winBackMsgRef}
                  value={winBackMessage}
                  onChange={e=>setWinBackMessage(e.target.value.slice(0,300))}
                  rows={4}
                  style={{width:"100%",padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:13.5,lineHeight:1.65,fontFamily:"'Outfit',sans-serif",resize:"vertical",outline:"none",boxSizing:"border-box"}}
                />
                <div style={{marginTop:8}}>
                  <p style={{fontSize:11,fontWeight:700,color:C.muted,marginBottom:6}}>Insert variable:</p>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                    {["[Customer name]","[Discount value]","[Discount code]","[Store name]"].map(tag=>(
                      <button key={tag} onClick={()=>insertTag(tag)}
                        style={{padding:"3px 10px",borderRadius:100,background:C.dim,border:`1px solid ${C.border}`,color:C.sub,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <button className="btn-primary" onClick={winBackSave}
                  style={{padding:"10px 28px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14}}>
                  Save Changes
                </button>
                {winBackSaved&&(
                  <div className="saved-badge" style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",borderRadius:9,background:"rgba(62,207,178,.10)",border:"1px solid rgba(62,207,178,.22)"}}>
                    <span style={{color:C.teal,fontSize:14}}>✓</span>
                    <span style={{fontSize:13.5,fontWeight:600,color:C.teal}}>Changes saved</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
            <Toggle on={winBack} onToggle={()=>setWinBack(v=>!v)}/>
          </div>
        </div>

      </div>

      {/* Coming Soon — Post-Purchase Follow-up */}
      <div style={{ padding: "20px 24px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, marginBottom: 12, display: "flex", alignItems: "center", gap: 16, opacity: 0.6 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(91,173,255,.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Mail size={20} strokeWidth={2} style={{ color: C.blue }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Post-Purchase Follow-up</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "rgba(240,160,75,.12)", color: C.amber, letterSpacing: ".04em" }}>COMING SOON</span>
          </div>
          <p style={{ fontSize: 12.5, color: C.muted }}>Automatically follow up after delivery to collect reviews and encourage repeat purchases.</p>
        </div>
        <Toggle on={false} onToggle={() => {}} />
      </div>

      {/* Coming Soon — Loyalty & Rewards */}
      <div style={{ padding: "20px 24px", borderRadius: 14, background: C.card, border: `1px solid ${C.border}`, marginBottom: 12, display: "flex", alignItems: "center", gap: 16, opacity: 0.6 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(62,207,178,.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Star size={20} strokeWidth={2} style={{ color: C.teal }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Loyalty & Rewards</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "rgba(240,160,75,.12)", color: C.amber, letterSpacing: ".04em" }}>COMING SOON</span>
          </div>
          <p style={{ fontSize: 12.5, color: C.muted }}>Automatically reward repeat customers with points, discounts, and VIP perks.</p>
        </div>
        <Toggle on={false} onToggle={() => {}} />
      </div>

      {/* Request a Feature */}
      <div style={{ padding: "20px 24px", borderRadius: 14, background: "rgba(229,82,102,.04)", border: `1px dashed rgba(229,82,102,.25)`, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(229,82,102,.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Lightbulb size={18} strokeWidth={2} style={{ color: C.coral }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>Can't find what you need?</div>
            <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 14, lineHeight: 1.6 }}>Tell us what automation would make the biggest difference for your store. We read every request.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="e.g. Auto-reply to Instagram DMs about orders..."
                style={{ flex: 1, padding: "10px 14px", borderRadius: 9, background: C.surface, border: `1px solid ${C.border}`, color: C.text, fontSize: 13, fontFamily: "'Outfit',sans-serif", outline: "none" }}
                onKeyDown={e => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    window.open(`mailto:support@getsolva.app?subject=Feature Request&body=${encodeURIComponent(e.target.value.trim())}`, '_blank');
                    e.target.value = "";
                  }
                }}
              />
              <button
                onClick={e => {
                  const input = e.currentTarget.previousSibling;
                  if (input && input.value.trim()) {
                    window.open(`mailto:support@getsolva.app?subject=Feature Request&body=${encodeURIComponent(input.value.trim())}`, '_blank');
                    input.value = "";
                  }
                }}
                style={{ padding: "10px 18px", borderRadius: 9, background: "linear-gradient(135deg,#E55266,#992A67,#4E0269)", color: "#fff", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "'Outfit',sans-serif", whiteSpace: "nowrap" }}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      </div>

      <SaveBar onSave={save} saved={saved} error={saveError}/>
    </div>
  );
}

function NotificationsSection() {
  const [prefs,     setPrefs]     = useState({weeklyReport:true,escalation:true,cartRecovered:false,returnDeflected:false,newTicket:false,dailySummary:true});
  const [aiDigest,  setAiDigest]  = useState(false);
  const [saved,     setSaved]     = useState(false);

  useEffect(() => {
    function onLoad(e) {
      const s = e.detail || window.__solvaSettings;
      if (!s) return;
      setPrefs(prev => ({
        ...prev,
        weeklyReport:    s.notif_weekly_report    ?? prev.weeklyReport,
        dailySummary:    s.notif_daily_summary    ?? prev.dailySummary,
        escalation:      s.notif_escalation       ?? prev.escalation,
        cartRecovered:   s.notif_cart_recovered   ?? prev.cartRecovered,
        returnDeflected: s.notif_return_deflected ?? prev.returnDeflected,
        newTicket:       s.notif_new_ticket       ?? prev.newTicket,
      }));
    }
    window.addEventListener('solva-settings-loaded', onLoad);
    onLoad({ detail: window.__solvaSettings || {} });
    return () => window.removeEventListener('solva-settings-loaded', onLoad);
  }, []);

  const save = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: storeData } = await supabase
        .from('stores').select('id')
        .eq('user_id', user.id).eq('is_active', true).maybeSingle();
      if (!storeData) return;
      const { data: existing } = await supabase
        .from('store_settings').select('id')
        .eq('store_id', storeData.id).maybeSingle();

      if (existing) {
        await supabase.from('store_settings').update({
          notif_weekly_report:    prefs.weeklyReport,
          notif_daily_summary:    prefs.dailySummary,
          notif_escalation:       prefs.escalation,
          notif_cart_recovered:   prefs.cartRecovered,
          notif_return_deflected: prefs.returnDeflected,
          notif_new_ticket:       prefs.newTicket,
          updated_at: new Date().toISOString(),
        }).eq('store_id', storeData.id);
      } else {
        await supabase.from('store_settings').insert({
          store_id: storeData.id,
          notif_weekly_report:    prefs.weeklyReport,
          notif_daily_summary:    prefs.dailySummary,
          notif_escalation:       prefs.escalation,
          notif_cart_recovered:   prefs.cartRecovered,
          notif_return_deflected: prefs.returnDeflected,
          notif_new_ticket:       prefs.newTicket,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error('Save notifications error:', err);
    }
  };

  const notifs = [
    {key:"weeklyReport",    label:"Weekly Performance Report", desc:"Summary of tickets, revenue, and deflections every week.", rec:false},
    {key:"dailySummary",    label:"Daily Summary Email",       desc:"A brief overview of yesterday's automation activity.",     rec:false},
    {key:"escalation",      label:"Escalation Alerts",         desc:"Instant notification when AI escalates a ticket.",         rec:true },
    {key:"cartRecovered",   label:"Cart Recovery Wins",        desc:"Notify me when a cart is successfully recovered.",         rec:false},
    {key:"returnDeflected", label:"Return Deflection Wins",    desc:"Notify me when a return is deflected by AI.",              rec:false},
    {key:"newTicket",       label:"New Ticket Alerts",         desc:"Notify me for every incoming ticket.",                    rec:false},
  ];

  return (
    <div>
      <SectionTitle sub="Choose what Solva notifies you about and when.">Notifications</SectionTitle>
      <div className="section-card fu">
        {notifs.map((n,i)=>(
          <div key={n.key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 0",borderBottom:i<notifs.length-1?`1px solid ${C.dim}`:"none"}}>
            <div style={{flex:1,paddingRight:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:14,fontWeight:600,color:C.text}}>{n.label}</span>
                {n.rec&&<span className="tag" style={{color:C.coral,background:"rgba(229,82,102,.10)"}}>Recommended</span>}
              </div>
              <span style={{fontSize:12.5,color:C.muted}}>{n.desc}</span>
            </div>
            <Toggle on={prefs[n.key]} onToggle={()=>setPrefs(p=>({...p,[n.key]:!p[n.key]}))} size={38}/>
          </div>
        ))}
      </div>

      {/* Enterprise premium digest card */}
      <div style={{padding:1,borderRadius:15,background:`linear-gradient(135deg,${C.coral},${C.magenta},${C.violet})`,marginBottom:16}} className="fu fu1">
        <div style={{borderRadius:14,background:C.card,padding:22}}>
          <p style={{fontSize:11,fontWeight:700,color:C.coral,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Enterprise Alerts</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:5}}>Weekly AI Analytics Digest</div>
              <div style={{fontSize:12.5,color:C.muted,lineHeight:1.65}}>Receive an executive summary email every Monday morning with your full AI performance report — ticket trends, revenue recovered, and deflection rates.</div>
            </div>
            <Toggle on={aiDigest} onToggle={()=>setAiDigest(v=>!v)} size={38}/>
          </div>
        </div>
      </div>

      <SaveBar onSave={save} saved={saved}/>
    </div>
  );
}

function TeamSection() {
  const [members,      setMembers]      = useState([
    {name:"You (Owner)",email:"owner@yourstore.com",  role:"Admin",   avatar:"YO",color:C.coral,  you:true },
    {name:"Sarah K.",  email:"sarah.k@yourstore.com", role:"Manager", avatar:"SK",color:C.blue,   you:false},
    {name:"James O.",  email:"james.o@yourstore.com", role:"Support", avatar:"JO",color:C.teal,   you:false},
  ]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [inviteEmail,  setInviteEmail]  = useState("");
  const [inviteRole,   setInviteRole]   = useState("Support");
  const [saved,        setSaved]        = useState(false);
  const [auditLog,     setAuditLog]     = useState([]);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    const fetchAuditLog = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setAuditLoading(false); return; }
        const { data: rows } = await supabase
          .from('audit_log')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);
        setAuditLog(rows || []);
      } catch(err) {
        console.error('Audit log fetch error:', err);
      } finally {
        setAuditLoading(false);
      }
    };
    fetchAuditLog();
  }, []);

  const formatAuditTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      + ' · '
      + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const invite = () => {
    if(!inviteEmail) return;
    setPendingInvites(p=>[...p,{email:inviteEmail,role:inviteRole}]);
    setInviteEmail(""); setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  const revoke = (idx) => setPendingInvites(p=>p.filter((_,i)=>i!==idx));

  return (
    <div>
      <SectionTitle sub="Manage who has access to your Solva dashboard.">Team Members</SectionTitle>

      {/* Active Members */}
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Active Members ({members.length})</p>
        {members.map((m,i)=>(
          <div key={i} className="member-row" style={{display:"flex",alignItems:"center",gap:13,padding:"11px 10px",borderRadius:10,borderBottom:i<members.length-1?`1px solid ${C.dim}`:"none"}}>
            <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${m.color}20`,border:`1px solid ${m.color}28`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:m.color}}>{m.avatar}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:2}}>
                <span style={{fontSize:13.5,fontWeight:600,color:C.text}}>{m.name}</span>
                {m.you&&<span className="tag" style={{color:C.muted,background:C.dim,fontSize:10}}>You</span>}
              </div>
              <span style={{fontSize:12,color:C.muted}}>{m.email}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
              <span className="tag" style={{color:m.role==="Admin"?C.coral:m.role==="Manager"?C.blue:C.sub,background:m.role==="Admin"?"rgba(229,82,102,.10)":m.role==="Manager"?"rgba(91,173,255,.10)":C.dim}}>{m.role}</span>
              {!m.you&&<button className="btn-danger" onClick={()=>setMembers(ms=>ms.filter(x=>x.email!==m.email))} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.border}`,color:C.muted,fontSize:12}}>Remove</button>}
            </div>
          </div>
        ))}
      </div>

      {/* Pending Invitations */}
      {pendingInvites.length>0 && (
        <div className="section-card fu fu1">
          <p style={{fontSize:11,fontWeight:700,color:C.amber,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Pending Invitations ({pendingInvites.length})</p>
          {pendingInvites.map((p,i)=>(
            <div key={i} className="sv-pending-row" style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,padding:"11px 10px",borderRadius:10,borderBottom:i<pendingInvites.length-1?`1px solid ${C.dim}`:"none"}}>
              {/* Left: icon + column(email + Pending badge shown on desktop only) */}
              <div className="sv-pending-left" style={{display:"flex",alignItems:"center",gap:10,minWidth:0,flex:1}}>
                <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:"rgba(240,160,75,.14)",border:"1px solid rgba(240,160,75,.25)",display:"flex",alignItems:"center",justifyContent:"center",color:C.amber}}><Mail size={16} strokeWidth={2}/></div>
                <div style={{display:"flex",flexDirection:"column",gap:5,minWidth:0,flex:1}}>
                  <span style={{fontSize:13.5,fontWeight:600,color:C.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.email}</span>
                  <span className="sv-pending-badge-dt tag" style={{color:C.amber,background:"rgba(240,160,75,.10)",width:"fit-content"}}>Pending</span>
                </div>
              </div>
              {/* Right: role badge + Revoke (desktop); Pending + role + Revoke (mobile via badge-mob) */}
              <div className="sv-pending-right" style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
                <span className="sv-pending-badge-mob tag" style={{color:C.amber,background:"rgba(240,160,75,.10)"}}>Pending</span>
                <span className="tag" style={{color:p.role==="Admin"?C.coral:p.role==="Manager"?C.blue:C.sub,background:p.role==="Admin"?"rgba(229,82,102,.10)":p.role==="Manager"?"rgba(91,173,255,.10)":C.dim}}>{p.role}</span>
                <button onClick={()=>revoke(i)} style={{padding:"4px 12px",borderRadius:7,border:`1px solid ${C.border}`,background:C.surface,color:C.text,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Revoke</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Form */}
      <div className="section-card fu fu2">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Invite New Member</p>
        <div className="sv-invite-grid" style={{display:"grid",gridTemplateColumns:"1fr 160px auto",gap:12,alignItems:"end"}}>
          <div><FieldLabel>Email Address</FieldLabel><TextInput value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="colleague@yourstore.com"/></div>
          <div><FieldLabel>Role</FieldLabel><SelectInput value={inviteRole} onChange={e=>setInviteRole(e.target.value)} options={["Support","Manager","Admin"]}/></div>
          <button className="btn-primary" onClick={invite} style={{padding:"11px 22px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,whiteSpace:"nowrap",display:"flex",alignItems:"center"}}><UserPlus size={16} strokeWidth={2} style={{marginRight:6}}/>Send Invite</button>
        </div>
        {saved&&<div className="saved-badge" style={{marginTop:14,display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,background:"rgba(62,207,178,.10)",border:"1px solid rgba(62,207,178,.22)",width:"fit-content"}}><span style={{color:C.teal}}>✓</span><span style={{fontSize:13,fontWeight:600,color:C.teal}}>Invite sent successfully</span></div>}
      </div>

      {/* Activity Log */}
      <div className="section-card fu fu3" style={{marginTop:16}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:4}}>Activity Log</p>
            <p style={{fontSize:12.5,color:C.sub}}>Every settings change made to your SOLVA account.</p>
          </div>
          <span style={{fontSize:11,color:C.muted,fontWeight:600}}>{auditLog.length} entries</span>
        </div>

        {auditLoading && (
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"20px 0",color:C.muted,fontSize:13.5}}>
            <div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${C.dim}`,borderTopColor:C.coral,animation:"spin .7s linear infinite",flexShrink:0}}/>
            Loading activity log…
          </div>
        )}

        {!auditLoading && auditLog.length === 0 && (
          <div style={{textAlign:"center",padding:"28px 0",color:C.muted}}>
            <div style={{fontSize:28,marginBottom:8,opacity:0.4}}>📋</div>
            <div style={{fontSize:13,fontWeight:600,color:C.sub,marginBottom:4}}>No activity yet</div>
            <div style={{fontSize:12,color:C.muted}}>Changes you make to your settings will appear here.</div>
          </div>
        )}

        {!auditLoading && auditLog.length > 0 && (
          <div style={{display:"flex",flexDirection:"column",gap:0}}>
            {auditLog.map((entry, i) => (
              <div key={entry.id} style={{
                display:"flex",alignItems:"flex-start",gap:12,
                padding:"12px 0",
                borderBottom: i < auditLog.length - 1 ? `1px solid ${C.dim}` : "none",
              }}>
                <div style={{width:32,height:32,borderRadius:9,flexShrink:0,background:"rgba(229,82,102,.08)",border:`1px solid rgba(229,82,102,.15)`,display:"flex",alignItems:"center",justifyContent:"center",color:C.coral,marginTop:1}}>
                  <Activity size={14} strokeWidth={2}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.text}}>{entry.action}</span>
                    <span style={{fontSize:10.5,padding:"2px 8px",borderRadius:100,background:C.dim,color:C.muted,fontWeight:600,textTransform:"capitalize"}}>{entry.section}</span>
                  </div>
                  {entry.field && (
                    <div style={{fontSize:12,color:C.sub,marginBottom:3}}>
                      <span style={{color:C.muted}}>Field: </span>{entry.field}
                      {entry.old_value && entry.new_value && (
                        <span style={{color:C.muted}}> · <span style={{color:"#FF5272",textDecoration:"line-through"}}>{entry.old_value}</span> → <span style={{color:C.teal}}>{entry.new_value}</span></span>
                      )}
                    </div>
                  )}
                  <div style={{fontSize:11,color:C.muted,display:"flex",alignItems:"center",gap:4}}>
                    <Clock size={10} strokeWidth={2}/>
                    {formatAuditTime(entry.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const CURRENT_PLAN = "Growth";
const INVOICES = [
  {date:"Jun 1, 2026", id:"INV-2026-006", amount:"$599.00"},
  {date:"May 1, 2026", id:"INV-2026-005", amount:"$599.00"},
  {date:"Apr 1, 2026", id:"INV-2026-004", amount:"$599.00"},
  {date:"Mar 1, 2026", id:"INV-2026-003", amount:"$599.00"},
];

function BillingSection({ isLandscape = false, isMobile = false }) {
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [dlToast,         setDlToast]         = useState(false);
  const [dlToastFade,     setDlToastFade]     = useState(false);
  const [planInfo,        setPlanInfo]        = useState({ plan: null, plan_status: null });
  const lsMob = isLandscape && isMobile;

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('profiles').select('plan, plan_status').eq('id', user.id).single();
        if (data) setPlanInfo({ plan: data.plan, plan_status: data.plan_status });
      } catch {}
    };
    load();
  }, []);

  const usage = [
    {label:"Tickets Resolved", used:1247, limit:5000, color:C.coral},
    {label:"Cart Recoveries",  used:61,   limit:500,  color:C.blue },
    {label:"Returns Deflected",used:69,   limit:200,  color:C.amber},
  ];

  const curIdx = PLANS.findIndex(p => p.name.toLowerCase() === (planInfo.plan || '').toLowerCase());

  const handlePlanCheckout = async (variantId, planName) => {
    setCheckoutLoading(planName);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId,
          email: user.email,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        console.error('No checkout URL returned:', data);
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setCheckoutLoading(null);
    }
  };

  function handleDownload() {
    setDlToast(true); setDlToastFade(false);
    setTimeout(()=>setDlToastFade(true), 2700);
    setTimeout(()=>{ setDlToast(false); setDlToastFade(false); }, 3000);
  }

  return (
    <div>
      <SectionTitle sub="Manage your plan, usage, and payment details.">Billing & Plan</SectionTitle>

      {/* Toasts */}
      {dlToast && (
        <div className={dlToastFade?"sv-toast-out":"sv-toast-in"}
          style={{position:"fixed",top:20,right:20,zIndex:9999,background:C.blue,color:"#fff",padding:"12px 20px",borderRadius:10,display:"flex",alignItems:"center",gap:10,fontWeight:700,fontSize:13,fontFamily:"'Outfit',sans-serif",boxShadow:"0 6px 32px rgba(0,0,0,.4)"}}>
          <Download size={14} strokeWidth={2}/>Downloading invoice...
        </div>
      )}

      {/* Plan cards */}
      <div className="section-card fu">
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
          <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase"}}>Current Plan</p>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:13.5,fontWeight:700,color:C.text}}>
              {planInfo.plan ? planInfo.plan.charAt(0).toUpperCase() + planInfo.plan.slice(1) : '—'}
            </span>
            <span style={{
              display:"inline-flex",alignItems:"center",padding:"2px 9px",borderRadius:100,
              fontSize:10.5,fontWeight:600,
              color:(planInfo.plan_status==='active'||planInfo.plan_status==='on_trial')?C.teal:C.amber,
              background:(planInfo.plan_status==='active'||planInfo.plan_status==='on_trial')?'rgba(62,207,178,.10)':'rgba(240,160,75,.10)',
            }}>
              {planInfo.plan_status || 'inactive'}
            </span>
          </div>
        </div>
        <div className="sv-three-col" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {PLANS.map((p,i)=>{
            const isCurrent  = p.name.toLowerCase() === (planInfo.plan || '').toLowerCase();
            const isUpgrade  = i > curIdx;
            return (
              <div key={i} className="plan-card" style={{
                padding:"18px",borderRadius:12,position:"relative",
                background:isCurrent?"rgba(229,82,102,.07)":C.surface,
                border:`1px solid ${isCurrent?C.coral:C.border}`,
                boxShadow:isCurrent?"0 0 0 2px rgba(229,82,102,.18),0 0 28px rgba(229,82,102,.10)":"none",
              }}>
                {isCurrent && <div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",padding:"3px 12px",borderRadius:100,background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",color:"#fff",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>CURRENT PLAN</div>}
                <div style={{fontSize:13,color:C.sub,fontWeight:600,marginBottom:6}}>{p.name}</div>
                <div style={{fontSize:26,fontWeight:800,color:isCurrent?C.coral:C.text,marginBottom:14}}>{p.price}<span style={{fontSize:12,color:C.muted,fontWeight:400}}>/mo</span></div>
                {p.features.map((f,j)=><div key={j} style={{display:"flex",gap:7,marginBottom:7}}><span style={{color:C.coral,fontSize:12,marginTop:1,flexShrink:0}}>✓</span><span style={{fontSize:12.5,color:C.sub}}>{f}</span></div>)}
                <button
                  disabled={isCurrent}
                  onClick={() => {
                    if (isCurrent) return;
                    const variantIds = {
                      'Starter': '1816146',
                      'Growth':  '1816190',
                      'Scale':   '1816290',
                    };
                    handlePlanCheckout(variantIds[p.name], p.name);
                  }}
                  className={isUpgrade&&!isCurrent?"btn-primary":""}
                  style={{
                    marginTop:14,width:"100%",padding:"9px",borderRadius:9,
                    cursor:isCurrent?"default":"pointer",
                    background:isUpgrade&&!isCurrent?"linear-gradient(135deg,#E55266,#992A67,#4E0269)":"transparent",
                    border:isCurrent?`1px solid ${C.borderHi}`:!isUpgrade?`1px solid ${C.border}`:"none",
                    color:isCurrent?C.coral:!isUpgrade?C.muted:"#fff",
                    fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif",
                  }}>
                  {isCurrent
                    ? "● Current Plan"
                    : checkoutLoading === p.name
                    ? "Redirecting…"
                    : isUpgrade
                    ? "Upgrade →"
                    : "Downgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Invoice History</p>
        <div style={{borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <div className="sv-invoice-header" style={{display:"grid",gridTemplateColumns:"1fr 1.6fr 1fr 90px 110px",padding:"9px 16px",background:C.surface,borderBottom:`1px solid ${C.border}`}}>
            {["Date","Invoice ID","Amount","Status",""].map((h,i)=>(
              <span key={i} style={{fontSize:10.5,fontWeight:700,color:C.muted,letterSpacing:".06em",textTransform:"uppercase"}}>{h}</span>
            ))}
          </div>
          {INVOICES.map((inv,i)=>(
            <div key={i} className="sv-invoice-row" style={{display:"grid",gridTemplateColumns:"1fr 1.6fr 1fr 90px 110px",padding:"12px 16px",alignItems:"center",background:C.card,borderBottom:i<INVOICES.length-1?`1px solid ${C.border}`:"none"}}>
              <div className="sv-invoice-date-id" style={{display:"contents"}}>
                <span style={{fontSize:13,color:C.sub}}>{inv.date}</span>
                <span style={{fontSize:12.5,color:C.text,fontWeight:600,fontFamily:"monospace,Outfit,sans-serif"}}>{inv.id}</span>
              </div>
              <div className="sv-invoice-amount-status" style={{display:"contents"}}>
                <span style={{fontSize:13,fontWeight:700,color:C.text}}>{inv.amount}</span>
                <span style={{display:"flex",alignItems:"center",gap:5,marginLeft:8}}>
                  <span style={{width:6,height:6,borderRadius:"50%",background:C.teal,flexShrink:0}}/>
                  <span style={{fontSize:12.5,color:C.teal,fontWeight:600}}>Paid</span>
                </span>
              </div>
              <div className="sv-invoice-dl" style={{display:"contents"}}>
                <button className="btn-ghost" onClick={handleDownload}
                  style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,fontWeight:600,width:"fit-content",display:"flex",alignItems:"center"}}>
                  <Download size={14} strokeWidth={2} style={{marginRight:6}}/>PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Usage */}
      <div className="section-card fu fu2">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}>
          <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase"}}>Monthly Usage</p>
          <span style={{fontSize:12,color:C.text}}>Resets June 1, 2026</span>
        </div>
        {usage.map((u,i)=>{
          const pct = Math.round((u.used/u.limit)*100);
          return (
            <div key={i} style={{marginBottom:i<usage.length-1?16:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:13.5,color:C.sub}}>{u.label}</span>
                <span style={{fontSize:13.5,fontWeight:700,color:C.text}}>{u.used.toLocaleString()} / {u.limit.toLocaleString()}</span>
              </div>
              <div style={{height:5,borderRadius:3,background:C.dim,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:3,background:u.color,width:`${pct}%`,opacity:.8}}/>
              </div>
              <div style={{fontSize:11,color:C.muted,marginTop:5,textAlign:"right"}}>{pct}% used</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const DANGER_ACTIONS = [
  {
    title:"Reset Settings",
    desc:"Resets all Solva settings to factory defaults. Your store connection and existing data will remain intact, but all AI configurations, automations, and preferences will be permanently cleared.",
    btn:"Reset Settings",
    icon:<RotateCcw size={18} strokeWidth={2}/>,
    warn:"This will erase all your custom AI configurations and automation settings permanently.",
    confirmWord:"RESET",
  },
  {
    title:"Disconnect Shopify Store",
    desc:"Removes Solva's access to your store. All automations stop immediately. Your data is retained for 30 days before being purged.",
    btn:"Disconnect Store",
    icon:<Unplug size={18} strokeWidth={2}/>,
    warn:"All active automations will stop immediately and your store will be fully disconnected from Solva.",
    confirmWord:"DISCONNECT",
  },
  {
    title:"Delete Account",
    desc:"Permanently deletes your Solva account, all configurations, and all data. This cannot be undone under any circumstances.",
    btn:"Delete Account",
    icon:<Trash2 size={18} strokeWidth={2}/>,
    warn:"Your account, all stored data, and all configurations will be permanently deleted and cannot be recovered.",
    confirmWord:"DELETE",
  },
];

function DangerSection({ isLandscape = false, isMobile = false }) {
  const [modal,       setModal]       = useState(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [dangerLoading, setDangerLoading] = useState(false);
  const [dangerError, setDangerError] = useState("");
  const navigate = useNavigate();
  const lsMob = isLandscape && isMobile;

  function openModal(action) { setModal(action); setDeleteInput(""); }
  function closeModal()       { setModal(null);   setDeleteInput(""); }

  const confirmed = modal && deleteInput === modal.confirmWord;

  const handleConfirm = async () => {
    if (!modal || deleteInput !== modal.confirmWord) return;

    if (modal.confirmWord === "DELETE") {
      setDangerLoading(true);
      setDangerError("");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setDangerLoading(false); return; }

        const { data: storeData } = await supabase
          .from('stores').select('id')
          .eq('user_id', user.id).maybeSingle();

        if (storeData) {
          await supabase.from('tickets').delete().eq('store_id', storeData.id);
          await supabase.from('carts').delete().eq('store_id', storeData.id);
          await supabase.from('returns').delete().eq('store_id', storeData.id);
          await supabase.from('store_settings').delete().eq('store_id', storeData.id);
          await supabase.from('audit_log').delete().eq('store_id', storeData.id);
          await supabase.from('stores').delete().eq('id', storeData.id);
        }

        await supabase.from('profiles').delete().eq('id', user.id);
        await supabase.auth.signOut();
        navigate('/');
      } catch (err) {
        console.error('Delete account error:', err);
        setDangerError('Something went wrong. Please try again or contact support@getsolva.app');
        setDangerLoading(false);
      }
      return;
    }

    closeModal();
  };

  return (
    <div>
      <SectionTitle sub="Irreversible actions. Proceed with extreme caution.">Danger Zone</SectionTitle>

      {/* Destructive action modal */}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.80)",zIndex:10001,display:"flex",alignItems:"center",justifyContent:"center",padding:lsMob?8:20}}>
          <div className="fu modal-inner" style={{background:C.card,border:`1px solid ${C.red}`,borderRadius:16,padding:lsMob?18:28,maxWidth:lsMob?"92vw":440,width:"100%",maxHeight:lsMob?"88vh":undefined,overflowY:lsMob?"auto":undefined}}>
            <h3 style={{fontSize:17,fontWeight:700,color:C.red,marginBottom:10,display:"flex",alignItems:"center",gap:8}}><AlertTriangle size={20} strokeWidth={2}/>Dangerous Action</h3>
            <div style={{padding:"12px 14px",borderRadius:10,background:"rgba(255,82,114,.06)",border:"1px solid rgba(255,82,114,.20)",marginBottom:16}}>
              <p style={{fontSize:13,color:"#FF9090",lineHeight:1.65}}>{modal.warn}</p>
            </div>
            <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:20}}>{modal.desc}</p>
            <p style={{fontSize:11.5,fontWeight:700,color:C.muted,letterSpacing:".05em",textTransform:"uppercase",marginBottom:8}}>Type {modal.confirmWord} to confirm</p>
            <input
              type="text"
              value={deleteInput}
              onChange={e=>setDeleteInput(e.target.value)}
              placeholder={`Type "${modal.confirmWord}" to confirm`}
              style={{width:"100%",padding:"11px 14px",borderRadius:10,background:C.surface,
                border:`1px solid ${confirmed?C.red:C.border}`,color:C.text,fontSize:14,
                fontFamily:"'Outfit',sans-serif",outline:"none",marginBottom:16,transition:"border-color .18s"}}
            />
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-ghost" onClick={closeModal}
                style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${C.border}`,color:C.sub,fontSize:13,fontWeight:600}}>Cancel</button>
              <button
                disabled={!confirmed || dangerLoading}
                onClick={handleConfirm}
                style={{
                  padding:"10px 22px", borderRadius:10,
                  fontFamily:"'Outfit',sans-serif", fontWeight:700, fontSize:13,
                  transition:"all .18s",
                  background: confirmed && !dangerLoading ? "#FF5272" : "transparent",
                  border: `1px solid ${confirmed ? "#FF5272" : C.border}`,
                  color: confirmed && !dangerLoading ? "#fff" : C.muted,
                  cursor: confirmed && !dangerLoading ? "pointer" : "not-allowed",
                  display:"flex", alignItems:"center", gap:7,
                }}>
                {dangerLoading ? (
                  <>
                    <div style={{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite",flexShrink:0}}/>
                    Deleting…
                  </>
                ) : "Confirm"}
              </button>
            </div>
            {dangerError && (
              <p style={{fontSize:12,color:"#FF5272",marginTop:10,lineHeight:1.6}}>{dangerError}</p>
            )}
          </div>
        </div>
      )}

      {DANGER_ACTIONS.map((item,i)=>(
        <div key={i} style={{marginBottom:14,padding:22,borderRadius:14,
          background:i===2?"rgba(255,82,114,.05)":C.card,
          border:`1px solid ${i===2?"rgba(255,82,114,.22)":C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:160}}>
              <div style={{fontSize:14,fontWeight:700,color:i===2?C.red:C.text,marginBottom:6}}>{item.title}</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{item.desc}</div>
            </div>
            <button className="btn-danger" onClick={()=>openModal(item)}
              style={{padding:"9px 18px",borderRadius:9,flexShrink:0,
                border:`1px solid ${i===2?"#FF5272":C.border}`,
                color:i===2?"#FF5272":C.sub,
                fontSize:13,fontWeight:600,whiteSpace:"nowrap",
                display:"flex",alignItems:"center",gap:6}}>
              {item.icon}{item.btn}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── APPEARANCE ──
function AppearanceSection({ isMobile = false }) {
  const { theme, setTheme } = useTheme();
  const [accentColor, setAccentColor] = useState('#E55266');
  const [compactMode, setCompactMode] = useState(false);

  const ACCENTS = ['#E55266', '#992A67', '#4E0269'];

  const themeOpts = [
    { key:'system', label:'System', icon:<Monitor size={13} strokeWidth={2}/> },
    { key:'light',  label:'Light',  icon:<Sun size={13} strokeWidth={2}/> },
    { key:'dark',   label:'Dark',   icon:<Moon size={13} strokeWidth={2}/> },
  ];

  return (
    <div>
      <SectionTitle sub="Personalise how the interface looks on your screen.">Appearance</SectionTitle>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:24}}>

        {/* Row 1 — Interface Theme */}
        <div style={{display:"flex",flexDirection:isMobile?"column":"row",alignItems:isMobile?"flex-start":"center",justifyContent:"space-between",padding:"20px 0",borderBottom:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>Interface Theme</div>
            <div style={{fontSize:13,color:C.muted}}>Choose your preferred color theme or sync with your system.</div>
          </div>
          <div style={{display:"flex",gap:4,flexShrink:0,marginLeft:isMobile?0:24,marginTop:isMobile?14:0,width:isMobile?"100%":undefined}}>
            {themeOpts.map(opt => {
              const active = theme === opt.key;
              return (
                <button key={opt.key} onClick={() => setTheme(opt.key)}
                  style={{flex:isMobile?1:undefined,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"6px 16px",borderRadius:6,fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"'Outfit',sans-serif",border:active?"none":`1px solid ${C.border}`,background:active?C.coral:C.surface,color:active?"#fff":C.sub,outline:"none",transition:"all .15s"}}>
                  {opt.icon}{opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2 — Accent Color */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 0",borderBottom:`1px solid ${C.border}`}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>Accent Color</div>
            <div style={{fontSize:13,color:C.muted}}>Used for highlights, buttons, and active states.</div>
          </div>
          <div style={{display:"flex",gap:10,flexShrink:0,marginLeft:24}}>
            {ACCENTS.map(color => (
              <div key={color} onClick={() => setAccentColor(color)}
                style={{width:22,height:22,borderRadius:"50%",background:color,cursor:"pointer",outline:accentColor===color?`2px solid ${color}`:"none",outlineOffset:2,transition:"outline .15s"}}/>
            ))}
          </div>
        </div>

        {/* Row 3 — Compact Mode */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 0"}}>
          <div>
            <div style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:4}}>Compact Mode</div>
            <div style={{fontSize:13,color:C.muted}}>Reduce spacing and padding across the dashboard.</div>
          </div>
          <Toggle on={compactMode} onToggle={() => setCompactMode(v => !v)}/>
        </div>

      </div>
    </div>
  );
}

// ── WIDGET ──
const WIDGET_COLORS = [
  { value:"#E55266", label:"Coral" },
  { value:"#992A67", label:"Magenta" },
  { value:"#4E0269", label:"Violet" },
];
const EMBED_CODE = `<script src="https://cdn.getsolva.app/widget.js" data-store-id="YOUR_STORE_ID"></script>`;

function WidgetSection() {
  const [widgetEnabled,  setWidgetEnabled]  = useState(true);
  const [position,       setPosition]       = useState("bottom-right");
  const [greeting,       setGreeting]       = useState("Hi there 👋 How can we help you today?");
  const [widgetColor,    setWidgetColor]    = useState("#E55266");
  const [copied,         setCopied]         = useState(false);
  const [widgetName,     setWidgetName]     = useState("SOLVA Support");
  const [widgetSubtitle, setWidgetSubtitle] = useState("Typically replies instantly");
  const [widgetSaved,    setWidgetSaved]    = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(EMBED_CODE).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const saveWidget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: storeData } = await supabase
        .from('stores').select('id')
        .eq('user_id', user.id).eq('is_active', true).maybeSingle();
      if (!storeData) return;
      const { data: existing } = await supabase
        .from('store_settings').select('id')
        .eq('store_id', storeData.id).maybeSingle();
      if (existing) {
        await supabase.from('store_settings').update({
          widget_name: widgetName,
          widget_subtitle: widgetSubtitle,
          updated_at: new Date().toISOString(),
        }).eq('store_id', storeData.id);
      } else {
        await supabase.from('store_settings').insert({
          store_id: storeData.id,
          widget_name: widgetName,
          widget_subtitle: widgetSubtitle,
        });
      }
      setWidgetSaved(true);
      setTimeout(() => setWidgetSaved(false), 2500);
    } catch(err) {
      console.error('Save widget error:', err);
    }
  };

  return (
    <div>
      <SectionTitle sub="Manage the live chat widget on your Shopify store.">Chat Widget</SectionTitle>

      {/* Section 1 — Status */}
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Chat Widget Status</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:600,color:C.text}}>Enable Chat Widget</span>
              <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:100,background:widgetEnabled?"rgba(62,207,178,.10)":"rgba(255,82,114,.10)",border:`1px solid ${widgetEnabled?"rgba(62,207,178,.25)":"rgba(255,82,114,.25)"}`}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:widgetEnabled?C.teal:C.red,flexShrink:0}}/>
                <span style={{fontSize:11,fontWeight:700,color:widgetEnabled?C.teal:C.red}}>{widgetEnabled?"Active":"Inactive"}</span>
              </span>
            </div>
            <span style={{fontSize:12.5,color:C.muted,lineHeight:1.65}}>When enabled, a chat bubble appears on your Shopify store for customers to reach support.</span>
          </div>
          <Toggle on={widgetEnabled} onToggle={()=>setWidgetEnabled(v=>!v)}/>
        </div>
      </div>

      {/* Section 2 — Appearance */}
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Widget Appearance</p>

        {/* Widget Name */}
        <div style={{marginBottom:18}}>
          <FieldLabel hint="The name displayed at the top of your chat widget. Use your AI assistant's name or your brand name.">Widget Name</FieldLabel>
          <TextInput value={widgetName} onChange={e => setWidgetName(e.target.value)} placeholder="e.g. Aria · SOLVA Support · Help Center"/>
        </div>

        {/* Widget Subtitle */}
        <div style={{marginBottom:18}}>
          <FieldLabel hint="A short status line shown below the widget name.">Widget Subtitle</FieldLabel>
          <TextInput value={widgetSubtitle} onChange={e => setWidgetSubtitle(e.target.value)} placeholder="e.g. Typically replies instantly · We're online · Ask us anything"/>
        </div>

        {/* Position pills */}
        <div style={{marginBottom:18}}>
          <FieldLabel>Widget Position</FieldLabel>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{key:"bottom-right",label:"Bottom Right"},{key:"bottom-left",label:"Bottom Left"}].map(opt=>(
              <button key={opt.key} onClick={()=>setPosition(opt.key)}
                style={{padding:"9px 18px",borderRadius:100,border:`1px solid ${position===opt.key?C.coral:C.border}`,background:position===opt.key?"rgba(229,82,102,.10)":"transparent",color:position===opt.key?C.coral:C.sub,fontWeight:position===opt.key?700:400,fontSize:13,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .15s",outline:"none"}}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Greeting message */}
        <div style={{marginBottom:18}}>
          <FieldLabel>Greeting Message</FieldLabel>
          <TextInput value={greeting} onChange={e=>setGreeting(e.target.value)} placeholder="Hi there 👋 How can we help you today?"/>
        </div>

        {/* Color swatches */}
        <div style={{marginBottom:18}}>
          <FieldLabel>Widget Color</FieldLabel>
          <div style={{display:"flex",gap:12}}>
            {WIDGET_COLORS.map(c=>(
              <button key={c.value} onClick={()=>setWidgetColor(c.value)} title={c.label}
                style={{width:40,height:40,borderRadius:"50%",background:c.value,border:`2px solid ${widgetColor===c.value?"#fff":"transparent"}`,outline:`2px solid ${widgetColor===c.value?c.value:"transparent"}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s",flexShrink:0}}>
                {widgetColor===c.value&&<Check size={16} strokeWidth={3} style={{color:"#fff"}}/>}
              </button>
            ))}
          </div>
        </div>

        {/* Live preview */}
        <div>
          <FieldLabel>Preview</FieldLabel>
          <div style={{
            width:"100%", borderRadius:14, border:`1px solid ${C.border}`,
            overflow:"hidden", background:C.dim, position:"relative",
            display:"flex", alignItems:"flex-end",
            justifyContent: position === "bottom-right" ? "flex-end" : "flex-start",
            padding:16, minHeight:320,
          }}>
            {/* Storefront background label */}
            <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",fontSize:11,color:C.muted,opacity:0.4,pointerEvents:"none",textAlign:"center"}}>Your Shopify Store</div>

            {/* Widget panel */}
            <div style={{
              width:260, borderRadius:16, overflow:"hidden",
              boxShadow:"0 8px 32px rgba(0,0,0,.45)",
              border:`1px solid ${C.border}`,
              display:"flex", flexDirection:"column",
              position:"relative", zIndex:2,
            }}>
              {/* Widget header */}
              <div style={{background:widgetColor, padding:"14px 16px", display:"flex", alignItems:"center", gap:10}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,.20)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <MessageSquare size={18} strokeWidth={2} style={{color:"#fff"}}/>
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{fontSize:13.5, fontWeight:700, color:"#fff", marginBottom:2}}>{widgetName || "Support"}</div>
                  <div style={{fontSize:11, color:"rgba(255,255,255,.75)"}}>{widgetSubtitle || "Typically replies instantly"}</div>
                </div>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#4ade80",flexShrink:0}}/>
              </div>

              {/* Widget messages */}
              <div style={{background:C.bg, padding:"12px 12px 8px", display:"flex", flexDirection:"column", gap:8}}>
                <div style={{display:"flex", alignItems:"flex-start", gap:7}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:widgetColor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <MessageSquare size={12} strokeWidth={2} style={{color:"#fff"}}/>
                  </div>
                  <div style={{padding:"8px 11px",borderRadius:12,borderBottomLeftRadius:3,background:C.card,border:`1px solid ${C.border}`,fontSize:11.5,color:C.text,lineHeight:1.55,maxWidth:160}}>
                    {greeting || "Hi there 👋 How can we help you today?"}
                  </div>
                </div>
                <div style={{display:"flex", justifyContent:"flex-end"}}>
                  <div style={{padding:"8px 11px",borderRadius:12,borderBottomRightRadius:3,background:widgetColor,fontSize:11.5,color:"#fff",lineHeight:1.55,maxWidth:140}}>
                    Where is my order?
                  </div>
                </div>
              </div>

              {/* Widget input bar */}
              <div style={{background:C.surface, borderTop:`1px solid ${C.border}`, padding:"9px 12px", display:"flex", alignItems:"center", gap:8}}>
                <div style={{flex:1,padding:"7px 10px",borderRadius:20,background:C.card,border:`1px solid ${C.border}`,fontSize:11,color:C.muted}}>
                  Type a message…
                </div>
                <div style={{width:28,height:28,borderRadius:"50%",background:widgetColor,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Send size={12} strokeWidth={2} style={{color:"#fff"}}/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 — Embed Code */}
      <div className="section-card fu fu2">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>Embed Code</p>
        <p style={{fontSize:14,fontWeight:600,color:C.text,marginBottom:6}}>Install on your Shopify Store</p>
        <p style={{fontSize:13,color:C.muted,lineHeight:1.65,marginBottom:16}}>
          Copy this snippet and paste it into your Shopify theme's{" "}
          <code style={{fontFamily:"monospace",color:C.sub,background:C.dim,padding:"2px 6px",borderRadius:4}}>theme.liquid</code>
          {" "}file just before the closing{" "}
          <code style={{fontFamily:"monospace",color:C.sub,background:C.dim,padding:"2px 6px",borderRadius:4}}>&lt;/body&gt;</code>
          {" "}tag.
        </p>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"12px 16px",borderRadius:10,background:C.dim,border:`1px solid ${C.borderHi}`,marginBottom:12}}>
          <code style={{flex:1,fontFamily:"monospace",fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{EMBED_CODE}</code>
          <button onClick={handleCopy}
            style={{padding:"7px 14px",borderRadius:8,border:`1px solid ${copied?C.teal:C.border}`,background:copied?"rgba(62,207,178,.10)":"transparent",color:copied?C.teal:C.sub,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",transition:"all .18s",flexShrink:0,whiteSpace:"nowrap",outline:"none"}}>
            {copied?"✓ Copied!":"Copy Code"}
          </button>
        </div>
        <p style={{fontSize:12.5,color:C.muted,lineHeight:1.65}}>
          Need help installing?{" "}
          <span style={{color:C.coral,cursor:"pointer",textDecoration:"underline",textDecorationColor:"rgba(229,82,102,.4)"}}>Visit our Help Center</span>
          {" "}for a step-by-step guide.
        </p>
      </div>

      <SaveBar onSave={saveWidget} saved={widgetSaved}/>
    </div>
  );
}

// ── WORKFLOWS ──
function WorkflowsSection() {
  const [rules, setRules] = useState([
    {id:1,name:"Escalate angry customers",enabled:true,trigger:"ticket_sentiment",triggerLabel:"Customer sentiment is",triggerValue:"Angry or threatening",action:"escalate",actionLabel:"Escalate to human agent",category:"support",isTemplate:true},
    {id:2,name:"Flag high-value returns",enabled:true,trigger:"return_value",triggerLabel:"Return value is greater than",triggerValue:"$200",action:"notify",actionLabel:"Send escalation alert",category:"returns",isTemplate:true},
    {id:3,name:"VIP cart recovery boost",enabled:false,trigger:"cart_value",triggerLabel:"Abandoned cart value is greater than",triggerValue:"$500",action:"priority_recovery",actionLabel:"Send priority recovery sequence",category:"cart",isTemplate:true},
  ]);
  const [showBuilder,    setShowBuilder]    = useState(false);
  const [editingRule,    setEditingRule]    = useState(null);
  const [saved,          setSaved]          = useState(false);
  const [customTrigger,  setCustomTrigger]  = useState("");
  const [customAction,   setCustomAction]   = useState("");
  const [hoveredTpl,     setHoveredTpl]     = useState(null);
  const [tplFilter,      setTplFilter]      = useState("all");
  const [dismissedRecs,  setDismissedRecs]  = useState(false);

  const onboarding = (() => {
    try { return JSON.parse(localStorage.getItem("solva_onboarding") || "{}"); }
    catch { return {}; }
  })();

  const getRecommended = () => {
    const goal = onboarding.goal;
    const orders = onboarding.orders;
    const results = [];

    if (goal === 0 || goal === 3) {
      results.push({ name:"Escalate angry customers",    trigger:"Customer sentiment is Angry or threatening", action:"Escalate to human agent",         category:"support", color:C.red,   reason:"Recommended for your support goal" });
      results.push({ name:"Auto-close resolved tickets", trigger:"Customer replies with thank you",            action:"Mark ticket as resolved",         category:"support", color:C.teal,  reason:"Keep your queue clean automatically" });
    }
    if (goal === 1 || goal === 3) {
      results.push({ name:"Exchange nudge",              trigger:"Return reason is Wrong size",                action:"Offer exchange before refund",    category:"returns", color:C.coral, reason:"Recommended for return deflection goal" });
      results.push({ name:"High-value return alert",     trigger:"Return value exceeds $200",                  action:"Send escalation notification",    category:"returns", color:C.amber, reason:"Protect margin on big returns" });
    }
    if (goal === 2 || goal === 3) {
      results.push({ name:"VIP cart priority",           trigger:"Abandoned cart value exceeds $500",          action:"Send priority recovery sequence", category:"cart",    color:C.blue,  reason:"Recommended for cart recovery goal" });
    }
    if (orders === 2 || orders === 3) {
      results.push({ name:"Repeat abandoner discount",   trigger:"Customer abandoned cart 2+ times",           action:"Include 15% discount in email 1", category:"cart",    color:C.blue,  reason:"High order volume — convert stubborn abandoners" });
    }

    const existingNames = rules.map(r => r.name.toLowerCase());
    return results.filter(r => !existingNames.includes(r.name.toLowerCase())).slice(0, 3);
  };

  const recommended = getRecommended();

  const TEMPLATES = [
    { name:"Escalate angry customers",    trigger:"Customer sentiment is Angry",         action:"Escalate to human agent",         category:"support", color:C.red,   steps:2, desc:"Protect your brand by instantly routing hostile conversations to a human." },
    { name:"Auto-close resolved tickets", trigger:"Customer replies with thank you",     action:"Mark ticket as resolved",         category:"support", color:C.teal,  steps:2, desc:"Keep your queue clean by automatically closing tickets the customer is happy with." },
    { name:"Flag VIP customers",          trigger:"Customer total spend exceeds $1,000", action:"Tag as VIP and notify",           category:"support", color:C.amber, steps:3, desc:"Identify and prioritize your highest-value customers automatically." },
    { name:"High-value return alert",     trigger:"Return value exceeds $200",           action:"Send escalation notification",    category:"returns", color:C.amber, steps:2, desc:"Never miss a high-risk return — get notified instantly when big refunds are requested." },
    { name:"Exchange nudge",              trigger:"Return reason is Wrong size",         action:"Offer exchange before refund",    category:"returns", color:C.coral, steps:3, desc:"Save the sale by automatically offering an exchange before processing the refund." },
    { name:"VIP cart priority",           trigger:"Abandoned cart value exceeds $500",   action:"Send priority recovery sequence", category:"cart",    color:C.blue,  steps:4, desc:"High-value carts get a faster, more aggressive recovery sequence." },
    { name:"Repeat abandoner discount",   trigger:"Customer abandoned cart 2+ times",   action:"Include 15% discount in email 1", category:"cart",    color:C.blue,  steps:3, desc:"Convert stubborn abandoners with an automatic discount on their next attempt." },
  ];

  const catColor = (cat) => cat === "support" ? C.coral : cat === "returns" ? C.amber : C.blue;
  const toggleRule = (id) => setRules(prev => prev.map(r => r.id === id ? {...r, enabled: !r.enabled} : r));
  const deleteRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const addFromTemplate = (tpl) => {
    setRules(prev => [...prev, {
      id: Date.now(), name: tpl.name, enabled: true,
      trigger: tpl.name, triggerLabel: "IF", triggerValue: tpl.trigger,
      action: tpl.name, actionLabel: tpl.action,
      category: tpl.category, isTemplate: true,
    }]);
    setShowBuilder(false);
  };

  const addCustom = () => {
    if (!customTrigger || !customAction) return;
    setRules(prev => [...prev, {
      id: Date.now(), name: customTrigger, enabled: true,
      trigger: "custom", triggerLabel: "IF", triggerValue: customTrigger,
      action: "custom", actionLabel: customAction,
      category: "support", isTemplate: false,
    }]);
    setCustomTrigger(""); setCustomAction(""); setShowBuilder(false);
  };

  const activeCount  = rules.filter(r => r.enabled).length;
  const supportCount = rules.filter(r => r.category === "support").length;
  const commerceCount = rules.filter(r => r.category === "cart" || r.category === "returns").length;

  return (
    <div>
      <SectionTitle sub="Automate actions based on smart triggers. Rules run in order — drag to reprioritize.">Workflows</SectionTitle>

      {/* Stats row */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
        {[
          {icon:<Zap size={16} strokeWidth={2}/>,         value:activeCount,   label:"Active Rules",    color:C.teal },
          {icon:<Ticket size={16} strokeWidth={2}/>,       value:supportCount,  label:"Support Rules",   color:C.coral},
          {icon:<ShoppingCart size={16} strokeWidth={2}/>, value:commerceCount, label:"Commerce Rules",  color:C.blue },
        ].map((s,i) => (
          <div key={i} style={{padding:"14px 16px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,borderRadius:10,background:s.color+"14",display:"flex",alignItems:"center",justifyContent:"center",color:s.color,flexShrink:0}}>{s.icon}</div>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:s.color,fontFamily:"'Outfit',sans-serif"}}>{s.value}</div>
              <div style={{fontSize:11.5,color:C.muted}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended Workflows */}
      {recommended.length > 0 && !dismissedRecs && (
        <div style={{marginBottom:20,padding:18,borderRadius:14,background:"rgba(229,82,102,.05)",border:`1px solid rgba(229,82,102,.18)`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <Zap size={15} strokeWidth={2} style={{color:C.coral}}/>
              <span style={{fontSize:12,fontWeight:700,color:C.coral,textTransform:"uppercase",letterSpacing:".06em"}}>Recommended for You</span>
            </div>
            <button onClick={()=>setDismissedRecs(true)}
              style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",padding:4}}>
              <X size={15} strokeWidth={2}/>
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {recommended.map((rec,i) => (
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:rec.color,flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:3}}>{rec.name}</div>
                  <div style={{fontSize:11.5,color:C.muted}}>{rec.reason}</div>
                </div>
                <button onClick={()=>{
                  setRules(prev=>[...prev,{
                    id:Date.now()+i,
                    name:rec.name,
                    enabled:true,
                    trigger:rec.category,
                    triggerLabel:"IF",
                    triggerValue:rec.trigger,
                    action:rec.category,
                    actionLabel:rec.action,
                    category:rec.category,
                    isTemplate:true,
                  }]);
                  setDismissedRecs(prev=>recommended.filter((_,idx)=>idx!==i).length===0?true:prev);
                }}
                  style={{padding:"6px 14px",borderRadius:8,background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",color:"#fff",fontSize:12,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif",whiteSpace:"nowrap"}}>
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rules list header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase"}}>Active Rules</span>
        <button onClick={()=>setShowBuilder(true)}
          style={{padding:"7px 16px",borderRadius:8,background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",color:"#fff",fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>
          + Add Rule
        </button>
      </div>

      {/* Rules list */}
      {rules.length === 0 ? (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",gap:10}}>
          <GitBranch size={32} style={{color:C.muted}}/>
          <div style={{fontSize:14,fontWeight:600,color:C.muted}}>No rules yet</div>
          <div style={{fontSize:12,color:C.muted}}>Add your first rule to start automating actions</div>
        </div>
      ) : rules.map(rule => (
        <div key={rule.id} style={{padding:"16px 18px",borderRadius:12,background:C.card,border:`1px solid ${rule.enabled?C.borderHi:C.border}`,marginBottom:8,display:"flex",alignItems:"flex-start",gap:12}}>
          <div style={{width:8,height:8,borderRadius:"50%",background:catColor(rule.category),flexShrink:0,marginTop:6}}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:14,fontWeight:600,color:rule.enabled?C.text:C.muted,marginBottom:6}}>{rule.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"rgba(91,173,255,.10)",color:C.blue,fontWeight:600}}>IF</span>
              <span style={{fontSize:12,color:C.sub}}>{rule.triggerLabel} {rule.triggerValue}</span>
              <span style={{fontSize:11,padding:"3px 8px",borderRadius:6,background:"rgba(62,207,178,.10)",color:C.teal,fontWeight:600}}>THEN</span>
              <span style={{fontSize:12,color:C.sub}}>{rule.actionLabel}</span>
            </div>
            {rule.isTemplate && (
              <div style={{fontSize:10,padding:"2px 7px",borderRadius:100,background:C.dim,color:C.muted,marginTop:6,width:"fit-content"}}>Template</div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
            <Toggle on={rule.enabled} onToggle={()=>toggleRule(rule.id)}/>
            <button onClick={()=>deleteRule(rule.id)}
              style={{padding:"6px 8px",borderRadius:7,border:`1px solid ${C.border}`,background:"transparent",color:C.muted,cursor:"pointer",display:"flex",alignItems:"center"}}>
              <Trash2 size={14} strokeWidth={2}/>
            </button>
          </div>
        </div>
      ))}

      {/* Coming Soon workflows */}
      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 10 }}>Coming Soon</div>
        {[
          { name: "AI Sentiment Scoring", desc: "Automatically score every customer message by sentiment and route accordingly.", color: C.blue },
          { name: "Smart Discount Engine", desc: "Dynamically offer personalised discounts based on customer history and cart value.", color: C.teal },
        ].map((item, i) => (
          <div key={i} style={{ padding: "14px 18px", borderRadius: 12, background: C.card, border: `1px solid ${C.border}`, marginBottom: 8, display: "flex", alignItems: "center", gap: 12, opacity: 0.55 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{item.name}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100, background: "rgba(240,160,75,.12)", color: C.amber, letterSpacing: ".04em" }}>COMING SOON</span>
              </div>
              <div style={{ fontSize: 12, color: C.muted }}>{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Rule Modal */}
      {showBuilder && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.80)",zIndex:10001,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:28,maxWidth:540,width:"100%",maxHeight:"85vh",overflowY:"auto"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
              <div style={{fontSize:17,fontWeight:700,color:C.text}}>Add Workflow Rule</div>
              <button onClick={()=>{setShowBuilder(false);setEditingRule(null);}}
                style={{background:"transparent",border:"none",cursor:"pointer",color:C.muted,display:"flex",alignItems:"center",padding:4}}>
                <X size={18} strokeWidth={2}/>
              </button>
            </div>
            <div style={{fontSize:13,color:C.muted,marginBottom:20}}>Choose a template or build from scratch</div>

            {/* Template filter tabs */}
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {["All","Support","Returns","Cart"].map(tab => {
                const active = tplFilter === tab.toLowerCase();
                return (
                  <button key={tab} onClick={()=>setTplFilter(tab.toLowerCase())}
                    style={{padding:"4px 12px",borderRadius:100,fontSize:11.5,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",outline:"none",background:active?C.coral:"transparent",color:active?"#fff":C.muted,border:active?`1px solid ${C.coral}`:`1px solid ${C.border}`}}>
                    {tab}
                  </button>
                );
              })}
            </div>

            {/* Templates grid */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:24}}>
              {TEMPLATES.filter(tpl => tplFilter === "all" || tpl.category === tplFilter).map((tpl,i) => (
                <div key={i} onClick={()=>addFromTemplate(tpl)}
                  onMouseEnter={()=>setHoveredTpl(i)} onMouseLeave={()=>setHoveredTpl(null)}
                  style={{padding:14,borderRadius:12,background:C.surface,border:`1px solid ${hoveredTpl===i?tpl.color+"60":C.border}`,cursor:"pointer",transition:"all .15s"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:tpl.color}}/>
                    <span style={{fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:100,background:tpl.color+"18",color:tpl.color}}>{tpl.steps} steps</span>
                  </div>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginTop:8,marginBottom:4}}>{tpl.name}</div>
                  <div style={{fontSize:11.5,color:C.muted,lineHeight:1.5,marginBottom:10}}>{tpl.desc}</div>
                  <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:2}}>
                    <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:"rgba(91,173,255,.10)",color:C.blue,fontWeight:700}}>IF</span>
                    <span style={{fontSize:11,color:C.sub,marginLeft:4}}>{tpl.trigger}</span>
                    <span style={{color:C.muted,margin:"0 4px"}}>→</span>
                    <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:"rgba(62,207,178,.10)",color:C.teal,fontWeight:700}}>THEN</span>
                    <span style={{fontSize:11,color:tpl.color,marginLeft:4}}>{tpl.action}</span>
                  </div>
                  <div style={{fontSize:10,padding:"2px 8px",borderRadius:100,background:catColor(tpl.category)+"14",color:catColor(tpl.category),fontWeight:600,marginTop:8,width:"fit-content",textTransform:"capitalize"}}>{tpl.category}</div>
                </div>
              ))}
            </div>

            {/* Custom rule */}
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:".06em",marginBottom:10}}>Custom Rule</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <input value={customTrigger} onChange={e=>setCustomTrigger(e.target.value)}
                placeholder="e.g. Customer mentions refund"
                style={{padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
              <input value={customAction} onChange={e=>setCustomAction(e.target.value)}
                placeholder="e.g. Escalate to human"
                style={{padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontFamily:"'Outfit',sans-serif",outline:"none",width:"100%",boxSizing:"border-box"}}/>
            </div>
            <button className="btn-primary" onClick={addCustom}
              style={{width:"100%",padding:"11px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14}}>
              Create Rule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN EXPORT ──
const SECTIONS = [
  {key:"general",       label:"General",       icon:<Store size={15} strokeWidth={2}/>},
  {key:"ai",            label:"AI Config",     icon:<Bot size={16} strokeWidth={2}/>},
  {key:"automations",   label:"Automations",   icon:<Zap size={16} strokeWidth={2}/>},
  {key:"workflows",     label:"Workflows",     icon:<GitBranch size={16} strokeWidth={2}/>},
  {key:"notifications", label:"Notifications", icon:<Bell size={15} strokeWidth={2}/>},
  {key:"team",          label:"Team",          icon:<Users size={16} strokeWidth={2}/>},
  {key:"billing",       label:"Billing",       icon:<CreditCard size={16} strokeWidth={2}/>},
  {key:"appearance",    label:"Appearance",    icon:<Sun size={15} strokeWidth={2}/>},
  {key:"widget",        label:"Widget",        icon:<MessageSquare size={15} strokeWidth={2}/>},
  {key:"danger",        label:"Danger Zone",   icon:<AlertTriangle size={16} strokeWidth={2}/>},
];

export default function SettingsView({ isLandscape, isMobile }) {
  const navigate                          = useNavigate();
  const { tab }                           = useParams();
  const section                           = tab || "general";
  const mobilePanel                       = tab ? "content" : "menu";
  const { store }               = useStore();
  const [storeName,   setStoreName]   = useState('');
  const [userEmail,   setUserEmail]   = useState('');
  const [lsNavOpen,   setLsNavOpen]   = useState(false);
  const [settingsId,  setSettingsId]  = useState(null);

  useEffect(() => {
    if (store) setStoreName(store.shop_name || store.shop_domain || '');
  }, [store]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserEmail(session?.user?.email || '');
    });
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: storeData } = await supabase
          .from('stores').select('id')
          .eq('user_id', user.id).eq('is_active', true).maybeSingle();
        if (!storeData) return;
        const { data: settings } = await supabase
          .from('store_settings').select('*')
          .eq('store_id', storeData.id).maybeSingle();
        if (settings) {
          setSettingsId(settings.id);
          window.__solvaSettings = settings;
          window.dispatchEvent(new CustomEvent('solva-settings-loaded', { detail: settings }));
        }
      } catch (err) {
        console.error('Load settings error:', err);
      }
    };
    loadSettings();
  }, []);

  const lsMob = isLandscape && isMobile;
  const currentSection = SECTIONS.find(s => s.key === section) || SECTIONS[0];

  function handleNavClick(key) {
    navigate("/dashboard/settings/" + key);
    setLsNavOpen(false);
  }

  return (
    <div className="sv-root" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",overflowX:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Landscape settings sub-nav drawer */}
      {lsMob && lsNavOpen && (
        <>
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.65)",zIndex:9998}} onClick={()=>setLsNavOpen(false)}/>
          <div style={{position:"fixed",top:0,left:0,height:"100dvh",width:220,background:C.surface,borderRight:`1px solid ${C.border}`,zIndex:10000,display:"flex",flexDirection:"column",padding:"16px 0",overflowY:"auto"}}>
            <div style={{padding:"0 14px 12px",marginBottom:6,borderBottom:`1px solid ${C.border}`}}>
              <div style={{fontSize:12.5,fontWeight:700,color:C.text,marginBottom:1,display:"flex",alignItems:"center",gap:5}}><Store size={13} strokeWidth={2}/>{storeName}</div>
              <div style={{fontSize:11,color:C.muted}}>Settings</div>
            </div>
            <nav style={{flex:1,padding:"0 8px"}}>
              {SECTIONS.map(s=>(
                <div key={s.key} onClick={()=>handleNavClick(s.key)}
                  style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",borderRadius:9,cursor:"pointer",marginBottom:2,
                    background:section===s.key?"rgba(229,82,102,.09)":"transparent",
                    color:section===s.key?C.coral:s.key==="danger"?"#FF5272":C.sub,
                    fontSize:13,fontWeight:section===s.key?600:400}}>
                  <span style={{fontSize:14,display:"inline-flex",alignItems:"center"}}>{s.icon}</span>
                  {s.label}
                </div>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Top bar */}
      <div className="sv-topbar" style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Settings</h1>
          <p style={{fontSize:11.5,color:C.muted}}>{storeName} · Manage your store, AI, and account</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:8,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.22)"}}>
            <div className="blink" style={{width:6,height:6,borderRadius:"50%",background:C.coral}}/>
            <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".04em"}}>SOLVA LIVE</span>
          </div>
          <AvatarMenu />
        </div>
      </div>

      {/* Content */}
      <div className="sv-layout" style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* Settings nav */}
        <div
          className={`sv-nav${mobilePanel==="content"?" sv-nav-hidden":""}`}
          style={{width:200,flexShrink:0,borderRight:`1px solid ${C.border}`,background:C.surface,padding:"16px 10px",overflowY:"auto"}}
        >
          {/* Store name in nav header */}
          <div style={{padding:"4px 10px 14px",marginBottom:8,borderBottom:`1px solid ${C.border}`}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2,display:"flex",alignItems:"center",gap:6}}><Store size={14} strokeWidth={2}/>{storeName}</div>
            <div style={{fontSize:11,color:C.muted}}>Manage your settings</div>
          </div>
          {SECTIONS.map(s=>(
            <div key={s.key} className="setting-nav-item" onClick={()=>handleNavClick(s.key)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:2,background:section===s.key?"rgba(229,82,102,.09)":"transparent",color:section===s.key?C.coral:s.key==="danger"?"#FF5272":C.sub,fontSize:13.5,fontWeight:section===s.key?600:400}}>
              <span style={{fontSize:15,display:"inline-flex",alignItems:"center"}}>{s.icon}</span>{s.label}
            </div>
          ))}
        </div>

        {/* Section content */}
        <div
          className={`sv-content${mobilePanel==="menu"?" sv-content-hidden":""}`}
          style={{flex:1,overflowY:"auto",padding:"24px 28px",background:C.bg}}
        >
          {/* Landscape breadcrumb / nav trigger */}
          {lsMob && (
            <div onClick={()=>setLsNavOpen(true)}
              style={{position:"sticky",top:0,zIndex:10,display:"flex",alignItems:"center",gap:10,margin:"0 -28px 16px -28px",padding:"9px 28px",background:C.bg,borderBottom:`1px solid ${C.border}`,cursor:"pointer"}}>
              <span style={{fontSize:13,display:"inline-flex",alignItems:"center",color:C.coral}}>{currentSection.icon}</span>
              <span style={{fontSize:13.5,fontWeight:600,color:C.text,flex:1}}>{currentSection.label}</span>
              <span style={{fontSize:11.5,color:C.muted,fontWeight:600}}>≡ Menu</span>
            </div>
          )}
          {/* Back button — portrait mobile only */}
          <button
            className="sv-back-btn btn-ghost"
            onClick={()=>navigate("/dashboard/settings")}
            style={{gap:5,color:C.coral,fontSize:13,fontWeight:600,padding:"8px 16px",background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:8,marginBottom:16}}
          >
            ← Back to Settings Menu
          </button>

          {section==="general"       && <GeneralSection storeName={storeName} onSaveStoreName={setStoreName} store={store} userEmail={userEmail}/>}
          {section==="ai"            && <AIConfigSection/>}
          {section==="automations"   && <AutomationsSection/>}
          {section==="workflows"     && <WorkflowsSection/>}
          {section==="notifications" && <NotificationsSection/>}
          {section==="team"          && <TeamSection/>}
          {section==="billing"       && <BillingSection isLandscape={isLandscape} isMobile={isMobile}/>}
          {section==="appearance"    && <AppearanceSection isMobile={isMobile}/>}
          {section==="widget"        && <WidgetSection/>}
          {section==="danger"        && <DangerSection isLandscape={isLandscape} isMobile={isMobile}/>}
        </div>
      </div>
    </div>
  );
}
