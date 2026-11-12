import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TermsPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#080A12] text-white py-12 px-4 sm:px-6">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-6 font-bengali text-xs">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> হোমে ফিরে যান</Link>
        </Button>

        <div className="card-cosmic rounded-3xl p-6 sm:p-10 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#6C4AE6]/20 border border-[#6C4AE6]/40 flex items-center justify-center text-[#F5C76A]">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bengali text-2xl sm:text-3xl font-black">শর্তাবলী ও নিয়মাবলী (Terms & Conditions)</h1>
              <p className="font-bengali text-xs text-muted-foreground mt-0.5">জ্ঞানচর্চা'লয় শিক্ষামূলক প্ল্যাটফর্ম</p>
            </div>
          </div>

          <div className="space-y-6 font-bengali text-sm text-foreground/90 leading-relaxed">
            <section className="border-t border-white/10 pt-4">
              <h2 className="text-base font-bold text-[#F5C76A] mb-2">১. প্ল্যাটফর্ম ব্যবহার সংক্রান্ত</h2>
              <p className="text-muted-foreground">
                জ্ঞানচর্চা'লয় একটি শিক্ষামূলক প্ল্যাটফর্ম। এখানে প্রকাশিত সকল ভিডিও লেকচার, সাজেশন, অধ্যায়ভিত্তিক নোট এবং স্টাডি মেটেরিয়াল শিক্ষার্থীদের ব্যক্তিগত পড়াশোনার সহায়ক হিসেবে সরবরাহ করা হয়েছে।
              </p>
            </section>

            <section className="border-t border-white/10 pt-4">
              <h2 className="text-base font-bold text-[#F5C76A] mb-2">২. কপিরাইট ও মেধাস্বত্ব</h2>
              <p className="text-muted-foreground">
                ওয়েবসাইটে প্রকাশিত সুজয় স্যারের সকল ভিডিও, পিডিএফ হ্যান্ডনোট ও সাজেশনের মেধাস্বত্ব জ্ঞানচর্চা'লয় কর্তৃক সংরক্ষিত। কোনো কনটেন্ট বাণিজ্যিক উদ্দেশ্যে পুনঃবিক্রয় বা অনুমোদন ছাড়া প্রচার করা সম্পূর্ণ নিষিদ্ধ।
              </p>
            </section>

            <section className="border-t border-white/10 pt-4">
              <h2 className="text-base font-bold text-[#F5C76A] mb-2">৩. প্রিমিয়াম পিডিএফ আনলক</h2>
              <p className="text-muted-foreground">
                বিকাশ বা নগদ-এর মাধ্যমে পরিশোধিত ফি যাচাই সাপেক্ষে অ্যাডমিন কর্তৃক প্রিমিয়াম পিডিএফ স্বয়ংক্রিয়ভাবে শিক্ষার্থীর অ্যাকাউন্টে আজীবনের জন্য আনলক করা হয়।
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PrivacyPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#080A12] text-white py-12 px-4 sm:px-6">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-6 font-bengali text-xs">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> হোমে ফিরে যান</Link>
        </Button>

        <div className="card-cosmic rounded-3xl p-6 sm:p-10 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#16A878]/20 border border-[#16A878]/40 flex items-center justify-center text-[#16A878]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bengali text-2xl sm:text-3xl font-black">গোপনীয়তা নীতি (Privacy Policy)</h1>
              <p className="font-bengali text-xs text-muted-foreground mt-0.5">আপনার তথ্যের সর্বোচ্চ নিরাপত্তা আমাদের অঙ্গীকার</p>
            </div>
          </div>

          <div className="space-y-6 font-bengali text-sm text-foreground/90 leading-relaxed">
            <section className="border-t border-white/10 pt-4">
              <h2 className="text-base font-bold text-[#F5C76A] mb-2">১. তথ্য সংগ্রহ ও ব্যবহার</h2>
              <p className="text-muted-foreground">
                শিক্ষার্থীদের অ্যাকাউন্ট ব্যবস্থাপনা ও প্রিমিয়াম আনলক প্রক্রিয়া সুষ্ঠুভাবে সম্পন্ন করার জন্য শুধুমাত্র নাম, জিমেইল ঠিকানা এবং পেমেন্ট ট্রানজ্যাকশন আইডি (TrxID) সংরক্ষণ করা হয়।
              </p>
            </section>

            <section className="border-t border-white/10 pt-4">
              <h2 className="text-base font-bold text-[#F5C76A] mb-2">২. ডেটা নিরাপত্তা</h2>
              <p className="text-muted-foreground">
                আমরা কোনো অবস্থাতেই আপনার তথ্য তৃতীয় পক্ষের কাছে বিক্রি বা শেয়ার করি না। Supabase-এর Row Level Security (RLS) ও সুরক্ষিত JWT এনক্রিপশনের মাধ্যমে সকল তথ্য সংরক্ষিত থাকে।
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RefundPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#080A12] text-white py-12 px-4 sm:px-6">
      <div className="container max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" asChild className="mb-6 font-bengali text-xs">
          <Link to="/"><ArrowLeft className="h-4 w-4 mr-1" /> হোমে ফিরে যান</Link>
        </Button>

        <div className="card-cosmic rounded-3xl p-6 sm:p-10 border border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#48D9F5]/20 border border-[#48D9F5]/40 flex items-center justify-center text-[#48D9F5]">
              <RefreshCw className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bengali text-2xl sm:text-3xl font-black">রিফান্ড ও রিটার্ন নীতি (Refund Policy)</h1>
              <p className="font-bengali text-xs text-muted-foreground mt-0.5">স্বচ্ছ ও শিক্ষার্থী-বান্ধব সেবার নিয়ম</p>
            </div>
          </div>

          <div className="space-y-6 font-bengali text-sm text-foreground/90 leading-relaxed">
            <section className="border-t border-white/10 pt-4">
              <h2 className="text-base font-bold text-[#F5C76A] mb-2">১. ডিজিটাল কনটেন্ট নীতি</h2>
              <p className="text-muted-foreground">
                পিডিএফ হ্যান্ডনোট বা সাজেশন সরাসরি ডাউনলোডযোগ্য ডিজিটাল কনটেন্ট হওয়ায় একবার ফাইল সফলভাবে আনলক হয়ে গেলে সাধারণত রিফান্ড প্রযোজ্য হয় না।
              </p>
            </section>

            <section className="border-t border-white/10 pt-4">
              <h2 className="text-base font-bold text-[#F5C76A] mb-2">২. পেমেন্ট যাচাই সমস্যা</h2>
              <p className="text-muted-foreground">
                ভুলবশত দ্বিগুণ পেমেন্ট হলে বা সঠিক ট্রানজ্যাকশন আইডি দেওয়ার পরও ২৪ ঘণ্টার মধ্যে পিডিএফ আনলক না হলে আমাদের হেল্পলাইন 01537515618 বা ইমেইল gayanchorchaloi@gmail.com-এ যোগাযোগ করলে দ্রুত সমাধান বা রিফান্ড প্রদান করা হবে।
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
