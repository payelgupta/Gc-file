import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Bell, 
  Palette, 
  Settings, 
  ImageIcon, 
  KeyRound, 
  ShieldCheck, 
  LucideIcon, 
  AlertCircle,
  PlusCircle,
  ExternalLink,
  Activity,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Database,
  Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Notice = Tables<"notices">;

// Modern Cosmic News Ticker Component
const NewsTicker = ({ notices }: { notices: Notice[] }) => {
  if (notices.length === 0) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0B1026]/80 p-3.5 px-5 text-slate-300 text-xs sm:text-sm backdrop-blur-md">
        <span className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          বর্তমানে কোনো সক্রিয় নোটিশ নেই
        </span>
        <Link 
          to="/admin/notices" 
          className="text-xs font-semibold text-[#F5C76A] hover:underline flex items-center gap-1"
        >
          নতুন নোটিশ যোগ করুন <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#0B1026] via-[#111736] to-[#0B1026] shadow-[0_4px_25px_rgba(0,0,0,0.5)] backdrop-blur-md">
      <div className="flex items-center">
        {/* Breaking News Label */}
        <div className="z-10 flex shrink-0 items-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 px-4 py-3 text-white font-bold text-xs sm:text-sm shadow-md">
          <AlertCircle className="h-4 w-4 animate-bounce" />
          <span>লাইভ নোটিশ</span>
        </div>
        
        {/* Ticker Content */}
        <div className="flex-1 overflow-hidden py-3">
          <motion.div
            className="flex whitespace-nowrap"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: Math.max(notices.length * 9, 20),
                ease: "linear",
              },
            }}
          >
            {[...notices, ...notices].map((notice, index) => (
              <span key={`${notice.id}-${index}`} className="mx-8 inline-flex items-center gap-2.5">
                {notice.is_urgent ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/50 px-2 py-0.5 text-[10px] font-bold text-rose-300 animate-pulse">
                    জরুরি
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
                <span className={`text-xs sm:text-sm font-semibold tracking-wide ${notice.is_urgent ? "text-rose-200" : "text-white"}`}>
                  {notice.title}
                </span>
                <span className="text-white/20">•</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Quick manage link */}
        <div className="z-10 hidden sm:flex shrink-0 items-center px-4 border-l border-white/10">
          <Link
            to="/admin/notices"
            className="text-xs font-semibold text-[#F5C76A] hover:text-white transition-colors flex items-center gap-1"
          >
            ম্যানেজ <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

// Unique hover/click animations per quick link
const linkAnimations: Record<string, {
  hover: object;
  tap: object;
  iconHover: object;
  glow: string;
  badge: string;
}> = {
  "/admin/posts": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { rotate: [0, -10, 10, -5, 0], scale: [1, 1.15, 1] },
    glow: "hover:border-emerald-400/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  },
  "/admin/notices": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { rotate: [0, 15, -15, 10, 0], y: [0, -6, 0] },
    glow: "hover:border-amber-400/50 hover:shadow-[0_0_25px_rgba(245,199,106,0.25)]",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  },
  "/admin/unlock-requests": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { scale: [1, 1.25, 1] },
    glow: "hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
  },
  "/admin/hero-settings": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { scale: [1, 1.2, 0.95, 1], rotate: [0, 8, -8, 0] },
    glow: "hover:border-purple-400/50 hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]",
    badge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
  },
  "/admin/theme": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { rotate: [0, 360], scale: [1, 1.2, 1] },
    glow: "hover:border-pink-400/50 hover:shadow-[0_0_25px_rgba(236,72,153,0.25)]",
    badge: "bg-pink-500/20 text-pink-300 border-pink-500/40",
  },
  "/admin/settings": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { rotate: [0, 90, 180, 270, 360] },
    glow: "hover:border-blue-400/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]",
    badge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  },
  "/admin/account": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { y: [0, -8, 0], rotate: [0, -15, 15, 0] },
    glow: "hover:border-rose-400/50 hover:shadow-[0_0_25px_rgba(244,63,94,0.25)]",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/40",
  },
  "/admin/download-requests": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { scale: [1, 0.85, 1.2, 1] },
    glow: "hover:border-teal-400/50 hover:shadow-[0_0_25px_rgba(20,184,166,0.25)]",
    badge: "bg-teal-500/20 text-teal-300 border-teal-500/40",
  },
  "/admin/gallery": {
    hover: { scale: 1.02, y: -4 },
    tap: { scale: 0.97 },
    iconHover: { rotate: [0, -10, 10, 0] },
    glow: "hover:border-indigo-400/50 hover:shadow-[0_0_25px_rgba(99,102,241,0.25)]",
    badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
  },
};

