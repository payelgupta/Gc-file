import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

interface MagicalCosmicBookProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
}

export const MagicalCosmicBook: React.FC<MagicalCosmicBookProps> = ({
  size = "lg",
  className = "",
  showWordmark = true,
}) => {
  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Outer Cosmic Aura & Breathing Nebula Glow */}
      <div className="absolute -top-12 h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-gradient-to-tr from-[#6C4AE6]/30 via-[#F5C76A]/35 to-[#48D9F5]/25 blur-3xl animate-[gentleBreathe_5s_ease-in-out_infinite]" />

      {/* Animated Bangla Wordmark "জ্ঞানচর্চা'লয়" DIRECTLY ABOVE THE BOOK */}
      {showWordmark && (
        <motion.div
          initial={{ opacity: 0, y: -15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-1 text-center relative z-20 flex flex-col items-center"
        >
          <div className="relative inline-flex items-center justify-center">
            {/* Ambient Glow behind title */}
            <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/20 via-yellow-400/40 to-emerald-400/20 blur-xl opacity-80" />
            
            <motion.h2 
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                y: [0, -3, 0],
              }}
              transition={{
                backgroundPosition: { duration: 6, repeat: Infinity, ease: "linear" },
                y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
              }}
              style={{
                backgroundSize: "200% auto",
              }}
              className="relative font-bengali text-3xl sm:text-5xl font-black tracking-normal pt-2 pb-1 leading-normal inline-block bg-gradient-to-r from-white via-[#F5C76A] to-amber-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(245,199,106,0.7)] select-none"
            >
              জ্ঞানচর্চা'লয়
            </motion.h2>
          </div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-bengali text-xs sm:text-sm font-bold text-emerald-300 mt-1 tracking-wider drop-shadow-[0_1px_8px_rgba(16,185,129,0.5)] flex items-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#F5C76A] animate-spin" />
            <span>জ্ঞানের আলোয় আলোকিত জীবনের সূচনা</span>
            <Sparkles className="h-3.5 w-3.5 text-[#F5C76A] animate-spin" />
          </motion.p>
        </motion.div>
      )}

      {/* Central Radiating Rays Container */}
      <div className="relative w-48 h-48 sm:w-60 sm:h-60 flex items-center justify-center">
        
        {/* Animated Golden Rays Radiating Outward */}
        <svg
          viewBox="0 0 200 200"
          className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-[0_0_15px_rgba(245,199,106,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="rayGold" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#F5C76A" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#F5C76A" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#48D9F5" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="bookSpineGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F5C76A" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#6C4AE6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Radiating Knowledge Rays */}
          <g className="origin-center animate-[gentleBreathe_4s_ease-in-out_infinite]">
            <line x1="100" y1="100" x2="100" y2="15" stroke="url(#rayGold)" strokeWidth="3" strokeLinecap="round" />
            <line x1="100" y1="100" x2="70" y2="25" stroke="url(#rayGold)" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="100" x2="130" y2="25" stroke="url(#rayGold)" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="100" x2="45" y2="45" stroke="url(#rayGold)" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="100" x2="155" y2="45" stroke="url(#rayGold)" strokeWidth="2" strokeLinecap="round" />
            <line x1="100" y1="100" x2="25" y2="75" stroke="url(#rayGold)" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="100" y1="100" x2="175" y2="75" stroke="url(#rayGold)" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Shimmering Starlight Particles Floating in Sky */}
          <circle cx="65" cy="40" r="2" fill="#F5C76A" className="animate-[floatParticle_4s_ease-in-out_infinite]" />
          <circle cx="135" cy="35" r="2.5" fill="#FFFFFF" className="animate-[floatParticle_5s_ease-in-out_infinite_1s]" />
          <circle cx="45" cy="65" r="1.5" fill="#48D9F5" className="animate-[floatParticle_3.5s_ease-in-out_infinite_0.5s]" />
          <circle cx="155" cy="65" r="2" fill="#F5C76A" className="animate-[floatParticle_4.5s_ease-in-out_infinite_1.5s]" />
          <circle cx="100" cy="20" r="3" fill="#FFFFFF" className="animate-pulse" />
        </svg>

        {/* Illuminated Open Book Illustration */}
        <div className="relative z-10 w-36 h-28 sm:w-44 sm:h-34">
          <svg
            viewBox="0 0 120 90"
            className="w-full h-full drop-shadow-[0_10px_25px_rgba(245,199,106,0.5)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Soft Ambient Light Beam from Book Surface */}
            <ellipse cx="60" cy="52" rx="40" ry="15" fill="url(#bookSpineGlow)" />

            {/* Left Page (Soft Glow Cosmic Glass) */}
            <path
              d="M60 55C48 50 30 50 12 55V76C30 71 48 71 60 76V55Z"
              fill="rgba(11, 16, 38, 0.95)"
              stroke="#F4F6FC"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Left Page Inner Gold Edge */}
            <path
              d="M58 57C47 52 32 52 16 57"
              stroke="#F5C76A"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Left Page Knowledge Text Lines */}
            <line x1="22" y1="62" x2="52" y2="60" stroke="#F5C76A" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <line x1="22" y1="67" x2="50" y2="65" stroke="#F5C76A" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

            {/* Right Page (Soft Glow Cosmic Glass) */}
            <path
              d="M60 55C72 50 90 50 108 55V76C90 71 72 71 60 76V55Z"
              fill="rgba(11, 16, 38, 0.95)"
              stroke="#F4F6FC"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Right Page Inner Cyan Edge */}
            <path
              d="M62 57C73 52 88 52 104 57"
              stroke="#48D9F5"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.9"
            />
            {/* Right Page Knowledge Text Lines */}
            <line x1="68" y1="60" x2="98" y2="62" stroke="#48D9F5" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
            <line x1="70" y1="65" x2="98" y2="67" stroke="#48D9F5" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

            {/* Golden Ribbon Bookmark */}
            <path
              d="M60 53V78L63 75L66 78V53"
              fill="#F5C76A"
              opacity="0.95"
            />

            {/* Radiant Spine Beam */}
            <circle cx="60" cy="54" r="4" fill="#FFFFFF" className="animate-pulse" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MagicalCosmicBook;
