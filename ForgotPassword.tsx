import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: "ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
      toast({ title: "ইমেইল পাঠানো হয়েছে!", description: "আপনার ইমেইল চেক করুন।" });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg relative sm:p-8">
        <Button variant="ghost" size="icon" className="absolute top-3 left-3 h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">পাসওয়ার্ড রিসেট</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">আপনার ইমেইলে রিসেট লিংক পাঠানো হবে</p>
        </div>
        {sent ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">আপনার ইমেইলে পাঠানো লিংকে ক্লিক করুন।</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/login")}>লগইনে ফিরুন</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">ইমেইল</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@gmail.com" className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "পাঠানো হচ্ছে..." : "রিসেট লিংক পাঠান"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
