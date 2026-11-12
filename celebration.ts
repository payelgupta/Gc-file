import confetti from "canvas-confetti";

export const fireCelebration = () => {
  // Smiley emoji burst
  const emojis = ["😊", "🎉", "😄", "🥳", "✨", "💖"];
  const emojiDefaults = {
    spread: 360,
    ticks: 100,
    gravity: 0.6,
    decay: 0.94,
    startVelocity: 30,
    origin: { y: 0.3 },
  };

  // Colorful confetti rain from top
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ff8800", "#8800ff", "#00ff88"];

  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 80,
      origin: { x: 0, y: 0 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 80,
      origin: { x: 1, y: 0 },
      colors,
    });
    confetti({
      particleCount: 2,
      angle: 90,
      spread: 160,
      origin: { x: 0.5, y: 0 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  // Initial big burst
  confetti({
    particleCount: 100,
    spread: 100,
    origin: { y: 0.5 },
    colors,
  });

  // Emoji shapes via confetti scalar
  const scalar = 2;
  const shapes = emojis.map((emoji) =>
    confetti.shapeFromText({ text: emoji, scalar })
  );

  confetti({
    ...emojiDefaults,
    particleCount: 30,
    scalar,
    shapes,
    flat: true,
  });

  // Start continuous rain
  frame();
};
