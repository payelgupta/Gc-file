import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  BookOpen, 
  Award, 
  Sparkles, 
  Search, 
  ArrowRight, 
  Play, 
  FileText,
  ChevronRight,
  CheckCircle2,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ClassCategory {
  id: string;
  slug: string;
  badge: string;
  title: string;
  level: string;
  desc: string;
  colorTheme: "blue" | "sky" | "orange" | "green" | "teal" | "purple";
  icon: string;
  highlights: string[];
}

const classCategories: ClassCategory[] = [
  {
    id: "hsc",
    slug: "hsc",
    badge: "HSC ২৬ / ২৭ / ২৮",
    title: "উচ্চ মাধ্যমিক (HSC)",
    level: "একাদশ ও দ্বাদশ শ্রেণি",
    desc: "হিসাববিজ্ঞান ১ম ও ২য় পত্র, ফিন্যান্স, ব্যবসায় নীতি, আইসিটি ও সাধারণ বিষয়সমূহের অধ্যায়ভিত্তিক পূর্ণাঙ্গ প্রস্তুতি।",
    colorTheme: "blue",
    icon: "🏆",
    highlights: ["হিসাববিজ্ঞান বিশেষ ক্লাস", "বোর্ড প্রশ্নের সমাধান", "পরীক্ষার বুলেট সাজেশন"]
  },
  {
    id: "ssc",
    slug: "ssc",
    badge: "SSC ২০২৬ / ২০২৭",
    title: "মাধ্যমিক (SSC)",
    level: "নবম ও দশম শ্রেণি",
    desc: "ব্যবসায় শিক্ষা, বিজ্ঞান ও মানবিক বিভাগের সকল বিষয়ের অধ্যায়ভিত্তিক বেসিক ক্লিয়ারিং ও মডেল টেস্ট।",
    colorTheme: "orange",
    icon: "🎓",
    highlights: ["জাবেদা ও খতিয়ান বেসিক", "সৃজনশীল প্রশ্নের সহজ কৌশল", "মডেল টেস্ট ও শিট"]
  },
  {
    id: "class-6-8",
    slug: "class-6-8",
    badge: "Class ৬ – ৮",
    title: "জুনিয়র মাধ্যমিক",
    level: "ষষ্ঠ, সপ্তম ও অষ্টম শ্রেণি",
    desc: "নতুন কারিকুলাম অনুসারে গণিত, বিজ্ঞান, ইংরেজি ও বাংলা বিষয়ের সহজবোধ্য আলোচনা ও শিট।",
    colorTheme: "green",
    icon: "📖",
    highlights: ["নতুন কারিকুলাম সমাধান", "গণিতের বেসিক ফাউন্ডেশন", "ইংরেজি গ্রামার স্পেশাল"]
  },
  {
    id: "class-1-5",
    slug: "class-1-5",
    badge: "Class ১ – ৫",
    title: "প্রাথমিক শিক্ষা",
    level: "১ম থেকে ৫ম শ্রেণি",
    desc: "ছোট্ট সোনামণিদের জন্য আনন্দের সাথে বর্ণমালা, মৌলিক গণিত, ইংরেজি ও সাধারণ জ্ঞান শেখার প্ল্যাটফর্ম।",
    colorTheme: "teal",
    icon: "📚",
    highlights: ["সহজ চিত্রসহ পাঠ", "প্রাথমিক গণিত ও বানান", "বৃত্তি পরীক্ষার গাইডলাইন"]
  },
  {
    id: "honours",
    slug: "honours",
    badge: "HONOURS / DEGREE",
    title: "অনার্স ও ডিগ্রি",
    level: "জাতীয় বিশ্ববিদ্যালয়",
    desc: "অনার্স ১ম, ২য়, ৩য় ও ৪র্থ বর্ষ হিসাববিজ্ঞান বিভাগ এবং ডিগ্রি পাস কোর্সের প্রিন্সিপালস অব অ্যাকাউন্টিং, কস্ট অ্যাকাউন্টিং ও ট্যাক্সেশন।",
    colorTheme: "purple",
    icon: "📘",
    highlights: ["Principles of Accounting", "Cost & Management Accounting", "বিগত বছরের সলিউশন"]
  },
  {
    id: "ma",
    slug: "ma",
    badge: "MA / MBA",
    title: "মাস্টার্স ও প্রফেশনাল",
    level: "মাস্টার্স ও প্রফেশনাল কোর্স",
    desc: "অ্যাকাউন্টিং এ মাস্টার্স, এমবিএ এবং বিভিন্ন ব্যাংকিং ও প্রফেশনাল পরীক্ষার স্পেশালাইজড দিকনির্দেশনা ও স্টাডি নোট।",
    colorTheme: "sky",
    icon: "🎯",
    highlights: ["Advanced Accounting", "Financial Management", "কেস স্টাডি ও থিসিস গাইড"]
  },
];

