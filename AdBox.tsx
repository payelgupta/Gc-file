import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdBox = () => {
  const [ad, setAd] = useState<Record<string, string>>({});
  useEffect(() => {
    supabase.from("site_settings").select("key,value").in("key", ["ad_text", "ad_link", "ad_image"])
      .then(({ data }) => {
        const m: Record<string, string> = {};
        data?.forEach((r) => { if (r.value) m[r.key] = r.value; });
        setAd(m);
      });
  }, []);

  const body = (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gold/50 bg-muted/30 px-4 py-6 text-center sm:px-6 sm:py-8">
      {ad.ad_image && <img src={ad.ad_image} alt="বিজ্ঞাপন" className="max-h-48 w-auto rounded-lg object-contain" />}
      <p className="whitespace-pre-line font-bengali text-sm text-foreground sm:text-base">
        {ad.ad_text || "📢 বিজ্ঞাপনের জায়গা — বিজ্ঞাপন দিতে যোগাযোগ করুন"}
      </p>
    </div>
  );

  return (
    <section className="py-6 sm:py-8">
      <div className="container px-4 sm:px-6">
        {ad.ad_link ? <a href={ad.ad_link} target="_blank" rel="noopener noreferrer">{body}</a> : body}
      </div>
    </section>
  );
};

export default AdBox;
