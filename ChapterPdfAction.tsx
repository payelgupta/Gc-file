import { useState } from "react";
import { Lock, Loader2, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface Props {
  postId: string;
  postTitle?: string;
  isPaid?: boolean;
  chapter: {
    title: string;
    url: string;
  };
  chapterIndex: number;
}

export const ChapterPdfAction = ({
  postId,
  postTitle = "অধ্যায়",
  isPaid = false,
  chapter,
  chapterIndex,
}: Props) => {
  const { user } = useAuth() as any;
  const [loading, setLoading] = useState(false);

  if (!chapter?.url) return null;

  const isPrivate = isPaid || chapter.url.startsWith("premium-pdfs/");

  // Free chapter PDF: Direct public link
  if (!isPrivate) {
    return (
      <a
        href={chapter.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 rounded-lg bg-[#16A878] px-2.5 py-1 text-white hover:opacity-90 text-[11px] sm:text-xs font-semibold transition"
      >
        <FileText className="h-3 w-3" />
        PDF পড়ুন
      </a>
    );
  }

  // Paid private chapter PDF: Secure signed URL generation
  const handleAccessPaidPdf = async () => {
    if (!user) {
      toast({
        title: "লগইন আবশ্যক",
        description: `"${chapter.title || postTitle}" এর প্রিমিয়াম PDF পড়তে প্রথমে লগইন করুন।`,
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke("get-premium-pdf", {
        body: {
          post_id: postId,
          chapter_index: chapterIndex,
        },
      });

      if (error || !data?.signedUrl) {
        const errorMsg =
          data?.error ||
          error?.message ||
          "এই অধ্যায়ের প্রিমিয়াম PDF টি পেতে কোর্সটি আনলক করুন।";
        toast({
          title: "প্রিমিয়াম অধ্যায়",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      // Secure signed URL retrieved (valid for 300 seconds)
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      toast({
        title: "ত্রুটি",
        description: err?.message || "নিরাপদ PDF লিংক তৈরি করা যায়নি। পরে আবার চেষ্টা করুন।",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAccessPaidPdf}
      disabled={loading}
      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#F5C76A] to-[#e5b758] px-2.5 py-1 text-slate-950 font-bold text-[11px] sm:text-xs shadow-sm hover:brightness-105 active:scale-95 transition cursor-pointer disabled:opacity-60"
      title={isPrivate ? "প্রিমিয়াম পেইড অধ্যায় (অনুমোদিত শিক্ষার্থীর জন্য)" : "PDF পড়ুন"}
    >
      {loading ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>যাচাই হচ্ছে...</span>
        </>
      ) : (
        <>
          <Lock className="h-3 w-3" />
          <span>PDF পড়ুন</span>
        </>
      )}
    </button>
  );
};

export default ChapterPdfAction;
