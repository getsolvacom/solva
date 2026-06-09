import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage    from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardShell from "./pages/dashboard/DashboardShell";

export default function App() {
  return (
    <Routes>
      <Route path="/"                element={<LandingPage />} />
      <Route path="/onboarding"      element={<OnboardingPage />} />
      <Route path="/dashboard"       element={<DashboardShell />} />
      <Route path="/dashboard/:view" element={<DashboardShell />} />
      <Route path="*"                element={<Navigate to="/" replace />} />
    </Routes>
  );
}
