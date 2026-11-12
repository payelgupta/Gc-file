import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, ImagePlus, ZoomIn, Sparkles, Loader2, Link2 } from "lucide-react";

const SCALE_OPTIONS = [2, 4, 8, 16, 32];

const linkOptions = [
  { value: "/category/class-1-5", label: "Class 1–5" },
  { value: "/category/class-6-8", label: "Class 6–8" },
  { value: "/category/ssc", label: "SSC" },
  { value: "/category/hsc", label: "HSC" },
  { value: "/category/honours", label: "Honours" },
  { value: "/category/ma", label: "MA" },
  { value: "/notice", label: "নোটিশ বোর্ড" },
  { value: "/about", label: "আমাদের সম্পর্কে" },
  { value: "/contact", label: "যোগাযোগ" },
];

const AdminHeroSettings = () => {
  const [heroUrl, setHeroUrl] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(85);
  const [uploading, setUploading] = useState(false);
  const [upscaling, setUpscaling] = useState(false);
  const [selectedScale, setSelectedScale] = useState(2);
  const [startLearningLink, setStartLearningLink] = useState("/category/class-1-5");
  const [viewSuggestionsLink, setViewSuggestionsLink] = useState("/notice");
  const [savingLinks, setSavingLinks] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["hero_bg_url", "hero_opacity", "start_learning_link", "view_suggestions_link"]);
    if (data) {
      data.forEach((s) => {
        if (s.key === "hero_bg_url" && s.value) setHeroUrl(s.value);
        if (s.key === "hero_opacity" && s.value) setOpacity(Number(s.value));
        if (s.key === "start_learning_link" && s.value) setStartLearningLink(s.value);
        if (s.key === "view_suggestions_link" && s.value) setViewSuggestionsLink(s.value);
      });
    }
  };

  const handleSaveLinks = async () => {
    setSavingLinks(true);
    await Promise.all([
      saveSetting("start_learning_link", startLearningLink),
      saveSetting("view_suggestions_link", viewSuggestionsLink),
    ]);
    toast.success("বাটন লিংক সেভ হয়েছে!");
    setSavingLinks(false);
  };

  const saveSetting = async (key: string, value: string) => {
    await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `hero/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("uploads").upload(path, file, { upsert: true });
    if (error) {
      toast.error("আপলোড ব্যর্থ হয়েছে");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
    const url = urlData.publicUrl;
    setHeroUrl(url);
    await saveSetting("hero_bg_url", url);
    toast.success("ব্যাকগ্রাউন্ড আপলোড হয়েছে!");
    setUploading(false);
  };

  const handleOpacityChange = async (val: number[]) => {
    setOpacity(val[0]);
    await saveSetting("hero_opacity", String(val[0]));
  };

  const handleUpscaleEnhance = async () => {
    if (!heroUrl) {
      toast.error("আগে একটি ইমেজ আপলোড করুন");
      return;
    }

    setUpscaling(true);
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = heroUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("ইমেজ লোড করা যায়নি"));
      });

      const scale = selectedScale;
      const newW = img.naturalWidth * scale;
      const newH = img.naturalHeight * scale;

      // Use OffscreenCanvas for large images if available, else regular canvas
      const canvas = canvasRef.current!;
      canvas.width = newW;
      canvas.height = newH;

      const ctx = canvas.getContext("2d")!;
      // Enable high-quality image smoothing for enhancement
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Multi-step upscale for better quality (step-up approach)
      let currentW = img.naturalWidth;
      let currentH = img.naturalHeight;
      
      // Create a temporary canvas for step-up scaling
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d")!;
      tempCtx.imageSmoothingEnabled = true;
      tempCtx.imageSmoothingQuality = "high";

      // First draw original
      tempCanvas.width = currentW;
      tempCanvas.height = currentH;
      tempCtx.drawImage(img, 0, 0);

      // Step up by 2x each time for better quality
      while (currentW < newW || currentH < newH) {
        const nextW = Math.min(currentW * 2, newW);
        const nextH = Math.min(currentH * 2, newH);

        const stepCanvas = document.createElement("canvas");
        stepCanvas.width = nextW;
        stepCanvas.height = nextH;
        const stepCtx = stepCanvas.getContext("2d")!;
        stepCtx.imageSmoothingEnabled = true;
        stepCtx.imageSmoothingQuality = "high";
        stepCtx.drawImage(tempCanvas, 0, 0, nextW, nextH);

        tempCanvas.width = nextW;
        tempCanvas.height = nextH;
        tempCtx.drawImage(stepCanvas, 0, 0);

        currentW = nextW;
        currentH = nextH;
      }

      // Apply sharpening filter for enhancement
      ctx.drawImage(tempCanvas, 0, 0);

      // Apply a subtle sharpening effect using unsharp mask technique
      applySharpening(ctx, newW, newH);

      // Convert to blob and upload
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
      });

      const path = `hero/upscaled_${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("uploads").upload(path, blob, { upsert: true });
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
      const newUrl = urlData.publicUrl;
      setHeroUrl(newUrl);
      await saveSetting("hero_bg_url", newUrl);

      toast.success(`${scale}x Upscale & Enhance সম্পন্ন!`);
    } catch (err: any) {
      toast.error(err.message || "Upscale ব্যর্থ হয়েছে");
    } finally {
      setUpscaling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">
          ← ব্যাক
        </Button>
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">🖼️ Hero Background Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">হিরো সেকশনের ব্যাকগ্রাউন্ড ইমেজ ও অপাসিটি ম্যানেজ করুন</p>
        </div>
      </div>

      {/* Preview */}
      <div className="relative overflow-hidden rounded-xl border border-border" style={{ height: 250 }}>
        {heroUrl ? (
          <>
            <img src={heroUrl} alt="Hero preview" className="h-full w-full object-cover" />
            <div
              className="absolute inset-0 bg-gradient-to-r from-primary via-primary to-primary"
              style={{ opacity: opacity / 100 }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-lg font-bold text-primary-foreground drop-shadow-lg">প্রিভিউ — অপাসিটি {opacity}%</p>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <p className="text-sm text-muted-foreground">কোনো ব্যাকগ্রাউন্ড সেট করা হয়নি</p>
          </div>
        )}
      </div>

      {/* Upload */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">ব্যাকগ্রাউন্ড ইমেজ আপলোড</h3>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <Button onClick={() => fileRef.current?.click()} disabled={uploading} className="gap-2">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {uploading ? "আপলোড হচ্ছে..." : "ইমেজ আপলোড করুন"}
        </Button>
      </div>

      {/* Opacity Control */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">অপাসিটি কন্ট্রোল — {opacity}%</h3>
        <Slider
          value={[opacity]}
          onValueChange={handleOpacityChange}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0% (স্বচ্ছ)</span>
          <span>100% (সম্পূর্ণ ঢাকা)</span>
        </div>
      </div>

      {/* Button Link Settings */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">🔗 হিরো বাটন লিংক সেটিংস</h3>
        </div>
        <p className="text-xs text-muted-foreground">Start Learning ও View Suggestions বাটন কোন পেজে নিয়ে যাবে সেটি নির্ধারণ করুন</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">Start Learning বাটন</label>
            <Select value={startLearningLink} onValueChange={setStartLearningLink}>
              <SelectTrigger>
                <SelectValue placeholder="লিংক নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {linkOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-foreground">View Suggestions বাটন</label>
            <Select value={viewSuggestionsLink} onValueChange={setViewSuggestionsLink}>
              <SelectTrigger>
                <SelectValue placeholder="লিংক নির্বাচন করুন" />
              </SelectTrigger>
              <SelectContent>
                {linkOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSaveLinks} disabled={savingLinks} className="gap-2">
          {savingLinks ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          {savingLinks ? "সেভ হচ্ছে..." : "লিংক সেভ করুন"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">🔍 Enhance & Upscale</h3>
        <p className="text-xs text-muted-foreground">ইমেজ কে বড় ও উন্নত করুন — সম্পূর্ণ বিনামূল্যে (Canvas-based)</p>

        <div className="flex flex-wrap gap-2">
          {SCALE_OPTIONS.map((s) => (
            <Button
              key={s}
              variant={selectedScale === s ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedScale(s)}
              className="text-xs"
            >
              {s}x
            </Button>
          ))}
        </div>

        <Button onClick={handleUpscaleEnhance} disabled={upscaling || !heroUrl} className="gap-2">
          {upscaling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {upscaling ? "প্রসেসিং হচ্ছে..." : `${selectedScale}x Enhance & Upscale`}
        </Button>

        {selectedScale >= 16 && (
          <p className="text-xs text-amber-500">⚠️ উচ্চ স্কেলে প্রসেসিং সময় বেশি লাগতে পারে এবং ব্রাউজার ধীর হতে পারে।</p>
        )}
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

// Simple unsharp mask sharpening
function applySharpening(ctx: CanvasRenderingContext2D, w: number, h: number) {
  try {
    // For very large images, skip sharpening to avoid memory issues
    if (w * h > 16_000_000) return;

    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const copy = new Uint8ClampedArray(data);

    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    const kSize = 3;
    const half = Math.floor(kSize / 2);

    for (let y = half; y < h - half; y++) {
      for (let x = half; x < w - half; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0;
          for (let ky = 0; ky < kSize; ky++) {
            for (let kx = 0; kx < kSize; kx++) {
              const idx = ((y + ky - half) * w + (x + kx - half)) * 4 + c;
              sum += copy[idx] * kernel[ky * kSize + kx];
            }
          }
          data[(y * w + x) * 4 + c] = Math.min(255, Math.max(0, sum));
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  } catch {
    // Silently fail if memory issues
  }
}

export default AdminHeroSettings;
