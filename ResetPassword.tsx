import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PasswordInput } from "@/components/ui/password-input";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check for recovery event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    // Also check hash
    if (window.location.hash.includes("type=recovery")) {
      setReady(true);
    }
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ title: "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast({ title: "ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "পাসওয়ার্ড আপডেট হয়েছে!" });
      setTimeout(() => navigate("/login"), 1500);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">নতুন পাসওয়ার্ড সেট করুন</h1>
        </div>
        {!ready ? (
          <p className="text-center text-sm text-muted-foreground py-6">রিকভারি লিংক যাচাই হচ্ছে...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">নতুন পাসওয়ার্ড</Label>
              <PasswordInput id="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="কমপক্ষে ৬ অক্ষর" className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "আপডেট হচ্ছে..." : "পাসওয়ার্ড আপডেট করুন"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
