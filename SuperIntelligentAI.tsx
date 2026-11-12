import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Mic,
  MicOff,
  Sparkles,
  Send,
  X,
  Zap,
  Image as ImageIcon,
  Video,
  Music,
  Loader2,
  Upload,
  ShieldAlert,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getEdgeFunctionUrl, getEdgeFunctionHeaders } from "@/lib/edgeFunctions";

const magicalColors = [
  "hsl(340, 82%, 52%)",
  "hsl(217, 91%, 60%)",
  "hsl(142, 71%, 45%)",
  "hsl(271, 91%, 65%)",
  "hsl(47, 95%, 52%)",
  "hsl(16, 100%, 50%)",
  "hsl(199, 89%, 48%)",
];

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface ProposedCommand {
  id: string;
  action: "insert" | "update" | "upsert";
  table: "notices" | "posts" | "site_settings" | "photo_gallery" | "theme_settings";
  data: Record<string, any>;
  description?: string;
  status: "pending" | "approved" | "rejected";
}

const SAFE_TABLES = ["notices", "posts", "site_settings", "photo_gallery", "theme_settings"] as const;
type SafeTable = typeof SAFE_TABLES[number];

const ALLOWED_COLUMNS: Record<SafeTable, string[]> = {
  notices: ["title", "content", "is_urgent", "is_active"],
  posts: ["title", "content", "category", "is_published", "image_url", "video_url", "pdf_url"],
  site_settings: ["key", "value"],
  photo_gallery: ["image_url", "caption", "is_visible"],
  theme_settings: ["key", "value"],
};

function isSafeTable(t: string): t is SafeTable {
  return (SAFE_TABLES as readonly string[]).includes(t as SafeTable);
}

function sanitizeCommandData(table: SafeTable, rawData: Record<string, any>): Record<string, any> {
  const allowed = ALLOWED_COLUMNS[table] || [];
  const clean: Record<string, any> = {};
  for (const key of allowed) {
    if (rawData[key] !== undefined) {
      // Disallow setting secret keys through site_settings AI commands
      if (table === "site_settings" && key === "key") {
        const keyVal = String(rawData.key).toLowerCase();
        if (keyVal.includes("api_key") || keyVal.includes("secret") || keyVal.includes("token")) {
          throw new Error("নিরাপত্তার স্বার্থে AI কমান্ড দিয়ে গোপন API কী পরিবর্তন করা যাবে না।");
        }
      }
      clean[key] = rawData[key];
    }
  }
  return clean;
}

function parseProposedCommands(text: string): { cleanText: string; commands: ProposedCommand[] } {
  const commands: ProposedCommand[] = [];
  const cleanText = text.replace(
    /\[EXECUTE_COMMAND\]([\s\S]*?)\[\/EXECUTE_COMMAND\]/g,
    (_, json) => {
      try {
        const cmd = JSON.parse(json.trim());
        if (cmd?.action && cmd?.table && isSafeTable(cmd.table) && cmd.data) {
          commands.push({
            id: Math.random().toString(36).substring(2, 9),
            action: cmd.action,
            table: cmd.table,
            data: cmd.data,
            status: "pending",
          });
        }
      } catch {
        /* ignore invalid json */
      }
      return "";
    }
  ).trim();
  return { cleanText, commands };
}

