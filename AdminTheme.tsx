import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Palette, Shuffle, Type } from "lucide-react";

const colorFields = [
  { key: "primary_color", label: "Primary Color (HSL)", placeholder: "152 72% 40%" },
  { key: "accent_color", label: "Accent/Gold Color (HSL)", placeholder: "36 100% 50%" },
  { key: "background_color", label: "Background Color (HSL)", placeholder: "0 0% 98%" },
  { key: "foreground_color", label: "Foreground Color (HSL)", placeholder: "210 11% 15%" },
  { key: "card_color", label: "Card Color (HSL)", placeholder: "0 0% 100%" },
  { key: "muted_color", label: "Muted Color (HSL)", placeholder: "210 10% 94%" },
  { key: "border_color", label: "Border Color (HSL)", placeholder: "210 12% 90%" },
];

const gradientFields = [
  { key: "gradient_site_name", label: "সাইট নাম গ্র্যাডিয়েন্ট (CSS)", placeholder: "linear-gradient(90deg, #0f0, #0ff)" },
  { key: "gradient_subtitle", label: "সাবটাইটেল গ্র্যাডিয়েন্ট", placeholder: "linear-gradient(90deg, #ff0, #f0f)" },
  { key: "gradient_hero", label: "হিরো সেকশন গ্র্যাডিয়েন্ট", placeholder: "linear-gradient(135deg, #000, #333)" },
  { key: "gradient_footer", label: "ফুটার টেক্সট গ্র্যাডিয়েন্ট", placeholder: "linear-gradient(90deg, #fff, #ccc)" },
];

const fontFields = [
  { key: "font_heading", label: "Heading Font", placeholder: "Noto Sans Bengali" },
  { key: "font_body", label: "Body Font", placeholder: "Inter" },
  { key: "font_size_base", label: "Base Font Size", placeholder: "16px" },
  { key: "font_size_heading", label: "Heading Font Size", placeholder: "2rem" },
  { key: "border_radius", label: "Border Radius", placeholder: "0.75rem" },
];

const allFields = [...colorFields, ...gradientFields, ...fontFields];

const randomHSL = () => `${Math.floor(Math.random() * 360)} ${50 + Math.floor(Math.random() * 50)}% ${30 + Math.floor(Math.random() * 40)}%`;

const AdminTheme = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTheme = async () => {
      const { data } = await supabase.from("theme_settings").select("*");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach(row => { map[row.key] = row.value || ""; });
        setSettings(map);
      }
    };
    fetchTheme();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    for (const field of allFields) {
      const value = settings[field.key] || "";
      await supabase.from("theme_settings").upsert({ key: field.key, value }, { onConflict: "key" });
    }
    toast({ title: "থিম সেটিংস সেভ হয়েছে!", description: "পেজ রিফ্রেশ করলে পরিবর্তন দেখা যাবে।" });
    setLoading(false);
  };

  const randomizeColors = () => {
    const updated = { ...settings };
    colorFields.forEach(f => { updated[f.key] = randomHSL(); });
    setSettings(updated);
    toast({ title: "🎲 Random colors generated!" });
  };

  const previewColor = (hsl: string) => {
    try { return `hsl(${hsl})`; } catch { return "transparent"; }
  };

  const renderSection = (title: string, icon: React.ReactNode, fields: typeof colorFields, isColor = false) => (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {isColor && (
          <Button variant="outline" size="sm" className="ml-auto" onClick={randomizeColors}>
            <Shuffle className="h-3.5 w-3.5 mr-1" /> Random Colors
          </Button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(field => (
          <div key={field.key}>
            <Label className="text-sm">{field.label}</Label>
            <div className="mt-1 flex items-center gap-2">
              <Input
                value={settings[field.key] || ""}
                onChange={e => setSettings(s => ({ ...s, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
              />
              {isColor && (
                <div
                  className="h-9 w-9 shrink-0 rounded-lg border border-border"
                  style={{ backgroundColor: previewColor(settings[field.key] || field.placeholder) }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">← ব্যাক</Button>
        <Palette className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Theme Settings</h1>
          <p className="text-sm text-muted-foreground">রঙ, ফন্ট ও গ্র্যাডিয়েন্ট কাস্টমাইজ করুন</p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {renderSection("🎨 Colors", <Palette className="h-5 w-5 text-primary" />, colorFields, true)}
        {renderSection("🌈 Gradient Colors", <Palette className="h-5 w-5 text-gold" />, gradientFields)}
        {renderSection("🔤 Fonts & Sizing", <Type className="h-5 w-5 text-primary" />, fontFields)}
      </div>

      <Button className="mt-6" onClick={handleSave} disabled={loading}>
        {loading ? "সেভ হচ্ছে..." : "Save Theme Settings"}
      </Button>
    </div>
  );
};

export default AdminTheme;
