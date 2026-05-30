import { useState } from "react";
import { C } from "../../tokens";

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
      input,select,textarea{font-family:'Outfit',sans-serif;outline:none;resize:none;}
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
function GeneralSection() {
  const [name,     setName]     = useState("Placeholder Store");
  const [email,    setEmail]    = useState("owner@placeholder.com");
  const [timezone, setTimezone] = useState("UTC+0 London");
  const [currency, setCurrency] = useState("USD — US Dollar");
  const [industry, setIndustry] = useState("Fashion & Apparel");
  const [saved,    setSaved]    = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  return (
    <div>
      <SectionTitle sub="Basic information about your store and account.">General Settings</SectionTitle>
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:18}}>Store Information</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
          <div><FieldLabel>Store Name</FieldLabel><TextInput value={name} onChange={e=>setName(e.target.value)}/></div>
          <div><FieldLabel>Account Email</FieldLabel><TextInput value={email} onChange={e=>setEmail(e.target.value)}/></div>
        </div>
        <div>
          <FieldLabel>Store URL</FieldLabel>
          <div style={{display:"flex",borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
            <input value="yourstore" readOnly style={{flex:1,padding:"11px 14px",background:C.dim,border:"none",color:C.muted,fontSize:14,cursor:"not-allowed"}}/>
            <div style={{padding:"11px 14px",background:C.surface,color:C.muted,fontSize:14,borderLeft:`1px solid ${C.border}`,whiteSpace:"nowrap"}}>.myshopify.com</div>
          </div>
        </div>
      </div>
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:18}}>Regional Settings</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:18}}>
          <div><FieldLabel>Industry</FieldLabel><SelectInput value={industry} onChange={e=>setIndustry(e.target.value)} options={["Fashion & Apparel","Electronics","Home & Living","Beauty & Skincare","Sports & Outdoors","Food & Beverage","Other"]}/></div>
          <div><FieldLabel>Timezone</FieldLabel><SelectInput value={timezone} onChange={e=>setTimezone(e.target.value)} options={["UTC+0 London","UTC-5 New York","UTC-8 Los Angeles","UTC+1 Lagos","UTC+3 Nairobi","UTC+8 Singapore"]}/></div>
          <div><FieldLabel>Currency</FieldLabel><SelectInput value={currency} onChange={e=>setCurrency(e.target.value)} options={["USD — US Dollar","GBP — British Pound","EUR — Euro","NGN — Nigerian Naira"]}/></div>
        </div>
      </div>
      <SaveBar onSave={save} saved={saved}/>
    </div>
  );
}

