import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  FileText, 
  Download, 
  Search, 
  ExternalLink,
  Lock,
  CheckCircle2,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import PremiumUnlock from "@/components/premium/PremiumUnlock";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"posts">;

const classTabs = [
  { id: "all", label: "সকল নোট" },
  { id: "hsc", label: "HSC" },
  { id: "ssc", label: "SSC" },
  { id: "class-6-8", label: "৬ষ্ঠ–৮ম" },
  { id: "class-1-5", label: "১ম–৫ম" },
  { id: "honours", label: "অনার্স ও ডিগ্রি" },
  { id: "ma", label: "মাস্টার্স" },
];

const Notes = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const fetchNotes = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("posts")
          .select("*")
          .eq("is_published", true)
          .not("pdf_url", "is", null)
          .order("created_at", { ascending: false });

        if (activeTab !== "all") {
          query = query.eq("category", activeTab);
        }

        const { data } = await query;
        setPosts(data || []);
      } catch (err) {
        console.error("Failed to load PDF notes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [activeTab]);

  const filtered = posts.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.title || "").toLowerCase().includes(q) ||
      (p.content || "").toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#080A12] text-foreground font-bengali pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1026] via-[#090D1C] to-[#080A12] pt-12 pb-14 border-b border-white/10">
        <div className="container px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-[#0B1026]/90 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-300 shadow-lg backdrop-blur-md mb-4">
            <FileText className="h-4 w-4 text-[#10B981]" />
            <span>জ্ঞানচর্চা'লয় · ডিজিটাল হ্যান্ডনোট ও স্টাডি শিট</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            ডাউনলোডযোগ্য <span className="text-[#38BDF8]">PDF নোট ও শিট</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 font-semibold max-w-2xl mx-auto">
            সুজয় স্যারের অধ্যায়ভিত্তিক হ্যান্ডনোট, বোর্ড পরীক্ষার উত্তরপত্র এবং স্পেশাল বুলেট লেকচার শিট।
          </p>

          {/* Search */}
          <div className="mt-7 max-w-xl mx-auto">
            <div className="relative flex items-center rounded-2xl border border-white/20 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl">
              <Search className="h-5 w-5 text-[#10B981] ml-3 shrink-0" />
              <input
                type="text"
                placeholder="নোট বা অধ্যায়ের নাম দিয়ে অনুসন্ধান করুন..."
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
          </div>

          {/* Class Filter Tabs */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {classTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#10B981] text-white shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                    : "bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <div className="container px-4 sm:px-6 pt-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#10B981]" />
            <span>উপলব্ধ PDF নোটসমূহ ({filtered.length.toLocaleString("bn-BD")})</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">নোট লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-md mx-auto">
            <FileText className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">কোনো নোট পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1">অন্য কোনো শ্রেণি বা কীওয়ার্ড দিয়ে অনুসন্ধান করুন</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => {
              const isPremium = (post as any).is_premium || ((post as any).price && Number((post as any).price) > 0);

              return (
                <div
                  key={post.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E152F]/90 p-5 shadow-xl transition-all hover:border-emerald-500/50 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 uppercase">
                        {post.category || "সাধারণ পাঠ"}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-[#F5C76A] transition-colors leading-snug">
                      {post.title}
                    </h3>

                    {post.content && (
                      <p className="mt-2 line-clamp-2 text-xs text-slate-300 leading-relaxed font-medium">
                        {post.content}
                      </p>
                    )}

                    <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>PDF ফরম্যাট · প্রিন্ট ও মোবাইল রিডেবল</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/10">
                    {isPremium ? (
                      <PremiumUnlock
                        postId={post.id}
                        title={post.title}
                        price={Number((post as any).price) || 0}
                        discountPrice={
                          (post as any).discount_price != null
                            ? Number((post as any).discount_price)
                            : null
                        }
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400">সম্পূর্ণ ফ্রি</span>
                        <Button
                          size="sm"
                          className="rounded-xl text-xs font-bold gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md hover:brightness-110"
                          asChild
                        >
                          <a href={post.pdf_url!} target="_blank" rel="noopener noreferrer">
                            <Download className="h-3.5 w-3.5" /> ডাউনলোড করুন
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
