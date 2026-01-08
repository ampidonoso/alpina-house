import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import ModelsPage from "./pages/ModelsPage";
import ModelDetailPage from "./pages/ModelDetailPage";
import ConfiguratorPage from "./pages/ConfiguratorPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import NotFound from "./pages/NotFound";
import CustomCursor from "./components/CustomCursor";
import NoiseOverlay from "./components/ui/NoiseOverlay";
import ScrollToTopButton from "./components/ui/ScrollToTopButton";
import Preloader from "./components/Preloader";
import { useLenis, scrollToTop } from "./hooks/useLenis";
import { AuthProvider } from "./hooks/useAuth";
import { SiteConfigProvider } from "./contexts/SiteConfigContext";
import { DockVisibilityProvider } from "./contexts/DockVisibilityContext";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminResetPassword from "./pages/admin/AdminResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminProjectEditor from "./pages/admin/AdminProjectEditor";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminContent from "./pages/admin/AdminContent";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminQuotes from "./pages/admin/AdminQuotes";
import AdminRoute from "./components/admin/AdminRoute";
import AuthCallback from "./pages/auth/AuthCallback";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

// Scroll to top on route change - uses Lenis
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    scrollToTop();
  }, [pathname]);
  
  return null;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname.startsWith('/auth');
  
  // Admin and auth routes don't use the animated wrapper
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/projects" element={<AdminRoute><AdminProjects /></AdminRoute>} />
        <Route path="/admin/projects/:id" element={<AdminRoute><AdminProjectEditor /></AdminRoute>} />
        <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
        <Route path="/admin/content" element={<AdminRoute><AdminContent /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/quotes" element={<AdminRoute><AdminQuotes /></AdminRoute>} />
      </Routes>
    );
  }

  if (isAuthRoute) {
    return (
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
    );
  }
  
  return (
    <>
      <ScrollToTop />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Index />} />
          <Route path="/modelos" element={<ModelsPage />} />
          <Route path="/modelos/:slug" element={<ModelDetailPage />} />
          <Route path="/configurador" element={<ConfiguratorPage />} />
          <Route path="/quienes-somos" element={<AboutPage />} />
          <Route path="/servicios" element={<ServicesPage />} />
          <Route path="/privacidad" element={<PrivacyPolicyPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

const AppContent = () => {
  // Check if current URL is admin route - skip preloader for admin
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const [showPreloader, setShowPreloader] = useState(!isAdminPath);
  useLenis();

  return (
    <>
      {/* Preloader on top */}
      <AnimatePresence>
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}
      </AnimatePresence>
      
      {/* Content always renders underneath */}
      <CustomCursor />
      <NoiseOverlay />
      <ScrollToTopButton />
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SiteConfigProvider>
            <DockVisibilityProvider>
              <AppContent />
            </DockVisibilityProvider>
          </SiteConfigProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
