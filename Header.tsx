import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  Search, 
  Moon, 
  Sun, 
  LogIn, 
  LogOut, 
  UserPlus, 
  Shield, 
  GraduationCap, 
  ChevronDown,
  BookOpen,
  Sparkles,
  Phone
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "./NotificationBell";
import CosmicBrandLogo from "@/components/brand/CosmicBrandLogo";

const navLinks = [
  { to: "/", label: "হোম" },
  { 
    to: "/classes", 
    label: "ক্লাসসমূহ",
    hasDropdown: true,
    children: [
      { to: "/category/class-1-5", label: "Class 1–5 (প্রাথমিক)" },
      { to: "/category/class-6-8", label: "Class 6–8 (জুনিয়র)" },
      { to: "/category/ssc", label: "SSC প্রস্তুতি" },
      { to: "/category/hsc", label: "HSC প্রস্তুতি" },
      { to: "/category/honours", label: "অনার্স ও ডিগ্রি" },
      { to: "/category/ma", label: "মাস্টার্স ও প্রফেশনাল" },
    ]
  },
  { to: "/videos", label: "ভিডিও লেকচার" },
  { to: "/notes", label: "পিডিএফ নোট" },
  { to: "/suggestions", label: "সাজেশন" },
  { to: "/notice", label: "নোটিশ" },
  { to: "/results", label: "রেজাল্ট" },
  { to: "/about", label: "পরিচিতি" },
  { to: "/contact", label: "যোগাযোগ" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [classDropdownOpen, setClassDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.classList.contains("dark");
    }
    return true;
  });
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  // Scroll listener for compact header transformation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-[#080A12]/90 dark:bg-[#080A12]/95 backdrop-blur-xl border-b border-[#F5C76A]/20 shadow-xl py-1.5 sm:py-2" 
          : "bg-[#0B1026]/80 dark:bg-[#0B1026]/90 backdrop-blur-md border-b border-white/10 py-2 sm:py-3"
      }`}
    >
      {/* Row 1: Main Header (Logo, Search, Phone Hotline & Signature Green Login Button) */}
      <div className="container flex items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Illuminated Symbol */}
        <CosmicBrandLogo size={isScrolled ? "sm" : "md"} type="header" />

        {/* Right Controls matching PDF Screenshot */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 font-bengali">
          {/* Search Trigger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white"
            onClick={() => setSearchOpen(!searchOpen)}
            title="অনুসন্ধান"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Hotline Phone Call Button (Page 1 of PDF) */}
          <a
            href="tel:01537515618"
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-white/10 transition-colors"
            title="হটলাইন: 01537515618"
          >
            <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </a>

          {/* Theme Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white hidden sm:flex"
            onClick={toggleDark}
          >
            {dark ? <Sun className="h-4 w-4 text-[#F5C76A]" /> : <Moon className="h-4 w-4 text-slate-300" />}
          </Button>

          <div className="hidden sm:block">
            <NotificationBell />
          </div>

          {/* Signature 10MS Green Button: লগ-ইন / ড্যাশবোর্ড (Pages 1-5 of PDF) */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link to="/dashboard">
                <button className="h-8 sm:h-9 px-3.5 sm:px-4 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer">
                  <GraduationCap className="h-3.5 w-3.5" />
                  <span>ড্যাশবোর্ড</span>
                </button>
              </Link>
              {isAdmin && (
                <Link to="/admin" className="hidden lg:block">
                  <button className="h-8 sm:h-9 px-3 rounded-lg border border-purple-500/40 bg-purple-500/20 text-purple-200 text-xs font-bold">
                    Admin
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="h-8 sm:h-9 px-4 sm:px-5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white font-black text-xs sm:text-sm shadow-md transition-transform active:scale-95 cursor-pointer">
                লগ-ইন
              </button>
            </Link>
          )}

          {/* Mobile Drawer Hamburger */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white md:hidden ml-1"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Row 2: Secondary Category Navigation Bar from PDF Screenshots (Pages 1, 2, 5, 29, 31, 39) */}
      <div className="border-t border-white/5 bg-[#090C1A]/95 mt-1 sm:mt-1.5">
        <div className="container px-4 sm:px-6">
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto py-2 text-xs sm:text-sm font-semibold font-bengali text-slate-300 scrollbar-none whitespace-nowrap">
            
            {/* Class Dropdown Trigger */}
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setClassDropdownOpen(true)}
              onMouseLeave={() => setClassDropdownOpen(false)}
            >
              <div className="flex items-center gap-1 hover:text-[#10B981] transition-colors py-0.5">
                <span>ক্লাস ১-১২</span>
                <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform" />
              </div>

              {/* Class Dropdown */}
              <AnimatePresence>
                {classDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 mt-1 w-52 rounded-2xl bg-[#0F172A] border border-white/10 p-2 shadow-2xl z-50"
                  >
                    {[
                      { to: "/category/class-1-5", label: "Class 1–5 (প্রাথমিক)" },
                      { to: "/category/class-6-8", label: "Class 6–8 (জুনিয়র)" },
                      { to: "/category/ssc", label: "SSC প্রস্তুতি (৯ম-১০ম)" },
                      { to: "/category/hsc", label: "HSC প্রস্তুতি (১১শ-১২শ)" },
                      { to: "/category/honours", label: "অনার্স ও ডিগ্রি" },
                      { to: "/category/ma", label: "মাস্টার্স ও MBA" },
                    ].map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        onClick={() => setClassDropdownOpen(false)}
                        className="block px-3 py-2 rounded-xl text-xs text-slate-200 hover:bg-white/10 hover:text-emerald-400 transition-colors"
                      >
                        {c.label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/category/hsc" className="hover:text-[#10B981] transition-colors">
              এইচএসসি স্পেশাল
            </Link>

            <Link to="/category/ssc" className="hover:text-[#10B981] transition-colors">
              এসএসসি বুলেট সাজেশন
            </Link>

            <Link to="/notes" className="hover:text-[#10B981] transition-colors">
              বই ও হ্যান্ডনোট
            </Link>

            <Link to="/videos" className="hover:text-[#10B981] transition-colors">
              ভিডিও লেকচার
            </Link>

            <Link to="/notice" className="hover:text-[#10B981] transition-colors">
              নোটিশ ও রুটিন
            </Link>

            <Link to="/results" className="hover:text-[#10B981] transition-colors">
              বোর্ড রেজাল্ট
            </Link>

            <Link to="/about" className="hover:text-[#10B981] transition-colors">
              সুজয় স্যার পরিচিতি
            </Link>
          </div>
        </div>
      </div>

      {/* Search Input Bar (Dropdown) */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#0B1026]/95 backdrop-blur-xl"
          >
            <div className="container px-4 py-3 sm:px-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 h-4 w-4 text-[#F5C76A]" />
                <input
                  type="text"
                  placeholder="ভিডিও লেকচার, সাজেশন বা নোট অনুসন্ধান করুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl border border-white/15 bg-black/40 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-[#F5C76A] font-bengali"
                  autoFocus
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-1.5 h-8 rounded-lg bg-[#F5C76A] text-[#080A12] font-bold text-xs hover:bg-[#ffd98a] font-bengali"
                >
                  খুঁজুন
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Slide-Out Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/10 bg-[#080A12]/95 backdrop-blur-2xl md:hidden overflow-hidden"
          >
            <div className="container px-4 py-4 flex flex-col gap-1 font-bengali max-h-[80vh] overflow-y-auto">
              {navLinks.map((link) => (
                <div key={link.to}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      location.pathname === link.to
                        ? "bg-[#6C4AE6]/20 text-[#F5C76A] border border-[#F5C76A]/30"
                        : "text-foreground/90 hover:bg-white/5"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>

                  {link.children && (
                    <div className="ml-4 pl-2 border-l border-white/10 flex flex-col gap-1 my-1">
                      {link.children.map((c) => (
                        <Link
                          key={c.to}
                          to={c.to}
                          onClick={() => setMobileOpen(false)}
                          className="px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/5"
                        >
                          {c.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="my-2 border-t border-white/10" />

              {/* Mobile Account Access */}
              {user ? (
                <div className="flex flex-col gap-2">
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full justify-start rounded-xl gap-2 bg-[#16A878] text-white">
                      <GraduationCap className="h-4 w-4" /> শিক্ষার্থী ড্যাশবোর্ড
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full justify-start rounded-xl gap-2">
                        🛡️ অ্যাডমিন প্যানেল
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start rounded-xl gap-2 text-destructive hover:bg-destructive/10"
                    onClick={async () => {
                      await signOut();
                      navigate("/");
                      setMobileOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" /> লগআউট
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full justify-center rounded-xl gap-2">
                      <LogIn className="h-4 w-4" /> লগইন
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full justify-center rounded-xl gap-2 bg-[#16A878] text-white">
                      <UserPlus className="h-4 w-4" /> সাইন আপ
                    </Button>
                  </Link>
                  <Link to="/admin-login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center rounded-xl gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" /> অ্যাডমিন লগইন
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
