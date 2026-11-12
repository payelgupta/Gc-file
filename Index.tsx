import AdBox from "@/components/home/AdBox";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Play, 
  FileText, 
  Bell, 
  Lightbulb, 
  Download, 
  GraduationCap, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  Award, 
  Users, 
  Sparkles,
  ExternalLink,
  Star,
  Quote,
  Clock,
  Compass
} from "lucide-react";
import ClassCategoryCard from "@/components/home/ClassCategoryCard";
import NewsTicker from "@/components/home/NewsTicker";
import LiveWidgets from "@/components/home/LiveWidgets";
import PhotoGallery from "@/components/home/PhotoGallery";
import AIChatbot from "@/components/home/AIChatbot";
import PremiumUnlock from "@/components/premium/PremiumUnlock";
import ChapterPdfAction from "@/components/common/ChapterPdfAction";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import heroBgDefault from "@/assets/hero-bg.jpg";
import sujoySirImg from "@/assets/sujoy-sir.png";
import MagicalCosmicBook from "@/components/brand/MagicalCosmicBook";
import HeroAppGrid from "@/components/home/HeroAppGrid";
import AcademicBatchExplorer from "@/components/home/AcademicBatchExplorer";
import BatchPerksGrid from "@/components/home/BatchPerksGrid";
import DigitalClassroomShowcase from "@/components/home/DigitalClassroomShowcase";
import MaterialStoreGrid from "@/components/home/MaterialStoreGrid";
import StudentSuccessGallery from "@/components/home/StudentSuccessGallery";
import AppShowcaseSection from "@/components/home/AppShowcaseSection";
import MagicalBroomstickAnimation from "@/components/home/MagicalBroomstickAnimation";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"posts">;

const fadeUp: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, 
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" }
  }),
};

const classCategories = [
  { name: "Class 1–5", icon: "📚", desc: "Primary Education", slug: "class-1-5" },
  { name: "Class 6–8", icon: "📖", desc: "Junior Secondary", slug: "class-6-8" },
  { name: "SSC", icon: "🎓", desc: "SSC Preparation", slug: "ssc" },
  { name: "HSC", icon: "🏆", desc: "HSC Preparation", slug: "hsc" },
  { name: "Honours", icon: "📘", desc: "Degree Level", slug: "honours" },
  { name: "MA", icon: "🎯", desc: "Masters Level", slug: "ma" },
];

const statsData = [
  { count: "১,০০০+", label: "ভিডিও লেকচার", desc: "অধ্যায়ভিত্তিক সহজ ব্যাখ্যা", icon: Play },
  { count: "৫০+", label: "হ্যান্ডনোট ও PDF", desc: "পরীক্ষার সেরা বুলেট সাজেশন", icon: FileText },
  { count: "২৪/৭", label: "AI স্টাডি শিক্ষক", desc: "তাৎক্ষণিক সমাধান ও গাইড", icon: Sparkles },
  { count: "১০০%", label: "বিনামূল্যে প্রস্তুতি", desc: "সকল শিক্ষার্থীর জন্য উন্মুক্ত", icon: Award },
];

const testimonials = [
  {
    name: "তানভীর আহমেদ",
    badge: "HSC পরীক্ষার্থী",
    text: "সুজয় স্যারের হিসাববিজ্ঞানের জাবেদা ও আর্থিক বিবরণীর ক্লাসগুলো এত সহজে বোঝানো হয়েছে যে পরীক্ষার ভয় একদম কেটে গেছে!",
    rating: 5,
    classRef: "HSC Commerce",
  },
  {
    name: "সুমাইয়া আক্তার",
    badge: "SSC জিপিএ-৫ অর্জনকারী",
    text: "জ্ঞানচর্চা'লয় এর সাজেশন ও অধ্যায়ভিত্তিক পিডিএফ নোটগুলো পরীক্ষায় হুবহু কমন এসেছিল। ফ্রি প্ল্যাটফর্মে এত উন্নত কনটেন্ট সত্যিই প্রশংসনীয়।",
    rating: 5,
    classRef: "SSC Science",
  },
  {
    name: "রাকিবুল হাসান",
    badge: "অনার্স হিসাববিজ্ঞান বিভাগ",
    text: "জাতীয় বিশ্ববিদ্যালয়ের অনার্স ১ম ও ২য় বর্ষের জটিল ম্যাথ ও থিওরি খুব সাবলীলভাবে সুজয় স্যার ভিডিও লেকচারে স্পষ্ট করেছেন।",
    rating: 5,
    classRef: "National University",
  },
];

