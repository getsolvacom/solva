import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../tokens";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "../lib/supabase";

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes orbPulse{0%,100%{transform:scale(1);opacity:.50;}50%{transform:scale(1.10);opacity:.75;}}
      .fu{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both;}
      .fu1{animation-delay:.08s;}.fu2{animation-delay:.16s;}.fu3{animation-delay:.24s;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .2s,box-shadow .2s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(229,82,102,.28);}
      .btn-primary:disabled{transform:none;box-shadow:none;cursor:default;}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .15s ease;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .orb{border-radius:50%;filter:blur(80px);animation:orbPulse 6s ease-in-out infinite;position:absolute;pointer-events:none;}
      input{font-family:'Outfit',sans-serif;outline:none;}
      @keyframes spin{to{transform:rotate(360deg)}}
    `}</style>
  );
}

function SolvaLogo({ size = 15 }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:size,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgLogin" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgLogin)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPass,     setShowPass]     = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [resetSent,    setResetSent]    = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setError("");
    setGoogleLoading(true);
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "https://solva-sigma.vercel.app/dashboard" },
    });
    if (err) {
      setGoogleLoading(false);
      setError(err.message);
    }
  };

  const handleSignIn = async () => {
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      navigate("/dashboard");
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    if (!email) {
      setError("Enter your email address above, then click 'Forgot password?'");
      return;
    }
    setResetLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email);
    setResetLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setResetSent(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignIn();
  };

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text,display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 24px 48px",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>

      {/* Orbs */}
      <div className="orb" style={{width:500,height:500,top:"-150px",left:"50%",transform:"translateX(-50%)",background:"rgba(153,42,103,.12)"}}/>
      <div className="orb" style={{width:300,height:300,bottom:"-60px",right:"-60px",background:"rgba(78,2,105,.18)",animationDelay:"3s"}}/>

      {/* Logo */}
      <div onClick={()=>navigate("/")} style={{width:"100%",maxWidth:480,marginBottom:40,position:"relative",zIndex:1,cursor:"pointer"}}>
        <SolvaLogo/>
      </div>

      {/* Card */}
      <div style={{width:"100%",maxWidth:480,background:C.surface,borderRadius:22,border:`1px solid ${C.border}`,padding:40,position:"relative",zIndex:1}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",borderRadius:"22px 22px 0 0"}}/>

        <h1 className="fu" style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,letterSpacing:"-.02em",marginBottom:8}}>Welcome back</h1>
        <p className="fu" style={{fontSize:13.5,color:C.sub,lineHeight:1.7,marginBottom:20}}>Sign in to your account</p>

        {/* Google SSO */}
        <button className="btn-ghost" onClick={handleGoogleSignIn} disabled={googleLoading} style={{width:"100%",padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontWeight:500,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:googleLoading?0.7:1}}>
          {googleLoading ? (
            <>
              <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${C.dim}`,borderTopColor:C.muted,animation:"spin .7s linear infinite",flexShrink:0}}/>
              Redirecting to Google…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#EA4335" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
                <path fill="#4285F4" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
                <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/>
                <path fill="#34A853" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </>
          )}
        </button>

        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:12,color:C.muted,whiteSpace:"nowrap"}}>or continue with email</span><div style={{flex:1,height:1,background:C.border}}/>
        </div>

        <div className="fu fu1">
          <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Email Address</label>
          <div style={{display:"flex",alignItems:"center",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden",marginBottom:16}}>
            <span style={{padding:"0 14px",color:C.muted,display:"flex",alignItems:"center"}}><Mail size={16} strokeWidth={2}/></span>
            <input
              type="email"
              placeholder="you@yourstore.com"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{flex:1,padding:"13px 14px 13px 0",background:"transparent",border:"none",color:C.text,fontSize:14.5}}
            />
          </div>

          <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Password</label>
          <div style={{display:"flex",alignItems:"center",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden",marginBottom:8}}>
            <span style={{padding:"0 14px",color:C.muted,display:"flex",alignItems:"center"}}><Lock size={16} strokeWidth={2}/></span>
            <input
              type={showPass?"text":"password"}
              placeholder="Your password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{flex:1,padding:"13px 14px 13px 0",background:"transparent",border:"none",color:C.text,fontSize:14.5}}
            />
            <span onClick={()=>setShowPass(v=>!v)} style={{padding:"0 14px",color:showPass?C.coral:C.muted,display:"flex",alignItems:"center",cursor:"pointer",transition:"color .15s"}}>
              {showPass ? <EyeOff size={16} strokeWidth={2}/> : <Eye size={16} strokeWidth={2}/>}
            </span>
          </div>

          <p style={{textAlign:"right",marginBottom:resetSent?12:26}}>
            <span
              onClick={handleForgotPassword}
              style={{fontSize:12.5,color:resetLoading?C.muted:C.coral,cursor:resetLoading?"default":"pointer"}}
            >
              {resetLoading?"Sending…":"Forgot password?"}
            </span>
          </p>

          {resetSent && (
            <p style={{fontSize:13,color:C.teal,marginBottom:20,padding:"10px 14px",borderRadius:8,background:"rgba(62,207,178,.08)",border:"1px solid rgba(62,207,178,.20)"}}>
              Password reset email sent — check your inbox.
            </p>
          )}
        </div>

        {error && (
          <p style={{fontSize:13,color:C.red,marginBottom:16,padding:"10px 14px",borderRadius:8,background:"rgba(255,82,114,.08)",border:"1px solid rgba(255,82,114,.20)"}}>
            {error}
          </p>
        )}

        <div className="fu fu2">
          <button
            className="btn-primary"
            onClick={handleSignIn}
            disabled={loading}
            style={{width:"100%",padding:"14px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,marginBottom:16,opacity:loading?0.7:1}}
          >
            {loading?"Signing in…":"Sign In →"}
          </button>
          <p style={{textAlign:"center",fontSize:13,color:C.muted}}>
            Don't have an account?{" "}
            <span onClick={()=>navigate("/onboarding")} style={{color:C.coral,cursor:"pointer"}}>Get Started</span>
          </p>
        </div>
      </div>

      <button onClick={()=>navigate("/")} className="btn-ghost" style={{marginTop:22,background:"none",border:"none",color:C.muted,fontSize:13.5,cursor:"pointer"}}>
        ← Back to home
      </button>
    </div>
  );
}
