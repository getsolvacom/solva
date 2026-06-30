import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { C } from "../tokens";
import { Mail, Lock, Eye, EyeOff, Package, User, Bell, Briefcase, Smile, Coffee, Bot, RotateCcw, ShoppingCart } from "lucide-react";
import { supabase } from "../lib/supabase";

const CONFETTI_PIECES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  color: ["#E55266","#992A67","#4E0269","#F0A04B","#3ECFB2","#5BADFF","#fff"][i % 7],
  left: `${Math.random() * 90 + 5}%`,
  delay: `${Math.random() * 0.8}s`,
  dur: `${1.4 + Math.random() * 0.8}s`,
  rot: Math.random() * 360,
  shape: Math.random() > 0.5 ? "50%" : "2px",
}));

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      html, body { background: var(--bg, #060008) !important; }
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes orbPulse{0%,100%{transform:scale(1);opacity:.50;}50%{transform:scale(1.10);opacity:.75;}}
      @keyframes popIn{0%{opacity:0;transform:scale(.88);}70%{transform:scale(1.04);}100%{opacity:1;transform:scale(1);}}
      @keyframes checkDraw{from{stroke-dashoffset:60;}to{stroke-dashoffset:0;}}
      @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1;}100%{transform:translateY(120px) rotate(360deg);opacity:0;}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .fu{animation:fadeUp .6s cubic-bezier(.16,1,.3,1) both;}
      .fu1{animation-delay:.08s;}.fu2{animation-delay:.16s;}.fu3{animation-delay:.24s;}.fu4{animation-delay:.32s;}
      .pop-in{animation:popIn .55s cubic-bezier(.34,1.56,.64,1) both;}
      .check-path{stroke-dasharray:60;stroke-dashoffset:60;animation:checkDraw .6s cubic-bezier(.16,1,.3,1) .3s forwards;}
      .confetti-piece{position:absolute;width:8px;height:8px;animation:confettiFall 1.8s ease-in forwards;pointer-events:none;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .2s,box-shadow .2s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 32px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .15s ease;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .tone-card{cursor:pointer;transition:all .18s ease;border-radius:12px;}
      .tone-card:hover{transform:translateY(-2px);}
      .toggle-track{cursor:pointer;transition:background .2s ease;display:flex;align-items:center;padding:0 3px;flex-shrink:0;}
      .toggle-thumb{border-radius:50%;background:#fff;transition:transform .22s cubic-bezier(.34,1.56,.64,1);box-shadow:0 1px 4px rgba(0,0,0,.3);}
      .orb{border-radius:50%;filter:blur(80px);animation:orbPulse 6s ease-in-out infinite;position:absolute;pointer-events:none;}
      input,select,textarea{font-family:'Outfit',sans-serif;outline:none;resize:none;}
      .stepbar{max-width:600px;margin:0 auto;width:100%;}
      @media(max-width:767px){
        .stepbar-circle{width:26px!important;height:26px!important;font-size:11px!important;}
        .stepbar-label{font-size:8.5px!important;white-space:normal!important;text-align:center;max-width:48px;}

      }
    `}</style>
  );
}

function SolvaLogo({ size=15 }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:size,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgOnboard" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgOnboard)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

function StepBar({ current }) {
  const steps = ["Create Account","Tell Us More","Connect Store","Configure","Go Live"];
  return (
    <div className="stepbar" style={{position:"relative",marginBottom:46,width:"100%",padding:"0 8px",boxSizing:"border-box"}}>
      {/* Background track line - spans full width behind circles */}
      <div style={{position:"absolute",top:17,left:17,right:17,height:2,background:C.dim,zIndex:0}}/>
      {/* Progress fill line - width based on current step */}
      <div style={{
        position:"absolute",top:17,left:17,
        width:`calc(${((current-1)/(steps.length-1))*100}% - ${((current-1)/(steps.length-1))*34}px)`,
        height:2,
        background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",
        zIndex:0,
        transition:"width .4s cubic-bezier(.16,1,.3,1)",
      }}/>
      <div style={{display:"flex",justifyContent:"space-between",position:"relative",zIndex:1}}>
        {steps.map((s,i) => {
          const done = i+1 < current, active = i+1 === current;
          return (
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:7,flex:"1 1 0",minWidth:0}}>
              <div className="stepbar-circle" style={{width:34,height:34,borderRadius:"50%",background:done||active?"linear-gradient(135deg,#E55266,#992A67,#4E0269)":C.dim,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12.5,fontWeight:700,color:done||active?"#fff":C.muted,boxShadow:active?"0 0 22px rgba(229,82,102,.30)":"none",border:`2px solid ${done||active?"transparent":C.border}`}}>
                {done?"✓":i+1}
              </div>
              <span className="stepbar-label" style={{fontSize:10.5,fontWeight:active?600:400,color:active?C.coral:done?C.sub:C.muted,whiteSpace:"normal",textAlign:"center",maxWidth:64,lineHeight:1.3}}>{s}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Toggle({ on, onToggle }) {
  return (
    <div className="toggle-track" onClick={onToggle} style={{width:42,height:24,borderRadius:100,background:on?C.coral:C.dim,flexShrink:0}}>
      <div className="toggle-thumb" style={{width:18,height:18,transform:on?"translateX(18px)":"translateX(0)"}}/>
    </div>
  );
}

function CardShell({ children, maxWidth=520 }) {
  return (
    <div style={{width:"100%",maxWidth}}>
      <div style={{background:C.surface,borderRadius:22,border:`1px solid ${C.border}`,padding:40,position:"relative",zIndex:1}}>
        {children}
      </div>
    </div>
  );
}

// ── LOGIN ──
function LoginForm({ onSignup, goDash }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  return (
    <CardShell>
      <h1 className="fu" style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,letterSpacing:"-.02em",marginBottom:8}}>Welcome back</h1>
      <p className="fu" style={{fontSize:13.5,color:C.sub,lineHeight:1.7,marginBottom:28}}>Sign in to your account</p>

      <div className="fu fu1">
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Email Address</label>
        <div style={{display:"flex",alignItems:"center",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden",marginBottom:16}}>
          <span style={{padding:"0 14px",color:C.muted,display:"flex",alignItems:"center"}}><Mail size={16} strokeWidth={2}/></span>
          <input type="email" placeholder="you@yourstore.com" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1,padding:"13px 14px 13px 0",background:"transparent",border:"none",color:C.text,fontSize:14.5}}/>
        </div>

        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Password</label>
        <div style={{display:"flex",alignItems:"center",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden",marginBottom:8}}>
          <span style={{padding:"0 14px",color:C.muted,display:"flex",alignItems:"center"}}><Lock size={16} strokeWidth={2}/></span>
          <input type={showPass?"text":"password"} placeholder="Your password" value={password} onChange={e=>setPassword(e.target.value)} style={{flex:1,padding:"13px 14px 13px 0",background:"transparent",border:"none",color:C.text,fontSize:14.5}}/>
          <span onClick={()=>setShowPass(v=>!v)} style={{padding:"0 14px",color:C.muted,fontSize:13,cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",transition:"color .15s"}}>{showPass?"Hide":"Show"}</span>
        </div>
        <p style={{textAlign:"right",marginBottom:26}}>
          <span style={{fontSize:12.5,color:C.coral,cursor:"pointer"}}>Forgot password?</span>
        </p>
      </div>

      <div className="fu fu2">
        <button className="btn-primary" onClick={goDash} style={{width:"100%",padding:"14px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,marginBottom:16}}>Sign In →</button>
        <p style={{textAlign:"center",fontSize:13,color:C.muted}}>Don't have an account? <span onClick={onSignup} style={{color:C.coral,cursor:"pointer"}}>Get started free</span></p>
      </div>
    </CardShell>
  );
}

// ── STEP 1 ──
function Step1({ onNext, onLogin }) {
  const [email,          setEmail]          = useState("");
  const [password,       setPassword]       = useState("");
  const [showPass,       setShowPass]       = useState(false);
  const [agreed,         setAgreed]         = useState(false);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [duplicateEmail, setDuplicateEmail] = useState(false);
  const [googleLoading,  setGoogleLoading]  = useState(false);
  const [done,           setDone]           = useState(false);

  const handleGoogleSignup = async () => {
    setError("");
    setDuplicateEmail(false);
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

  const getStrength = (pw) => {
    const hasLetter  = /[a-zA-Z]/.test(pw);
    const hasNumber  = /[0-9]/.test(pw);
    const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
    if (pw.length < 8)                         return { level:"Weak",        pct:25,  color:C.red   };
    if (!hasLetter || !hasNumber)              return { level:"Fair",        pct:50,  color:C.amber };
    if (hasLetter && hasNumber && !hasSpecial) return { level:"Strong",      pct:75,  color:C.teal  };
    return                                            { level:"Very Strong", pct:100, color:C.coral };
  };

  const strength = password.length > 0 ? getStrength(password) : null;

  const handleSignup = async () => {
    setError("");
    setDuplicateEmail(false);
    if (!agreed) { setError("Please agree to the Terms of Service and Privacy Policy."); return; }
    setLoading(true);
    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: "" } },
    });
    setLoading(false);
    if (err) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
        setDuplicateEmail(true);
      } else {
        setError(msg);
      }
    } else if (data?.user?.identities?.length === 0) {
      // Supabase returns success but empty identities when email already exists
      setDuplicateEmail(true);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <CardShell>
        <div style={{textAlign:"center",padding:"12px 0"}}>
          <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:"0 0 32px rgba(229,82,102,.30)"}}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <path d="M8 18.5l7.5 7.5 12.5-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:22,fontWeight:800,letterSpacing:"-.02em",marginBottom:12}}>Check your email</h2>
          <p style={{fontSize:14,color:C.sub,lineHeight:1.7,marginBottom:8}}>
            We've sent a verification link to <span style={{color:C.coral,fontWeight:600}}>{email}</span>.
          </p>
          <p style={{fontSize:13.5,color:C.muted,lineHeight:1.7}}>
            Check your email to verify your account before continuing.
          </p>
        </div>
      </CardShell>
    );
  }

  return (
    <CardShell>
      <h1 className="fu" style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,letterSpacing:"-.02em",marginBottom:8}}>Create your account</h1>
      <p className="fu" style={{fontSize:13.5,color:C.sub,lineHeight:1.7,marginBottom:26}}>Start your free 14-day trial. No credit card required.</p>

      {/* Google SSO */}
      <button className="btn-ghost fu fu1" onClick={handleGoogleSignup} disabled={googleLoading} style={{width:"100%",padding:"12px",borderRadius:10,border:`1px solid ${C.border}`,color:C.text,fontSize:14,fontWeight:500,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:10,opacity:googleLoading?0.7:1}}>
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

      <div className="fu fu1" style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
        <div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:12,color:C.muted,whiteSpace:"nowrap"}}>or continue with email</span><div style={{flex:1,height:1,background:C.border}}/>
      </div>

      <div className="fu fu2">
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Email Address</label>
        <div style={{display:"flex",alignItems:"center",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden",marginBottom:16}}>
          <span style={{padding:"0 14px",color:C.muted,display:"flex",alignItems:"center"}}><Mail size={16} strokeWidth={2}/></span>
          <input type="email" placeholder="you@yourstore.com" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1,padding:"13px 14px 13px 0",background:"transparent",border:"none",color:C.text,fontSize:14.5}}/>
        </div>

        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Password</label>
        <div style={{display:"flex",alignItems:"center",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden",marginBottom:8}}>
          <span style={{padding:"0 14px",color:C.muted,display:"flex",alignItems:"center"}}><Lock size={16} strokeWidth={2}/></span>
          <input type={showPass?"text":"password"} placeholder="Min. 8 characters" value={password} onChange={e=>setPassword(e.target.value)} style={{flex:1,padding:"13px 14px 13px 0",background:"transparent",border:"none",color:C.text,fontSize:14.5}}/>
          <span onClick={()=>setShowPass(v=>!v)} style={{padding:"0 14px",color:showPass?C.coral:C.muted,display:"flex",alignItems:"center",cursor:"pointer",transition:"color .15s"}}>
            {showPass ? <EyeOff size={16} strokeWidth={2}/> : <Eye size={16} strokeWidth={2}/>}
          </span>
        </div>

        {strength && (
          <div style={{marginBottom:12}}>
            <div style={{height:3,borderRadius:100,background:C.dim,overflow:"hidden",marginBottom:6}}>
              <div style={{height:"100%",width:`${strength.pct}%`,borderRadius:100,background:strength.color,transition:"width .3s ease, background .3s ease"}}/>
            </div>
            <span style={{fontSize:11.5,fontWeight:600,color:strength.color,transition:"color .3s ease"}}>{strength.level}</span>
          </div>
        )}
        {!strength && <div style={{marginBottom:20}}/>}
      </div>

      <div className="fu fu3" style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:16}}>
        <div onClick={()=>setAgreed(!agreed)} style={{width:18,height:18,borderRadius:5,flexShrink:0,border:`1.5px solid ${agreed?C.coral:C.border}`,background:agreed?C.coral:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .15s",marginTop:1}}>
          {agreed&&<span style={{color:"#fff",fontSize:11,fontWeight:700}}>✓</span>}
        </div>
        <span style={{fontSize:13,color:C.sub,lineHeight:1.6}}>
          I agree to Solva's{" "}
          <span onClick={(e) => { e.stopPropagation(); window.open("/terms", "_blank"); }} style={{color:C.coral,cursor:"pointer",textDecoration:"underline",textDecorationColor:"rgba(229,82,102,.4)"}}>Terms of Service</span>
          {" "}and{" "}
          <span onClick={(e) => { e.stopPropagation(); window.open("/privacy", "_blank"); }} style={{color:C.coral,cursor:"pointer",textDecoration:"underline",textDecorationColor:"rgba(229,82,102,.4)"}}>Privacy Policy</span>
        </span>
      </div>

      {duplicateEmail && (
        <p style={{fontSize:13,color:C.red,marginBottom:16,padding:"10px 14px",borderRadius:8,background:"rgba(255,82,114,.08)",border:"1px solid rgba(255,82,114,.20)"}}>
          An account with this email already exists.{" "}
          <span onClick={onLogin} style={{color:C.coral,cursor:"pointer",fontWeight:600}}>Sign in instead.</span>
        </p>
      )}

      {error && (
        <p style={{fontSize:13,color:C.red,marginBottom:16,padding:"10px 14px",borderRadius:8,background:"rgba(255,82,114,.08)",border:"1px solid rgba(255,82,114,.20)"}}>
          {error}
        </p>
      )}

      <div className="fu fu4">
        <button className="btn-primary" onClick={handleSignup} disabled={loading} style={{width:"100%",padding:"14px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,marginBottom:16,opacity:loading?0.7:1}}>
          {loading?"Creating account…":"Create My Account →"}
        </button>
        <p style={{textAlign:"center",fontSize:13,color:C.muted}}>Already have an account? <span onClick={onLogin} style={{color:C.coral,cursor:"pointer"}}>Sign in</span></p>
      </div>
    </CardShell>
  );
}

// ── STEP 1b ──
function Step1b({ onNext, onBack }) {
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [q3, setQ3] = useState(null);

  const allAnswered = q1 !== null && q2 !== null && q3 !== null;

  const q1Opts = ["Resolve support tickets faster","Deflect returns & save margin","Recover abandoned carts","All three — full autopilot"];
  const q2Opts = ["Less than 100","100 – 500","500 – 2,000","2,000+"];
  const q3Opts = ["Just me","2 – 3 people","4 – 10 people","More than 10"];

  const renderGrid = (opts, selected, onSelect) => (
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
      {opts.map((opt,i) => (
        <div key={i} className="tone-card" onClick={()=>onSelect(i)}
          style={{padding:"14px 12px",background:selected===i?"rgba(229,82,102,.09)":C.card,border:`1px solid ${selected===i?C.coral:C.border}`}}>
          <div style={{fontSize:13.5,color:selected===i?C.coral:C.text,fontWeight:selected===i?600:400,lineHeight:1.4}}>{opt}</div>
        </div>
      ))}
    </div>
  );

  function handleNext() {
    localStorage.setItem("solva_onboarding", JSON.stringify({
      goal: q1,
      orders: q2,
      teamSize: q3,
    }));
    onNext();
  }

  return (
    <CardShell maxWidth={520}>
      <h1 className="fu" style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,letterSpacing:"-.02em",marginBottom:8}}>Quick setup questions</h1>
      <p className="fu" style={{fontSize:13.5,color:C.sub,lineHeight:1.7,marginBottom:28}}>Help us personalise your Solva experience. Takes 30 seconds.</p>

      <div className="fu fu1" style={{marginBottom:22}}>
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:10}}>What's your main goal with Solva?</label>
        {renderGrid(q1Opts, q1, setQ1)}
      </div>

      <div className="fu fu2" style={{marginBottom:22}}>
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:10}}>How many orders does your store get per month?</label>
        {renderGrid(q2Opts, q2, setQ2)}
      </div>

      <div className="fu fu3" style={{marginBottom:28}}>
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:10}}>How big is your support team?</label>
        {renderGrid(q3Opts, q3, setQ3)}
      </div>

      <div className="fu fu4">
        <button className="btn-primary" onClick={allAnswered?handleNext:undefined}
          style={{width:"100%",padding:"14px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,marginBottom:12,opacity:allAnswered?1:0.5,cursor:allAnswered?"pointer":"default"}}>
          Next →
        </button>
        <button className="btn-ghost" onClick={onBack} style={{width:"100%",padding:"11px",borderRadius:10,border:`1px solid ${C.border}`,color:C.sub,fontSize:14}}>← Back</button>
      </div>
    </CardShell>
  );
}

// ── STEP 2 ──
function Step2({ onNext, onBack }) {
  const [shopDomain, setShopDomain] = useState("");
  const [shopError,  setShopError]  = useState("");

  const handleConnectStore = async () => {
    let domain = shopDomain.trim().toLowerCase();
    domain = domain.replace('https://', '').replace('http://', '').replace(/\/$/, '');
    if (!domain.includes('.myshopify.com')) {
      domain = domain + '.myshopify.com';
    }
    if (!domain) {
      setShopError('Please enter your Shopify store URL');
      return;
    }
    setShopError('');

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || '';

    window.location.href = `/api/shopify/auth?shop=${domain}&userId=${userId}`;
  };

  return (
    <CardShell>
      <h1 className="fu" style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,letterSpacing:"-.02em",marginBottom:8}}>Connect Your Shopify Store</h1>
      <p className="fu" style={{fontSize:13.5,color:C.sub,lineHeight:1.7,marginBottom:28}}>Enter your store URL. We'll install the app and request only the permissions needed.</p>

      <div className="fu fu1">
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Store URL</label>
        <div style={{display:"flex",borderRadius:10,border:`1px solid ${shopDomain?C.coral:C.border}`,background:C.card,overflow:"hidden",marginBottom:shopError?8:22,transition:"border-color .2s"}}>
          <input
            value={shopDomain}
            onChange={e=>{ setShopDomain(e.target.value); setShopError(""); }}
            onKeyDown={e=>{ if (e.key==="Enter") handleConnectStore(); }}
            placeholder="yourstore.myshopify.com"
            style={{flex:1,padding:"13px 16px",background:"transparent",border:"none",color:C.text,fontSize:14.5}}
          />
        </div>
        {shopError && (
          <p style={{fontSize:13,color:C.red,marginBottom:16,padding:"10px 14px",borderRadius:8,background:"rgba(255,82,114,.08)",border:"1px solid rgba(255,82,114,.20)"}}>
            {shopError}
          </p>
        )}
      </div>

      <div className="fu fu2" style={{padding:16,borderRadius:12,background:C.card,border:`1px solid ${C.border}`,marginBottom:26}}>
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>Permissions Required</p>
        {[[<Package size={16} strokeWidth={2}/>, "Read orders & fulfilment data"],[<User size={16} strokeWidth={2}/>, "Read customer information"],[<Mail size={16} strokeWidth={2}/>, "Send transactional emails"],[<Bell size={16} strokeWidth={2}/>, "Access store webhooks"]].map(([icon,label],i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:i<3?`1px solid ${C.dim}`:"none"}}>
            <span style={{display:"flex",alignItems:"center",flexShrink:0,color:C.muted}}>{icon}</span>
            <span style={{fontSize:13,color:C.sub,flex:1}}>{label}</span>
            <span style={{fontSize:11,color:C.coral,fontWeight:700,background:"rgba(229,82,102,.10)",padding:"2px 7px",borderRadius:4}}>✓ Granted</span>
          </div>
        ))}
      </div>

      <div className="fu fu3">
        <button className="btn-primary" onClick={handleConnectStore} style={{width:"100%",padding:"14px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,marginBottom:14}}>Install Solva on Shopify →</button>
        <p style={{textAlign:"center",fontSize:12,color:C.muted,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}><Lock size={16} strokeWidth={2}/>256-bit encrypted. We never store or sell your customer data.</p>
      </div>
    </CardShell>
  );
}

// ── STEP 3 ──
function Step3({ onNext, onBack }) {
  const [tone,    setTone]    = useState("friendly");
  const [support, setSupport] = useState(true);
  const [returns, setReturns] = useState(true);
  const [cart,    setCart]    = useState(true);
  const [email,   setEmail]   = useState("");
  const [lang,    setLang]    = useState("English");

  const tones = [
    {key:"professional",emoji:<Briefcase size={20} strokeWidth={2}/>,label:"Professional",desc:"Formal, precise. Best for B2B or high-ticket."},
    {key:"friendly",    emoji:<Smile size={20} strokeWidth={2}/>,    label:"Friendly",    desc:"Warm and helpful. Works for most brands."},
    {key:"casual",      emoji:<Coffee size={20} strokeWidth={2}/>,   label:"Casual",      desc:"Relaxed. Great for lifestyle brands."},
  ];

  const automations = [
    {key:"support",icon:<Bot size={18} strokeWidth={2}/>,         label:"AI Support Agent",  desc:"Auto-resolve tickets & inquiries",      color:C.teal,  on:support, toggle:()=>setSupport(v=>!v)},
    {key:"returns",icon:<RotateCcw size={18} strokeWidth={2}/>,   label:"Return Deflection",  desc:"Offer alternatives before refunds",     color:C.amber, on:returns, toggle:()=>setReturns(v=>!v)},
    {key:"cart",   icon:<ShoppingCart size={18} strokeWidth={2}/>,label:"Cart Recovery",      desc:"3-touch sequence to recover lost sales", color:C.blue,  on:cart,    toggle:()=>setCart(v=>!v)},
  ];

  return (
    <CardShell maxWidth={520}>
      <h1 className="fu" style={{fontFamily:"'Outfit',sans-serif",fontSize:24,fontWeight:800,letterSpacing:"-.02em",marginBottom:8}}>Configure Your AI</h1>
      <p className="fu" style={{fontSize:13.5,color:C.sub,lineHeight:1.7,marginBottom:28}}>Set how Solva communicates and which automations to activate.</p>

      <div className="fu fu1" style={{marginBottom:22}}>
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:10}}>Brand Tone</label>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
          {tones.map(t=>(
            <div key={t.key} className="tone-card" onClick={()=>setTone(t.key)} style={{padding:"14px 12px",background:tone===t.key?"rgba(229,82,102,.09)":C.card,border:`1px solid ${tone===t.key?C.coral:C.border}`}}>
              <div style={{marginBottom:8,display:"flex",alignItems:"center",color:tone===t.key?C.coral:C.muted}}>{t.emoji}</div>
              <div style={{fontSize:13,fontWeight:700,color:tone===t.key?C.coral:C.text,marginBottom:5}}>{t.label}</div>
              <div style={{fontSize:11.5,color:C.muted,lineHeight:1.5}}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fu fu2" style={{marginBottom:22}}>
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:10}}>Active Automations</label>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {automations.map(a=>(
            <div key={a.key} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 16px",borderRadius:12,background:C.card,border:`1px solid ${a.on?a.color+"30":C.border}`,transition:"border-color .2s"}}>
              <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${a.color}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{a.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13.5,fontWeight:600,color:C.text,marginBottom:3}}>{a.label}</div>
                <div style={{fontSize:12,color:C.muted}}>{a.desc}</div>
              </div>
              <Toggle on={a.on} onToggle={a.toggle}/>
            </div>
          ))}
        </div>
      </div>

      <div className="fu fu3" style={{marginBottom:18}}>
        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Escalation Email</label>
        <div style={{display:"flex",alignItems:"center",borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden",marginBottom:14}}>
          <span style={{padding:"0 14px",color:C.muted,display:"flex",alignItems:"center"}}><Mail size={16} strokeWidth={2}/></span>
          <input type="email" placeholder="support@yourstore.com" value={email} onChange={e=>setEmail(e.target.value)} style={{flex:1,padding:"13px 14px 13px 0",background:"transparent",border:"none",color:C.text,fontSize:14.5}}/>
        </div>

        <label style={{fontSize:11.5,fontWeight:700,color:C.sub,letterSpacing:".05em",textTransform:"uppercase",display:"block",marginBottom:8}}>Response Language</label>
        <div style={{borderRadius:10,border:`1px solid ${C.border}`,background:C.card,overflow:"hidden"}}>
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{width:"100%",padding:"12px 14px",background:"transparent",border:"none",color:C.text,fontSize:14,cursor:"pointer"}}>
            {["English","French","Spanish","German","Portuguese","Arabic"].map(l=><option key={l} value={l} style={{background:"#110014"}}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="fu fu4">
        <button className="btn-primary" onClick={onNext} style={{width:"100%",padding:"14px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15,marginBottom:12}}>Save Configuration →</button>
        <button className="btn-ghost" onClick={onBack} style={{width:"100%",padding:"11px",borderRadius:10,border:`1px solid ${C.border}`,color:C.sub,fontSize:14}}>← Back</button>
      </div>
    </CardShell>
  );
}

// ── STEP 4 ──
function Step4({ goDash }) {
  return (
    <CardShell maxWidth={520}>
      {/* Confetti */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",borderRadius:22,pointerEvents:"none"}}>
        {CONFETTI_PIECES.map(c=>(
          <div key={c.id} className="confetti-piece" style={{background:c.color,left:c.left,top:"-10px",borderRadius:c.shape,animationDelay:c.delay,animationDuration:c.dur,transform:`rotate(${c.rot}deg)`}}/>
        ))}
      </div>

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:28}}>
        <div className="pop-in" style={{width:80,height:80,borderRadius:"50%",background:"linear-gradient(135deg,#E55266,#992A67,#4E0269)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,boxShadow:"0 0 40px rgba(229,82,102,.30)"}}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path className="check-path" d="M8 18.5l7.5 7.5 12.5-14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1 className="fu" style={{fontFamily:"'Outfit',sans-serif",fontSize:26,fontWeight:800,letterSpacing:"-.02em",textAlign:"center",marginBottom:8}}>You're live on Solva!</h1>
        <p className="fu fu1" style={{fontSize:14,color:C.sub,textAlign:"center",lineHeight:1.7}}>Your store is now running on full autopilot. Every ticket, return, and abandoned cart is handled automatically.</p>
      </div>

      <div className="fu fu2" style={{padding:16,borderRadius:14,background:C.card,border:`1px solid ${C.border}`,marginBottom:22}}>
        <p style={{fontSize:11,fontWeight:700,color:C.muted,letterSpacing:".08em",textTransform:"uppercase",marginBottom:12}}>Active Automations</p>
        {[{icon:<Bot size={18} strokeWidth={2}/>,label:"AI Support Agent",color:C.teal},{icon:<RotateCcw size={18} strokeWidth={2}/>,label:"Return Deflection",color:C.amber},{icon:<ShoppingCart size={18} strokeWidth={2}/>,label:"Cart Recovery",color:C.blue}].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"9px 0",borderBottom:i<2?`1px solid ${C.dim}`:"none"}}>
            <div style={{width:32,height:32,borderRadius:8,flexShrink:0,background:`${s.color}14`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{s.icon}</div>
            <span style={{fontSize:13.5,color:C.text,flex:1,fontWeight:500}}>{s.label}</span>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:s.color}}/>
              <span style={{fontSize:12,color:s.color,fontWeight:600}}>Active</span>
            </div>
          </div>
        ))}
      </div>

      <div className="fu fu3" style={{padding:16,borderRadius:14,background:"rgba(229,82,102,.06)",border:"1px solid rgba(229,82,102,.16)",marginBottom:26}}>
        <p style={{fontSize:11,fontWeight:700,color:C.coral,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10}}>What happens next</p>
        {["First ticket auto-resolved within minutes of going live","Weekly performance report sent every Monday","Your 14-day free trial is now running — no card charged yet"].map((t,i)=>(
          <div key={i} style={{display:"flex",gap:9,marginBottom:i<2?8:0}}>
            <span style={{color:C.coral,fontSize:13,flexShrink:0,marginTop:1}}>→</span>
            <span style={{fontSize:13,color:C.sub,lineHeight:1.55}}>{t}</span>
          </div>
        ))}
      </div>

      <div className="fu fu4">
        <button className="btn-primary" onClick={goDash} style={{width:"100%",padding:"14px",borderRadius:10,color:"#fff",fontWeight:700,fontSize:15}}>Enter My Dashboard →</button>
      </div>
    </CardShell>
  );
}

// ── MAIN EXPORT ──
export default function OnboardingPage() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const initialMode    = searchParams.get("mode") || "signup";
  const goDash         = () => navigate("/dashboard");
  const goBack         = () => navigate("/");
  const [step, setStep] = useState(2);
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStep(2);
      } else {
        setStep(1);
      }
    };
    checkSession();
  }, []);

  return (
    <div style={{background:C.bg,minHeight:"100vh",fontFamily:"'Outfit',sans-serif",color:C.text,display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 24px 48px",position:"relative",overflow:"hidden"}}>
      <GlobalStyles/>

      {/* Orbs */}
      <div className="orb" style={{width:500,height:500,top:"-150px",left:"50%",transform:"translateX(-50%)",background:"rgba(153,42,103,.12)"}}/>
      <div className="orb" style={{width:300,height:300,bottom:"-60px",right:"-60px",background:"rgba(78,2,105,.18)",animationDelay:"3s"}}/>

      {/* Logo */}
      <div onClick={goBack} style={{width:"100%",maxWidth:520,marginBottom:36,position:"relative",zIndex:1,cursor:"pointer"}}>
        <SolvaLogo/>
      </div>

      {/* Step bar — hidden in login mode */}
      {mode === "signup" && (
        <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:520,margin:"0 auto"}}>
          <StepBar current={step}/>
        </div>
      )}

      {/* Login / Steps */}
      <div style={{width:"100%",maxWidth:520,position:"relative",zIndex:1,marginTop:36}}>
        {mode === "login"  && <LoginForm onSignup={()=>setMode("signup")} goDash={goDash}/>}
        {mode === "signup" && step===1 && <Step1 onNext={()=>setStep(2)} onLogin={()=>navigate("/login")}/>}
        {mode === "signup" && step===2 && <Step1b onNext={()=>setStep(3)} onBack={()=>setStep(1)}/>}
        {mode === "signup" && step===3 && <Step2 onNext={()=>setStep(4)} onBack={()=>setStep(2)}/>}
        {mode === "signup" && step===4 && <Step3 onNext={()=>setStep(5)} onBack={()=>setStep(3)}/>}
        {mode === "signup" && step===5 && <Step4 goDash={goDash}/>}
      </div>

      {(mode === "login" || step < 5) && (
        <button onClick={goBack} className="btn-ghost" style={{marginTop:22,background:"none",border:"none",color:C.muted,fontSize:13.5,cursor:"pointer"}}>
          ← Back to home
        </button>
      )}
    </div>
  );
}