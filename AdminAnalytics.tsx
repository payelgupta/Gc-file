import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Users, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminAnalytics = () => {
  const [dailyData, setDailyData] = useState<{ date: string; visits: number }[]>([]);
  const [totalToday, setTotalToday] = useState(0);
  const [totalWeek, setTotalWeek] = useState(0);
  const [totalMonth, setTotalMonth] = useState(0);
  const [showOnFooter, setShowOnFooter] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
    fetchToggle();
  }, []);

  const fetchToggle = async () => {
    const { data } = await supabase.from("site_settings").select("value").eq("key", "show_analytics_footer").maybeSingle();
    if (data) setShowOnFooter(data.value === "true");
  };

  const fetchAnalytics = async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getTime() - 7 * 86400000).toISOString();
    const monthStart = new Date(now.getTime() - 30 * 86400000).toISOString();

    const [{ count: today }, { count: week }, { count: month }, { data: raw }] = await Promise.all([
      supabase.from("visitor_analytics").select("*", { count: "exact", head: true }).gte("visited_at", todayStart),
      supabase.from("visitor_analytics").select("*", { count: "exact", head: true }).gte("visited_at", weekStart),
      supabase.from("visitor_analytics").select("*", { count: "exact", head: true }).gte("visited_at", monthStart),
      supabase.from("visitor_analytics").select("visited_at").gte("visited_at", monthStart).order("visited_at", { ascending: true }),
    ]);

    setTotalToday(today || 0);
    setTotalWeek(week || 0);
    setTotalMonth(month || 0);

    // Group by date for chart
    const grouped: Record<string, number> = {};
    raw?.forEach(r => {
      const d = new Date(r.visited_at).toLocaleDateString("bn-BD", { day: "numeric", month: "short" });
      grouped[d] = (grouped[d] || 0) + 1;
    });
    setDailyData(Object.entries(grouped).map(([date, visits]) => ({ date, visits })));
  };

  const toggleFooter = async (val: boolean) => {
    setShowOnFooter(val);
    await supabase.from("site_settings").upsert({ key: "show_analytics_footer", value: val ? "true" : "false" }, { onConflict: "key" });
    toast({ title: val ? "ফুটারে ভিজিটর স্ট্যাটস দেখানো হবে" : "ফুটার থেকে লুকানো হবে" });
  };

  const stats = [
    { label: "আজকের ভিজিটর", value: totalToday, icon: Users, color: "text-primary" },
    { label: "সাপ্তাহিক ভিজিটর", value: totalWeek, icon: TrendingUp, color: "text-gold" },
    { label: "মাসিক ভিজিটর", value: totalMonth, icon: Calendar, color: "text-primary" },
  ];

  return (
    <div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">← ব্যাক</Button>
        <BarChart3 className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Visitor Analytics</h1>
          <p className="text-sm text-muted-foreground">ভিজিটর পরিসংখ্যান দেখুন</p>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-lg border border-border bg-card p-4">
        <Switch checked={showOnFooter} onCheckedChange={toggleFooter} />
        <Label>হোম পেজের ফুটারে ভিজিটর কাউন্ট দেখান</Label>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">গত ৩০ দিনের ভিজিটর</h2>
        {dailyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="visits" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground py-8">এখনো কোনো ডেটা নেই</p>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
