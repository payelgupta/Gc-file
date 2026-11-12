import React from "react";
import { motion } from "framer-motion";
import { 
  PlayCircle, 
  BookOpen, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  HelpCircle,
  FileCheck2
} from "lucide-react";

export const BatchPerksGrid: React.FC = () => {
  return (
    <section className="py-12 sm:py-16 bg-[#0B1026] text-white font-bengali border-t border-white/5 relative overflow-hidden">
      <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Section Heading matching Pages 16 & 43 of PDF */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            অনলাইন ব্যাচের শিক্ষার্থীরা পাচ্ছে
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-200 font-semibold drop-shadow-sm">
            সম্পূর্ণ ডিজিটাল প্রস্তুতি নিশ্চিত করতে প্রতিটি কোর্সের সাথে সেরা সব উপকরণ
          </p>
        </div>

        {/* 4-Card Grid from PDF */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          
          {/* Card 1: Live & Recorded Class Count */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/15 p-5 flex flex-col items-center justify-between text-center shadow-xl relative overflow-hidden group"
          >
            <div className="flex items-center gap-1.5 text-xs text-rose-400 font-bold mb-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span>((•)) লাইভ ও রেকর্ডেড</span>
            </div>
            
            <div className="my-3">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 drop-shadow-md">
                ১,০০০+
              </span>
            </div>

            <span className="text-xs sm:text-sm font-bold text-white drop-shadow-sm">
              অধ্যায়ভিত্তিক সহজ ভিডিও ক্লাস
            </span>
          </motion.div>

          {/* Card 2: Masterbook & Extra Notes */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/15 p-5 flex flex-col items-center justify-between text-center shadow-xl group"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2 shadow-inner">
              <BookOpen className="h-7 w-7" />
            </div>

            <div className="my-2">
              <h3 className="text-sm sm:text-base font-black text-amber-300 drop-shadow-sm">
                প্রিন্টেড ও পিডিএফ মাস্টারবুক
              </h3>
            </div>

            <span className="text-xs sm:text-sm text-slate-200 font-semibold drop-shadow-sm">
              ও সাথে পরীক্ষার সেরা এক্সট্রা হ্যান্ডনোটস
            </span>
          </motion.div>

          {/* Card 3: SuperPrep */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/15 p-5 flex flex-col items-center justify-between text-center shadow-xl group"
          >
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-2">
              <FileCheck2 className="h-4 w-4" />
              <span>SuperPrep</span>
            </div>

            <div className="my-2">
              <h3 className="text-sm sm:text-base font-black text-emerald-300 drop-shadow-sm">
                আনলিমিটেড MCQ ও টেস্ট
              </h3>
            </div>

            <span className="text-xs sm:text-sm text-slate-200 font-semibold drop-shadow-sm">
              বোর্ড সল্যুশন ও ফুল মডেল টেস্টের প্র্যাকটিস
            </span>
          </motion.div>

          {/* Card 4: SuperSolve AI */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/15 p-5 flex flex-col items-center justify-between text-center shadow-xl group"
          >
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-bold mb-2">
              <Sparkles className="h-4 w-4" />
              <span>SuperSolve</span>
            </div>

            <div className="my-2">
              <h3 className="text-sm sm:text-base font-black text-sky-300 drop-shadow-sm">
                ২৪ ঘণ্টা ডাউট সলভ
              </h3>
            </div>

            <span className="text-xs sm:text-sm text-slate-200 font-semibold drop-shadow-sm">
              তোমার সার্বক্ষণিক স্টাডি পার্টনার AI শিক্ষক
            </span>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default BatchPerksGrid;
