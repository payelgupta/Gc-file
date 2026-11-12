import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, ShieldCheck } from "lucide-react";

interface DownloadRequest {
  id: string;
  user_id: string;
  post_id: string;
  status: string;
  created_at: string;
  post_title?: string;
  user_email?: string;
}

const AdminDownloadRequests = () => {
  const [requests, setRequests] = useState<DownloadRequest[]>([]);
  const { toast } = useToast();

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("download_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) {
      const postIds = [...new Set(data.map(r => r.post_id))];
      const userIds = [...new Set(data.map(r => r.user_id))];
      
      const { data: posts } = await supabase.from("posts").select("id, title").in("id", postIds);
      const postMap = new Map(posts?.map(p => [p.id, p.title]) || []);

      // Fetch user emails from login activity
      const { data: activities } = await supabase
        .from("user_login_activity")
        .select("user_id, email")
        .in("user_id", userIds);
      const emailMap = new Map(activities?.map(a => [a.user_id, a.email]) || []);

      setRequests(data.map(r => ({
        ...r,
        post_title: postMap.get(r.post_id) || "Unknown",
        user_email: emailMap.get(r.user_id) || r.user_id.slice(0, 8) + "...",
      })));
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id: string, userId: string, postTitle: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("download_requests").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    
    // Send notification to user
    await supabase.from("notifications").insert({
      user_id: userId,
      title: status === "approved" ? "ডাউনলোড অনুমোদিত ✅" : "ডাউনলোড প্রত্যাখ্যাত ❌",
      message: `আপনার "${postTitle}" ফাইলের ডাউনলোড রিকোয়েস্ট ${status === "approved" ? "অনুমোদিত" : "প্রত্যাখ্যাত"} হয়েছে।`,
    });

    toast({ title: status === "approved" ? "অনুমোদিত!" : "প্রত্যাখ্যাত!" });
    fetchRequests();
  };

  const statusIcon = (status: string) => {
    if (status === "approved") return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">← ব্যাক</Button>
        <ShieldCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">ডাউনলোড রিকোয়েস্ট</h1>
          <p className="text-sm text-muted-foreground">ইউজারদের ফাইল ডাউনলোড অনুরোধ পরিচালনা করুন</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {requests.map(req => (
          <div key={req.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                {statusIcon(req.status)}
                <p className="font-medium text-foreground truncate">{req.post_title}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                📧 {req.user_email} • {new Date(req.created_at).toLocaleDateString()} • 
                <span className={`ml-1 font-medium ${req.status === "approved" ? "text-green-500" : req.status === "rejected" ? "text-destructive" : "text-yellow-500"}`}>
                  {req.status}
                </span>
              </p>
            </div>
            {req.status === "pending" && (
              <div className="flex gap-2 ml-3">
                <Button size="sm" variant="outline" className="text-green-600" onClick={() => handleAction(req.id, req.user_id, req.post_title || "", "approved")}>
                  <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleAction(req.id, req.user_id, req.post_title || "", "rejected")}>
                  <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            )}
          </div>
        ))}
        {requests.length === 0 && <p className="text-center text-muted-foreground py-8">কোনো রিকোয়েস্ট নেই</p>}
      </div>
    </div>
  );
};

export default AdminDownloadRequests;
