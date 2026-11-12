import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", ["contact_email", "contact_phone"]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { if (s.value) map[s.key] = s.value; });
        setSettings(map);
      }
    };
    fetch();
  }, []);

  const contactItems = [
    { icon: <Mail className="h-5 w-5" />, label: "Email", value: settings.contact_email || "sujoyctg75@gmail.com" },
    ...(settings.contact_phone ? [{ icon: <Phone className="h-5 w-5" />, label: "Phone", value: settings.contact_phone }] : []),
    { icon: <MapPin className="h-5 w-5" />, label: "Location", value: "Bangladesh" },
  ];

  return (
    <div className="min-h-screen py-10 sm:py-16">
      <div className="container max-w-4xl px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Contact Us</h1>
          <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2">Get in touch with Sujoy Sir</p>
        </motion.div>

        <div className="mt-8 grid gap-6 sm:mt-10 md:grid-cols-2 md:gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-3 sm:space-y-4">
            {contactItems.map((item) => (
              <div key={item.label} className="card-elevated flex items-center gap-3 rounded-xl bg-card p-3.5 sm:gap-4 sm:p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-10 sm:w-10">{item.icon}</div>
                <div>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">{item.label}</p>
                  <p className="text-xs font-medium text-card-foreground sm:text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="card-elevated space-y-3 rounded-xl bg-card p-4 sm:space-y-4 sm:p-6"
          >
            <input placeholder="Your Name" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2 sm:px-4 sm:py-2.5" required />
            <input placeholder="Your Email" type="email" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2 sm:px-4 sm:py-2.5" required />
            <textarea placeholder="Your Message" rows={4} className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2 sm:px-4 sm:py-2.5" required />
            <Button type="submit" className="w-full">
              <Send className="h-4 w-4" /> {sent ? "Message Sent!" : "Send Message"}
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
