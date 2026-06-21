import { useNavigate } from "react-router-dom";
import { C } from "../tokens";

function SolvaLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgPrivacy" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgPrivacy)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{marginBottom:36}}>
      <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:18,fontWeight:700,color:C.text,marginBottom:12}}>{title}</h2>
      <div style={{fontSize:14.5,color:C.sub,lineHeight:1.78}}>{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}html,body{background:#060008;}::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}.legal-link{color:${C.muted};text-decoration:none;}.legal-link:hover{text-decoration:underline;}.back-link{color:${C.muted};text-decoration:none;cursor:pointer;font-size:14px;}.back-link:hover{text-decoration:underline;}`}</style>

      <div style={{maxWidth:800,margin:"0 auto",padding:"60px 24px"}}>
        {/* Logo */}
        <div style={{marginBottom:48,cursor:"pointer"}} onClick={()=>navigate("/")}>
          <SolvaLogo/>
        </div>

        {/* Header */}
        <div style={{marginBottom:48}}>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(28px,5vw,40px)",fontWeight:800,letterSpacing:"-.02em",marginBottom:10}}>Privacy Policy</h1>
          <p style={{fontSize:14,color:C.muted}}>Effective Date: June 21, 2026</p>
          <p style={{fontSize:14,color:C.muted}}>Last Updated: June 21, 2026</p>
        </div>

        {/* Intro */}
        <div style={{marginBottom:40,fontSize:14.5,color:C.sub,lineHeight:1.78}}>
          SOLVA ("we", "us", or "our") is operated by SOLVA (Nigeria). This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform at getsolva.app.
        </div>

        {/* Sections */}
        <Section title="1. Information We Collect">
          <p style={{marginBottom:10}}>When you use SOLVA, we collect:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Your name and email address (via signup or Google OAuth)</li>
            <li>Your Shopify store domain and store name</li>
            <li>Customer data from your Shopify store — including support tickets, abandoned cart details, and return requests — processed solely to deliver our automation services</li>
            <li>Billing information processed by Lemon Squeezy (we never store your card details)</li>
            <li>Usage data such as tickets resolved, carts recovered, and returns deflected</li>
          </ul>
        </Section>

        <Section title="2. How We Use Your Information">
          <p style={{marginBottom:10}}>We use your information to:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Provide and operate the SOLVA platform</li>
            <li>Connect to your Shopify store and automate support, cart recovery, and return deflection</li>
            <li>Generate AI-powered responses using the Anthropic Claude API</li>
            <li>Process your subscription via Lemon Squeezy</li>
            <li>Send product updates and important account notifications</li>
            <li>Improve our service based on usage patterns</li>
          </ul>
        </Section>

        <Section title="3. Shopify Data">
          SOLVA accesses your Shopify store data (orders, customers, abandoned checkouts, return requests) strictly to perform automations on your behalf. We do not sell, share, or use this data for any purpose outside of delivering SOLVA's core features. We comply with Shopify's Partner Program requirements and API terms.
        </Section>

        <Section title="4. Third-Party Services">
          <p style={{marginBottom:10}}>SOLVA uses the following third-party services:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Supabase — database and authentication (supabase.com)</li>
            <li>Anthropic Claude API — AI response generation (anthropic.com)</li>
            <li>Lemon Squeezy — subscription billing (lemonsqueezy.com)</li>
            <li>Shopify — store integration (shopify.com)</li>
            <li>Vercel — hosting and serverless functions (vercel.com)</li>
          </ul>
          <p style={{marginTop:10}}>Each of these services has their own privacy policy governing their data handling.</p>
        </Section>

        <Section title="5. Data Retention">
          We retain your data for as long as your account is active. If you delete your account, we permanently delete your profile, store connection, tickets, carts, returns, and settings from our database within 30 days.
        </Section>

        <Section title="6. GDPR Compliance">
          <p style={{marginBottom:10}}>We honor Shopify's mandatory GDPR webhooks:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Customer data requests — we can provide all data we hold on a customer upon request</li>
            <li>Customer data deletion — we delete customer data upon receiving a deletion request</li>
            <li>Shop data deletion — we delete all store data when an app is uninstalled</li>
          </ul>
          <p style={{marginTop:10}}>To make a data request, email us at <a href="mailto:support@getsolva.app" className="legal-link">support@getsolva.app</a>.</p>
        </Section>

        <Section title="7. Data Security">
          <p style={{marginBottom:10}}>We protect your data using:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Row Level Security (RLS) on our database — users can only access their own data</li>
            <li>Encrypted connections (HTTPS) on all endpoints</li>
            <li>Secure environment variable storage for all API keys and secrets</li>
          </ul>
        </Section>

        <Section title="8. Children's Privacy">
          SOLVA is not intended for use by anyone under the age of 18. We do not knowingly collect data from minors.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notice.
        </Section>

        <Section title="10. Contact Us">
          <p>For privacy-related questions or data requests:</p>
          <p style={{marginTop:8}}>Email: <a href="mailto:support@getsolva.app" className="legal-link">support@getsolva.app</a></p>
        </Section>

        {/* Back link */}
        <div style={{marginTop:48,paddingTop:28,borderTop:`1px solid ${C.border}`}}>
          <span className="back-link" onClick={()=>navigate("/")}>← Back to Home</span>
        </div>
      </div>
    </div>
  );
}
