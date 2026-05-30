import { useState } from "react";
import { C } from "../tokens";

const PLANS = [
  { name:"Starter", price:"$299", popular:false, features:["AI Support Agent","1,000 tickets/mo","Basic cart recovery","Email support"] },
  { name:"Growth",  price:"$599", popular:true,  features:["Everything in Starter","5,000 tickets/mo","Advanced cart recovery","Return deflection","Priority support"] },
  { name:"Scale",   price:"$1,199", popular:false, features:["Everything in Growth","Unlimited tickets","Custom AI training","Dedicated manager","SLA guarantee"] },
];

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html,body{background:#060008;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes orbPulse{0%,100%{transform:scale(1);opacity:.40;}50%{transform:scale(1.08);opacity:.62;}}
      .fu{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
      .fu1{animation-delay:.08s;}.fu2{animation-delay:.16s;}.fu3{animation-delay:.24s;}.fu4{animation-delay:.32s;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .nav-link{cursor:pointer;transition:color .15s ease;}
      .nav-link:hover{color:#E55266!important;}
      .card-hover{transition:transform .22s ease,box-shadow .22s ease;}
      .card-hover:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5);}
      .grad-border{position:relative;}
      .grad-border::before{content:'';position:absolute;inset:-1px;border-radius:17px;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);z-index:-1;}
      .orb{border-radius:50%;filter:blur(90px);animation:orbPulse 7s ease-in-out infinite;position:absolute;pointer-events:none;}
    `}</style>
  );
}

function SolvaLogo({ size=16 }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:size,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgLand" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgLand)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

export default function LandingPage({ goOnboard, goDash }) {
  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text,overflowX:"hidden"}}>
      <GlobalStyles/>

      {/* Ambient orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div className="orb" style={{width:600,height:600,top:"-180px",left:"50%",transform:"translateX(-50%)",background:"rgba(229,82,102,.10)"}}/>
        <div className="orb" style={{width:400,height:400,bottom:"5%",right:"-100px",background:"rgba(78,2,105,.20)",animationDelay:"3s"}}/>
      </div>

      {/* NAV */}
      <nav style={{position:"sticky",top:0,zIndex:100,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 44px",background:"rgba(6,0,8,.88)",borderBottom:`1px solid ${C.border}`,backdropFilter:"blur(20px)"}}>
        <SolvaLogo/>
        <div style={{display:"flex",gap:32}}>
          {["Features","How It Works","Pricing","Docs"].map(l=>(
            <span key={l} className="nav-link" style={{fontSize:14,color:C.sub,fontWeight:500}}>{l}</span>
          ))}
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <button className="btn-ghost" onClick={goDash} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${C.border}`,color:C.sub,fontSize:13.5}}>Sign In</button>
          <button className="btn-primary" onClick={goOnboard} style={{padding:"9px 22px",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13.5}}>Get Started →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{position:"relative",zIndex:1,textAlign:"center",padding:"100px 40px 80px"}}>
        <div className="fu" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",borderRadius:100,background:"rgba(229,82,102,.08)",border:"1px solid rgba(229,82,102,.22)",marginBottom:28}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:C.coral,display:"inline-block"}}/>
          <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".07em"}}>SOLVA — AI AUTOMATION FOR SHOPIFY STORES</span>
        </div>
        <h1 className="fu fu1" style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(42px,6.5vw,78px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-.03em",marginBottom:24}}>
          Every Problem.<br/>
          <span style={{background:"linear-gradient(130deg,#E55266 0%,#992A67 55%,#C05AFF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Solved.</span>
        </h1>
        <p className="fu fu2" style={{fontSize:"clamp(14px,1.8vw,17.5px)",color:C.sub,maxWidth:480,margin:"0 auto 42px",lineHeight:1.75}}>
          Connect your Shopify store in 2 minutes. Solva handles every support ticket, deflects returns, and recovers abandoned carts — automatically, 24/7.
        </p>
        <div className="fu fu3" style={{display:"flex",gap:12,justifyContent:"center",marginBottom:64}}>
          <button className="btn-primary" onClick={goOnboard} style={{padding:"14px 30px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15}}>Connect Your Store Free →</button>
          <button className="btn-ghost" onClick={goDash} style={{padding:"14px 30px",borderRadius:10,border:`1px solid ${C.border}`,color:C.text,fontWeight:500,fontSize:15}}>View Live Demo ↗</button>
        </div>

        {/* Stats bar */}
        <div className="fu fu4" style={{display:"flex",maxWidth:560,margin:"0 auto",borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`}}>
          {[["1.2M+","Tickets Resolved"],["$4.8M","Revenue Recovered"],["98.3%","Satisfaction Rate"]].map(([v,l],i)=>(
            <div key={i} style={{flex:1,padding:"20px 14px",background:C.surface,textAlign:"center",borderRight:i<2?`1px solid ${C.border}`:"none"}}>
              <div style={{fontSize:23,fontWeight:800,background:C.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:5}}>{v}</div>
              <div style={{fontSize:11.5,color:C.muted,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{position:"relative",zIndex:1,padding:"56px 40px",maxWidth:1060,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:50}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:C.coral,marginBottom:10,textTransform:"uppercase"}}>Core Systems</p>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(26px,4vw,44px)",fontWeight:800,letterSpacing:"-.02em"}}>Three automations. Zero manual work.</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {[
            {icon:"🤖",title:"AI Support Agent",  color:C.teal,  stat:"87% auto-resolution",desc:"Handles order inquiries, shipping questions, and FAQs automatically. Only escalates what truly needs a human."},
            {icon:"↩", title:"Return Deflection",  color:C.amber, stat:"28% deflection rate", desc:"Before a return is processed, our AI offers smart alternatives — exchanges, discounts, troubleshooting."},
            {icon:"🛒",title:"Cart Recovery",      color:C.blue,  stat:"19% average recovery",desc:"A 3-touch AI sequence — email, SMS, and a personalised follow-up — written dynamically based on cart contents."},
          ].map((f,i)=>(
            <div key={i} className="card-hover" style={{padding:28,borderRadius:16,background:C.card,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
              <div style={{width:48,height:48,borderRadius:13,marginBottom:18,background:`${f.color}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{f.icon}</div>
              <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:17.5,fontWeight:700,marginBottom:10}}>{f.title}</h3>
              <p style={{fontSize:13.5,color:C.sub,lineHeight:1.68,marginBottom:18,flex:1}}>{f.desc}</p>
              <div style={{padding:"7px 13px",borderRadius:8,background:`${f.color}10`,border:`1px solid ${f.color}26`}}>
                <span style={{fontSize:11.5,color:f.color,fontWeight:600}}>📊 {f.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{padding:"56px 40px",maxWidth:820,margin:"0 auto",textAlign:"center"}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:C.magenta,marginBottom:10,textTransform:"uppercase"}}>Setup in Minutes</p>
        <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(24px,4vw,42px)",fontWeight:800,letterSpacing:"-.02em",marginBottom:52}}>How Solva Works</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:34,position:"relative"}}>
          <div style={{position:"absolute",top:24,left:"17%",right:"17%",height:1,background:`linear-gradient(90deg,${C.coral},${C.violet})`,opacity:.25,pointerEvents:"none"}}/>
          {[
            {n:"01",title:"Connect Your Store",  desc:"Link your Shopify store with one click. No code, no complexity."},
            {n:"02",title:"Configure Your AI",   desc:"Set your brand tone, escalation rules, and recovery preferences."},
            {n:"03",title:"Go Live Instantly",   desc:"Flip the switch. Automation starts from the very first minute."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
              <div style={{width:50,height:50,borderRadius:"50%",position:"relative",zIndex:1,background:C.card,border:`1px solid ${C.borderHi}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:14,color:C.coral}}>{s.n}</div>
              <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:16.5,fontWeight:700}}>{s.title}</h3>
              <p style={{fontSize:13.5,color:C.sub,lineHeight:1.68}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{padding:"56px 40px",maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:46}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:C.coral,marginBottom:10,textTransform:"uppercase"}}>Pricing</p>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(24px,4vw,42px)",fontWeight:800,letterSpacing:"-.02em"}}>Simple, Transparent Pricing</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {PLANS.map((plan,i)=>(
            <div key={i} className={`card-hover${plan.popular?" grad-border":""}`}
              style={{padding:28,borderRadius:16,position:"relative",background:plan.popular?C.surface:C.card,border:plan.popular?"none":`1px solid ${C.border}`}}>
              {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",padding:"4px 16px",borderRadius:100,background:C.grad,color:"#fff",fontSize:10.5,fontWeight:700,whiteSpace:"nowrap"}}>MOST POPULAR</div>}
              <p style={{fontSize:12.5,color:C.sub,fontWeight:600,marginBottom:8}}>{plan.name}</p>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:20}}>
                <span style={{fontFamily:"'Outfit',sans-serif",fontSize:38,fontWeight:800,...(plan.popular?{background:C.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}:{color:C.text})}}>{plan.price}</span>
                <span style={{fontSize:13,color:C.muted}}>/mo</span>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                {plan.features.map((f,j)=>(
                  <div key={j} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                    <span style={{color:C.coral,fontSize:13,marginTop:1,flexShrink:0}}>✓</span>
                    <span style={{fontSize:13.5,color:C.sub}}>{f}</span>
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={goOnboard} style={{width:"100%",padding:"11px",borderRadius:9,color:"#fff",fontWeight:600,fontSize:13.5}}>Get Started →</button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <div style={{margin:"16px 36px 52px",borderRadius:22,background:C.surface,border:`1px solid ${C.border}`,padding:"68px 40px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 60% 90% at 50% 0%,rgba(229,82,102,.09),transparent)"}}/>
        <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(28px,4.5vw,50px)",fontWeight:800,letterSpacing:"-.025em",marginBottom:14,position:"relative"}}>
          Ready to solve everything<br/>on autopilot?
        </h2>
        <p style={{color:C.sub,fontSize:15.5,marginBottom:32,position:"relative"}}>Join 800+ Shopify stores already solving on autopilot with Solva.</p>
        <button className="btn-primary" onClick={goOnboard} style={{padding:"16px 36px",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15.5,position:"relative"}}>
          Connect Your Store — It's Free →
        </button>
      </div>
    </div>
  );
}