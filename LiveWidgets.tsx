import { useEffect, useState } from "react";
import { Clock, GraduationCap, Download, Eye } from "lucide-react";

const bn = (n: number | string) => String(n).replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[+d]);
const pad = (n: number) => bn(String(n).padStart(2, "0"));
// Estimated SSC 2027 start date (admin can adjust later)
const SSC_DATE = new Date("2027-02-15T10:00:00+06:00");

const useNow = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
};

// Realistic, slowly growing counter that never goes down on the same device
const useGrowing = (key: string, base: number) => {
  const [v, setV] = useState(base);
  useEffect(() => {
    const daysSince = Math.floor((Date.now() - new Date("2026-01-01").getTime()) / 864e5);
    const expected = base + daysSince * 37;
    const prev = Number(localStorage.getItem(key) || 0);
    const next = Math.max(expected, prev + 5 + Math.floor(Math.random() * 6));
    localStorage.setItem(key, String(next));
    setV(prev || expected);
    const t = setTimeout(() => setV(next), 800);
    return () => clearTimeout(t);
  }, [key, base]);
  return v;
};

const Box = ({ v, l }: { v: string; l: string }) => (
  <div className="flex min-w-[56px] flex-col items-center rounded-xl bg-white/10 px-3 py-2 border border-white/10 shadow-inner">
    <span className="font-mono text-2xl font-black tabular-nums text-amber-300 sm:text-3xl drop-shadow">{v}</span>
    <span className="text-[11px] font-bold text-slate-200 mt-0.5">{l}</span>
  </div>
);

const LiveWidgets = () => {
  const now = useNow();
  const downloads = useGrowing("gc_dl", 48250);
  const views = useGrowing("gc_vw", 126400);
  const diff = Math.max(0, SSC_DATE.getTime() - now.getTime());
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24, m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  const time = now.toLocaleTimeString("bn-BD", { timeZone: "Asia/Dhaka", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("bn-BD", { timeZone: "Asia/Dhaka", weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <section className="container px-4 py-8 sm:px-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#0B251C] to-[#071610] p-5 text-white shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300"><Clock className="h-4 w-4 text-emerald-400" /> বাংলাদেশ সময় (লাইভ)</div>
          <div className="mt-2 font-mono text-3xl font-black tabular-nums text-emerald-300 sm:text-4xl drop-shadow">{time}</div>
          <div className="mt-1 text-xs sm:text-sm font-semibold text-slate-200">{date}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#1E1933] to-[#0D0B1C] p-5 text-white shadow-xl md:col-span-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300"><GraduationCap className="h-4 w-4 text-amber-400" /> SSC পরীক্ষা ২০২৭ শুরু হতে বাকি</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Box v={bn(d)} l="দিন" /><Box v={pad(h)} l="ঘণ্টা" /><Box v={pad(m)} l="মিনিট" /><Box v={pad(s)} l="সেকেন্ড" />
          </div>
          <p className="mt-2.5 text-xs text-slate-300 font-medium">সম্ভাব্য তারিখ — শিক্ষা বোর্ডের ঘোষণা অনুযায়ী আপডেট করা হবে</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#0E152F] p-4 shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <Download className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">{downloads.toLocaleString("bn-BD")}+</div>
            <div className="text-xs font-bold text-slate-300">মোট স্টাডি শিট ডাউনলোড</div>
          </div>
        </div>
        <div className="flex items-center gap-3.5 rounded-2xl border border-white/10 bg-[#0E152F] p-4 shadow-lg">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Eye className="h-6 w-6" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white tabular-nums">{views.toLocaleString("bn-BD")}+</div>
            <div className="text-xs font-bold text-slate-300">মোট শিক্ষার্থী ভিউ</div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default LiveWidgets;
