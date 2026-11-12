import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Award, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const exams = ["SSC/দাখিল/সমমান", "HSC/আলিম/সমমান", "JSC/JDC"];
const boards = ["ঢাকা", "চট্টগ্রাম", "রাজশাহী", "কুমিল্লা", "যশোর", "বরিশাল", "সিলেট", "দিনাজপুর", "ময়মনসিংহ", "মাদ্রাসা", "কারিগরি"];
const years = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() - i));

const Results = () => {
  const navigate = useNavigate();
  const [f, setF] = useState({ exam: exams[0], board: boards[0], year: years[0], roll: "", reg: "" });
  const sel = "mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm";

  return (
    <div className="container max-w-2xl px-4 py-8 sm:py-12">
      <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">← ব্যাক</Button>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated rounded-2xl bg-card p-6 sm:p-8">
        <div className="mb-6 text-center">
          <Award className="mx-auto h-12 w-12 text-accent" />
          <h1 className="mt-2 font-bengali text-2xl font-bold">অনলাইন রেজাল্ট পোর্টাল</h1>
          <p className="text-sm text-muted-foreground">SSC, HSC, দাখিল, আলিম — সব পরীক্ষার ফলাফল</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>পরীক্ষা</Label><select className={sel} value={f.exam} onChange={e => setF({ ...f, exam: e.target.value })}>{exams.map(x => <option key={x}>{x}</option>)}</select></div>
          <div><Label>সাল</Label><select className={sel} value={f.year} onChange={e => setF({ ...f, year: e.target.value })}>{years.map(x => <option key={x}>{x}</option>)}</select></div>
          <div><Label>বোর্ড</Label><select className={sel} value={f.board} onChange={e => setF({ ...f, board: e.target.value })}>{boards.map(x => <option key={x}>{x}</option>)}</select></div>
          <div><Label>রোল</Label><Input inputMode="numeric" value={f.roll} onChange={e => setF({ ...f, roll: e.target.value })} /></div>
          <div className="sm:col-span-2"><Label>রেজিস্ট্রেশন</Label><Input inputMode="numeric" value={f.reg} onChange={e => setF({ ...f, reg: e.target.value })} /></div>
        </div>
        <Button className="mt-6 w-full" asChild>
          <a href="http://www.educationboardresults.gov.bd/" target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /> রেজাল্ট দেখুন</a>
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">ফলাফল শিক্ষা বোর্ডের অফিসিয়াল সার্ভার থেকে দেখানো হয়।</p>
      </motion.div>
    </div>
  );
};
export default Results;
