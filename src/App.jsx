import { useState } from "react";
import LandingPage    from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardShell from "./pages/dashboard/DashboardShell";

export default function App() {
  const [screen,    setScreen]    = useState("landing");
  const [view,      setView]      = useState("overview");
  const [loginMode, setLoginMode] = useState("signup");

  const goOnboard = () => { setLoginMode("signup"); setScreen("onboarding"); };
  const goLogin   = () => { setLoginMode("login");  setScreen("onboarding"); };

  return (
    <>
      {screen === "landing" && (
        <LandingPage
          goOnboard={goOnboard}
          goLogin={goLogin}
          goDash={() => setScreen("dashboard")}
        />
      )}
      {screen === "onboarding" && (
        <OnboardingPage
          goBack={() => setScreen("landing")}
          goDash={() => { setScreen("dashboard"); setView("overview"); }}
          initialMode={loginMode}
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