import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Download, 
  BookOpen, 
  Bot, 
  User, 
  LogOut, 
  ChevronRight,
  ShieldAlert,
  Search,
  Loader2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UnlockRecord {
  id: string;
  post_id: string;
  trx_id: string;
  method: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  post_title?: string;
  file_url?: string | null;
}

const StudentDashboard = () => {
  const { user, signOut, loading: authLoading } = useAuth() as any;
  const navigate = useNavigate();
  const [records, setRecords] = useState<UnlockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"unlocked" | "requests" | "classes">("unlocked");
  const [filterQuery, setFilterQuery] = useState("");
  const [downloadingPostId, setDownloadingPostId] = useState<string | null>(null);

  const handleDownloadPdf = async (postId: string, rawUrl?: string | null) => {
    if (rawUrl && (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) && !rawUrl.includes("premium-pdfs")) {
      window.open(rawUrl, "_blank", "noopener,noreferrer");
      return;
    }

    try {
      setDownloadingPostId(postId);
      const { data, error } = await supabase.functions.invoke("get-premium-pdf", {
        body: { post_id: postId },
      });

      if (error || !data?.signedUrl) {
        toast({
          title: "ডাউনলোড লিংক তৈরি করা যায়নি",
          description: data?.error || error?.message || "নিরাপদ PDF লিংক পেতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।",
          variant: "destructive",
        });
        return;
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast({
        title: "ত্রুটি",
        description: err?.message || "PDF লিংক তৈরি করা যায়নি।",
        variant: "destructive",
      });
    } finally {
      setDownloadingPostId(null);
    }
  };

  const fetchStudentData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch user's pdf unlock requests
      const { data: reqs, error } = await supabase
        .from("pdf_unlock_requests")
        .select("id, post_id, trx_id, method, amount, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (reqs && reqs.length > 0) {
        const postIds = Array.from(new Set(reqs.map((r) => r.post_id)));
        
        // Fetch post titles
        const { data: postsData } = await supabase
          .from("posts")
          .select("id, title, pdf_url")
          .in("id", postIds);

        const postMap = new Map((postsData || []).map((p) => [p.id, p]));

        // Fetch premium file urls for approved requests
        const approvedPostIds = reqs.filter((r) => r.status === "approved").map((r) => r.post_id);
        let fileMap = new Map<string, string>();
        if (approvedPostIds.length > 0) {
          const { data: files } = await supabase
            .from("premium_files")
            .select("post_id, file_url")
            .in("post_id", approvedPostIds);
          fileMap = new Map((files || []).map((f) => [f.post_id, f.file_url]));
        }

        const enriched: UnlockRecord[] = reqs.map((r) => {
          const p = postMap.get(r.post_id);
          const fUrl = fileMap.get(r.post_id) || p?.pdf_url || null;
          return {
            ...r,
            status: r.status as "pending" | "approved" | "rejected",
            post_title: p?.title || "শিক্ষামূলক স্টাডি মেটেরিয়াল",
            file_url: fUrl,
          };
        });

        setRecords(enriched);
      } else {
        setRecords([]);
      }
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      toast({
        title: "ডেটা লোড করতে সমস্যা হয়েছে",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }

    if (user) {
      fetchStudentData();
    }
  }, [user, authLoading, navigate, fetchStudentData]);

  const approvedList = records.filter((r) => r.status === "approved");
  const pendingList = records.filter((r) => r.status === "pending");
  const rejectedList = records.filter((r) => r.status === "rejected");

  const filteredApproved = approvedList.filter((item) =>
    (item.post_title || "").toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="container min-h-[60vh] flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-bengali text-sm text-muted-foreground">শিক্ষার্থী ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 sm:py-12">
      <div className="container px-4 sm:px-6 max-w-6xl">
        {/* Top Header Card */}
        <div className="card-glossy rounded-3xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-bengali text-xl font-bold text-foreground sm:text-2xl">
                    শিক্ষার্থী ড্যাশবোর্ড
                  </h1>
                  <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    ভেরিফাইড শিক্ষার্থী
                  </span>
                </div>
                <p className="font-bengali text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {user?.email}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl text-xs font-bengali"
                asChild
              >
                <Link to="/classes">
                  <BookOpen className="h-3.5 w-3.5 text-primary" /> সব ক্লাস
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-xl text-xs font-bengali text-destructive hover:bg-destructive/10"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
              >
                <LogOut className="h-3.5 w-3.5" /> লগআউট
              </Button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="card-glossy rounded-2xl p-4 bg-primary/5">
              <div className="flex items-center justify-between">
                <span className="font-bengali text-xs text-muted-foreground">অনুমোদিত PDF</span>
                <CheckCircle2 className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 font-bengali text-2xl font-black text-foreground">
                {approvedList.length}
              </div>
              <span className="font-bengali text-[10px] text-muted-foreground">সরাসরি ডাউনলোডযোগ্য</span>
            </div>

            <div className="card-glossy rounded-2xl p-4 bg-amber-500/5">
              <div className="flex items-center justify-between">
                <span className="font-bengali text-xs text-muted-foreground">যাচাইকরণাধীন</span>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 font-bengali text-2xl font-black text-foreground">
                {pendingList.length}
              </div>
              <span className="font-bengali text-[10px] text-muted-foreground">পেমেন্ট চেকিং চলছে</span>
            </div>

            <div className="card-glossy rounded-2xl p-4 bg-emerald-500/5">
              <div className="flex items-center justify-between">
                <span className="font-bengali text-xs text-muted-foreground">মোট পেমেন্ট রিকোয়েস্ট</span>
                <FileText className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 font-bengali text-2xl font-black text-foreground">
                {records.length}
              </div>
              <span className="font-bengali text-[10px] text-muted-foreground">আজীবন অ্যাক্সেস হিস্ট্রি</span>
            </div>

            <div className="card-glossy rounded-2xl p-4 bg-blue-500/5">
              <div className="flex items-center justify-between">
                <span className="font-bengali text-xs text-muted-foreground">২৪/৭ AI শিক্ষক</span>
                <Bot className="h-4 w-4 text-blue-500" />
              </div>
              <div className="mt-2 font-bengali text-base font-bold text-foreground">
                সক্রিয়
              </div>
              <span className="font-bengali text-[10px] text-muted-foreground">আনলিমিটেড ফ্রি স্টাডি হেল্প</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-border pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab("unlocked")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bengali font-semibold transition-all whitespace-nowrap ${
              activeTab === "unlocked"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            আমার আনলক করা PDF ({approvedList.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bengali font-semibold transition-all whitespace-nowrap ${
              activeTab === "requests"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            অনুরোধ ও পেমেন্ট হিস্ট্রি ({records.length})
          </button>
          <button
            onClick={() => setActiveTab("classes")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bengali font-semibold transition-all whitespace-nowrap ${
              activeTab === "classes"
                ? "bg-primary text-primary-foreground shadow-md"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            কোর্স ও ক্লাস ব্রাউজার
          </button>
        </div>

        {/* Tab 1: Unlocked PDFs */}
        {activeTab === "unlocked" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="font-bengali text-lg font-bold text-foreground">
                  আনলক করা প্রিমিয়াম নোট ও শিট
                </h2>
                <p className="font-bengali text-xs text-muted-foreground">
                  অনুমোদিত সকল ফাইল আপনি আজীবন যে কোনো ডিভাইসে ডাউনলোড করে পড়তে পারবেন।
                </p>
              </div>

              {approvedList.length > 0 && (
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="নোট খুঁজুন..."
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-input bg-card text-xs sm:text-sm outline-none focus:ring-2 focus:ring-primary font-bengali"
                  />
                </div>
              )}
            </div>

            {filteredApproved.length === 0 ? (
              <div className="card-glossy rounded-3xl p-10 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="font-bengali text-base font-semibold text-foreground">
                  {approvedList.length === 0 ? "এখনো কোনো প্রিমিয়াম PDF আনলক করা নেই" : "কোনো ফলাফল পাওয়া যায়নি"}
                </h3>
                <p className="font-bengali text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  ক্লাসভিত্তিক পেজে গিয়ে পছন্দের সাজেশনের নিচে "আনলক করুন" বাটনে ক্লিক করে আনলক করতে পারবেন।
                </p>
                <Button className="mt-5 rounded-xl font-bengali text-xs" asChild>
                  <Link to="/suggestions">সাজেশন ও নোট দেখুন</Link>
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredApproved.map((item) => (
                  <div key={item.id} className="card-glossy rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          <CheckCircle2 className="h-3 w-3" /> আজীবন অ্যাক্সেস
                        </span>
                        <span className="font-bengali text-[10px] text-muted-foreground">
                          {new Date(item.created_at).toLocaleDateString("bn-BD")}
                        </span>
                      </div>
                      <h3 className="font-bengali text-sm font-bold text-card-foreground mt-3 line-clamp-2">
                        {item.post_title}
                      </h3>
                      <p className="font-bengali text-xs text-muted-foreground mt-1">
                        TrxID: <span className="font-mono text-foreground font-semibold">{item.trx_id}</span>
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between">
                      <span className="font-bengali text-xs font-semibold text-primary">
                        ৳{item.amount} পরিশোধিত
                      </span>
                      <Button
                        size="sm"
                        disabled={downloadingPostId === item.post_id}
                        onClick={() => handleDownloadPdf(item.post_id, item.file_url)}
                        className="rounded-xl gap-1.5 text-xs font-bengali"
                      >
                        {downloadingPostId === item.post_id ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>লিংক তৈরি হচ্ছে...</span>
                          </>
                        ) : (
                          <>
                            <Download className="h-3.5 w-3.5" />
                            <span>PDF ডাউনলোড</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Requests & Payments History */}
        {activeTab === "requests" && (
          <div>
            <h2 className="font-bengali text-lg font-bold text-foreground mb-1">
              সকল পেমেন্ট ও অনুমোদনের হিস্ট্রি
            </h2>
            <p className="font-bengali text-xs text-muted-foreground mb-6">
              বিকাশ বা নগদ-এ টাকা পাঠিয়ে রিকোয়েস্ট পাঠালে অ্যাডমিন যাচাই করে তা সক্রিয় করেন।
            </p>

            {records.length === 0 ? (
              <div className="card-glossy rounded-3xl p-10 text-center">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground/40 mb-3" />
                <h3 className="font-bengali text-base font-semibold text-foreground">
                  কোনো পেমেন্ট রিকোয়েস্ট জমা দেওয়া হয়নি
                </h3>
                <p className="font-bengali text-xs text-muted-foreground max-w-md mx-auto mt-1">
                  যে কোনো পেইড PDF আনলক করতে চাইলে bKash বা Nagad-এ সেন্ড মানি করে TrxID দিয়ে আবেদন করুন।
                </p>
              </div>
            ) : (
              <div className="card-glossy rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-bengali text-xs sm:text-sm">
                    <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                      <tr>
                        <th className="p-3 sm:p-4">তারিখ</th>
                        <th className="p-3 sm:p-4">নোট / সাবজেক্ট</th>
                        <th className="p-3 sm:p-4">মেথড</th>
                        <th className="p-3 sm:p-4">TrxID</th>
                        <th className="p-3 sm:p-4">পরিমাণ</th>
                        <th className="p-3 sm:p-4 text-center">স্ট্যাটাস</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {records.map((r) => (
                        <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                          <td className="p-3 sm:p-4 whitespace-nowrap text-muted-foreground">
                            {new Date(r.created_at).toLocaleDateString("bn-BD")}
                          </td>
                          <td className="p-3 sm:p-4 font-semibold text-foreground max-w-xs truncate">
                            {r.post_title}
                          </td>
                          <td className="p-3 sm:p-4 uppercase font-semibold text-foreground">
                            {r.method}
                          </td>
                          <td className="p-3 sm:p-4 font-mono font-bold text-foreground">
                            {r.trx_id}
                          </td>
                          <td className="p-3 sm:p-4 font-bold text-primary">
                            ৳{r.amount}
                          </td>
                          <td className="p-3 sm:p-4 text-center">
                            {r.status === "approved" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> অনুমোদিত
                              </span>
                            )}
                            {r.status === "pending" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                <Clock className="h-3 w-3" /> যাচাইাধীন
                              </span>
                            )}
                            {r.status === "rejected" && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 text-[11px] font-semibold text-destructive">
                                <XCircle className="h-3 w-3" /> বাতিল
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Classes & Course Browser */}
        {activeTab === "classes" && (
          <div>
            <h2 className="font-bengali text-lg font-bold text-foreground mb-1">
              শ্রেণি অনুযায়ী অধ্যায়ভিত্তিক পাঠ
            </h2>
            <p className="font-bengali text-xs text-muted-foreground mb-6">
              পছন্দের ক্লাসে প্রবেশ করে সরাসরি ভিডিও লেকচার, বই, হ্যান্ডনোট ও অধ্যায় সমাধান দেখুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "Class 1–5", title: "প্রাথমিক শিক্ষা", desc: "বাংলা, ইংরেজি, গণিত ও পরিবেশ পরিচিতি", slug: "class-1-5", icon: "📚" },
                { name: "Class 6–8", title: "জুনিয়র সেকেন্ডারি", desc: "নতুন কারিকুলাম ভিত্তিক সম্পূর্ণ সমাধান", slug: "class-6-8", icon: "📖" },
                { name: "SSC", title: "এসএসসি প্রস্তুতি", desc: "বিজ্ঞান, মানবিক ও ব্যবসায় শিক্ষা সাজেশন", slug: "ssc", icon: "🎓" },
                { name: "HSC", title: "এইচএসসি প্রস্তুতি", desc: "হিসাববিজ্ঞান, ফিন্যান্স, বাংলা ও আইসিটি", slug: "hsc", icon: "🏆" },
                { name: "Honours", title: "অনার্স ও ডিগ্রি", desc: "অ্যাকাউন্টিং, ম্যানেজমেন্ট ও ডিগ্রি কোর্স", slug: "honours", icon: "📘" },
                { name: "MA / MBA", title: "মাস্টার্স ও প্রফেশনাল", desc: "এডভান্সড বিজনেস ও স্পেশালাইজড গাইড", slug: "ma", icon: "🎯" },
              ].map((c) => (
                <Link
                  key={c.slug}
                  to={`/category/${c.slug}`}
                  className="card-glossy rounded-2xl p-5 hover:border-primary transition-all group flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{c.icon}</span>
                    <div>
                      <span className="font-bengali text-xs font-semibold text-primary">{c.name}</span>
                      <h3 className="font-bengali text-base font-bold text-foreground group-hover:text-primary transition-colors">
                        {c.title}
                      </h3>
                      <p className="font-bengali text-xs text-muted-foreground mt-0.5">
                        {c.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
