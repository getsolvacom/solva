import { useState } from "react";
import LandingPage    from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardShell from "./pages/dashboard/DashboardShell";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [view,   setView]   = useState("overview");

  return (
    <>
      {screen === "landing" && (
        <LandingPage
          goOnboard={() => setScreen("onboarding")}
          goDash={()    => setScreen("dashboard")}
        />
      )}
      {screen === "onboarding" && (
        <OnboardingPage
          goBack={() => setScreen("landing")}
          goDash={() => { setScreen("dashboard"); setView("overview"); }}
        />
      )}
      {screen === "dashboard" && (
        <DashboardShell
          view={view}
          setView={setView}
          goLanding={() => setScreen("landing")}
        />
      )}
    </>
  );
}