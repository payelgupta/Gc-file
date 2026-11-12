import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Lightbulb, 
  Search, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Sparkles,
  Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"posts">;

const classTabs = [
  { id: "all", label: "সকল সাজেশন" },
  { id: "hsc", label: "HSC বুলেট" },
  { id: "ssc", label: "SSC বুলেট" },
  { id: "class-6-8", label: "৬ষ্ঠ–৮ম" },
  { id: "class-1-5", label: "১ম–৫ম" },
  { id: "honours", label: "অনার্স ও ডিগ্রি" },
  { id: "ma", label: "মাস্টার্স" },
];

const Suggestions = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("posts")
          .select("*")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

        if (activeTab !== "all") {
          query = query.eq("category", activeTab);
        }

        const { data } = await query;
        // Prioritize posts with "সাজেশন" or bullet suggestion titles
        const allFetched = data || [];
        setPosts(allFetched);
      } catch (err) {
        console.error("Failed to load suggestions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
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
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-[#0B1026]/90 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-300 shadow-lg backdrop-blur-md mb-4">
            <Lightbulb className="h-4 w-4 text-[#F5C76A]" />
            <span>জ্ঞানচর্চা'লয় · বোর্ড ও ফাইনাল পরীক্ষার স্পেশাল বুলেট সাজেশন</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            পরীক্ষার ১০০% কমন <span className="text-[#F5C76A]">বুলেট সাজেশন</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 font-semibold max-w-2xl mx-auto">
            সুজয় স্যারের দীর্ঘ ১০+ বছরের অভিজ্ঞতায় তৈরি হিসাববিজ্ঞান ও সকল বিষয়ের গুরুত্বপূর্ণ অধ্যায়ভিত্তিক প্রশ্ন ও সমাধান।
          </p>

          {/* Search */}
          <div className="mt-7 max-w-xl mx-auto">
            <div className="relative flex items-center rounded-2xl border border-white/20 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl">
              <Search className="h-5 w-5 text-[#F5C76A] ml-3 shrink-0" />
              <input
                type="text"
                placeholder="সাজেশন বা টপিক দিয়ে খুঁজুন..."
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
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,199,106,0.5)] scale-105"
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
            <Lightbulb className="h-5 w-5 text-[#F5C76A]" />
            <span>সকল পরীক্ষার বুলেট সাজেশন ({filtered.length.toLocaleString("bn-BD")})</span>
          </h2>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">সাজেশন লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-md mx-auto">
            <Lightbulb className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">কোনো সাজেশন পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1">অন্য কোনো শ্রেণি বা কীওয়ার্ড দিয়ে অনুসন্ধান করুন</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <div
                key={post.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0E152F]/90 p-5 shadow-xl transition-all hover:border-amber-400/50 hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-[#F5C76A] border border-amber-500/30 group-hover:scale-110 transition-transform">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                      {post.category || "পরীক্ষা স্পেশাল"}
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
                    <CheckCircle2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>পরীক্ষার সেরা কমনোপযোগী টিপস ও ট্রিকস</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  {post.video_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1 border-white/20 text-white hover:bg-white/10"
                      asChild
                    >
                      <a href={post.video_url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-3 w-3 text-emerald-400" /> ভিডিও ক্লাস
                      </a>
                    </Button>
                  )}
                  {post.pdf_url ? (
                    <Button
                      size="sm"
                      className="rounded-xl text-xs font-bold gap-1 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 hover:brightness-110 ml-auto"
                      asChild
                    >
                      <a href={post.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" /> PDF সাজেশন
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-xl text-xs font-bold text-[#F5C76A] hover:bg-white/5 ml-auto"
                      asChild
                    >
                      <Link to="/notice">বিস্তারিত জানুন</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
