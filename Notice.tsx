import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, ArrowLeft, Calendar, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Notice = Tables<"notices">;

const Notice = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      setNotices(data || []);
      setLoading(false);
    };
    fetchNotices();
  }, []);

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="container max-w-3xl px-4 sm:px-6">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 gap-1.5">
          <ArrowLeft className="h-4 w-4" /> ব্যাক
        </Button>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Notice Board</h1>
        <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">Stay updated with the latest announcements</p>

        <div className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
          {loading ? (
            <p className="text-center text-sm text-muted-foreground">Loading...</p>
          ) : notices.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">কোনো নোটিশ নেই</p>
          ) : (
            notices.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`card-elevated rounded-xl bg-card p-4 sm:p-5 ${
                  n.is_urgent ? "border-l-4 border-destructive" : ""
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <Bell
                    className={`mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5 ${
                      n.is_urgent ? "text-destructive" : "text-muted-foreground"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className={`text-sm font-medium sm:text-base ${n.is_urgent ? "text-destructive" : "text-card-foreground"}`}>
                      {n.is_urgent && <span className="mr-1.5 text-xs font-bold">🔴 জরুরি:</span>}
                      {n.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(n.created_at), "dd MMM yyyy, hh:mm a")}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => setSelected(n)}>
                    <Eye className="h-3 w-3" /> Details
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Notice Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-bengali text-base sm:text-lg">
              {selected?.is_urgent && <span className="mr-1.5 text-destructive">🔴</span>}
              {selected?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="text-xs text-muted-foreground">
            <Calendar className="mr-1 inline h-3 w-3" />
            {selected && format(new Date(selected.created_at), "dd MMM yyyy, hh:mm a")}
          </div>
          <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {selected?.content || "No additional details available."}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Notice;
