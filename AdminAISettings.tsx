import { useState, useEffect } from "react";
import { Bot, Key, CheckCircle, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const API_KEY_FIELDS = [
  { key: "groq_api_key", label: "Groq API Key", placeholder: "gsk_xxx...", desc: "ফাস্ট LLM + ফ্রি ১০০০+ req/day", link: "https://console.groq.com" },
  { key: "deepseek_api_key", label: "DeepSeek API Key", placeholder: "sk-xxx", desc: "খুব সস্তা/ফ্রি টিয়ার", link: "https://platform.deepseek.com" },
  { key: "together_api_key", label: "Together AI Key", placeholder: "xxx", desc: "Llama 4 + DeepSeek", link: "https://api.together.xyz" },
  { key: "openrouter_api_key", label: "OpenRouter Key", placeholder: "sk-or-v1-xxx", desc: "২০০+ মডেল এক জায়গায়", link: "https://openrouter.ai/keys" },
  { key: "fal_api_key", label: "fal.ai Key", placeholder: "xxx", desc: "ভিডিও জেনারেশন (Runway/Kling)", link: "https://fal.ai" },
  { key: "luma_api_key", label: "Luma AI Key", placeholder: "xxx", desc: "Dream Machine ভিডিও", link: "https://lumalabs.ai" },
];

const AdminAISettings = () => {
  const { isAdmin } = useAuth();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadKeys = async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", API_KEY_FIELDS.map(f => f.key));
        const loaded: Record<string, string> = {};
        data?.forEach(item => {
          if (item.value) loaded[item.key] = item.value;
        });
        setApiKeys(loaded);
      } catch { /* ignore */ }
    };
    loadKeys();
  }, []);

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error("অননুমোদিত অ্যাক্সেস! কেবলমাত্র অ্যাডমিন API কী সেভ করতে পারেন।");
      return;
    }
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(apiKeys)) {
        if (value?.trim()) {
          await supabase.from("site_settings").upsert({ key, value: value.trim() }, { onConflict: "key" });
        }
      }
      toast.success("API Keys সেভ হয়েছে!");
    } catch (err: any) {
      toast.error("সেভ করতে সমস্যা: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bengali text-2xl font-bold text-foreground">🤖 AI Settings</h1>
        <p className="text-sm text-muted-foreground">AI চ্যাটবটের API কী এবং সেটিংস পরিচালনা করুন</p>
      </div>

      {/* Built-in AI Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4 text-[hsl(var(--gold))]" />
              টেক্সট চ্যাট (Lovable AI)
            </CardTitle>
            <CardDescription className="text-xs">স্বয়ংক্রিয়ভাবে কনফিগার করা আছে</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">সক্রিয় ✅</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4 text-[hsl(var(--primary))]" />
              ছবি তৈরি (AI Gateway)
            </CardTitle>
            <CardDescription className="text-xs">Lovable AI + Pollinations.ai ফলব্যাক</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">সক্রিয় ✅</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4 text-[hsl(var(--gold))]" />
              ভিডিও তৈরি (HuggingFace)
            </CardTitle>
            <CardDescription className="text-xs">HuggingFace API + Pollinations ফলব্যাক</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">কনফিগার করা আছে ✅</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">HF_API_KEY সিক্রেট হিসেবে সেভ আছে</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Key className="h-4 w-4 text-[hsl(var(--primary))]" />
              ফাইল প্রসেসিং (Gemini)
            </CardTitle>
            <CardDescription className="text-xs">PDF, ছবি বিশ্লেষণ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">কনফিগার করা আছে ✅</span>
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">GEMINI_API_KEY সিক্রেট হিসেবে সেভ আছে</p>
          </CardContent>
        </Card>
      </div>

      {/* Features overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">চ্যাটবট ফিচার সমূহ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            {[
              "বাংলায় টেক্সট চ্যাট (Gemini AI)",
              "ছবি জেনারেশন (\"ছবি বানাও [প্রম্পট]\")",
              "ভিডিও জেনারেশন (মাল্টি-সোর্স ফলব্যাক)",
              "ফাইল আপলোড ও বিশ্লেষণ (PDF, ছবি)",
              "ভয়েস কমান্ড (বাংলা Speech Recognition)",
              "চ্যাট মোড (সাধারণ, সৃজনশীল, সুনির্দিষ্ট)",
              "কপি, এডিট, ডাউনলোড বাটন",
              "[EXECUTE_COMMAND] দিয়ে অটোনোমাস ডেটাবেস অ্যাকশন",
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extra API Keys for fallback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-5 w-5 text-primary" />
            অতিরিক্ত AI API Keys (ফলব্যাক ও এক্সটেনশন)
          </CardTitle>
          <CardDescription className="text-xs">
            এখানে কী যোগ করলে AI অটো ফলব্যাক করবে + ছবি/ভিডিও/ভয়েস সাপোর্ট বাড়বে
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {API_KEY_FIELDS.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key} className="flex items-center gap-1.5 text-xs">
                  {field.label}
                  <a href={field.link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </a>
                </Label>
                <Input
                  id={field.key}
                  type="password"
                  value={apiKeys[field.key] || ""}
                  onChange={e => setApiKeys(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  className="text-xs"
                />
                <p className="text-[10px] text-muted-foreground">{field.desc}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setApiKeys({})}>Clear All</Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save API Keys"}
            </Button>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-xs font-medium mb-2">কীভাবে ফ্রি কী পাবেন?</h3>
            <ul className="text-[11px] text-muted-foreground space-y-1.5 list-disc pl-5">
              <li>Groq → console.groq.com (ফ্রি সাইনআপ + ইনস্ট্যান্ট কী)</li>
              <li>DeepSeek → platform.deepseek.com (ফ্রি টিয়ার আছে)</li>
              <li>Hugging Face → huggingface.co/settings/tokens</li>
              <li>OpenRouter → openrouter.ai/keys (জেনারাস ফ্রি)</li>
              <li>fal.ai → fal.ai (ফ্রি ক্রেডিট)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAISettings;
