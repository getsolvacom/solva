import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { DemoContext } from "./context/DemoContext";
import LandingPage       from "./pages/LandingPage";
import LoginPage         from "./pages/LoginPage";
import OnboardingPage    from "./pages/OnboardingPage";
import DashboardShell    from "./pages/dashboard/DashboardShell";
import ShopifyCallback   from "./pages/ShopifyCallback";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PrivacyPage       from "./pages/PrivacyPage";
import TermsPage         from "./pages/TermsPage";

function DemoRoute({ children }) {
  return (
    <DemoContext.Provider value={{ isDemoMode: true }}>
      {children}
    </DemoContext.Provider>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [isAppReady, setIsAppReady] = useState(false);
  const [session,    setSession]    = useState(null);
  const [hasStore,   setHasStore]   = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      navigate('/reset-password');
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const checkStore = async (userId) => {
      const { data } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();
      return !!data;
    };

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        const found = await checkStore(session.user.id);
        if (!mounted) return;
        setHasStore(found);
      }
      setIsAppReady(true);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return;
      if (event === 'INITIAL_SESSION') return;
      setSession(newSession);
      if (event === 'SIGNED_IN' && newSession?.user) {
        const found = await checkStore(newSession.user.id);
        if (!mounted) return;
        setHasStore(found);
      }
      if (event === 'SIGNED_OUT') {
        setHasStore(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!isAppReady) {
    return <div style={{ backgroundColor: '#060008', minHeight: '100vh' }} />;
  }

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={
        session ? <Navigate to={hasStore ? "/dashboard" : "/onboarding"} replace /> : <LoginPage />
      } />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={
        !session ? <Navigate to="/login" replace /> :
        !hasStore ? <Navigate to="/onboarding" replace /> :
        <DashboardShell />
      } />
      <Route path="/dashboard/tickets/:ticketId" element={
        !session ? <Navigate to="/login" replace /> :
        !hasStore ? <Navigate to="/onboarding" replace /> :
        <DashboardShell fixedView="tickets" />
      } />
      <Route path="/dashboard/cart/:cartId" element={
        !session ? <Navigate to="/login" replace /> :
        !hasStore ? <Navigate to="/onboarding" replace /> :
        <DashboardShell fixedView="cart" />
      } />
      <Route path="/dashboard/returns/:returnId" element={
        !session ? <Navigate to="/login" replace /> :
        !hasStore ? <Navigate to="/onboarding" replace /> :
        <DashboardShell fixedView="returns" />
      } />
      <Route path="/dashboard/settings/:tab" element={
        !session ? <Navigate to="/login" replace /> :
        !hasStore ? <Navigate to="/onboarding" replace /> :
        <DashboardShell fixedView="settings" />
      } />
      <Route path="/dashboard/:view" element={
        !session ? <Navigate to="/login" replace /> :
        !hasStore ? <Navigate to="/onboarding" replace /> :
        <DashboardShell />
      } />
      <Route path="/demo" element={<DemoRoute><DashboardShell /></DemoRoute>} />
      <Route path="/demo/:view" element={<DemoRoute><DashboardShell /></DemoRoute>} />
      <Route path="/demo/tickets/:ticketId" element={<DemoRoute><DashboardShell fixedView="tickets" /></DemoRoute>} />
      <Route path="/demo/cart/:cartId" element={<DemoRoute><DashboardShell fixedView="cart" /></DemoRoute>} />
      <Route path="/demo/returns/:returnId" element={<DemoRoute><DashboardShell fixedView="returns" /></DemoRoute>} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/auth/shopify/callback" element={<ShopifyCallback />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
