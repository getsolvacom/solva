import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { C } from "../../tokens";
import { useStore } from "../../hooks/useStore";
import { LayoutDashboard, BarChart3, Ticket, ShoppingCart, RotateCcw, Settings, LogOut, Store, Users, ChevronDown, PanelLeftClose, PanelLeftOpen, SlidersHorizontal, Bot, Zap, GitBranch, Bell, CreditCard, Sun, MessageSquare, AlertTriangle, Globe } from "lucide-react";

function SolvaLogo({ collapsed = false }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:15,userSelect:"none",justifyContent:collapsed?"center":"flex-start"}}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" style={{flexShrink:0}}>
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
      {!collapsed && <span style={{color:C.text}}>SOLVA<span style={{color:C.coral,fontWeight:300}}>.AI</span></span>}
    </div>
  );
}

const SETTINGS_SUB = [
  {key:"settings/general",       label:"General",       icon:<Globe size={13} strokeWidth={2}/>},
  {key:"settings/ai",            label:"AI Config",     icon:<Bot size={13} strokeWidth={2}/>},
  {key:"settings/automations",   label:"Automations",   icon:<Zap size={13} strokeWidth={2}/>},
  {key:"settings/workflows",     label:"Workflows",     icon:<GitBranch size={13} strokeWidth={2}/>},
  {key:"settings/notifications", label:"Notifications", icon:<Bell size={13} strokeWidth={2}/>},
  {key:"settings/team",          label:"Team",          icon:<Users size={13} strokeWidth={2}/>},
  {key:"settings/billing",       label:"Billing",       icon:<CreditCard size={13} strokeWidth={2}/>},
  {key:"settings/appearance",    label:"Appearance",    icon:<Sun size={13} strokeWidth={2}/>},
  {key:"settings/widget",        label:"Widget",        icon:<MessageSquare size={13} strokeWidth={2}/>},
  {key:"settings/danger",        label:"Danger Zone",   icon:<AlertTriangle size={13} strokeWidth={2}/>},
];

