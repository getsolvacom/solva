import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { C, LAYOUT } from "../tokens";
import ContactSupportModal from "./dashboard/ContactSupportModal";

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

const GETTING_STARTED = [
  { title:"Connect Your Store", desc:"Link your Shopify store with one click. No code, no complexity — Solva reads your catalog and order history instantly." },
  { title:"Configure Your AI", desc:"Set your brand tone, escalation rules, and recovery preferences — or let Solva suggest smart defaults from your store data." },
  { title:"Go Live Instantly", desc:"Flip the switch. Support, returns, and cart recovery start working from the very first minute — automatically." },
];

const FAQS = [
  { q:"What does Solva actually automate?", a:"Solva automates three things: AI support ticket resolution, return request deflection, and abandoned cart recovery — all from one connected platform, reading directly from your Shopify store." },
  { q:"How long does setup take?", a:"About 2 minutes. Connect your Shopify store with one click, configure your brand tone, and you're live." },
  { q:"Do I need a credit card to start?", a:"No. The 7-day free trial requires no credit card. You only add payment details if you choose to continue." },
  { q:"Can I customize the AI's tone?", a:"Yes. You can set a tone that matches your brand, add custom FAQs, and give the AI global instructions it always follows." },
  { q:"What happens when the AI can't resolve something?", a:"It escalates to your team automatically with full context, so nothing falls through the cracks." },
  { q:"Is my customer data secure?", a:"Yes — Solva is built GDPR-compliant from day one, and we never sell or share your customer data." },
];

export default function DocsPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{background:var(--bg);}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}.legal-link{color:${C.muted};text-decoration:none;}.legal-link:hover{text-decoration:underline;}.back-link{color:${C.muted};text-decoration:none;cursor:pointer;font-size:14px;}.back-link:hover{text-decoration:underline;}@keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}.btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}`}</style>

      <div style={{maxWidth:LAYOUT.maxWidthNarrow,margin:"0 auto",padding:"60px 24px"}}>
        {/* Logo */}
        <div style={{marginBottom:LAYOUT.space.xxl,cursor:"pointer"}} onClick={()=>navigate("/")}>
          <SolvaLogo/>
        </div>

        {/* Hero */}
        <div style={{marginBottom:LAYOUT.space.xxl}}>
          <h1 style={{...LAYOUT.h2,fontFamily:"'Outfit',sans-serif"}}>Help Center</h1>
          <p style={{fontSize:"clamp(15px,1.8vw,17.5px)",color:C.sub,lineHeight:1.6,maxWidth:520,marginTop:16}}>Everything you need to get the most out of Solva.</p>
        </div>

        {/* Getting Started */}
        <Section title="Getting Started">
          <ol style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:12}}>
            {GETTING_STARTED.map((step)=>(
              <li key={step.title} style={{fontSize:14.5,color:C.sub,lineHeight:1.6}}>
                <b style={{color:C.text}}>{step.title}:</b> {step.desc}
              </li>
            ))}
          </ol>
        </Section>

        {/* FAQ */}
        <Section title="Frequently Asked Questions">
          {FAQS.map((item,i)=>(
            <div key={i} style={{borderBottom:`1px solid ${C.border}`,padding:"20px 0",cursor:"pointer"}} onClick={()=>setOpenFaq(openFaq===i?null:i)}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
                <span style={{fontSize:14.5,fontWeight:700,color:C.text}}>{item.q}</span>
                <ChevronDown size={18} strokeWidth={2} style={{flexShrink:0,color:C.muted,transition:"transform .25s",transform:openFaq===i?"rotate(180deg)":"rotate(0)"}}/>
              </div>
              <div style={{maxHeight:openFaq===i?200:0,opacity:openFaq===i?1:0,overflow:"hidden",transition:"max-height .3s ease,opacity .25s ease,margin-top .3s ease",marginTop:openFaq===i?12:0}}>
                <p style={{fontSize:13.5,color:C.sub,lineHeight:1.7}}>{item.a}</p>
              </div>
            </div>
          ))}
        </Section>

        {/* Still need help */}
        <div style={{marginBottom:LAYOUT.space.xl,padding:24,borderRadius:14,background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,flexWrap:"wrap"}}>
          <p style={{fontSize:14.5,color:C.sub,lineHeight:1.6,flex:1,minWidth:220}}>Still need help? Send us a message and a real person will get back to you.</p>
          <button className="btn-primary" onClick={()=>setContactOpen(true)} style={{padding:"11px 24px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:14,flexShrink:0}}>Contact Support</button>
        </div>

        {/* Back link */}
        <div style={{paddingTop:28,borderTop:`1px solid ${C.border}`}}>
          <span className="back-link" onClick={()=>navigate("/")}>← Back to Home</span>
        </div>
      </div>

      <ContactSupportModal open={contactOpen} onClose={()=>setContactOpen(false)}/>
    </div>
  );
}
