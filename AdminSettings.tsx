import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Settings, Image as ImageIcon, Sparkles, RotateCcw, CheckCircle2 } from "lucide-react";
import { broadcastSettingsUpdate, DEFAULT_LOGOS } from "@/hooks/useSiteSettings";

const settingsFields = [
  { key: "site_name", label: "Site Name (ওয়েবসাইট নাম)", type: "text" },
  { key: "site_subtitle", label: "Subtitle (সাবটাইটেল)", type: "text" },
  { key: "hero_title", label: "Hero Title (হোমপেজ প্রধান শিরোনাম)", type: "text" },
  { key: "hero_subtitle", label: "Hero Subtitle (হোমপেজ উপশিরোনাম)", type: "textarea" },
  { key: "hero_badge", label: "Hero Badge Text (ব্যাজ টেক্সট)", type: "text" },
  { key: "footer_developer", label: "Footer Developer Credit (ডেভেলপার ক্রেডিট)", type: "text" },
  { key: "contact_email", label: "Contact Email (যোগাযোগ ইমেইল)", type: "text" },
  { key: "contact_phone", label: "Contact Phone (যোগাযোগ ফোন)", type: "text" },
  { key: "social_facebook", label: "Facebook URL (ফেসবুক পেজ লিংক)", type: "text" },
  { key: "social_youtube", label: "YouTube URL (ইউটিউব চ্যানেল লিংক)", type: "text" },
  { key: "social_telegram", label: "Telegram URL (টেলিগ্রাম গ্রুপ লিংক)", type: "text" },
  { key: "whatsapp_url", label: "WhatsApp URL (হোয়াটসঅ্যাপ লিংক)", type: "text" },
  { key: "custom_url_1", label: "Custom URL 1", type: "text" },
  { key: "custom_url_2", label: "Custom URL 2", type: "text" },
  { key: "custom_url_1_label", label: "Custom URL 1 Label", type: "text" },
  { key: "custom_url_2_label", label: "Custom URL 2 Label", type: "text" },
  { key: "ad_text", label: "বিজ্ঞাপনের লেখা (হোমপেজ)", type: "textarea" },
  { key: "ad_link", label: "বিজ্ঞাপনের লিংক (ঐচ্ছিক)", type: "text" },
  { key: "ad_image", label: "বিজ্ঞাপনের ছবির লিংক (ঐচ্ছিক)", type: "text" },
];

const PRESET_LOGOS = [
  { label: "গোল্ডেন ক্রেস্ট", url: DEFAULT_LOGOS.header },
  { label: "উইংস ক্রেস্ট", url: DEFAULT_LOGOS.wings },
  { label: "ডিফল্ট লোগো", url: "/logo.png" },
];

