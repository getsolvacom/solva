import { useState } from "react";
import { C } from "../../tokens";

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
      input{font-family:'Outfit',sans-serif;outline:none;}
    `}</style>
  );
}

function Bubble({ msg, idx }) {
  const isCustomer = msg.from === "customer";
  return (
    <div className="msg-bubble" style={{animationDelay:`${idx*.07}s`,display:"flex",justifyContent:isCustomer?"flex-start":"flex-end",margin:"6px 0"}}>
      <div style={{maxWidth:"72%",display:"flex",flexDirection:"column",alignItems:isCustomer?"flex-start":"flex-end",gap:5}}>
        <div style={{display:"flex",alignItems:"center",gap:6,paddingLeft:2}}>
          {!isCustomer&&<span className="tag" style={{color:C.coral,background:"rgba(229,82,102,.10)",fontSize:10}}>⚡ SOLVA AI</span>}
          <span style={{fontSize:10.5,color:C.muted}}>{msg.time}</span>
          {isCustomer&&<span style={{fontSize:10.5,color:C.sub,fontWeight:500}}>Customer</span>}
        </div>
        <div style={{padding:"11px 15px",borderRadius:14,borderBottomLeftRadius:isCustomer?4:14,borderBottomRightRadius:isCustomer?14:4,background:isCustomer?C.card:"rgba(229,82,102,.10)",border:`1px solid ${isCustomer?C.border:"rgba(229,82,102,.20)"}`,fontSize:13.5,color:C.text,lineHeight:1.65}}>
          {msg.text}
        </div>
      </div>
    </div>
  );
}

export default function ReturnsView() {
  const [filter,     setFilter]     = useState("All");
  const [search,     setSearch]     = useState("");
  const [selectedId, setSelectedId] = useState("RT-0544");

  const filtered = RETURNS.filter(r => {
    const mf =
      filter==="All"       ? true :
      filter==="Deflected" ? r.status==="deflected" :
      filter==="Processed" ? r.status==="processed" :
      filter==="Pending"   ? r.status==="pending"   : true;
    return mf && (r.name.toLowerCase().includes(search.toLowerCase()) || r.product.toLowerCase().includes(search.toLowerCase()));
  });

  const selected      = RETURNS.find(r => r.id === selectedId);
  const totalSaved    = RETURNS.filter(r=>r.status==="deflected").reduce((s,r)=>s+r.marginSaved,0);
  const deflectRate   = Math.round((RETURNS.filter(r=>r.status==="deflected").length / RETURNS.length) * 100);
  const counts        = {
    All:       RETURNS.length,
    Pending:   RETURNS.filter(r=>r.status==="pending").length,
    Deflected: RETURNS.filter(r=>r.status==="deflected").length,
    Processed: RETURNS.filter(r=>r.status==="processed").length,
  };

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Returns</h1>
          <p style={{fontSize:11.5,color:C.muted}}>${totalSaved.toFixed(2)} margin saved this week · {deflectRate}% deflection rate</p>
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
          {label:"Margin Saved",      value:`$${totalSaved.toFixed(2)}`,                           color:C.teal,  icon:"🛡"},
          {label:"Deflection Rate",   value:`${deflectRate}%`,                                     color:C.coral, icon:"↩"},
          {label:"Total at Risk",     value:`$${RETURNS.reduce((s,r)=>s+r.orderValue,0).toFixed(2)}`,color:C.amber,icon:"⚠"},
          {label:"Deflected Returns", value:`${RETURNS.filter(r=>r.status==="deflected").length} / ${RETURNS.length}`,color:C.blue,icon:"✓"},
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

        {/* Returns list */}
        <div style={{width:290,flexShrink:0,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",background:C.surface}}>
          <div style={{padding:"12px 12px 8px"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 13px",borderRadius:10,background:C.card,border:`1px solid ${C.border}`}}>
              <span style={{color:C.muted,fontSize:14}}>🔍</span>
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

          <div style={{flex:1,overflowY:"auto"}}>
            {filtered.map(r=>{
              const s  = STATUS_R[r.status];
              const rs = REASON_CFG[r.reason];
              return (
                <div key={r.id} className="return-row" onClick={()=>setSelectedId(r.id)}
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

          {/* Bottom summary */}
          <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,background:C.card}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
              <span style={{fontSize:12,color:C.muted}}>Total refund risk</span>
              <span style={{fontSize:13,fontWeight:700,color:C.text}}>${RETURNS.reduce((s,r)=>s+r.orderValue,0).toFixed(2)}</span>
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

        {/* Detail panel */}
        {selected && (
          <div className="sr" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            {/* Header */}
            <div style={{padding:"15px 24px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:13}}>
                <div style={{width:40,height:40,borderRadius:12,flexShrink:0,background:`${selected.avatarColor}20`,border:`1px solid ${selected.avatarColor}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:selected.avatarColor}}>{selected.avatar}</div>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                    <span style={{fontSize:15,fontWeight:700,color:C.text}}>{selected.name}</span>
                    <span className="tag" style={{color:REASON_CFG[selected.reason].color,background:`${REASON_CFG[selected.reason].color}12`}}>{REASON_CFG[selected.reason].label}</span>
                    <span className="tag" style={{color:STATUS_R[selected.status].color,background:STATUS_R[selected.status].bg}}>{STATUS_R[selected.status].label}</span>
                  </div>
                  <span style={{fontSize:12,color:C.muted}}>{selected.email} · {selected.id} · Order {selected.orderRef}</span>
                </div>
              </div>
              {selected.status==="pending" && (
                <button className="btn-primary" style={{padding:"7px 16px",borderRadius:8,color:"#fff",fontWeight:600,fontSize:13}}>⚡ Override AI</button>
              )}
            </div>

            {/* Scrollable body */}
            <div style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,background:C.bg}}>

              {/* Outcome banners */}
              {selected.status==="deflected" && (
                <div style={{padding:"16px 20px",borderRadius:14,background:"rgba(62,207,178,.07)",border:"1px solid rgba(62,207,178,.20)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
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
                <div style={{padding:"14px 18px",borderRadius:14,background:"rgba(240,160,75,.06)",border:"1px solid rgba(240,160,75,.18)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
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

              {/* Two-col */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                {/* Product */}
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

                {/* Offer */}
                <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                  <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:14}}>AI Deflection Offer</h3>
                  <div style={{fontSize:32,marginBottom:10}}>{selected.offer.icon}</div>
                  <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>{selected.offer.type}</div>
                  <div style={{fontSize:12.5,color:C.sub,lineHeight:1.65,marginBottom:12}}>{selected.offer.detail}</div>
                  <span className="tag" style={{
                    color:  selected.status==="deflected"?C.teal:selected.status==="pending"?C.amber:"#FF5272",
                    background:selected.status==="deflected"?"rgba(62,207,178,.10)":selected.status==="pending"?"rgba(240,160,75,.10)":"rgba(255,82,114,.10)",
                  }}>
                    {selected.status==="deflected"?"✓ Customer Accepted":selected.status==="pending"?"⏳ Awaiting Response":"— Not Applicable"}
                  </span>
                </div>
              </div>

              {/* Conversation */}
              <div style={{padding:18,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
                <h3 style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:16}}>AI Deflection Conversation</h3>
                {selected.conversation.map((msg,i)=><Bubble key={i} msg={msg} idx={i}/>)}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
