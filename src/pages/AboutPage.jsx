import { useNavigate } from "react-router-dom";
import { C, LAYOUT } from "../tokens";

function SolvaLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgAbout" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgAbout)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{background:#060008;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}.back-link{color:${C.muted};text-decoration:none;cursor:pointer;font-size:14px;}.back-link:hover{text-decoration:underline;}`}</style>

      <div style={{maxWidth:LAYOUT.maxWidthNarrow,margin:"0 auto",padding:"60px 24px"}}>
        {/* Logo */}
        <div style={{marginBottom:LAYOUT.space.xxl,cursor:"pointer"}} onClick={()=>navigate("/")}>
          <SolvaLogo/>
        </div>

        {/* Hero */}
        <div style={{marginBottom:LAYOUT.space.xxl}}>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(32px,5.5vw,48px)",fontWeight:800,letterSpacing:"-.02em",lineHeight:1.15}}>Why We Built SOLVA</h1>
        </div>

        {/* The Story */}
        <div style={{marginBottom:LAYOUT.space.xxl,display:"flex",flexDirection:"column",gap:20}}>
          <p style={{fontSize:15,color:C.sub,lineHeight:1.6}}>
            SOLVA started from a simple observation, made while running Ecom Elevate — a Shopify consulting practice working directly with merchants inside an active WhatsApp community of store owners. Over and over, the same pattern showed up: small and mid-sized Shopify stores were drowning in the same three problems — support tickets piling up faster than anyone could answer them, returns eating into already-thin margins, and abandoned carts quietly leaking revenue every single day.
          </p>
          <p style={{fontSize:15,color:C.sub,lineHeight:1.6}}>
            The tools to fix each of these problems already existed. Gorgias could handle support tickets — starting around $10/month, but AI-resolved conversations are billed on top at roughly $0.90–$1.00 each, and a single AI resolution counts as both a helpdesk ticket and an automation fee. Loop Returns could handle returns — but its Essential plan starts at $155/month on an annual contract, with per-return and per-label fees layered on beyond that. Klaviyo could handle cart recovery and email — but its pricing scales with your contact list, climbing from $20/month at 500 contacts past $175/month at 5,000, and its own newer Helpdesk and AI Customer Agent add-ons run $185–264/month and $140–200/month respectively, on top of the email plan.
          </p>
          <p style={{fontSize:15,color:C.sub,lineHeight:1.6}}>
            Stack all three together — the way most growing Shopify stores end up doing — and a merchant could easily be paying $400 to $700+ every month before touching ad spend or inventory, just to keep support, returns, and cart recovery running as three disconnected systems that don't talk to each other.
          </p>
          <p style={{fontSize:15,color:C.sub,lineHeight:1.6}}>
            That gap is what SOLVA exists to close. One AI brain, trained on your store's own data, handling all three jobs — support resolution, return deflection, and cart recovery — from a single dashboard, at a fraction of the combined cost of running three separate tools. Not because the other tools are bad at what they do individually, but because a small Shopify store shouldn't need three subscriptions, three logins, and three learning curves just to keep customers happy. Every Problem. Solved.
          </p>
        </div>

        {/* Mission Close */}
        <div style={{marginBottom:LAYOUT.space.xxl,textAlign:"center",padding:"48px 24px",borderRadius:16,background:C.card,border:`1px solid ${C.border}`}}>
          <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif",marginBottom:12,lineHeight:1.2}}>
            <span style={{background:"linear-gradient(130deg,#E55266 0%,#992A67 55%,#C05AFF 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>Every Problem. Solved.</span>
          </h2>
          <p style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}>Built for Shopify stores that want one system, not three.</p>
        </div>

        {/* CTA */}
        <div style={{marginBottom:LAYOUT.space.xl,textAlign:"center"}}>
          <button onClick={()=>navigate("/onboarding")} style={{cursor:"pointer",border:"none",outline:"none",background:C.grad,padding:"16px 36px",borderRadius:12,color:"#fff",fontWeight:700,fontSize:15.5,fontFamily:"'Outfit',sans-serif"}}>Connect Your Store Free →</button>
        </div>

        {/* Back link */}
        <div style={{paddingTop:28,borderTop:`1px solid ${C.border}`,textAlign:"center"}}>
          <span className="back-link" onClick={()=>navigate("/")}>← Back to Home</span>
        </div>
      </div>
    </div>
  );
}