const themeStyles = {
  blue: {
    border: "border-blue-500/40 hover:border-blue-400",
    bg: "bg-gradient-to-b from-[#1E293B]/90 via-[#0F172A] to-[#0B1026]",
    glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]",
    badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    buttonBg: "bg-blue-600 hover:bg-blue-500",
  },
  sky: {
    border: "border-sky-500/40 hover:border-sky-400",
    bg: "bg-gradient-to-b from-[#0F172A]/90 via-[#082F49]/40 to-[#0B1026]",
    glow: "hover:shadow-[0_0_30px_rgba(56,189,248,0.3)]",
    badgeBg: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    buttonBg: "bg-sky-600 hover:bg-sky-500",
  },
  orange: {
    border: "border-amber-500/40 hover:border-amber-400",
    bg: "bg-gradient-to-b from-[#1C1917]/90 via-[#292524]/50 to-[#0B1026]",
    glow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.3)]",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    buttonBg: "bg-amber-600 hover:bg-amber-500",
  },
  green: {
    border: "border-emerald-500/40 hover:border-emerald-400",
    bg: "bg-gradient-to-b from-[#064E3B]/40 via-[#022C22]/60 to-[#0B1026]",
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    buttonBg: "bg-emerald-600 hover:bg-emerald-500",
  },
  teal: {
    border: "border-teal-500/40 hover:border-teal-400",
    bg: "bg-gradient-to-b from-[#134E4A]/40 via-[#042F2E]/60 to-[#0B1026]",
    glow: "hover:shadow-[0_0_30px_rgba(20,184,166,0.3)]",
    badgeBg: "bg-teal-500/20 text-teal-300 border-teal-500/40",
    buttonBg: "bg-teal-600 hover:bg-teal-500",
  },
  purple: {
    border: "border-purple-500/40 hover:border-purple-400",
    bg: "bg-gradient-to-b from-[#2E1065]/40 via-[#1E1B4B]/60 to-[#0B1026]",
    glow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    buttonBg: "bg-purple-600 hover:bg-purple-500",
  },
};

