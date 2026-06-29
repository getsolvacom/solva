import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../tokens";
import { Menu, X, Bot, RotateCcw, ShoppingCart, BarChart3, ArrowUpRight, ChevronDown, Globe, AtSign, Hash, Play } from "lucide-react";

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
      @media(max-width:767px){
        .stats-strip-grid{display:grid!important;grid-template-columns:1fr 1fr!important;}
        .stats-strip-grid > div:nth-child(2){border-right:none!important;}
        .stats-strip-grid > div:nth-child(3){border-top:1px solid var(--border-hi)!important;}
        .stats-strip-grid > div:nth-child(4){border-top:1px solid var(--border-hi)!important;border-right:none!important;}
        .logo-bar-row{gap:28px!important;}
        .logo-bar-label{font-size:9px!important;}
        .testimonials-grid{grid-template-columns:1fr!important;}
        .footer-grid{grid-template-columns:1fr 1fr!important;gap:32px!important;}
        .cta-section-inner{padding:70px 24px 60px!important;}
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
  const [openFaq, setOpenFaq] = useState([]);

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
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text,overflowX:"hidden",paddingTop:100}}>
      {/* Announcement Bar */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:1001,height:36,display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(90deg,#1A0020,#2A0035,#1A0020)",borderBottom:"1px solid var(--border-hi)"}}>
        <p style={{fontSize:12,color:"rgba(245,234,242,0.75)",fontWeight:500,letterSpacing:".04em"}}>
          <span style={{color:"#E55266"}}>✦</span>{" "}14-day free trial on all plans{" "}<span style={{color:"#E55266"}}>·</span>{" "}No credit card required{" "}<span style={{color:"#E55266"}}>·</span>{" "}Connect your store in 2 minutes{" "}<span style={{color:"#E55266"}}>→</span>
        </p>
      </div>
      <GlobalStyles/>

      {/* Ambient orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div className="orb" style={{width:600,height:600,top:"-180px",left:"50%",transform:"translateX(-50%)",background:"rgba(229,82,102,.10)"}}/>
        <div className="orb" style={{width:400,height:400,bottom:"5%",right:"-100px",background:"rgba(78,2,105,.20)",animationDelay:"3s"}}/>
      </div>

      {/* NAV */}
      <nav style={{position:"fixed",top:36,left:0,right:0,zIndex:1000,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 44px",background:C.surface,borderBottom:`1px solid ${C.borderHi}`,backdropFilter:"blur(20px)"}}>
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

      {/* SOCIAL PROOF LOGO BAR */}
      <section style={{padding:"32px 40px",borderTop:"1px solid var(--border)",borderBottom:"1px solid var(--border)",background:"var(--surface)",textAlign:"center"}}>
        <p className="logo-bar-label" style={{fontSize:10,fontWeight:700,letterSpacing:".14em",color:"var(--muted)",marginBottom:28,textTransform:"uppercase"}}>TRUSTED BY SHOPIFY STORES WORLDWIDE</p>
        <div className="logo-bar-row" style={{display:"flex",justifyContent:"center",gap:48,flexWrap:"wrap"}}>
          {["NORDVIK","VELOUR","KINSFOLK","ASHBURY","PLUME","DAWNSET","MEROVA"].map(name=>(
            <span key={name} style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:800,letterSpacing:".10em",color:"var(--muted)",opacity:0.45,textTransform:"uppercase"}}>{name}</span>
          ))}
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section style={{padding:"80px 40px",maxWidth:860,margin:"0 auto",textAlign:"center"}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:"#E55266",textTransform:"uppercase",marginBottom:16}}>THE PROBLEM</p>
        <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(28px,4.2vw,50px)",fontWeight:800,letterSpacing:"-.025em",lineHeight:1.1,marginBottom:24}}>
          Every second without a response is{" "}
          <span style={{background:"linear-gradient(130deg,#E55266 0%,#992A67 55%,#C05AFF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>a sale walking out the door.</span>
        </h2>
        <p style={{maxWidth:620,margin:"0 auto 52px",fontSize:"clamp(14px,1.6vw,16.5px)",color:"var(--sub)",lineHeight:1.8}}>
          Shoppers abandon carts, submit return requests, and fire off support emails every hour. Most Shopify stores respond with silence — or a 48-hour wait. By then, the customer is gone, the refund is issued, and the revenue is lost.
        </p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1px",borderRadius:14,overflow:"hidden",border:"1px solid var(--border)"}}>
          {[
            {icon:<ShoppingCart size={22} strokeWidth={2} style={{color:"#FF5272"}}/>, title:"67% of carts are abandoned",        body:"Most stores never follow up. The ones that do use generic templates that feel robotic and get ignored."},
            {icon:<RotateCcw size={22} strokeWidth={2} style={{color:"#F0A04B"}}/>,   title:"Return requests kill margins",       body:"Every return processed without an alternative offer is margin you'll never recover. Stores accept returns by default — they shouldn't."},
            {icon:<Bot size={22} strokeWidth={2} style={{color:"#5BADFF"}}/>,         title:"Support tickets pile up fast",       body:"A single viral post or shipping delay can flood your inbox. Without automation, your team drowns in repetitive questions."},
          ].map((card,i)=>(
            <div key={i} style={{background:"var(--card)",padding:"32px 28px",textAlign:"left"}}>
              {card.icon}
              <div style={{fontSize:17,fontWeight:700,color:"var(--text)",margin:"14px 0 10px"}}>{card.title}</div>
              <div style={{fontSize:13.5,color:"var(--sub)",lineHeight:1.68}}>{card.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* STATS STRIP */}
      <div style={{background:"linear-gradient(135deg,#0C000F,#160020,#0C000F)",borderTop:"1px solid var(--border-hi)",borderBottom:"1px solid var(--border-hi)",padding:0}}>
        <div className="stats-strip-grid" style={{display:"flex"}}>
          {[
            {val:"87%",   label:"Of support tickets auto-resolved"},
            {val:"<1 min",label:"Average AI response time"},
            {val:"19%",   label:"Average cart recovery rate"},
            {val:"3x ROI",label:"Within the first 30 days"},
          ].map((s,i)=>(
            <div key={i} style={{flex:1,padding:"36px 20px",textAlign:"center",borderRight:i<3?"1px solid var(--border-hi)":"none"}}>
              <div style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800,background:"linear-gradient(130deg,#E55266,#992A67,#C05AFF)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{s.val}</div>
              <div style={{fontSize:12.5,color:"var(--muted)",fontWeight:500,marginTop:6}}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section style={{padding:"80px 40px",maxWidth:1060,margin:"0 auto"}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:"#E55266",textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>WHAT MERCHANTS SAY</p>
        <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(26px,3.8vw,44px)",fontWeight:800,letterSpacing:"-.02em",marginBottom:48,textAlign:"center",color:"var(--text)"}}>Results that actually move the needle.</h2>
        <div className="testimonials-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:18}}>
          {[
            {quote:"We were losing 3-4 customers a day to unanswered cart emails. Solva recovered $14,000 in the first month alone. It just runs.",name:"Marcus T.",store:"Ashbury Goods",badge:"+$14k recovered",badgeBg:"rgba(94,207,178,0.10)",badgeColor:"#3ECFB2"},
            {quote:"Our return rate dropped 31% in 6 weeks. The AI offers exchanges automatically and most customers just take the deal. Genuinely shocked.",name:"Priya S.",store:"Velour Collective",badge:"−31% returns",badgeBg:"rgba(240,160,75,0.10)",badgeColor:"#F0A04B"},
            {quote:"I was paying for Gorgias, Klaviyo, and Loop Returns separately. Solva replaced all three for less money and less headache. Should've switched sooner.",name:"Daniel R.",store:"Kinsfolk Studio",badge:"3 tools replaced",badgeBg:"rgba(91,173,255,0.10)",badgeColor:"#5BADFF"},
            {quote:"Setup took literally 4 minutes. By the next morning Solva had already resolved 11 support tickets without me touching a single one.",name:"Leila M.",store:"Plume Boutique",badge:"11 tickets, 0 effort",badgeBg:"rgba(229,82,102,0.10)",badgeColor:"#E55266"},
          ].map((t,i)=>(
            <div key={i} style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:"28px 26px",display:"flex",flexDirection:"column",gap:16,transition:"border-color .2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="var(--border-hi)"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
              <div style={{fontSize:14,color:"#F0A04B",letterSpacing:2}}>★★★★★</div>
              <p style={{fontSize:14.5,color:"var(--sub)",lineHeight:1.75,fontStyle:"italic",flex:1}}>{t.quote}</p>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
                <div>
                  <div style={{fontSize:13.5,fontWeight:700,color:"var(--text)"}}>{t.name}</div>
                  <div style={{fontSize:12,color:"var(--muted)",marginTop:2}}>{t.store}</div>
                </div>
                <div style={{padding:"5px 12px",borderRadius:100,fontSize:11,fontWeight:700,background:t.badgeBg,color:t.badgeColor,whiteSpace:"nowrap"}}>{t.badge}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{padding:"80px 40px",maxWidth:760,margin:"0 auto"}}>
        <p style={{fontSize:11,fontWeight:700,letterSpacing:".12em",color:"var(--muted)",textTransform:"uppercase",marginBottom:12,textAlign:"center"}}>FAQ</p>
        <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(26px,3.8vw,44px)",fontWeight:800,letterSpacing:"-.02em",marginBottom:48,textAlign:"center",color:"var(--text)"}}>Got questions?</h2>
        <div>
          {[
            {q:"Is Solva really free to start?",a:"Yes — every plan includes a 14-day free trial with no credit card required. You connect your store, configure your AI, and start automating immediately. You only get charged after the trial ends."},
            {q:"How long does setup actually take?",a:"Most stores are fully live in under 5 minutes. You connect via Shopify OAuth (one click), answer a few questions about your brand, and Solva starts working immediately."},
            {q:"Will the AI sound like a robot?",a:"No. You set your brand tone during onboarding — formal, friendly, casual, whatever fits your store. The AI writes every response in that voice, using your product knowledge and FAQ library."},
            {q:"What happens when the AI can't answer something?",a:"Solva escalates to your team automatically. You set the threshold — if confidence is below a certain level, it flags the ticket and notifies your escalation email. Nothing falls through the cracks."},
            {q:"Does Solva replace my support team?",a:"It handles the repetitive 80% — order status, shipping questions, return requests, cart follow-ups. Your team gets to focus on complex issues that actually need a human. Most stores see ticket volume drop by 50–70%."},
            {q:"How does cart recovery work?",a:"When a cart is abandoned, Solva triggers a 3-touch sequence — an AI-written email, a follow-up, and a final message — each personalised based on what was in the cart. No templates. Real copy."},
            {q:"Can I use Solva without coding?",a:"Completely. There is no code involved at any step. You connect your Shopify store with OAuth, configure settings through a visual dashboard, and deploy. Zero technical knowledge required."},
            {q:"Which Shopify plans does Solva support?",a:"Solva works with all Shopify plans — Basic, Shopify, Advanced, and Plus. As long as you have a Shopify store, you can connect."},
            {q:"What if I want to cancel?",a:"Cancel anytime from your dashboard — no contracts, no penalties, no awkward cancellation flows. Your data is deleted on request."},
            {q:"How is Solva different from a chatbot?",a:"Chatbots follow scripts. Solva reasons — it reads the full context of a ticket, checks your product knowledge, and writes a genuine response. It also acts: it deflects returns with offers, recovers carts with personalised copy, and escalates intelligently."},
          ].map((item,i)=>{
            const isOpen = openFaq.includes(i);
            return (
              <div key={i} style={{borderBottom:"1px solid var(--border)",cursor:"pointer"}}
                onClick={()=>setOpenFaq(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i])}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",fontSize:15,fontWeight:600,color:"var(--text)"}}>
                  {item.q}
                  <ChevronDown size={18} style={{color:"var(--muted)",flexShrink:0,marginLeft:16,transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform .22s"}}/>
                </div>
                {isOpen && (
                  <div className="fu" style={{padding:"0 0 20px",fontSize:14,color:"var(--sub)",lineHeight:1.78}}>{item.a}</div>
                )}
              </div>
            );
          })}
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
      <div style={{margin:"16px 36px 0",borderRadius:"22px 22px 0 0",background:"linear-gradient(135deg,#1C0022 0%,#2E0040 40%,#1A0030 70%,#0C000F 100%)",border:"1px solid var(--border-hi)",borderBottom:"none",padding:0,textAlign:"center",position:"relative",overflow:"hidden"}}>
        {/* Orbs */}
        <div style={{position:"absolute",width:500,height:500,top:-200,left:"50%",transform:"translateX(-50%)",background:"radial-gradient(circle,rgba(229,82,102,0.18),transparent 70%)",borderRadius:"50%",filter:"blur(1px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:300,height:300,bottom:-100,left:-80,background:"radial-gradient(circle,rgba(78,2,105,0.35),transparent 70%)",borderRadius:"50%",filter:"blur(1px)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",width:300,height:300,bottom:-100,right:-80,background:"radial-gradient(circle,rgba(153,42,103,0.25),transparent 70%)",borderRadius:"50%",filter:"blur(1px)",pointerEvents:"none"}}/>
        {/* Content */}
        <div className="cta-section-inner" style={{position:"relative",zIndex:1,padding:"100px 48px 80px"}}>
          <p style={{fontSize:10,letterSpacing:".16em",color:"rgba(229,82,102,0.7)",fontWeight:700,marginBottom:20,textTransform:"uppercase"}}>JOIN THOUSANDS OF BRANDS</p>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(32px,5vw,64px)",fontWeight:800,letterSpacing:"-.03em",lineHeight:1.05,color:"#fff",marginBottom:18}}>Turn every interaction into revenue.</h2>
          <p style={{fontSize:"clamp(14px,1.8vw,18px)",color:"rgba(245,234,242,0.6)",marginBottom:44,lineHeight:1.7}}>Support. Returns. Cart recovery. All automated. All intelligent. All on autopilot.</p>
          <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap"}}>
            <button className="btn-primary" onClick={()=>navigate("/onboarding")} style={{padding:"16px 36px",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15.5}}>Connect Your Store — It's Free →</button>
            <button onClick={()=>navigate("/dashboard")}
              style={{padding:"16px 28px",borderRadius:12,border:"1px solid rgba(255,255,255,0.15)",background:"transparent",color:"rgba(255,255,255,0.7)",fontSize:15,fontWeight:500,cursor:"pointer",transition:"all .15s",fontFamily:"'Outfit',sans-serif"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(229,82,102,0.5)";e.currentTarget.style.color="#fff";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.15)";e.currentTarget.style.color="rgba(255,255,255,0.7)";}}>
              View Live Demo ↗
            </button>
          </div>
          <p style={{marginTop:20,fontSize:12,color:"rgba(245,234,242,0.35)",letterSpacing:".03em"}}>14-day free trial · No credit card required · Cancel anytime</p>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{background:"#060008",borderTop:"1px solid var(--border)",padding:"64px 48px 40px"}}>
        <div style={{maxWidth:1100,margin:"0 auto"}}>
          {/* Top grid */}
          <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr",gap:48}}>
            {/* Brand column */}
            <div>
              <SolvaLogo size={15}/>
              <p style={{marginTop:14,fontSize:13.5,color:"var(--muted)",lineHeight:1.75,maxWidth:240}}>AI automation for Shopify stores that want to sell more, support better, and scale faster.</p>
              <div style={{marginTop:24,display:"flex",gap:14}}>
                {[
                  {Icon:Globe,   href:"#"},
                  {Icon:AtSign,  href:"#"},
                  {Icon:Hash,    href:"#"},
                  {Icon:Play,    href:"#"},
                ].map(({Icon,href},i)=>(
                  <a key={i} href={href} target="_blank" rel="noreferrer"
                    style={{width:34,height:34,borderRadius:8,border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s",textDecoration:"none"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor="#E55266";e.currentTarget.style.background="rgba(229,82,102,0.08)";e.currentTarget.querySelector("svg").style.color="#E55266";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="transparent";e.currentTarget.querySelector("svg").style.color="var(--muted)";}}>
                    <Icon size={15} style={{color:"var(--muted)",transition:"color .15s"}}/>
                  </a>
                ))}
              </div>
            </div>
            {/* Link columns */}
            {[
              {heading:"Product",   links:[{label:"AI Support Agent"},{label:"Return Deflection"},{label:"Cart Recovery"},{label:"Pricing"},{label:"Changelog"}]},
              {heading:"Company",   links:[{label:"About"},{label:"Blog"},{label:"Careers"},{label:"Press"},{label:"Contact"}]},
              {heading:"Resources", links:[{label:"Documentation"},{label:"Help Center"},{label:"Shopify App"},{label:"Privacy Policy",onClick:()=>navigate("/privacy")},{label:"Terms of Service",onClick:()=>navigate("/terms")}]},
            ].map(col=>(
              <div key={col.heading}>
                <p style={{fontSize:11,fontWeight:700,letterSpacing:".10em",color:"var(--text)",textTransform:"uppercase",marginBottom:18}}>{col.heading}</p>
                <div style={{display:"flex",flexDirection:"column",gap:11}}>
                  {col.links.map(link=>(
                    <span key={link.label} onClick={link.onClick||undefined} style={{fontSize:13.5,color:"var(--muted)",cursor:"pointer",transition:"color .14s"}}
                      onMouseEnter={e=>e.currentTarget.style.color="var(--text)"}
                      onMouseLeave={e=>e.currentTarget.style.color="var(--muted)"}>
                      {link.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {/* Divider */}
          <div style={{marginTop:48,borderTop:"1px solid var(--border)"}}/>
          {/* Bottom row */}
          <div style={{marginTop:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
            <span style={{fontSize:12,color:"rgba(245,234,242,0.2)"}}>© 2026 Solva Technologies Ltd. All rights reserved.</span>
            <div style={{display:"flex",gap:20}}>
              {[{label:"Privacy Policy",onClick:()=>navigate("/privacy")},{label:"Terms of Service",onClick:()=>navigate("/terms")}].map(l=>(
                <span key={l.label} onClick={l.onClick} style={{fontSize:12,color:"rgba(245,234,242,0.25)",cursor:"pointer",transition:"color .14s"}}
                  onMouseEnter={e=>e.currentTarget.style.color="var(--muted)"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(245,234,242,0.25)"}>
                  {l.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}