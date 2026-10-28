import { useMemo } from "react";
import "./ParticleBackground.css";

// One paw print (toes point up, the direction the particles travel)
function PawShape() {
  return (
    <svg
      className="particles__paw"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="13" cy="28" rx="6" ry="8" transform="rotate(-22 13 28)" />
      <ellipse cx="25" cy="14" rx="6.5" ry="9" transform="rotate(-8 25 14)" />
      <ellipse cx="39" cy="14" rx="6.5" ry="9" transform="rotate(8 39 14)" />
      <ellipse cx="51" cy="28" rx="6" ry="8" transform="rotate(22 51 28)" />
      <path d="M32 31c-11 0-19 11-17 19 1.6 7 10 5.5 17 5.5s15.4 1.5 17-5.5c2-8-6-19-17-19z" />
    </svg>
  );
}

// Theme colors (defined in styles/variables.css). Gold appears most often.
const PARTICLE_COLORS = [
  "var(--color-gold)",
  "var(--color-gold)",
  "var(--color-gold)",
  "var(--color-orange)",
  "var(--color-orange)",
  "#ffd45e",
];

// Small seeded random generator so the particles stay the same between renders.
function createRandom(seed) {
  let value = seed;

  return function random() {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;

    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildParticles(count) {
  const random = createRandom(2026);

  return Array.from({ length: count }, (_, index) => {
    const duration = 18 + random() * 14; // seconds
    const startX = random() * 100;

    return {
      id: index,
      color: PARTICLE_COLORS[Math.floor(random() * PARTICLE_COLORS.length)],
      size: 16 + random() * 14, // px
      startX,
      endX: Math.min(100, Math.max(0, startX + (random() * 24 - 12))),
      duration,
      // Negative delay = particle is already mid-flight when the page loads
      delay: -random() * duration,
      pulseDuration: 2 + random() * 2,
      pulseDelay: -random() * 4,
      peakOpacity: 0.5 + random() * 0.4,
      tilt: random() * 70 - 35, // degrees
    };
  });
}

/**
 * Floating glowing particles. Place it inside any element that has
 * `position: relative` and `overflow: hidden`; it fills that element
 * and never blocks clicks. Use `subtle` for calmer pages (login, signup).
 */
function ParticleBackground({ count = 34, subtle = false }) {
  const particles = useMemo(() => buildParticles(count), [count]);

  return (
    <div
      className="particles"
      aria-hidden="true"
      style={subtle ? { opacity: 0.5 } : undefined}
    >
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="particles__item"
          style={{
            "--p-color": particle.color,
            "--p-size": `${particle.size}px`,
            "--p-x0": `${particle.startX}cqw`,
            "--p-x1": `${particle.endX}cqw`,
            "--p-duration": `${particle.duration}s`,
            "--p-delay": `${particle.delay}s`,
            "--p-pulse-duration": `${particle.pulseDuration}s`,
            "--p-pulse-delay": `${particle.pulseDelay}s`,
            "--p-opacity": particle.peakOpacity,
            "--p-tilt": `${particle.tilt}deg`,
          }}
        >
          <PawShape />
        </span>
      ))}
    </div>
  );
}

export default ParticleBackground;