export default function AppSidebar() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { store }  = useStore();
  const [collapsed,       setCollapsed]       = useState(false);
  const [settingsOpen,    setSettingsOpen]    = useState(location.pathname.includes("/settings"));

  const isSettings = location.pathname.includes("/settings");
  const currentPath = location.pathname.replace("/dashboard/", "");

  const setView = (key) => navigate(`/dashboard/${key}`);
  const goLanding = () => navigate("/");

  const isActive = (key) => {
    if (key === "settings") return isSettings;
    return currentPath === key || currentPath.startsWith(key + "/");
  };

  const items = [
    {key:"overview",  label:"Overview",      icon:<LayoutDashboard size={18} strokeWidth={2}/>},
    {key:"tickets",   label:"AI Tickets",    icon:<Ticket size={18} strokeWidth={2}/>,        badge:"12"},
    {key:"cart",      label:"Cart Recovery", icon:<ShoppingCart size={18} strokeWidth={2}/>,  badge:"24"},
    {key:"returns",   label:"Returns",       icon:<RotateCcw size={18} strokeWidth={2}/>,     badge:"8"},
    {key:"customers", label:"Customers",     icon:<Users size={18} strokeWidth={2}/>},
    {key:"analytics", label:"Analytics",     icon:<BarChart3 size={18} strokeWidth={2}/>},
    {key:"settings",  label:"Settings",      icon:<Settings size={18} strokeWidth={2}/>, hasDropdown:true},
  ];

  const sidebarWidth = collapsed ? 62 : 212;

  return (
    <>
      <style>{`
        .sb-item{display:flex;align-items:center;padding:9px 12px;border-radius:9px;cursor:pointer;transition:all .14s;gap:10px;}
        .sb-item:hover{background:rgba(229,82,102,.07);}
        .sb-sub-item{display:flex;align-items:center;padding:7px 12px 7px 20px;border-radius:8px;cursor:pointer;transition:all .14s;font-size:12.5px;}
        .sb-sub-item:hover{background:rgba(229,82,102,.07);color:#E55266;}
        .sb-collapse-btn{cursor:pointer;transition:all .18s;border-radius:8px;display:flex;align-items:center;justify-content:center;}
        .sb-collapse-btn:hover{background:rgba(229,82,102,.09);}
        .sb-settings-sub{overflow:hidden;transition:max-height .32s cubic-bezier(.16,1,.3,1),opacity .22s ease;}
        .sb-tooltip{position:absolute;left:calc(100% + 10px);top:50%;transform:translateY(-50%);background:var(--card);border:1px solid var(--border-hi);borderRadius:8px;padding:5px 10px;font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;pointer-events:none;box-shadow:0 4px 16px rgba(0,0,0,.4);z-index:9999;font-family:'Outfit',sans-serif;}
        @media(max-width:767px){
          .sb-desktop-only{display:none!important;}
          .sb-sidebar{width:212px!important;}
        }
      `}</style>

      <aside
        className="sb-sidebar"
        style={{
          width:sidebarWidth,
          flexShrink:0,
          background:C.surface,
          borderRight:`1px solid ${C.border}`,
          display:"flex",
          flexDirection:"column",
          padding:"22px 0",
          transition:"width .28s cubic-bezier(.16,1,.3,1)",
          overflow:"hidden",
          position:"relative",
        }}
      >
        {/* Logo + collapse toggle row */}
        <div style={{padding:`0 ${collapsed?10:18}px 24px`,display:"flex",alignItems:"center",justifyContent:collapsed?"center":"space-between"}}>
          <SolvaLogo collapsed={collapsed}/>
          <button
            className="sb-collapse-btn sb-desktop-only"
            onClick={() => setCollapsed(v => !v)}
            style={{
              width:26,height:26,border:`1px solid ${C.border}`,
              background:C.card,color:C.muted,
              flexShrink:0,
              display:collapsed?"none":"flex",
            }}
          >
            <PanelLeftClose size={14} strokeWidth={2}/>
          </button>
        </div>

        {/* Collapsed expand button */}
        {collapsed && (
          <button
            className="sb-collapse-btn sb-desktop-only"
            onClick={() => setCollapsed(false)}
            style={{
              width:36,height:36,margin:"0 auto 18px",
              border:`1px solid ${C.border}`,
              background:C.card,color:C.muted,
            }}
          >
            <PanelLeftOpen size={14} strokeWidth={2}/>
          </button>
        )}

        {/* Store card — hidden when collapsed */}
        {!collapsed && (
          <div style={{margin:"0 10px 22px",padding:"10px 12px",borderRadius:12,background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:9}}>
            <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Store size={18} strokeWidth={2}/></div>
            <div style={{minWidth:0,flex:1}}>
              <div style={{fontSize:12.5,fontWeight:600,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{store?.shop_name || store?.shop_domain || 'Your Store'}</div>
              <div style={{fontSize:10.5,color:C.muted}}>{store?.shop_domain || 'yourstore.myshopify.com'}</div>
            </div>
            <div style={{width:6,height:6,borderRadius:"50%",background:C.coral,marginLeft:"auto",flexShrink:0}}/>
          </div>
        )}

        {/* Collapsed store dot indicator */}
        {collapsed && (
          <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
            <div style={{width:36,height:36,borderRadius:10,background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
              <Store size={18} strokeWidth={2}/>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{flex:1,padding:"0 8px",display:"flex",flexDirection:"column",gap:2,overflowY:"auto",overflowX:"hidden"}}>
          {items.map(({key, label, icon, badge, hasDropdown}) => {
            const active = isActive(key);
            const isSettingsItem = key === "settings";

            if (isSettingsItem) {
              return (
                <div key={key}>
                  {/* Settings main row */}
                  <div
                    className="sb-item"
                    style={{
                      background: active ? "rgba(229,82,102,.09)" : "transparent",
                      color: active ? C.coral : C.sub,
                      fontWeight: active ? 600 : 400,
                      fontSize: 13.5,
                      justifyContent: collapsed ? "center" : "flex-start",
                      position:"relative",
                    }}
                    onClick={() => {
                      if (collapsed) {
                        setCollapsed(false);
                        setSettingsOpen(true);
                        setView("settings");
                      } else {
                        setSettingsOpen(v => !v);
                        setView("settings");
                      }
                    }}
                  >
                    <span style={{flexShrink:0,display:"inline-flex"}}>{icon}</span>
                    {!collapsed && (
                      <>
                        <span style={{flex:1}}>{label}</span>
                        <ChevronDown
                          size={14} strokeWidth={2}
                          style={{
                            color: C.muted,
                            transition:"transform .25s ease",
                            transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)",
                            flexShrink:0,
                          }}
                        />
                      </>
                    )}
                    {collapsed && (
                      <div className="sb-tooltip">{label}</div>
                    )}
                  </div>

                  {/* Settings sub-items accordion */}
                  {!collapsed && (
                    <div
                      className="sb-settings-sub"
                      style={{
                        maxHeight: settingsOpen ? "500px" : "0px",
                        opacity: settingsOpen ? 1 : 0,
                      }}
                    >
                      {SETTINGS_SUB.map(sub => {
                        const subActive = currentPath === sub.key || currentPath.startsWith(sub.key);
                        return (
                          <div
                            key={sub.key}
                            className="sb-sub-item"
                            onClick={() => setView(sub.key)}
                            style={{
                              color: subActive ? C.coral : C.muted,
                              fontWeight: subActive ? 600 : 400,
                              background: subActive ? "rgba(229,82,102,.07)" : "transparent",
                            }}
                          >
                            <span style={{display:"inline-flex",alignItems:"center",marginRight:7,color:subActive?C.coral:C.muted,flexShrink:0}}>{sub.icon}</span>
                            {sub.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={key}
                className="sb-item"
                onClick={() => setView(key)}
                style={{
                  background: active ? "rgba(229,82,102,.09)" : "transparent",
                  color: active ? C.coral : C.sub,
                  fontWeight: active ? 600 : 400,
                  fontSize: 13.5,
                  justifyContent: collapsed ? "center" : "flex-start",
                  position:"relative",
                }}
              >
                <span style={{flexShrink:0,display:"inline-flex"}}>{icon}</span>
                {!collapsed && <span style={{flex:1}}>{label}</span>}
                {!collapsed && badge && (
                  <span style={{marginLeft:"auto",fontSize:10.5,fontWeight:700,background:active?C.coral:C.dim,color:active?"#fff":C.muted,padding:"1px 7px",borderRadius:100,flexShrink:0}}>
                    {badge}
                  </span>
                )}
                {collapsed && badge && (
                  <span style={{position:"absolute",top:4,right:4,width:16,height:16,borderRadius:"50%",background:C.coral,color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {badge}
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Back to Landing */}
        <div style={{padding:"14px 8px 0",borderTop:`1px solid ${C.border}`,marginTop:6}}>
          <div
            className="sb-item"
            onClick={goLanding}
            style={{
              color:C.muted,
              fontSize:13,
              justifyContent: collapsed ? "center" : "flex-start",
              position:"relative",
            }}
          >
            <LogOut size={18} strokeWidth={2} style={{flexShrink:0}}/>
            {!collapsed && <span>Back to Landing</span>}
          </div>
        </div>
      </aside>
    </>
  );
}