const QuickLinkCard = ({ 
  link, 
  index 
}: { 
  link: { label: string; to: string; icon: LucideIcon; desc: string; category?: string }; 
  index: number 
}) => {
  const anim = linkAnimations[link.to] || linkAnimations["/admin/posts"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.05, duration: 0.35 }}
      whileHover={anim.hover as any}
      whileTap={anim.tap as any}
      className="relative"
    >
      <Link
        to={link.to}
        className={`group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-gradient-to-b from-[#0E152F]/90 via-[#0B1026] to-[#070913] p-4 sm:p-5 transition-all duration-300 shadow-lg ${anim.glow}`}
      >
        <div className="flex items-start justify-between gap-3">
          <motion.div
            whileHover={anim.iconHover as any}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20 transition-all shadow-inner"
          >
            <link.icon className="h-5 w-5 text-white transition-transform duration-200 group-hover:scale-110" />
          </motion.div>
          {link.category && (
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${anim.badge}`}>
              {link.category}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm sm:text-base font-bold text-white transition-colors group-hover:text-[#F5C76A]">
              {link.label}
            </p>
            <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#F5C76A] group-hover:translate-x-1 transition-all" />
          </div>
          <p className="mt-1 text-xs text-slate-300 font-medium">
            {link.desc}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

const AdminHome = () => {
  const [counts, setCounts] = useState({ 
    posts: 0, 
    notices: 0,
    unlocks: 0,
    gallery: 0 
  });
  const [latestNotices, setLatestNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { count: postCount }, 
          { count: noticeCount },
          { data: notices }
        ] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }),
          supabase.from("notices").select("*", { count: "exact", head: true }),
          supabase.from("notices").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(10),
        ]);

        // Attempt optional counts
        let unlockCount = 0;
        let galleryCount = 0;
        try {
          const { count: uc } = await (supabase.from("unlock_requests") as any).select("*", { count: "exact", head: true });
          unlockCount = uc || 0;
        } catch {
          // ignore if table doesn't exist yet
        }
        try {
          const { count: gc } = await (supabase.from("photo_gallery") as any).select("*", { count: "exact", head: true });
          galleryCount = gc || 0;
        } catch {
          // ignore if table doesn't exist yet
        }

        setCounts({ 
          posts: postCount || 0, 
          notices: noticeCount || 0,
          unlocks: unlockCount,
          gallery: galleryCount 
        });
        setLatestNotices(notices || []);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { 
      label: "মোট পোস্ট ও লেকচার", 
      value: counts.posts, 
      sub: "ক্লাস ১ থেকে মাস্টার্স",
      icon: FileText, 
      accent: "from-emerald-500 to-teal-600",
      border: "border-emerald-500/30",
      glow: "shadow-[0_0_20px_rgba(16,185,129,0.2)]"
    },
    { 
      label: "সক্রিয় নোটিশ", 
      value: counts.notices, 
      sub: "লাইভ স্ক্রল ঘোষণা",
      icon: Bell, 
      accent: "from-amber-500 to-orange-600",
      border: "border-amber-500/30",
      glow: "shadow-[0_0_20px_rgba(245,199,106,0.2)]"
    },
    { 
      label: "PDF আনলক রিকোয়েস্ট", 
      value: counts.unlocks, 
      sub: "bKash / Nagad যাচাই",
      icon: ShieldCheck, 
      accent: "from-cyan-500 to-blue-600",
      border: "border-cyan-500/30",
      glow: "shadow-[0_0_20px_rgba(56,189,248,0.2)]"
    },
    { 
      label: "গ্যালারি ছবি", 
      value: counts.gallery, 
      sub: "অ্যাকাডেমিক কালেকশন",
      icon: ImageIcon, 
      accent: "from-purple-500 to-pink-600",
      border: "border-purple-500/30",
      glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]"
    },
  ];

  const quickLinks = [
    { label: "পোস্ট ও কনটেন্ট", to: "/admin/posts", icon: FileText, desc: "নতুন স্টাডি মেটেরিয়াল, ভিডিও ও PDF যোগ করুন", category: "একাডেমিক" },
    { label: "নোটিশ বোর্ড", to: "/admin/notices", icon: Bell, desc: "পরীক্ষার আপডেট ও গুরুত্বপূর্ণ ঘোষণা ম্যানেজ করুন", category: "যোগাযোগ" },
    { label: "পেইড PDF আনলক", to: "/admin/unlock-requests", icon: ShieldCheck, desc: "শিক্ষার্থীদের পেমেন্ট রিকোয়েস্ট অনুমোদন করুন", category: "পেমেন্ট" },
    { label: "ডাউনলোড হিস্টোরি", to: "/admin/download-requests", icon: ShieldCheck, desc: "ফ্রি ও পেইড শিট ডাউনলোড লগ পর্যবেক্ষণ করুন", category: "লগ" },
    { label: "হিরো ব্যাকগ্রাউন্ড", to: "/admin/hero-settings", icon: ImageIcon, desc: "হোমপেজের মূল ব্যাকগ্রাউন্ড ও ব্যানার আপডেট করুন", category: "ডিজাইন" },
    { label: "ফটো গ্যালারি", to: "/admin/gallery", icon: ImageIcon, desc: "ক্লাসরুম ও অ্যাওয়ার্ড অনুষ্ঠানের ছবি পরিচালনা করুন", category: "মিডিয়া" },
    { label: "থিম ও লুক", to: "/admin/theme", icon: Palette, desc: "প্ল্যাটফর্মের রঙ, বাটন স্টাইল ও ফন্ট পরিবর্তন করুন", category: "স্টাইলিং" },
    { label: "সাইট সেটিংস", to: "/admin/settings", icon: Settings, desc: "কন্টাক্ট ইনফো, সোশ্যাল লিংক ও শিরোনাম কনফিগার করুন", category: "কোর" },
    { label: "অ্যাকাউন্ট সিকিউরিটি", to: "/admin/account", icon: KeyRound, desc: "অ্যাডমিন পাসওয়ার্ড ও লগিন নিরাপত্তা নিশ্চিত করুন", category: "নিরাপত্তা" },
  ];

  return (
    <div className="space-y-8 pb-12 font-bengali">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-semibold text-emerald-400 mb-2"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>জ্ঞানচর্চা'লয় অ্যাডমিন হাব • কন্ট্রোল সেন্টার</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-black text-white tracking-tight"
          >
            অ্যাডমিন ড্যাশবোর্ড
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mt-1 text-xs sm:text-sm text-slate-300 font-medium"
          >
            সুজয় স্যারের জ্ঞানচর্চা'লয় ডিজিটাল শিক্ষাপ্লাটফর্মের সার্বিক কার্যক্রম পরিচালনা করুন।
          </motion.p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/gyan-prakasha-path-security-remediated-2026-11-10.zip"
            download="gyan-prakasha-path-security-remediated-2026-11-10.zip"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-300 hover:bg-amber-500/25 transition-all shadow-[0_0_15px_rgba(245,199,106,0.2)]"
            title="সম্পূর্ণ সিকিউরিটি প্যাচ ও সোর্স কোড জিপ ডাউনলোড করুন"
          >
            <Download className="h-4 w-4 text-amber-400" /> সিকিউরিটি ZIP (৬.৫ MB)
          </a>
          <Link
            to="/admin/posts"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 active:scale-95 transition-all"
          >
            <PlusCircle className="h-4 w-4" /> নতুন পোস্ট
          </Link>
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-all"
          >
            লাইভ ওয়েবসাইট <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* News Ticker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <NewsTicker notices={latestNotices} />
      </motion.div>

      {/* Stats KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#F5C76A]" /> ওভারভিউ ও সার্বিক পরিসংখ্যান
          </h2>
          <span className="text-[11px] text-slate-400">রিয়েল-টাইম ডাটাবেস সিঙ্ক</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`rounded-2xl border ${stat.border} bg-gradient-to-b from-[#0E152F]/90 via-[#0B1026] to-[#070913] p-5 cursor-default transition-all duration-300 ${stat.glow}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr ${stat.accent} shadow-md`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white tracking-tight">
                    {stat.value.toLocaleString("bn-BD")}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {stat.sub}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs font-bold text-white/90">
                  {stat.label}
                </span>
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* System Status Banner */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-cyan-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              সিস্টেম স্ট্যাটাস: অল সার্ভিসেস নরমাল
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Supabase ডাটাবেস সক্রিয় • সিকিউর অ্যাডমিন অথেন্টিকেশন সক্রিয় • রয়্যাল GC AI কোর প্রস্তুত
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/admin/ai-command"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#F5C76A]/40 bg-[#F5C76A]/10 px-3.5 py-1.5 text-xs font-bold text-[#F5C76A] hover:bg-[#F5C76A]/20 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI কমান্ড সেন্টার
          </Link>
        </div>
      </div>

      {/* Quick Access Menu */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <span>⚡ দ্রুত কার্যতালিকা (Quick Actions)</span>
          </h2>
          <span className="text-xs text-slate-400">প্রতিটি ফিচার এক ক্লিকে</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link, i) => (
            <QuickLinkCard key={link.to} link={link} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