function AIConfigSection() {
  const [tone,   setTone]   = useState("friendly");
  const [lang,   setLang]   = useState("English");
  const [escEmail,setEscEmail]=useState("support@yourstore.com");
  const [sig,    setSig]    = useState("Warm regards,\nThe Support Team");
  const [conds,  setConds]  = useState({angry:true,refund:true,legal:false,repeat:true});
  const [saved,  setSaved]  = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const tones = [
    {key:"professional",emoji:"💼",label:"Professional",desc:"Formal, precise. Best for B2B or high-ticket."},
    {key:"friendly",    emoji:"😊",label:"Friendly",    desc:"Warm and helpful. Works for most brands."},
    {key:"casual",      emoji:"👋",label:"Casual",      desc:"Relaxed. Great for lifestyle brands."},
  ];

  return (
    <div>
      <SectionTitle sub="Control how Solva AI communicates with your customers.">AI Configuration</SectionTitle>
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Brand Tone</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {tones.map(t=>(
            <div key={t.key} className="tone-card" onClick={()=>setTone(t.key)}
              style={{padding:"16px 14px",background:tone===t.key?"rgba(229,82,102,.08)":C.surface,border:`1px solid ${tone===t.key?C.coral:C.border}`}}>
              <div style={{fontSize:24,marginBottom:10}}>{t.emoji}</div>
              <div style={{fontSize:13.5,fontWeight:700,color:tone===t.key?C.coral:C.text,marginBottom:5}}>{t.label}</div>
              <div style={{fontSize:12,color:C.muted,lineHeight:1.55}}>{t.desc}</div>
              {tone===t.key&&<div style={{marginTop:10,display:"flex",alignItems:"center",gap:5}}><span style={{width:6,height:6,borderRadius:"50%",background:C.coral,display:"inline-block"}}/><span style={{fontSize:11,color:C.coral,fontWeight:700}}>Active</span></div>}
            </div>
          ))}
        </div>
      </div>
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Response Settings</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginBottom:18}}>
          <div><FieldLabel hint="Language used in all AI-generated replies.">Response Language</FieldLabel><SelectInput value={lang} onChange={e=>setLang(e.target.value)} options={["English","French","Spanish","German","Portuguese","Arabic","Yoruba"]}/></div>
          <div><FieldLabel hint="Max consecutive AI replies before escalating.">Auto-Reply Limit</FieldLabel><SelectInput value="5" onChange={()=>{}} options={["3","5","7","10","Unlimited"]}/></div>
        </div>
        <div><FieldLabel hint="Appended to every AI-generated email.">Email Signature</FieldLabel>
          <textarea value={sig} onChange={e=>setSig(e.target.value)} rows={3}
            style={{width:"100%",padding:"11px 14px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`,color:C.text,fontSize:14,lineHeight:1.65}}/>
        </div>
      </div>
      <div className="section-card fu fu2">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Escalation Rules</p>
        <div style={{marginBottom:18}}><FieldLabel hint="Complex tickets forwarded here.">Escalation Email</FieldLabel><TextInput value={escEmail} onChange={e=>setEscEmail(e.target.value)} placeholder="support@yourstore.com"/></div>
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
  const [support,  setSupport]  = useState(true);
  const [returns,  setReturns]  = useState(true);
  const [cart,     setCart]     = useState(true);
  const [cartCode, setCartCode] = useState("COMEBACK10");
  const [saved,    setSaved]    = useState(false);
  const save = () => { setSaved(true); setTimeout(()=>setSaved(false),2500); };

  const items = [
    {
      icon:"🤖", label:"AI Support Agent",  desc:"Auto-resolve tickets, order inquiries, and FAQs",   color:C.teal,  on:support, toggle:()=>setSupport(v=>!v),
      extra: support && (
        <div style={{paddingTop:16,borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div><FieldLabel hint="How many tickets AI can handle per day.">Daily Ticket Limit</FieldLabel><SelectInput value="Unlimited" onChange={()=>{}} options={["100","500","1,000","Unlimited"]}/></div>
            <div><FieldLabel hint="Delay before AI sends its reply.">Response Delay</FieldLabel><SelectInput value="Instant" onChange={()=>{}} options={["Instant","30 seconds","2 minutes","5 minutes"]}/></div>
          </div>
        </div>
      ),
    },
    {
      icon:"↩", label:"Return Deflection",  desc:"Offer smart alternatives before processing refunds", color:C.amber, on:returns, toggle:()=>setReturns(v=>!v),
      extra: returns && (
        <div style={{paddingTop:16,borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div><FieldLabel hint="Max % discount AI can offer.">Max Deflection Discount</FieldLabel><SelectInput value="10%" onChange={()=>{}} options={["5%","10%","15%","20%","25%"]}/></div>
            <div><FieldLabel hint="How long to wait before processing.">Response Window</FieldLabel><SelectInput value="24 hours" onChange={()=>{}} options={["6 hours","12 hours","24 hours","48 hours"]}/></div>
          </div>
        </div>
      ),
    },
    {
      icon:"🛒", label:"Cart Recovery",      desc:"3-touch AI sequence to recover abandoned carts",     color:C.blue,  on:cart,    toggle:()=>setCart(v=>!v),
      extra: cart && (
        <div style={{paddingTop:16,borderTop:`1px solid ${C.border}`}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
            <div><FieldLabel>Email 1 Delay</FieldLabel><SelectInput value="1 hour"   onChange={()=>{}} options={["30 minutes","1 hour","3 hours","6 hours"]}/></div>
            <div><FieldLabel>Email 2 Delay</FieldLabel><SelectInput value="6 hours"  onChange={()=>{}} options={["3 hours","6 hours","12 hours","24 hours"]}/></div>
            <div><FieldLabel>Email 3 Delay</FieldLabel><SelectInput value="24 hours" onChange={()=>{}} options={["12 hours","24 hours","48 hours"]}/></div>
          </div>
          <div><FieldLabel hint="Discount code included in Email 2.">Discount Code</FieldLabel><TextInput value={cartCode} onChange={e=>setCartCode(e.target.value)} placeholder="e.g. COMEBACK10"/></div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <SectionTitle sub="Enable, disable, and configure each AI automation.">Automations</SectionTitle>
      {items.map((a,i)=>(
        <div key={i} className="section-card fu" style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:a.extra?20:0}}>
            <div style={{display:"flex",alignItems:"center",gap:13}}>
              <div style={{width:42,height:42,borderRadius:12,background:`${a.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{a.icon}</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:2}}>{a.label}</div>
                <div style={{fontSize:12.5,color:C.muted}}>{a.desc}</div>
              </div>
            </div>
            <Toggle on={a.on} onToggle={a.toggle}/>
          </div>
          {a.extra}
        </div>
      ))}
      <SaveBar onSave={save} saved={saved}/>
    </div>
  );
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({weeklyReport:true,escalation:true,cartRecovered:false,returnDeflected:false,newTicket:false,dailySummary:true});
  const [saved, setSaved] = useState(false);
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
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                <span style={{fontSize:14,fontWeight:600,color:C.text}}>{n.label}</span>
                {n.rec&&<span className="tag" style={{color:C.coral,background:"rgba(229,82,102,.10)"}}>Recommended</span>}
              </div>
              <span style={{fontSize:12.5,color:C.muted}}>{n.desc}</span>
            </div>
            <Toggle on={prefs[n.key]} onToggle={()=>setPrefs(p=>({...p,[n.key]:!p[n.key]}))} size={38}/>
          </div>
        ))}
      </div>
      <SaveBar onSave={save} saved={saved}/>
    </div>
  );
}

function TeamSection() {
  const [members,     setMembers]     = useState([
    {name:"You (Owner)",email:"owner@yourstore.com",  role:"Admin",   avatar:"YO",color:C.coral,  you:true },
    {name:"Sarah K.",  email:"sarah.k@yourstore.com", role:"Manager", avatar:"SK",color:C.blue,   you:false},
    {name:"James O.",  email:"james.o@yourstore.com", role:"Support", avatar:"JO",color:C.teal,   you:false},
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole,  setInviteRole]  = useState("Support");
  const [saved,       setSaved]       = useState(false);

  const invite = () => {
    if(!inviteEmail) return;
    setMembers(m=>[...m,{name:inviteEmail.split("@")[0],email:inviteEmail,role:inviteRole,avatar:inviteEmail[0].toUpperCase(),color:C.magenta,you:false}]);
    setInviteEmail(""); setSaved(true); setTimeout(()=>setSaved(false),2500);
  };

  return (
    <div>
      <SectionTitle sub="Manage who has access to your Solva dashboard.">Team Members</SectionTitle>
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Current Members ({members.length})</p>
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
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span className="tag" style={{color:m.role==="Admin"?C.coral:m.role==="Manager"?C.blue:C.sub,background:m.role==="Admin"?"rgba(229,82,102,.10)":m.role==="Manager"?"rgba(91,173,255,.10)":C.dim}}>{m.role}</span>
              {!m.you&&<button className="btn-danger" onClick={()=>setMembers(ms=>ms.filter(x=>x.email!==m.email))} style={{padding:"4px 10px",borderRadius:7,border:`1px solid ${C.border}`,color:C.muted,fontSize:12}}>Remove</button>}
            </div>
          </div>
        ))}
      </div>
      <div className="section-card fu fu1">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Invite New Member</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 160px auto",gap:12,alignItems:"end"}}>
          <div><FieldLabel>Email Address</FieldLabel><TextInput value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} placeholder="colleague@yourstore.com"/></div>
          <div><FieldLabel>Role</FieldLabel><SelectInput value={inviteRole} onChange={e=>setInviteRole(e.target.value)} options={["Support","Manager","Admin"]}/></div>
          <button className="btn-primary" onClick={invite} style={{padding:"11px 22px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,whiteSpace:"nowrap"}}>Send Invite →</button>
        </div>
        {saved&&<div className="saved-badge" style={{marginTop:14,display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:9,background:"rgba(62,207,178,.10)",border:"1px solid rgba(62,207,178,.22)",width:"fit-content"}}><span style={{color:C.teal}}>✓</span><span style={{fontSize:13,fontWeight:600,color:C.teal}}>Invite sent successfully</span></div>}
      </div>
    </div>
  );
}

function BillingSection() {
  const usage = [
    {label:"Tickets Resolved", used:1247,limit:5000,color:C.coral},
    {label:"Cart Recoveries",  used:61,  limit:500, color:C.blue },
    {label:"Returns Deflected",used:69,  limit:200, color:C.amber},
  ];
  return (
    <div>
      <SectionTitle sub="Manage your plan, usage, and payment details.">Billing & Plan</SectionTitle>
      <div className="section-card fu">
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>Current Plan</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {PLANS.map((p,i)=>(
            <div key={i} className="plan-card" style={{padding:"18px",borderRadius:12,background:p.popular?"rgba(229,82,102,.07)":C.surface,border:`1px solid ${p.popular?C.coral:C.border}`,position:"relative"}}>
              {p.popular&&<div style={{position:"absolute",top:-11,left:"50%",transform:"translateX(-50%)",padding:"3px 12px",borderRadius:100,background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",color:"#fff",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>CURRENT PLAN</div>}
              <div style={{fontSize:13,color:C.sub,fontWeight:600,marginBottom:6}}>{p.name}</div>
              <div style={{fontSize:26,fontWeight:800,color:p.popular?C.coral:C.text,marginBottom:14}}>{p.price}<span style={{fontSize:12,color:C.muted,fontWeight:400}}>/mo</span></div>
              {p.features.map((f,j)=><div key={j} style={{display:"flex",gap:7,marginBottom:7}}><span style={{color:C.coral,fontSize:12,marginTop:1,flexShrink:0}}>✓</span><span style={{fontSize:12.5,color:C.sub}}>{f}</span></div>)}
              <button style={{marginTop:14,width:"100%",padding:"9px",borderRadius:9,cursor:"pointer",background:p.popular?"transparent":"linear-gradient(135deg,#E55266,#992A67,#4E0269)",border:p.popular?`1px solid ${C.border}`:"none",color:p.popular?C.muted:"#fff",fontWeight:600,fontSize:13,fontFamily:"'Outfit',sans-serif",opacity:p.popular?.6:1}}>
                {p.popular?"Current Plan":"Upgrade →"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="section-card fu fu1">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
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

function DangerSection() {
  const [confirm, setConfirm] = useState("");
  return (
    <div>
      <SectionTitle sub="Irreversible actions. Proceed with extreme caution.">Danger Zone</SectionTitle>
      {[
        {title:"Disconnect Shopify Store", desc:"Removes Solva's access to your store. All automations stop immediately. Data retained for 30 days.",  btn:"Disconnect Store",  level:"warn"  },
        {title:"Pause All Automations",    desc:"Temporarily stops all AI automations without disconnecting your store. Resume any time.",                btn:"Pause Automations", level:"warn"  },
        {title:"Delete Account",           desc:"Permanently deletes your Solva account, all configurations, and all data. This cannot be undone.",     btn:"Delete My Account", level:"danger"},
      ].map((item,i)=>(
        <div key={i} style={{marginBottom:14,padding:22,borderRadius:14,background:item.level==="danger"?"rgba(255,82,114,.05)":C.card,border:`1px solid ${item.level==="danger"?"rgba(255,82,114,.20)":C.border}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:20}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:item.level==="danger"?"#FF5272":C.text,marginBottom:6}}>{item.title}</div>
              <div style={{fontSize:13,color:C.muted,lineHeight:1.65}}>{item.desc}</div>
            </div>
            <button className="btn-danger" style={{padding:"9px 18px",borderRadius:9,flexShrink:0,border:`1px solid ${item.level==="danger"?"#FF5272":C.border}`,color:item.level==="danger"?"#FF5272":C.sub,fontSize:13,fontWeight:600,whiteSpace:"nowrap"}}>{item.btn}</button>
          </div>
        </div>
      ))}
      <div className="section-card fu" style={{borderColor:"rgba(255,82,114,.20)",background:"rgba(255,82,114,.04)"}}>
        <p style={{fontSize:12,fontWeight:700,color:"#FF5272",marginBottom:10,letterSpacing:".04em",textTransform:"uppercase"}}>⚠ Type DELETE below to confirm account deletion</p>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <TextInput value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Type DELETE to confirm"/>
          <button style={{padding:"11px 20px",borderRadius:10,flexShrink:0,background:confirm==="DELETE"?"#FF5272":"transparent",border:`1px solid ${confirm==="DELETE"?"#FF5272":C.border}`,color:confirm==="DELETE"?"#fff":C.muted,fontWeight:700,fontSize:14,cursor:confirm==="DELETE"?"pointer":"not-allowed",fontFamily:"'Outfit',sans-serif",transition:"all .18s",whiteSpace:"nowrap"}}>
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN EXPORT ──
const SECTIONS = [
  {key:"general",       label:"General",       icon:"🏪"},
  {key:"ai",            label:"AI Config",     icon:"⚡"},
  {key:"automations",   label:"Automations",   icon:"⚙"},
  {key:"notifications", label:"Notifications", icon:"🔔"},
  {key:"team",          label:"Team",          icon:"👥"},
  {key:"billing",       label:"Billing",       icon:"💳"},
  {key:"danger",        label:"Danger Zone",   icon:"⚠"},
];

export default function SettingsView() {
  const [section, setSection] = useState("general");

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Settings</h1>
          <p style={{fontSize:11.5,color:C.muted}}>Manage your store, AI, and account</p>
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
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* Settings nav */}
        <div style={{width:200,flexShrink:0,borderRight:`1px solid ${C.border}`,background:C.surface,padding:"16px 10px",overflowY:"auto"}}>
          <p style={{fontSize:10.5,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",padding:"0 10px",marginBottom:10}}>Settings</p>
          {SECTIONS.map(s=>(
            <div key={s.key} className="setting-nav-item" onClick={()=>setSection(s.key)}
              style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",marginBottom:2,background:section===s.key?"rgba(229,82,102,.09)":"transparent",color:section===s.key?C.coral:s.key==="danger"?"#FF5272":C.sub,fontSize:13.5,fontWeight:section===s.key?600:400}}>
              <span style={{fontSize:15}}>{s.icon}</span>{s.label}
            </div>
          ))}
        </div>

        {/* Section content */}
        <div style={{flex:1,overflowY:"auto",padding:"24px 28px",background:C.bg}}>
          {section==="general"       && <GeneralSection/>}
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
