import { useState, useRef, useEffect } from "react";
import { C } from "../../tokens";

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
  { name:"Starter", price:"$299",   popular:false, features:["AI Support Agent","1,000 tickets/mo","Basic cart recovery","Email support"] },
  { name:"Growth",  price:"$599",   popular:true,  features:["Everything in Starter","5,000 tickets/mo","Advanced cart recovery","Return deflection","Priority support"] },
  { name:"Scale",   price:"$1,199", popular:false, features:["Everything in Growth","Unlimited tickets","Custom AI training","Dedicated manager","SLA guarantee"] },
];

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes blink{0%,100%{opacity:1;}50%{opacity:.15;}}
      @keyframes savedPop{0%{opacity:0;transform:scale(.9);}60%{transform:scale(1.04);}100%{opacity:1;transform:scale(1);}}
      @keyframes toastSlideIn{from{opacity:0;transform:translateX(70px);}to{opacity:1;transform:translateX(0);}}
      @keyframes toastFadeOut{from{opacity:1;transform:translateX(0);}to{opacity:0;transform:translateX(70px);}}
      .sv-toast-in{animation:toastSlideIn .35s cubic-bezier(.16,1,.3,1) both;}
      .sv-toast-out{animation:toastFadeOut .3s ease forwards;}
      .fu{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both;}
      .fu1{animation-delay:.05s;}.fu2{animation-delay:.10s;}.fu3{animation-delay:.15s;}.fu4{animation-delay:.20s;}
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
      .section-card{border-radius:14px;background:#110014;border:1px solid #200026;padding:24px;margin-bottom:16px;}
      .tag{display:inline-flex;align-items:center;padding:2px 9px;border-radius:100px;font-size:10.5px;font-weight:600;white-space:nowrap;}
      .ss-option{padding:9px 14px;font-size:13.5px;cursor:pointer;transition:background .1s;}
      .ss-option:hover{background:rgba(255,255,255,.05)!important;}
      input,select,textarea{font-family:'Outfit',sans-serif;outline:none;resize:none;}

      /* ── Mobile ── */
      .sv-back-btn{display:none;}
      @media(max-width:767px){
        .sv-root{overflow-x:hidden!important;height:auto!important;flex:none!important;}
        .sv-topbar{height:auto!important;padding:10px 14px!important;}
        .sv-layout{flex-direction:column!important;overflow:visible!important;}
        .sv-nav{width:100%!important;border-right:none!important;border-bottom:1px solid #200026;overflow:visible!important;height:auto!important;padding:12px 10px!important;}
        .sv-nav-hidden{display:none!important;}
        .sv-content{padding:16px 14px!important;overflow-x:hidden!important;}
        .sv-content-hidden{display:none!important;}
        .sv-back-btn{display:flex!important;align-items:center;margin-bottom:16px;}
        .sv-two-col{grid-template-columns:1fr!important;}
        .sv-three-col{grid-template-columns:1fr!important;}
        .section-card{padding:16px!important;}
        .sv-invite-grid{grid-template-columns:1fr!important;}
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
      <label style={{fontSize:12,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block"}}>{children}</label>
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
        {options.map(o=><option key={o} value={o} style={{background:"#110014"}}>{o}</option>)}
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

function SaveBar({ onSave, saved }) {
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
function GeneralSection({ storeName, onSaveStoreName }) {
  const [name,     setName]     = useState(storeName);
  const [email,    setEmail]    = useState("owner@placeholder.com");
  const [timezone, setTimezone] = useState("UTC+0 London");
  const [currency, setCurrency] = useState("USD — US Dollar");
  const [industry, setIndustry] = useState("Fashion & Apparel");
  const [saved,    setSaved]    = useState(false);

  const save = () => {
    onSaveStoreName(name);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <SectionTitle sub="Basic information about your store and account.">General Settings</SectionTitle>
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:18}}>Store Information</p>
        <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
          <div><FieldLabel>Store Name</FieldLabel><TextInput value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><FieldLabel>Account Email</FieldLabel><TextInput value={email} onChange={e=>setEmail(e.target.value)}/></div>
        </div>
        <div>
          <FieldLabel>Store URL</FieldLabel>
          <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`,opacity:.65,cursor:"not-allowed"}}>
            <div style={{padding:"11px 12px",background:C.dim,color:C.muted,fontSize:15,display:"flex",alignItems:"center",flexShrink:0,borderRight:`1px solid ${C.border}`}}>🔒</div>
            <input value="yourstore" readOnly style={{flex:1,padding:"11px 12px",background:C.dim,border:"none",color:C.muted,fontSize:14,cursor:"not-allowed"}}/>
            <div style={{padding:"11px 14px",background:C.surface,color:C.muted,fontSize:14,borderLeft:`1px solid ${C.border}`,whiteSpace:"nowrap",display:"flex",alignItems:"center"}}>.myshopify.com</div>
          </div>
          <p style={{fontSize:12,color:C.muted,marginTop:6}}>Store URL is locked. Contact support to transfer stores.</p>
        </div>
      </div>
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:18}}>Regional Settings</p>
        <div className="sv-three-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18}}>
          <div><FieldLabel>Industry</FieldLabel><SearchableSelect value={industry} onChange={e=>setIndustry(e.target.value)} options={INDUSTRY_OPTIONS}/></div>
          <div><FieldLabel>Timezone</FieldLabel><SearchableSelect value={timezone} onChange={e=>setTimezone(e.target.value)} options={TIMEZONE_OPTIONS}/></div>
          <div><FieldLabel>Currency</FieldLabel><SearchableSelect value={currency} onChange={e=>setCurrency(e.target.value)} options={CURRENCY_OPTIONS}/></div>
        </div>
      </div>
      <SaveBar onSave={save} saved={saved}/>
    </div>
  );
}

function AIConfigSection() {
  const [tone,           setTone]           = useState("friendly");
  const [lang,           setLang]           = useState("English");
  const [autoReplyLimit, setAutoReplyLimit] = useState("5");
  const [escEmail,       setEscEmail]       = useState("support@yourstore.com");
  const [sig,            setSig]            = useState("Warm regards,\nThe Support Team");
  const [conds,          setConds]          = useState({angry:true,refund:true,legal:false,repeat:true});
  const [saved,          setSaved]          = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const tones = [
    {key:"professional", emoji:"💼", label:"Professional", desc:"Formal, precise. Best for B2B or high-ticket."},
    {key:"friendly",     emoji:"😊", label:"Friendly",     desc:"Warm and helpful. Works for most brands."},
    {key:"casual",       emoji:"👋", label:"Casual",       desc:"Relaxed. Great for lifestyle brands."},
  ];

  const LANGUAGES = [
    "English","Spanish","French","German","Portuguese",
    "Italian","Chinese","Japanese","Dutch","Swahili",
  ];

  return (
    <div>
      <SectionTitle sub="Control how Solva AI communicates with your customers.">AI Configuration</SectionTitle>
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
              <div style={{fontSize:24,marginBottom:10}}>{t.emoji}</div>
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
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Response Settings</p>
        <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
          <div>
            <FieldLabel hint="Language used in all AI-generated replies.">Response Language</FieldLabel>
            <SelectInput value={lang} onChange={e=>setLang(e.target.value)} options={LANGUAGES}/>
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
              {conds[c.key]&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
            </div>
            <span style={{fontSize:13.5,color:C.sub}}>{c.label}</span>
          </div>
        ))}
      </div>
      <SaveBar onSave={save} saved={saved}/>
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
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

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
              {["Minutes","Hours","Days"].map(u=><option key={u} value={u} style={{background:"#110014"}}>{u}</option>)}
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

  return (
    <div>
      <SectionTitle sub="Enable, disable, and configure each AI automation.">Automations</SectionTitle>

      {/* AI Support Agent */}
      <div className="section-card fu" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:support?20:0}}>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:42,height:42,borderRadius:12,background:`${C.teal}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:C.teal}}>🤖</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>AI Support Agent</div>
              <div style={{fontSize:12.5,color:C.muted}}>Auto-resolve tickets, order inquiries, and FAQs</div>
            </div>
          </div>
          <Toggle on={support} onToggle={()=>setSupport(v=>!v)}/>
        </div>
        {support && (
          <div style={{paddingTop:16,borderTop:`1px solid ${C.border}`}}>
            <div className="sv-two-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div><FieldLabel hint="How many tickets AI can handle per day.">Daily Ticket Limit</FieldLabel><SelectInput value={ticketLimit} onChange={e=>setTicketLimit(e.target.value)} options={["100","500","1,000","Unlimited"]}/></div>
              <div><FieldLabel hint="Delay before AI sends its reply.">Response Delay</FieldLabel><SelectInput value={respDelay} onChange={e=>setRespDelay(e.target.value)} options={["Instant","30 seconds","2 minutes","5 minutes"]}/></div>
            </div>
          </div>
        )}
      </div>

      {/* Return Deflection */}
      <div className="section-card fu fu1" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:returns?20:0}}>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:42,height:42,borderRadius:12,background:`${C.amber}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:C.amber}}>↩️</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>Return Deflection</div>
              <div style={{fontSize:12.5,color:C.muted}}>Offer smart alternatives before processing refunds</div>
            </div>
          </div>
          <Toggle on={returns} onToggle={()=>setReturns(v=>!v)}/>
        </div>
        {returns && (
          <div style={{paddingTop:16,borderTop:`1px solid ${C.border}`}}>
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
        )}
      </div>

      {/* Cart Recovery */}
      <div className="section-card fu fu2" style={{marginBottom:14}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:cart?20:0}}>
          <div style={{display:"flex",alignItems:"center",gap:13}}>
            <div style={{width:42,height:42,borderRadius:12,background:`${C.blue}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:C.blue}}>🛒</div>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>Cart Recovery</div>
              <div style={{fontSize:12.5,color:C.muted}}>3-touch AI sequence to recover abandoned carts</div>
            </div>
          </div>
          <Toggle on={cart} onToggle={()=>setCart(v=>!v)}/>
        </div>
        {cart && (
          <div style={{paddingTop:16,borderTop:`1px solid ${C.border}`}}>
            <div className="sv-three-col" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
              {delayField(delay1,setDelay1,delay1Val,setDelay1Val,delay1Unit,setDelay1Unit,["30 minutes","1 hour","3 hours","6 hours"],"Email 1 Delay")}
              {delayField(delay2,setDelay2,delay2Val,setDelay2Val,delay2Unit,setDelay2Unit,["3 hours","6 hours","12 hours","24 hours"],"Email 2 Delay")}
              {delayField(delay3,setDelay3,delay3Val,setDelay3Val,delay3Unit,setDelay3Unit,["12 hours","24 hours","48 hours"],"Email 3 Delay")}
            </div>
            <div><FieldLabel hint="Discount code included in Email 2.">Discount Code</FieldLabel><TextInput value={cartCode} onChange={e=>setCartCode(e.target.value)} placeholder="e.g. COMEBACK10"/></div>
          </div>
        )}
      </div>

      <SaveBar onSave={save} saved={saved}/>
    </div>
  );
}

