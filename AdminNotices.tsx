import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

type Notice = Tables<"notices">;

const AdminNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", is_urgent: false, is_active: true });
  const { toast } = useToast();

  const fetchNotices = async () => {
    const { data } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    setNotices(data || []);
  };

  useEffect(() => { fetchNotices(); }, []);

  const resetForm = () => { setForm({ title: "", content: "", is_urgent: false, is_active: true }); setEditing(null); setShowForm(false); };

  const handleEdit = (n: Notice) => {
    setForm({ title: n.title, content: n.content || "", is_urgent: n.is_urgent, is_active: n.is_active });
    setEditing(n);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast({ title: "Title required", variant: "destructive" }); return; }
    const payload = { ...form, content: form.content || null };
    if (editing) {
      const { error } = await supabase.from("notices").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Notice updated!" });
    } else {
      const { error } = await supabase.from("notices").insert(payload);
      if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Notice created!" });
    }
    resetForm(); fetchNotices();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await supabase.from("notices").delete().eq("id", id);
    toast({ title: "Notice deleted" }); fetchNotices();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">← ব্যাক</Button>
          <h1 className="text-2xl font-bold text-foreground">Notices</h1>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" /> New Notice</Button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editing ? "Edit Notice" : "New Notice"}</h2>
            <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Content</Label><Textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} rows={4} /></div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2"><Switch checked={form.is_urgent} onCheckedChange={v => setForm(f => ({ ...f, is_urgent: v }))} /><Label>Urgent</Label></div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} /><Label>Active</Label></div>
            </div>
            <Button onClick={handleSave}>{editing ? "Update" : "Create"} Notice</Button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {notices.map(n => (
          <div key={n.id} className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">{n.is_urgent && "🔴 "}{n.title}</p>
              <p className="text-xs text-muted-foreground">{n.is_active ? "Active" : "Inactive"} • {new Date(n.created_at).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-2 ml-3">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(n)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(n.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </div>
        ))}
        {notices.length === 0 && <p className="text-center text-muted-foreground py-8">No notices yet</p>}
      </div>
    </div>
  );
};

export default AdminNotices;
