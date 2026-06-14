import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../tokens";
import { Mail, Lock } from "lucide-react";
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
        <p className="fu" style={{fontSize:13.5,color:C.sub,lineHeight:1.7,marginBottom:28}}>Sign in to your account</p>

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
            <span onClick={()=>setShowPass(v=>!v)} style={{padding:"0 14px",color:C.muted,fontSize:13,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",transition:"color .15s"}}>{showPass?"Hide":"Show"}</span>
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
