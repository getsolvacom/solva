import { useState } from "react";
import { C } from "../../tokens";

const CARTS = [
  {
    id:"CR-0291", name:"Lena Fischer", email:"lena.f@gmail.com",
    avatar:"LF", avatarColor:"#E55266",
    value:214.50, timeAgo:"48m ago", status:"recovered", step:3,
    products:[
      { name:"Minimalist Leather Wallet", variant:"Black / Large",    qty:1, price:89.00,  emoji:"👝" },
      { name:"Canvas Tote Bag",           variant:"Natural / One Size",qty:2, price:62.75,  emoji:"🛍" },
    ],
    sequence:[
      { step:1, label:"First Reminder",  sentAt:"10:19 AM",            status:"sent",      subject:"Hey Lena, you left something behind 👀",          preview:"Hi Lena! You left some great items in your cart. Your Minimalist Leather Wallet and Canvas Tote Bags are still waiting — held for 24 hours.", opens:1, clicks:1 },
      { step:2, label:"Value Reminder",  sentAt:"4:19 PM",             status:"sent",      subject:"Still thinking it over? Here's 10% off 🎁",         preview:"Hi Lena! Here's an exclusive 10% discount — COMEBACK10. Valid 48 hours only.", opens:1, clicks:1 },
      { step:3, label:"Final Follow-up", sentAt:"10:19 AM (next day)", status:"converted", subject:"Last chance — your cart expires soon ⏰",           preview:"Hi Lena! Last reminder — your cart expires in 6 hours.", opens:1, clicks:1 },
    ],
    recoveredAt:"10:31 AM", recoveredValue:214.50,
  },
  {
    id:"CR-0290", name:"Marcus Webb", email:"marcus.w@outlook.com",
    avatar:"MW", avatarColor:"#5BADFF",
    value:89.00, timeAgo:"1h ago", status:"in_sequence", step:1,
    products:[
      { name:"Premium Watch Strap", variant:"Tan / 22mm",    qty:1, price:54.00, emoji:"⌚" },
      { name:"Travel Pouch",        variant:"Grey / Medium", qty:1, price:35.00, emoji:"👜" },
    ],
    sequence:[
      { step:1, label:"First Reminder",  sentAt:"9:57 AM",             status:"sent",      subject:"Marcus, your cart is waiting for you 🛒",           preview:"Hi Marcus! You left a Premium Watch Strap and Travel Pouch — popular items, held for 24 hours.", opens:1, clicks:0 },
      { step:2, label:"Value Reminder",  sentAt:"3:57 PM",             status:"scheduled", subject:"Still thinking? Here's 10% off 🎁",                 preview:"Scheduled — will send if no purchase by 3:57 PM.", opens:0, clicks:0 },
      { step:3, label:"Final Follow-up", sentAt:"9:57 AM (next day)",  status:"scheduled", subject:"Last chance ⏰",                                    preview:"Scheduled — will send tomorrow morning.", opens:0, clicks:0 },
    ],
  },
  {
    id:"CR-0289", name:"Aisha Nwosu", email:"aisha.n@gmail.com",
    avatar:"AN", avatarColor:"#3ECFB2",
    value:347.00, timeAgo:"2h ago", status:"in_sequence", step:2,
    products:[
      { name:"Silk Scarf Set",      variant:"Navy / Multicolor", qty:1, price:128.00, emoji:"🧣" },
      { name:"Leather Card Holder", variant:"Cognac / Slim",     qty:2, price:44.50,  emoji:"💳" },
      { name:"Perfume Gift Box",    variant:"Classic Edition",   qty:1, price:130.00, emoji:"🌸" },
    ],
    sequence:[
      { step:1, label:"First Reminder",  sentAt:"8:35 AM",            status:"sent",      subject:"Aisha, your cart is waiting 🛒",                    preview:"Hi Aisha! Beautiful items in your cart — Silk Scarf Set, Leather Card Holders, and Perfume Gift Box.", opens:1, clicks:0 },
      { step:2, label:"Value Reminder",  sentAt:"2:35 PM",            status:"sent",      subject:"Still thinking? Here's 10% off 🎁",                 preview:"Hi Aisha! Here's 10% off — COMEBACK10. Looks like you came back for another look!", opens:1, clicks:1 },
      { step:3, label:"Final Follow-up", sentAt:"8:35 AM (next day)", status:"scheduled", subject:"Last chance — your $347 cart expires ⏰",            preview:"Scheduled — will send tomorrow morning.", opens:0, clicks:0 },
    ],
  },
  {
    id:"CR-0288", name:"Ryan Osei", email:"ryan.o@proton.me",
    avatar:"RO", avatarColor:"#F0A04B",
    value:62.00, timeAgo:"3h ago", status:"failed", step:3,
    products:[
      { name:"Minimalist Notebook", variant:"Black / A5", qty:2, price:31.00, emoji:"📓" },
    ],
    sequence:[
      { step:1, label:"First Reminder",  sentAt:"7:15 AM",            status:"sent", subject:"Ryan, your cart is waiting 🛒",           preview:"Hi Ryan! You left 2x Minimalist Notebooks in your cart.", opens:0, clicks:0 },
      { step:2, label:"Value Reminder",  sentAt:"1:15 PM",            status:"sent", subject:"Still thinking? Here's 10% off 🎁",         preview:"Hi Ryan! Here's COMEBACK10 — 10% off your cart.", opens:0, clicks:0 },
      { step:3, label:"Final Follow-up", sentAt:"7:15 AM (next day)", status:"sent", subject:"Last chance ⏰",                           preview:"Hi Ryan! Your cart expires in 6 hours.", opens:0, clicks:0 },
    ],
  },
];

