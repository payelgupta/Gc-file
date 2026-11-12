import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdminUnlockRequests = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState<any[]>([]);
  const [nums, setNums] = useState({ bkash_number: "", nagad_number: "", payment_type: "সেন্ড মানি" });

  const load = async () => {
    const { data } = await supabase.from("pdf_unlock_requests").select("*, posts(title)").order("created_at", { ascending: false });
    setRows(data || []);
  };
  useEffect(() => {
    load();
    supabase.from("site_settings").select("key,value").in("key", Object.keys(nums)).then(({ data }) =>
      setNums(n => ({ ...n, ...Object.fromEntries((data || []).map(r => [r.key, r.value || ""])) })));
  }, []);

  const saveNums = async () => {
    for (const [key, value] of Object.entries(nums)) {
      const { data } = await supabase.from("site_settings").select("id").eq("key", key).maybeSingle();
      if (data) await supabase.from("site_settings").update({ value }).eq("key", key);
      else await supabase.from("site_settings").insert({ key, value });
    }
    toast({ title: "পেমেন্ট নম্বর সেভ হয়েছে" });
  };

  const setStatus = async (r: any, status: string) => {
    const { error } = await supabase.from("pdf_unlock_requests").update({ status }).eq("id", r.id);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    await supabase.from("notifications").insert({
      user_id: r.user_id,
      title: status === "approved" ? "🎉 অভিনন্দন! আপনার পিডিএফ আনলক হয়েছে" : "পেমেন্ট যাচাই সফল হয়নি",
      message: `${r.posts?.title || "পিডিএফ"} — ${status === "approved" ? "এখন ডাউনলোড করতে পারবেন।" : "সঠিক TrxID দিয়ে আবার চেষ্টা করুন।"}`,
    });
    toast({ title: status === "approved" ? "অনুমোদিত ✅" : "বাতিল করা হয়েছে" });
    load();
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>← ব্যাক</Button>
      <h1 className="font-bengali text-2xl font-bold">পেইড পিডিএফ আনলক রিকোয়েস্ট</h1>

      <div className="card-elevated grid gap-3 rounded-xl bg-card p-4 sm:grid-cols-4 sm:items-end">
        <div><Label>বিকাশ নম্বর</Label><Input value={nums.bkash_number} onChange={e => setNums({ ...nums, bkash_number: e.target.value })} /></div>
        <div><Label>নগদ নম্বর</Label><Input value={nums.nagad_number} onChange={e => setNums({ ...nums, nagad_number: e.target.value })} /></div>
        <div><Label>ধরন (সেন্ড মানি/পেমেন্ট)</Label><Input value={nums.payment_type} onChange={e => setNums({ ...nums, payment_type: e.target.value })} /></div>
        <Button onClick={saveNums}>সেভ করুন</Button>
      </div>

      <div className="space-y-3">
        {rows.length === 0 && <p className="text-sm text-muted-foreground">কোনো রিকোয়েস্ট নেই</p>}
        {rows.map(r => (
          <div key={r.id} className="card-elevated flex flex-col gap-2 rounded-xl bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              <div className="font-semibold">{r.posts?.title}</div>
              <div className="text-muted-foreground">{r.email} · {r.method === "bkash" ? "বিকাশ" : "নগদ"} · {r.sender_number}</div>
              <div>TrxID: <b>{r.trx_id}</b> · ৳{r.amount} · {new Date(r.created_at).toLocaleString("bn-BD")}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-2 py-1 text-xs ${r.status === "approved" ? "bg-primary/15 text-primary" : r.status === "rejected" ? "bg-destructive/15 text-destructive" : "bg-accent/20"}`}>{r.status}</span>
              {r.status === "pending" && <>
                <Button size="sm" onClick={() => setStatus(r, "approved")}><Check className="h-4 w-4" /> Approve</Button>
                <Button size="sm" variant="destructive" onClick={() => setStatus(r, "rejected")}><X className="h-4 w-4" /></Button>
              </>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminUnlockRequests;