function NotificationsSection() {
  const [prefs,     setPrefs]     = useState({weeklyReport:true,escalation:true,cartRecovered:false,returnDeflected:false,newTicket:false,dailySummary:true});
  const [aiDigest,  setAiDigest]  = useState(false);
  const [saved,     setSaved]     = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

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
            <div key={i} style={{display:"flex",alignItems:"center",gap:13,padding:"11px 10px",borderRadius:10,borderBottom:i<pendingInvites.length-1?`1px solid ${C.dim}`:"none"}}>
              <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:"rgba(240,160,75,.14)",border:"1px solid rgba(240,160,75,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>✉️</div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13.5,fontWeight:600,color:C.sub,marginBottom:4}}>{p.email}</div>
                <span className="tag" style={{color:C.amber,background:"rgba(240,160,75,.10)"}}>Pending</span>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
                <span className="tag" style={{color:p.role==="Admin"?C.coral:p.role==="Manager"?C.blue:C.sub,background:p.role==="Admin"?"rgba(229,82,102,.10)":p.role==="Manager"?"rgba(91,173,255,.10)":C.dim}}>{p.role}</span>
                <button onClick={()=>revoke(i)} style={{padding:"4px 12px",borderRadius:7,border:`1px solid rgba(229,82,102,.35)`,background:"rgba(229,82,102,.08)",color:C.coral,fontSize:12,fontWeight:600,cursor:"pointer"}}>Revoke</button>
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
          <button className="btn-primary" onClick={invite} style={{padding:"11px 22px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,whiteSpace:"nowrap"}}>Send Invite →</button>
        </div>
        {saved&&<div className="saved-badge" style={{marginTop:14,display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,background:"rgba(62,207,178,.10)",border:"1px solid rgba(62,207,178,.22)",width:"fit-content"}}><span style={{color:C.teal}}>✓</span><span style={{fontSize:13,fontWeight:600,color:C.teal}}>Invite sent successfully</span></div>}
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

function BillingSection() {
  const [planModal,      setPlanModal]      = useState(null);
  const [planToast,      setPlanToast]      = useState(false);
  const [planToastFade,  setPlanToastFade]  = useState(false);
  const [dlToast,        setDlToast]        = useState(false);
  const [dlToastFade,    setDlToastFade]    = useState(false);

  const usage = [
    {label:"Tickets Resolved", used:1247, limit:5000, color:C.coral},
    {label:"Cart Recoveries",  used:61,   limit:500,  color:C.blue },
    {label:"Returns Deflected",used:69,   limit:200,  color:C.amber},
  ];

  const curIdx = PLANS.findIndex(p=>p.name===CURRENT_PLAN);

  function handlePlanClick(p, i) {
    if (p.name === CURRENT_PLAN) return;
    setPlanModal({ name:p.name, direction: i > curIdx ? "upgrade" : "downgrade" });
  }

  function handleConfirm() {
    setPlanModal(null);
    setPlanToast(true); setPlanToastFade(false);
    setTimeout(()=>setPlanToastFade(true), 2700);
    setTimeout(()=>{ setPlanToast(false); setPlanToastFade(false); }, 3000);
  }

  function handleDownload() {
    setDlToast(true); setDlToastFade(false);
    setTimeout(()=>setDlToastFade(true), 2700);
    setTimeout(()=>{ setDlToast(false); setDlToastFade(false); }, 3000);
  }

  return (
    <div>
      <SectionTitle sub="Manage your plan, usage, and payment details.">Billing & Plan</SectionTitle>

      {/* Plan change modal */}
      {planModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.74)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div className="fu" style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:16,padding:28,maxWidth:420,width:"100%"}}>
            <h3 style={{fontSize:17,fontWeight:700,color:C.text,marginBottom:10}}>Confirm Plan Change</h3>
            <p style={{fontSize:14,color:C.sub,lineHeight:1.7,marginBottom:24}}>
              Are you sure you want to change your plan to{" "}
              <strong style={{color:C.coral}}>{planModal.name}</strong>?
              {planModal.direction==="downgrade" && " Some features may become unavailable immediately."}
            </p>
            <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
              <button className="btn-ghost" onClick={()=>setPlanModal(null)}
                style={{padding:"10px 20px",borderRadius:10,border:`1px solid ${C.border}`,color:C.sub,fontSize:13,fontWeight:600}}>Cancel</button>
              <button className="btn-primary" onClick={handleConfirm}
                style={{padding:"10px 22px",borderRadius:10,color:"#fff",fontSize:13,fontWeight:700}}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      {planToast && (
        <div className={planToastFade?"sv-toast-out":"sv-toast-in"}
          style={{position:"fixed",top:20,right:20,zIndex:9999,background:C.teal,color:"#082018",padding:"12px 20px",borderRadius:10,display:"flex",alignItems:"center",gap:10,fontWeight:700,fontSize:13,fontFamily:"'Outfit',sans-serif",boxShadow:"0 6px 32px rgba(0,0,0,.4)"}}>
          ✓ Plan change requested successfully!
        </div>
      )}
      {dlToast && (
        <div className={dlToastFade?"sv-toast-out":"sv-toast-in"}
          style={{position:"fixed",top:20,right:20,zIndex:9999,background:C.blue,color:"#fff",padding:"12px 20px",borderRadius:10,display:"flex",alignItems:"center",gap:10,fontWeight:700,fontSize:13,fontFamily:"'Outfit',sans-serif",boxShadow:"0 6px 32px rgba(0,0,0,.4)"}}>
          ⬇ Downloading invoice...
        </div>
      )}

      {/* Plan cards */}
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Current Plan</p>
        <div className="sv-three-col" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {PLANS.map((p,i)=>{
            const isCurrent  = p.name === CURRENT_PLAN;
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
                  onClick={()=>handlePlanClick(p,i)}
                  className={isUpgrade&&!isCurrent?"btn-primary":""}
                  style={{
                    marginTop:14,width:"100%",padding:"9px",borderRadius:9,
                    cursor:isCurrent?"default":"pointer",
                    background:isUpgrade&&!isCurrent?"linear-gradient(135deg,#E55266,#992A67,#4E0269)":"transparent",
                    border:isCurrent?`1px solid ${C.borderHi}`:!isUpgrade?`1px solid ${C.border}`:"none",
                    color:isCurrent?C.coral:!isUpgrade?C.muted:"#fff",
                    fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif",
                  }}>
                  {isCurrent?"● Current Plan":isUpgrade?"Upgrade →":"Downgrade"}
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
          <div style={{display:"grid",gridTemplateColumns:"1fr 1.6fr 1fr 90px 110px",padding:"9px 16px",background:C.surface,borderBottom:`1px solid ${C.border}`}}>
            {["Date","Invoice ID","Amount","Status",""].map((h,i)=>(
              <span key={i} style={{fontSize:10.5,fontWeight:700,color:C.muted,letterSpacing:".06em",textTransform:"uppercase"}}>{h}</span>
            ))}
          </div>
          {INVOICES.map((inv,i)=>(
            <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 1.6fr 1fr 90px 110px",padding:"12px 16px",alignItems:"center",background:C.card,borderBottom:i<INVOICES.length-1?`1px solid ${C.border}`:"none"}}>
              <span style={{fontSize:13,color:C.sub}}>{inv.date}</span>
              <span style={{fontSize:12.5,color:C.text,fontWeight:600,fontFamily:"monospace,Outfit,sans-serif"}}>{inv.id}</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>{inv.amount}</span>
              <span style={{display:"flex",alignItems:"center",gap:5}}>
                <span style={{width:6,height:6,borderRadius:"50%",background:C.teal,flexShrink:0}}/>
                <span style={{fontSize:12.5,color:C.teal,fontWeight:600}}>Paid</span>
              </span>
              <button className="btn-ghost" onClick={handleDownload}
                style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${C.border}`,color:C.sub,fontSize:12,fontWeight:600,width:"fit-content"}}>
                ⬇ PDF
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Usage */}
      <div className="section-card fu fu2">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}>
          <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase"}}>Monthly Usage</p>
          <span style={{fontSize:12,color:C.muted}}>Resets June 1, 2026</span>
        </div>
        {usage.map((u,i)=>{
          const pct = Math.round((u.used/u.limit)*100);
          return (
            <div key={i} style={{marginBottom:i<usage.length-1?16:0}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
                <span style={{fontSize:13.5,color:C.sub}}>{u.label}</span>
                <span style={{fontSize:13.5,fontWeight:700,color:u.color}}>{u.used.toLocaleString()} / {u.limit.toLocaleString()}</span>
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
    warn:"This will erase all your custom AI configurations and automation settings permanently.",
    confirmWord:"RESET",
  },
  {
    title:"Disconnect Shopify Store",
    desc:"Removes Solva's access to your store. All automations stop immediately. Your data is retained for 30 days before being purged.",
    btn:"Disconnect Store",
    warn:"All active automations will stop immediately and your store will be fully disconnected from Solva.",
    confirmWord:"DISCONNECT",
  },
  {
    title:"Delete Account",
    desc:"Permanently deletes your Solva account, all configurations, and all data. This cannot be undone under any circumstances.",
    btn:"Delete Account",
    warn:"Your account, all stored data, and all configurations will be permanently deleted and cannot be recovered.",
    confirmWord:"DELETE",
  },
];

function DangerSection() {
  const [modal,       setModal]       = useState(null);
  const [deleteInput, setDeleteInput] = useState("");

  function openModal(action) { setModal(action); setDeleteInput(""); }
  function closeModal()       { setModal(null);   setDeleteInput(""); }

  const confirmed = modal && deleteInput === modal.confirmWord;

  return (
    <div>
      <SectionTitle sub="Irreversible actions. Proceed with extreme caution.">Danger Zone</SectionTitle>

      {/* Destructive action modal */}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.80)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div className="fu" style={{background:C.card,border:`1px solid ${C.red}`,borderRadius:16,padding:28,maxWidth:440,width:"100%"}}>
            <h3 style={{fontSize:17,fontWeight:700,color:C.red,marginBottom:10}}>⚠️ Dangerous Action</h3>
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
                disabled={!confirmed}
                onClick={closeModal}
                style={{padding:"10px 22px",borderRadius:10,fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:13,transition:"all .18s",
                  background:confirmed?"#FF5272":"transparent",
                  border:`1px solid ${confirmed?"#FF5272":C.border}`,
                  color:confirmed?"#fff":C.muted,
                  cursor:confirmed?"pointer":"not-allowed",
                }}>
                Confirm
              </button>
            </div>
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
                fontSize:13,fontWeight:600,whiteSpace:"nowrap"}}>
              {item.btn}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN EXPORT ──
const SECTIONS = [
  {key:"general",       label:"General",       icon:"🏪"},
  {key:"ai",            label:"AI Config",     icon:"⚡"},
  {key:"automations",   label:"Automations",   icon:"⚙️"},
  {key:"notifications", label:"Notifications", icon:"🔔"},
  {key:"team",          label:"Team",          icon:"👥"},
  {key:"billing",       label:"Billing",       icon:"💳"},
  {key:"danger",        label:"Danger Zone",   icon:"⚠️"},
];

export default function SettingsView() {
  const [section,     setSection]     = useState("general");
  const [mobilePanel, setMobilePanel] = useState("menu");
  const [storeName,   setStoreName]   = useState("Placeholder Store");

  function handleNavClick(key) {
    setSection(key);
    setMobilePanel("content");
  }

  return (
    <div className="sv-root" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",overflowX:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

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
          <div style={{width:34,height:34,borderRadius:"50%",cursor:"pointer",background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>E</div>
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
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:2}}>🏪 {storeName}</div>
            <div style={{fontSize:11,color:C.muted}}>Manage your settings</div>
          </div>
          {SECTIONS.map(s=>(
            <div key={s.key} className="setting-nav-item" onClick={()=>handleNavClick(s.key)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:2,background:section===s.key?"rgba(229,82,102,.09)":"transparent",color:section===s.key?C.coral:s.key==="danger"?"#FF5272":C.sub,fontSize:13.5,fontWeight:section===s.key?600:400}}>
              <span style={{fontSize:15}}>{s.icon}</span>{s.label}
            </div>
          ))}
        </div>

        {/* Section content */}
        <div
          className={`sv-content${mobilePanel==="menu"?" sv-content-hidden":""}`}
          style={{flex:1,overflowY:"auto",padding:"24px 28px",background:C.bg}}
        >
          {/* Back button — mobile only */}
          <button
            className="sv-back-btn btn-ghost"
            onClick={()=>setMobilePanel("menu")}
            style={{gap:5,color:C.coral,fontSize:13,fontWeight:600,padding:"8px 16px",background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:8,marginBottom:16}}
          >
            ← Back to Settings Menu
          </button>

          {section==="general"       && <GeneralSection storeName={storeName} onSaveStoreName={setStoreName}/>}
          {section==="ai"            && <AIConfigSection/>}
          {section==="automations"   && <AutomationsSection/>}
          {section==="notifications" && <NotificationsSection/>}
          {section==="team"          && <TeamSection/>}
          {section==="billing"       && <BillingSection/>}
          {section==="danger"        && <DangerSection/>}
        </div>
      </div>
    </div>
  );
}
