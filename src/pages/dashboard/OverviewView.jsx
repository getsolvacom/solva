import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { C } from "../../tokens";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { DollarSign, Inbox, RotateCcw, Clock, TrendingUp, Bot, BarChart3, Zap, UserPlus, CheckCircle2, ShoppingCart } from "lucide-react";
import AvatarMenu from "./AvatarMenu";
import { useDashboardStats } from '../../hooks/useDashboardStats';
import { DemoContext } from "../../context/DemoContext";

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-thumb{background:#3D0050;border-radius:2px;}
      @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
      @keyframes flowGrad{0%,100%{background-position:0% 50%;}50%{background-position:100% 50%;}}
      @keyframes blink{0%,100%{opacity:1;}50%{opacity:.15;}}
      .fu{animation:fadeUp .55s cubic-bezier(.16,1,.3,1) both;}
      .fu1{animation-delay:.06s;}.fu2{animation-delay:.12s;}.fu3{animation-delay:.18s;}.fu4{animation-delay:.24s;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .kpi-card{transition:transform .2s,box-shadow .2s;cursor:default;}
      .kpi-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5);}
      .card-hover{transition:transform .22s ease,box-shadow .22s ease;}
      .card-hover:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5);}
      .blink{animation:blink 2.4s ease infinite;}
      .filter-tab{cursor:pointer;transition:all .15s ease;font-family:'Outfit',sans-serif;}
      .action-card{transition:all .18s ease!important;border-color:#3D0050!important;}
      .action-card:hover{border-color:#E55266!important;background:rgba(229,82,102,.07)!important;transform:translateY(-2px)!important;box-shadow:0 8px 24px rgba(0,0,0,.45)!important;}
      @media(max-width:767px){
        .ov-view{overflow:visible!important;flex:none!important;min-height:0;}
        .ov-topbar{flex-direction:column!important;align-items:flex-start!important;height:auto!important;padding:12px 14px!important;gap:10px!important;}
        .ov-content{overflow:visible!important;flex:none!important;padding:12px 12px!important;gap:12px!important;}
        .kpi-row{display:flex!important;overflow-x:auto!important;overflow-y:visible!important;-webkit-overflow-scrolling:touch;gap:10px!important;padding-bottom:6px!important;width:100%!important;}
        .kpi-row .kpi-card{min-width:200px!important;flex-shrink:0!important;animation:none!important;opacity:1!important;}
        .chart-activity-grid{grid-template-columns:1fr!important;}
        .chart-header{flex-direction:column!important;align-items:flex-start!important;gap:10px!important;margin-bottom:14px!important;}
        .actions-grid{grid-template-columns:repeat(2,1fr)!important;}
      }
      .ls-mob .ov-view{overflow-y:auto!important;flex:1!important;min-height:0!important;}
      .ls-mob .ov-topbar{padding:6px 12px!important;gap:6px!important;}
      .ls-mob .ov-topbar h1{font-size:14px!important;}
      .ls-mob .ov-topbar p{font-size:10.5px!important;}
      .ls-mob .ov-content{padding:8px 10px!important;gap:8px!important;overflow-y:auto!important;}
      .ls-mob .kpi-row{display:grid!important;grid-template-columns:1fr 1fr!important;overflow-x:visible!important;padding-bottom:0!important;}
      .ls-mob .kpi-row .kpi-card{min-width:0!important;flex-shrink:unset!important;padding:10px 12px!important;}
      .ls-mob .chart-activity-grid{grid-template-columns:1fr 1fr!important;}
      @keyframes skeletonShimmer{0%{background-position:200% 0;}100%{background-position:-200% 0;}}
    `}</style>
  );
}

function SkeletonBlock({ width = "100%", height = 16, radius = 8, style = {} }) {
  return (
    <div style={{
      width, height,
      borderRadius: radius,
      background: `linear-gradient(90deg, var(--dim) 25%, var(--border) 50%, var(--dim) 75%)`,
      backgroundSize: "200% 100%",
      animation: "skeletonShimmer 1.4s ease infinite",
      flexShrink: 0,
      ...style,
    }}/>
  );
}

export default function OverviewView({ setView, isLandscape, isMobile }) {
  const navigate = useNavigate();
  const { isDemoMode } = useContext(DemoContext);
  const basePath = isDemoMode ? "/demo" : "/dashboard";
  const [activeChart, setActiveChart] = useState("revenue");
  const [hoveredRow, setHoveredRow] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);
  const { stats, loading } = useDashboardStats();

  const weekData = stats?.weekData || [
    { day:"Mon", tickets:0, revenue:0 },
    { day:"Tue", tickets:0, revenue:0 },
    { day:"Wed", tickets:0, revenue:0 },
    { day:"Thu", tickets:0, revenue:0 },
    { day:"Fri", tickets:0, revenue:0 },
    { day:"Sat", tickets:0, revenue:0 },
    { day:"Sun", tickets:0, revenue:0 },
  ];

  const liveActivity = stats?.recentActivity || [];

  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 6);
  const dateRange = `${weekAgo.toLocaleDateString('en-US', { month:'short', day:'numeric' })} – ${today.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' })}`;

  const hasRealData = stats && (stats.totalTickets > 0 || stats.totalCarts > 0 || stats.totalReturns > 0);
  const kpis = [
    { label:"Tickets Resolved",  value: stats ? stats.ticketsResolved.toLocaleString() : "—", change: hasRealData ? "+18%" : "—", color:C.teal,    bar:68, icon:<Inbox size={18} strokeWidth={2}/> },
    { label:"Revenue Recovered", value: stats ? `$${stats.revenueRecovered.toFixed(2)}` : "—", change: hasRealData ? "+24%" : "—", color:C.coral,   bar:74, icon:<DollarSign size={18} strokeWidth={2}/> },
    { label:"Returns Deflected", value: stats ? stats.returnsDeflected.toString() : "—", change: hasRealData ? "+12%" : "—", color:C.amber,   bar:52, icon:<RotateCcw size={18} strokeWidth={2}/> },
    { label:"Hours Saved",       value: stats ? `${(stats.ticketsResolved * 0.5).toFixed(1)}h` : "—", change: hasRealData ? "+31%" : "—", color:C.magenta, bar:80, icon:<Clock size={18} strokeWidth={2}/> },
  ];

  return (
    <div className="ov-view" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div className="ov-topbar" style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Overview</h1>
          <p style={{fontSize:11.5,color:C.muted}}>{dateRange}</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:8,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.22)"}}>
            <div className="blink" style={{width:6,height:6,borderRadius:"50%",background:C.coral}}/>
            <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".04em"}}>SOLVA LIVE</span>
          </div>
          <AvatarMenu />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="ov-content" style={{flex:1,overflowY:"auto",padding:"22px 24px",display:"flex",flexDirection:"column",gap:16,background:C.bg}}>

        {/* Setup checklist */}
        {!loading && stats && stats.totalTickets === 0 && stats.totalCarts === 0 && stats.totalReturns === 0 && (
          <div style={{padding:20,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div style={{fontSize:15,fontWeight:700,color:C.text}}>Get set up</div>
              <div style={{fontSize:12,color:C.muted,fontWeight:600}}>{completedSteps.length} / 3 completed</div>
            </div>
            <div style={{width:"100%",height:4,borderRadius:3,background:C.dim,marginBottom:16}}>
              <div style={{width:`${(completedSteps.length/3)*100}%`,height:"100%",background:C.grad,borderRadius:3,transition:"width .4s ease"}}/>
            </div>
            {[
              {title:"Connect your Shopify store",subtitle:"Link your store to start receiving automations",badge:"2 min",badgeBg:"rgba(62,207,178,.12)",badgeColor:C.teal,path:"/dashboard/settings/general"},
              {title:"Configure your AI tone",subtitle:"Set how SOLVA communicates with your customers",badge:"1 min",badgeBg:"rgba(229,82,102,.12)",badgeColor:C.coral,path:"/dashboard/settings/ai"},
              {title:"Enable automations",subtitle:"Turn on ticket resolution, cart recovery, and returns",badge:"1 min",badgeBg:"rgba(240,160,75,.12)",badgeColor:C.amber,path:"/dashboard/settings/automations"},
            ].map((item,i)=>{
              const completed = completedSteps.includes(i);
              return (
                <div key={i} onClick={()=>navigate(item.path)} onMouseEnter={()=>setHoveredRow(i)} onMouseLeave={()=>setHoveredRow(null)}
                  style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<2?`1px solid ${C.dim}`:"none",cursor:"pointer"}}>
                  <div
                    onClick={e=>{e.stopPropagation();setCompletedSteps(prev=>prev.includes(i)?prev.filter(x=>x!==i):[...prev,i]);}}
                    style={completed
                      ?{width:22,height:22,borderRadius:"50%",background:C.teal,border:`1.5px solid ${C.teal}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,marginRight:4}
                      :{width:22,height:22,borderRadius:"50%",border:`1.5px solid ${C.border}`,cursor:"pointer",flexShrink:0,marginRight:4,background:"transparent"}}>
                    {completed && <CheckCircle2 size={13} strokeWidth={2.5} style={{color:"#fff"}}/>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13.5,fontWeight:600,color:completed?C.muted:hoveredRow===i?C.coral:C.text,textDecoration:completed?"line-through":"none"}}>{item.title}</div>
                    <div style={{fontSize:12,color:C.muted}}>{item.subtitle}</div>
                  </div>
                  <span style={{fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:100,background:item.badgeBg,color:item.badgeColor,flexShrink:0}}>{item.badge}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* AI Automations card */}
        <div style={{padding:20,borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
          <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:4}}>Your AI Automations</div>
          <div style={{fontSize:12,color:C.muted,marginBottom:16}}>3 automations ready and waiting for your store</div>
          {[
            {icon:<Bot size={18} strokeWidth={2}/>,iconBg:"rgba(62,207,178,.12)",iconColor:C.teal,title:"AI Support Agent",sub:"Auto-resolves tickets, order inquiries & FAQs",badgeBg:"rgba(62,207,178,.12)",badgeColor:C.teal},
            {icon:<ShoppingCart size={18} strokeWidth={2}/>,iconBg:"rgba(91,173,255,.12)",iconColor:C.blue,title:"Cart Recovery",sub:"3-touch AI sequence to recover abandoned carts",badgeBg:"rgba(91,173,255,.12)",badgeColor:C.blue},
            {icon:<RotateCcw size={18} strokeWidth={2}/>,iconBg:"rgba(240,160,75,.12)",iconColor:C.amber,title:"Return Deflection",sub:"AI intercepts returns and offers smart alternatives",badgeBg:"rgba(240,160,75,.12)",badgeColor:C.amber},
          ].map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:i<2?`1px solid ${C.dim}`:"none"}}>
              <div style={{width:32,height:32,borderRadius:8,background:a.iconBg,display:"flex",alignItems:"center",justifyContent:"center",color:a.iconColor,flexShrink:0}}>{a.icon}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.title}</div>
                <div style={{fontSize:11.5,color:C.muted}}>{a.sub}</div>
              </div>
              <span style={{fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:100,background:a.badgeBg,color:a.badgeColor,flexShrink:0}}>Ready</span>
            </div>
          ))}
        </div>

        {/* KPI Cards */}
        <div className="kpi-row" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {loading ? (
            [0,1,2,3].map(i => (
              <div key={i} style={{padding:"18px 20px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,animationDelay:`${i*.06}s`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                  <SkeletonBlock width={120} height={12}/>
                  <SkeletonBlock width={40} height={12}/>
                </div>
                <SkeletonBlock width={80} height={28} style={{marginBottom:8}}/>
                <SkeletonBlock width={60} height={10} style={{marginBottom:14}}/>
                <SkeletonBlock width="100%" height={3} radius={2}/>
              </div>
            ))
          ) : kpis.map((k,i)=>(
            <div key={i} className="kpi-card fu" style={{padding:"18px 20px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,animationDelay:`${i*.06}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <span style={{color:k.color,display:"flex"}}>{k.icon}</span>
                  <span style={{fontSize:11.5,color:C.sub,fontWeight:500}}>{k.label}</span>
                </div>
                <span style={{display:"flex",alignItems:"center",gap:4,fontSize:10.5,padding:"2px 8px",borderRadius:100,background:"rgba(62,207,178,.12)",color:C.teal,fontWeight:700}}>
                  <TrendingUp size={14} strokeWidth={2}/>{k.change}
                </span>
              </div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:25,fontWeight:800,color:k.color,marginBottom:4}}>{k.value}</div>
              <div style={{fontSize:10.5,color:C.muted,marginBottom:12}}>this week</div>
              <div style={{height:3,borderRadius:2,background:C.dim}}>
                <div style={{height:"100%",borderRadius:2,background:k.color,width:`${k.bar}%`,opacity:.65}}/>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Activity */}
        <div className="chart-activity-grid" style={{display:"grid",gridTemplateColumns:"1fr 310px",gap:16}}>
          <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:22}}>
            {loading ? (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <SkeletonBlock width={160} height={14}/>
                    <SkeletonBlock width={220} height={11}/>
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    <SkeletonBlock width={64} height={28} radius={7}/>
                    <SkeletonBlock width={64} height={28} radius={7}/>
                  </div>
                </div>
                <SkeletonBlock width="100%" height={186} radius={10}/>
              </div>
            ) : (
              <>
                <div className="chart-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <div>
                    <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Weekly Performance</h3>
                    <p style={{fontSize:11.5,color:C.muted}}>Tickets resolved & revenue recovered</p>
                  </div>
                  <div style={{display:"flex",gap:7}}>
                    {["revenue","tickets"].map(t=>(
                      <button key={t} className="filter-tab btn-ghost" onClick={()=>setActiveChart(t)}
                        style={{padding:"4px 12px",borderRadius:7,border:`1px solid ${activeChart===t?C.coral:C.border}`,background:activeChart===t?"rgba(229,82,102,.10)":"transparent",color:activeChart===t?C.coral:C.muted,fontSize:11.5,fontWeight:activeChart===t?700:400,textTransform:"capitalize"}}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={186}>
                  <AreaChart data={weekData} margin={{top:0,right:0,bottom:0,left:-24}}>
                    <defs>
                      <linearGradient id="ovGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={activeChart==="revenue"?C.coral:C.blue} stopOpacity={.28}/>
                        <stop offset="95%" stopColor={activeChart==="revenue"?C.coral:C.blue} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.dim}/>
                    <XAxis dataKey="day" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.text}} cursor={{stroke:C.dim,strokeWidth:1}}/>
                    <Area type="monotone" dataKey={activeChart} stroke={activeChart==="revenue"?C.coral:C.blue} strokeWidth={2} fill="url(#ovGrad)"/>
                  </AreaChart>
                </ResponsiveContainer>
              </>
            )}
          </div>

          <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:20,display:"flex",flexDirection:"column"}}>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Live Activity</h3>
            <p style={{fontSize:11.5,color:C.muted,marginBottom:14}}>Real-time automation feed</p>
            <div style={{display:"flex",flexDirection:"column",gap:8,flex:1,overflowY:"auto"}}>
              {loading ? (
                [0,1,2,3,4].map(i => (
                  <div key={i} style={{display:"flex",gap:10,padding:"9px 7px",alignItems:"center"}}>
                    <SkeletonBlock width={28} height={28} radius={8} style={{flexShrink:0}}/>
                    <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                      <SkeletonBlock width="85%" height={11}/>
                      <SkeletonBlock width={80} height={10} radius={4}/>
                    </div>
                  </div>
                ))
              ) : liveActivity.length === 0 ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flex:1,padding:20}}>
                  <Bot size={28} style={{color:C.muted}}/>
                  <div style={{fontSize:13,fontWeight:600,color:C.muted,marginTop:10}}>No activity yet</div>
                  <div style={{fontSize:11.5,color:C.muted,marginTop:4,textAlign:"center"}}>Automations will appear here in real time</div>
                </div>
              ) : liveActivity.map((a,i)=>(
                <div key={i} style={{display:"flex",gap:10,padding:"9px 7px",borderRadius:8}}>
                  <div style={{width:28,height:28,borderRadius:8,flexShrink:0,background:`${a.color}12`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:a.color,fontWeight:700}}>{a.icon}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{fontSize:11.5,color:C.text,lineHeight:1.45,marginBottom:4}}>{a.label}</p>
                    <div style={{display:"flex",gap:7,alignItems:"center"}}>
                      <span style={{fontSize:10,padding:"2px 6px",borderRadius:4,background:`${a.color}10`,color:a.color,fontWeight:600}}>{a.tag}</span>
                      <span style={{fontSize:10,color:C.muted}}>{a.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:20}}>
          <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:16}}>Quick Actions</h3>
          <div className="actions-grid" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {label:"Configure AI Tone", icon:<Bot size={22} strokeWidth={2}/>,      color:C.coral,   path:`${basePath}/settings/ai`,  locked:true },
              {label:"View Full Reports", icon:<BarChart3 size={22} strokeWidth={2}/>, color:C.blue,    path:`${basePath}/analytics`,    locked:false },
              {label:"Test Automation",   icon:<Zap size={22} strokeWidth={2}/>,       color:C.magenta, path:`${basePath}/settings/automations`, locked:true },
              {label:"Add Team Member",   icon:<UserPlus size={22} strokeWidth={2}/>,  color:C.amber,   path:`${basePath}/settings/team`, locked:true },
            ].map((a,i)=>{
              const blocked = isDemoMode && a.locked;
              return (
              <button key={i} className="action-card" onClick={()=>{ if (!blocked) navigate(a.path); }} disabled={blocked}
                title={blocked ? "Sign up to try this" : undefined}
                style={{padding:"14px 10px",borderRadius:10,border:`1px solid ${C.borderHi}`,cursor:blocked?"not-allowed":"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8,background:"transparent",opacity:blocked?0.45:1}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${a.color}12`,display:"flex",alignItems:"center",justifyContent:"center",color:a.color,fontSize:17}}>{a.icon}</div>
                <span style={{fontSize:11.5,fontWeight:500,color:C.sub}}>{a.label}</span>
              </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}