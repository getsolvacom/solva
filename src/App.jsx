import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import LandingPage    from "./pages/LandingPage";
import LoginPage      from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardShell    from "./pages/dashboard/DashboardShell";
import ShopifyCallback   from "./pages/ShopifyCallback";

const checkUserStore = async (userId) => {
  const { data } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', userId)
    .single();
  return data;
};

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
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        const store = await checkUserStore(session.user.id);
        navigate(store ? '/dashboard' : '/onboarding', { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/"                            element={<LandingPage />} />
      <Route path="/login"                       element={<GuestRoute session={session}><LoginPage /></GuestRoute>} />
      <Route path="/onboarding"                  element={<ProtectedRoute session={session}><OnboardingPage /></ProtectedRoute>} />
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
