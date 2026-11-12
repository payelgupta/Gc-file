import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Lock, Download, Clock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Props { postId: string; title: string; price: number; discountPrice: number | null }

const PremiumUnlock = ({ postId, title, price, discountPrice }: Props) => {
  const { user } = useAuth() as any;
  const [status, setStatus] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [nums, setNums] = useState<Record<string, string>>({});
  const [method, setMethod] = useState("bkash");
  const [sender, setSender] = useState("");
  const [trx, setTrx] = useState("");
  const [busy, setBusy] = useState(false);
  const finalPrice = discountPrice ?? price;
  const isGmail = !!user?.email && /@gmail\.com$/i.test(user.email);

  useEffect(() => {
    supabase.from("site_settings").select("key,value").in("key", ["bkash_number", "nagad_number", "payment_type"])
      .then(({ data }) => setNums(Object.fromEntries((data || []).map(r => [r.key, r.value || ""]))));
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from("pdf_unlock_requests").select("status").eq("post_id", postId).eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
      const s = data?.[0]?.status ?? null;
      setStatus(s);
      if (s === "approved") {
        const { data: signedFile, error: fnError } = await supabase.functions.invoke("get-premium-pdf", {
          body: { post_id: postId },
        });
        if (fnError || !signedFile?.signedUrl) {
          console.error("Premium PDF signed link could not be generated:", fnError);
          setFileUrl(null);
        } else {
          setFileUrl(signedFile.signedUrl);
        }
      }
    })();
  }, [user, postId]);

  const submit = async () => {
    if (!/^01\d{9}$/.test(sender.trim())) return toast({ title: "সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন", variant: "destructive" });
    if (trx.trim().length < 6) return toast({ title: "সঠিক TrxID দিন", variant: "destructive" });
    setBusy(true);

    const cleanMethod = method.trim().toLowerCase();
    const cleanTrx = trx.trim().toUpperCase();

    // Idempotency pre-check: Block duplicate active transactions
    const { data: existingTrx } = await supabase
      .from("pdf_unlock_requests")
      .select("id, status")
      .eq("method", cleanMethod)
      .eq("trx_id", cleanTrx)
      .neq("status", "rejected")
      .limit(1);

    if (existingTrx && existingTrx.length > 0) {
      setBusy(false);
      return toast({
        title: "ডুপ্লিকেট TrxID পাওয়া গেছে",
        description: "এই Transaction ID টি ইতিমধ্যে জমা দেওয়া হয়েছে। দয়া করে আপনার সঠিক ও স্বতন্ত্র TrxID দিন।",
        variant: "destructive"
      });
    }

    const { error } = await supabase.from("pdf_unlock_requests").insert({
      user_id: user.id,
      email: user.email,
      post_id: postId,
      method: cleanMethod,
      sender_number: sender.trim(),
      trx_id: cleanTrx,
      amount: finalPrice,
    });
    setBusy(false);
    if (error) {
      if (error.code === "23505" || error.message.includes("unique") || error.message.includes("trx")) {
        return toast({
          title: "ডুপ্লিকেট TrxID",
          description: "এই Transaction ID টি ইতিমধ্যে অন্য কোনো রিকোয়েস্টে ব্যবহার করা হয়েছে।",
          variant: "destructive"
        });
      }
      return toast({ title: "রিকোয়েস্ট পাঠানো যায়নি", description: error.message, variant: "destructive" });
    }
    setStatus("pending"); setOpen(false);
    toast({ title: "রিকোয়েস্ট পাঠানো হয়েছে ✅", description: "অ্যাডমিন যাচাই করে অনুমোদন দিলেই পিডিএফ আনলক হবে।" });
  };

  if (status === "approved") {
    return fileUrl
      ? <Button size="sm" className="text-xs" asChild><a href={fileUrl} target="_blank" rel="noopener noreferrer"><Download className="h-3 w-3" /> প্রিমিয়াম PDF ডাউনলোড</a></Button>
      : <span className="text-xs text-destructive">PDF নিরাপদ লিংক তৈরি করা যায়নি। অ্যাডমিনের সঙ্গে যোগাযোগ করুন।</span>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-1 text-xs font-semibold text-accent-foreground"><Crown className="h-3 w-3 text-accent" /> প্রিমিয়াম</span>
        {discountPrice != null && <span className="text-xs text-muted-foreground line-through">৳{price}</span>}
        <span className="text-sm font-bold text-primary">৳{finalPrice}</span>
        {status === "pending" ? (
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> যাচাইকরণাধীন</span>
        ) : !user ? (
          <Button size="sm" variant="outline" className="text-xs" asChild><Link to="/login"><Lock className="h-3 w-3" /> লগইন করে আনলক করুন</Link></Button>
        ) : !isGmail ? (
          <span className="text-xs text-destructive">শুধু Gmail অ্যাকাউন্টে আনলক করা যাবে</span>
        ) : (
          <Button size="sm" className="text-xs" onClick={() => setOpen(true)}><Lock className="h-3 w-3" /> {status === "rejected" ? "আবার চেষ্টা করুন" : "আনলক করুন"}</Button>
        )}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="font-bengali">পিডিএফ আনলক: {title}</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p>নিচের নম্বরে <b className="text-primary">৳{finalPrice}</b> {nums.payment_type || "সেন্ড মানি"} করুন, তারপর তথ্য দিন:</p>
            <div className="grid grid-cols-2 gap-2">
              {[["bkash", "বিকাশ", nums.bkash_number], ["nagad", "নগদ", nums.nagad_number]].map(([k, l, n]) => (
                <button key={k} type="button" onClick={() => setMethod(k!)} className={`rounded-lg border p-3 text-left transition ${method === k ? "border-primary bg-primary/10" : "border-border"}`}>
                  <div className="font-semibold">{l}</div><div className="text-xs text-muted-foreground">{n || "নম্বর সেট করা হয়নি"}</div>
                </button>
              ))}
            </div>
            <div><Label>আপনার জিমেইল</Label><Input value={user?.email || ""} disabled /></div>
            <div><Label>যে নম্বর থেকে টাকা পাঠিয়েছেন</Label><Input value={sender} onChange={e => setSender(e.target.value)} placeholder="01XXXXXXXXX" inputMode="numeric" /></div>
            <div><Label>TrxID</Label><Input value={trx} onChange={e => setTrx(e.target.value)} placeholder="যেমন: 9A7B6C5D4E" /></div>
            <Button className="w-full" onClick={submit} disabled={busy}>{busy ? "পাঠানো হচ্ছে..." : "অনুমোদনের জন্য পাঠান"}</Button>
            <p className="text-xs text-muted-foreground">অ্যাডমিন পেমেন্ট মিলিয়ে অনুমোদন দিলেই শুধু আপনার অ্যাকাউন্টে পিডিএফ খুলবে।</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PremiumUnlock;
