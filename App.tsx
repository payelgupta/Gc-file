import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Notice from "./pages/Notice";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminHome from "./pages/admin/AdminHome";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminNotices from "./pages/admin/AdminNotices";
import AdminTheme from "./pages/admin/AdminTheme";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAccount from "./pages/admin/AdminAccount";
import AdminDownloadRequests from "./pages/admin/AdminDownloadRequests";
import AdminHeroSettings from "./pages/admin/AdminHeroSettings";
import AdminViewerMode from "./pages/admin/AdminViewerMode";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLoginActivity from "./pages/admin/AdminLoginActivity";
import AdminAISettings from "./pages/admin/AdminAISettings";
import AdminCommandCenter from "./pages/admin/AdminCommandCenter";
import UserLogin from "./pages/UserLogin";
import UserSignup from "./pages/UserSignup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Category from "./pages/Category";
import Results from "./pages/Results";
import AdminUnlockRequests from "./pages/admin/AdminUnlockRequests";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import StudentDashboard from "./pages/StudentDashboard";
import ScrollToTop from "@/components/common/ScrollToTop";
import { TermsPage, PrivacyPage, RefundPage } from "./pages/Policies";
import Classes from "./pages/Classes";
import Videos from "./pages/Videos";
import Notes from "./pages/Notes";
import Suggestions from "./pages/Suggestions";
import { isSupabaseConfigured, supabaseConfigurationError } from "@/integrations/supabase/client";
import { AlertTriangle } from "lucide-react";

const ConfigurationBanner = () => {
  if (isSupabaseConfigured) return null;
  return (
    <aside
      aria-label="Supabase Configuration Alert"
      className="bg-amber-950/90 border-b border-amber-500/40 text-amber-200 px-4 py-2 text-xs text-center flex items-center justify-center gap-2 z-50 sticky top-0 backdrop-blur-md shadow-md"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
      <span>
        {supabaseConfigurationError ||
          "সুপাবেস কনফিগারেশন অনুপস্থিত: VITE_SUPABASE_URL এবং VITE_SUPABASE_PUBLISHABLE_KEY সেট করুন।"}
      </span>
    </aside>
  );
};

const queryClient = new QueryClient();

const PublicLayout = () => (
  <>
    <Header />
    <Outlet />
    <Footer />
    <MobileBottomNav />
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ConfigurationBanner />
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/signup" element={<UserSignup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/admin" element={<AdminDashboard />}>
              <Route index element={<AdminHome />} />
              <Route path="posts" element={<AdminPosts />} />
              <Route path="notices" element={<AdminNotices />} />
              <Route path="theme" element={<AdminTheme />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="account" element={<AdminAccount />} />
              <Route path="download-requests" element={<AdminDownloadRequests />} />
              <Route path="hero-settings" element={<AdminHeroSettings />} />
              <Route path="viewer-mode" element={<AdminViewerMode />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="login-activity" element={<AdminLoginActivity />} />
              <Route path="ai-settings" element={<AdminAISettings />} />
              <Route path="ai-command" element={<AdminCommandCenter />} />
              <Route path="unlock-requests" element={<AdminUnlockRequests />} />
            </Route>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/suggestions" element={<Suggestions />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/notice" element={<Notice />} />
              <Route path="/results" element={<Results />} />
              <Route path="/dashboard" element={<StudentDashboard />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/refund" element={<RefundPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
