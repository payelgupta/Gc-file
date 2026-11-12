import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fireCelebration } from "@/lib/celebration";
import { PasswordInput } from "@/components/ui/password-input";

const UserLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "লগইন ব্যর্থ", description: error.message, variant: "destructive" });
    } else {
      fireCelebration();
      toast({ title: "🎉 স্বাগতম!", description: "সফলভাবে লগইন হয়েছে। অভিনন্দন!" });
      setTimeout(() => navigate("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg relative sm:p-8">
        <Button variant="ghost" size="icon" className="absolute top-3 left-3 h-8 w-8 sm:top-4 sm:left-4 sm:h-10 sm:w-10" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="mb-5 text-center sm:mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mb-4 sm:h-14 sm:w-14">
            <LogIn className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">লগইন করুন</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="email" className="text-xs sm:text-sm">ইমেইল</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@gmail.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs sm:text-sm">পাসওয়ার্ড</Label>
            <PasswordInput id="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "লগইন হচ্ছে..." : "লগইন"}
          </Button>
        </form>
        <div className="mt-4 text-center text-xs text-muted-foreground sm:text-sm space-y-1">
          <p><Link to="/forgot-password" className="text-primary hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link></p>
          <p>অ্যাকাউন্ট নেই?{" "}<Link to="/signup" className="text-primary hover:underline">সাইন আপ করুন</Link></p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
