import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, RefreshCw } from "lucide-react";

interface LoginRecord {
  id: string;
  email: string;
  logged_in_at: string;
  user_agent: string | null;
}

const AdminLoginActivity = () => {
  const [records, setRecords] = useState<LoginRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_login_activity")
      .select("*")
      .order("logged_in_at", { ascending: false })
      .limit(100);
    if (data) setRecords(data);
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  return (
    <div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="gap-1.5">← ব্যাক</Button>
        <UserCheck className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Login Activity</h1>
          <p className="text-sm text-muted-foreground">কোন ইউজার কখন লগইন করেছে</p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto" onClick={fetchRecords}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> রিফ্রেশ
        </Button>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ইমেইল</TableHead>
              <TableHead>লগইন সময়</TableHead>
              <TableHead className="hidden sm:table-cell">ব্রাউজার</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">কোনো রেকর্ড নেই</TableCell></TableRow>
            ) : records.map(r => (
              <TableRow key={r.id}>
                <TableCell className="font-medium text-foreground">{r.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(r.logged_in_at).toLocaleString("bn-BD")}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                  {r.user_agent || "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminLoginActivity;
