import { Bot, User, Copy, Check, Pencil, Download } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type Msg = { role: "user" | "assistant"; content: string; imageUrl?: string; videoUrl?: string };

const ChatMessage = ({ msg, onEdit }: { msg: Msg; onEdit?: (content: string) => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    toast.success("কপি করা হয়েছে!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async (url: string, type: "image" | "video") => {
    try {
      if (url.startsWith("data:")) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `gyancharcha-${type}-${Date.now()}.${type === "image" ? "png" : "mp4"}`;
        a.click();
      } else {
        const resp = await fetch(url);
        const blob = await resp.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = `gyancharcha-${type}-${Date.now()}.${type === "image" ? "png" : "mp4"}`;
        a.click();
        URL.revokeObjectURL(blobUrl);
      }
      toast.success("ডাউনলোড শুরু হয়েছে!");
    } catch {
      window.open(url, "_blank");
      toast.info("নতুন ট্যাবে খোলা হয়েছে");
    }
  };

  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--gold))] to-[hsl(var(--primary))] shadow-md">
          <Bot className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
      <div className="max-w-[82%] space-y-1.5">
        <div
          className={`rounded-2xl px-3 py-2 text-xs leading-relaxed ${
            isUser
              ? "bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--primary))] text-primary-foreground shadow-md"
              : "bg-muted/80 text-foreground backdrop-blur-sm border border-border/50"
          }`}
        >
          {!isUser ? (
            <div className="prose prose-xs prose-neutral dark:prose-invert max-w-none [&_p]:mb-1 [&_p]:mt-0 [&_pre]:text-[10px] [&_code]:text-[10px]">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ) : (
            msg.content
          )}
        </div>

        {/* Generated Image */}
        {msg.imageUrl && (
          <div className="relative group rounded-xl overflow-hidden border border-[hsl(var(--gold)/0.3)] shadow-lg">
            <img src={msg.imageUrl} alt="Generated" className="w-full rounded-xl" loading="lazy" />
            <button
              onClick={() => handleDownload(msg.imageUrl!, "image")}
              className="mt-1 flex items-center gap-1 rounded-lg bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-foreground border border-border/50 hover:bg-background transition-colors"
            >
              <Download className="h-3 w-3" /> ডাউনলোড
            </button>
          </div>
        )}

        {/* Generated Video */}
        {msg.videoUrl && (
          <div className="relative group rounded-xl overflow-hidden border border-[hsl(var(--gold)/0.3)] shadow-lg">
            <video src={msg.videoUrl} controls className="w-full rounded-xl" />
            <button
              onClick={() => handleDownload(msg.videoUrl!, "video")}
              className="mt-1 flex items-center gap-1 rounded-lg bg-background/80 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-foreground border border-border/50 hover:bg-background transition-colors"
            >
              <Download className="h-3 w-3" /> ডাউনলোড
            </button>
          </div>
        )}

        {/* Action Buttons for assistant messages */}
        {!isUser && msg.content && (
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              title="কপি করুন"
            >
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? "কপি হয়েছে" : "কপি"}
            </button>
            {onEdit && (
              <button
                onClick={() => onEdit(msg.content)}
                className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                title="সম্পাদনা করুন"
              >
                <Pencil className="h-3 w-3" /> সম্পাদনা
              </button>
            )}
          </div>
        )}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--primary))] to-[hsl(var(--gold))] shadow-md">
          <User className="h-3.5 w-3.5 text-primary-foreground" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
