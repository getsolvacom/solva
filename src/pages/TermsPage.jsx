import { useNavigate } from "react-router-dom";
import { C } from "../tokens";

function SolvaLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:9,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:16,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgTerms" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgTerms)"/>
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

export default function TermsPage() {
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
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(28px,5vw,40px)",fontWeight:800,letterSpacing:"-.02em",marginBottom:10}}>Terms of Service</h1>
          <p style={{fontSize:14,color:C.muted}}>Effective Date: June 21, 2026</p>
          <p style={{fontSize:14,color:C.muted}}>Last Updated: June 21, 2026</p>
        </div>

        {/* Intro */}
        <div style={{marginBottom:40,fontSize:14.5,color:C.sub,lineHeight:1.78}}>
          These Terms of Service ("Terms") govern your use of SOLVA ("the Service"), operated by SOLVA (Nigeria). By creating an account or using SOLVA, you agree to these Terms.
        </div>

        {/* Sections */}
        <Section title="1. What SOLVA Does">
          <p style={{marginBottom:10}}>SOLVA is an AI-powered automation platform for Shopify store owners. It automates three workflows:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Support ticket resolution</li>
            <li>Abandoned cart recovery</li>
            <li>Return request deflection</li>
          </ul>
        </Section>

        <Section title="2. Eligibility">
          You must be at least 18 years old and have a valid Shopify store to use SOLVA. By using the Service, you confirm you meet these requirements.
        </Section>

        <Section title="3. Your Account">
          <p style={{marginBottom:10}}>You are responsible for:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Keeping your login credentials secure</li>
            <li>All activity that occurs under your account</li>
            <li>Ensuring the information you provide is accurate</li>
          </ul>
        </Section>

        <Section title="4. Subscription and Billing">
          <p style={{marginBottom:10}}>SOLVA offers three paid plans — Starter ($19/mo), Growth ($69/mo), and Scale ($169/mo) — all with a 14-day free trial.</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Billing is handled by Lemon Squeezy</li>
            <li>Your subscription renews automatically each month</li>
            <li>You can cancel anytime from your billing settings</li>
            <li>No refunds are issued for partial months, except where required by law</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
          </ul>
        </Section>

        <Section title="5. Free Trial">
          All new accounts receive a 14-day free trial. No charge is made until the trial ends. You may cancel before the trial ends without being charged.
        </Section>

        <Section title="6. Acceptable Use">
          <p style={{marginBottom:10}}>You agree NOT to:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Use SOLVA to send spam or unsolicited messages to your customers</li>
            <li>Attempt to reverse engineer, hack, or exploit the platform</li>
            <li>Use SOLVA for any unlawful purpose</li>
            <li>Resell or sublicense access to SOLVA without written permission</li>
          </ul>
        </Section>

        <Section title="7. AI-Generated Content">
          <p style={{marginBottom:10}}>SOLVA uses the Anthropic Claude API to generate responses on your behalf. You acknowledge that:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>AI responses are generated automatically and may not always be perfect</li>
            <li>You are responsible for reviewing escalated tickets and overriding AI responses when needed</li>
            <li>SOLVA does not guarantee specific outcomes from AI automations</li>
          </ul>
        </Section>

        <Section title="8. Shopify Integration">
          By connecting your Shopify store, you authorize SOLVA to access your store data as required to deliver our services. You can revoke this access at any time by uninstalling the app from your Shopify admin.
        </Section>

        <Section title="9. Termination">
          We reserve the right to suspend or terminate your account if you violate these Terms. You may delete your account at any time from the Danger Zone section in Settings.
        </Section>

        <Section title="10. Limitation of Liability">
          <p style={{marginBottom:10}}>To the maximum extent permitted by law, SOLVA shall not be liable for:</p>
          <ul style={{paddingLeft:20,display:"flex",flexDirection:"column",gap:6}}>
            <li>Lost revenue or profits resulting from AI automation errors</li>
            <li>Any indirect, incidental, or consequential damages</li>
            <li>Issues caused by Shopify, Lemon Squeezy, or Anthropic service outages</li>
          </ul>
          <p style={{marginTop:10}}>Our total liability to you shall not exceed the amount you paid us in the 3 months preceding the claim.</p>
        </Section>

        <Section title="11. Disclaimer of Warranties">
          SOLVA is provided "as is" without warranties of any kind. We do not guarantee that the service will be error-free, uninterrupted, or that AI responses will achieve specific business results.
        </Section>

        <Section title="12. Governing Law">
          These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in Nigerian courts.
        </Section>

        <Section title="13. Changes to These Terms">
          We may update these Terms from time to time. Continued use of SOLVA after changes constitutes acceptance of the new Terms. We will notify you of significant changes via email.
        </Section>

        <Section title="14. Contact Us">
          <p>For questions about these Terms:</p>
          <p style={{marginTop:8}}>Email: <a href="mailto:getsolva@gmail.com" className="legal-link">getsolva@gmail.com</a></p>
        </Section>

        {/* Back link */}
        <div style={{marginTop:48,paddingTop:28,borderTop:`1px solid ${C.border}`}}>
          <span className="back-link" onClick={()=>navigate("/")}>← Back to Home</span>
        </div>
      </div>
    </div>
  );
}
