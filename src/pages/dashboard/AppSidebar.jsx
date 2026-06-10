import { useNavigate, useParams } from "react-router-dom";
import { C } from "../../tokens";
import { BarChart3, Ticket, ShoppingCart, RotateCcw, TrendingUp, Settings, LogOut } from "lucide-react";

function SolvaLogo({ size=15 }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:size,userSelect:"none"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E55266"/>
            <stop offset="50%" stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lg)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

export default function AppSidebar() {
  const navigate            = useNavigate();
  const { view: viewParam } = useParams();
  const view                = viewParam || "overview";
  const setView             = (key) => navigate(`/dashboard/${key}`);
  const goLanding           = () => navigate("/");
  const items = [
    {key:"overview",  label:"Overview",      icon:<BarChart3 size={18} strokeWidth={2}/>},
    {key:"tickets",   label:"AI Tickets",    icon:<Ticket size={18} strokeWidth={2}/>,        badge:"12"},
    {key:"cart",      label:"Cart Recovery", icon:<ShoppingCart size={18} strokeWidth={2}/>,  badge:"24"},
    {key:"returns",   label:"Returns",       icon:<RotateCcw size={18} strokeWidth={2}/>,     badge:"8"},
    {key:"analytics", label:"Analytics",     icon:<TrendingUp size={18} strokeWidth={2}/>},
    {key:"settings",  label:"Settings",      icon:<Settings size={18} strokeWidth={2}/>},
  ];
  return (
    <aside style={{width:212,flexShrink:0,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",padding:"22px 0"}}>
      <div style={{padding:"0 18px 24px"}}><SolvaLogo/></div>
      <div style={{margin:"0 10px 22px",padding:"10px 12px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
        <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🏪</div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:12.5,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>Placeholder Store</div>
          <div style={{fontSize:10.5,color:C.muted}}>yourstore.myshopify.com</div>
        </div>
        <div style={{width:6,height:6,borderRadius:"50%",background:C.coral,marginLeft:"auto",flexShrink:0}}/>
      </div>
      <nav style={{flex:1,padding:"0 8px",display:"flex",flexDirection:"column",gap:2}}>
        {items.map(({key,label,icon,badge})=>(
          <div key={key} onClick={()=>setView(key)}
            style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,cursor:"pointer",background:view===key?"rgba(229,82,102,.09)":"transparent",color:view===key?C.coral:C.sub,fontSize:13.5,fontWeight:view===key?600:400,transition:"all .14s"}}>
            {icon}{label}
            {badge&&<span style={{marginLeft:"auto",fontSize:10.5,fontWeight:700,background:view===key?C.coral:C.dim,color:view===key?"#fff":C.muted,padding:"1px 7px",borderRadius:100}}>{badge}</span>}
          </div>
        ))}
      </nav>
      <div style={{padding:"14px 8px 0",borderTop:`1px solid ${C.border}`,marginTop:6}}>
        <div onClick={goLanding} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",borderRadius:9,cursor:"pointer",color:C.muted,fontSize:13,transition:"all .14s"}}>
          <LogOut size={18} strokeWidth={2}/> Back to Landing
        </div>
      </div>
    </aside>
  );
}