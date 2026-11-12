import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  Facebook, 
  Youtube, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Award, 
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CosmicBrandLogo from "@/components/brand/CosmicBrandLogo";
import MagicalCosmicBook from "@/components/brand/MagicalCosmicBook";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const Footer = () => {
  const { settings: siteSettings, footerLogo } = useSiteSettings();
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("key, value")
        .in("key", [
          "contact_email", "contact_phone", "social_facebook", "social_youtube",
          "footer_developer", "site_name", "footer_logo", "website_certificate_url"
        ]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { if (s.value) map[s.key] = s.value; });
        setSettings(map);
      }
    };
    fetch();
  }, []);

  const email = siteSettings.contact_email || settings.contact_email || "gayanchorchaloi@gmail.com";
  const phone = siteSettings.contact_phone || settings.contact_phone || "01537515618";
  const fbUrl = siteSettings.social_facebook || settings.social_facebook || "https://www.facebook.com/profile.php?id=61583000912256";
  const ytUrl = siteSettings.social_youtube || settings.social_youtube || "https://youtube.com/@gayanchorchaloi?si=F7X__yezhnlIkbAa";
  const developer = siteSettings.footer_developer || settings.footer_developer || "Developed by Sujoy Chowdhury";
  const certificateImg = siteSettings.website_certificate_url || settings.website_certificate_url || null;

  return (
    <footer className="relative bg-[#080A12] text-white border-t border-white/10 overflow-hidden font-bengali">
      {/* Ambient Cosmic Nebula Glows in Background */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-[#6C4AE6]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-96 w-96 rounded-full bg-[#48D9F5]/10 blur-3xl" />

      {/* Brand Closing Section (Top Experience) */}
      <div className="border-b border-white/10 py-10 sm:py-14 bg-gradient-to-b from-[#0B1026]/90 to-transparent">
        <div className="container px-4 sm:px-6 text-center max-w-4xl mx-auto">
          <div className="mb-4 flex justify-center">
            <MagicalCosmicBook size="sm" showWordmark={true} />
          </div>

          <p className="mt-4 text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-2xl mx-auto">
            জ্ঞানচর্চা'লয় — প্রথম শ্রেণি থেকে মাস্টার্স পর্যন্ত প্রতিটি শিক্ষার্থীর জন্য নির্ভরযোগ্য, সহজলভ্য ও মানসম্মত ডিজিটাল শিক্ষা প্ল্যাটফর্ম।
          </p>
        </div>
      </div>

      {/* Main 3-Column Footer Layout */}
      <div className="container px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Section A: Brand Logo & Links */}
          <div className="space-y-4">
            <CosmicBrandLogo size="md" showSubtitle={true} type="footer" />
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">
              বাংলাদেশের শিক্ষার্থীদের জন্য আধুনিক ও ফলপ্রসূ শিক্ষামূলক কনটেন্ট, বুলেট সাজেশন ও প্রিমিয়াম হ্যান্ডনোট।
            </p>

            <div className="pt-2">
              <h4 className="text-sm font-bold text-[#F5C76A] mb-3">
                Links
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-xs text-foreground/80 font-sans">
                <li>
                  <Link to="/" className="hover:text-[#F5C76A] transition-colors py-1 block">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#F5C76A] transition-colors py-1 block">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-[#F5C76A] transition-colors py-1 block">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/results" className="hover:text-[#F5C76A] transition-colors py-1 block">
                    Board Result
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-[#F5C76A] transition-colors py-1 block">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="hover:text-[#F5C76A] transition-colors py-1 block">
                    Privacy Policy
                  </Link>
                </li>
                <li className="col-span-2">
                  <Link to="/refund" className="hover:text-[#F5C76A] transition-colors py-1 block">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Section B: Company Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F5C76A]">
              Company Details
            </h4>

            <div className="card-cosmic rounded-2xl p-4 border border-white/10 space-y-2.5 text-xs text-foreground/85">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Name:</span>
                  <span className="font-bold text-white text-sm">জ্ঞানচর্চা'লয়</span>
                </div>
                {footerLogo && (
                  <div className="relative h-14 w-14 sm:h-16 sm:w-16 md:h-[4.25rem] md:w-[4.25rem] shrink-0 flex items-center justify-center">
                    <img
                      src={footerLogo}
                      alt="ফুটার লোগো"
                      className="h-full w-full object-contain select-none transition-all duration-300 hover:scale-110 hover:brightness-110"
                      style={{
                        filter:
                          "drop-shadow(0 0 10px rgba(245, 199, 106, 0.95)) drop-shadow(0 0 18px rgba(72, 217, 245, 0.75)) drop-shadow(0 0 28px rgba(168, 85, 247, 0.55))",
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Instructor & Founder:</span>
                <span className="font-semibold text-[#F5C76A]">সুজয় চৌধুরী (Sujoy Chowdhury)</span>
                <span className="text-muted-foreground block text-[10px]">MBA in Accounting · Senior Teacher</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Services:</span>
                <span>Class 1–5 to Master's / MBA Educational Video Lessons, Examination Bullet Suggestions & Handnotes</span>
              </div>
            </div>

            {/* Verified Educational Certificate Badge Box */}
            <div className="rounded-2xl border border-[#F5C76A]/30 bg-gradient-to-r from-[#6C4AE6]/15 via-[#F5C76A]/10 to-[#16A878]/15 p-3.5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F5C76A]/20 text-[#F5C76A] border border-[#F5C76A]/40 shadow-inner">
                  <Award className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-white">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#16A878]" /> 
                    <span>Verified Educational Platform</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 font-bengali">
                    জ্ঞানচর্চা'লয় ডিজিটাল শিক্ষায় মানসম্মত পাঠদান প্রক্রিয়ায় বিশ্বস্ত।
                  </p>
                </div>
              </div>

              {certificateImg && (
                <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                  <img src={certificateImg} alt="Website Certificate" className="w-full h-auto object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Section C: Contact */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-[#F5C76A]">
              Contact
            </h4>

            <div className="space-y-2.5">
              {/* Clickable Phone Number */}
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="group flex items-center gap-3 rounded-xl p-3 border border-white/10 bg-white/5 hover:bg-[#16A878]/15 hover:border-[#16A878]/50 transition-all duration-300"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#16A878]/20 text-[#16A878] group-hover:scale-110 transition-transform">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-muted-foreground">Phone:</span>
                  <span className="font-mono text-sm font-bold text-white tracking-wide group-hover:text-[#F5C76A]">
                    {phone}
                  </span>
                </div>
              </a>

              {/* Clickable Email Address */}
              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 rounded-xl p-3 border border-white/10 bg-white/5 hover:bg-[#6C4AE6]/20 hover:border-[#6C4AE6]/50 transition-all duration-300"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6C4AE6]/20 text-[#48D9F5] group-hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] text-muted-foreground">Email:</span>
                  <span className="font-mono text-xs font-semibold text-white truncate block group-hover:text-[#F5C76A]">
                    {email}
                  </span>
                </div>
              </a>
            </div>

            {/* Social Media Links */}
            <div className="pt-2">
              <span className="block text-xs text-muted-foreground mb-2">Social Links:</span>
              <div className="flex items-center gap-2.5">
                <a
                  href={fbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#1877F2]/20 border border-[#1877F2]/40 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1877F2] transition-colors"
                >
                  <Facebook className="h-4 w-4" /> Facebook
                </a>
                <a
                  href={ytUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#FF0000]/20 border border-[#FF0000]/40 px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#FF0000] transition-colors"
                >
                  <Youtube className="h-4 w-4" /> YouTube
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground text-center sm:text-left">
          <p>© {new Date().getFullYear()} জ্ঞানচর্চা'লয়. All rights reserved.</p>
          <p className="font-medium text-white/90">
            {developer}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
