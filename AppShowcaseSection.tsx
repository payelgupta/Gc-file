import React from "react";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Star, 
  Download, 
  WifiOff, 
  HelpCircle, 
  BookOpen, 
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";

export const AppShowcaseSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-[#0B1026] text-white font-bengali border-t border-white/5 relative overflow-hidden">
      <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Section Headline matching Pages 21 & 45 of PDF */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
            মোবাইল বা যেকোনো ডিভাইসে <br />
            <span className="text-[#10B981]">শেখা শুরু করুন আজ থেকেই</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-100 font-bold drop-shadow-sm">
            জ্ঞানচর্চা'লয় ওয়েব ও মোবাইল পোর্টালে প্রতিটি শিক্ষার্থীর জন্য রয়েছে অবাধ ও স্বাচ্ছন্দ্যময় শিক্ষার সুযোগ
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-center">
          
          {/* Left Column: Phone Mockup Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-64 sm:w-72 rounded-[40px] border-4 border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-emerald-500/10"
            >
              {/* Notch */}
              <div className="mx-auto h-4 w-24 rounded-b-xl bg-slate-800 mb-2" />

              {/* Inner Screen */}
              <div className="rounded-[30px] bg-[#080A12] p-4 text-xs space-y-3 overflow-hidden border border-white/10">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="font-bold text-emerald-400">জ্ঞানচর্চা'লয়</span>
                  <span className="text-[10px] text-slate-300 font-semibold">Class 1-12 & NU</span>
                </div>

                <div className="rounded-xl bg-gradient-to-r from-emerald-600/30 to-sky-600/30 p-3 border border-emerald-500/20">
                  <p className="font-bold text-white text-xs">আজকের সেরা ক্লাস</p>
                  <p className="text-[10px] text-slate-200 font-medium">হিসাববিজ্ঞান জাবেদা ও খতিয়ান</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-200 bg-white/5 p-2 rounded-lg font-medium">
                    <span>অধ্যায়ভিত্তিক প্রস্তুতি</span>
                    <span className="text-emerald-400 font-bold">১০০% ফ্রি</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-200 bg-white/5 p-2 rounded-lg font-medium">
                    <span>বুলেট হ্যান্ডনোট</span>
                    <span className="text-amber-400 font-bold">PDF রেডি</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-200 bg-white/5 p-2 rounded-lg font-medium">
                    <span>AI শিক্ষক</span>
                    <span className="text-sky-400 font-bold">সক্রিয়</span>
                  </div>
                </div>

                <div className="pt-2 text-center">
                  <span className="inline-block px-3 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-bold">
                    সরাসরি ওয়েবে চালু আছে
                  </span>
                </div>
              </div>

              {/* Bottom Home Bar */}
              <div className="mx-auto mt-3 h-1 w-28 rounded-full bg-slate-700" />
            </motion.div>
          </div>

          {/* Right Column: Key Feature Bullets matching Pages 23 & 45 of PDF */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-950/40 to-slate-900 border border-rose-500/30 p-4 text-center">
                <span className="text-xl sm:text-2xl font-black text-rose-400 block">
                  ৫০,০০০+
                </span>
                <span className="text-xs sm:text-sm text-slate-200 font-bold">
                  শিক্ষার্থী ও ব্যবহারকারী
                </span>
              </div>

              <div className="rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-900 border border-emerald-500/30 p-4 text-center">
                <div className="flex items-center justify-center gap-1 text-amber-400 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-xl sm:text-2xl font-black text-emerald-400 block">
                  ৪.৮+
                </span>
                <span className="text-xs sm:text-sm text-slate-200 font-bold">
                  শিক্ষার্থীদের রেটিং
                </span>
              </div>
            </div>

            {/* 3 Bullets from PDF */}
            <div className="space-y-4">
              
              <div className="flex items-start gap-3.5 rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    একাডেমিক পড়াশোনা
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed font-medium">
                    ইন্টারঅ্যাক্টিভ লাইভ ক্লাস, আনলিমিটেড কুইজ, MCQ Question Bank, রেকর্ডেড ক্লাস এবং আরও অনেক কিছু।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    ২৪×৭ ডাউটসলভ
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed font-medium">
                    ৭ দিন ২৪ ঘণ্টা তোমার ডাউট সলভ করতে সুপার স্টাডি পার্টনার AI শিক্ষক।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl bg-white/5 p-4 border border-white/10">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <WifiOff className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    পড়া চলবে ইন্টারনেট ছাড়াও
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed font-medium">
                    ইন্টারনেট কানেকশন ছাড়াও ডাউনলোড করে অফলাইনে দেখতে পারবে হ্যান্ডনোট ও বুলেট সাজেশন।
                  </p>
                </div>
              </div>

            </div>

            {/* Quick Web CTA */}
            <div className="pt-2">
              <Link to="/category/class-1-5">
                <button className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl transition-transform hover:-translate-y-0.5 cursor-pointer">
                  ব্রাউজারেই এখনই পড়া শুরু করুন (ফ্রি)
                </button>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

export default AppShowcaseSection;
