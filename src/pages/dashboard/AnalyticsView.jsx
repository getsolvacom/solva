import { useState } from "react";
import { C } from "../../tokens";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const ANALYTICS_DATA = {
  "7D": [
    {label:"Mon",revenue:1200,tickets:45,returns:8},
    {label:"Tue",revenue:1850,tickets:62,returns:12},
    {label:"Wed",revenue:940, tickets:38,returns:6},
    {label:"Thu",revenue:2380,tickets:74,returns:15},
    {label:"Fri",revenue:3150,tickets:91,returns:18},
    {label:"Sat",revenue:1620,tickets:55,returns:10},
    {label:"Sun",revenue:1290,tickets:43,returns:7},
  ],
  "30D":[
    {label:"Wk 1",revenue:8200, tickets:280,returns:48},
    {label:"Wk 2",revenue:9400, tickets:312,returns:55},
    {label:"Wk 3",revenue:7800, tickets:258,returns:42},
    {label:"Wk 4",revenue:11420,tickets:397,returns:72},
  ],
  "90D":[
    {label:"Jan",revenue:32000,tickets:980, returns:168},
    {label:"Feb",revenue:38500,tickets:1140,returns:195},
    {label:"Mar",revenue:42820,tickets:1247,returns:214},
  ],
};

const KPI_DATA = {
  "7D": [
    {label:"Revenue Recovered", value:"$12,430", change:"+24%", color:C.teal,    icon:"💰"},
    {label:"Tickets Resolved",  value:"408",      change:"+18%", color:C.coral,   icon:"📧"},
    {label:"Returns Deflected", value:"76",        change:"+12%", color:C.amber,   icon:"🛡️"},
    {label:"Hours Saved",       value:"47.5h",     change:"+31%", color:C.blue,    icon:"⏱️"},
    {label:"Avg Response",      value:"<45s",      change:"-18%", color:C.magenta, icon:"⚡"},
    {label:"Satisfaction",      value:"98.3%",     change:"+2%",  color:C.violet,  icon:"⭐"},
  ],
  "30D":[
    {label:"Revenue Recovered", value:"$36,820", change:"+31%", color:C.teal,    icon:"💰"},
    {label:"Tickets Resolved",  value:"1,247",   change:"+22%", color:C.coral,   icon:"📧"},
    {label:"Returns Deflected", value:"217",      change:"+15%", color:C.amber,   icon:"🛡️"},
    {label:"Hours Saved",       value:"184h",     change:"+28%", color:C.blue,    icon:"⏱️"},
    {label:"Avg Response",      value:"<52s",     change:"-12%", color:C.magenta, icon:"⚡"},
    {label:"Satisfaction",      value:"97.8%",    change:"+1%",  color:C.violet,  icon:"⭐"},
  ],
  "90D":[
    {label:"Revenue Recovered", value:"$113,320", change:"+41%", color:C.teal,    icon:"💰"},
    {label:"Tickets Resolved",  value:"3,367",    change:"+38%", color:C.coral,   icon:"📧"},
    {label:"Returns Deflected", value:"577",       change:"+29%", color:C.amber,   icon:"🛡️"},
    {label:"Hours Saved",       value:"512h",      change:"+44%", color:C.blue,    icon:"⏱️"},
    {label:"Avg Response",      value:"<48s",      change:"-22%", color:C.magenta, icon:"⚡"},
    {label:"Satisfaction",      value:"98.1%",     change:"+3%",  color:C.violet,  icon:"⭐"},
  ],
};

const DONUT_DATA = [
  {name:"Order Status",     value:38, color:C.coral  },
  {name:"Shipping Query",   value:22, color:C.blue   },
  {name:"Product Question", value:18, color:C.teal   },
  {name:"Return Request",   value:12, color:C.amber  },
  {name:"Discount / Promo", value:10, color:C.magenta},
];

const DOW_DATA = [
  {day:"Mon",tickets:45},{day:"Tue",tickets:62},{day:"Wed",tickets:38},
  {day:"Thu",tickets:74},{day:"Fri",tickets:91},{day:"Sat",tickets:55},{day:"Sun",tickets:43},
];

const AUTOMATIONS = [
  {name:"AI Support Agent", icon:"🤖", color:C.teal,  triggers:"1,247",rate:"87%",  rateVal:87,  impact:"+$14,200 cost saved", trend:"+18%"},
  {name:"Cart Recovery",    icon:"🛒", color:C.blue,  triggers:"312",  rate:"19.5%",rateVal:19.5,impact:"+$8,420 recovered",   trend:"+24%"},
  {name:"Return Deflection",icon:"↩️", color:C.amber, triggers:"247",  rate:"28%",  rateVal:28,  impact:"+$2,840 saved",       trend:"+12%"},
];

