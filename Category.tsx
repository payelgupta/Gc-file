import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  BookOpen, 
  Play, 
  FileText, 
  Download, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Award,
  CheckSquare,
  Square
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import PremiumUnlock from "@/components/premium/PremiumUnlock";
import ChapterPdfAction from "@/components/common/ChapterPdfAction";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"posts">;

const categoryInfo: Record<string, { title: string; icon: string; desc: string }> = {
  "class-1-5": { title: "Class 1–5", icon: "📚", desc: "Primary Education — প্রাথমিক শিক্ষা (বাংলা, ইংরেজি, গণিত ও পরিবেশ)" },
  "class-6-8": { title: "Class 6–8", icon: "📖", desc: "Junior Secondary — মাধ্যমিক শিক্ষা ও নতুন কারিকুলাম সমাধান" },
  "ssc": { title: "SSC প্রস্তুতি", icon: "🎓", desc: "SSC Examination — বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা বুলেট সাজেশন" },
  "hsc": { title: "HSC প্রস্তুতি", icon: "🏆", desc: "HSC Examination — হিসাববিজ্ঞান, ফিন্যান্স, আইসিটি ও সাধারণ বিষয়" },
  "honours": { title: "অনার্স ও ডিগ্রি", icon: "📘", desc: "Degree Level — জাতীয় বিশ্ববিদ্যালয়ের একাউন্টিং ও ডিগ্রি কোর্স" },
  "ma": { title: "মাস্টার্স ও প্রফেশনাল", icon: "🎯", desc: "Masters & MBA — স্পেশালাইজড বিজনেস ও অ্যাডভান্সড গাইডলাইন" },
};

const getYouTubeId = (url: string) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match?.[1] || null;
};

