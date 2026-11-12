import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface ClassCategoryCardProps {
  name: string;
  icon: string;
  desc: string;
  index: number;
}

// Unique click animation per category
const clickAnimations: Record<string, { animate: object; transition: object }> = {
  "Class 1–5": {
    // Books tumbling down like falling from shelf
    animate: { y: [0, -35, 8, -4, 0], rotate: [0, -12, 8, -3, 0], scale: [1, 1.15, 0.95, 1.05, 1] },
    transition: { duration: 0.8, ease: "easeOut" },
  },
  "Class 6–8": {
    // Pages flipping open like a book
    animate: { rotateY: [0, -90, -180, -270, -360], scale: [1, 1.2, 1.1, 1.25, 1] },
    transition: { duration: 0.9, ease: [0.25, 0.1, 0.25, 1] },
  },
  "SSC": {
    // Graduation cap toss celebration
    animate: {
      y: [0, -50, -60, -45, -10, 0],
      rotate: [0, 20, 45, 20, -5, 0],
      scale: [1, 1.2, 1.4, 1.3, 1.1, 1],
    },
    transition: { duration: 1, ease: "easeOut" },
  },
  "HSC": {
    // Trophy winning celebration — bounce & shine
    animate: {
      scale: [1, 1.35, 0.9, 1.2, 0.95, 1.1, 1],
      rotate: [0, -15, 15, -10, 8, -3, 0],
      y: [0, -20, 5, -10, 2, 0],
    },
    transition: { duration: 1, ease: "easeInOut" },
  },
  "Honours": {
    // Book opening wide with depth
    animate: {
      scaleX: [1, 1.5, 0.85, 1.2, 1],
      scaleY: [1, 0.85, 1.15, 0.95, 1],
      rotate: [0, 3, -3, 1, 0],
    },
    transition: { duration: 0.8, ease: "easeOut" },
  },
  "MA": {
    // Target lock — zoom in spin
    animate: {
      scale: [1, 0.7, 1.3, 0.9, 1.15, 1],
      rotate: [0, -30, 180, 300, 360],
      y: [0, 5, -15, 5, 0],
    },
    transition: { duration: 1.1, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// Particle configs — unique burst per category
const particleConfigs: Record<string, { emojis: string[]; count: number }> = {
  "Class 1–5": { emojis: ["📕", "📗", "📙", "✏️", "🖍️"], count: 6 },
  "Class 6–8": { emojis: ["📄", "📝", "🔖", "📑", "✍️"], count: 7 },
  "SSC": { emojis: ["⭐", "🌟", "✨", "💫", "🎓"], count: 6 },
  "HSC": { emojis: ["🏅", "🥇", "🏆", "🎉", "🎊"], count: 6 },
  "Honours": { emojis: ["📖", "📘", "🎒", "💡", "🔬"], count: 5 },
  "MA": { emojis: ["🎯", "🏹", "🥇", "📜", "🎓"], count: 5 },
};

// Unique idle/hover animation per category
const hoverAnimations: Record<string, { scale: number; y: number; rotate?: number; rotateY?: number; rotateX?: number }> = {
  "Class 1–5": { scale: 1.08, y: -6, rotate: -2 },
  "Class 6–8": { scale: 1.06, y: -5, rotateY: 10 },
  "SSC": { scale: 1.1, y: -8 },
  "HSC": { scale: 1.08, y: -6, rotate: 3 },
  "Honours": { scale: 1.07, y: -5, rotateX: 5 },
  "MA": { scale: 1.09, y: -7, rotate: -3 },
};

const ClassCategoryCard = ({ name, icon, desc, index }: ClassCategoryCardProps) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const navigate = useNavigate();

  const anim = clickAnimations[name] || clickAnimations["Class 1–5"];
  const particles = particleConfigs[name] || { emojis: ["✨"], count: 4 };
  const hoverAnim = hoverAnimations[name] || { scale: 1.05, y: -4 };

  const handleClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setShowParticles(true);

    // Navigate after animation burst
    setTimeout(() => {
      setIsAnimating(false);
      setShowParticles(false);
      const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[–]/g, "-");
      try {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } catch {
        window.scrollTo(0, 0);
      }
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      navigate(`/category/${slug}`);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.07, duration: 0.5 }}
      whileHover={hoverAnim}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className="group relative cursor-pointer overflow-visible rounded-2xl border border-white/20 bg-gradient-to-b from-[#18223C] to-[#0D1326] p-4 sm:p-5 text-center transition-all duration-300 hover:border-amber-400/80 hover:shadow-[0_0_25px_rgba(245,199,106,0.35)] shadow-xl"
      style={{ perspective: 1000 }}
    >
      {/* Particle Burst */}
      <AnimatePresence>
        {showParticles &&
          Array.from({ length: particles.count }).map((_, i) => {
            const angle = (360 / particles.count) * i + Math.random() * 20;
            const rad = (angle * Math.PI) / 180;
            const distance = 45 + Math.random() * 25;
            const emoji = particles.emojis[i % particles.emojis.length];
            return (
              <motion.span
                key={`p-${i}`}
                initial={{ opacity: 1, x: 0, y: 0, scale: 0.3, rotate: 0 }}
                animate={{
                  opacity: [1, 1, 0],
                  x: Math.cos(rad) * distance,
                  y: Math.sin(rad) * distance - 15,
                  scale: [0.3, 1.2, 0.2],
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.04 }}
                className="pointer-events-none absolute left-1/2 top-1/3 z-20 text-xs sm:text-sm"
                style={{ marginLeft: "-6px" }}
              >
                {emoji}
              </motion.span>
            );
          })}
      </AnimatePresence>

      {/* Ripple ring effect on click */}
      <AnimatePresence>
        {isAnimating && (
          <motion.div
            initial={{ scale: 0.3, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="pointer-events-none absolute inset-0 z-10 rounded-2xl border-2 border-amber-400"
          />
        )}
      </AnimatePresence>

      {/* Icon with unique animation and glowing backdrop */}
      <div className="flex justify-center mb-1">
        <motion.span
          className="relative z-10 inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 border border-white/20 text-2xl sm:text-3xl shadow-inner group-hover:scale-110 transition-transform"
          animate={isAnimating ? (anim.animate as any) : {}}
          transition={isAnimating ? anim.transition : {}}
          style={{ transformStyle: "preserve-3d" }}
        >
          {icon}
        </motion.span>
      </div>

      <h3 className="relative z-10 mt-2 text-sm sm:text-base font-black text-white group-hover:text-amber-300 transition-colors tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
        {name}
      </h3>
      <p className="relative z-10 mt-1 text-xs text-slate-200 font-bold leading-tight drop-shadow-sm">
        {desc}
      </p>
    </motion.div>
  );
};

export default ClassCategoryCard;