export const SuperIntelligentAI = () => {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pendingCommands, setPendingCommands] = useState<ProposedCommand[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isRadiating, setIsRadiating] = useState(false);
  const [showBubble, setShowBubble] = useState(false);

  const todayColor = magicalColors[new Date().getDay()];

  // Peek-a-boo bubble periodic prompt
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 6000);
    }, 18000);
    const initial = setTimeout(() => {
      setShowBubble(true);
      setTimeout(() => setShowBubble(false), 6000);
    }, 2500);
    return () => { clearInterval(interval); clearTimeout(initial); };
  }, [open]);

  const handleAdminLogoClick = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setIsRadiating(true);
    setShowBubble(false);
    setTimeout(() => {
      setIsRadiating(false);
      setOpen(true);
    }, 380);
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingCommands]);

  // Voice welcome
  useEffect(() => {
    const hasGreeted = sessionStorage.getItem("adminGreeted");
    if (!hasGreeted) {
      setTimeout(() => {
        try {
          const msg = new SpeechSynthesisUtterance("Welcome Admin! জ্ঞানচর্চায় আপনাকে স্বাগতম। আজকে আমার জন্য কি কাজ রয়েছে?");
          msg.lang = "bn-BD";
          msg.rate = 0.9;
          window.speechSynthesis?.speak(msg);
        } catch { /* not available */ }
        sessionStorage.setItem("adminGreeted", "true");
        toast("✨ Welcome Back, Admin!", { style: { borderLeft: `4px solid ${todayColor}` } });
      }, 2000);
    }
  }, [todayColor]);

  const speak = useCallback((text: string) => {
    try {
      const u = new SpeechSynthesisUtterance(text.substring(0, 150));
      u.lang = "bn-BD";
      u.rate = 0.95;
      window.speechSynthesis?.speak(u);
    } catch { /* ignore */ }
  }, []);

  // Voice recognition
  const toggleListening = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return toast.error("ভয়েস সাপোর্ট নেই! Chrome ব্যবহার করুন।");

    if (isListening) return;

    const r = new SR();
    r.lang = "bn-BD";
    r.continuous = false;
    r.interimResults = false;
    r.onstart = () => setIsListening(true);
    r.onresult = (e: any) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      processCommand(t);
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start();
  }, [isListening]);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error("ফাইলের সাইজ অনেক বড়। সর্বোচ্চ ৮MB ফাইল অনুমোদিত।");
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: `📎 ফাইল আপলোড: ${file.name}` }]);
    setIsThinking(true);

    try {
      let fileData: string | null = null;
      let fileType = file.type || "text/plain";

      if (file.type.startsWith("image/") || file.type === "application/pdf") {
        const reader = new FileReader();
        fileData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("ফাইল পড়তে ব্যর্থ"));
          reader.readAsDataURL(file);
        });
      } else {
        const text = await file.text();
        fileData = text.substring(0, 5000);
        fileType = "text/plain";
      }

      const headers = await getEdgeFunctionHeaders();
      const resp = await fetch(getEdgeFunctionUrl("process-file"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: `এই ফাইলটি বিশ্লেষণ করো: ${file.name}` }],
          fileData,
          fileType,
          fileName: file.name,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errJson = await resp.json().catch(() => ({}));
        throw new Error(errJson.error || "ফাইল প্রসেসিং ব্যর্থ");
      }

      let assistantContent = "";
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantContent } : m));
                }
                return [...prev, { role: "assistant", content: assistantContent }];
              });
            }
          } catch {
            /* partial */
          }
        }
      }

      if (!assistantContent) {
        setMessages((prev) => [...prev, { role: "assistant", content: "ফাইলটি প্রসেস করা হয়েছে।" }]);
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ ফাইল প্রসেসিং এরর: ${err.message}` }]);
    } finally {
      setIsThinking(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Detect media commands
  const detectMedia = (cmd: string): "image" | "video" | null => {
    const lc = cmd.toLowerCase();
    if (lc.includes("ছবি বানাও") || lc.includes("ছবি তৈরি") || lc.match(/^(image|generate image)/)) return "image";
    if (lc.includes("ভিডিও বানাও") || lc.includes("ভিডিও তৈরি") || lc.match(/^(video|generate video)/)) return "video";
    return null;
  };

  // Handle media generation
  const handleMedia = async (type: "image" | "video", prompt: string) => {
    setMessages((prev) => [...prev, { role: "user", content: `${type === "image" ? "🎨" : "🎬"} ${prompt}` }]);
    setInput("");
    setIsThinking(true);

    try {
      const url = getEdgeFunctionUrl(type === "image" ? "generate-image" : "generate-video");
      const headers = await getEdgeFunctionHeaders();
      const resp = await fetch(url, { method: "POST", headers, body: JSON.stringify({ prompt }) });
      const data = await resp.json().catch(() => ({}));

      if (resp.status === 429) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || "সীমা অতিক্রম করেছে।" }]);
        return;
      }

      if (data.success && (data.imageUrl || data.videoUrl)) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `${type === "image" ? "ছবি" : "ভিডিও"} তৈরি হয়েছে! ✨`,
            imageUrl: data.imageUrl,
            videoUrl: data.videoUrl,
          },
        ]);
        speak(`${type === "image" ? "ছবি" : "ভিডিও"} তৈরি হয়েছে!`);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message || data.error || "মিডিয়া তৈরি করতে সমস্যা হয়েছে।" },
        ]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "মিডিয়া তৈরি করতে সমস্যা হয়েছে।" }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Explicit Administrator Approval for Proposed Database Writes
  const approveCommand = async (cmd: ProposedCommand) => {
    if (!isAdmin) {
      toast.error("শুধুমাত্র অনুমোদিত অ্যাডমিন এই পরিবর্তন করতে পারবেন।");
      return;
    }

    try {
      const { action, table, data } = cmd;
      if (!isSafeTable(table)) {
        toast.error(`"${table}" টেবিলে লেখার অনুমতি নেই।`);
        return;
      }

      // Sanitize fields
      const cleanData = sanitizeCommandData(table, data);

      // Attempt server-side verified RPC first
      const { error: rpcErr } = await supabase.rpc("admin_execute_command" as any, {
        p_action: action,
        p_table: table,
        p_data: cleanData,
        p_target_id: data.id || null,
      });

      if (rpcErr) {
        // Fallback to table operation if RPC is not yet applied
        if (action === "insert") {
          const { error } = await supabase.from(table).insert(cleanData as any);
          if (error) throw error;
        } else if (action === "upsert") {
          const { error } = await supabase.from(table).upsert(cleanData as any, { onConflict: "key" });
          if (error) throw error;
        } else if (action === "update") {
          const id = data.id;
          if (!id) throw new Error("আপডেটের জন্য id আবশ্যক।");
          const { error } = await supabase.from(table).update(cleanData as any).eq("id", id);
          if (error) throw error;
        }
      }

      toast.success(`✅ "${table}" অপারেশন সফলভাবে সম্পন্ন হয়েছে!`);

      setPendingCommands((prev) => prev.filter((c) => c.id !== cmd.id));
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `✅ অ্যাডমিন কর্তৃক অনুমোদিত ও সংরক্ষিত:\n"${table}" টেবিলে (${action}) অপারেশন সফল হয়েছে।`,
        },
      ]);
    } catch (err: any) {
      console.error("Execution error:", err);
      toast.error(`ব্যর্থ: ${err.message}`);
    }
  };

  const rejectCommand = (cmdId: string) => {
    setPendingCommands((prev) => prev.filter((c) => c.id !== cmdId));
    toast.info("প্রস্তাবিত কমান্ড বাতিল করা হয়েছে।");
  };

  // Main command processor with streaming
  const processCommand = async (command: string) => {
    if (!command.trim() || isThinking) return;

    const mediaType = detectMedia(command);
    if (mediaType) {
      const prompt =
        command
          .replace(/(ছবি বানাও|ছবি তৈরি|ভিডিও বানাও|ভিডিও তৈরি|generate image|generate video|image|video)/gi, "")
          .trim() || command;
      return handleMedia(mediaType, prompt);
    }

    const userMsg: ChatMsg = { role: "user", content: command };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsThinking(true);

    let assistantContent = "";

    try {
      const headers = await getEdgeFunctionHeaders();
      const resp = await fetch(getEdgeFunctionUrl("chat"), {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: command },
          ],
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        if (resp.status === 429) throw new Error(errData.error || "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
        if (resp.status === 402) throw new Error("AI সেবা সাময়িকভাবে অনুপলব্ধ।");
        throw new Error(errData.error || `Error ${resp.status}`);
      }

      if (!resp.body) throw new Error("No stream body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsertAssistant = (content: string) => {
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { role: "assistant", content }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              upsertAssistant(assistantContent);
            }
          } catch {
            /* partial */
          }
        }
      }

      // Check for proposed commands - REQUIRE EXPLICIT APPROVAL!
      const { cleanText, commands } = parseProposedCommands(assistantContent);
      if (commands.length > 0) {
        setPendingCommands((prev) => [...prev, ...commands]);
        toast.info("🔐 AI একটি ডাটাবেস পরিবর্তনের প্রস্তাব দিয়েছে। অনুমোদনের জন্য নিচে দেখুন।");
      }

      const textToSpeak = (cleanText || assistantContent).substring(0, 120);
      if (textToSpeak) speak(textToSpeak);
    } catch (e: any) {
      console.error("AI error:", e);
      setMessages((prev) => [...prev, { role: "assistant", content: `❌ ${e.message || "সমস্যা হয়েছে।"}` }]);
      toast.error(e.message || "AI সেবায় সমস্যা হয়েছে।");
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating AI Widget Container - Flex-col items-end guarantees bubble is ALWAYS directly above logo */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
        {/* Correctly Positioned Floating Message Bubble - Always Right Above the Logo */}
        <AnimatePresence>
          {showBubble && !open && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto mb-3 relative rounded-2xl bg-gradient-to-r from-[#F5C76A] via-amber-400 to-[#10B981] px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-[0_10px_25px_rgba(245,199,106,0.6)] cursor-pointer select-none border border-amber-200/90 backdrop-blur-md"
              onClick={handleAdminLogoClick}
            >
              <span className="flex items-center gap-1.5 font-bengali">
                <Sparkles className="h-4 w-4 text-slate-950 animate-spin" /> আমাকে জিজ্ঞাসা করুন ✨
              </span>
              {/* Speech-bubble pointer tail directed cleanly at the crest crown below */}
              <div className="absolute -bottom-1.5 right-6 sm:right-7 h-3 w-3 rotate-45 bg-[#10B981] shadow-sm pointer-events-none" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Logo Button: PURE TRANSPARENT LOGO ONLY (No box, no border, pure multi-color glowing aura) */}
        <div className="pointer-events-auto relative">
          {/* Light Dispersion Burst Animation on Click ("আলো বিচ্ছুরণ") */}
          <AnimatePresence>
            {isRadiating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.2 }}
                animate={{ opacity: [1, 1, 0], scale: [0.3, 2.6, 3.2] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, ease: "easeOut" }}
                className="pointer-events-none absolute -inset-10 flex items-center justify-center z-50"
              >
                {/* Radial Sunburst Nebula Rays */}
                <div className="absolute h-36 w-36 rounded-full bg-gradient-to-tr from-[#F5C76A] via-[#48D9F5] to-[#EC4899] blur-xl opacity-90" />
                <div className="absolute h-48 w-48 rounded-full border-2 border-[#F5C76A] opacity-80 animate-ping" />
                {/* Radiating Light Sparks */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                  <motion.div
                    key={deg}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: Math.cos((deg * Math.PI) / 180) * 85,
                      y: Math.sin((deg * Math.PI) / 180) * 85,
                      opacity: 0,
                      scale: 0.2,
                    }}
                    transition={{ duration: 0.42, ease: "easeOut" }}
                    className="absolute h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_12px_#F5C76A]"
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Breathing Floating Button */}
          <motion.button
            onClick={handleAdminLogoClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center p-0 bg-transparent border-0 outline-none shadow-none cursor-pointer select-none transition-transform"
            animate={{
              y: [0, -6, 0], // Floating levitation
              scale: isThinking ? [1, 1.18, 1] : isHovered ? 1.15 : [1, 1.06, 1], // Gentle Magic Breathe
            }}
            transition={{
              y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
              scale: { duration: isHovered ? 0.2 : 3.2, repeat: isHovered ? 0 : Infinity, ease: "easeInOut" },
            }}
            whileTap={{ scale: 0.9 }}
            title="জ্ঞানচর্চা'লয় অ্যাডমিন AI কোর"
          >
            {open ? (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900/90 border border-[#F5C76A]/60 shadow-[0_0_20px_rgba(245,199,106,0.6)]">
                <X className="h-6 w-6 text-[#F5C76A]" />
              </div>
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Pure Multi-Colored Glowing Aura directly around Logo Contours */}
                <img
                  src="/assets/logo-crest-trimmed.png"
                  alt="জ্ঞানচর্চা'লয় রয়্যাল ক্রেস্ট"
                  className={`w-full h-full object-contain pointer-events-none select-none transition-all duration-300 ${
                    isHovered ? "brightness-110" : ""
                  }`}
                  style={{
                    filter: isHovered
                      ? "drop-shadow(0 0 12px rgba(245, 199, 106, 0.95)) drop-shadow(0 0 22px rgba(72, 217, 245, 0.85)) drop-shadow(0 0 35px rgba(168, 85, 247, 0.75)) drop-shadow(0 0 50px rgba(16, 185, 129, 0.55))"
                      : "drop-shadow(0 0 8px rgba(245, 199, 106, 0.85)) drop-shadow(0 0 16px rgba(72, 217, 245, 0.65)) drop-shadow(0 0 28px rgba(168, 85, 247, 0.45)) drop-shadow(0 0 38px rgba(16, 185, 129, 0.35))",
                  }}
                />

                {/* Small Delicate Pulsing Indicator (ছোট্ট পালসিং ইন্ডিকেটর) */}
                <span className="absolute top-0.5 right-0.5 flex h-3 w-3 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-tr from-emerald-400 via-teal-300 to-[#F5C76A] shadow-[0_0_8px_#10B981]"></span>
                </span>
              </div>
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 80 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 80 }}
            className="fixed bottom-32 right-8 z-[100] w-[390px] overflow-hidden rounded-3xl border-2 border-border bg-card shadow-2xl backdrop-blur-xl"
            style={{ borderColor: `color-mix(in srgb, ${todayColor} 30%, transparent)` }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b border-border p-4"
              style={{
                background: `color-mix(in srgb, ${todayColor} 10%, transparent)`,
                borderLeft: `5px solid ${todayColor}`,
              }}
            >
              <div className="flex items-center gap-3">
                <Bot className="h-6 w-6" style={{ color: todayColor }} />
                <div>
                  <h3 className="text-base font-bold text-foreground leading-none flex items-center gap-1.5">
                    Gyan AI Core <Sparkles className="h-3.5 w-3.5" style={{ color: todayColor }} />
                  </h3>
                  <span className="text-[10px] text-muted-foreground">Admin Intelligence • Protected Mode</span>
                </div>
              </div>
              <X
                className="h-5 w-5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Chat area */}
            <div className="h-[360px] overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-xs text-muted-foreground mt-16 leading-relaxed">
                  🪄 স্বাগতম! আমি Gyan AI Core।<br />
                  বাংলা, English ও Banglish বুঝি।<br />
                  নোটিশ, ড্রাফট পোস্ট ও সেটিংস প্রস্তাব দিন।<br />
                  <span className="text-[10px] opacity-75">🛡️ যেকোনো ডাটাবেস পরিবর্তন আপনার অনুমোদন ছাড়া কার্যকর হবে না।</span>
                </p>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs whitespace-pre-line ${
                      m.role === "user" ? "bg-muted text-foreground" : "bg-primary/10 text-foreground"
                    }`}
                    style={m.role === "assistant" ? { borderLeft: `4px solid ${todayColor}` } : {}}
                  >
                    {m.content}
                    {m.imageUrl && <img src={m.imageUrl} alt="Generated" className="mt-2 rounded-lg max-w-full" />}
                    {m.videoUrl && <video src={m.videoUrl} controls className="mt-2 rounded-lg max-w-full" />}
                  </div>
                </div>
              ))}

              {/* Pending Admin Approvals (Zero Autonomous Injection!) */}
              {pendingCommands.map((cmd) => (
                <motion.div
                  key={cmd.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border-2 border-amber-500/40 bg-amber-500/10 p-3.5 space-y-2 text-xs"
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>অ্যাডমিন অনুমোদনের প্রয়োজন</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    AI নিম্নলিখিত ডাটাবেস পরিবর্তন প্রস্তাব করেছে:
                  </p>
                  <div className="rounded-lg bg-background/80 p-2 text-[11px] font-mono border border-border">
                    <p><span className="text-muted-foreground">টেবিল:</span> <strong className="text-primary">{cmd.table}</strong></p>
                    <p><span className="text-muted-foreground">অ্যাকশন:</span> {cmd.action.toUpperCase()}</p>
                    <div className="mt-1 max-h-24 overflow-y-auto text-[10px] text-muted-foreground whitespace-pre-wrap">
                      {JSON.stringify(cmd.data, null, 2)}
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => approveCommand(cmd)}
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> অনুমোদন করুন
                    </button>
                    <button
                      onClick={() => rejectCommand(cmd.id)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-muted px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <XCircle className="h-3.5 w-3.5" /> বাতিল
                    </button>
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> 🪄 ভাবছি...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick media buttons */}
            <div className="flex justify-around border-t border-border px-4 py-2 text-xs">
              <button
                onClick={() => processCommand("একটা সুন্দর ছবি বানাও জ্ঞানচর্চা'লয়ের")}
                className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ImageIcon className="h-4 w-4" /> ছবি
              </button>
              <button
                onClick={() => processCommand("একটি শিক্ষামূলক ভিডিও বানাও")}
                className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Video className="h-4 w-4" /> ভিডিও
              </button>
              <button
                onClick={() => processCommand("একটি মোটিভেশনাল মিউজিক বানাও")}
                className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Music className="h-4 w-4" /> মিউজিক
              </button>
            </div>

            {/* Input section */}
            <div className="border-t border-border p-3.5 bg-muted/30">
              <div className="flex gap-2 items-center">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleListening}
                  className={`flex-shrink-0 rounded-full p-2.5 transition-colors ${
                    isListening
                      ? "bg-destructive text-destructive-foreground animate-pulse"
                      : "bg-muted hover:bg-accent text-muted-foreground"
                  }`}
                >
                  {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </motion.button>

                <label className="flex-shrink-0 rounded-full p-2.5 bg-muted hover:bg-accent text-muted-foreground cursor-pointer transition-colors">
                  <Upload className="h-4 w-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.txt,.csv,.json,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileUpload}
                  />
                </label>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && processCommand(input)}
                  placeholder="কমান্ড দিন বা ভয়েস বলুন..."
                  className="flex-1 rounded-2xl border border-border bg-background px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={isThinking}
                />

                <button
                  onClick={() => processCommand(input)}
                  disabled={isThinking || !input.trim()}
                  className="flex-shrink-0 rounded-full p-2.5 text-primary-foreground disabled:opacity-50 transition-colors"
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
