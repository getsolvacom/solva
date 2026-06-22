import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { C } from "../../tokens";
import { LayoutDashboard, BarChart3, Ticket, ShoppingCart, RotateCcw, Settings, Menu, Users } from "lucide-react";
import AppSidebar       from "./AppSidebar";
import { useStore }     from "../../hooks/useStore";
import OverviewView     from "./OverviewView";
import TicketsView      from "./TicketsView";
import CartRecoveryView from "./CartRecoveryView";
import ReturnsView      from "./ReturnsView";
import AnalyticsView    from "./AnalyticsView";
import SettingsView     from "./SettingsView";
import CustomersView   from "./CustomersView";

const NAV_ITEMS = [
  {key:"overview",  label:"Overview",      icon:<LayoutDashboard size={18} strokeWidth={2}/>},
  {key:"tickets",   label:"AI Tickets",    icon:<Ticket size={18} strokeWidth={2}/>,        badge:"12"},
  {key:"cart",      label:"Cart Recovery", icon:<ShoppingCart size={18} strokeWidth={2}/>,  badge:"24"},
  {key:"returns",   label:"Returns",       icon:<RotateCcw size={18} strokeWidth={2}/>,     badge:"8"},
  {key:"customers", label:"Customers",     icon:<Users size={18} strokeWidth={2}/>},
  {key:"analytics", label:"Analytics",     icon:<BarChart3 size={18} strokeWidth={2}/>},
  {key:"settings",  label:"Settings",      icon:<Settings size={18} strokeWidth={2}/>},
];

function useOrientation() {
  const [state, setState] = useState(() => ({
    isLandscape: window.innerWidth > window.innerHeight,
    isMobile: Math.min(window.innerWidth, window.innerHeight) <= 500,
  }));
  useEffect(() => {
    function update() {
      setState({
        isLandscape: window.innerWidth > window.innerHeight,
        isMobile: Math.min(window.innerWidth, window.innerHeight) <= 500,
      });
    }
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);
  return state;
}

function DrawerLogo({ small }) {
  const sz = small ? 20 : 24;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:small?13:15,userSelect:"none"}}>
      <svg width={sz} height={sz} viewBox="0 0 28 28" fill="none">
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

const BRIGHTNESS_KEY   = "solva-brightness";
const BRIGHTNESS_EVENT = "solva-brightness-change";