export const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row) => {
          if (row.key) map[row.key] = row.value || "";
        });
        setSettings(map);
        broadcastSettingsUpdate(map);
      }
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save all standard fields + header_logo + footer_logo
      const allKeys = [
        ...settingsFields.map((f) => f.key),
        "header_logo",
        "footer_logo",
      ];

      for (const key of allKeys) {
        const value = settings[key] || "";
        await supabase
          .from("site_settings")
          .upsert({ key, value }, { onConflict: "key" });
      }

      // Broadcast update across entire application instantly
      broadcastSettingsUpdate(settings);

      toast({
        title: "সেটিংস সফলভাবে সেভ হয়েছে!",
        description: "হেডার ও ফুটার লোগোসহ সাইটের সকল কনফিগারেশন রিয়েল-টাইমে আপডেট হয়েছে।",
      });
    } catch {
      toast({
        title: "সেভ করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    key: "header_logo" | "footer_logo"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoUploading(key);
    try {
      let finalLogoUrl = "";

      // Try uploading to Supabase Storage first
      try {
        const ext = file.name.split(".").pop();
        const path = `logos/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("uploads").upload(path, file);

        if (!error) {
          const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);
          if (urlData?.publicUrl) {
            finalLogoUrl = urlData.publicUrl;
          }
        }
      } catch {
        /* storage upload error fallback */
      }

      // If remote upload wasn't available or errored, use reliable Base64 Data URL fallback
      if (!finalLogoUrl) {
        finalLogoUrl = await readFileAsDataUrl(file);
      }

      if (finalLogoUrl) {
        const updated = { ...settings, [key]: finalLogoUrl };
        setSettings(updated);

        // Persist to site_settings table
        await supabase
          .from("site_settings")
          .upsert({ key, value: finalLogoUrl }, { onConflict: "key" });

        // Immediate broadcast to header, footer and homepage
        broadcastSettingsUpdate(updated);

        toast({
          title: `${key === "header_logo" ? "হেডার" : "ফুটার"} লোগো আপডেট হয়েছে!`,
          description: "হোমপেজ ও ওয়েবসাইটের সর্বত্র নতুন লোগো প্রদর্শিত হচ্ছে।",
        });
      } else {
        toast({ title: "ফাইল রিড করতে ব্যর্থ হয়েছে", variant: "destructive" });
      }
    } catch {
      toast({ title: "আপলোড ব্যর্থ হয়েছে", variant: "destructive" });
    } finally {
      setLogoUploading(null);
    }
  };

  const handleSelectPreset = async (
    key: "header_logo" | "footer_logo",
    url: string
  ) => {
    const updated = { ...settings, [key]: url };
    setSettings(updated);

    await supabase
      .from("site_settings")
      .upsert({ key, value: url }, { onConflict: "key" });

    broadcastSettingsUpdate(updated);

    toast({
      title: `${key === "header_logo" ? "হেডার" : "ফুটার"} লোগো সেট করা হয়েছে!`,
      description: "পরিবর্তনটি রিয়েল-টাইমে কার্যকর হয়েছে।",
    });
  };

  const handleResetLogo = async (key: "header_logo" | "footer_logo") => {
    const defaultUrl = DEFAULT_LOGOS.header;
    const updated = { ...settings, [key]: defaultUrl };
    setSettings(updated);

    await supabase
      .from("site_settings")
      .upsert({ key, value: defaultUrl }, { onConflict: "key" });

    broadcastSettingsUpdate(updated);

    toast({
      title: "ডিফল্ট লোগো রিস্টোর করা হয়েছে",
    });
  };

  return (
    <div className="font-bengali pb-12">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.history.back()}
          className="gap-1.5"
        >
          ← ব্যাক
        </Button>
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground">
            Site Settings (ওয়েবসাইট সেটিংস)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            হেডার ও ফুটার লোগো, সাইটের নাম, কন্টাক্ট এবং সোশ্যাল লিংক রিয়েল-টাইমে পরিবর্তন করুন
          </p>
        </div>
      </div>

      {/* Dedicated Visual Logo Management Section */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0B1026]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
          <ImageIcon className="h-5 w-5 text-amber-400" />
          <h2 className="text-base sm:text-lg font-bold text-white">
            হেডার ও ফুটার ব্র্যান্ড লোগো ব্যবস্থাপনা (Real-Time Auto-Update)
          </h2>
        </div>

        <p className="text-xs text-slate-300 mb-6 leading-relaxed">
          এখানে হেডার ও ফুটারের জন্য যেকোনো ইমেজ (PNG, JPG, SVG, GIF) আপলোড করতে পারেন অথবা সরাসরি ছবির লিংক দিতে পারেন। পরিবর্তন করার সাথে সাথে হোমপেজ ও সাইটের সর্বত্র স্বয়ংক্রিয়ভাবে অটো-আপডেট হয়ে যাবে।
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {(
            [
              {
                key: "header_logo",
                label: "হেডার লোগো (Top Navigation Logo)",
                defaultVal: DEFAULT_LOGOS.header,
              },
              {
                key: "footer_logo",
                label: "ফুটার লোগো (Bottom Footer Logo)",
                defaultVal: DEFAULT_LOGOS.footer,
              },
            ] as const
          ).map((item) => {
            const currentVal = settings[item.key] || item.defaultVal;

            return (
              <div
                key={item.key}
                className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Label className="font-bold text-white text-sm">
                      {item.label}
                    </Label>
                    <button
                      type="button"
                      onClick={() => handleResetLogo(item.key)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium transition-colors"
                      title="ডিফল্ট লোগোতে ফেরত যান"
                    >
                      <RotateCcw className="h-3 w-3" /> রিসেট
                    </button>
                  </div>

                  {/* Visual Preview Box */}
                  <div className="my-3 flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-[#080A12] border border-amber-400/40 p-1 flex items-center justify-center overflow-hidden shadow-inner relative group">
                      <img
                        src={currentVal}
                        alt="Logo Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = DEFAULT_LOGOS.header;
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> সক্রিয় লোগো
                      </span>
                      <p className="text-[10px] text-slate-300 truncate mt-0.5 font-mono">
                        {currentVal}
                      </p>
                    </div>
                  </div>

                  {/* File Upload Input */}
                  <div className="space-y-1.5 mt-2">
                    <Label className="text-xs text-slate-300">
                      কম্পিউটার/মোবাইল থেকে নতুন ছবি আপলোড করুন:
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleLogoUpload(e, item.key)}
                      disabled={logoUploading === item.key}
                      className="cursor-pointer text-xs bg-black/30 border-white/15 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-400/20 file:text-amber-300 hover:file:bg-amber-400/30"
                    />
                    {logoUploading === item.key && (
                      <p className="text-[11px] text-amber-300 animate-pulse mt-1">
                        লোগো আপলোড ও প্রসেস হচ্ছে...
                      </p>
                    )}
                  </div>

                  {/* Image URL Manual Input */}
                  <div className="space-y-1.5 mt-3">
                    <Label className="text-xs text-slate-300">
                      অথবা সরাসরি ছবির URL/পাথ লিখুন:
                    </Label>
                    <Input
                      value={settings[item.key] || ""}
                      placeholder={item.defaultVal}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSettings((s) => ({ ...s, [item.key]: val }));
                        broadcastSettingsUpdate({ ...settings, [item.key]: val });
                      }}
                      className="text-xs bg-black/30 border-white/15 text-white"
                    />
                  </div>

                  {/* One-Click Presets */}
                  <div className="mt-3 pt-2.5 border-t border-white/10">
                    <span className="block text-[11px] text-slate-400 mb-1.5">
                      জনপ্রিয় প্রিসেট লোগো বেছে নিন:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_LOGOS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleSelectPreset(item.key, preset.url)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            currentVal === preset.url
                              ? "bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm"
                              : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          <Sparkles className="inline h-2.5 w-2.5 mr-1" />
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Settings Fields */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[#0B1026]/90 p-5 sm:p-6 shadow-xl backdrop-blur-md">
        <h2 className="text-base sm:text-lg font-bold text-white mb-4 pb-3 border-b border-white/10">
          সাধারণ ওয়েবসাইট তথ্য ও সোশ্যাল লিংক
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {settingsFields.map((field) => (
            <div
              key={field.key}
              className={field.type === "textarea" ? "sm:col-span-2" : ""}
            >
              <Label className="text-xs sm:text-sm text-slate-200 font-semibold mb-1 block">
                {field.label}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  value={settings[field.key] || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, [field.key]: e.target.value }))
                  }
                  rows={3}
                  className="bg-black/30 border-white/15 text-white text-xs sm:text-sm rounded-xl focus:border-amber-400"
                />
              ) : (
                <Input
                  value={settings[field.key] || ""}
                  onChange={(e) =>
                    setSettings((s) => ({ ...s, [field.key]: e.target.value }))
                  }
                  className="bg-black/30 border-white/15 text-white text-xs sm:text-sm rounded-xl focus:border-amber-400"
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            * সেভ বাটনে ক্লিক করলে সমস্ত পরিবর্তন পুরো সাইটে তাৎক্ষণিকভাবে প্রতিফলিত হবে।
          </p>
          <Button
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold px-6 shadow-lg"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "সেভ হচ্ছে..." : "Save Settings (সেভ করুন)"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
