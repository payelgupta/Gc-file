import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Play, 
  Search, 
  BookOpen, 
  Calendar, 
  ExternalLink,
  ChevronRight,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"posts">;

const classTabs = [
  { id: "all", label: "সকল ভিডিও" },
  { id: "hsc", label: "HSC" },
  { id: "ssc", label: "SSC" },
  { id: "class-6-8", label: "৬ষ্ঠ–৮ম" },
  { id: "class-1-5", label: "১ম–৫ম" },
  { id: "honours", label: "অনার্স ও ডিগ্রি" },
  { id: "ma", label: "মাস্টার্স" },
];

const getYouTubeId = (url: string) => {
  const match = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] || null;
};

const Videos = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [activeVideo, setActiveVideo] = useState<Post | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    const fetchVideos = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("posts")
          .select("*")
          .eq("is_published", true)
          .not("video_url", "is", null)
          .order("created_at", { ascending: false });

        if (activeTab !== "all") {
          query = query.eq("category", activeTab);
        }

        const { data } = await query;
        const fetched = data || [];
        setPosts(fetched);
        if (fetched.length > 0 && !activeVideo) {
          setActiveVideo(fetched[0]);
        }
      } catch (err) {
        console.error("Failed to load videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
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

  const featuredYtId = activeVideo?.video_url ? getYouTubeId(activeVideo.video_url) : null;

  return (
    <div className="min-h-screen bg-[#080A12] text-foreground font-bengali pb-20">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1026] via-[#090D1C] to-[#080A12] pt-12 pb-14 border-b border-white/10">
        <div className="container px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-[#0B1026]/90 px-4 py-1.5 text-xs sm:text-sm font-bold text-emerald-300 shadow-lg backdrop-blur-md mb-4">
            <Play className="h-4 w-4 text-[#10B981]" />
            <span>জ্ঞানচর্চা'লয় · সকল ভিডিও লেকচার আর্কাইভ</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight drop-shadow-md">
            সহজ ব্যাখ্যামূলক <span className="text-[#38BDF8]">ভিডিও ক্লাস</span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-200 font-semibold max-w-2xl mx-auto">
            সুজয় স্যারের অ্যাকাউন্টিং, ফিন্যান্স, গণিত ও অন্যান্য বিষয়ের অধ্যায়ভিত্তিক প্রিমিয়াম লেকচারসমূহ সম্পূর্ণ ফ্রিতে দেখুন।
          </p>

          {/* Search */}
          <div className="mt-7 max-w-xl mx-auto">
            <div className="relative flex items-center rounded-2xl border border-white/20 bg-slate-900/80 p-2 shadow-2xl backdrop-blur-xl">
              <Search className="h-5 w-5 text-[#10B981] ml-3 shrink-0" />
              <input
                type="text"
                placeholder="ভিডিও শিরোনাম বা টপিক দিয়ে খুঁজুন..."
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

      {/* Main Container */}
      <div className="container px-4 sm:px-6 pt-10 max-w-6xl mx-auto">
        {/* Active Featured Player */}
        {activeVideo && featuredYtId && (
          <div className="mb-12 rounded-3xl border border-white/10 bg-[#0E152F]/90 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
            <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
              <iframe
                src={`https://www.youtube.com/embed/${featuredYtId}?autoplay=1`}
                title={activeVideo.title}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-0.5 text-xs font-bold text-emerald-300 mb-1">
                  এখন প্লে হচ্ছে
                </span>
                <h2 className="text-lg sm:text-2xl font-black text-white">
                  {activeVideo.title}
                </h2>
              </div>
              {activeVideo.category && (
                <Link
                  to={`/category/${activeVideo.category}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F5C76A] hover:underline"
                >
                  কোর্সের সকল লেকচার <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Video Grid */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Play className="h-5 w-5 text-[#10B981]" />
            <span>সকল ভিডিও লেকচার ({filtered.length.toLocaleString("bn-BD")})</span>
          </h3>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">ভিডিও লোড হচ্ছে...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center max-w-md mx-auto">
            <Play className="h-12 w-12 text-slate-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">কোনো ভিডিও পাওয়া যায়নি</h3>
            <p className="text-xs text-slate-400 mt-1">অন্য কোনো শ্রেণি বা কীওয়ার্ড দিয়ে অনুসন্ধান করুন</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => {
              const ytId = getYouTubeId(video.video_url || "");
              const isCurrent = activeVideo?.id === video.id;

              return (
                <div
                  key={video.id}
                  onClick={() => {
                    setActiveVideo(video);
                    window.scrollTo({ top: 350, behavior: "smooth" });
                  }}
                  className={`group relative flex flex-col justify-between rounded-2xl border ${
                    isCurrent ? "border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]" : "border-white/10"
                  } bg-[#0E152F]/80 overflow-hidden cursor-pointer transition-all hover:border-emerald-500/50 hover:-translate-y-1`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video relative bg-black overflow-hidden">
                    {ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt={video.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-slate-900">
                        <Play className="h-10 w-10 text-slate-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
                        <Play className="h-6 w-6 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold text-emerald-400 uppercase">
                          {video.category || "লেকচার"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(video.created_at).toLocaleDateString("bn-BD")}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug group-hover:text-[#F5C76A] transition-colors">
                        {video.title}
                      </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>প্লে করুন</span>
                      <Play className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>
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

export default Videos;
