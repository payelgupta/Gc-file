import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ChevronRight, 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  Trophy, 
  Gift,
  ArrowRight
} from "lucide-react";

interface BatchLink {
  title: string;
  hasGift?: boolean;
  categorySlug: string;
}

interface BatchSection {
  id: string;
  categoryTitle: string;
  subgroups: {
    groupName?: string;
    links: BatchLink[];
  }[];
}

const batchData: BatchSection[] = [
  {
    id: "class-6-8",
    categoryTitle: "ক্লাস ৬-৮ অনলাইন ব্যাচ ২০২৬",
    subgroups: [
      {
        links: [
          { title: "৬ষ্ঠ শ্রেণি", categorySlug: "class-6-8" },
          { title: "৭ম শ্রেণি", categorySlug: "class-6-8" },
          { title: "৮ম শ্রেণি", categorySlug: "class-6-8" },
        ]
      }
    ]
  },
  {
    id: "ssc",
    categoryTitle: "এসএসসি অনলাইন ব্যাচ",
    subgroups: [
      {
        groupName: "নবম শ্রেণি (এসএসসি ২০২৮)",
        links: [
          { title: "বিজ্ঞান বান্ডেল", hasGift: true, categorySlug: "ssc" },
          { title: "ব্যবসায় শিক্ষা ও মানবিক বান্ডেল", hasGift: true, categorySlug: "ssc" },
          { title: "বাংলা, ইংরেজি, তথ্য ও যোগাযোগ প্রযুক্তি বান্ডেল", hasGift: true, categorySlug: "ssc" },
        ]
      },
      {
        groupName: "দশম শ্রেণি (এসএসসি ২০২৭)",
        links: [
          { title: "বিজ্ঞান বান্ডেল", hasGift: true, categorySlug: "ssc" },
          { title: "ব্যবসায় শিক্ষা স্পেশাল বান্ডেল", hasGift: true, categorySlug: "ssc" },
          { title: "শেষ মুহূর্তের প্রস্তুতি কোর্স [বিজ্ঞান]", hasGift: true, categorySlug: "ssc" },
          { title: "শেষ মুহূর্তের প্রস্তুতি কোর্স [ব্যবসায় শিক্ষা]", hasGift: true, categorySlug: "ssc" },
        ]
      }
    ]
  },
  {
    id: "hsc",
    categoryTitle: "এইচএসসি অনলাইন ব্যাচ",
    subgroups: [
      {
        groupName: "এইচএসসি ২০২৭ / ২০২৮",
        links: [
          { title: "হিসাববিজ্ঞান ও ফিন্যান্স স্পেশাল", hasGift: true, categorySlug: "hsc" },
          { title: "পদার্থ, রসায়ন, গণিত, জীববিজ্ঞান", hasGift: true, categorySlug: "hsc" },
          { title: "বাংলা, ইংরেজি, তথ্য ও যোগাযোগ প্রযুক্তি ২.০", hasGift: true, categorySlug: "hsc" },
          { title: "ম্যানেজমেন্ট ও মার্কেটিং বুস্টার", hasGift: true, categorySlug: "hsc" },
        ]
      }
    ]
  },
  {
    id: "varsity",
    categoryTitle: "এডমিশন, ডিগ্রি ও জাতীয় বিশ্ববিদ্যালয়",
    subgroups: [
      {
        groupName: "বিশ্ববিদ্যালয় ভর্তি ও অনার্স প্রস্তুতি",
        links: [
          { title: "C Unit (ব্যবসায় শিক্ষা স্পেশাল)", categorySlug: "honours" },
          { title: "A Unit + B Unit সাধারণ জ্ঞান ও ইংরেজি", categorySlug: "honours" },
          { title: "জাতীয় বিশ্ববিদ্যালয় অনার্স হিসাববিজ্ঞান ১ম–৪র্থ বর্ষ", categorySlug: "honours" },
          { title: "ডিগ্রি ও মাস্টার্স (MBA) স্পেশালাইজড প্রোগ্রাম", categorySlug: "ma" },
        ]
      }
    ]
  }
];

export const AcademicBatchExplorer: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>("hsc");

  const handleLinkClick = (slug: string) => {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    navigate(`/category/${slug}`);
  };

  const currentSection = batchData.find((s) => s.id === activeTab) || batchData[1];

  return (
    <section className="py-12 sm:py-16 bg-[#080A12] text-white font-bengali border-t border-white/5 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-80 w-full max-w-4xl bg-[#10B981]/5 blur-[120px]" />

      <div className="container px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
        
        {/* Section Heading matching Pages 10 & 42 of PDF */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 mb-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span>লাইভ ও রেকর্ডেড ক্লাস কোর্স</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            দেশসেরা সকল অনলাইন ব্যাচ
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-200 font-semibold drop-shadow-sm">
            জ্ঞানচর্চা'লয়-এর বিভিন্ন কোর্সে এই মুহূর্তে যুক্ত হাজারো Academic শিক্ষার্থীর একজন হও তুমিও!
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {batchData.map((section) => {
            const isActive = activeTab === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(section.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                    : "bg-[#1E293B] text-slate-200 hover:bg-[#28354D] hover:text-white border border-white/10"
                }`}
              >
                {section.categoryTitle}
              </button>
            );
          })}
        </div>

        {/* Batch List Card Container matching Pages 11-15 & 42 */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl bg-gradient-to-b from-[#13192B] to-[#0A0E1A] border border-white/15 p-5 sm:p-8 shadow-2xl relative"
        >
          {/* Subtle Corner Badge / Illustration Graphic */}
          <div className="absolute right-6 top-6 opacity-20 pointer-events-none hidden md:block">
            <GraduationCap className="h-32 w-32 text-emerald-400" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-emerald-300 mb-5 flex items-center gap-2 drop-shadow-sm">
            <span>{currentSection.categoryTitle}</span>
          </h3>

          <div className="space-y-6">
            {currentSection.subgroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                {group.groupName && (
                  <h4 className="text-sm sm:text-base font-bold text-amber-300 pl-1">
                    {group.groupName}
                  </h4>
                )}

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {group.links.map((link, lIdx) => (
                    <motion.div
                      key={lIdx}
                      whileHover={{ scale: 1.01, x: 3 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleLinkClick(link.categorySlug)}
                      className="group flex items-center justify-between rounded-2xl bg-[#1B2338] hover:bg-[#24304E] border border-white/10 hover:border-emerald-500/60 p-4 transition-all duration-200 cursor-pointer shadow-md"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {link.hasGift && (
                          <span className="text-lg shrink-0">🎁</span>
                        )}
                        <span className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                          {link.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 text-slate-300 group-hover:text-emerald-400 font-bold text-xs pl-2">
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Fast Action */}
          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-200 font-medium text-center sm:text-left">
              * প্রতিটি ব্যাচে রয়েছে সুজয় স্যারের সম্পূর্ণ হ্যান্ডনোট, ভিডিও ক্লাস এবং বুলেট সাজেশন।
            </p>
            <button
              onClick={() => handleLinkClick(currentSection.id)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg transition-all duration-300 cursor-pointer"
            >
              <span>এই ব্যাচের সকল ক্লাস ও নোট দেখুন</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default AcademicBatchExplorer;
