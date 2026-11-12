import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type Notice = Tables<"notices">;

const NewsTicker = () => {
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (data) setNotices(data);
    };
    fetch();
  }, []);

  if (notices.length === 0) return null;

  return (
    <div className="border-y border-white/10 bg-[#0B1026]/90 backdrop-blur-md">
      <div className="container px-4 sm:px-6">
        <div className="flex items-center">
          <div className="z-10 flex shrink-0 items-center gap-2 bg-[#16A878] px-3.5 py-2.5 text-white font-bengali sm:px-4">
            <AlertCircle className="h-3.5 w-3.5 animate-pulse sm:h-4 sm:w-4 text-[#F5C76A]" />
            <span className="text-xs font-bold sm:text-sm">জরুরি নোটিশ</span>
          </div>
          <div className="flex-1 overflow-hidden py-2.5">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: Math.max(notices.length * 3.5, 6),
                  ease: "linear",
                },
              }}
            >
              {[...notices, ...notices].map((notice, index) => (
                <Link
                  key={`${notice.id}-${index}`}
                  to="/notice"
                  className="mx-6 inline-flex items-center gap-2 hover:underline sm:mx-8"
                >
                  {notice.is_urgent && (
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-destructive" />
                  )}
                  <span
                    className={`text-xs font-medium sm:text-sm ${
                      notice.is_urgent ? "text-destructive" : "text-foreground"
                    }`}
                  >
                    {notice.title}
                  </span>
                  <span className="text-muted-foreground">•</span>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;
