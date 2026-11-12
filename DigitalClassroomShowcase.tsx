import React from "react";
import { motion } from "framer-motion";
import { 
  Play, 
  CheckCircle2, 
  BarChart3, 
  Sparkles, 
  MessageCircle, 
  HelpCircle,
  Clock,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

export const DigitalClassroomShowcase: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-[#080A12] text-white font-bengali border-t border-white/5 relative overflow-hidden">
      
      {/* Background Nebula Highlights */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[#10B981]/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-[#38BDF8]/10 blur-[130px]" />

      <div className="container px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
        
        {/* Section Headline matching Pages 5 & 41 of PDF */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-md">
            অনলাইনেই শেখা হোক নিজের গতিতে!
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-100 font-bold drop-shadow-sm">
            সুজয় স্যারের সেরা ক্লাস, রেকর্ডেড লেকচার, আর নিরবচ্ছিন্ন প্র্যাকটিস সব অনলাইনে।
          </p>
        </div>

        {/* 3 Interactive Cards matching Pages 5, 6, 7 */}
        <div className="grid gap-6 md:grid-cols-3">
          
          {/* Card 1: SuperLive Class */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0F172A] border border-white/15 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
          >
            {/* Top Preview Frame */}
            <div className="w-full aspect-video rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-white/10 flex items-center justify-center relative overflow-hidden mb-6 shadow-inner">
              <div className="absolute inset-0 bg-[#0B1026]/60 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center">
                <div className="h-12 w-12 rounded-full bg-[#10B981] flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-white ml-0.5" />
                </div>
                <span className="mt-3 text-xs font-bold text-white bg-black/40 px-3 py-1 rounded-full border border-white/10">
                  রেকর্ডেড ও লাইভ ডেমো ক্লাস
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-rose-400 flex items-center gap-2 drop-shadow-sm">
                <span>SuperLive Class</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                অভিজ্ঞ শিক্ষক প্যানেল ও সুজয় স্যারের সাথে লাইভ ক্লাসে অংশ নিন এবং অধ্যায়ভিত্তিক জটিল বিষয় সহজে বুঝে নিন।
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Link 
                to="/videos"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-300 hover:text-emerald-200"
              >
                <span>ভিডিও লেকচার দেখুন</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: SuperPrep */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0F172A] border border-white/15 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
          >
            {/* SuperPrep Syllabus Tracker Mockup */}
            <div className="w-full rounded-2xl bg-white p-4 text-slate-900 mb-6 shadow-xl">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 mb-2">
                <span>হিসাববিজ্ঞান ১ম ও ২য় পত্র</span>
                <span className="text-emerald-700 font-black">SuperPrep</span>
              </div>
              <div className="text-xs font-bold text-slate-900 mb-2">
                বিষয়ভিত্তিক প্রিপারেশন
              </div>

              {/* Progress Stat */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-800 font-semibold">অধ্যায় ৫/৮</span>
                <span className="font-black text-emerald-700">৪৩% সম্পন্ন</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 mt-1.5 overflow-hidden">
                <div className="w-[43%] h-full bg-emerald-600 rounded-full" />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-amber-300 flex items-center gap-2 drop-shadow-sm">
                <span>SuperPrep</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                দৈনিক/সাপ্তাহিক কুইজ, MCQ ব্যাংক এবং ফুল মডেল টেস্টের মাধ্যমে শিখুন এবং আপনার দুর্বলতা চিহ্নিত করুন।
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <Link 
                to="/suggestions"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300 hover:text-amber-200"
              >
                <span>বুলেট সাজেশন ও কুইজ</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: AI Study Partner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -6 }}
            className="rounded-3xl bg-[#0F172A] border border-white/15 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
          >
            {/* AI Q&A Mockup */}
            <div className="w-full rounded-2xl bg-[#090D18] border border-emerald-500/30 p-3.5 text-xs mb-6 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> AI স্টাডি সহকারী
                </span>
                <span className="text-[10px] text-emerald-300 font-semibold">২৪/৭ সক্রিয়</span>
              </div>
              
              <div className="rounded-xl bg-slate-800 p-2 text-xs font-semibold text-white mb-2">
                "হিসাববিজ্ঞানের ডেবিট-ক্রেডিট নির্ণয়ের সোনালী নিয়ম কি?"
              </div>
              <div className="rounded-xl bg-emerald-950/80 border border-emerald-500/30 p-2 text-xs font-semibold text-emerald-200">
                সম্পদ ও ব্যয় বৃদ্ধি পেলে ডেবিট, হ্রাস পেলে ক্রেডিট...
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#38BDF8] flex items-center gap-2 drop-shadow-sm">
                <span>AI স্টাডি পার্টনার</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed">
                ২৪/৭ লার্নিং পার্টনার। কঠিন প্রশ্নের সমাধান এবং পরীক্ষার পূর্ণ প্রস্তুতির জন্য সবসময় আপনার সাথে।
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-300">
                <span>নিচে ডানদিকের আইকনে ট্যাপ করে কথা বলুন</span>
              </span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
};

export default DigitalClassroomShowcase;
