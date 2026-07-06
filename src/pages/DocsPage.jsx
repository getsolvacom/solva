import { useNavigate } from "react-router-dom";
import { C, LAYOUT } from "../tokens";

function SolvaLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgDocs" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgDocs)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:LAYOUT.space.xxl}}>
      <h2 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif",fontSize:"clamp(22px,3vw,30px)",color:C.text,marginBottom:LAYOUT.space.md,lineHeight:1.25}}>{title}</h2>
      {children}
    </div>
  );
}

function SubSection({ title, children }) {
  return (
    <div style={{marginBottom:LAYOUT.space.lg}}>
      <h3 style={{...LAYOUT.h3,fontFamily:"'Outfit',sans-serif",fontSize:18,color:C.text,marginBottom:10,lineHeight:1.3}}>{title}</h3>
      <p style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}>{children}</p>
    </div>
  );
}

function FaqItem({ q, a }) {
  return (
    <div style={{marginBottom:LAYOUT.space.md}}>
      <p style={{fontSize:15.5,fontWeight:700,color:C.text,marginBottom:6,lineHeight:1.45}}>{q}</p>
      <p style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}>{a}</p>
    </div>
  );
}

const FAQS = [
  { q:"What if the AI gets something wrong?", a:"Every AI action is logged in your Audit Log (Dashboard > Settings > Audit Log). You can review, override, or roll back any automated decision within 24 hours." },
  { q:"Can I turn off one system but keep the others?", a:"Yes. Each of the three systems (Support, Cart Recovery, Returns) can be enabled or disabled independently in Settings." },
  { q:"Does this replace my existing helpdesk?", a:"SOLVA is built to be your primary support/cart/returns layer, not an add-on to an existing tool — that's the point of consolidating three systems into one." },
  { q:"What data does SOLVA access?", a:"Order history, customer contact info, and product catalog data via Shopify's standard OAuth scopes. See our Privacy Policy for full details." },
];

export default function DocsPage() {
  const navigate = useNavigate();

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{background:#060008;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}.legal-link{color:${C.muted};text-decoration:none;}.legal-link:hover{text-decoration:underline;}.back-link{color:${C.muted};text-decoration:none;cursor:pointer;font-size:14px;}.back-link:hover{text-decoration:underline;}`}</style>

      <div style={{maxWidth:LAYOUT.maxWidthNarrow,margin:"0 auto",padding:"60px 24px"}}>
        {/* Logo */}
        <div style={{marginBottom:LAYOUT.space.xxl,cursor:"pointer"}} onClick={()=>navigate("/")}>
          <SolvaLogo/>
        </div>

        {/* Hero */}
        <div style={{marginBottom:LAYOUT.space.xxl}}>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(32px,5.5vw,48px)",fontWeight:800,letterSpacing:"-.02em",lineHeight:1.15,marginBottom:16}}>Documentation</h1>
          <p style={{fontSize:"clamp(15px,1.8vw,17.5px)",color:C.sub,lineHeight:1.6,maxWidth:520}}>Everything you need to connect your store and get SOLVA running in minutes.</p>
        </div>

        {/* Getting Started */}
        <Section title="Connect Your Store in 2 Minutes">
          <p style={{fontSize:14.5,color:C.sub,lineHeight:1.6,marginBottom:16}}>
            SOLVA connects directly to your Shopify store through Shopify's official OAuth flow — no manual API keys, no code.
          </p>
          <ol style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:12}}>
            <li style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}><b style={{color:C.text}}>Step 1:</b> Click "Connect Your Store" and log into your Shopify admin.</li>
            <li style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}><b style={{color:C.text}}>Step 2:</b> Approve SOLVA's requested permissions (read/write access to orders, customers, and returns — used only to power the three automations below).</li>
            <li style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}><b style={{color:C.text}}>Step 3:</b> SOLVA reads your existing catalog and order history to understand your store. This takes under 2 minutes for most stores.</li>
            <li style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}><b style={{color:C.text}}>Step 4:</b> Configure your AI's tone and escalation rules (or use our recommended defaults).</li>
            <li style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}><b style={{color:C.text}}>Step 5:</b> Flip the switch. SOLVA starts monitoring tickets, carts, and returns immediately.</li>
          </ol>
        </Section>

        {/* The Three Systems */}
        <Section title="The Three Systems, Explained">
          <SubSection title="AI Support Agent">
            SOLVA reads every incoming support ticket in real time. Using your store's order and catalog data, it identifies what the customer needs — order status, shipping delays, address changes, product questions — and resolves it directly when it has enough context to do so safely. If the AI can't resolve a ticket confidently (refund disputes, policy exceptions, angry customers), it escalates to a human with full context attached, instead of guessing. You set the confidence threshold in Settings &gt; AI Config.
          </SubSection>
          <SubSection title="Cart Recovery">
            When a shopper abandons checkout, SOLVA triggers a 3-touch automated sequence: an initial reminder within the first hour, a follow-up with contextual product details around 24 hours later, and a final incentivized nudge (customizable discount, or none) at 72 hours. Each message adapts to what was actually in the cart. You control timing, incentive amounts, and channels in Settings &gt; Cart Recovery.
          </SubSection>
          <SubSection title="Return Deflection">
            Before a return is processed, SOLVA intercepts it and offers proactive alternatives — a sizing exchange, a different color, store credit, or a partial refund — based on the stated return reason and your store's margin rules. Only returns the AI can't deflect (defective items, wrong orders, policy-mandated refunds) get processed automatically. You set which reasons are eligible for deflection in Settings &gt; Return Rules.
          </SubSection>
        </Section>

        {/* FAQ */}
        <Section title="Common Questions">
          {FAQS.map((f,i)=>(<FaqItem key={i} q={f.q} a={f.a}/>))}
        </Section>

        {/* Support CTA */}
        <div style={{marginBottom:LAYOUT.space.xl,padding:24,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
          <p style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}>
            Can't find what you need? Email us directly at <a href="mailto:support@getsolva.app" className="legal-link">support@getsolva.app</a> — a real person reads and replies to every message.
          </p>
        </div>

        {/* Back link */}
        <div style={{paddingTop:28,borderTop:`1px solid ${C.border}`}}>
          <span className="back-link" onClick={()=>navigate("/")}>← Back to Home</span>
        </div>
      </div>
    </div>
  );
}