const Classes = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const fetchCounts = async () => {
      try {
        const { data } = await supabase
          .from("posts")
          .select("category")
          .eq("is_published", true);

        if (data) {
          const counts: Record<string, number> = {};
          data.forEach((p) => {
            if (p.category) {
              counts[p.category] = (counts[p.category] || 0) + 1;
            }
          });
          setCategoryCounts(counts);
        }
      } catch (err) {
        console.error("Failed to load category counts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, []);

  const filteredCategories = classCategories.filter((cat) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.level.toLowerCase().includes(q) ||
      cat.desc.toLowerCase().includes(q) ||
      cat.highlights.some((h) => h.toLowerCase().includes(q))
    );
  });

  const handleSelectClass = (slug: string) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    navigate(`/category/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#080A12] text-foreground font-bengali pb-20">
      {/* Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1026] via-[#090D1C] to-[#080A12] pt-12 pb-16 border-b border-white/10">
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px]" />

        <div className="container relative z-10 px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-[#0B1026]/90 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-300 shadow-lg backdrop-blur-md mb-4"
          >
            <Sparkles className="h-4 w-4 text-[#F5C76A]" />
            <span>জ্ঞানচর্চা'লয় · সকল পাঠ্যক্রম ও কোর্স হাব</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]"
          >
            তোমার শ্রেণি বেছে নিয়ে{" "}
            <span className="text-[#38BDF8] drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
              পড়ালেখা শুরু করো
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-3 text-sm sm:text-lg text-slate-200 font-semibold max-w-2xl mx-auto drop-shadow"
          >
            ক্লাস ১ থেকে শুরু করে এসএসসি, এইচএসসি, জাতীয় বিশ্ববিদ্যালয়ের অনার্স ও মাস্টার্স পর্যন্ত প্রতিটি বিষয়ের সাজানো পাঠ্যক্রম।
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 max-w-xl mx-auto"
          >
            <div className="relative flex items-center rounded-2xl border border-white/20 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl">
              <Search className="h-5 w-5 text-[#10B981] ml-3 shrink-0" />
              <input
                type="text"
                placeholder="শ্রেণি, বিষয় বা কোর্স খুঁজুন (যেমন: এইচএসসি, হিসাববিজ্ঞান, এসএসসি)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none font-bengali"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-xs px-2.5 py-1 text-slate-400 hover:text-white"
                >
                  মুছুন
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Grid of Classes */}
      <div className="container px-4 sm:px-6 pt-12 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[#10B981]" />
              <span>উপলব্ধ সকল অ্যাকাডেমিক স্তর</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              পছন্দের ক্লাসে ক্লিক করে সরাসরি অধ্যায়ভিত্তিক ভিডিও ক্লাস ও সাজেশন সংগ্রহ করুন
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> ১০০% ফ্রি ও গোছানো
          </span>
        </div>

        {filteredCategories.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-md mx-auto">
            <BookOpen className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">কোনো কোর্স পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1">অন্য কোনো কি-ওয়ার্ড দিয়ে সার্চ করে দেখুন</p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white"
            >
              সকল কোর্স দেখুন
            </button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((cat, idx) => {
              const style = themeStyles[cat.colorTheme];
              const postCount = categoryCounts[cat.slug] || 0;

              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06 }}
                  whileHover={{ y: -6 }}
                  onClick={() => handleSelectClass(cat.slug)}
                  className={`group relative flex flex-col justify-between rounded-3xl border ${style.border} ${style.bg} p-6 shadow-xl cursor-pointer transition-all duration-300 ${style.glow}`}
                >
                  <div>
                    {/* Top row: Icon & Badge */}
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        {cat.icon}
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-bold border ${style.badgeBg}`}>
                        {cat.badge}
                      </span>
                    </div>

                    {/* Title & Level */}
                    <h3 className="text-xl font-black text-white group-hover:text-[#F5C76A] transition-colors drop-shadow-sm">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-300 font-bold mt-0.5">
                      {cat.level}
                    </p>

                    {/* Description */}
                    <p className="mt-3 text-xs leading-relaxed text-slate-200 font-medium">
                      {cat.desc}
                    </p>

                    {/* Highlights list */}
                    <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
                      {cat.highlights.map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-slate-300">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Bar */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                    <span className="text-xs text-slate-300 font-semibold">
                      {loading ? "লোড হচ্ছে..." : `${postCount.toLocaleString("bn-BD")} টি লেকচার`}
                    </span>
                    <button
                      className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md transition-all ${style.buttonBg}`}
                    >
                      <span>ক্লাসে প্রবেশ</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Quick Assistance Banner */}
        <div className="mt-16 rounded-3xl border border-[#F5C76A]/30 bg-gradient-to-r from-amber-950/30 via-slate-900/60 to-emerald-950/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#F5C76A]/20 text-[#F5C76A] border border-[#F5C76A]/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                কোন ক্লাসে ভর্তি হবেন বুঝতে পারছেন না?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                আমাদের এআই স্টাডি শিক্ষক বা সুজয় স্যারের সাথে সরাসরি যোগাযোগ করুন।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/contact"
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 transition-all"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classes;
