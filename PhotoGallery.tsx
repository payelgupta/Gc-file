import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string | null;
}

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [showGallery, setShowGallery] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: setting } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "show_gallery")
        .maybeSingle();

      if (setting?.value !== "true") return;
      setShowGallery(true);

      const { data } = await supabase
        .from("photo_gallery")
        .select("id, image_url, caption")
        .eq("is_visible", true)
        .order("created_at", { ascending: false })
        .limit(8);
      setPhotos(data || []);
    };
    fetchData();
  }, []);

  if (!showGallery || photos.length === 0) return null;

  return (
    <section className="py-10 sm:py-12 md:py-16">
      <div className="container px-4 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">
            <Camera className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">ফটো গ্যালারি (Photo Gallery)</h2>
            <p className="text-xs sm:text-sm text-slate-200 font-semibold mt-0.5">ক্লাসরুম ও অ্যাওয়ার্ড অনুষ্ঠানের বিশেষ মুহূর্তগুলো</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={photo.image_url}
                alt={photo.caption || "Gallery photo"}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 sm:p-3">
                  <p className="text-[10px] font-medium text-white sm:text-xs">{photo.caption}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PhotoGallery;
