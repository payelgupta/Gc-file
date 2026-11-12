import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Mic, X, Send, Bot, Music, Video, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const dayColors = [
  "hsl(340, 82%, 52%)",
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(271, 91%, 65%)",
  "hsl(47, 95%, 52%)",
  "hsl(16, 100%, 50%)",
  "hsl(199, 89%, 48%)",
];

interface ChatMessage {
  role: "user" | "assistant" | "success" | "error";
  content: string;
}

export const MagicalAdminAI = () => {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const todayColor = dayColors[new Date().getDay()];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ভয়েস ওয়েলকাম
  useEffect(() => {
    const hasGreeted = sessionStorage.getItem("adminGreeted");
    if (!hasGreeted) {
      setTimeout(() => {
        try {
          const msg = new SpeechSynthesisUtterance("Welcome Admin! জ্ঞানচর্চায় আপনাকে স্বাগতম।");
          msg.lang = "bn-BD";
          msg.rate = 0.9;
          window.speechSynthesis?.speak(msg);
        } catch {
          // Speech synthesis not available
        }
        sessionStorage.setItem("adminGreeted", "true");
        toast("✨ Welcome Back, Admin!", { style: { borderLeft: `4px solid ${todayColor}` } });
      }, 2000);
    }
  }, [todayColor]);

  // ভয়েস কমান্ড
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("আপনার ব্রাউজারে ভয়েস সাপোর্ট নেই।");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      handleSmartAction(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, []);

  // স্মার্ট অ্যাকশন হ্যান্ডলার - Supabase ইন্টিগ্রেশন সহ
  const handleSmartAction = async (command: string) => {
    if (!command.trim()) return;

    if (!isAdmin) {
      setMessages(prev => [...prev, { role: "error", content: "❌ শুধুমাত্র অ্যাডমিন এই অ্যাকশন সম্পাদন করতে পারেন।" }]);
      toast.error("অননুমোদিত অ্যাক্সেস! শুধুমাত্র অ্যাডমিন অনুমোদিত।");
      return;
    }

    setMessages(prev => [...prev, { role: "user", content: command }]);
    setInput("");
    setIsProcessing(true);

    const cmd = command.toLowerCase();

    try {
      // ১. নোটিশ তৈরি
      if (cmd.includes("নোটিশ") || cmd.includes("notice")) {
        const isUrgent = cmd.includes("জরুরি") || cmd.includes("urgent");
        let title = command
          .replace(/(একটি|নতুন|দাও|করো|লেখো|বানাও|জরুরি|নোটিশ|notice|দিন|তৈরি|কর)/gi, "")
          .trim();
        if (!title) title = "নতুন নোটিশ";

        const { error } = await supabase.from("notices").insert({
          title,
          content: "AI দ্বারা স্বয়ংক্রিয়ভাবে তৈরি। দয়া করে এডিট করুন।",
          is_urgent: isUrgent,
          is_active: true,
        });
        if (error) throw error;

        setMessages(prev => [...prev, {
          role: "success",
          content: `✅ "${title}" নামে ${isUrgent ? "জরুরি " : ""}নোটিশ তৈরি হয়েছে!`,
        }]);
      }
      // ২. পোস্ট / সাজেশন তৈরি
      else if (cmd.includes("পোস্ট") || cmd.includes("সাজেশন") || cmd.includes("post") || cmd.includes("publish") || cmd.includes("পাবলিশ")) {
        let category = "general";
        if (cmd.includes("ssc") || cmd.includes("এসএসসি")) category = "ssc";
        else if (cmd.includes("hsc") || cmd.includes("এইচএসসি")) category = "hsc";
        else if (cmd.includes("class 6") || cmd.includes("ষষ্ঠ")) category = "class-6-8";
        else if (cmd.includes("সাজেশন") || cmd.includes("suggestion")) category = "suggestion";

        let title = command
          .replace(/(একটি|নতুন|পোস্ট|সাজেশন|দাও|করো|লেখো|বানাও|এর জন্য|এর|post|publish|পাবলিশ|তৈরি|কর)/gi, "")
          .trim();
        if (!title) title = "নতুন ড্রাফট পোস্ট";

        const { error } = await supabase.from("posts").insert({
          title,
          content: "AI দ্বারা তৈরি ড্রাফট। বিস্তারিত যুক্ত করুন।",
          category,
          is_published: false,
        });
        if (error) throw error;

        setMessages(prev => [...prev, {
          role: "success",
          content: `✅ "${title}" ড্রাফট পোস্ট তৈরি হয়েছে (${category})। Posts পেজ থেকে পাবলিশ করুন।`,
        }]);
      }
      // ৩. সেটিংস আপডেট (site_settings টেবিল ব্যবহার)
      else if (cmd.includes("setting") || cmd.includes("সেটিং") || cmd.includes("ভয়েস") || cmd.includes("voice")) {
        // Extract key-value from command
        let settingKey = "custom_feature";
        let settingValue = "enabled";

        if (cmd.includes("ভয়েস টু টেক্সট") || cmd.includes("voice to text")) {
          settingKey = "voice_to_text";
          settingValue = "enabled";
        } else if (cmd.includes("dark") || cmd.includes("ডার্ক")) {
          settingKey = "dark_mode_default";
          settingValue = "true";
        }

        const { error } = await supabase.from("site_settings").upsert(
          { key: settingKey, value: settingValue },
          { onConflict: "key" }
        );
        if (error) throw error;

        setMessages(prev => [...prev, {
          role: "success",
          content: `✅ সেটিং "${settingKey}" = "${settingValue}" সফলভাবে সেভ হয়েছে!`,
        }]);
      }
      // ৪. গ্যালারি ফটো ডিলিট/হাইড
      else if (cmd.includes("গ্যালারি") || cmd.includes("gallery") || cmd.includes("photo")) {
        if (cmd.includes("লুকাও") || cmd.includes("hide")) {
          const { error } = await supabase
            .from("photo_gallery")
            .update({ is_visible: false })
            .order("created_at", { ascending: false })
            .limit(1);
          if (error) throw error;
          setMessages(prev => [...prev, { role: "success", content: "✅ শেষ গ্যালারি ফটো লুকানো হয়েছে।" }]);
        } else {
          setMessages(prev => [...prev, { role: "assistant", content: "গ্যালারি কমান্ড: 'গ্যালারি লুকাও' ব্যবহার করুন।" }]);
        }
      }
      // ৫. অজানা কমান্ড
      else {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "⚠️ কমান্ড বুঝতে পারিনি। চেষ্টা করুন:\n• 'নোটিশ দাও [বিষয়]'\n• 'পোস্ট করো [বিষয়]'\n• 'সেটিং voice to text'\n• 'গ্যালারি লুকাও'",
        }]);
      }
    } catch (err: any) {
      console.error("Command error:", err);
      setMessages(prev => [...prev, {
        role: "error",
        content: `❌ এরর: ${err?.message || "অজানা সমস্যা"}`,
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* ফ্লোটিং বাটন */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full shadow-lg"
        style={{ background: `linear-gradient(135deg, ${todayColor}, hsl(var(--primary)))` }}
        animate={{ y: [0, -8, 0], rotate: open ? 90 : 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.1 }}
      >
        {open ? <X className="h-6 w-6 text-white" /> : <Sparkles className="h-6 w-6 text-white" />}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed bottom-24 right-6 z-[100] w-[340px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            {/* হেডার */}
            <div className="flex items-center justify-between border-b border-border p-3" style={{ background: `color-mix(in srgb, ${todayColor} 10%, transparent)` }}>
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5" style={{ color: todayColor }} />
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-none">Smart Admin AI</h3>
                  <span className="text-[10px] text-muted-foreground">Online | বাংলা + English</span>
                </div>
              </div>
              <div className="flex gap-1.5">
                <Music className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                <Video className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                <ImageIcon className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
              </div>
            </div>

            {/* চ্যাট */}
            <div className="h-72 overflow-y-auto p-3 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-xs text-muted-foreground mt-8">
                  আমি বাংলা, English ও Banglish বুঝি।{"\n"}কমান্ড দিন!
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                      m.role === "user"
                        ? "bg-muted text-foreground"
                        : m.role === "success"
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 border-l-2 border-green-500"
                        : m.role === "error"
                        ? "bg-destructive/10 text-destructive border-l-2 border-destructive"
                        : "bg-primary/10 text-foreground border-l-2 border-primary"
                    }`}
                    style={{ whiteSpace: "pre-line" }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> প্রসেস করা হচ্ছে...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* ইনপুট */}
            <div className="border-t border-border p-3">
              <div className="flex gap-2 rounded-xl bg-muted p-1.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={startListening}
                  className={`rounded-lg p-2 transition-colors ${isListening ? "bg-destructive text-white animate-pulse" : "hover:bg-background text-muted-foreground"}`}
                >
                  <Mic className="h-4 w-4" />
                </motion.button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSmartAction(input)}
                  placeholder="কমান্ড দিন..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  disabled={isProcessing}
                />
                <button
                  onClick={() => !isProcessing && handleSmartAction(input)}
                  disabled={isProcessing || !input.trim()}
                  className="rounded-lg p-2 text-white disabled:opacity-50"
                  style={{ backgroundColor: todayColor }}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
