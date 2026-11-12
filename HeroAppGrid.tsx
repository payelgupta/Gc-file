import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Trophy, 
  Play,
  CheckCircle2
} from "lucide-react";

interface ClassCardItem {
  id: string;
  badgeText: string;
  badgeNumber: string;
  title: string;
  categorySlug: string;
  colorTheme: "blue" | "sky" | "orange" | "green" | "teal" | "purple";
  icon: string;
}

const academicCards: ClassCardItem[] = [
  {
    id: "hsc-26",
    badgeText: "HSC",
    badgeNumber: "২৬",
    title: "HSC ২৬",
    categorySlug: "hsc",
    colorTheme: "blue",
    icon: "🏆"
  },
  {
    id: "hsc-27",
    badgeText: "HSC",
    badgeNumber: "২৭",
    title: "HSC ২৭",
    categorySlug: "hsc",
    colorTheme: "sky",
    icon: "🎯"
  },
  {
    id: "hsc-28",
    badgeText: "HSC",
    badgeNumber: "২৮",
    title: "HSC ২৮",
    categorySlug: "hsc",
    colorTheme: "blue",
    icon: "📘"
  },
  {
    id: "ssc-27",
    badgeText: "SSC",
    badgeNumber: "২৭",
    title: "দশম শ্রেণি / এসএসসি",
    categorySlug: "ssc",
    colorTheme: "orange",
    icon: "🎓"
  },
  {
    id: "class-9",
    badgeText: "CLASS",
    badgeNumber: "৯",
    title: "৯ম শ্রেণি",
    categorySlug: "class-6-8",
    colorTheme: "green",
    icon: "📖"
  },
  {
    id: "class-5-8",
    badgeText: "CLASS",
    badgeNumber: "১-৮",
    title: "১ম থেকে ৮ম শ্রেণি",
    categorySlug: "class-1-5",
    colorTheme: "teal",
    icon: "📚"
  },
];

const themeStyles = {
  blue: {
    border: "border-[#1D4ED8]/60 hover:border-[#3B82F6]",
    bg: "bg-gradient-to-b from-[#1E293B]/90 via-[#0F172A] to-[#0B1026]",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.25)]",
    innerBadge: "bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white border border-[#60A5FA]/40",
    textColor: "text-[#60A5FA]"
  },
  sky: {
    border: "border-[#0284C7]/60 hover:border-[#38BDF8]",
    bg: "bg-gradient-to-b from-[#0F172A]/90 via-[#082F49]/40 to-[#0B1026]",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.25)]",
    innerBadge: "bg-gradient-to-br from-[#0284C7] to-[#0369A1] text-white border border-[#38BDF8]/40",
    textColor: "text-[#38BDF8]"
  },
  orange: {
    border: "border-[#D97706]/60 hover:border-[#F59E0B]",
    bg: "bg-gradient-to-b from-[#1C1917]/90 via-[#292524]/50 to-[#0B1026]",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.25)]",
    innerBadge: "bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white border border-[#FDE68A]/40",
    textColor: "text-[#F59E0B]"
  },
  green: {
    border: "border-[#059669]/60 hover:border-[#10B981]",
    bg: "bg-gradient-to-b from-[#064E3B]/40 via-[#022C22]/60 to-[#0B1026]",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.25)]",
    innerBadge: "bg-gradient-to-br from-[#10B981] to-[#059669] text-white border border-[#6EE7B7]/40",
    textColor: "text-[#10B981]"
  },
  teal: {
    border: "border-[#0D9488]/60 hover:border-[#14B8A6]",
    bg: "bg-gradient-to-b from-[#134E4A]/40 via-[#042F2E]/60 to-[#0B1026]",
    glow: "shadow-[0_0_20px_rgba(20,184,166,0.25)]",
    innerBadge: "bg-gradient-to-br from-[#14B8A6] to-[#0D9488] text-white border border-[#99F6E4]/40",
    textColor: "text-[#14B8A6]"
  },
  purple: {
    border: "border-[#7C3AED]/60 hover:border-[#8B5CF6]",
    bg: "bg-gradient-to-b from-[#2E1065]/40 via-[#1E1B4B]/60 to-[#0B1026]",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
    innerBadge: "bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] text-white border border-[#C4B5FD]/40",
    textColor: "text-[#C4B5FD]"
  }
};

interface HeroAppGridProps {
  onSearchFocus?: () => void;
}

export const HeroAppGrid: React.FC<HeroAppGridProps> = () => {
  const navigate = useNavigate();
  const [levelTab, setLevelTab] = useState<"school" | "higher">("school");

  const handleCardClick = (slug: string) => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    navigate(`/category/${slug}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto font-bengali text-center">
      {/* Top Banner Tag */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/50 bg-[#0B1026]/95 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-300 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.3)]"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="tracking-wide drop-shadow-sm">জ্ঞানচর্চা'লয় · ডিজিটাল অ্যাকাডেমিক প্ল্যাটফর্ম</span>
      </motion.div>

      {/* Main Punchy Headlines with Crisp High Contrast */}
      <motion.h1 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
      >
        শেখা হোক{" "}
        <span className="text-[#38BDF8] drop-shadow-[0_0_25px_rgba(56,189,248,0.6)]">
          আনন্দে!
        </span>
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-3.5 text-base sm:text-xl lg:text-2xl text-slate-100 max-w-2xl mx-auto font-bold leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
      >
        এক জায়গায় স্কুল, কলেজ ও বিশ্ববিদ্যালয়ের সম্পূর্ণ প্রস্তুতি!
      </motion.p>

      {/* Level Segmented Toggle (School / College & Degree) */}
      <div className="mt-7 flex justify-center">
        <div className="inline-flex rounded-full bg-slate-900/95 p-1.5 border border-white/20 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setLevelTab("school")}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              levelTab === "school"
                ? "bg-gradient-to-r from-[#10B981] via-emerald-500 to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105"
                : "text-slate-200 hover:text-white hover:bg-white/5"
            }`}
          >
            স্কুল ও কলেজ (১ম–এইচএসসি)
          </button>
          <button
            onClick={() => setLevelTab("higher")}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              levelTab === "higher"
                ? "bg-gradient-to-r from-[#10B981] via-emerald-500 to-[#059669] text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105"
                : "text-slate-200 hover:text-white hover:bg-white/5"
            }`}
          >
            অনার্স, ডিগ্রি ও মাস্টার্স
          </button>
        </div>
      </div>

      {/* 3x2 Grid of Rounded Visual Cards */}
      {levelTab === "school" ? (
        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
          {academicCards.map((item, idx) => {
            const style = themeStyles[item.colorTheme];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCardClick(item.categorySlug)}
                className={`group relative cursor-pointer rounded-2xl sm:rounded-3xl p-3 sm:p-5 flex flex-col items-center justify-between border ${style.border} ${style.bg} ${style.glow} shadow-xl transition-all duration-300`}
              >
                {/* Visual Rounded Square Badge inside Card */}
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-1 shadow-lg ${style.innerBadge} group-hover:scale-110 transition-transform`}>
                  <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase opacity-95 leading-none drop-shadow-sm">
                    {item.badgeText}
                  </span>
                  <span className="text-base sm:text-2xl font-black leading-tight drop-shadow-md">
                    {item.badgeNumber}
                  </span>
                </div>

                {/* Card Subtitle */}
                <span className="mt-2.5 sm:mt-3 text-xs sm:text-base font-extrabold text-white tracking-wide text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {item.title}
                </span>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Higher Education Cards */
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
          {[
            {
              id: "honours",
              badgeText: "HONOURS",
              badgeNumber: "অনার্স",
              title: "জাতীয় বিশ্ববিদ্যালয় হিসাববিজ্ঞান",
              slug: "honours",
              theme: "blue" as const
            },
            {
              id: "degree",
              badgeText: "DEGREE",
              badgeNumber: "ডিগ্রি",
              title: "ডিগ্রি পাস কোর্স স্পেশাল",
              slug: "honours",
              theme: "purple" as const
            },
            {
              id: "masters",
              badgeText: "MA / MBA",
              badgeNumber: "মাস্টার্স",
              title: "মাস্টার্স ও প্রফেশনাল অ্যাকাউন্টিং",
              slug: "ma",
              theme: "orange" as const
            }
          ].map((item, idx) => {
            const style = themeStyles[item.theme];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCardClick(item.slug)}
                className={`group relative cursor-pointer rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col items-center justify-between border ${style.border} ${style.bg} ${style.glow} shadow-xl transition-all duration-300`}
              >
                <div className={`w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-1 shadow-lg ${style.innerBadge} group-hover:scale-110 transition-transform`}>
                  <span className="text-[10px] sm:text-xs font-black tracking-wider uppercase opacity-95 leading-none drop-shadow-sm">
                    {item.badgeText}
                  </span>
                  <span className="text-sm sm:text-lg font-black leading-tight mt-0.5 drop-shadow-md">
                    {item.badgeNumber}
                  </span>
                </div>
                <span className="mt-3 text-xs sm:text-base font-extrabold text-white text-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                  {item.title}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Signature 10MS Green Pill Button with Arrow */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-7 sm:mt-9 flex justify-center"
      >
        <button
          onClick={() => handleCardClick("hsc")}
          className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#10B981] via-[#059669] to-[#047857] px-7 sm:px-9 py-3.5 text-sm sm:text-base font-black text-white shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:shadow-[0_0_40px_rgba(16,185,129,0.8)] hover:scale-105 transition-all duration-300 active:scale-95 cursor-pointer"
        >
          <span className="drop-shadow-sm">ফ্রি ক্লাস ও বুলেট সাজেশন</span>
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1.5 transition-transform drop-shadow-sm" />
        </button>
      </motion.div>
    </div>
  );
};

export default HeroAppGrid;
