import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogIn, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fireCelebration } from "@/lib/celebration";
import { PasswordInput } from "@/components/ui/password-input";

const MAX_ATTEMPTS = 5;
const BASE_DELAY = 2000; // 2s

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Rate limiting check
    if (lockedUntil && Date.now() < lockedUntil) {
      const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
      toast({ title: `অনুগ্রহ করে ${secs} সেকেন্ড অপেক্ষা করুন`, variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= MAX_ATTEMPTS) {
        const delay = BASE_DELAY * Math.pow(2, newAttempts - MAX_ATTEMPTS);
        const lockTime = Date.now() + Math.min(delay, 60000); // max 60s
        setLockedUntil(lockTime);
        toast({ title: "অনেক বার ব্যর্থ চেষ্টা!", description: `${Math.ceil(Math.min(delay, 60000) / 1000)} সেকেন্ড পর আবার চেষ্টা করুন।`, variant: "destructive" });
      } else {
        toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      }
    } else {
      setAttempts(0);
      setLockedUntil(null);
      fireCelebration();
      toast({ title: "🎉 স্বাগতম অ্যাডমিন!", description: "সফলভাবে লগইন হয়েছে।" });
      setTimeout(() => navigate("/admin"), 2000);
    }
    setLoading(false);
  };

  const isLocked = lockedUntil && Date.now() < lockedUntil;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 sm:px-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg relative sm:p-8">
        <Button variant="ghost" size="icon" className="absolute top-3 left-3 h-8 w-8 sm:top-4 sm:left-4 sm:h-10 sm:w-10" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <div className="mb-5 text-center sm:mb-6">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 sm:mb-4 sm:h-14 sm:w-14">
            <Lock className="h-6 w-6 text-primary sm:h-7 sm:w-7" />
          </div>
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Admin Login</h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Sign in to manage your website</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@example.com" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
            <PasswordInput id="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="mt-1" />
          </div>
          <Button type="submit" className="w-full" disabled={loading || !!isLocked}>
            <LogIn className="mr-2 h-4 w-4" />
            {loading ? "Signing in..." : isLocked ? "Locked..." : "Sign In"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline">পাসওয়ার্ড ভুলে গেছেন?</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
