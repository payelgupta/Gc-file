import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, FileText, Bell, Palette, Settings, LogOut, KeyRound, Menu, X, ShieldCheck, ImageIcon, Eye, Bot, Sparkles
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SuperIntelligentAI } from "@/components/admin/SuperIntelligentAI";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const sidebarLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
  { to: "/admin/posts", icon: FileText, label: "Posts" },
  { to: "/admin/notices", icon: Bell, label: "Notices" },
  { to: "/admin/unlock-requests", icon: ShieldCheck, label: "পেইড PDF রিকোয়েস্ট" },
  { to: "/admin/download-requests", icon: ShieldCheck, label: "Download Requests" },
  { to: "/admin/hero-settings", icon: ImageIcon, label: "Hero Background" },
  { to: "/admin/gallery", icon: ImageIcon, label: "Photo Gallery" },
  { to: "/admin/analytics", icon: LayoutDashboard, label: "Analytics" },
  { to: "/admin/login-activity", icon: KeyRound, label: "Login Activity" },
  { to: "/admin/ai-settings", icon: Bot, label: "AI Settings" },
  { to: "/admin/ai-command", icon: Sparkles, label: "AI Command Center" },
  { to: "/admin/viewer-mode", icon: Eye, label: "ভিউয়ার মোড" },
  { to: "/admin/theme", icon: Palette, label: "Theme" },
  { to: "/admin/settings", icon: Settings, label: "Site Settings" },
  { to: "/admin/account", icon: KeyRound, label: "Account" },
];

const AdminDashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const { headerLogo } = useSiteSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate("/admin-login");
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>;
  }

  if (!user || !isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-[#070913] text-foreground font-bengali relative overflow-hidden">
      {/* Ambient Cosmic Glow Backdrops matching homepage */}
      <div className="pointer-events-none fixed -top-32 -left-32 h-96 w-96 rounded-full bg-[#10B981]/10 blur-[130px]" />
      <div className="pointer-events-none fixed top-1/2 -right-32 h-96 w-96 rounded-full bg-[#F5C76A]/10 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-32 left-1/3 h-96 w-96 rounded-full bg-[#38BDF8]/10 blur-[130px]" />

      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-slate-900/80 border border-white/10 backdrop-blur-md text-white shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0A0E24]/95 backdrop-blur-2xl transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header with Royal Crest */}
          <div className="border-b border-white/10 p-4 sm:p-5 flex items-center gap-3 bg-gradient-to-b from-white/5 to-transparent">
            <div className="relative h-11 w-11 shrink-0 flex items-center justify-center">
              <img
                src={headerLogo}
                alt="জ্ঞানচর্চা'লয় লোগো"
                className="h-full w-full object-contain select-none transition-transform duration-300 hover:scale-105"
                style={{
                  filter:
                    "drop-shadow(0 0 8px rgba(245, 199, 106, 0.85)) drop-shadow(0 0 16px rgba(72, 217, 245, 0.65)) drop-shadow(0 0 24px rgba(168, 85, 247, 0.45))",
                }}
              />
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5 truncate">
                জ্ঞানচর্চা'লয় অ্যাডমিন
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <p className="text-[11px] text-slate-300 truncate max-w-[130px] font-mono">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1 p-3 overflow-y-auto scrollbar-thin">
            {sidebarLinks.map((link, i) => {
              const isActive = link.exact
                ? location.pathname === link.to
                : location.pathname.startsWith(link.to) && !link.exact;
              return (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <Link
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-500/25 via-teal-500/15 to-transparent text-emerald-300 font-bold border-l-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
                    }`}
                  >
                    <link.icon
                      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                        isActive
                          ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                          : "text-slate-400 group-hover:text-emerald-300"
                      }`}
                    />
                    <span className="truncate">{link.label}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="border-t border-white/10 p-3 space-y-1 bg-black/20">
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-slate-300 hover:text-white hover:bg-white/5"
              >
                ← মূল ওয়েবসাইটে ফিরুন
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" /> লগআউট করুন
            </Button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 pt-16 md:p-8 md:pt-8 overflow-y-auto max-w-7xl mx-auto w-full">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Floating AI Assistant - matching homepage beauty */}
      <SuperIntelligentAI />
    </div>
  );
};

export default AdminDashboard;
