import { useState } from "react";
import { C } from "../../tokens";
import AppSidebar       from "./AppSidebar";
import OverviewView     from "./OverviewView";
import TicketsView      from "./TicketsView";
import CartRecoveryView from "./CartRecoveryView";
import ReturnsView      from "./ReturnsView";
import AnalyticsView    from "./AnalyticsView";
import SettingsView     from "./SettingsView";

const NAV_ITEMS = [
  {key:"overview",  label:"Overview",      icon:"◈"},
  {key:"tickets",   label:"AI Tickets",    icon:"✉",  badge:"12"},
  {key:"cart",      label:"Cart Recovery", icon:"🛒", badge:"24"},
  {key:"returns",   label:"Returns",       icon:"↩",  badge:"8"},
  {key:"analytics", label:"Analytics",     icon:"↗"},
  {key:"settings",  label:"Settings",      icon:"⚙"},
];

function DrawerLogo() {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:15,userSelect:"none"}}>
      <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
        <defs>
          <linearGradient id="lgDash" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#E55266"/>
            <stop offset="50%"  stopColor="#992A67"/>
            <stop offset="100%" stopColor="#4E0269"/>
          </linearGradient>
        </defs>
        <rect x="5" y="5" width="18" height="18" rx="4" transform="rotate(45 14 14)" fill="url(#lgDash)"/>
        <path d="M10 14.2l3 3 5-5.4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>
    </div>
  );
}

export default function DashboardShell({ view, setView, goLanding }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = (key) => { setView(key); setDrawerOpen(false); };

  return (
    <div style={{display:"flex",height:"100vh",background:C.bg,overflow:"hidden",overflowX:"hidden"}}>
      <style>{`
        @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        .mob-header{display:none;height:52px;align-items:center;justify-content:space-between;padding:0 16px;background:${C.surface};border-bottom:1px solid ${C.border};flex-shrink:0;}
        .mob-ham{cursor:pointer;background:transparent;border:1px solid ${C.border};border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:17px;color:${C.text};font-family:'Outfit',sans-serif;transition:border-color .14s,color .14s;}
        .mob-ham:hover{border-color:${C.coral};color:${C.coral};}
        .mob-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;opacity:0;pointer-events:none;transition:opacity .28s ease;}
        .mob-overlay.visible{opacity:1;pointer-events:all;}
        .mob-drawer{position:fixed;top:0;left:0;height:100vh;width:230px;background:${C.surface};border-right:1px solid ${C.border};z-index:300;transform:translateX(-100%);transition:transform .28s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;padding:20px 0;}
        .mob-drawer.open{transform:translateX(0);}
        .mob-nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;margin:0 8px;border-radius:9px;cursor:pointer;font-size:13.5px;font-family:'Outfit',sans-serif;font-weight:400;color:${C.sub};transition:all .14s;}
        .mob-nav-item.active{background:rgba(229,82,102,.09);color:${C.coral};font-weight:600;}
        .mob-nav-item:hover:not(.active){background:rgba(229,82,102,.05);color:${C.text};}
        @media(max-width:767px){
          .dash-sidebar{display:none!important;}
          .mob-header{display:flex!important;}
        }
      `}</style>

      {/* Desktop sidebar */}
      <div className="dash-sidebar">
        <AppSidebar view={view} setView={setView} goLanding={goLanding}/>
      </div>

      {/* Mobile overlay */}
      <div className={`mob-overlay${drawerOpen?" visible":""}`} onClick={()=>setDrawerOpen(false)}/>

      {/* Mobile drawer */}
      <div className={`mob-drawer${drawerOpen?" open":""}`}>
        <div style={{padding:"0 18px 20px"}}><DrawerLogo/></div>
        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {NAV_ITEMS.map(({key,label,icon,badge})=>(
            <div key={key} className={`mob-nav-item${view===key?" active":""}`} onClick={()=>navigate(key)}>
              <span style={{fontSize:14,flexShrink:0}}>{icon}</span>
              {label}
              {badge&&<span style={{marginLeft:"auto",fontSize:10.5,fontWeight:700,background:view===key?C.coral:C.dim,color:view===key?"#fff":C.muted,padding:"1px 7px",borderRadius:100}}>{badge}</span>}
            </div>
          ))}
        </nav>
        <div style={{padding:"12px 8px 0",borderTop:`1px solid ${C.border}`}}>
          <div onClick={()=>{goLanding();setDrawerOpen(false);}} className="mob-nav-item">
            <span>←</span> Back to Landing
          </div>
        </div>
      </div>

      {/* Main content column */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
        {/* Mobile header */}
        <div className="mob-header">
          <DrawerLogo/>
          <button className="mob-ham" onClick={()=>setDrawerOpen(true)}>☰</button>
        </div>

        {view === "overview"  && <OverviewView setView={setView}/>}
        {view === "tickets"   && <TicketsView/>}
        {view === "cart"      && <CartRecoveryView/>}
        {view === "returns"   && <ReturnsView/>}
        {view === "analytics" && <AnalyticsView/>}
        {view === "settings"  && <SettingsView/>}
      </div>
    </div>
  );
}