const STATUS_C = {
  recovered:   { label:"Recovered",      color:"#3ECFB2", bg:"rgba(62,207,178,.10)"  },
  in_sequence: { label:"In Sequence",    color:"#F0A04B", bg:"rgba(240,160,75,.10)"  },
  failed:      { label:"Not Recovered",  color:"#FF5272", bg:"rgba(255,82,114,.10)"  },
};

const SEQ_STATUS = {
  sent:      { color:"#5BADFF", bg:"rgba(91,173,255,.10)",  label:"Sent"      },
  scheduled: { color:"#6A3A5C", bg:"rgba(106,58,92,.12)",   label:"Scheduled" },
  converted: { color:"#3ECFB2", bg:"rgba(62,207,178,.10)",  label:"Converted" },
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
      .fu{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
      .sr{animation:slideRight .5s cubic-bezier(.16,1,.3,1) both;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .cart-row{cursor:pointer;transition:background .14s;border-left:3px solid transparent;}
      .cart-row:hover{background:rgba(229,82,102,.05)!important;}
      .kpi-card{transition:transform .2s,box-shadow .2s;cursor:default;}
      .kpi-card:hover{transform:translateY(-2px);box-shadow:0 14px 36px rgba(0,0,0,.5);}
      .email-preview{transition:all .2s ease;cursor:pointer;}
      .email-preview:hover{border-color:#E55266!important;background:rgba(229,82,102,.04)!important;}
      .blink{animation:blink 2.4s ease infinite;}
      .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:600;white-space:nowrap;}
      input{font-family:'Outfit',sans-serif;outline:none;}
    `}</style>
  );
}

export default function CartRecoveryView() {
  const [filter,      setFilter]      = useState("All");
  const [search,      setSearch]      = useState("");
  const [selectedId,  setSelectedId]  = useState("CR-0291");
  const [expandedStep,setExpandedStep]= useState(0);

  const filtered = CARTS.filter(c => {
    const mf =
      filter==="All"          ? true :
      filter==="In Sequence"  ? c.status==="in_sequence" :
      filter==="Recovered"    ? c.status==="recovered" :
      filter==="Not Recovered"? c.status==="failed" : true;
    return mf && (c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));
  });

  const selected        = CARTS.find(c => c.id === selectedId);
  const totalRecovered  = CARTS.filter(c=>c.status==="recovered").reduce((s,c)=>s+c.value,0);
  const counts          = {
    "All":            CARTS.length,
    "In Sequence":    CARTS.filter(c=>c.status==="in_sequence").length,
    "Recovered":      CARTS.filter(c=>c.status==="recovered").length,
    "Not Recovered":  CARTS.filter(c=>c.status==="failed").length,
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Cart Recovery</h1>
          <p style={{fontSize:11.5,color:C.muted}}>${totalRecovered.toFixed(2)} recovered this week · {counts["In Sequence"]} carts in sequence</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:8,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.22)"}}>
            <div className="blink" style={{width:6,height:6,borderRadius:"50%",background:C.coral}}/>
            <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".04em"}}>SOLVA LIVE</span>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",cursor:"pointer",background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>E</div>
        </div>
      </div>

      {/* KPI strip */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
        {[
          {label:"Recovered Revenue", value:`$${totalRecovered.toFixed(2)}`, color:C.teal,  icon:"💰"},
          {label:"Recovery Rate",     value:"19.4%",                         color:C.coral, icon:"📈"},
          {label:"Carts in Sequence", value:counts["In Sequence"].toString(),color:C.amber, icon:"⏳"},
          {label:"Avg Cart Value",    value:"$178.20",                       color:C.blue,  icon:"🛒"},
        ].map((k,i)=>(
          <div key={i} className="kpi-card" style={{padding:"14px 20px",background:C.surface,borderRight:i<3?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${k.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{k.icon}</div>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:k.color}}>{k.value}</div>
              <div style={{fontSize:11,color:C.muted,marginTop:2}}>{k.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Workspace */}
      <div style={{flex:1,display:"flex",overflow:"hidden"}}>

        {/* Cart list */}
        <div style={{width:300,flexShrink:0,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.surface}}>
          <div style={{padding:"12px 12px 8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
              <span style={{color:C.muted,fontSize:14}}>🔍</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search carts…" style={{flex:1,background:"transparent",border:"none",color:C.text,fontSize:13.5}}/>
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:4,padding:"0 12px 10px"}}>
            {["All","In Sequence","Recovered","Not Recovered"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                style={{padding:"4px 10px",borderRadius:100,cursor:"pointer",border:`1px solid ${filter===f?C.coral:C.border}`,background:filter===f?"rgba(229,82,102,.10)":"transparent",color:filter===f?C.coral:C.muted,fontSize:11.5,fontWeight:filter===f?700:400,fontFamily:"'Outfit',sans-serif"}}>
                {f} ({counts[f]})
              </button>
            ))}
          </div>

          <div style={{flex:1,overflowY:"auto"}}>
            {filtered.map(c=>{
              const s = STATUS_C[c.status];
              return (
                <div key={c.id} className="cart-row" onClick={()=>setSelectedId(c.id)}
                  style={{padding:"13px 16px",background:selectedId===c.id?"rgba(229,82,102,.07)":"transparent",borderLeft:`3px solid ${selectedId===c.id?C.coral:"transparent"}`,borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                    <div style={{width:36,height:36,borderRadius:10,flexShrink:0,background:`${c.avatarColor}22`,border:`1px solid ${c.avatarColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:c.avatarColor}}>{c.avatar}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:13.5,fontWeight:600,color:C.text}}>{c.name}</span>
                        <span style={{fontSize:14,fontWeight:800,color:c.status==="recovered"?C.teal:C.text}}>${c.value.toFixed(2)}</span>
                      </div>
                      <div style={{display:"flex",gap:4,marginBottom:7}}>
                        {[1,2,3].map(n=><div key={n} style={{flex:1,height:3,borderRadius:2,background:n<=c.step?(c.status==="recovered"?C.teal:c.status==="failed"?"#FF5272":C.coral):C.dim}}/>)}
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11.5,color:C.muted}}>Step {c.step}/3 · {c.timeAgo}</span>
                        <span className="tag" style={{color:s.color,background:s.bg}}>{s.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom totals */}
          <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,background:C.card}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.muted}}>Total abandoned value</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>${CARTS.reduce((s,c)=>s+c.value,0).toFixed(2)}</span>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <span style={{fontSize:12,color:C.muted}}>Recovered so far</span>
              <span style={{fontSize:13,fontWeight:700,color:C.teal}}>${totalRecovered.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="sr" style={{flex:1,display:"flex",flexDirection:"column",height:"100%",overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"15px 24px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:13}}>
                <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:`${selected.avatarColor}22`,border:`1px solid ${selected.avatarColor}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:selected.avatarColor}}>{selected.avatar}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:15,fontWeight:700,color:C.text}}>{selected.name}</span>
                    <span className="tag" style={{color:STATUS_C[selected.status].color,background:STATUS_C[selected.status].bg}}>{STATUS_C[selected.status].label}</span>
                  </div>
                  <span style={{fontSize:12,color:C.muted}}>{selected.email} · {selected.id} · Abandoned {selected.timeAgo}</span>
                </div>
              </div>
              <button className="btn-primary" style={{padding:"7px 16px",borderRadius:8,color:"#fff",fontWeight:600,fontSize:13}}>
                {selected.status==="in_sequence"?"⚡ Trigger Next Step":"📋 View Order"}
              </button>
            </div>

            {/* Scrollable body */}
            <div style={{flex:1,overflowY:"auto",padding:"22px 24px",display:"flex",flexDirection:"column",gap:16,background:C.bg}}>

              {/* Outcome banner */}
              {selected.status==="recovered" && (
                <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(62,207,178,.08)",border:"1px solid rgba(62,207,178,.22)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}>
                    <span style={{fontSize:22}}>🎉</span>
                    <div>
                      <div style={{fontSize:13.5,fontWeight:700,color:C.teal,marginBottom:3}}>Cart Successfully Recovered</div>
                      <div style={{fontSize:12.5,color:C.sub}}>Converted at {selected.recoveredAt} · Solva AI recovered this without human intervention</div>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:22,fontWeight:800,color:C.teal}}>${selected.recoveredValue.toFixed(2)}</div>
                    <div style={{fontSize:11,color:C.muted}}>recovered</div>
                  </div>
                </div>
              )}
              {selected.status==="failed" && (
                <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(255,82,114,.07)",border:"1px solid rgba(255,82,114,.18)",display:"flex",alignItems:"center",gap:12}}>
                  <span style={{fontSize:20}}>📭</span>
                  <div>
                    <div style={{fontSize:13.5,fontWeight:700,color:"#FF5272",marginBottom:3}}>All 3 Emails Sent — No Conversion</div>
                    <div style={{fontSize:12.5,color:C.sub}}>Customer did not open any emails. Sequence complete. Cart expired.</div>
                  </div>
                </div>
              )}

              {/* Two-col */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {/* Products */}
                <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                  <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>Abandoned Items</h3>
                  {selected.products.map((p,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<selected.products.length-1?`1px solid ${C.dim}`:"none"}}>
                      <div style={{width:34,height:34,borderRadius:8,flexShrink:0,background:C.dim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{p.emoji}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:2}}>{p.name}</div>
                        <div style={{fontSize:11.5,color:C.muted}}>{p.variant} · Qty: {p.qty}</div>
                      </div>
                      <span style={{fontSize:14,fontWeight:700,color:C.text}}>${(p.price*p.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 0",borderTop:`1px solid ${C.border}`,marginTop:8}}>
                    <span style={{fontSize:13,fontWeight:600,color:C.sub}}>Cart Total</span>
                    <span style={{fontSize:16,fontWeight:800,color:C.coral}}>${selected.value.toFixed(2)}</span>
                  </div>
                </div>

                {/* Sequence progress */}
                <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                  <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>Sequence Progress</h3>
                  <div style={{display:"flex",gap:8,marginBottom:14}}>
                    {[1,2,3].map(n=>{
                      const sd   = selected.sequence[n-1];
                      const done = sd.status==="sent"||sd.status==="converted";
                      const active = n===selected.step&&selected.status==="in_sequence";
                      return (
                        <div key={n} style={{flex:1}}>
                          <div style={{height:5,borderRadius:3,background:sd.status==="converted"?C.teal:done?C.blue:active?C.coral:C.dim,marginBottom:6}}/>
                          <div style={{fontSize:10.5,color:C.muted,textAlign:"center"}}>Step {n}</div>
                          <div style={{fontSize:10,textAlign:"center",marginTop:2,color:sd.status==="converted"?C.teal:done?C.blue:active?C.coral:C.muted}}>
                            {SEQ_STATUS[sd.status]?.label||"Scheduled"}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{padding:"8px 12px",borderRadius:8,background:"rgba(229,82,102,.07)",border:"1px solid rgba(229,82,102,.14)"}}>
                    <span style={{fontSize:12,color:C.sub}}>
                      {selected.status==="in_sequence" ? `⚡ Step ${selected.step} sent · Next step scheduled automatically`
                      :selected.status==="recovered"   ? "✓ Sequence complete — cart recovered"
                      : "✕ All 3 steps sent · Sequence ended"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email sequence timeline */}
              <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:18}}>Recovery Sequence · AI Emails</h3>
                {selected.sequence.map((step,i)=>(
                  <div key={i} style={{display:"flex",gap:14,paddingBottom:i<selected.sequence.length-1?16:0}}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flexShrink:0}}>
                      <div style={{width:30,height:30,borderRadius:"50%",background:step.status==="converted"?C.teal:step.status==="sent"?C.blue:C.dim,border:`2px solid ${step.status==="converted"?C.teal:step.status==="sent"?C.blue:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>
                        {step.status==="converted"?"✓":step.step}
                      </div>
                      {i<selected.sequence.length-1&&<div style={{width:2,flex:1,minHeight:20,background:step.status==="sent"||step.status==="converted"?`linear-gradient(${C.blue},${C.dim})`:C.dim,margin:"4px 0"}}/>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div>
                          <span style={{fontSize:13.5,fontWeight:700,color:C.text}}>{step.label}</span>
                          <span style={{fontSize:11,color:C.muted,marginLeft:8}}>· {step.sentAt}</span>
                        </div>
                        <div style={{display:"flex",gap:6}}>
                          {(step.status==="sent"||step.status==="converted")&&(
                            <>
                              <span className="tag" style={{color:C.sub,background:C.dim,fontSize:10}}>👁 {step.opens}</span>
                              <span className="tag" style={{color:C.sub,background:C.dim,fontSize:10}}>🖱 {step.clicks}</span>
                            </>
                          )}
                          <span className="tag" style={{color:SEQ_STATUS[step.status]?.color||C.muted,background:SEQ_STATUS[step.status]?.bg||C.dim}}>
                            {SEQ_STATUS[step.status]?.label||"Scheduled"}
                          </span>
                        </div>
                      </div>
                      <div className="email-preview" onClick={()=>setExpandedStep(expandedStep===i?-1:i)}
                        style={{borderRadius:12,background:C.card,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                        <div style={{padding:"10px 14px",borderBottom:expandedStep===i?`1px solid ${C.border}`:"none",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                          <span style={{fontSize:12.5,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:300}}>{step.subject}</span>
                          <span style={{fontSize:12,color:C.muted,flexShrink:0}}>{expandedStep===i?"▲":"▼"}</span>
                        </div>
                        {expandedStep===i&&(
                          <div style={{padding:"12px 14px"}}>
                            <p style={{fontSize:13,color:C.sub,lineHeight:1.7}}>{step.preview}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}