const Category = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const info = categoryInfo[slug || ""] || { title: slug || "ক্লাস", icon: "📚", desc: "জ্ঞানচর্চা'লয় শিক্ষামূলক পাঠ্যক্রম" };
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Accordion state: Set of opened post/chapter IDs
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>({});

  // Student progress state: completed chapter IDs stored in localStorage
  const [completedChapters, setCompletedChapters] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`progress_${slug}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    // 1. Immediately reset scroll position to the very top
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const fetchPosts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("category", slug || "")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      const fetched = data || [];
      setPosts(fetched);
      setLoading(false);

      // By default open the first chapter accordion
      if (fetched.length > 0) {
        setOpenChapters({ [fetched[0].id]: true });
      }

      // Re-affirm top scroll when data renders
      requestAnimationFrame(() => {
        try {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        } catch {
          window.scrollTo(0, 0);
        }
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    };

    fetchPosts();
  }, [slug]);

  // Toggle chapter accordion open/close
  const toggleChapter = (id: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Toggle student progress completion
  const toggleCompletion = (id: string) => {
    setCompletedChapters((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(`progress_${slug}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Calculate completion percentage
  const totalCount = posts.length;
  const completedCount = useMemo(() => {
    return posts.filter((p) => completedChapters[p.id]).length;
  }, [posts, completedChapters]);

  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#080A12] text-white py-8 sm:py-12 font-bengali">
      <div className="container px-4 sm:px-6 max-w-5xl mx-auto">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
              navigate("/");
            }}
            className="rounded-xl font-bengali text-xs sm:text-sm gap-1 hover:bg-white/10 text-white"
          >
            <ArrowLeft className="h-4 w-4" /> হোমে ফিরে যান
          </Button>

          <span className="text-xs text-muted-foreground hidden sm:inline-block">
            জ্ঞানচর্চা'লয় · {info.title}
          </span>
        </div>

        {/* Course Header Banner with Glowing Cosmic Backdrop */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-cosmic rounded-3xl p-6 sm:p-10 mb-8 border border-[#F5C76A]/30 relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#6C4AE6]/20 blur-3xl" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start sm:items-center gap-4">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6C4AE6]/30 via-[#F5C76A]/20 to-[#48D9F5]/30 border border-[#F5C76A]/40 text-4xl shadow-lg">
                {info.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-[#16A878]/20 border border-[#16A878]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#16A878]">
                    অধ্যায়ভিত্তিক পাঠ্যক্রম
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {totalCount}টি অধ্যায়
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                  {info.title}
                </h1>
                <p className="text-xs sm:text-sm text-foreground/80 mt-1 max-w-xl">
                  {info.desc}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0">
              <Link to="/dashboard">
                <Button size="sm" variant="outline" className="rounded-xl text-xs font-bold border-white/20 hover:border-[#F5C76A]">
                  <Award className="h-3.5 w-3.5 mr-1.5 text-[#F5C76A]" /> আমার প্রগ্রেস দেখুন
                </Button>
              </Link>
            </div>
          </div>

          {/* Student Progress Tracker Bar (User Request) */}
          {totalCount > 0 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#16A878]" /> আপনার অধ্যায় প্রগ্রেস:
                </span>
                <span className="text-[#F5C76A] font-bold">
                  {completedCount}/{totalCount} অধ্যায় সম্পন্ন ({progressPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden border border-white/10 relative">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-[#16A878] via-[#48D9F5] to-[#F5C76A] shadow-[0_0_12px_rgba(22,168,120,0.8)]"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                * যে অধ্যায়গুলো আপনার পড়া শেষ হয়েছে, সেগুলোতে 'অধ্যায়টি সম্পন্ন করেছি' বক্সে টিক দিন।
              </p>
            </div>
          )}
        </motion.div>

        {/* Content Section: Chapter-Wise Dropdown Accordions */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#16A878] border-t-transparent" />
            <p className="text-sm text-muted-foreground">অধ্যায়ভিত্তিক সিলেবাস লোড হচ্ছে...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="card-cosmic flex flex-col items-center justify-center rounded-3xl p-12 sm:p-16 text-center border border-white/10">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground mb-4">
              <BookOpen className="h-8 w-8" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              শীঘ্রই এই শ্রেণির নতুন অধ্যায় ও সাজেশন যুক্ত হবে
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto mt-1">
              সুজয় স্যার নিয়মিত নতুন ভিডিও লেকচার ও সাজেশন আপলোড করছেন। অন্যান্য শ্রেণির কনটেন্ট দেখতে হোমে ফিরে যান।
            </p>
            <Button
              className="mt-6 rounded-xl text-xs bg-[#16A878] text-white"
              onClick={() => {
                window.scrollTo({ top: 0, left: 0, behavior: "instant" });
                navigate("/");
              }}
            >
              অন্যান্য ক্লাস দেখুন
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 mb-2">
              <h3 className="text-sm font-bold text-[#F5C76A] flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> অধ্যায়ভিত্তিক পাঠ ও রিসোর্স তালিকা
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    const allOpen: Record<string, boolean> = {};
                    posts.forEach((p) => { allOpen[p.id] = true; });
                    setOpenChapters(allOpen);
                  }}
                  className="text-muted-foreground hover:text-white cursor-pointer"
                >
                  সবগুলো খুলুন
                </button>
                <span>·</span>
                <button
                  onClick={() => setOpenChapters({})}
                  className="text-muted-foreground hover:text-white cursor-pointer"
                >
                  সবগুলো বন্ধ করুন
                </button>
              </div>
            </div>

            {posts.map((post, i) => {
              const ytId = post.video_url ? getYouTubeId(post.video_url) : null;
              const isPremium = (post as any).is_paid || (post as any).is_premium || ((post as any).price && Number((post as any).price) > 0);
              const isOpen = !!openChapters[post.id];
              const isCompleted = !!completedChapters[post.id];

              return (
                <div
                  key={post.id}
                  className={`card-cosmic rounded-2xl overflow-hidden border transition-all duration-300 ${
                    isOpen ? "border-[#F5C76A]/40 bg-[#0B1026]/90 shadow-xl" : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Accordion Header Bar */}
                  <div
                    onClick={() => toggleChapter(post.id)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Checkbox for Completion */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompletion(post.id);
                        }}
                        className="text-muted-foreground hover:text-[#16A878] transition-colors shrink-0"
                        title={isCompleted ? "সম্পন্ন হিসেবে চিহ্নিত" : "সম্পন্ন করুন"}
                      >
                        {isCompleted ? (
                          <CheckSquare className="h-5 w-5 text-[#16A878]" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-bold text-[#16A878] uppercase">
                            অধ্যায় {(i + 1).toLocaleString("bn-BD")}
                          </span>
                          {isCompleted && (
                            <span className="rounded-full bg-[#16A878]/20 px-2 py-0.2 text-[9px] font-bold text-[#16A878]">
                              ✓ সম্পন্ন
                            </span>
                          )}
                          {isPremium && (
                            <span className="rounded-full bg-[#F5C76A]/20 px-2 py-0.2 text-[9px] font-bold text-[#F5C76A]">
                              প্রিমিয়াম
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-white truncate">
                          {post.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
                        {isOpen ? "লুকান" : "বিস্তারিত দেখুন"}
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground">
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Accordion Expandable Body */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="border-t border-white/10 p-4 sm:p-6 bg-black/30"
                      >
                        {/* Video lecture player */}
                        {ytId ? (
                          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mb-4 border border-white/10 shadow-lg">
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}`}
                              title={post.title}
                              className="h-full w-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : post.image_url ? (
                          <div className="aspect-video w-full rounded-xl overflow-hidden mb-4 border border-white/10">
                            <img src={post.image_url} alt={post.title} className="h-full w-full object-cover" />
                          </div>
                        ) : null}

                        {/* Chapter summary text */}
                        {post.content && (
                          <div className="text-xs sm:text-sm text-foreground/85 leading-relaxed mb-4">
                            <p>{post.content}</p>
                          </div>
                        )}

                        {/* Chapter table if chapters exist */}
                        {Array.isArray((post as any).chapters) && (post as any).chapters.length > 0 && (
                          <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-black/40">
                            <table className="w-full text-[11px] sm:text-xs">
                              <thead className="bg-white/10 text-[#F5C76A]">
                                <tr>
                                  <th className="p-2.5 text-left">ক্রম</th>
                                  <th className="p-2.5 text-left">টপিক / লেকচার</th>
                                  <th className="p-2.5 text-center">PDF</th>
                                </tr>
                              </thead>
                              <tbody>
                                {((post as any).chapters as { title: string; url: string }[]).map((c, idx) => (
                                  <tr key={idx} className="border-t border-white/10 odd:bg-white/5">
                                    <td className="p-2.5">{(idx + 1).toLocaleString("bn-BD")}</td>
                                    <td className="p-2.5">{c.title}</td>
                                    <td className="p-2.5 text-center">
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

                        {/* Actions bar inside chapter */}
                        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => toggleCompletion(post.id)}
                            className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-foreground/90 hover:text-[#16A878]"
                          >
                            {isCompleted ? (
                              <CheckSquare className="h-4 w-4 text-[#16A878]" />
                            ) : (
                              <Square className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span>{isCompleted ? "অধ্যায়টি সম্পন্ন হয়েছে" : "অধ্যায়টি সম্পন্ন হিসেবে চিহ্নিত করুন"}</span>
                          </button>

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
                            <div className="flex items-center gap-2">
                              {post.pdf_url && (
                                <Button size="sm" className="h-8 rounded-xl text-xs gap-1.5 bg-[#16A878] text-white hover:bg-[#11855e]" asChild>
                                  <a href={post.pdf_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="h-3.5 w-3.5" /> হ্যান্ডনোট ডাউনলোড
                                  </a>
                                </Button>
                              )}
                              {post.video_url && !ytId && (
                                <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs border-white/20" asChild>
                                  <a href={post.video_url} target="_blank" rel="noopener noreferrer">
                                    <Play className="h-3.5 w-3.5" /> ভিডিও প্লেয়ার
                                  </a>
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
