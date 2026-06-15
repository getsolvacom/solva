import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardShell    from "./pages/dashboard/DashboardShell";
import ShopifyCallback   from "./pages/ShopifyCallback";

function LoadingScreen() {
  return (
    <div style={{background:"#060008",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:32,height:32,borderRadius:"50%",border:"3px solid #200026",borderTopColor:"#E55266",animation:"spin 0.7s linear infinite"}}/>
    </div>
  );
}

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ session, children }) {
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/"                            element={<LandingPage />} />
      <Route path="/login"                       element={<GuestRoute session={session}><LoginPage /></GuestRoute>} />
      <Route path="/onboarding"                  element={<GuestRoute session={session}><OnboardingPage /></GuestRoute>} />
      <Route path="/dashboard"                   element={<ProtectedRoute session={session}><DashboardShell /></ProtectedRoute>} />
      <Route path="/dashboard/tickets/:ticketId" element={<ProtectedRoute session={session}><DashboardShell fixedView="tickets" /></ProtectedRoute>} />
      <Route path="/dashboard/cart/:cartId"      element={<ProtectedRoute session={session}><DashboardShell fixedView="cart" /></ProtectedRoute>} />
      <Route path="/dashboard/returns/:returnId" element={<ProtectedRoute session={session}><DashboardShell fixedView="returns" /></ProtectedRoute>} />
      <Route path="/dashboard/settings/:tab"     element={<ProtectedRoute session={session}><DashboardShell fixedView="settings" /></ProtectedRoute>} />
      <Route path="/dashboard/:view"             element={<ProtectedRoute session={session}><DashboardShell /></ProtectedRoute>} />
      <Route path="/auth/shopify/callback"        element={<ShopifyCallback />} />
      <Route path="*"                            element={<Navigate to="/" replace />} />
    </Routes>
  );
}
