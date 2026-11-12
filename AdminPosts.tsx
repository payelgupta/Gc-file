import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Post = Tables<"posts">;

const categories = ["general", "video", "pdf", "suggestion", "class-1-5", "class-6-8", "ssc", "hsc", "honours", "ma"];

const AdminPosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general", video_url: "", pdf_url: "", image_url: "", is_published: true, requires_permission: false, is_paid: false, price: 0, discount_price: "" as any, chapters: [] as {title:string;url:string}[] });
  const { toast } = useToast();

  const fetchPosts = async () => {
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
    setPosts(data || []);
  };

  useEffect(() => { fetchPosts(); }, []);

  const resetForm = () => {
    setForm({ title: "", content: "", category: "general", video_url: "", pdf_url: "", image_url: "", is_published: true, requires_permission: false, is_paid: false, price: 0, discount_price: "" as any, chapters: [] as {title:string;url:string}[] });
    setEditing(null);
    setShowForm(false);
  };

  const handleEdit = (post: Post) => {
    setForm({
      title: post.title,
      content: post.content || "",
      category: post.category,
      video_url: post.video_url || "",
      pdf_url: post.pdf_url || "",
      chapters: Array.isArray(post.chapters) ? (post.chapters as any) : [],
      image_url: post.image_url || "",
      is_published: post.is_published,
      requires_permission: (post as any).requires_permission || false,
      is_paid: (post as any).is_paid || false, price: (post as any).price || 0, discount_price: (post as any).discount_price ?? "",
    });
    setEditing(post);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (form.is_paid && form.pdf_url && form.pdf_url !== "premium" && !form.pdf_url.startsWith("premium-pdfs/")) {
      toast({ title: "Paid PDF নিরাপদ নয়", description: "Paid PDF-টি Private PDF Storage-এ আবার Upload করুন।", variant: "destructive" });
      return;
    }
    if (!form.is_paid && (form.pdf_url.startsWith("premium-pdfs/") || form.pdf_url === "premium")) {
      toast({ title: "PDF Storage মিলছে না", description: "Paid থেকে Free করতে হলে ফাইলটি সাধারণ PDF Upload দিয়ে আবার দিন।", variant: "destructive" });
      return;
    }
    if (form.is_paid) {
      const insecureChapter = form.chapters.find(
        (c) => c.url && (c.url.startsWith("http://") || c.url.startsWith("https://")) && !c.url.startsWith("premium-pdfs/")
      );
      if (insecureChapter) {
        toast({
          title: "Paid Chapter PDF নিরাপদ নয়",
          description: `"${insecureChapter.title || 'অধ্যায়'}" এর PDF ফাইলটি পাবলিক লিংকে রয়েছে। পেইড পোস্টের জন্য এটি প্রাইভেট স্টোরেজে আপলোড করুন।`,
          variant: "destructive"
        });
        return;
      }
    }
    if (!form.is_paid) {
      const privateChapter = form.chapters.find((c) => c.url && c.url.startsWith("premium-pdfs/"));
      if (privateChapter) {
        toast({
          title: "PDF Storage মিলছে না",
          description: `"${privateChapter.title || 'অধ্যায়'}" এর ফাইলটি প্রাইভেট স্টোরেজে রয়েছে। ফ্রি পোস্টের জন্য এটি সাধারণ PDF আপলোড দিয়ে পুনরায় আপলোড করুন।`,
          variant: "destructive"
        });
        return;
      }
    }
    const payload = { ...form, content: form.content || null, video_url: form.video_url || null, pdf_url: form.pdf_url || null, image_url: form.image_url || null, price: Number(form.price) || 0, discount_price: form.discount_price === "" ? null : Number(form.discount_price) };

    if (editing) {
      const { error } = await supabase.from("posts").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post updated!" });
    } else {
      const { error } = await supabase.from("posts").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Post created!" });
    }
    resetForm();
    fetchPosts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from("posts").delete().eq("id", id);
    toast({ title: "Post deleted" });
    fetchPosts();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image_url" | "pdf_url") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = field === "pdf_url";
    const validType = isPdf ? file.type === "application/pdf" : file.type.startsWith("image/");
    const maxBytes = isPdf ? 20 * 1024 * 1024 : 8 * 1024 * 1024;
    if (!validType || file.size > maxBytes) {
      toast({ title: "ফাইল গ্রহণ করা যায়নি", description: isPdf ? "শুধু PDF ফাইল (সর্বোচ্চ ২০ MB) দিন।" : "শুধু Image ফাইল (সর্বোচ্চ ৮ MB) দিন।", variant: "destructive" });
      e.target.value = "";
      return;
    }

    const bucket = isPdf && form.is_paid ? "premium-pdfs" : "uploads";
    const extension = isPdf ? "pdf" : (file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "img");
    const path = `${isPdf ? "pdfs" : "post-images"}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) { toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }

    if (isPdf && form.is_paid) {
      setForm(f => ({ ...f, pdf_url: `premium-pdfs/${path}` }));
    } else {
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
      setForm(f => ({ ...f, [field]: publicUrl }));
    }
    toast({ title: "File uploaded!" });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">← ব্যাক</Button>
          <h1 className="text-2xl font-bold text-foreground">Posts</h1>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> New Post</Button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing ? "Edit Post" : "New Post"}</h2>
            <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Post title" />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={5} placeholder="Post content..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>YouTube URL</Label>
                <Input value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/..." />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Upload Image</Label>
                <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, "image_url")} />
                {form.image_url && <p className="mt-1 text-xs text-muted-foreground truncate">{form.image_url}</p>}
              </div>
              <div>
                <Label>Upload PDF {form.is_paid ? "(Private Paid Storage)" : "(Public)"}</Label>
                <Input type="file" accept=".pdf" onChange={e => handleFileUpload(e, "pdf_url")} />
                {form.pdf_url && <p className="mt-1 text-xs text-muted-foreground truncate">{form.pdf_url}</p>}
              </div>
            </div>
            <div className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label>অধ্যায়ভিত্তিক PDF তালিকা</Label>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${form.is_paid ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                    {form.is_paid ? "🔒 Private Paid Storage" : "🌐 Public Storage"}
                  </span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => setForm(f => ({ ...f, chapters: [...f.chapters, { title: "", url: "" }] }))}>+ অধ্যায়</Button>
              </div>
              {form.chapters.map((c, i) => (
                <div key={i} className="mb-2 grid gap-2 sm:grid-cols-[1fr_1.2fr_auto_auto] items-center">
                  <Input placeholder={`অধ্যায় ${i + 1} এর নাম`} value={c.title} onChange={e => setForm(f => ({ ...f, chapters: f.chapters.map((x, j) => j === i ? { ...x, title: e.target.value } : x) }))} />
                  <div className="relative">
                    <Input placeholder={form.is_paid ? "premium-pdfs/chapters/..." : "PDF লিংক"} value={c.url} onChange={e => setForm(f => ({ ...f, chapters: f.chapters.map((x, j) => j === i ? { ...x, url: e.target.value } : x) }))} />
                    {c.url && (
                      <span className={`absolute right-2 top-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${c.url.startsWith("premium-pdfs/") ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
                        {c.url.startsWith("premium-pdfs/") ? "Private" : "Public"}
                      </span>
                    )}
                  </div>
                  <Input type="file" accept=".pdf" className="sm:w-36 text-xs" onChange={async e => {
                    const file = e.target.files?.[0]; if (!file) return;
                    if (file.type !== "application/pdf" || file.size > 20 * 1024 * 1024) {
                      toast({ title: "ফাইল গ্রহণ করা যায়নি", description: "শুধু PDF ফাইল (সর্বোচ্চ ২০ MB) দিন।", variant: "destructive" });
                      e.target.value = "";
                      return;
                    }
                    const bucket = form.is_paid ? "premium-pdfs" : "uploads";
                    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                    const path = `${form.is_paid ? "chapters" : "pdfs"}/${editing?.id ? `${editing.id}-${i + 1}-` : ""}${Date.now()}-${safeName}`;
                    const { error } = await supabase.storage.from(bucket).upload(path, file, { contentType: "application/pdf", upsert: false });
                    if (error) { toast({ title: "আপলোড ব্যর্থ", description: error.message, variant: "destructive" }); return; }
                    
                    if (form.is_paid) {
                      const secureRef = `premium-pdfs/${path}`;
                      setForm(f => ({ ...f, chapters: f.chapters.map((x, j) => j === i ? { ...x, url: secureRef } : x) }));
                      toast({ title: "পেইড চ্যাপ্টার PDF প্রাইভেট স্টোরেজে আপলোড হয়েছে!" });
                    } else {
                      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
                      setForm(f => ({ ...f, chapters: f.chapters.map((x, j) => j === i ? { ...x, url: publicUrl } : x) }));
                      toast({ title: "ফ্রি চ্যাপ্টার PDF আপলোড সম্পন্ন!" });
                    }
                  }} />
                  <Button type="button" size="sm" variant="ghost" onClick={() => setForm(f => ({ ...f, chapters: f.chapters.filter((_, j) => j !== i) }))}>✕</Button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v }))} />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.requires_permission} onCheckedChange={v => setForm(f => ({ ...f, requires_permission: v }))} />
                <Label>ডাউনলোডে পারমিশন লাগবে</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_paid} onCheckedChange={v => setForm(f => ({ ...f, is_paid: v }))} />
                <Label>পেইড পিডিএফ</Label>
              </div>
              {form.is_paid && (<>
                <Input type="number" className="w-28" placeholder="মূল্য ৳" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value as any }))} />
                <Input type="number" className="w-28" placeholder="ছাড় মূল্য ৳" value={form.discount_price} onChange={e => setForm(f => ({ ...f, discount_price: e.target.value as any }))} />
              </>)}
            </div>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"} Post</Button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {posts.map(post => (
          <div key={post.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{post.title}</p>
              <p className="text-xs text-muted-foreground">{post.category} • {post.is_published ? "Published" : "Draft"} • {new Date(post.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 ml-3">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(post)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {posts.length === 0 && <p className="text-center text-muted-foreground py-8">No posts yet</p>}
      </div>
    </div>
  );
};

export default AdminPosts;
