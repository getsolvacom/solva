import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import LandingPage       from "./pages/LandingPage";
import LoginPage         from "./pages/LoginPage";
import OnboardingPage    from "./pages/OnboardingPage";
import DashboardShell    from "./pages/dashboard/DashboardShell";
import ShopifyCallback   from "./pages/ShopifyCallback";
import ResetPasswordPage from "./pages/ResetPasswordPage";

const checkUserStore = async (userId) => {
  const { data, error } = await supabase
    .from('stores')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  console.log('Store check result:', { data, error, userId });
  return data;
};

function ProtectedRoute({ session, children }) {
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function GuestRoute({ session, children }) {
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardRoute({ session, hasStore, children }) {
  if (!session) return <Navigate to="/login" replace />;
  if (!hasStore) return <Navigate to="/onboarding" replace />;
  return children;
}

export default function App() {
  const navigate                      = useNavigate();
  const [isAppReady, setIsAppReady]   = useState(false);
  const [session,    setSession]      = useState(null);
  const [hasStore,   setHasStore]     = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      navigate('/reset-password');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session?.user) {
        const store = await checkUserStore(session.user.id);
        setHasStore(!!store);
      }
      setIsAppReady(true);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        const store = await checkUserStore(session.user.id);
        setHasStore(!!store);
      } else if (event === 'SIGNED_OUT') {
        setHasStore(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!isAppReady) return <div style={{backgroundColor:'#060008',minHeight:'100vh'}}/>;

  return (
    <Routes>
      <Route path="/"                            element={<LandingPage />} />
      <Route path="/login"                       element={<GuestRoute session={session}><LoginPage /></GuestRoute>} />
      <Route path="/onboarding"                  element={<OnboardingPage />} />
      <Route path="/dashboard"                   element={<DashboardRoute session={session} hasStore={hasStore}><DashboardShell /></DashboardRoute>} />
      <Route path="/dashboard/tickets/:ticketId" element={<DashboardRoute session={session} hasStore={hasStore}><DashboardShell fixedView="tickets" /></DashboardRoute>} />
      <Route path="/dashboard/cart/:cartId"      element={<DashboardRoute session={session} hasStore={hasStore}><DashboardShell fixedView="cart" /></DashboardRoute>} />
      <Route path="/dashboard/returns/:returnId" element={<DashboardRoute session={session} hasStore={hasStore}><DashboardShell fixedView="returns" /></DashboardRoute>} />
      <Route path="/dashboard/settings/:tab"     element={<DashboardRoute session={session} hasStore={hasStore}><DashboardShell fixedView="settings" /></DashboardRoute>} />
      <Route path="/dashboard/:view"             element={<DashboardRoute session={session} hasStore={hasStore}><DashboardShell /></DashboardRoute>} />
      <Route path="/auth/shopify/callback"       element={<ShopifyCallback />} />
      <Route path="/reset-password"              element={<ResetPasswordPage />} />
      <Route path="*"                            element={<Navigate to="/" replace />} />
    </Routes>
  );
}
