import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface CosmicBrandLogoProps {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  className?: string;
  type?: "header" | "footer";
  logoUrl?: string;
}

export const CosmicBrandLogo: React.FC<CosmicBrandLogoProps> = ({
  size = "md",
  showSubtitle = true,
  className = "",
  type = "header",
  logoUrl,
}) => {
  const { headerLogo, footerLogo } = useSiteSettings();
  const [imgError, setImgError] = useState(false);

  // Determine active logo source: explicitly passed prop, or type-specific from settings
  const activeLogo = logoUrl || (type === "footer" ? footerLogo : headerLogo);

  // Generous standalone container dimensions so logo is ultra-distinct, prominent and clear
  const logoDimensions = {
    sm: "h-11 w-11 sm:h-12 sm:w-12",
    md: "h-14 w-14 sm:h-16 sm:w-16 md:h-[4.25rem] md:w-[4.25rem]",
    lg: "h-18 w-18 sm:h-22 sm:w-22 md:h-24 md:w-24",
  };

  const textSizes = {
    sm: "text-base sm:text-lg",
    md: "text-xl sm:text-2xl md:text-[1.65rem]",
    lg: "text-2xl sm:text-3xl md:text-4xl",
  };

  return (
    <Link to="/" className={`group flex items-center gap-2.5 sm:gap-3.5 select-none ${className}`}>
      {/* Pure Borderless Floating Brand Logo with Multi-Colored Cosmic Glowing Aura */}
      <div className={`relative flex items-center justify-center shrink-0 ${logoDimensions[size]}`}>
        {activeLogo && !imgError ? (
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Pure Multi-Colored Glowing Aura directly around Logo Contours — Exactly like Floating AI Icon */}
            <img
              src={activeLogo}
              alt="জ্ঞানচর্চা'লয় লোগো"
              onError={() => setImgError(true)}
              className="w-full h-full object-contain pointer-events-none select-none transition-all duration-300 group-hover:scale-108 group-hover:brightness-110"
              style={{
                filter:
                  "drop-shadow(0 0 8px rgba(245, 199, 106, 0.85)) drop-shadow(0 0 16px rgba(72, 217, 245, 0.65)) drop-shadow(0 0 26px rgba(168, 85, 247, 0.45)) drop-shadow(0 0 36px rgba(16, 185, 129, 0.35))",
              }}
            />
          </div>
        ) : (
          /* Vector Illuminated Open Book SVG as graceful fallback if image fails */
          <div className="relative w-full h-full flex items-center justify-center">
            <svg
              viewBox="0 0 48 48"
              className="w-full h-full text-[#F5C76A] drop-shadow-[0_0_12px_rgba(245,199,106,0.85)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M24 16L24 6M17 19L11 13M31 19L37 13"
                stroke="#F5C76A"
                strokeWidth="1.5"
                strokeLinecap="round"
                className="opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <circle cx="14" cy="9" r="1.5" fill="#48D9F5" />
              <circle cx="34" cy="9" r="1.5" fill="#F5C76A" />
              <circle cx="24" cy="4" r="1.5" fill="#FFFFFF" />
              <path
                d="M24 38V22"
                stroke="#F5C76A"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M24 23C20 20.5 13 20 8 22V36C13 34 20 34.5 24 37"
                stroke="#F4F6FC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(108, 74, 230, 0.25)"
              />
              <path
                d="M24 23C28 20.5 35 20 40 22V36C35 34 28 34.5 24 37"
                stroke="#F4F6FC"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="rgba(72, 217, 245, 0.2)"
              />
              <path
                d="M24 22V34L26 32L28 34V22"
                fill="#F5C76A"
                opacity="0.9"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Typography: Beautiful Bangla Wordmark "জ্ঞানচর্চা'লয়" */}
      <div className="flex flex-col justify-center">
        <span
          className={`font-bengali font-black tracking-normal leading-snug inline-block pt-1 pb-0.5 text-amber-300 drop-shadow-[0_2px_12px_rgba(245,199,106,0.8)] group-hover:text-yellow-200 transition-colors duration-300 ${textSizes[size]}`}
          style={{
            textShadow: "0 0 16px rgba(245, 199, 106, 0.65), 0 2px 4px rgba(0, 0, 0, 0.8)",
          }}
        >
          জ্ঞানচর্চা'লয়
        </span>
        {showSubtitle && (
          <span className="font-bengali text-xs sm:text-[13px] text-emerald-300 font-bold tracking-wide mt-0.5 hidden xs:block drop-shadow-sm">
            ডিজিটাল লার্নিং প্ল্যাটফর্ম
          </span>
        )}
      </div>
    </Link>
  );
};

export default CosmicBrandLogo;
