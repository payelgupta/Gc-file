import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Trash2, Upload, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  is_visible: boolean;
  created_at: string;
}

const AdminGallery = () => {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showGalleryOnHome, setShowGalleryOnHome] = useState(true);
  const { toast } = useToast();

  const fetchPhotos = async () => {
    const { data } = await supabase
      .from("photo_gallery")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPhotos(data);
  };

  const fetchToggle = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "show_gallery")
      .maybeSingle();
    if (data) setShowGalleryOnHome(data.value !== "false");
  };

  useEffect(() => {
    fetchPhotos();
    fetchToggle();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const ext = file.name.split(".").pop();
    const path = `gallery/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("uploads").upload(path, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(path);

    await supabase.from("photo_gallery").insert({
      image_url: urlData.publicUrl,
      caption: caption || null,
    });

    setCaption("");
    toast({ title: "ছবি আপলোড হয়েছে!" });
    setUploading(false);
    fetchPhotos();
  };

  const toggleVisibility = async (id: string, current: boolean) => {
    await supabase.from("photo_gallery").update({ is_visible: !current }).eq("id", id);
    fetchPhotos();
  };

  const deletePhoto = async (id: string) => {
    await supabase.from("photo_gallery").delete().eq("id", id);
    fetchPhotos();
    toast({ title: "ছবি মুছে ফেলা হয়েছে" });
  };

  const toggleGalleryOnHome = async (val: boolean) => {
    setShowGalleryOnHome(val);
    await supabase.from("site_settings").upsert({ key: "show_gallery", value: val ? "true" : "false" }, { onConflict: "key" });
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">← ব্যাক</Button>
        <ImageIcon className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Photo Gallery</h1>
          <p className="text-sm text-muted-foreground">ছবি আপলোড করুন ও গ্যালারি ম্যানেজ করুন</p>
        </div>
      </div>

      {/* Toggle gallery on home */}
      <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <Switch checked={showGalleryOnHome} onCheckedChange={toggleGalleryOnHome} />
        <Label>হোম পেজে গ্যালারি দেখান</Label>
      </div>

      {/* Upload */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">নতুন ছবি আপলোড</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>ক্যাপশন (ঐচ্ছিক)</Label>
            <Input value={caption} onChange={e => setCaption(e.target.value)} placeholder="ছবির বিবরণ..." />
          </div>
          <div>
            <Label>ছবি নির্বাচন করুন</Label>
            <div className="relative">
              <Input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
            </div>
          </div>
        </div>
        {uploading && <p className="mt-2 text-sm text-muted-foreground">আপলোড হচ্ছে...</p>}
      </div>

      {/* Gallery grid */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {photos.map(photo => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group relative overflow-hidden rounded-xl border border-border bg-card"
            >
              <img src={photo.image_url} alt={photo.caption || "Gallery"} className="h-48 w-full object-cover" />
              <div className="p-3">
                <p className="text-sm text-foreground">{photo.caption || "কোনো ক্যাপশন নেই"}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleVisibility(photo.id, photo.is_visible)}>
                    {photo.is_visible ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                    {photo.is_visible ? "দৃশ্যমান" : "লুকানো"}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deletePhoto(photo.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {photos.length === 0 && (
        <div className="mt-8 text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 opacity-30" />
          <p className="mt-2">কোনো ছবি নেই। উপরে থেকে আপলোড করুন।</p>
        </div>
      )}
    </div>
  );
};

export default AdminGallery;