export default function DashboardShell({ fixedView }) {
  const navigate             = useNavigate();
  const { view: viewParam }  = useParams();
  const view                 = fixedView || viewParam || "overview";
  const setView              = (key) => navigate(`/dashboard/${key}`);
  const goLanding            = () => navigate("/");
  const { store }            = useStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navTo                = (key) => { navigate(`/dashboard/${key}`); setDrawerOpen(false); };

  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem(BRIGHTNESS_KEY);
    return saved ? parseFloat(saved) : 1.0;
  });

  useEffect(() => {
    function onBrightnessChange(e) { setBrightness(e.detail); }
    window.addEventListener(BRIGHTNESS_EVENT, onBrightnessChange);
    return () => window.removeEventListener(BRIGHTNESS_EVENT, onBrightnessChange);
  }, []);

  useEffect(() => {
    function onOpenSidebar() { setDrawerOpen(true); }
    window.addEventListener("solva-open-sidebar", onOpenSidebar);
    return () => window.removeEventListener("solva-open-sidebar", onOpenSidebar);
  }, []);

  const { isLandscape, isMobile } = useOrientation();
  const headerHeight = isMobile ? (isLandscape ? 44 : 60) : 0;
  const brightnessFilter = brightness !== 1.0
    ? `brightness(${brightness}) contrast(${(1 - (brightness - 1) * 0.08).toFixed(3)})`
    : undefined;

  return (
    <div className={`dash-root${isMobile && isLandscape ? " ls-mob" : ""}`} style={{display:"flex",height:"100dvh",background:C.bg,overflow:"hidden",overflowX:"hidden",filter:brightnessFilter}}>
      <style>{`
        html, body { background: var(--bg) !important; margin: 0; padding: 0; }
        @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
        .mob-header{display:none;align-items:center;justify-content:space-between;padding:0 16px;background:${C.surface};border-bottom:1px solid ${C.border};flex-shrink:0;}
        .mob-ham{cursor:pointer;background:transparent;border:1px solid ${C.border};border-radius:8px;display:flex;align-items:center;justify-content:center;color:${C.text};font-family:'Outfit',sans-serif;transition:border-color .14s,color .14s;}
        .mob-ham:hover{border-color:${C.coral};color:${C.coral};}
        .mob-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:9998;opacity:0;pointer-events:none;transition:opacity .28s ease;}
        .mob-overlay.visible{opacity:1;pointer-events:all;}
        .mob-drawer{position:fixed;top:0;left:0;height:100dvh;width:230px;background:${C.surface};border-right:1px solid ${C.border};z-index:10000;transform:translateX(-100%);transition:transform .28s cubic-bezier(.16,1,.3,1);display:flex;flex-direction:column;padding:20px 0;}
        .mob-drawer.open{transform:translateX(0);}
        .mob-nav-item{display:flex;align-items:center;gap:10px;padding:9px 12px;margin:0 8px;border-radius:9px;cursor:pointer;font-size:13.5px;font-family:'Outfit',sans-serif;font-weight:400;color:${C.sub};transition:all .14s;}
        .mob-nav-item.active{background:rgba(229,82,102,.09);color:${C.coral};font-weight:600;}
        .mob-nav-item:hover:not(.active){background:rgba(229,82,102,.05);color:${C.text};}
        @media(max-width:767px){
          .dash-sidebar{display:none!important;}
          .dash-root{height:auto!important;min-height:100dvh!important;overflow:visible!important;overflow-x:hidden!important;}
          .mob-header{box-sizing:border-box!important;max-width:100vw!important;}
          .mob-ham{flex-shrink:0!important;}
          .dash-main-col{overflow:visible!important;height:auto!important;padding-top:var(--mob-h,60px)!important;}
          .mob-header{display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;height:var(--mob-h,60px)!important;z-index:9999!important;background:${C.surface}!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;border-bottom:1px solid ${C.border}!important;}
        }
        .ls-mob .dash-sidebar{display:none!important;}
        .ls-mob .mob-header{display:flex!important;position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;height:var(--mob-h,44px)!important;z-index:9999!important;background:${C.surface}!important;backdrop-filter:blur(12px)!important;-webkit-backdrop-filter:blur(12px)!important;border-bottom:1px solid ${C.border}!important;}
        .ls-mob .mob-drawer{width:200px!important;}
        .ls-mob .mob-nav-item{padding:7px 10px!important;font-size:12.5px!important;}
        .ls-mob.dash-root{height:100dvh!important;overflow:hidden!important;}
        .ls-mob .dash-main-col{overflow:hidden!important;height:100dvh!important;padding-top:var(--mob-h,44px)!important;}
      `}</style>

      {/* Desktop sidebar */}
      <div className="dash-sidebar">
        <AppSidebar store={store} />
      </div>

      {/* Mobile overlay */}
      <div className={`mob-overlay${drawerOpen?" visible":""}`} onClick={()=>setDrawerOpen(false)}/>

      {/* Mobile drawer */}
      <div className={`mob-drawer${drawerOpen?" open":""}`}>
        <div style={{padding:"0 18px 20px"}}><DrawerLogo/></div>
        <nav style={{flex:1,display:"flex",flexDirection:"column",gap:2,overflowY:"auto"}}>
          {NAV_ITEMS.map(({key,label,icon,badge})=>(
            <div key={key} className={`mob-nav-item${view===key?" active":""}`} onClick={()=>navTo(key)}>
              <span style={{fontSize:14,flexShrink:0}}>{icon}</span>
              {label}
              {badge&&<span style={{marginLeft:"auto",fontSize:10.5,fontWeight:700,background:view===key?C.coral:C.dim,color:view===key?"#fff":C.muted,padding:"1px 7px",borderRadius:100}}>{badge}</span>}
            </div>
          ))}
        </nav>
        <div style={{padding:"12px 8px 32px",borderTop:`1px solid ${C.border}`}}>
          <div onClick={()=>{goLanding();setDrawerOpen(false);}} className="mob-nav-item">
            <span>←</span> Back to Landing
          </div>
        </div>
      </div>

      {/* Main content column */}
      <div className="dash-main-col" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0,"--mob-h":`${headerHeight}px`}}>
        {/* Mobile header */}
        <div className="mob-header" style={{padding:isMobile&&isLandscape?"0 12px":undefined}}>
          <DrawerLogo small={isMobile&&isLandscape}/>
          <button
            className="mob-ham"
            onClick={()=>setDrawerOpen(true)}
            style={isMobile&&isLandscape?{width:32,height:32,fontSize:15}:{width:36,height:36,fontSize:17}}
          ><Menu size={22} strokeWidth={2}/></button>
        </div>

        {view === "overview"  && <OverviewView setView={setView} isLandscape={isLandscape} isMobile={isMobile}/>}
        {view === "tickets"   && <TicketsView isLandscape={isLandscape} isMobile={isMobile}/>}
        {view === "cart"      && <CartRecoveryView isLandscape={isLandscape} isMobile={isMobile}/>}
        {view === "returns"   && <ReturnsView isLandscape={isLandscape} isMobile={isMobile}/>}
        {view === "customers" && <CustomersView isLandscape={isLandscape} isMobile={isMobile}/>}
        {view === "analytics" && <AnalyticsView isLandscape={isLandscape} isMobile={isMobile}/>}
        {view === "settings"  && <SettingsView isLandscape={isLandscape} isMobile={isMobile}/>}
      </div>
    </div>
  );
}
