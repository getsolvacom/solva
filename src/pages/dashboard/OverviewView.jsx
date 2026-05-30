import { useState } from "react";
import { C } from "../../tokens";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const weekData = [
  { day:"Mon", tickets:45,  revenue:1200 },
  { day:"Tue", tickets:62,  revenue:1850 },
  { day:"Wed", tickets:38,  revenue:940  },
  { day:"Thu", tickets:74,  revenue:2380 },
  { day:"Fri", tickets:91,  revenue:3150 },
  { day:"Sat", tickets:55,  revenue:1620 },
  { day:"Sun", tickets:43,  revenue:1290 },
];

const liveActivity = [
  { icon:"✓", label:"Order status inquiry — Auto-resolved",   time:"2m ago",  color:"#3ECFB2", tag:"Ticket"   },
  { icon:"$", label:"Abandoned cart recovered — $127.00",     time:"8m ago",  color:"#5BADFF", tag:"Recovery" },
  { icon:"⟳", label:"Return deflected — Exchange offered",    time:"15m ago", color:"#F0A04B", tag:"Return"   },
  { icon:"✓", label:"Shipping inquiry — Auto-resolved",       time:"23m ago", color:"#3ECFB2", tag:"Ticket"   },
  { icon:"$", label:"Abandoned cart recovered — $89.50",      time:"31m ago", color:"#5BADFF", tag:"Recovery" },
];

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
    `}</style>
  );
}

export default function OverviewView() {
  const [activeChart, setActiveChart] = useState("revenue");

  const kpis = [
    { label:"Tickets Resolved",  value:"1,247", change:"+18%", color:C.teal,    bar:68 },
    { label:"Revenue Recovered", value:"$8,420",change:"+24%", color:C.coral,   bar:74 },
    { label:"Returns Deflected", value:"89",    change:"+12%", color:C.amber,   bar:52 },
    { label:"Hours Saved",       value:"47.5h", change:"+31%", color:C.magenta, bar:80 },
  ];

  return (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Overview</h1>
          <p style={{fontSize:11.5,color:C.muted}}>May 19 – May 26, 2026</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:8,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.22)"}}>
            <div className="blink" style={{width:6,height:6,borderRadius:"50%",background:C.coral}}/>
            <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".04em"}}>SOLVA LIVE</span>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",cursor:"pointer",background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>E</div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{flex:1,overflowY:"auto",padding:"22px 24px",display:"flex",flexDirection:"column",gap:16,background:C.bg}}>

        {/* KPI Cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
          {kpis.map((k,i)=>(
            <div key={i} className="kpi-card fu" style={{padding:"18px 20px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,animationDelay:`${i*.06}s`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                <span style={{fontSize:11.5,color:C.sub,fontWeight:500}}>{k.label}</span>
                <span style={{fontSize:10.5,padding:"2px 8px",borderRadius:100,background:"rgba(62,207,178,.12)",color:C.teal,fontWeight:700}}>{k.change}</span>
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
        <div style={{display:"grid",gridTemplateColumns:"1fr 310px",gap:16}}>

          {/* Area Chart */}
          <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:22}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
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
          </div>

          {/* Live Activity */}
          <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:20,display:"flex",flexDirection:"column"}}>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Live Activity</h3>
            <p style={{fontSize:11.5,color:C.muted,marginBottom:14}}>Real-time automation feed</p>
            <div style={{display:"flex",flexDirection:"column",gap:2,flex:1,overflowY:"auto"}}>
              {liveActivity.map((a,i)=>(
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
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {label:"Configure AI Tone", icon:"⚙", color:C.coral  },
              {label:"View Full Reports", icon:"↗", color:C.blue   },
              {label:"Test Automation",   icon:"▶", color:C.magenta},
              {label:"Add Team Member",   icon:"+", color:C.amber  },
            ].map((a,i)=>(
              <button key={i} className="btn-ghost card-hover"
                style={{padding:"14px 10px",borderRadius:10,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${a.color}12`,display:"flex",alignItems:"center",justifyContent:"center",color:a.color,fontSize:17}}>{a.icon}</div>
                <span style={{fontSize:11.5,fontWeight:500,color:C.sub}}>{a.label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}