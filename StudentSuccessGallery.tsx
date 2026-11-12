import React from "react";
import { motion } from "framer-motion";
import { Star, Award, Heart, Quote, CheckCircle2 } from "lucide-react";

interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  institution: string;
  quote: string;
  avatarText: string;
  category: "student" | "parent";
}

const reviews: TestimonialItem[] = [
  {
    id: "rev-1",
    name: "মেহজাবিন সুলতানা",
    role: "শিক্ষার্থী, এসএসসি ২০২৪ (GPA-5)",
    institution: "ভিকারুননিসা নূন স্কুল অ্যান্ড কলেজ",
    quote: "সুজয় স্যারের হিসাববিজ্ঞান ক্লাসগুলো এত নিখুঁত যে পরীক্ষার হলে কোনো প্রশ্নের সমাধান করতে গিয়ে আটকে যেতে হয়নি। প্রতিটি সাজেশন হুবহু কমন ছিল।",
    avatarText: "মেহ",
    category: "student"
  },
  {
    id: "rev-2",
    name: "রেদোয়ান আহমেদ",
    role: "শিক্ষার্থী, একাদশ শ্রেণি",
    institution: "বীরশ্রেষ্ঠ নূর মোহাম্মদ পাবলিক কলেজ",
    quote: "জ্ঞানচর্চা'লয়-এর ফ্রি ভিডিও লেকচার ও সাজেশনের কারণে নতুন কারিকুলামের কঠিন বিষয়গুলো একদম পানির মতো সহজ হয়ে গেছে। স্যারের প্রতি কৃতজ্ঞতা!",
    avatarText: "রেদ",
    category: "student"
  },
  {
    id: "rev-3",
    name: "পূর্ণিমা লস্কর",
    role: "অভিভাবক (মা)",
    institution: "শিক্ষার্থী: পারমিতা লস্কর (১০ম শ্রেণি)",
    quote: "আমার মেয়ের পড়াশোনার পুরো টেনশন আমি এখন জ্ঞানচর্চা'লয়-কে দিয়ে নিশ্চিত হয়েছি। এখানকার শিক্ষক ও নোটগুলো সত্যিই অনন্য ও ফলপ্রসূ।",
    avatarText: "মা",
    category: "parent"
  },
  {
    id: "rev-4",
    name: "মোহাম্মদ রাজিবুল হাসান",
    role: "অভিভাবক (বাবা)",
    institution: "শিক্ষার্থী: সৈয়দা মেহরিন ইসলাম",
    quote: "আমার মেয়ে কমার্স ও সায়েন্সের কঠিন সাবজেক্টগুলো নিয়ে আগে খুব স্ট্রাগল করতো। জ্ঞানচর্চা'লয় দেখার পর থেকে ওর ভয় পুরোপুরি কেটে গেছে।",
    avatarText: "বাবা",
    category: "parent"
  }
];

export const StudentSuccessGallery: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-[#080A12] text-white font-bengali border-t border-white/5 relative overflow-hidden">
      <div className="container px-4 sm:px-6 max-w-5xl mx-auto relative z-10">
        
        {/* Top Part: Successful Generation Banner matching Pages 18 & 43 */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            আর শেখার সেই পথেই গড়ে উঠছে <br />
            <span className="text-[#38BDF8]">আত্মবিশ্বাসী সফল প্রজন্ম</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400">
            জ্ঞানচর্চা'লয়-এর সাথে প্রতি বছর হাজারো শিক্ষার্থী বোর্ড পরীক্ষায় অর্জন করছে সর্বোচ্চ ফলাফল।
          </p>
        </div>

        {/* 5-Star Rating & Parent/Student Choice Header matching Pages 18 & 44 */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h3 className="text-xl sm:text-3xl font-black text-white">
            কেন আমরাই শিক্ষার্থী ও অভিভাবকদের প্রথম পছন্দ?
          </h3>
        </div>

        {/* Testimonial Cards Grid from Pages 20, 24, 25, 26, 44 */}
        <div className="grid gap-6 md:grid-cols-2">
          {reviews.map((rev, idx) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#0F172A] border border-white/10 p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group"
            >
              <div>
                <Quote className="h-8 w-8 text-emerald-400/60 mb-3" />
                <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed italic drop-shadow-sm">
                  "{rev.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/25 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold text-sm shrink-0 shadow-inner">
                  {rev.avatarText}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm sm:text-base font-bold text-white truncate">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-emerald-400 font-bold">
                    {rev.role}
                  </p>
                  <p className="text-xs text-slate-200 font-semibold truncate mt-0.5">
                    {rev.institution}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default StudentSuccessGallery;