const POSTS_PER_PAGE = 6;

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] || null;
};

const Index = () => {
  const [heroBg, setHeroBg] = useState(heroBgDefault);
  const [heroOpacity, setHeroOpacity] = useState(85);
  const [startLearningLink, setStartLearningLink] = useState("/category/class-1-5");
  const [viewSuggestionsLink, setViewSuggestionsLink] = useState("/notice");

  // Dynamic data
  const [videoPosts, setVideoPosts] = useState<Post[]>([]);
  const [suggestionPosts, setSuggestionPosts] = useState<Post[]>([]);
  const [pdfPosts, setPdfPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [videoSlideIndex, setVideoSlideIndex] = useState(0);

  // 10MS filter & search state
  const [selectedClassTab, setSelectedClassTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchHeroSettings = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["hero_bg_url", "hero_opacity", "start_learning_link", "view_suggestions_link"]);
      if (data) {
        data.forEach((s) => {
          if (s.key === "hero_bg_url" && s.value) setHeroBg(s.value);
          if (s.key === "hero_opacity" && s.value) setHeroOpacity(Number(s.value));
          if (s.key === "start_learning_link" && s.value) setStartLearningLink(s.value);
          if (s.key === "view_suggestions_link" && s.value) setViewSuggestionsLink(s.value);
        });
      }
    };

    const fetchPosts = async () => {
      // Video posts
      const { data: videos } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .not("video_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(6);
      setVideoPosts(videos || []);

      // PDF posts
      const { data: pdfs } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .not("pdf_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(5);
      setPdfPosts(pdfs || []);

      // Suggestion posts
      const { data: suggestions } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(5);
      setSuggestionPosts(suggestions || []);

      // Total count
      const { count } = await supabase
        .from("posts")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);
      setTotalPosts(count || 0);
    };

    fetchHeroSettings();
    fetchPosts();
  }, []);

  // Fetch paginated posts
  useEffect(() => {
    const fetchPagedPosts = async () => {
      let query = supabase
        .from("posts")
        .select("*", { count: "exact" })
        .eq("is_published", true);

      if (selectedClassTab !== "all") {
        query = query.eq("category", selectedClassTab);
      }

      const from = (currentPage - 1) * POSTS_PER_PAGE;
      const to = from + POSTS_PER_PAGE - 1;

      const { data, count } = await query
        .order("created_at", { ascending: false })
        .range(from, to);

      setAllPosts(data || []);
      if (count !== null) setTotalPosts(count);
    };
    fetchPagedPosts();
  }, [currentPage, selectedClassTab]);

  // Auto-slide for videos
  useEffect(() => {
    if (videoPosts.length <= 1) return;
    const timer = setInterval(() => {
      setVideoSlideIndex((prev) => (prev + 1) % videoPosts.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [videoPosts.length]);

  // Filtered posts based on search query in client
  const displayedPosts = useMemo(() => {
    if (!searchQuery.trim()) return allPosts;
    const q = searchQuery.toLowerCase();
    return allPosts.filter(
      (p) =>
        (p.title || "").toLowerCase().includes(q) ||
        (p.content || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q)
    );
  }, [allPosts, searchQuery]);

  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#080A12] text-foreground font-bengali">
      {/* HERO SECTION MATCHING PAGES 1 & 39 OF 10MS PDF */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1026] via-[#090D1C] to-[#080A12] text-white pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-white/5">
        {/* Subtle Ambient Cosmic Nebula Lights & Dust */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-[#10B981]/15 blur-[130px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-[500px] w-[500px] rounded-full bg-[#38BDF8]/15 blur-[130px]" />
        <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-[#F5C76A]/10 blur-[150px]" />

        <div className="container relative z-10 px-4 sm:px-6">
          
          {/* Central Magical Cosmic Emblem */}
          <div className="mb-4 flex justify-center">
            <MagicalCosmicBook size="sm" showWordmark={true} />
          </div>

          {/* 3x2 Academic Cards Grid from Page 1 & 39 of PDF */}
          <HeroAppGrid />

          {/* Live Search Bar with Instant Filter Chips */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 sm:mt-10 max-w-xl mx-auto"
          >
            <div className="card-cosmic relative flex items-center rounded-2xl p-1.5 shadow-2xl border border-white/20 bg-black/40 backdrop-blur-xl">
              <Search className="h-5 w-5 text-[#10B981] ml-3 shrink-0" />
              <input
                type="text"
                placeholder="বিষয়, অধ্যায় বা সাজেশন খুঁজুন (যেমন: হিসাববিজ্ঞান, এসএসসি)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder:text-slate-400 outline-none font-bengali"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs px-2.5 py-1 text-slate-400 hover:text-white"
                >
                  মুছুন
                </button>
              )}
            </div>

            {/* Popular Search Chips */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-slate-200 font-bold text-xs">জনপ্রিয় টপিক:</span>
              {["হিসাববিজ্ঞান", "এসএসসি সাজেশন", "এইচএসসি", "ইংরেজি", "গণিত"].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setSearchQuery(chip)}
                  className="rounded-xl bg-white/10 border border-white/20 px-3 py-1.5 text-xs font-bold text-white hover:border-[#10B981] hover:text-[#10B981] hover:bg-[#10B981]/10 transition-all cursor-pointer shadow-sm"
                >
                  {chip}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Stats Strip with Clean Glass Look and High Contrast Typography */}
          <div className="mt-12 pt-8 border-t border-white/15 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {statsData.map((stat, i) => (
                <div
                  key={i}
                  className="card-cosmic rounded-2xl p-4 text-center sm:text-left flex flex-col justify-between border border-white/15 bg-slate-900/80 shadow-lg backdrop-blur-md"
                >
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5">
                    <stat.icon className="h-5 w-5 text-[#10B981] shrink-0" />
                    <span className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {stat.count}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">
                      {stat.label}
                    </h4>
                    <p className="text-xs text-slate-200 font-medium hidden sm:block mt-0.5">
                      {stat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* News Ticker */}
      <NewsTicker />

      {/* 10MS Online Batch Explorer matching Pages 10-15 & 42 */}
      <AcademicBatchExplorer />

      {/* 10MS Batch Perks Grid matching Pages 16-17 & 43 */}
      <BatchPerksGrid />

      {/* 10MS Digital Classroom Showcase matching Pages 5-7 & 41 */}
      <DigitalClassroomShowcase />

      {/* 10MS Study Material & PDF Store matching Pages 31-35 & 47 */}
      <MaterialStoreGrid 
        pdfPosts={pdfPosts}
        onSelectPost={(post) => {
          if (post.pdf_url) {
            window.open(post.pdf_url, "_blank");
          }
        }}
      />

      {/* Class Category Selection Grid */}
      <section className="py-14 sm:py-20">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#16A878] animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-[#16A878] uppercase tracking-wider">
                  শ্রেণিভিত্তিক সিলেবাস
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white mt-1.5 tracking-tight drop-shadow-md">
                তোমার শ্রেণি বেছে নাও
              </h2>
              <p className="text-sm sm:text-base text-slate-200 font-semibold mt-1">
                ক্লাস ১ থেকে মাস্টার্স পর্যন্ত প্রতিটি বিষয়ের গোছানো পাঠ্যক্রম
              </p>
            </div>
            <Link
              to="/classes"
              className="text-xs sm:text-sm font-bold text-[#F5C76A] hover:underline flex items-center gap-1.5 drop-shadow-sm"
            >
              সব কোর্স একসাথে দেখুন <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {classCategories.map((cat, i) => (
              <ClassCategoryCard
                key={cat.name}
                name={cat.name}
                icon={cat.icon}
                desc={cat.desc}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Live Visitors & Activity Widgets */}
      <LiveWidgets />

      {/* Featured Video Lessons - Interactive Slider with Glossy Cosmic Cards */}
      {videoPosts.length > 0 && (
        <section className="bg-[#0B1026]/40 py-14 sm:py-20 border-y border-white/10">
          <div className="container px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#16A878]/25 text-[#16A878] border border-[#16A878]/40 shadow-[0_0_15px_rgba(22,168,120,0.3)]">
                  <Play className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                    ফিচার্ড ভিডিও লেকচার
                  </h2>
                  <p className="text-sm sm:text-base text-slate-200 font-semibold mt-0.5">
                    সহজ অ্যানিমেশন ও বাস্তব উদাহরণের মাধ্যমে জটিল অধ্যায় সমাধান
                  </p>
                </div>
              </div>

              <Link
                to="/videos"
                className="text-xs sm:text-sm font-bold text-[#F5C76A] hover:underline flex items-center gap-1 drop-shadow-sm"
              >
                সব ভিডিও ক্লাস <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative mt-6">
              {(() => {
                const video = videoPosts[videoSlideIndex];
                const ytId = video?.video_url ? getYouTubeId(video.video_url) : null;
                return (
                  <motion.div
                    key={video?.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="card-cosmic overflow-hidden rounded-3xl"
                  >
                    <div className="grid lg:grid-cols-12 gap-0">
                      <div className="lg:col-span-8 bg-black">
                        {ytId ? (
                          <div className="aspect-video w-full">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={video?.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : video?.image_url ? (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={video.image_url}
                              alt={video.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video flex items-center justify-center bg-black/60">
                            <Play className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="rounded-full bg-[#16A878]/20 border border-[#16A878]/40 px-3 py-1 text-xs font-semibold text-[#16A878]">
                              লেটেস্ট লেকচার
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(video?.created_at || "").toLocaleDateString("bn-BD")}
                            </span>
                          </div>

                          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                            {video?.title}
                          </h3>

                          {video?.content && (
                            <p className="mt-3 line-clamp-4 text-xs sm:text-sm text-foreground/80 leading-relaxed">
                              {video.content}
                            </p>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                          {video?.video_url && !ytId && (
                            <Button size="sm" className="rounded-xl text-xs bg-[#16A878] text-white" asChild>
                              <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                                <Play className="h-3.5 w-3.5 mr-1" /> সরাসরি প্লে
                              </a>
                            </Button>
                          )}

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-xl border-white/15"
                              onClick={() =>
                                setVideoSlideIndex(
                                  (p) => (p - 1 + videoPosts.length) % videoPosts.length
                                )
                              }
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-xs text-muted-foreground">
                              {(videoSlideIndex + 1).toLocaleString("bn-BD")} / {videoPosts.length.toLocaleString("bn-BD")}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-9 w-9 rounded-xl border-white/15"
                              onClick={() =>
                                setVideoSlideIndex((p) => (p + 1) % videoPosts.length)
                              }
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </div>
        </section>
      )}

      {/* Suggestions & PDF Notes Section */}
      <section className="py-14 sm:py-20">
        <div className="container grid gap-8 px-4 sm:px-6 md:gap-12 lg:grid-cols-2">
          {/* Latest Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="h-5 w-5 text-[#F5C76A]" />
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">পরীক্ষার বুলেট সাজেশন</h3>
              </div>
              <Link to="/suggestions" className="text-xs sm:text-sm font-bold text-[#F5C76A] hover:underline">
                সব সাজেশন
              </Link>
            </div>

            <div className="space-y-3">
              {suggestionPosts.length === 0 ? (
                <div className="card-cosmic rounded-2xl p-6 text-center text-xs sm:text-sm text-slate-300">
                  শীঘ্রই নতুন বুলেট সাজেশন যুক্ত করা হবে
                </div>
              ) : (
                suggestionPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="card-cosmic flex items-center justify-between gap-3 rounded-2xl p-3.5 sm:p-4 border border-white/10 hover:border-amber-400/40 transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5C76A]/20 text-[#F5C76A] border border-[#F5C76A]/30">
                        <Lightbulb className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm sm:text-base font-bold text-white">
                          {post.title}
                        </p>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          {new Date(post.created_at).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {post.video_url ? (
                        <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs font-bold border-white/20 text-white hover:bg-white/10" asChild>
                          <a href={post.video_url} target="_blank" rel="noopener noreferrer">
                            দেখুন <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="h-8 rounded-xl text-xs font-bold text-[#F5C76A] hover:bg-[#F5C76A]/10" asChild>
                          <Link to="/notice">বিস্তারিত</Link>
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* PDF Study Materials & Handnotes */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Download className="h-5 w-5 text-[#16A878]" />
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">PDF নোট ও শিট</h3>
              </div>
              <Link to="/notes" className="text-xs sm:text-sm font-bold text-[#F5C76A] hover:underline">
                সব PDF
              </Link>
            </div>

            <div className="space-y-3">
              {pdfPosts.length === 0 ? (
                <div className="card-cosmic rounded-2xl p-6 text-center text-xs sm:text-sm text-slate-300">
                  শীঘ্রই নতুন PDF নোট আপলোড করা হবে
                </div>
              ) : (
                pdfPosts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, x: 15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="card-cosmic flex items-center justify-between gap-3 rounded-2xl p-3.5 sm:p-4 border border-white/10 hover:border-emerald-400/40 transition-all shadow-md"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#16A878]/20 text-[#16A878] border border-[#16A878]/30">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm sm:text-base font-bold text-white">
                          {post.title}
                        </p>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">
                          PDF ফরম্যাট · সরাসরি ডাউনলোড
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Button size="sm" className="h-8 rounded-xl text-xs font-bold gap-1 bg-gradient-to-r from-[#16A878] to-[#059669] text-white hover:brightness-110 shadow-sm" asChild>
                        <a href={post.pdf_url!} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3" /> ডাউনলোড
                        </a>
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10MS Course & Lesson Grid with Segmented Switcher */}
      <section className="bg-[#0B1026]/30 py-14 sm:py-20 border-t border-white/10">
        <div className="container px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-md">
                সকল পাঠ্যক্রম ও অধ্যায় সমাধান
              </h2>
              <p className="text-sm sm:text-base text-slate-200 font-semibold mt-1">
                ক্লাস ফিল্টার করে পছন্দমতো অধ্যায় এবং ডাউনলোডযোগ্য শিট সংগ্রহ করুন
              </p>
            </div>

            {/* Segmented Filter Tabs */}
            <div className="flex items-center gap-1.5 p-1 bg-[#0B1026] rounded-2xl border border-white/10 overflow-x-auto max-w-full">
              {[
                { id: "all", label: "সকল ক্লাস" },
                { id: "class-1-5", label: "১ম–৫ম" },
                { id: "class-6-8", label: "৬ষ্ঠ–৮ম" },
                { id: "ssc", label: "এসএসসি" },
                { id: "hsc", label: "এইচএসসি" },
                { id: "honours", label: "অনার্স" },
                { id: "ma", label: "মাস্টার্স" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedClassTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    selectedClassTab === tab.id
                      ? "bg-[#16A878] text-white shadow-md"
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Grid */}
          {displayedPosts.length === 0 ? (
            <div className="card-cosmic rounded-3xl p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-base font-bold text-white">
                এই ক্যাটাগরিতে কোনো কনটেন্ট পাওয়া যায়নি
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                অন্য কোনো শ্রেণি বা সার্চ কীওয়ার্ড দিয়ে আবার চেষ্টা করুন।
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-xl text-xs border-white/20"
                onClick={() => {
                  setSelectedClassTab("all");
                  setSearchQuery("");
                }}
              >
                সব পোস্ট দেখুন
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {displayedPosts.map((post, i) => {
                const ytId = post.video_url ? getYouTubeId(post.video_url) : null;
                const isPremium = (post as any).is_premium || ((post as any).price && Number((post as any).price) > 0);

                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="card-cosmic rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {ytId && (
                        <div className="aspect-video bg-black">
                          <iframe
                            src={`https://www.youtube.com/embed/${ytId}`}
                            title={post.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {!ytId && post.image_url && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.image_url}
                            alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold text-[#16A878] uppercase tracking-wide">
                            {post.category || "সাধারণ পাঠ"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(post.created_at).toLocaleDateString("bn-BD")}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {post.title}
                        </h3>

                        {post.content && (
                          <p className="mt-2 line-clamp-2 text-xs text-foreground/80 leading-relaxed">
                            {post.content}
                          </p>
                        )}

                        {/* Chapter Table */}
                        {Array.isArray((post as any).chapters) && (post as any).chapters.length > 0 && (
                          <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                            <table className="w-full text-[11px] sm:text-xs">
                              <thead className="bg-white/10 text-[#F5C76A]">
                                <tr>
                                  <th className="p-2 text-left">ক্রম</th>
                                  <th className="p-2 text-left">অধ্যায়</th>
                                  <th className="p-2 text-center">PDF</th>
                                </tr>
                              </thead>
                              <tbody>
                                {((post as any).chapters as { title: string; url: string }[]).map((c, idx) => (
                                  <tr key={idx} className="border-t border-white/10 odd:bg-white/5">
                                    <td className="p-2">{(idx + 1).toLocaleString("bn-BD")}</td>
                                    <td className="p-2">{c.title}</td>
                                    <td className="p-2 text-center">
                                      <ChapterPdfAction
                                        postId={post.id}
                                        postTitle={post.title}
                                        isPaid={Boolean((post as any).is_paid)}
                                        chapter={c}
                                        chapterIndex={idx}
                                      />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-4 sm:p-5 pt-0">
                      {isPremium ? (
                        <div className="pt-2 border-t border-white/10">
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
                        </div>
                      ) : (
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                          <span className="text-xs text-[#16A878] font-semibold">
                            সম্পূর্ণ ফ্রি
                          </span>
                          {post.pdf_url && (
                            <Button size="sm" className="h-7 text-xs rounded-lg gap-1 bg-white/10 hover:bg-white/20 text-white" asChild>
                              <a href={post.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-3 w-3" /> ডাউনলোড
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs border-white/15"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> পূর্ববর্তী
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  className={`h-8 w-8 rounded-xl text-xs p-0 ${
                    page === currentPage ? "bg-[#16A878] text-white" : "border-white/15"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page.toLocaleString("bn-BD")}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl text-xs border-white/15"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                পরবর্তী <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Featured Educator: Sujoy Sir Profile Spotlight */}
      <section className="py-12 sm:py-16">
        <div className="container px-4 sm:px-6">
          <div className="card-cosmic rounded-3xl p-6 sm:p-10 border border-[#F5C76A]/30">
            <div className="grid items-center gap-8 md:grid-cols-12">
              <div className="md:col-span-4 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#6C4AE6] to-[#F5C76A] opacity-25 blur-xl" />
                  <img
                    src={sujoySirImg}
                    alt="Sujoy Chowdhury"
                    className="relative h-64 w-64 rounded-3xl object-cover shadow-2xl border-2 border-[#F5C76A]/40"
                  />
                  <div className="absolute -bottom-3 -right-3 rounded-2xl bg-[#0B1026] border border-[#F5C76A]/40 px-3.5 py-1.5 shadow-xl flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-[#F5C76A]" />
                    <span className="text-xs font-bold text-white">
                      MBA (Accounting)
                    </span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-8">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#16A878]/15 border border-[#16A878]/30 px-3 py-1 text-xs font-semibold text-[#16A878]">
                  <CheckCircle2 className="h-3.5 w-3.5" /> প্রতিষ্ঠাতা ও প্রধান শিক্ষক
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  সুজয় চৌধুরী (Sujoy Sir)
                </h2>

                <p className="text-sm text-[#F5C76A] font-bold mt-1">
                  Senior Teacher & Educational Content Creator
                </p>

                <p className="text-sm leading-relaxed text-foreground/80 mt-3">
                  "আমার লক্ষ্য বাংলাদেশের প্রতিটি শিক্ষার্থীর কাছে গুণগত মানসম্পন্ন শিক্ষা সহজলভ্য করে তোলা। 
                  কোনো শিক্ষার্থী যেন সঠিক দিকনির্দেশনার অভাবে পিছিয়ে না পড়ে—সেই উদ্দেশ্যেই জ্ঞানচর্চা'লয়ের জন্ম।"
                </p>

                <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-xs text-muted-foreground">শিক্ষকতার অভিজ্ঞতা</span>
                    <p className="text-base font-black text-white">১০+ বছর</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <span className="text-xs text-muted-foreground">বিশেষজ্ঞতা</span>
                    <p className="text-base font-black text-white">অ্যাকাউন্টিং ও গণিত</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 col-span-2 sm:col-span-1">
                    <span className="text-xs text-muted-foreground">ইউটিউব প্ল্যাটফর্ম</span>
                    <p className="text-base font-black text-white">হাজারো শিক্ষার্থী</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button size="sm" className="rounded-xl text-xs bg-[#F5C76A] text-[#080A12] font-bold hover:bg-[#ffd98a]" asChild>
                    <Link to="/about">সম্পূর্ণ পরিচিতি পড়ুন</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl text-xs border-white/20" asChild>
                    <Link to="/contact">সরাসরি যোগাযোগ করুন</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10MS Student & Parent Success Gallery matching Pages 18-20, 24-26 & 44 */}
      <StudentSuccessGallery />

      {/* 10MS Mobile App & Web Platform Showcase matching Pages 21-23 & 45 */}
      <AppShowcaseSection />

      {/* Photo Gallery */}
      <PhotoGallery />

      {/* Advertisement Area */}
      <AdBox />

      {/* AI Chatbot */}
      <AIChatbot />

      {/* 3D Harry Potter Flying Broomstick & AI Portal Animation */}
      <MagicalBroomstickAnimation />
    </div>
  );
};

export default Index;
