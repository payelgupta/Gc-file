import { useState, useRef, useEffect } from "react";
import { Send, Plus, Image, Video, X, FileText, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
  onSend: (text: string) => void;
  onImageGen: (prompt: string) => void;
  onVideoGen: (prompt: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  initialValue?: string;
  chatMode: string;
  onModeChange: (mode: string) => void;
}

const MODES = [
  { id: "normal", label: "সাধারণ", desc: "সাধারণ কথোপকথন" },
  { id: "creative", label: "সৃজনশীল", desc: "গল্প, কবিতা, সৃজনশীল লেখা" },
  { id: "precise", label: "সুনির্দিষ্ট", desc: "তথ্যনির্ভর সংক্ষিপ্ত উত্তর" },
];

const ChatInput = ({ onSend, onImageGen, onVideoGen, onFileUpload, isLoading, initialValue = "", chatMode, onModeChange }: ChatInputProps) => {
  const [input, setInput] = useState(initialValue);
  const [showMenu, setShowMenu] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialValue) setInput(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if ((!text && !attachedFile) || isLoading) return;

    // If file is attached, handle file upload
    if (attachedFile) {
      onFileUpload(attachedFile);
      if (text) {
        // Send text alongside - the parent handles combining
        setTimeout(() => onSend(text), 100);
      }
      clearAttachment();
      setInput("");
      return;
    }

    // Auto-detect image generation prompts
    const imgMatch = text.match(/^(?:generate\s+image|ছবি\s+(?:বানাও|তৈরি\s+করো|জেনারেট))\s*(?:of\s+|:?\s*)?(.+)/i);
    if (imgMatch) {
      onImageGen(imgMatch[1].trim());
      setInput("");
      return;
    }

    // Auto-detect video generation prompts
    const vidMatch = text.match(/^(?:generate\s+video|ভিডিও\s+(?:বানাও|তৈরি\s+করো|জেনারেট))\s*(?:of\s+|:?\s*)?(.+)/i);
    if (vidMatch) {
      onVideoGen(vidMatch[1].trim());
      setInput("");
      return;
    }

    onSend(text);
    setInput("");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFile(file);
    setShowMenu(false);

    // Generate preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setFilePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="border-t border-[hsl(var(--gold)/0.2)] px-3 py-2 bg-background/50 backdrop-blur-sm">
      {/* Attached file preview */}
      {attachedFile && (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-[hsl(var(--gold)/0.2)] bg-muted/50 p-1.5 animate-fade-in">
          {filePreview ? (
            <img src={filePreview} alt="Preview" className="h-10 w-10 rounded object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium text-foreground truncate">{attachedFile.name}</p>
            <p className="text-[9px] text-muted-foreground">{(attachedFile.size / 1024).toFixed(0)} KB</p>
          </div>
          <button onClick={clearAttachment} className="p-1 rounded hover:bg-muted">
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* Action menus */}
      {showMenu && (
        <div className="flex gap-1.5 mb-2 animate-fade-in">
          <button
            onClick={() => { fileRef.current?.click(); }}
            className="flex items-center gap-1 rounded-lg bg-muted/80 px-2.5 py-1.5 text-[10px] font-medium text-foreground hover:bg-muted transition-colors border border-border/50"
          >
            <FileText className="h-3 w-3 text-[hsl(var(--gold))]" /> ফাইল আপলোড
          </button>
          <button
            onClick={() => { setInput("ছবি বানাও "); setShowMenu(false); }}
            className="flex items-center gap-1 rounded-lg bg-muted/80 px-2.5 py-1.5 text-[10px] font-medium text-foreground hover:bg-muted transition-colors border border-border/50"
          >
            <Image className="h-3 w-3 text-[hsl(var(--gold))]" /> ছবি তৈরি
          </button>
          <button
            onClick={() => { setInput("ভিডিও বানাও "); setShowMenu(false); }}
            className="flex items-center gap-1 rounded-lg bg-muted/80 px-2.5 py-1.5 text-[10px] font-medium text-foreground hover:bg-muted transition-colors border border-border/50"
          >
            <Video className="h-3 w-3 text-[hsl(var(--primary))]" /> ভিডিও তৈরি
          </button>
        </div>
      )}

      {/* Modes menu */}
      {showModes && (
        <div className="mb-2 space-y-1 animate-fade-in">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => { onModeChange(m.id); setShowModes(false); }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors border ${
                chatMode === m.id
                  ? "bg-[hsl(var(--gold)/0.15)] border-[hsl(var(--gold)/0.3)] text-foreground"
                  : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="text-[10px] font-semibold">{m.label}</span>
              <span className="text-[9px] text-muted-foreground">{m.desc}</span>
            </button>
          ))}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,application/pdf,text/plain"
        onChange={handleFileSelect}
        className="hidden"
      />

      <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
        {/* Plus button */}
        <button
          type="button"
          onClick={() => { setShowMenu(!showMenu); setShowModes(false); }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[hsl(var(--gold)/0.15)] to-[hsl(var(--primary)/0.15)] text-foreground hover:from-[hsl(var(--gold)/0.25)] hover:to-[hsl(var(--primary)/0.25)] transition-all border border-[hsl(var(--gold)/0.2)]"
          title="ফাইল ও মিডিয়া"
        >
          <Plus className="h-4 w-4" />
        </button>

        {/* Modes button */}
        <button
          type="button"
          onClick={() => { setShowModes(!showModes); setShowMenu(false); }}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-border/50"
          title="মোড পরিবর্তন"
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="তোমার প্রশ্ন লেখো..."
          className="flex-1 rounded-xl border border-[hsl(var(--gold)/0.2)] bg-background/70 px-3 py-2 text-xs outline-none ring-ring focus:ring-1 focus:border-[hsl(var(--gold)/0.5)] backdrop-blur-sm placeholder:text-muted-foreground"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-r from-[hsl(var(--gold))] to-[hsl(var(--primary))] hover:opacity-90 shadow-md"
          disabled={isLoading || (!input.trim() && !attachedFile)}
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
