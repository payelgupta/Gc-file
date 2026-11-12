import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bot, Sparkles, MessageCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ChatMessage from "./chatbot/ChatMessage";
import ChatInput from "./chatbot/ChatInput";
import { generateImage, generateVideo } from "./chatbot/useMediaGeneration";
import { getEdgeFunctionUrl, getEdgeFunctionHeaders, streamEdgeResponse } from "@/lib/edgeFunctions";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string; videoUrl?: string };

const MODE_PROMPTS: Record<string, string> = {
  normal: "",
  creative: "তুমি এখন সৃজনশীল মোডে আছো। গল্প, কবিতা বা সৃজনশীল উত্তর দাও।",
  precise: "তুমি এখন সুনির্দিষ্ট মোডে আছো। সংক্ষিপ্ত, তথ্যনির্ভর উত্তর দাও।",
};

const AIChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [editText, setEditText] = useState("");
  const [chatMode, setChatMode] = useState("normal");
  const [progress, setProgress] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // Peek-a-boo animation - periodic friendly prompt
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

  const streamChat = async (url: string, body: any) => {
    const headers = await getEdgeFunctionHeaders();
    const resp = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!resp.ok || !resp.body) {
      const errData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        throw new Error(errData.error || "অতিরিক্ত অনুরোধ! অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।");
      }
      if (resp.status === 413) {
        throw new Error(errData.error || "ফাইলের সাইজ অনেক বড়। সর্বোচ্চ ৮MB অনুমোদিত।");
      }
      throw new Error(errData.error || "সার্ভার থেকে সাড়া পাওয়া যায়নি।");
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantSoFar = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { streamDone = true; break; }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) {
            assistantSoFar += content;
            const current = assistantSoFar;
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last?.role === "assistant" && !last.imageUrl && !last.videoUrl) {
                return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: current } : m));
              }
              return [...prev, { role: "assistant", content: current }];
            });
          }
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const send = async (text: string) => {
    if (!text || isLoading) return;
    const userMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const allMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
    
    // Add mode context
    const modeExtra = MODE_PROMPTS[chatMode];
    const body: any = { messages: allMessages };
    if (modeExtra) {
      body.messages = [{ role: "system", content: modeExtra }, ...allMessages];
    }

    try {
      await streamChat(getEdgeFunctionUrl("chat"), body);
    } catch (e: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: e.message || "দুঃখিত, সমস্যা হয়েছে।" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Client-side file size validation (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "❌ ফাইলের সাইজ অনেক বড়! সর্বোচ্চ ৮MB ফাইল আপলোড করা যাবে।" },
      ]);
      return;
    }

    setIsLoading(true);
    setProgress("ফাইল প্রসেস হচ্ছে...");

    const userMsg: Msg = { role: "user", content: `📎 ${file.name} আপলোড করা হয়েছে` };
    setMessages((prev) => [...prev, userMsg]);

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("ফাইল পড়তে সমস্যা হয়েছে।"));
        reader.readAsDataURL(file);
      });

      const allMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      await streamChat(getEdgeFunctionUrl("process-file"), {
        messages: allMessages,
        fileData: base64,
        fileType: file.type || "application/octet-stream",
        fileName: file.name,
      });
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: e.message || "ফাইল প্রসেস করতে সমস্যা হয়েছে।" },
      ]);
    } finally {
      setIsLoading(false);
      setProgress("");
    }
  };

  const [isHovered, setIsHovered] = useState(false);
  const [isRadiating, setIsRadiating] = useState(false);

  // Handle clicking the floating logo button
  const handleLogoClick = () => {
    if (open) {
      setOpen(false);
      return;
    }

    // 1. Immediately radiate intense celestial light beams ("আলো বিচ্ছুরণ")
    setIsRadiating(true);
    setShowBubble(false);

    // 2. Open chat and display welcome message immediately after radiant light dispersion
    setTimeout(() => {
      setIsRadiating(false);
      setOpen(true);

      // Seed official welcome message if chat history is empty
      setMessages((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            role: "assistant",
            content: "নমস্কার ও স্বাগতম! ✨ **জ্ঞানচর্চা'লয়**-এর অফিশিয়াল AI স্টাডি সহকারীতে আপনাকে আন্তরিক সাদর সম্ভাষণ!\n\nশ্রদ্ধেয় **সুজয় চৌধুরী** স্যারের তত্ত্বাবধানে আমরা আপনাকে মানসম্মত ডিজিটাল শিক্ষাদানে প্রতিশ্রুতিবদ্ধ। ক্লাস ১ থেকে মাস্টার্স/MBA পর্যন্ত যেকোনো ক্লাসের পড়ালেখা, গণিত সমাধান, মডেল টেস্ট, সৃজনশীল প্রশ্ন কিংবা গাইডলাইন পেতে আমাকে সরাসরি জিজ্ঞেস করতে পারেন।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
          },
        ];
      });
    }, 380);
  };

  return (
    <>
      {/* Floating AI Widget Container - Flex-col items-end guarantees bubble is ALWAYS directly above logo */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end pointer-events-none">
        {/* Correctly Positioned Floating Message Bubble - Always Right Above the Logo */}
        <AnimatePresence>
          {showBubble && !open && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.85 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="pointer-events-auto mb-3 relative rounded-2xl bg-gradient-to-r from-[#F5C76A] via-amber-400 to-[#10B981] px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-[0_10px_25px_rgba(245,199,106,0.6)] cursor-pointer select-none border border-amber-200/90 backdrop-blur-md"
              onClick={handleLogoClick}
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

        {/* Orbiting Stardust Particles on Hover */}
        <AnimatePresence>
          {isHovered && !open && (
            <div className="pointer-events-none absolute inset-0 -m-3 flex items-center justify-center">
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <motion.span
                  key={deg}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.4, 1.2, 0],
                    x: Math.cos((deg * Math.PI) / 180) * 44,
                    y: Math.sin((deg * Math.PI) / 180) * 44,
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{
                    duration: 1.3,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeOut",
                  }}
                  className="absolute rounded-full"
                  style={{
                    width: i % 2 === 0 ? "5px" : "3.5px",
                    height: i % 2 === 0 ? "5px" : "3.5px",
                    backgroundColor: i % 3 === 0 ? "#F5C76A" : i % 3 === 1 ? "#48D9F5" : "#EC4899",
                    boxShadow:
                      i % 3 === 0
                        ? "0 0 10px #F5C76A"
                        : i % 3 === 1
                        ? "0 0 10px #48D9F5"
                        : "0 0 10px #EC4899",
                  }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* The Breathing Floating Button */}
        <motion.button
          id="ai-floating-btn"
          onClick={handleLogoClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center p-0 bg-transparent border-0 outline-none shadow-none cursor-pointer select-none transition-transform"
          animate={{
            y: [0, -6, 0], // Floating levitation
            scale: isHovered ? 1.15 : [1, 1.06, 1], // Gentle Magic Breathe
          }}
          transition={{
            y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
            scale: { duration: isHovered ? 0.2 : 3.2, repeat: isHovered ? 0 : Infinity, ease: "easeInOut" },
          }}
          whileTap={{ scale: 0.9 }}
          title="জ্ঞানচর্চা'লয় AI সহকারী (ক্লিক করে সাহায্য নিন)"
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

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-4 z-50 flex h-[30rem] w-[21rem] flex-col overflow-hidden rounded-2xl shadow-2xl sm:right-5 sm:h-[34rem] sm:w-[23rem]"
            style={{
              background: "hsl(var(--card) / 0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid hsl(var(--gold) / 0.3)",
              boxShadow: "0 8px 32px hsl(var(--gold) / 0.1), 0 0 0 1px hsl(var(--gold) / 0.1)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-4 py-3"
              style={{ background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--primary)))" }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground/20 backdrop-blur">
                <Bot className="h-4.5 w-4.5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-primary-foreground tracking-wide">জ্ঞানচর্চা AI ✨</p>
                <p className="text-[10px] text-primary-foreground/80">
                  {chatMode === "creative" ? "🎨 সৃজনশীল মোড" : chatMode === "precise" ? "🎯 সুনির্দিষ্ট মোড" : "তোমার সহায়ক"}
                </p>
              </div>
              <div className="flex h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_hsl(142,76%,60%)]" />
            </div>

            {/* Progress indicator */}
            {progress && (
              <div className="px-4 py-1.5 bg-muted/50 border-b border-border/30">
                <p className="text-[10px] text-muted-foreground mb-1">{progress}</p>
                <Progress value={undefined} className="h-1" />
              </div>
            )}

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3 scrollbar-thin">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[hsl(var(--gold)/0.15)] to-[hsl(var(--primary)/0.15)] border border-[hsl(var(--gold)/0.2)]">
                    <Bot className="h-7 w-7 text-[hsl(var(--gold))]" />
                  </div>
                  <p className="text-xs font-medium text-foreground mb-1">আমাকে যেকোনো প্রশ্ন করো!</p>
                  <p className="text-[10px] text-muted-foreground max-w-[80%]">
                    📚 পড়াশোনা • 🎨 ছবি তৈরি • 🎬 ভিডিও • 📎 ফাইল বিশ্লেষণ
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {["গণিতে সাহায্য চাই", "ছবি বানাও সূর্যাস্ত", "বিজ্ঞান প্রশ্ন"].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          const imgMatch = q.match(/^ছবি\s+বানাও\s+(.+)/i);
                          if (imgMatch) {
                            generateImage(imgMatch[1], setMessages, setIsLoading, setProgress);
                          } else {
                            send(q);
                          }
                        }}
                        className="rounded-lg border border-[hsl(var(--gold)/0.2)] bg-muted/50 px-2.5 py-1.5 text-[10px] text-foreground hover:bg-muted transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((msg, i) => (
                <ChatMessage key={i} msg={msg} onEdit={msg.role === "assistant" ? (c) => setEditText(c) : undefined} />
              ))}
              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary))]">
                    <Bot className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <div className="rounded-2xl bg-muted/80 backdrop-blur-sm border border-border/50 px-3 py-2 text-xs text-muted-foreground">
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>●</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>●</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <ChatInput
              onSend={send}
              onImageGen={(prompt) => generateImage(prompt, setMessages, setIsLoading, setProgress)}
              onVideoGen={(prompt) => generateVideo(prompt, setMessages, setIsLoading, setProgress)}
              onFileUpload={handleFileUpload}
              isLoading={isLoading}
              initialValue={editText}
              chatMode={chatMode}
              onModeChange={setChatMode}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
