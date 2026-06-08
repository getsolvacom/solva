import AppSidebar       from "./AppSidebar";
import OverviewView     from "./OverviewView";
import TicketsView      from "./TicketsView";
import CartRecoveryView from "./CartRecoveryView";
import ReturnsView      from "./ReturnsView";
import AnalyticsView    from "./AnalyticsView";
import SettingsView     from "./SettingsView";

export default function DashboardShell({ view, setView, goLanding }) {
  return (
    <div style={{display:"flex",height:"100vh",background:"#060008",overflow:"hidden",overflowX:"hidden"}}>
      <style>{`@media(max-width:767px){.dash-sidebar{display:none!important;}}`}</style>
      <div className="dash-sidebar"><AppSidebar view={view} setView={setView} goLanding={goLanding}/></div>
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {view === "overview"  && <OverviewView/>}
        {view === "tickets"   && <TicketsView/>}
        {view === "cart"      && <CartRecoveryView/>}
        {view === "returns"   && <ReturnsView/>}
        {view === "analytics" && <AnalyticsView/>}
        {view === "settings"  && <SettingsView/>}
      </div>
    </div>
  );
}