const METRIC_CFG = {
  revenue: {label:"Revenue Recovered", color:C.teal,  prefix:"$"},
  tickets: {label:"Tickets Resolved",  color:C.coral, prefix:"" },
  returns: {label:"Returns Deflected", color:C.amber, prefix:"" },
};

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
      .fu1{animation-delay:.06s;}.fu2{animation-delay:.12s;}.fu3{animation-delay:.18s;}
      .fu4{animation-delay:.24s;}.fu5{animation-delay:.30s;}.fu6{animation-delay:.36s;}
      .btn-primary{cursor:pointer;border:none;outline:none;background:linear-gradient(135deg,#E55266,#992A67,#4E0269);background-size:200% 200%;animation:flowGrad 4s ease infinite;transition:transform .18s,box-shadow .18s;font-family:'Outfit',sans-serif;}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 26px rgba(229,82,102,.28);}
      .btn-ghost{cursor:pointer;border:none;outline:none;transition:all .14s;font-family:'Outfit',sans-serif;background:transparent;}
      .btn-ghost:hover{background:rgba(229,82,102,.07)!important;color:#E55266!important;}
      .kpi-card{transition:transform .2s,box-shadow .2s;cursor:default;}
      .kpi-card:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.5);}
      .perf-row{transition:background .14s;}
      .perf-row:hover{background:rgba(229,82,102,.04)!important;}
      .blink{animation:blink 2.4s ease infinite;}
      .range-tab,.metric-tab{cursor:pointer;transition:all .15s ease;font-family:'Outfit',sans-serif;}
      .tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:100px;font-size:10.5px;font-weight:600;white-space:nowrap;}

      /* ── Mobile layout ── */
      @media(max-width:767px){
        .av-root{overflow-x:hidden!important;height:auto!important;flex:none!important;}
        .av-topbar{height:auto!important;padding:10px 14px!important;flex-wrap:wrap!important;gap:8px!important;}
        .av-body{padding:12px 14px!important;gap:12px!important;overflow-x:hidden!important;}
        .av-kpi-grid{grid-template-columns:1fr 1fr!important;gap:9px!important;}
        .av-main-grid{grid-template-columns:1fr!important;}
        .av-lower-grid{grid-template-columns:1fr!important;}
        .av-insights-grid{grid-template-columns:1fr!important;}
        .av-chart-wrap{overflow-x:hidden!important;max-width:100%!important;}
      }
    `}</style>
  );
}

function ChartTip({ active, payload, label, prefix="" }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:C.surface,border:`1px solid ${C.borderHi}`,borderRadius:10,padding:"10px 14px",fontSize:12.5}}>
      <div style={{color:C.muted,marginBottom:6,fontWeight:600}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||C.coral,fontWeight:700}}>
          {prefix}{typeof p.value==="number"&&p.value>999?p.value.toLocaleString():p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsView() {
  const [range,         setRange]         = useState("7D");
  const [metric,        setMetric]        = useState("revenue");
  const [donutHover,    setDonutHover]    = useState(null);
  const [activePeakDay, setActivePeakDay] = useState(null);

  const chartData      = ANALYTICS_DATA[range];
  const kpis           = KPI_DATA[range];
  const mc             = METRIC_CFG[metric];
  const defaultPeakDay = DOW_DATA.reduce((max,d) => d.tickets > max.tickets ? d : max, DOW_DATA[0]);
  const peakDay        = activePeakDay || defaultPeakDay;

  return (
    <div className="av-root" style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",overflowX:"hidden",fontFamily:"'Outfit',sans-serif"}}>
      <GlobalStyles/>

      {/* Top bar */}
      <div className="av-topbar" style={{padding:"0 24px",height:60,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
        <div>
          <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:17,fontWeight:700,color:C.text}}>Analytics</h1>
          <p style={{fontSize:11.5,color:C.muted}}>Full performance breakdown · Solva AI</p>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",justifyContent:"flex-end"}}>
          {/* Range selector */}
          <div style={{display:"flex",gap:3,padding:"3px",borderRadius:9,background:C.card,border:`1px solid ${C.border}`}}>
            {["7D","30D","90D"].map(r=>(
              <button key={r} className="range-tab" onClick={()=>setRange(r)}
                style={{padding:"5px 14px",borderRadius:7,border:"none",background:range===r?"linear-gradient(135deg,#E55266,#992A67,#4E0269)":"transparent",color:range===r?"#fff":C.muted,fontSize:12.5,fontWeight:range===r?700:400}}>
                {r}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"5px 14px",borderRadius:8,background:"rgba(229,82,102,.09)",border:"1px solid rgba(229,82,102,.22)"}}>
            <div className="blink" style={{width:6,height:6,borderRadius:"50%",background:C.coral}}/>
            <span style={{fontSize:11.5,color:C.coral,fontWeight:700,letterSpacing:".04em"}}>SOLVA LIVE</span>
          </div>
          <div style={{width:34,height:34,borderRadius:"50%",cursor:"pointer",background:C.grad,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff"}}>E</div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="av-body" style={{flex:1,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:18,background:C.bg}}>

        {/* KPI Cards */}
        <div className="av-kpi-grid" style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
          {kpis.map((k,i)=>(
            <div key={i} className={`kpi-card fu fu${Math.min(i+1,6)}`}
              style={{padding:"16px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <div style={{width:32,height:32,borderRadius:9,background:`${k.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,color:k.color}}>{k.icon}</div>
                <span style={{fontSize:11,padding:"2px 7px",borderRadius:100,background:"rgba(62,207,178,.12)",color:C.teal,fontWeight:700}}>{k.change}</span>
              </div>
              <div style={{fontSize:20,fontWeight:800,color:k.color,marginBottom:3}}>{k.value}</div>
              <div style={{fontSize:11,color:C.muted}}>{k.label}</div>
            </div>
          ))}
        </div>

        {/* Area chart + Donut */}
        <div className="av-main-grid" style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:16}}>

          {/* Area chart */}
          <div className="av-chart-wrap" style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:22}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div>
                <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>{mc.label}</h3>
                <p style={{fontSize:11.5,color:C.muted}}>{range==="7D"?"Last 7 days":range==="30D"?"Last 30 days":"Last 90 days"}</p>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {Object.entries(METRIC_CFG).map(([key,cfg])=>(
                  <button key={key} className="metric-tab" onClick={()=>setMetric(key)}
                    style={{padding:"5px 13px",borderRadius:8,border:`1px solid ${metric===key?`${cfg.color}40`:C.border}`,background:metric===key?`${cfg.color}18`:"transparent",color:metric===key?cfg.color:C.muted,fontSize:12,fontWeight:metric===key?700:400}}>
                    {cfg.label.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={chartData} margin={{top:0,right:4,bottom:0,left:-20}}>
                <defs>
                  <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={mc.color} stopOpacity={.30}/>
                    <stop offset="95%" stopColor={mc.color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.dim}/>
                <XAxis dataKey="label" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip content={<ChartTip prefix={mc.prefix}/>} cursor={{ fill:"rgba(255,255,255,0.04)" }}/>
                <Area type="monotone" dataKey={metric} stroke={mc.color} strokeWidth={2.5} fill="url(#anGrad)" dot={false} activeDot={{r:5,fill:mc.color,strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Donut */}
          <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:22,display:"flex",flexDirection:"column"}}>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Ticket Types</h3>
            <p style={{fontSize:11.5,color:C.muted,marginBottom:14}}>Breakdown by category</p>
            <div style={{position:"relative",display:"flex",justifyContent:"center",marginBottom:16}}>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={DONUT_DATA} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value"
                    onMouseEnter={(_,i)=>setDonutHover(i)} onMouseLeave={()=>setDonutHover(null)}>
                    {DONUT_DATA.map((d,i)=>(
                      <Cell key={i} fill={d.color} opacity={donutHover===null||donutHover===i?1:.4} stroke="none"/>
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center",pointerEvents:"none"}}>
                <div style={{fontSize:18,fontWeight:800,color:donutHover!==null?DONUT_DATA[donutHover].color:C.text}}>
                  {donutHover!==null?`${DONUT_DATA[donutHover].value}%`:"100%"}
                </div>
                <div style={{fontSize:9.5,color:C.muted}}>
                  {donutHover!==null?DONUT_DATA[donutHover].name:"All tickets"}
                </div>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7,flex:1}}>
              {DONUT_DATA.map((d,i)=>(
                <div key={i} onMouseEnter={()=>setDonutHover(i)} onMouseLeave={()=>setDonutHover(null)}
                  style={{display:"flex",alignItems:"center",gap:8,cursor:"default",opacity:donutHover===null||donutHover===i?1:.45,transition:"opacity .15s"}}>
                  <div style={{width:8,height:8,borderRadius:2,background:d.color,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:11.5,color:C.sub}}>{d.name}</span>
                  <span style={{fontSize:12,fontWeight:700,color:d.color}}>{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bar chart + Performance table */}
        <div className="av-lower-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

          {/* Bar chart */}
          <div className="av-chart-wrap" style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:22}}>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Busiest Days</h3>
            <p style={{fontSize:11.5,color:C.muted,marginBottom:18}}>Tickets resolved by day of week</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart
                data={DOW_DATA}
                margin={{top:0,right:4,bottom:0,left:-24}}
                barSize={28}
                onMouseLeave={()=>setActivePeakDay(null)}
              >
                <defs>
                  <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#E55266" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#4E0269" stopOpacity={.7}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.dim} vertical={false}/>
                <XAxis dataKey="day" tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:C.muted,fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip
                  contentStyle={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,color:C.text}}
                  cursor={{ fill:"rgba(255,255,255,0.04)" }}
                />
                <Bar
                  dataKey="tickets"
                  fill="url(#barG)"
                  radius={[6,6,0,0]}
                  onMouseEnter={(entry) => setActivePeakDay({day:entry.day, tickets:entry.tickets})}
                  onClick={(entry) => setActivePeakDay({day:entry.day, tickets:entry.tickets})}
                />
              </BarChart>
            </ResponsiveContainer>
            <div style={{marginTop:14,padding:"9px 14px",borderRadius:9,background:"rgba(229,82,102,.07)",border:"1px solid rgba(229,82,102,.16)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12.5,color:C.sub}}>📈 Peak day — <span style={{color:C.coral,fontWeight:700}}>{peakDay.day}</span></span>
              <span style={{fontSize:12.5,fontWeight:700,color:C.coral}}>{peakDay.tickets} tickets</span>
            </div>
          </div>

          {/* Performance table */}
          <div style={{borderRadius:14,background:C.card,border:`1px solid ${C.border}`,padding:22}}>
            <h3 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:C.text,marginBottom:3}}>Automation Performance</h3>
            <p style={{fontSize:11.5,color:C.muted,marginBottom:18}}>All three systems · {range} period</p>
            <div style={{display:"grid",gridTemplateColumns:"1fr 72px 64px",padding:"0 0 10px",borderBottom:`1px solid ${C.border}`,marginBottom:4}}>
              {["Automation","Triggers","Rate"].map((h,i)=>(
                <div key={i} style={{fontSize:10.5,fontWeight:700,color:C.muted,letterSpacing:".06em",textTransform:"uppercase",textAlign:i>0?"center":"left"}}>{h}</div>
              ))}
            </div>
            {AUTOMATIONS.map((a,i)=>(
              <div key={i} className="perf-row" style={{padding:"12px 0",borderBottom:i<2?`1px solid ${C.dim}`:"none",borderRadius:6}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 72px 64px",alignItems:"center",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:9}}>
                    <div style={{width:30,height:30,borderRadius:8,flexShrink:0,background:`${a.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,color:a.color}}>{a.icon}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{a.name}</div>
                      <div style={{fontSize:11,color:C.teal,fontWeight:600,marginTop:2}}>{a.impact}</div>
                    </div>
                  </div>
                  <div style={{textAlign:"center",fontSize:14,fontWeight:700,color:C.text}}>{a.triggers}</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{fontSize:15,fontWeight:800,color:a.color}}>{a.rate}</div>
                    <div style={{fontSize:10,color:C.teal,fontWeight:600}}>{a.trend}</div>
                  </div>
                </div>
                <div style={{height:4,borderRadius:3,background:C.dim,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${a.color},${a.color}88)`,width:`${a.rateVal}%`,transition:"width .6s cubic-bezier(.16,1,.3,1)"}}/>
                </div>
              </div>
            ))}
            <div style={{marginTop:14,padding:"10px 14px",borderRadius:10,background:"rgba(62,207,178,.07)",border:"1px solid rgba(62,207,178,.18)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12.5,color:C.sub,fontWeight:500}}>Total AI-generated impact</span>
              <span style={{fontSize:14,fontWeight:800,color:C.teal}}>+$25,460</span>
            </div>
          </div>
        </div>

        {/* Insight strip */}
        <div className="av-insights-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14,paddingBottom:8}}>
          {[
            {icon:"🏆",color:C.coral, label:"Best performing automation", value:"AI Support Agent",             sub:"87% auto-resolution rate this period"},
            {icon:"📈",color:C.teal,  label:"Fastest growing metric",     value:"Hours Saved",                  sub:"+31% vs last period · 47.5h this week"},
            {icon:"💡",color:C.amber, label:"AI recommendation",           value:"Increase cart recovery window", sub:"Friday carts convert 2× faster — extend to 48h"},
          ].map((ins,i)=>(
            <div key={i} style={{padding:"16px 18px",borderRadius:14,background:C.card,border:`1px solid ${C.border}`,display:"flex",gap:13,alignItems:"flex-start"}}>
              <div style={{width:38,height:38,borderRadius:10,flexShrink:0,background:`${ins.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,color:ins.color}}>{ins.icon}</div>
              <div>
                <div style={{fontSize:10.5,color:C.muted,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em",marginBottom:5}}>{ins.label}</div>
                <div style={{fontSize:14,fontWeight:700,color:ins.color,marginBottom:4}}>{ins.value}</div>
                <div style={{fontSize:12,color:C.sub,lineHeight:1.55}}>{ins.sub}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
