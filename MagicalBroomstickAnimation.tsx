import React, { useEffect, useRef, useState, useCallback } from "react";

interface StardustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

// Pre-load frames mapping for instantaneous switching without network stalls
const SPRITE_PATHS: Record<string, string> = {
  frame2: "/assets/harry-sprites/frame2.png",
  frame3: "/assets/harry-sprites/frame3.png",
  frame4: "/assets/harry-sprites/frame4.png",
  frame5: "/assets/harry-sprites/frame5.png",
  frame6: "/assets/harry-sprites/frame6.png",
  frame7: "/assets/harry-sprites/frame7.png",
  frame8: "/assets/harry-sprites/frame8.png",
};

export const MagicalBroomstickAnimation: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const harryRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hasPlayedInitialRef = useRef(false);
  const currentSpriteRef = useRef<string>("frame2");

  // Preload all authentic 2D Harry Potter sprites into browser cache
  useEffect(() => {
    Object.values(SPRITE_PATHS).forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Perlin quintic smootherstep function: 6t^5 - 15t^4 + 10t^3
  // Zero 1st & 2nd derivative at t=0 and t=1, guaranteeing zero-jerk, buttery-smooth easing
  const smootherstep = (t: number): number => {
    const clamped = Math.max(0, Math.min(1, t));
    return clamped * clamped * clamped * (clamped * (clamped * 6 - 15) + 10);
  };

  // Trigger the 12-second flight animation using requestAnimationFrame and CSS Transforms
  const startFlight = useCallback(() => {
    if (isPlaying) return;
    setIsPlaying(true);

    const harryEl = harryRef.current;
    const imgEl = imgRef.current;
    const canvas = particleCanvasRef.current;

    if (!harryEl || !imgEl || !canvas) {
      setTimeout(() => setIsPlaying(false), 12500);
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Retina High-DPI canvas scaling for particle trail
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateCanvasSize();

    // Dynamically query target position of the Floating AI Button (Royal Crest)
    const aiBtn = document.getElementById("ai-floating-btn");
    const getTargetPos = () => {
      if (aiBtn) {
        const rect = aiBtn.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
      return { x: window.innerWidth - 45, y: window.innerHeight - 50 };
    };

    const startTime = performance.now();
    const duration = 12000; // Exactly 12.0 seconds duration
    const particles: StardustParticle[] = [];
    const trailColors = ["#F5C76A", "#EF4444", "#38BDF8", "#EC4899", "#8B5CF6", "#F97316"];
    let portalBurstCreated = false;
    let smoothedAngle = -0.3;

    // Make Harry visible with initial scale
    harryEl.style.opacity = "1";

    const animate = (time: number) => {
      const elapsed = Math.max(0, time - startTime);
      const progress = Math.min(elapsed / duration, 1);

      const targetPos = getTargetPos();
      const screenW = window.innerWidth;
      const screenH = window.innerHeight;

      // Clear particle canvas
      ctx.clearRect(0, 0, screenW, screenH);

      let x = 0;
      let y = 0;
      let targetAngle = 0;
      let diveScale = 1;
      let flipX = 1;
      let nextSprite = "frame2";

      // Fixed Anchor at Bottom-Left for comedic routine
      const blX = Math.max(screenW * 0.13, 70);
      const blY = Math.min(screenH * 0.72, screenH - 135);

      // =========================================================================
      // Stage 1 (0.0s – 4.5s / 0% -> 37.5%):
      // Snake-like S-curves gliding from top-right down across the entire mobile screen
      // =========================================================================
      if (progress < 0.375) {
        const p = progress / 0.375;
        const s = smootherstep(p);

        const startX = screenW + 120;
        const startY = Math.max(screenH * 0.05, 45);

        // Smooth baseline interpolation
        const baseLineX = startX + (blX - startX) * s;
        const baseLineY = startY + (blY - startY) * s;

        // Sine envelope ensures oscillation amplitude starts at 0 and lands at exactly 0
        // Result: 100% zero jump when arriving at bottom-left!
        const waveEnv = Math.sin(p * Math.PI);
        const wave = Math.sin(p * Math.PI * 4) * 60 * waveEnv;

        x = baseLineX + wave * 0.35;
        y = baseLineY + wave;

        // Velocity tangents for dynamic broom tilting
        const tangentX = (blX - startX) + Math.cos(p * Math.PI * 4) * 50 * waveEnv;
        const tangentY = (blY - startY) + Math.cos(p * Math.PI * 4) * 60 * waveEnv;
        targetAngle = Math.atan2(tangentY, -Math.abs(tangentX)) * 0.35;
        flipX = -1; // Facing left along flight path

        // Flutter frames cycle (300ms cycle)
        const frameCycle = Math.floor((elapsed / 300) % 3);
        if (frameCycle === 0) nextSprite = "frame2";
        else if (frameCycle === 1) nextSprite = "frame3";
        else nextSprite = "frame4";
      }
      // =========================================================================
      // Stage 2 (4.5s – 8.2s / 37.5% -> 68.3%):
      // Comedic balancing routine & upside-down acrobatic act at bottom-left
      // =========================================================================
      else if (progress < 0.683) {
        const p = (progress - 0.375) / 0.308;
        // Continuous smooth envelope starting and ending at exactly zero
        const env = Math.sin(p * Math.PI);

        // Gentle harmonic balancing hover
        x = blX + Math.sin(p * Math.PI * 4) * 22 * env;
        y = blY - Math.sin(p * Math.PI * 2) * 16 * env;

        if (p < 0.50) {
          // Frame 5: Clumsy wobble, broom tilting high, wand flailing!
          nextSprite = "frame5";
          targetAngle = Math.sin(p * 14) * 0.22 - 0.08;
          flipX = 1;
        } else {
          // Frame 6: Playful upside-down acrobatic hover with cheeky grin!
          nextSprite = "frame6";
          targetAngle = Math.sin((p - 0.5) * 10) * 0.16;
          flipX = 1;
        }
      }
      // =========================================================================
      // Stage 3 (8.2s – 10.6s / 68.3% -> 88.3%):
      // Recovers with a smile, spots the Golden AI Button, buoyant joyful swoop across
      // =========================================================================
      else if (progress < 0.883) {
        const p = (progress - 0.683) / 0.20;
        const s = smootherstep(p);

        const hoverX = targetPos.x - 70;
        const hoverY = targetPos.y - 85;

        // Buoyant arc: starts exactly at (blX, blY), lands smoothly at (hoverX, hoverY)
        const arcY = -Math.sin(s * Math.PI) * 65;
        x = blX + (hoverX - blX) * s;
        y = blY + (hoverY - blY) * s + arcY;

        targetAngle = Math.atan2(hoverY - blY, hoverX - blX) * 0.45 - Math.cos(s * Math.PI) * 0.18;
        flipX = 1;
        nextSprite = "frame7";
      }
      // =========================================================================
      // Stage 4 (10.6s – 12.0s / 88.3% -> 100%):
      // Diving headfirst directly into the Royal Golden GC Crest AI Button
      // =========================================================================
      else {
        const p = (progress - 0.883) / 0.117;
        const s = p * p * (3 - 2 * p); // Smooth accelerating dive

        const startX = targetPos.x - 70;
        const startY = targetPos.y - 85;

        x = startX + (targetPos.x - startX) * s;
        y = startY + (targetPos.y - startY) * s;
        targetAngle = Math.atan2(targetPos.y - startY, targetPos.x - startX);
        diveScale = Math.max(1 - Math.pow(p, 1.35) * 1.05, 0);
        flipX = 1;
        nextSprite = "frame8";
      }

      // Smooth angular interpolation with angle normalization to prevent 360-degree snap
      const angleDelta = targetAngle - smoothedAngle;
      const normalizedDelta = Math.atan2(Math.sin(angleDelta), Math.cos(angleDelta));
      smoothedAngle += normalizedDelta * 0.15;

      // Update character sprite image if changed
      if (nextSprite !== currentSpriteRef.current) {
        currentSpriteRef.current = nextSprite;
        imgEl.src = SPRITE_PATHS[nextSprite] || SPRITE_PATHS.frame2;
      }

      // APPLY HARDWARE-ACCELERATED CSS 3D TRANSFORMS DIRECTLY ON COMPOSITOR THREAD
      // Zero canvas re-rasterization of the character; pure 120 FPS GPU matrix transformation!
      const totalScale = 1.05 * diveScale;
      const scaleX = totalScale * flipX;
      const scaleY = totalScale;
      const halfW = 77;
      const halfH = 48;

      harryEl.style.transform = `translate3d(${x - halfW}px, ${y - halfH}px, 0px) rotate(${smoothedAngle}rad) scale(${scaleX}, ${scaleY})`;
      harryEl.style.opacity = diveScale <= 0.02 ? "0" : "1";

      // Emit glowing stardust particles from broom tail
      if (diveScale > 0.08 && particles.length < 45) {
        const tailDir = flipX === -1 ? 1 : -1;
        const tailX = x + tailDir * Math.cos(smoothedAngle) * 55;
        const tailY = y - Math.sin(smoothedAngle) * 35;

        particles.push({
          x: tailX + (Math.random() - 0.5) * 8,
          y: tailY + (Math.random() - 0.5) * 8,
          vx: tailDir * (1.8 + Math.random() * 2) + (Math.random() - 0.5) * 1.2,
          vy: -Math.sin(smoothedAngle) * 1.5 + (Math.random() - 0.5) * 1.5,
          size: 3 + Math.random() * 3.5,
          color: trailColors[Math.floor(Math.random() * trailColors.length)],
          alpha: 1,
          life: 0,
          maxLife: 26 + Math.random() * 12,
        });
      }

      // Stardust flash upon entering the AI button: brief instant burst (< 0.25s)
      if (progress >= 0.96 && !portalBurstCreated) {
        portalBurstCreated = true;

        for (let i = 0; i < 12; i++) {
          const spAngle = Math.random() * Math.PI * 2;
          const spSpeed = 2 + Math.random() * 3.5;
          particles.push({
            x: targetPos.x,
            y: targetPos.y,
            vx: Math.cos(spAngle) * spSpeed,
            vy: Math.sin(spAngle) * spSpeed,
            size: 3 + Math.random() * 3,
            color: ["#F5C76A", "#FFFFFF", "#48D9F5", "#10B981"][Math.floor(Math.random() * 4)],
            alpha: 1,
            life: 0,
            maxLife: 14,
          });
        }

        if (aiBtn) {
          aiBtn.classList.add("ring-2", "ring-[#F5C76A]", "shadow-[0_0_25px_rgba(245,199,106,0.85)]");
          setTimeout(() => {
            aiBtn.classList.remove("ring-2", "ring-[#F5C76A]", "shadow-[0_0_25px_rgba(245,199,106,0.85)]");
          }, 220);
        }
      }

      // Render hardware-accelerated stardust particle trail (2-pass draw with zero shadowBlur lag)
      ctx.save();
      for (let i = particles.length - 1; i >= 0; i--) {
        const pt = particles[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life++;
        pt.alpha = Math.max(1 - pt.life / pt.maxLife, 0);

        if (pt.life >= pt.maxLife || pt.alpha <= 0.02) {
          particles.splice(i, 1);
          continue;
        }

        // Pass 1: Outer glowing neon halo
        ctx.globalAlpha = pt.alpha * 0.35;
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Pass 2: Bright sparkling inner core
        ctx.globalAlpha = pt.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * 0.85, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // Continue animation until 12.0s duration finishes
      if (progress < 1 || particles.length > 0) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (harryEl) harryEl.style.opacity = "0";
        setIsPlaying(false);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isPlaying]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Trigger flight automatically on initial page visit once (after smooth 1.8s page render)
  useEffect(() => {
    if (hasPlayedInitialRef.current) return;
    hasPlayedInitialRef.current = true;
    const timer = setTimeout(() => {
      startFlight();
    }, 1800);
    return () => clearTimeout(timer);
  }, [startFlight]);

  // Expose trigger-harry-flight custom event for programmatic trigger
  useEffect(() => {
    const handleCustomTrigger = () => startFlight();
    window.addEventListener("trigger-harry-flight", handleCustomTrigger);
    return () => window.removeEventListener("trigger-harry-flight", handleCustomTrigger);
  }, [startFlight]);

  return (
    <div
      ref={containerRef}
      className={`pointer-events-none fixed inset-0 z-40 transition-opacity duration-300 ${
        isPlaying ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Lightweight Transparent Particle Canvas for Neon Stardust Trail */}
      <canvas
        ref={particleCanvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full"
      />

      {/* GPU Hardware-Composited Harry Potter Element using CSS 3D Transforms */}
      <div
        ref={harryRef}
        className="fixed pointer-events-none select-none z-50 opacity-0"
        style={{
          top: 0,
          left: 0,
          width: 155,
          height: 96,
          willChange: "transform, opacity",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transformStyle: "preserve-3d",
          transformOrigin: "center center",
          filter:
            "drop-shadow(0 0 10px rgba(245, 199, 106, 0.9)) drop-shadow(0 0 20px rgba(72, 217, 245, 0.7)) drop-shadow(0 0 30px rgba(168, 85, 247, 0.5))",
        }}
      >
        <img
          ref={imgRef}
          src="/assets/harry-sprites/frame2.png"
          alt="Harry Potter Flying on Broomstick"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      </div>
    </div>
  );
};

export default MagicalBroomstickAnimation;
