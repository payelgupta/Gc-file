import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Terminal, Send, Bot, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface CommandLog {
  id: string;
  type: "user" | "system" | "success" | "error";
  message: string;
}

const AdminCommandCenter = () => {
  const { isAdmin } = useAuth();
  const [command, setCommand] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<CommandLog[]>([
    { id: "1", type: "system", message: "AI কমান্ড সেন্টারে স্বাগতম! আমাকে বাংলায় নির্দেশ দিন। (যেমন: 'একটি নতুন নোটিশ দাও' বা 'ssc এর জন্য সাজেশন পোস্ট করো')" }
  ]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // অটোল স্ক্রল
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (type: CommandLog["type"], message: string) => {
    setLogs(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), type, message }]);
  };

  // স্মার্ট বাংলা কমান্ড পার্সার
  const processCommand = async (cmdText: string) => {
    if (!isAdmin) {
      throw new Error("অননুমোদিত অ্যাক্সেস! কেবলমাত্র অ্যাডমিন এই কমান্ড এক্সিকিউট করতে পারেন।");
    }
    const text = cmdText.toLowerCase();
    
    try {
      // ১. নোটিশ তৈরি করার কমান্ড
      if (text.includes("নোটিশ") || text.includes("notice")) {
        const isUrgent = text.includes("জরুরি") || text.includes("urgent");
        // কমান্ড থেকে মূল সাবজেক্ট বের করার চেষ্টা
        let title = text.replace(/(একটি|নতুন|দাও|করো|লেখো|বানাও|জরুরি|নোটিশ|notice)/g, "").trim();
        if (!title) title = "নতুন নোটিশ";

        const { error } = await supabase.from("notices").insert({
          title: title,
          content: "AI দ্বারা স্বয়ংক্রিয়ভাবে তৈরি নোটিশ। দয়া করে এডিট করে বিস্তারিত লিখুন।",
          is_urgent: isUrgent,
          is_active: true
        });

        if (error) throw error;
        return `✅ সফল! "${title}" নামে একটি ${isUrgent ? 'জরুরি ' : ''}নোটিশ তৈরি করা হয়েছে।`;
      }

      // ২. পোস্ট বা সাজেশন তৈরি করার কমান্ড
      if (text.includes("পোস্ট") || text.includes("সাজেশন") || text.includes("post")) {
        const isSuggestion = text.includes("সাজেশন");
        let category = "general";
        
        // ক্যাটাগরি ডিটেকশন
        if (text.includes("ssc") || text.includes("এসএসসি")) category = "ssc";
        else if (text.includes("hsc") || text.includes("এইচএসসি")) category = "hsc";
        else if (text.includes("class 6") || text.includes("ষষ্ঠ")) category = "class-6-8";
        else if (isSuggestion) category = "suggestion";

        let title = text.replace(/(একটি|নতুন|পোস্ট|সাজেশন|দাও|করো|লেখো|বানাও|এর জন্য|এর)/g, "").trim();
        if (!title) title = "নতুন ড্রাফট পোস্ট";

        const { error } = await supabase.from("posts").insert({
          title: title,
          content: "AI দ্বারা তৈরি ড্রাফট। বিস্তারিত যুক্ত করুন।",
          category: category,
          is_published: false // নিরাপত্তার জন্য প্রথমে ড্রাফট হিসেবে সেভ হবে
        });

        if (error) throw error;
        return `✅ সফল! "${title}" নামে একটি ড্রাফট পোস্ট তৈরি হয়েছে (ক্যাটাগরি: ${category})। দয়া করে পোস্ট পেজ থেকে পাবলিশ করুন।`;
      }

      // ৩. কমান্ড বুঝতে না পারলে
      return "⚠️ আমি আপনার কমান্ডটি বুঝতে পারিনি। দয়া করে 'নোটিশ' বা 'পোস্ট' শব্দগুলো ব্যবহার করে পরিষ্কারভাবে বলুন।";
    } catch (error: any) {
      console.error(error);
      throw new Error(`ডেটাবেস এরর: ${error.message}`);
    }
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const currentCmd = command;
    setCommand("");
    addLog("user", currentCmd);
    setIsProcessing(true);

    try {
      // ডেটাবেস প্রসেসিং
      const resultMessage = await processCommand(currentCmd);
      
      if (resultMessage.includes("✅")) {
        addLog("success", resultMessage);
        toast({ title: "কমান্ড সফলভাবে এক্সিকিউট হয়েছে!" });
      } else {
        addLog("system", resultMessage);
      }
    } catch (error: any) {
      addLog("error", error.message);
      toast({ title: "কমান্ড ফেইল করেছে", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">
          ← ব্যাক
        </Button>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--gold))/10]">
          <Sparkles className="h-6 w-6 text-[hsl(var(--gold))]" />
        </div>
        <div>
          <h1 className="font-bengali text-2xl font-bold text-foreground">AI Command Center</h1>
          <p className="text-sm text-muted-foreground">বাংলায় কমান্ড দিয়ে ওয়েবসাইট নিয়ন্ত্রণ করুন</p>
        </div>
      </div>

      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="border-b border-border bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Terminal className="h-4 w-4" /> টার্মিনাল লগ
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Log Window */}
          <div className="h-[400px] overflow-y-auto bg-background p-4 space-y-4 font-mono text-sm">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3">
                {log.type === "user" && <div className="mt-0.5 text-primary">❯</div>}
                {log.type === "system" && <Bot className="mt-0.5 h-4 w-4 text-blue-500" />}
                {log.type === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-500" />}
                {log.type === "error" && <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />}
                
                <div className={`flex-1 rounded-lg px-3 py-2 ${
                  log.type === "user" ? "bg-muted text-foreground" :
                  log.type === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400" :
                  log.type === "error" ? "bg-destructive/10 text-destructive" :
                  "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}>
                  {log.message}
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Bot className="h-4 w-4" />
                <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> প্রসেস করা হচ্ছে...
                </div>
              </div>
            )}
            <div ref={logEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-border bg-card p-4">
            <form onSubmit={handleCommandSubmit} className="flex gap-3">
              <Input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="লিখুন: 'আগামীকাল ছুটির একটি নোটিশ দাও'..."
                className="flex-1 font-bengali text-base bg-background"
                disabled={isProcessing}
              />
              <Button type="submit" disabled={isProcessing || !command.trim()} className="gap-2 shrink-0">
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                কমান্ড দিন
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCommandCenter;