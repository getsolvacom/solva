import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../tokens";
import { Settings, CreditCard, UserPlus, Store, HelpCircle, MessageCircle, Sparkles, LogOut } from "lucide-react";

const AVATAR_URL = "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=4E0269";

function MenuItem({ icon, label, onClick, danger }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:"flex", alignItems:"center", gap:10,
        padding:"8px 16px", cursor:"pointer",
        background: hov ? (danger ? "rgba(229,82,102,.07)" : C.dim) : "transparent",
        transition:"background .12s",
      }}
    >
      <span style={{color:danger?C.coral:C.muted,flexShrink:0,display:"flex"}}>{icon}</span>
      <span style={{fontSize:13,color:danger?C.coral:C.sub}}>{label}</span>
    </div>
  );
}

export default function AvatarMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const [pos, setPos] = useState({ top:0, right:0 });
  const btnRef = useRef(null);
  const dropRef = useRef(null);

  const toggle = () => {
    const next = !open;
    if (next && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
    if (!next) setLogoutConfirm(false);
    setOpen(next);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target)) return;
      if (dropRef.current?.contains(e.target)) return;
      setOpen(false);
      setLogoutConfirm(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [open]);

  const go = (path) => { navigate(path); setOpen(false); };

  return (
    <>
      <style>{`@keyframes avDrop{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Avatar button */}
      <div
        ref={btnRef}
        onClick={toggle}
        style={{
          width:34, height:34, borderRadius:"50%",
          cursor:"pointer", background:C.grad,
          overflow:"hidden", flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
        }}
      >
        <img src={AVATAR_URL} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropRef}
          style={{
            position:"fixed", top:pos.top, right:pos.right,
            width:280, maxWidth:"calc(100vw - 16px)",
            background:C.card, border:`1px solid ${C.borderHi}`,
            borderRadius:14, boxShadow:"0 20px 60px rgba(0,0,0,.65)",
            zIndex:10002, fontFamily:"'Outfit',sans-serif",
            animation:"avDrop .18s cubic-bezier(.16,1,.3,1) both",
            overflow:"hidden",
          }}
        >
          {/* Section 1 — Identity */}
          <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:C.grad,overflow:"hidden",flexShrink:0}}>
              <img src={AVATAR_URL} alt="avatar" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}/>
            </div>
            <div style={{minWidth:0}}>
              <div style={{fontSize:14,fontWeight:700,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Ecom Elevate</div>
              <div style={{fontSize:11.5,color:C.muted,marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>owner@yourstore.com</div>
              <span style={{fontSize:10.5,fontWeight:700,color:C.coral,background:`${C.coral}1A`,padding:"2px 8px",borderRadius:100,letterSpacing:".04em"}}>Owner</span>
            </div>
          </div>

          {/* Section 2 — Quick Nav */}
          <div style={{padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <MenuItem icon={<Settings size={15}/>} label="Account Settings" onClick={() => go("/dashboard/settings/general")}/>
            <MenuItem icon={<CreditCard size={15}/>} label="Billing & Plan" onClick={() => go("/dashboard/settings/billing")}/>
            <MenuItem icon={<UserPlus size={15}/>} label="Invite Team Member" onClick={() => go("/dashboard/settings/team")}/>
          </div>

          {/* Section 3 — Store Info */}
          <div style={{padding:"9px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
            <Store size={15} color={C.muted}/>
            <span style={{fontSize:13,color:C.sub,flex:1}}>Placeholder Store</span>
            <div style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:7,height:7,borderRadius:"50%",background:C.teal}}/>
              <span style={{fontSize:11.5,fontWeight:700,color:C.teal}}>Live</span>
            </div>
          </div>

          {/* Section 4 — Help & Support */}
          <div style={{padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
            <MenuItem icon={<HelpCircle size={15}/>} label="Help Center" onClick={()=>{}}/>
            <MenuItem icon={<MessageCircle size={15}/>} label="Contact Support" onClick={()=>{}}/>
            <MenuItem icon={<Sparkles size={15}/>} label="What's New" onClick={()=>{}}/>
          </div>

          {/* Section 5 — Session */}
          <div style={{padding:"6px 0"}}>
            {!logoutConfirm
              ? <MenuItem icon={<LogOut size={15}/>} label="Log Out" danger onClick={() => setLogoutConfirm(true)}/>
              : (
                <div style={{padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
                  <span style={{fontSize:12.5,color:C.muted,flex:1}}>Are you sure?</span>
                  <button style={{fontSize:12,fontWeight:700,color:"#fff",background:C.red,border:"none",borderRadius:7,padding:"5px 12px",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Yes</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLogoutConfirm(false); }}
                    style={{fontSize:12,color:C.sub,background:"transparent",border:`1px solid ${C.borderHi}`,borderRadius:7,padding:"5px 10px",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}
                  >Cancel</button>
                </div>
              )
            }
          </div>
        </div>
      )}
    </>
  );
}
