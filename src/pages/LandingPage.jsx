import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { C, LAYOUT } from "../tokens";
import { supabase } from "../lib/supabase";
import { Menu, X, Bot, RotateCcw, ShoppingCart, BarChart3, ArrowUpRight, Check, Radar, MessageCircle, CheckCircle2, Zap, ShieldCheck, TrendingUp, Link2, Settings2, Sparkles, ShoppingBag, Mail, MessageSquare, Webhook, CreditCard, XCircle, Lock, ChevronDown, Send } from "lucide-react";

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
      :root{--orb-1:rgba(229,82,102,.10);--orb-2:rgba(78,2,105,.20);--eyebrow-border:rgba(229,82,102,.22);--eyebrow-bg:rgba(229,82,102,.08);--nav-border-strong:var(--border-hi);--nav-shadow:none;--announce-bg:#000;--announce-text:var(--sub);--announce-border:var(--border);}
      html.light{--orb-1:rgba(229,82,102,.28);--orb-2:rgba(153,42,103,.24);--eyebrow-border:rgba(229,82,102,.40);--eyebrow-bg:rgba(229,82,102,.14);--nav-border-strong:rgba(78,2,105,.16);--nav-shadow:0 1px 12px rgba(0,0,0,.05);--announce-bg:#FFF5F8;--announce-text:#7A3060;--announce-border:rgba(78,2,105,.12);}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:var(--border-hi);border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes orbPulse{0%,100%{transform:scale(1);opacity:.40;}50%{transform:scale(1.08);opacity:.62;}}
      @keyframes menuSlide{from{opacity:0;transform:translateY(-8px);}to{opacity:1;transform:translateY(0);}}
      @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-14px);}}
      @keyframes typeDot{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-5px);}}
      .hero-mock{animation:float 5s ease-in-out infinite;}
      .mock-widget-card{background:var(--surface);border:1px solid var(--border-hi);border-radius:18px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.35);}
      html.light .mock-widget-card{box-shadow:0 24px 60px rgba(78,2,105,.14);}
      .mock-typing-dot{width:6px;height:6px;border-radius:50%;background:var(--muted);display:inline-block;animation:typeDot 1.2s ease-in-out infinite;}
      .mock-typing-dot:nth-child(2){animation-delay:.18s;}
      .mock-typing-dot:nth-child(3){animation-delay:.36s;}
      .fu{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
      .fu1{animation-delay:.08s;}.fu2{animation-delay:.16s;}.fu3{animation-delay:.24s;}.fu4{animation-delay:.32s;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;font-weight:700;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .nav-link{cursor:pointer;transition:color .15s ease;font-weight:600;}
      .nav-link:hover{color:#E55266!important;}
      .nav-scrolled{--nav-shadow:0 8px 24px rgba(0,0,0,.35);border-bottom-color:var(--border-hi)!important;}
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
        .ann-bar{font-size:11.5px!important;padding:8px 16px!important;}
        .nav-links-desktop{display:none;}
        .nav-actions-desktop{display:none;}
        .nav-hamburger{display:flex;align-items:center;justify-content:center;cursor:pointer;background:transparent;border:1px solid var(--border);border-radius:8px;width:38px;height:38px;font-size:18px;color:var(--text);transition:border-color .15s,color .15s;}
        .nav-hamburger:hover{border-color:#E55266;color:#E55266;}
        .nav-dropdown{display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:var(--surface);border-bottom:1px solid var(--border);backdrop-filter:blur(20px);animation:menuSlide .22s cubic-bezier(.16,1,.3,1) both;z-index:99;padding:8px 16px 16px;}
        .features-grid{grid-template-columns:1fr!important;gap:14px!important;}
        .pricing-grid{grid-template-columns:1fr!important;gap:24px!important;}
        .hero-section{padding-left:24px!important;padding-right:24px!important;}
        .hero-ctas-row{display:grid!important;grid-template-columns:1fr 1fr!important;gap:10px!important;}
        .hero-ctas-row button{white-space:normal!important;text-align:center!important;padding:12px 14px!important;font-size:13.5px!important;line-height:1.3!important;justify-content:center!important;}
        .stats-bar-grid{grid-template-columns:1fr 1fr!important;}
        .stats-cell{border-right:1px solid var(--border)!important;border-bottom:1px solid var(--border)!important;padding:16px 10px!important;}
        .stats-cell:nth-child(2n){border-right:none!important;}
        .stats-cell:nth-child(3),.stats-cell:nth-child(4){border-bottom:none!important;}
        .problem-section-mobile{padding:60px 24px 30px!important;}
        .solution-card{grid-template-columns:1fr!important;padding:32px 24px!important;gap:32px!important;text-align:left!important;}
        .colored-row{grid-template-columns:1fr!important;padding:28px 24px!important;gap:18px!important;text-align:left!important;}
        .colored-row-right{min-width:0!important;}
        .hiw-row{grid-template-columns:1fr!important;direction:ltr!important;gap:24px!important;}
        .hiw-line{display:none!important;}
        .integrations-grid{grid-template-columns:1fr 1fr!important;gap:12px!important;}
        .trust-grid{grid-template-columns:1fr!important;gap:14px!important;}
        .faq-grid{grid-template-columns:1fr!important;gap:0!important;}
        .footer-grid{grid-template-columns:1fr!important;gap:32px!important;}
      }
      @media(min-width:768px){
        .stats-cell{padding:28px 20px!important;}
        .stats-number{font-size:32px!important;}
        .stats-label{font-size:13px!important;color:var(--muted)!important;}
        .stats-divider{border-right:1px solid var(--border-hi)!important;}
        .pricing-card{padding:32px 36px!important;}
        .pricing-plan-name{font-size:14.5px!important;color:var(--text)!important;}
        .pricing-price{font-size:48px!important;}
        .pricing-features{gap:12px!important;}
        .pricing-feature-text{font-size:15px!important;}
        .feat-card{padding:32px 34px!important;min-height:auto!important;}
        .feat-icon{margin-bottom:24px!important;}
        .feat-title{font-size:19px!important;font-weight:800!important;margin-bottom:14px!important;}
        .feat-desc{font-size:15px!important;margin-bottom:24px!important;}
        .feat-badge{padding:10px 16px!important;}
        .feat-badge-text{font-size:13px!important;}
        .cta-section{padding:100px 48px!important;}
        .cta-heading{font-size:clamp(34px,5vw,62px)!important;}
        .cta-sub{font-size:17px!important;}
        .hero-section{padding-top:60px!important;}
        .hero-grid{display:flex!important;flex-direction:column!important;text-align:center!important;}
        .hero-mock{max-width:380px!important;margin-left:auto!important;margin-right:auto!important;}
        .trust-row{margin-bottom:20px!important;}
        .stats-cell{padding:14px 10px!important;}
        .stats-number{font-size:19px!important;}
        .stats-label{font-size:10px!important;}
      }
      @media(min-width:768px){
        .hero-grid{display:grid!important;grid-template-columns:1.1fr .9fr!important;gap:56px!important;align-items:center!important;text-align:left!important;}
        .mock-widget-card{transform:scale(1.08);transform-origin:top right;}
        .hero-mock{padding-right:10px;}
        .stats-bar-grid{grid-template-columns:repeat(4,1fr)!important;}
        .stats-cell{border-right:1px solid var(--border)!important;}
        .stats-cell:last-child{border-right:none!important;}
        .stats-cell{padding:22px 24px!important;}
        .stats-number{font-size:46px!important;font-weight:800!important;letter-spacing:-.02em!important;margin-bottom:8px!important;}
        .stats-label{font-size:14px!important;font-weight:600!important;}
      }
      /* ── light-mode overrides (dark mode completely unaffected) ── */
      html.light .nav-scrolled{--nav-shadow:0 8px 24px rgba(0,0,0,.12);}
      html.light .hero-section{background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(229,82,102,.06),transparent);}
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

function IconInstagram({ size=16, strokeWidth=2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  );
}

function IconTwitter({ size=16, strokeWidth=2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/>
    </svg>
  );
}

function IconLinkedin({ size=16, strokeWidth=2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function IconYoutube({ size=16, strokeWidth=2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/>
    </svg>
  );
}

const NAV_IDS = { "Features":"features", "How It Works":"how-it-works", "Pricing":"pricing" };

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  const [annBarVisible, setAnnBarVisible] = useState(true);
  const annBarRef = useRef(null);
  const [annBarHeight, setAnnBarHeight] = useState(38);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!annBarVisible || !annBarRef.current) return;
    const el = annBarRef.current;
    const update = () => setAnnBarHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [annBarVisible]);

  const [checkoutLoading, setCheckoutLoading] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState("idle"); // idle | loading | success | error

  const VARIANT_IDS = { Starter: '1816146', Growth: '1816190', Scale: '1816290' };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes("@")) return;
    setNewsletterStatus("loading");
    const { error } = await supabase.from("newsletter_subscribers").insert({ email: newsletterEmail });
    if (error && error.code !== "23505") { // 23505 = unique violation, treat as success (already subscribed)
      console.error("Newsletter signup error:", error);
      setNewsletterStatus("error");
      return;
    }
    setNewsletterStatus("success");
    setNewsletterEmail("");
  };

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
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text,overflowX:"hidden",paddingTop:64+(annBarVisible?annBarHeight:0)}}>
      <GlobalStyles/>

      {/* Ambient orbs */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
        <div className="orb orb-top" style={{width:600,height:600,top:"-180px",left:"50%",transform:"translateX(-50%)",background:"var(--orb-1)"}}/>
        <div className="orb orb-btm" style={{width:400,height:400,bottom:"5%",right:"-100px",background:"var(--orb-2)",animationDelay:"3s"}}/>
      </div>

      {/* ANNOUNCEMENT BAR */}
      {annBarVisible && (
        <div ref={annBarRef} className="ann-bar" style={{position:"fixed",top:0,left:0,right:0,zIndex:1001,background:"var(--announce-bg)",padding:"10px 24px",fontSize:13,color:"var(--announce-text)",borderBottom:"1px solid var(--announce-border)",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{flex:1,textAlign:"center"}}>
            14-day free trial · No credit card required · Live in 2 minutes{" "}
            <span onClick={()=>navigate("/onboarding")} style={{color:C.coral,cursor:"pointer",fontWeight:600}}>Start free trial →</span>
          </span>
          <button onClick={()=>setAnnBarVisible(false)} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--announce-text)",padding:"2px 4px",display:"flex",alignItems:"center",flexShrink:0,marginLeft:8}} aria-label="Dismiss announcement">
            <X size={16} strokeWidth={2}/>
          </button>
        </div>
      )}

      {/* NAV */}
      <nav className={scrolled?"nav-scrolled":""} style={{position:"fixed",top:annBarVisible?annBarHeight:0,left:0,right:0,zIndex:1000,height:64,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 44px",background:C.surface,borderBottom:"1px solid var(--nav-border-strong)",backdropFilter:"blur(20px)",boxShadow:"var(--nav-shadow)",transition:"top .22s ease,box-shadow .22s ease"}}>
        <SolvaLogo/>

        {/* Desktop links */}
        <div className="nav-links-desktop">
          {["Features","How It Works","Pricing","Docs"].map(l=>(
            <span key={l} className="nav-link" onClick={()=>{ if(l==="Docs") return; /* TODO: /docs route not built yet */ scrollTo(l); }} style={{fontSize:14,color:C.text,fontWeight:600}}>{l}</span>
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
              <span key={l} className="nav-link" onClick={()=>{ closeMenu(); if(l==="Docs") return; /* TODO: /docs route not built yet */ scrollTo(l); }}
                style={{fontSize:15,color:C.text,fontWeight:600,padding:"13px 8px",borderBottom:`1px solid ${C.border}`}}>
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
      <section className="hero-section" style={{position:"relative",zIndex:1,padding:LAYOUT.sectionPadding.hero,maxWidth:LAYOUT.maxWidth,margin:"0 auto"}}>
        <div className="hero-grid" style={{display:"flex",flexDirection:"column",textAlign:"left"}}>

          <div className="hero-copy" style={{display:"flex",flexDirection:"column",alignItems:"flex-start"}}>
            <div className="fu hero-eyebrow" style={{display:"inline-flex",alignItems:"center",gap:8,padding:"5px 16px",borderRadius:100,background:"var(--eyebrow-bg)",border:"1px solid var(--eyebrow-border)",marginBottom:28}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:C.coral,display:"inline-block"}}/>
              <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".07em"}}>SOLVA — AI AUTOMATION FOR SHOPIFY STORES</span>
            </div>
            <h1 className="fu fu1" style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(42px,6.5vw,72px)",fontWeight:800,lineHeight:1.05,letterSpacing:"-.03em",marginBottom:24}}>
              Every Problem.<br/>
              <span style={{background:"linear-gradient(130deg,#E55266 0%,#992A67 55%,#C05AFF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Solved.</span>
            </h1>
            <p className="fu fu2" style={{fontSize:"clamp(14px,1.8vw,17.5px)",color:C.sub,maxWidth:480,marginBottom:36,lineHeight:1.75,fontWeight:500}}>
              Connect your Shopify store in 2 minutes. Solva handles every support ticket, deflects returns, and recovers abandoned carts — automatically, 24/7.
            </p>
            <div className="fu fu3 hero-ctas-row" style={{display:"flex",gap:12,justifyContent:"flex-start",marginBottom:26}}>
              <button className="btn-primary" onClick={()=>navigate("/onboarding")} style={{padding:"14px 30px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15}}>Connect Your Store Free →</button>
              <button className="btn-ghost" onClick={()=>navigate("/dashboard")} style={{padding:"14px 30px",borderRadius:10,border:`1px solid ${C.border}`,color:C.text,fontWeight:500,fontSize:15,display:"flex",alignItems:"center",gap:8}}>View Live Demo <ArrowUpRight size={18} strokeWidth={2}/></button>
            </div>
            <div className="fu fu4 trust-row" style={{display:"flex",gap:20,flexWrap:"wrap",justifyContent:"flex-start",fontSize:13,color:C.muted}}>
              {["No credit card required","Cancel anytime","Live in 2 minutes"].map((t,i)=>(
                <span key={i} style={{display:"flex",alignItems:"center",gap:6}}>
                  <Check size={15} strokeWidth={2.5} color={C.teal}/>{t}
                </span>
              ))}
            </div>
          </div>

          <div className="fu hero-mock" style={{position:"relative",animation:"float 5s ease-in-out infinite",marginTop:isMobile?44:0}}>
            <div className="mock-widget-card">
              <div style={{background:C.grad,padding:"16px 20px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <Bot size={19} strokeWidth={2} color="#fff"/>
                </div>
                <div style={{textAlign:"left"}}>
                  <div style={{fontSize:13.5,fontWeight:700,color:"#fff"}}>Solva AI Agent</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.75)"}}>Online now</div>
                </div>
              </div>
              <div style={{padding:20,display:"flex",flexDirection:"column",gap:14,background:C.bg,minHeight:230}}>
                <div style={{alignSelf:"flex-start",maxWidth:"80%",padding:"12px 16px",borderRadius:14,borderBottomLeftRadius:4,background:C.card,border:`1px solid ${C.border}`,fontSize:13.5,lineHeight:1.55,textAlign:"left"}}>
                  Hi! I noticed your order shipped 3 days ago — want me to pull up the tracking details?
                </div>
                <div style={{alignSelf:"flex-end",maxWidth:"80%",padding:"12px 16px",borderRadius:14,borderBottomRightRadius:4,background:C.grad,color:"#fff",fontSize:13.5,lineHeight:1.55,textAlign:"left"}}>
                  Yes please, I haven't received it yet
                </div>
                <div style={{alignSelf:"flex-start",display:"flex",gap:5,padding:"12px 16px",borderRadius:14,borderBottomLeftRadius:4,background:C.card,border:`1px solid ${C.border}`}}>
                  <span className="mock-typing-dot"/><span className="mock-typing-dot"/><span className="mock-typing-dot"/>
                </div>
              </div>
            </div>
            <div className="hero-badge" style={{position:"absolute",top:-14,right:-14,background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:12,padding:"9px 14px",fontSize:12,fontWeight:700,boxShadow:"0 8px 24px rgba(0,0,0,.25)",display:"flex",alignItems:"center",gap:7,color:C.text}}>
              <Check size={14} strokeWidth={2.5} color={C.teal}/> Resolved in 12s
            </div>
          </div>

        </div>
      </section>

      {/* STATS BAR — moved out of hero into its own section */}
      <section style={{position:"relative",zIndex:1,padding:"0 40px"}}>
        <div className="fu stats-bar-grid" style={{display:"grid",width:"100%",borderTop:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`}}>
          {[["2 min","Average Setup Time"],["24/7","Automated Support"],["14 days","Free Trial"],["3 systems","One Platform"]].map(([v,l],i)=>(
            <div key={i} className="stats-cell" style={{padding:"20px 14px",background:C.surface,textAlign:"center"}}>
              <div className="stats-number" style={{fontSize:23,fontWeight:800,background:C.grad,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",marginBottom:5}}>{v}</div>
              <div className="stats-label" style={{fontSize:11.5,color:C.muted,fontWeight:500}}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section className="problem-section-mobile" style={{position:"relative",zIndex:1,padding:"90px 40px 40px",maxWidth:LAYOUT.maxWidthNarrow,margin:"0 auto",textAlign:"center"}}>
        <p className="fu" style={{...LAYOUT.eyebrow,color:C.coral,marginBottom:16}}>The Problem</p>
        <h2 className="fu fu1" style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif",lineHeight:1.18,marginBottom:26}}>
          Most stores go silent when customers need them most
        </h2>
        <p className="fu fu2" style={{fontSize:15.5,color:C.sub,lineHeight:1.8,marginBottom:14}}>
          Every day, shoppers hit friction — a delayed order, a return they're unsure about, a cart they almost finish. They need an answer right then. Most Shopify stores can't give them one.
        </p>
        <p className="fu fu3" style={{fontSize:15.5,color:C.sub,lineHeight:1.8}}>
          Support tickets pile up overnight. Returns get processed instead of prevented. Carts go cold. By the time a human responds, the sale — or the customer — is already gone.
        </p>
      </section>

      {/* SOLUTION */}
      <section style={{position:"relative",zIndex:1,padding:"70px 40px",maxWidth:LAYOUT.maxWidth,margin:"0 auto"}}>
        <div className="solution-card fu" style={{background:"linear-gradient(160deg,var(--card) 0%,var(--dim) 100%)",border:`1px solid ${C.borderHi}`,borderRadius:24,padding:54,display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:48,alignItems:"center"}}>
          <div>
            <p style={{...LAYOUT.eyebrow,color:C.coral,marginBottom:16}}>The Solution</p>
            <h3 style={{...LAYOUT.h3,fontFamily:"'Outfit',sans-serif",lineHeight:1.22,marginBottom:18}}>
              Solva makes your store proactive
            </h3>
            <p style={{fontSize:15,color:C.sub,lineHeight:1.75,marginBottom:28}}>
              One AI brain handles support, returns, and cart recovery together — not three disconnected tools bolted onto your storefront. It detects what a shopper needs, responds instantly, and resolves it before a human ever has to step in.
            </p>
            <button className="btn-primary" onClick={()=>{const el=document.getElementById('how-it-works');if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-64,behavior:"smooth"});}} style={{padding:"13px 26px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14}}>
              See How It Works
            </button>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            {[
              {icon:<Radar size={18} strokeWidth={2}/>,        title:"Detects intent",       desc:"Reads order status, hesitation, and support signals in real time."},
              {icon:<MessageCircle size={18} strokeWidth={2}/>,title:"Starts conversations", desc:"Reaches out with context — no generic greeting, no wasted back-and-forth."},
              {icon:<CheckCircle2 size={18} strokeWidth={2}/>, title:"Resolves automatically",desc:"Closes the loop — refund, reorder, or recovery — without waiting on a human."},
            ].map((b,i)=>(
              <div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{width:36,height:36,borderRadius:10,background:"rgba(229,82,102,.12)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:C.coral}}>{b.icon}</div>
                <div>
                  <b style={{fontSize:14,fontWeight:700,display:"block",marginBottom:3}}>{b.title}</b>
                  <span style={{fontSize:12.5,color:C.muted,lineHeight:1.5}}>{b.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{position:"relative",zIndex:1,padding:"56px 40px",maxWidth:LAYOUT.maxWidth,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:40}}>
          <p style={{...LAYOUT.eyebrow,color:C.coral,marginBottom:10}}>Core Systems</p>
          <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif"}}>Three automations. Zero manual work.</h2>
          <p style={{fontSize:14.5,color:C.sub,lineHeight:1.7,maxWidth:520,margin:"14px auto 0"}}>
            Every team in your store works from the same AI brain — one unified system instead of three disconnected tools.
          </p>
        </div>
        <div className="features-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:22}}>
          {[
            {icon:<Bot size={28} strokeWidth={2}/>,         title:"AI Support Agent",  color:C.teal,  stat:"Resolves tickets instantly",desc:"Handles order inquiries, shipping questions, and FAQs automatically. Only escalates what truly needs a human."},
            {icon:<RotateCcw size={28} strokeWidth={2}/>,   title:"Return Deflection",  color:C.amber, stat:"Deflects before refunds", desc:"Before a return is processed, our AI offers smart alternatives — exchanges, discounts, troubleshooting."},
            {icon:<ShoppingCart size={28} strokeWidth={2}/>,title:"Cart Recovery",      color:C.blue,  stat:"3-touch recovery sequence",desc:"A 3-touch AI sequence — email, SMS, and a personalised follow-up — written dynamically based on cart contents."},
          ].map((f,i)=>(
            <div key={i} className="card-hover feat-card" style={{padding:"30px 30px",borderRadius:16,background:C.card,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column"}}>
              <div className="feat-icon" style={{width:48,height:48,borderRadius:13,marginBottom:18,background:`${f.color}1F`,color:f.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{f.icon}</div>
              <h3 className="feat-title" style={{fontFamily:"'Outfit',sans-serif",fontSize:17.5,fontWeight:700,marginBottom:10}}>{f.title}</h3>
              <p className="feat-desc" style={{fontSize:13.5,color:C.sub,lineHeight:1.68,marginBottom:18,flex:1}}>{f.desc}</p>
              <div className="feat-badge" style={{padding:"7px 13px",borderRadius:8,background:`${f.color}18`,border:`1px solid ${f.color}35`}}>
                <span className="feat-badge-text" style={{fontSize:11.5,color:f.color,fontWeight:600,display:"inline-flex",alignItems:"center",gap:5}}><BarChart3 size={14} strokeWidth={2}/>{f.stat}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* COLORED FEATURE ROWS */}
      <section style={{position:"relative",zIndex:1,maxWidth:LAYOUT.maxWidth,margin:"0 auto",padding:"0 40px"}}>
        <div style={{display:"flex",flexDirection:"column",gap:20,marginBottom:LAYOUT.space.xxxl}}>
          {[
            {
              n:"01", grad:"linear-gradient(135deg,#3ECFB2,#1a8a70)",
              title:"AI Support Agent resolves before tickets pile up",
              desc:"Handles order inquiries, shipping questions, and FAQs automatically — escalating only what genuinely needs a human.",
              bullets:["Answers instantly across chat and email","Understands order status and context","Learns your brand tone and policies","Reduces ticket volume from day one"],
              cta:"Explore AI Support →"
            },
            {
              n:"02", grad:"linear-gradient(135deg,#F0A04B,#a8621f)",
              title:"Return Deflection protects margin before refunds happen",
              desc:"Before a return is processed, Solva offers smart alternatives — exchanges, discounts, troubleshooting — automatically.",
              bullets:["Detects return intent early","Offers exchanges and store credit first","Reduces refund rate measurably","Surfaces return reason patterns"],
              cta:"Explore Return Deflection →"
            },
            {
              n:"03", grad:"linear-gradient(135deg,#5BADFF,#1f5aa8)",
              title:"Cart Recovery brings shoppers back automatically",
              desc:"A 3-touch AI sequence — written dynamically based on what's actually in the cart — recovers revenue while you sleep.",
              bullets:["Personalized to real cart contents","3-touch email sequence, fully automated","No manual segmentation required","Recovers revenue 24/7"],
              cta:"Explore Cart Recovery →"
            },
          ].map((row,i)=>(
            <div key={i} className="colored-row" style={{background:row.grad,borderRadius:20,padding:"44px 48px",display:"grid",gridTemplateColumns:"auto 1fr auto",gap:36,alignItems:"start"}}>
              <span style={{fontSize:17,fontWeight:800,color:"rgba(255,255,255,.85)",fontFamily:"'Outfit',sans-serif",WebkitTextStroke:"0.5px rgba(255,255,255,.3)",paddingTop:4}}>{row.n}</span>
              <div>
                <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(19px,2.2vw,24px)",fontWeight:800,color:"#fff",lineHeight:1.28,marginBottom:10,letterSpacing:"-.01em"}}>{row.title}</h3>
                <p style={{fontSize:13.5,color:"rgba(255,255,255,.82)",lineHeight:1.65,maxWidth:520}}>{row.desc}</p>
              </div>
              <div className="colored-row-right" style={{display:"flex",flexDirection:"column",gap:10,minWidth:240}}>
                {row.bullets.map((b,j)=>(
                  <div key={j} style={{display:"flex",gap:8,alignItems:"flex-start",fontSize:12.5,color:"rgba(255,255,255,.9)"}}>
                    <Check size={14} strokeWidth={2.5} style={{marginTop:1,flexShrink:0,color:"rgba(255,255,255,.7)"}}/>{b}
                  </div>
                ))}
                <span onClick={()=>{const el=document.getElementById('features');if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-64,behavior:"smooth"});}} style={{fontSize:12.5,fontWeight:700,color:"#fff",marginTop:6,cursor:"pointer"}}>{row.cta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{position:"relative",zIndex:1,maxWidth:LAYOUT.maxWidth,margin:"0 auto",padding:LAYOUT.sectionPadding.standard}}>
        <div style={{textAlign:"center",marginBottom:64}}>
          <p style={{...LAYOUT.eyebrow,color:C.magenta,marginBottom:14}}>Setup In Minutes</p>
          <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif"}}>How Solva Works</h2>
        </div>
        <div style={{position:"relative"}}>
          <div className="hiw-line" style={{position:"absolute",left:"50%",top:0,bottom:0,width:2,background:`linear-gradient(180deg,${C.coral},${C.magenta},${C.violet})`,opacity:.25,transform:"translateX(-50%)"}}/>
          {[
            {n:"01",icon:<Link2 size={20} strokeWidth={2}/>,title:"Connect Your Store",desc:"Link your Shopify store with one click. No code, no complexity — Solva reads your catalog and order history instantly.",mock:{label:"Solva Setup",bubbles:[{who:"ai",text:"Store connected ✓ Reading your catalog..."}]}},
            {n:"02",icon:<Settings2 size={20} strokeWidth={2}/>,title:"Configure Your AI",desc:"Set your brand tone, escalation rules, and recovery preferences — or let Solva suggest smart defaults from your store data.",mock:{label:"AI Config",bubbles:[{who:"user",text:"Use a friendly, casual tone"},{who:"ai",text:"Got it — applied across all channels."}]}},
            {n:"03",icon:<Sparkles size={20} strokeWidth={2}/>,title:"Go Live Instantly",desc:"Flip the switch. Support, returns, and cart recovery start working from the very first minute — automatically.",mock:{label:"Solva AI Agent",bubbles:[{who:"ai",text:"Live and monitoring your store 24/7."}]}},
          ].map((step,i)=>(
            <div key={i} className="hiw-row" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:56,alignItems:"center",marginBottom:i<2?72:0,direction:i%2===1?"rtl":"ltr"}}>
              <div style={{direction:"ltr"}}>
                <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                  <div style={{width:44,height:44,borderRadius:12,background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",flexShrink:0}}>{step.icon}</div>
                  <span style={{fontSize:13,fontWeight:800,color:C.coral,letterSpacing:".04em"}}>STEP {step.n}</span>
                </div>
                <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(20px,2.4vw,26px)",fontWeight:800,marginBottom:12,letterSpacing:"-.01em"}}>{step.title}</h3>
                <p style={{fontSize:14.5,color:C.sub,lineHeight:1.7}}>{step.desc}</p>
              </div>
              <div style={{direction:"ltr"}}>
                <div style={{background:C.card,border:`1px solid ${C.borderHi}`,borderRadius:16,overflow:"hidden",boxShadow:"0 20px 50px rgba(0,0,0,.3)"}}>
                  <div style={{background:C.grad,padding:"12px 18px",fontSize:12.5,fontWeight:700,color:"#fff"}}>{step.mock.label}</div>
                  <div style={{padding:18,display:"flex",flexDirection:"column",gap:10,minHeight:100,background:C.bg}}>
                    {step.mock.bubbles.map((b,j)=>(
                      <div key={j} style={{alignSelf:b.who==="user"?"flex-end":"flex-start",maxWidth:"85%",padding:"10px 14px",borderRadius:12,fontSize:12.5,lineHeight:1.5,...(b.who==="user"?{background:C.grad,color:"#fff",borderBottomRightRadius:4}:{background:C.surface,border:`1px solid ${C.border}`,borderBottomLeftRadius:4})}}>{b.text}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section style={{position:"relative",zIndex:1,maxWidth:LAYOUT.maxWidth,margin:"0 auto",padding:LAYOUT.sectionPadding.compact,textAlign:"center"}}>
        <p style={{...LAYOUT.eyebrow,color:C.coral,marginBottom:14}}>Integrations</p>
        <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif",marginBottom:16}}>Built on Shopify. Ready to connect.</h2>
        <p style={{fontSize:14.5,color:C.sub,maxWidth:480,margin:"0 auto 48px",lineHeight:1.7}}>
          Solva reads your Shopify catalog and orders natively. Email, SMS, and helpdesk integrations are on the roadmap.
        </p>
        <div className="integrations-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[
            {icon:<ShoppingBag size={26} strokeWidth={1.8}/>,name:"Shopify",live:true,color:"#95BF47"},
            {icon:<Mail size={26} strokeWidth={1.8}/>,name:"Email",live:false,color:"#8B7591"},
            {icon:<MessageSquare size={26} strokeWidth={1.8}/>,name:"SMS",live:false,color:"#8B7591"},
            {icon:<Webhook size={26} strokeWidth={1.8}/>,name:"Helpdesk",live:false,color:"#8B7591"},
          ].map((item,i)=>(
            <div key={i} style={{border:`1px solid ${item.live?item.color+'40':C.border}`,borderRadius:14,padding:"34px 18px",background:C.card,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
              <div style={{color:item.color}}>{item.icon}</div>
              <span style={{fontSize:14.5,fontWeight:700}}>{item.name}</span>
              {!item.live && <span style={{fontSize:10.5,fontWeight:700,color:item.color,letterSpacing:".04em",textTransform:"uppercase"}}>Coming soon</span>}
            </div>
          ))}
        </div>
      </section>

      {/* TRUST GRID */}
      <section style={{position:"relative",zIndex:1,maxWidth:LAYOUT.maxWidth,margin:"0 auto",padding:LAYOUT.sectionPadding.compact}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <p style={{...LAYOUT.eyebrow,color:C.coral,marginBottom:14}}>Zero Risk</p>
          <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif"}}>Try Solva with nothing to lose</h2>
        </div>
        <div className="trust-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {[
            {icon:<CreditCard size={20} strokeWidth={2}/>,title:"14 days free",desc:"Full access, no credit card required to start."},
            {icon:<XCircle size={20} strokeWidth={2}/>,title:"Cancel anytime",desc:"No annual lock-in. Leave whenever you want."},
            {icon:<Zap size={20} strokeWidth={2}/>,title:"Live in 2 minutes",desc:"Connect your Shopify store and Solva starts working immediately."},
            {icon:<ShieldCheck size={20} strokeWidth={2}/>,title:"Shopify-native",desc:"Reads your real catalog and order history — no manual setup."},
            {icon:<Lock size={20} strokeWidth={2}/>,title:"GDPR compliant",desc:"Built with proper data handling from day one, not bolted on later."},
            {icon:<ShieldCheck size={20} strokeWidth={2}/>,title:"Your data, protected",desc:"We never sell customer data. Full stop."},
          ].map((item,i)=>(
            <div key={i} style={{border:`1px solid ${C.border}`,borderRadius:16,padding:"28px 26px",background:C.card}}>
              <div style={{width:40,height:40,borderRadius:11,background:"rgba(229,82,102,.12)",display:"flex",alignItems:"center",justifyContent:"center",color:C.coral,marginBottom:16}}>{item.icon}</div>
              <h3 style={{fontSize:15.5,fontWeight:700,marginBottom:8}}>{item.title}</h3>
              <p style={{fontSize:13,color:C.sub,lineHeight:1.6}}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" style={{padding:LAYOUT.sectionPadding.compact,maxWidth:1100,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:46}}>
          <p style={{...LAYOUT.eyebrow,color:C.coral,marginBottom:14}}>Pricing</p>
          <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif"}}>Simple, Transparent Pricing</h2>
          <p style={{fontSize:14.5,color:C.sub,marginTop:14}}>14-day free trial on every plan. No credit card required to start.</p>
        </div>
        <div className="pricing-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
          {PLANS.map((plan,i)=>(
            <div key={i} className={`card-hover pricing-card${plan.popular?" grad-border":""}`}
              style={{padding:28,borderRadius:16,position:"relative",background:plan.popular?"linear-gradient(160deg,#1C001E 0%,#2A0035 55%,#1A001A 100%)":C.card,border:plan.popular?"none":`1px solid ${C.border}`}}>
              {plan.popular&&<div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",padding:"4px 16px",borderRadius:100,background:C.grad,color:"#fff",fontSize:10.5,fontWeight:700,whiteSpace:"nowrap"}}>MOST POPULAR</div>}
              <p className="pricing-plan-name" style={{fontSize:12.5,color:plan.popular?"#fff":C.sub,fontWeight:600,marginBottom:8}}>{plan.name}</p>
              <div style={{display:"flex",alignItems:"baseline",gap:2,marginBottom:16}}>
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

      {/* FAQ */}
      <section id="faq" style={{position:"relative",zIndex:1,maxWidth:LAYOUT.maxWidthMedium,margin:"0 auto",padding:LAYOUT.sectionPadding.standard}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <p style={{...LAYOUT.eyebrow,color:C.coral,marginBottom:14}}>FAQ</p>
          <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif"}}>Got questions?</h2>
        </div>
        <div className="faq-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 40px"}}>
          {[
            {q:"What does Solva actually automate?",a:"Solva automates three things: AI support ticket resolution, return request deflection, and abandoned cart recovery — all from one connected platform, reading directly from your Shopify store."},
            {q:"How long does setup take?",a:"About 2 minutes. Connect your Shopify store with one click, configure your brand tone, and you're live."},
            {q:"Do I need a credit card to start?",a:"No. The 14-day free trial requires no credit card. You only add payment details if you choose to continue."},
            {q:"Can I customize the AI's tone?",a:"Yes. You can set a tone that matches your brand, add custom FAQs, and give the AI global instructions it always follows."},
            {q:"What happens when the AI can't resolve something?",a:"It escalates to your team automatically with full context, so nothing falls through the cracks."},
            {q:"Is my customer data secure?",a:"Yes — Solva is built GDPR-compliant from day one, and we never sell or share your customer data."},
          ].map((item,i)=>(
            <div key={i} style={{borderBottom:`1px solid ${C.border}`,padding:"20px 0",cursor:"pointer"}} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
                <span style={{fontSize:14.5,fontWeight:700}}>{item.q}</span>
                <ChevronDown size={18} strokeWidth={2} style={{flexShrink:0,color:C.muted,transition:"transform .25s",transform:openFaq===i?"rotate(180deg)":"rotate(0)"}}/>
              </div>
              <div style={{maxHeight:openFaq===i?200:0,opacity:openFaq===i?1:0,overflow:"hidden",transition:"max-height .3s ease,opacity .25s ease,margin-top .3s ease",marginTop:openFaq===i?12:0}}>
                <p style={{fontSize:13.5,color:C.sub,lineHeight:1.7}}>{item.a}</p>
              </div>
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
        <p className="cta-sub" style={{color:C.sub,fontSize:15.5,marginBottom:32,position:"relative",fontWeight:500}}>Built for Shopify stores that want to automate support, returns, and cart recovery — all in one place.</p>
        <button className="btn-primary" onClick={()=>navigate("/onboarding")} style={{padding:"16px 36px",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15.5,position:"relative"}}>
          Connect Your Store — It's Free →
        </button>
      </div>

      {/* FOOTER */}
      <footer style={{position:"relative",zIndex:1,borderTop:`1px solid ${C.border}`,padding:"64px 40px 32px"}}>
        <div style={{maxWidth:LAYOUT.maxWidth,margin:"0 auto"}}>
          <div className="footer-grid" style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr 1fr",gap:40,marginBottom:48}}>
            <div>
              <div style={{marginBottom:14}}><SolvaLogo/></div>
              <p style={{fontSize:13,color:C.sub,lineHeight:1.7,marginBottom:20,maxWidth:280}}>
                AI automation for Shopify stores. Support, returns, and cart recovery — solved automatically.
              </p>
              <p style={{fontSize:12.5,fontWeight:700,marginBottom:10}}>Get product updates</p>
              <form onSubmit={handleNewsletterSubmit} style={{display:"flex",gap:8,maxWidth:280}}>
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e)=>setNewsletterEmail(e.target.value)}
                  placeholder="Your email"
                  style={{flex:1,padding:"10px 14px",borderRadius:8,border:`1px solid ${C.border}`,background:C.card,color:C.text,fontSize:13,fontFamily:"'Outfit',sans-serif",outline:"none"}}
                />
                <button type="submit" disabled={newsletterStatus==="loading"} className="btn-primary" style={{width:40,height:40,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,opacity:newsletterStatus==="loading"?.6:1}}>
                  <Send size={15} strokeWidth={2} color="#fff"/>
                </button>
              </form>
              {newsletterStatus==="success" && <p style={{fontSize:11.5,color:C.teal,marginTop:8}}>You're on the list.</p>}
              {newsletterStatus==="error" && <p style={{fontSize:11.5,color:C.red,marginTop:8}}>Something went wrong — try again.</p>}
            </div>

            {[
              {title:"Product", items:[
                {label:"Features", anchor:"features"},
                {label:"How It Works", anchor:"how-it-works"},
                {label:"Pricing", anchor:"pricing"},
                {label:"Docs", soon:true},
              ]},
              {title:"Resources", items:[
                {label:"FAQ", anchor:"faq"},
                {label:"Help Center", soon:true},
                {label:"Blog", soon:true},
              ]},
              {title:"Company", items:[
                {label:"About", soon:true},
                {label:"Contact", soon:true},
              ]},
              {title:"Follow Us", social:true, items:[
                {label:"Instagram", href:"https://instagram.com", icon:<IconInstagram size={15} strokeWidth={2}/>},
                {label:"X", href:"https://twitter.com", icon:<IconTwitter size={15} strokeWidth={2}/>},
                {label:"LinkedIn", href:"https://linkedin.com", icon:<IconLinkedin size={15} strokeWidth={2}/>},
                {label:"YouTube", href:"https://youtube.com", icon:<IconYoutube size={15} strokeWidth={2}/>},
              ]},
            ].map((col,i)=>(
              <div key={i}>
                <p style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:16,textTransform:"uppercase",letterSpacing:".04em"}}>{col.title}</p>
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {col.items.map((item,j)=>(
                    col.social ? (
                      <a key={j} href={item.href} target="_blank" rel="noopener noreferrer" style={{fontSize:13,color:C.sub,display:"flex",alignItems:"center",gap:8}}>
                        <span style={{color:C.muted,display:"flex"}}>{item.icon}</span>{item.label}
                      </a>
                    ) : item.soon ? (
                      <span key={j} style={{fontSize:13,color:C.muted,display:"flex",alignItems:"center",gap:6}}>
                        {item.label}<span style={{fontSize:9,fontWeight:700,color:C.muted,border:`1px solid ${C.border}`,borderRadius:4,padding:"1px 5px"}}>SOON</span>
                      </span>
                    ) : (
                      <span key={j} style={{fontSize:13,color:C.sub,cursor:"pointer"}} onClick={()=>{const el=document.getElementById(item.anchor);if(el)window.scrollTo({top:el.getBoundingClientRect().top+window.scrollY-64,behavior:"smooth"});}}>
                        {item.label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:20,paddingTop:28,borderTop:`1px solid ${C.border}`}}>
            <span style={{fontSize:12.5,color:C.muted}}>© 2026 SOLVA.AI. All rights reserved.</span>
            <div style={{display:"flex",gap:22,alignItems:"center"}}>
              <span onClick={()=>navigate("/privacy")} style={{fontSize:12.5,color:C.muted,cursor:"pointer"}}>Privacy Policy</span>
              <span onClick={()=>navigate("/terms")} style={{fontSize:12.5,color:C.muted,cursor:"pointer"}}>Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
