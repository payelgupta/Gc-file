import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Download, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  FileText,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"posts">;

interface MaterialStoreGridProps {
  pdfPosts: Post[];
  onSelectPost?: (post: Post) => void;
}

export const MaterialStoreGrid: React.FC<MaterialStoreGridProps> = ({
  pdfPosts,
  onSelectPost
}) => {
  const [selectedTab, setSelectedTab] = useState("all");

  const filterTabs = [
    { id: "all", label: "সব" },
    { id: "hsc", label: "এইচএসসি" },
    { id: "ssc", label: "এসএসসি" },
    { id: "class-6-8", label: "অষ্টম শ্রেণি" },
    { id: "honours", label: "অনার্স ও অন্যান্য" },
  ];

  const filteredItems = pdfPosts.filter((post) => {
    if (selectedTab === "all") return true;
    return post.category?.toLowerCase() === selectedTab.toLowerCase();
  });

  return (
    <section className="py-14 sm:py-20 bg-[#0B1026] text-white font-bengali border-t border-white/5 relative overflow-hidden">
      <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Section Heading matching Pages 31 & 47 of PDF */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 mb-2 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>জ্ঞানচর্চা'লয় বুক স্টোর</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            সেরা শিক্ষার্থীদের প্রয়োজনীয় উপকরণ
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-200 font-semibold drop-shadow-sm">
            হ্যান্ডনোট, বুলেট সাজেশন ও সম্পূর্ণ ই-বুক কালেকশন
          </p>
        </div>

        {/* Filter Pills matching Page 31 & 35 */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = selectedTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                    : "bg-[#1E293B] text-slate-200 hover:bg-[#28354D] hover:text-white border border-white/10"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Books & Notes Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-slate-900/60 border border-white/10 p-6">
            <BookOpen className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-200">এই বিভাগে শীঘ্রই নতুন বই ও নোট যুক্ত হবে।</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredItems.map((item, idx) => {
              const isPaid = (item as any).is_paid || (item as any).is_premium || ((item as any).price && Number((item as any).price) > 0);
              const price = (item as any).price || 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-gradient-to-b from-[#182035] to-[#0E1424] border border-white/15 p-4 flex flex-col justify-between shadow-xl group hover:border-emerald-500/50 transition-all duration-300"
                >
                  {/* Book Mockup Visual Container matching PDF */}
                  <div className="w-full aspect-[3/4] rounded-2xl bg-gradient-to-b from-[#253252] via-[#1A233A] to-[#12192B] border border-white/15 flex flex-col items-center justify-center p-3 relative overflow-hidden mb-3 shadow-inner group-hover:scale-102 transition-transform">
                    {item.image_url ? (
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <div className="text-center flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/30">
                          <FileText className="h-6 w-6" />
                        </div>
                        <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">
                          {item.category?.toUpperCase() || "ACADEMIC"}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-white px-2 mt-1 line-clamp-2 drop-shadow-sm">
                          {item.title}
                        </span>
                      </div>
                    )}

                    {/* Book Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className="rounded-lg bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shadow">
                        পিডিএফ বুক
                      </span>
                    </div>
                  </div>

                  {/* Title & Price info */}
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 group-hover:text-emerald-300 transition-colors drop-shadow-sm">
                      {item.title}
                    </h3>

                    <div className="mt-2.5 flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-400">
                        {isPaid ? `৳ ${price}` : "বিনামূল্যে (Free)"}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => onSelectPost && onSelectPost(item)}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white py-2 px-3 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {isPaid ? (
                      <>
                        <Lock className="h-3 w-3 text-amber-300" />
                        <span>আনলক করুন</span>
                      </>
                    ) : (
                      <>
                        <Download className="h-3.5 w-3.5" />
                        <span>ডাউনলোড করুন</span>
                      </>
                    )}
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default MaterialStoreGrid;
