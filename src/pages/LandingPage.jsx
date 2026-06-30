import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../tokens";
import { Menu, X, Bot, RotateCcw, ShoppingCart, BarChart3, ArrowUpRight } from "lucide-react";

const PLANS = [
  { name:"Starter", price:"$19", popular:false, features:["AI Support Agent","1,000 tickets/mo","Basic cart recovery","Email support"] },
  { name:"Growth",  price:"$69", popular:true,  features:["Everything in Starter","5,000 tickets/mo","Advanced cart recovery","Return deflection","Priority support"] },
  { name:"Scale",   price:"$169", popular:false, features:["Everything in Growth","Unlimited tickets","Custom AI training","Dedicated manager","SLA guarantee"] },
];

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html, body { background: var(--bg, #060008) !important; }
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes orbPulse{0%,100%{transform:scale(1);opacity:.40;}50%{transform:scale(1.08);opacity:.62;}}
      @keyframes menuSlide{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
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
      .nav-links-desktop{display:flex;gap:32px;}
      .nav-actions-desktop{display:flex;gap:10px;align-items:center;}
      .nav-hamburger{display:none;}
      .nav-dropdown{display:none;}
      @media(max-width:767px){
        .nav-links-desktop{display:none;}
        .nav-actions-desktop{display:none;}
        .nav-hamburger{display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;border:1px solid var(--border);border-radius:8px;width:38px;height:38px;font-size:18px;color:var(--text);transition:border-color .15s,color .15s;}
        .nav-hamburger:hover{border-color:#E55266;color:#E55266;}
        .nav-dropdown{display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--surface);border-bottom:1px solid var(--border);backdrop-filter:blur(20px);animation:menuSlide .22s cubic-bezier(.16,1,.3,1) both;z-index:99;padding:8px 16px 16px;}
        .features-grid{grid-template-columns:1fr!important;gap:14px!important;}
        .pricing-grid{grid-template-columns:1fr!important;gap:24px!important;}
      }
      @media(min-width:768px){
        .stats-cell{padding:28px 20px!important;}
        .stats-number{font-size:32px!important;}
        .stats-label{font-size:13px!important;color:var(--muted)!important;}
        .stats-divider{border-right:1px solid var(--border-hi)!important;}
        .pricing-card{padding:36px!important;}
        .pricing-plan-name{font-size:14.5px!important;color:var(--text)!important;}
        .pricing-price{font-size:48px!important;}
        .pricing-features{gap:14px!important;}
        .pricing-feature-text{font-size:15px!important;}
        .hiw-section{padding:80px 40px!important;}
        .hiw-step-circle{width:62px!important;height:62px!important;font-size:18px!important;}
        .hiw-connector{height:3px!important;opacity:.45!important;top:31px!important;}
        .hiw-step-title{font-size:19px!important;}
        .hiw-step-desc{font-size:15px!important;}
        .feat-card{padding:36px!important;}
        .feat-icon{margin-bottom:24px!important;}
        .feat-title{font-size:19px!important;font-weight:800!important;margin-bottom:14px!important;}
        .feat-desc{font-size:15px!important;margin-bottom:24px!important;}
        .feat-badge{padding:10px 16px!important;}
        .feat-badge-text{font-size:13px!important;}
        .cta-section{padding:100px 48px!important;}
        .cta-heading{font-size:clamp(34px,5vw,62px)!important;}
        .cta-sub{font-size:17px!important;}
        .hero-section{padding-top:60px!important;}
      }
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
      <span style={{color:C.coral}}>SOLVA<span style={{color:C.sub,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

const NAV_IDS = { "Features":"features", "How It Works":"how-it-works", "Pricing":"pricing" };

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const VARIANT_IDS = { Starter: '1816146', Growth: '1816190', Scale: '1816290' };

  const handleCheckout = async (planName) => {
    setCheckoutLoading(planName);
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId: VARIANT_IDS[planName] }),
      });
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const scrollTo = (label) => {
    const id = NAV_IDS[label];
    if (!id) return;
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 64, behavior: "smooth" });
  };

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text,overflowX:"hidden",paddingTop:64}}>
      <GlobalStyles/>

      {/* Ambient orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div className="orb" style={{width:600,height:600,top:"-180px",left:"50%",transform:"translateX(-50%)",background:"rgba(229,82,102,.10)"}}/>
        <div className="orb" style={{width:400,height:400,bottom:"5%",right:"-100px",background:"rgba(78,2,105,.20)",animationDelay:"3s"}}/>
      </div>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:1000,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 44px",background:C.surface,borderBottom:`1px solid ${C.borderHi}`,backdropFilter:"blur(20px)"}}>
        <SolvaLogo/>

        {/* Desktop links */}
        <div className="nav-links-desktop">
          {["Features","How It Works","Pricing","Docs"].map(l=>(
            <span key={l} className="nav-link" onClick={()=>scrollTo(l)} style={{fontSize:14,color:C.text,fontWeight:500}}>{l}</span>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="nav-actions-desktop">
          <button className="btn-ghost" onClick={()=>navigate("/login")} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${C.border}`,color:C.text,fontSize:13.5}}>Sign In</button>
          <button className="btn-primary" onClick={()=>navigate("/onboarding")} style={{padding:"9px 22px",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13.5}}>Get Started →</button>
        </div>

        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={()=>setMenuOpen(o=>!o)} aria-label={menuOpen?"Close menu":"Open menu"}>
          {menuOpen ? <X size={22} strokeWidth={2}/> : <Menu size={22} strokeWidth={2}/>}
        </button>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="nav-dropdown">
            {["Features","How It Works","Pricing","Docs"].map(l=>(
              <span key={l} className="nav-link" onClick={()=>{ closeMenu(); scrollTo(l); }}
                style={{fontSize:15,color:C.text,fontWeight:500,padding:"13px 8px",borderBottom:`1px solid ${C.border}`}}>
                {l}
              </span>
            ))}
            <div style={{display:"flex",flexDirection:"column",gap:10,paddingTop:14}}>
              <button className="btn-ghost" onClick={()=>{closeMenu();navigate("/login");}}
                style={{padding:"12px",borderRadius:9,border:`1px solid ${C.border}`,color:C.text,fontSize:14,width:"100%"}}>
                Sign In
              </button>
              <button className="btn-primary" onClick={()=>{closeMenu();navigate("/onboarding");}}
                style={{padding:"12px",borderRadius:9,color:"#fff",fontWeight:700,fontSize:14,width:"100%"}}>
                Get Started →
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero-section" style={{position:"relative",zIndex:1,textAlign:"center",padding:"48px 40px 80px"}}>
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
          <button className="btn-primary" onClick={()=>navigate("/onboarding")} style={{padding:"14px 30px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15}}>Connect Your Store Free →</button>
          <button className="btn-ghost" onClick={()=>navigate("/dashboard")} style={{padding:"14px 30px",borderRadius:10,border:`1px solid ${C.border}`,color:C.text,fontWeight:500,fontSize:15,display:"flex",alignItems:"center",gap:8}}>View Live Demo <ArrowUpRight size={18} strokeWidth={2}/></button>
        </div>

        {/* Stats bar */}
        <div className="fu fu4" style={{display:"flex",maxWidth:560,margin:"0 auto",borderRadius:14,overflow:"hidden",border:`1px solid ${C.border}`}}>
          {[["2 min","Average Setup Time"],["24/7","Automated Support"],["14 days","Free Trial"]].map(([v,l],i)=>(
            <div key={i} className={i<2?"stats-cell stats-divider":"stats-cell"} style={{flex:1,padding:"20px 14px",background:C.surface,textAlign:"center",borderRight:i<2?`1px solid ${C.border}`:"none"}}>
              <div className="stats-number" style={{fontSize:23,fontWeight:800,background:C.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:5}}>{v}</div>
              <div className="stats-label" style={{fontSize:11.5,color:C.muted,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{position:"relative",zIndex:1,padding:"56px 40px",maxWidth:1060,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:50}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:C.coral,marginBottom:10,textTransform:"uppercase"}}>Core Systems</p>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(26px,4vw,44px)",fontWeight:800,letterSpacing:"-.02em"}}>Three automations. Zero manual work.</h2>
        </div>
        <div className="features-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {[
            {icon:<Bot size={28} strokeWidth={2}/>,         title:"AI Support Agent",  color:C.teal,  stat:"Resolves tickets instantly",desc:"Handles order inquiries, shipping questions, and FAQs automatically. Only escalates what truly needs a human."},
            {icon:<RotateCcw size={28} strokeWidth={2}/>,   title:"Return Deflection",  color:C.amber, stat:"Deflects before refunds", desc:"Before a return is processed, our AI offers smart alternatives — exchanges, discounts, troubleshooting."},
            {icon:<ShoppingCart size={28} strokeWidth={2}/>,title:"Cart Recovery",      color:C.blue,  stat:"3-touch recovery sequence",desc:"A 3-touch AI sequence — email, SMS, and a personalised follow-up — written dynamically based on cart contents."},
          ].map((f,i)=>(
            <div key={i} className="card-hover feat-card" style={{padding:28,borderRadius:16,background:C.card,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
              <div className="feat-icon" style={{width:48,height:48,borderRadius:13,marginBottom:18,background:`${f.color}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{f.icon}</div>
              <h3 className="feat-title" style={{fontFamily:"'Outfit',sans-serif",fontSize:17.5,fontWeight:700,marginBottom:10}}>{f.title}</h3>
              <p className="feat-desc" style={{fontSize:13.5,color:C.sub,lineHeight:1.68,marginBottom:18,flex:1}}>{f.desc}</p>
              <div className="feat-badge" style={{padding:"7px 13px",borderRadius:8,background:`${f.color}10`,border:`1px solid ${f.color}26`}}>
                <span className="feat-badge-text" style={{fontSize:11.5,color:f.color,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}><BarChart3 size={14} strokeWidth={2}/>{f.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="hiw-section" style={{padding:"56px 40px",maxWidth:820,margin:"0 auto",textAlign:"center"}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:C.magenta,marginBottom:10,textTransform:"uppercase"}}>Setup in Minutes</p>
        <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(24px,4vw,42px)",fontWeight:800,letterSpacing:"-.02em",marginBottom:52}}>How Solva Works</h2>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:34,position:"relative"}}>
          <div className="hiw-connector" style={{position:"absolute",top:24,left:"17%",right:"17%",height:1,background:`linear-gradient(90deg,${C.coral},${C.violet})`,opacity:.25,pointerEvents:"none"}}/>
          {[
            {n:"01",title:"Connect Your Store",  desc:"Link your Shopify store with one click. No code, no complexity."},
            {n:"02",title:"Configure Your AI",   desc:"Set your brand tone, escalation rules, and recovery preferences."},
            {n:"03",title:"Go Live Instantly",   desc:"Flip the switch. Automation starts from the very first minute."},
          ].map((s,i)=>(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
              <div className="hiw-step-circle" style={{width:50,height:50,borderRadius:"50%",position:"relative",zIndex:1,background:C.card,border:`1px solid ${C.borderHi}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:14,color:C.coral}}>{s.n}</div>
              <h3 className="hiw-step-title" style={{fontFamily:"'Outfit',sans-serif",fontSize:16.5,fontWeight:700}}>{s.title}</h3>
              <p className="hiw-step-desc" style={{fontSize:13.5,color:C.sub,lineHeight:1.68}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:"56px 40px",maxWidth:900,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:46}}>
          <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:C.coral,marginBottom:10,textTransform:"uppercase"}}>Pricing</p>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(24px,4vw,42px)",fontWeight:800,letterSpacing:"-.02em"}}>Simple, Transparent Pricing</h2>
        </div>
        <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {PLANS.map((plan,i)=>(
            <div key={i} className={`card-hover pricing-card${plan.popular?" grad-border":""}`}
              style={{padding:28,borderRadius:16,position:"relative",background:plan.popular?"linear-gradient(160deg,#1C001E 0%,#2A0035 55%,#1A001A 100%)":C.card,border:plan.popular?"none":`1px solid ${C.border}`}}>
              {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",padding:"4px 16px",borderRadius:100,background:C.grad,color:"#fff",fontSize:10.5,fontWeight:700,whiteSpace:"nowrap"}}>MOST POPULAR</div>}
              <p className="pricing-plan-name" style={{fontSize:12.5,color:plan.popular?"#fff":C.sub,fontWeight:600,marginBottom:8}}>{plan.name}</p>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:20}}>
                <span className="pricing-price" style={{fontFamily:"'Outfit',sans-serif",fontSize:38,fontWeight:800,...(plan.popular?{color:"#fff"}:{color:C.text})}}>{plan.price}</span>
                <span style={{fontSize:13,color:plan.popular?"rgba(255,255,255,.55)":C.muted}}>/mo</span>
              </div>
              <div className="pricing-features" style={{display:"flex",flexDirection:"column",gap:10,marginBottom:24}}>
                {plan.features.map((f,j)=>(
                  <div key={j} style={{display:"flex",gap:9,alignItems:"flex-start"}}>
                    <span style={{color:plan.popular?"rgba(255,255,255,.7)":C.coral,fontSize:13,marginTop:1,flexShrink:0}}>✓</span>
                    <span className="pricing-feature-text" style={{fontSize:13.5,color:plan.popular?"rgba(255,255,255,.85)":C.sub}}>{f}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-primary"
                disabled={checkoutLoading === plan.name}
                onClick={() => handleCheckout(plan.name)}
                style={{width:"100%",padding:"11px",borderRadius:9,color:"#fff",fontWeight:600,fontSize:13.5,opacity:checkoutLoading===plan.name?.65:1}}>
                {checkoutLoading === plan.name ? "Loading..." : "Get Started →"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <div className="cta-section" style={{margin:"16px 36px 52px",borderRadius:22,background:`linear-gradient(160deg,${C.surface} 0%,${C.dim} 100%)`,border:`1px solid ${C.border}`,borderTop:`1px solid ${C.borderHi}`,padding:"68px 40px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:"radial-gradient(ellipse 60% 90% at 50% 0%,rgba(229,82,102,.13),transparent)"}}/>
        <h2 className="cta-heading" style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(28px,4.5vw,50px)",fontWeight:800,letterSpacing:"-.025em",marginBottom:14,position:"relative"}}>
          Ready to solve everything<br/>on autopilot?
        </h2>
        <p className="cta-sub" style={{color:C.sub,fontSize:15.5,marginBottom:32,position:"relative"}}>Built for Shopify stores that want to automate support, returns, and cart recovery — all in one place.</p>
        <button className="btn-primary" onClick={()=>navigate("/onboarding")} style={{padding:"16px 36px",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15.5,position:"relative"}}>
          Connect Your Store — It's Free →
        </button>
      </div>

      {/* Footer links */}
      <div style={{textAlign:"center",padding:"0 24px 48px",display:"flex",justifyContent:"center",gap:28}}>
        <span onClick={()=>navigate("/privacy")} style={{fontSize:13,color:C.muted,cursor:"pointer",textDecoration:"none"}}
          onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
          onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>
          Privacy Policy
        </span>
        <span onClick={()=>navigate("/terms")} style={{fontSize:13,color:C.muted,cursor:"pointer",textDecoration:"none"}}
          onMouseEnter={e=>e.currentTarget.style.textDecoration="underline"}
          onMouseLeave={e=>e.currentTarget.style.textDecoration="none"}>
          Terms of Service
        </span>
      </div>
    </div>
  );
}
