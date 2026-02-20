import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "motion/react";

// --- Grain layer ---

interface GrainSpeck {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
}

const GRAIN_COUNT = 300;

function createGrainSpeck(w: number, h: number): GrainSpeck {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: 0.8 + Math.random() * 1.0,
    baseOpacity: 0.2 + Math.random() * 0.3,
  };
}

// --- Floating particles ---

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
  phaseOffset: number;
}

const PARTICLE_COUNT = 200;
const CURSOR_RADIUS = 150;
const CURSOR_FORCE = 0.8;

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: 1 + Math.random() * 2,
    baseOpacity: 0.1 + Math.random() * 0.3,
    phaseOffset: Math.random() * Math.PI * 2,
  };
}

function wrapCoord(val: number, max: number): number {
  if (val < 0) return val + max;
  if (val > max) return val - max;
  return val;
}

// --- Component ---

const AmbientBackground = () => {
  const [hasHover, setHasHover] = useState(true);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Primary warm glow — moderate lag
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30, mass: 1 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30, mass: 1 });

  // Deep cool glow — heavier lag for parallax depth
  const deepX = useSpring(mouseX, { stiffness: 25, damping: 25, mass: 1.5 });
  const deepY = useSpring(mouseY, { stiffness: 25, damping: 25, mass: 1.5 });

  // Scroll-based glow radius modulation
  const { scrollYProgress } = useScroll();
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 0.9]);
  const radiusX = useTransform(glowScale, (s) => Math.round(700 * s));
  const radiusY = useTransform(glowScale, (s) => Math.round(525 * s));

  // Compose gradients via motion templates (no re-renders)
  const primaryBg = useMotionTemplate`radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${smoothX}px ${smoothY}px, rgba(200, 170, 110, 0.04), transparent 70%)`;
  const deepBg = useMotionTemplate`radial-gradient(ellipse 900px 700px at ${deepX}px ${deepY}px, rgba(180, 180, 220, 0.02), transparent 65%)`;

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setHasHover(window.matchMedia("(hover: hover)").matches);

    const onPointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    mouseX.set(cx);
    mouseY.set(cy);
    mouseRef.current = { x: cx, y: cy };

    window.addEventListener("pointermove", onPointerMove);
    return () => window.removeEventListener("pointermove", onPointerMove);
  }, []);

  // Particle animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize grain specks + floating particles
    const grain: GrainSpeck[] = Array.from({ length: GRAIN_COUNT }, () =>
      createGrainSpeck(canvas.width, canvas.height)
    );
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, canvas.height)
    );

    let frameId: number;
    let time = 0;

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      time += 0.01;

      // --- Layer 1: film grain (flickering specks) ---
      for (const g of grain) {
        const drawX = g.x + (Math.random() - 0.5);
        const drawY = g.y + (Math.random() - 0.5);
        const opacity = g.baseOpacity * (0.3 + Math.random() * 0.7);

        ctx.beginPath();
        ctx.arc(drawX, drawY, g.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 170, 110, ${opacity})`;
        ctx.fill();
      }

      // --- Layer 2: floating particles (smooth drift + cursor repulsion) ---
      for (const p of particles) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CURSOR_RADIUS && dist > 0) {
          const force = (1 - dist / CURSOR_RADIUS) * CURSOR_FORCE;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.98;
        p.vy *= 0.98;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.1) {
          p.vx += (Math.random() - 0.5) * 0.05;
          p.vy += (Math.random() - 0.5) * 0.05;
        }

        p.x = wrapCoord(p.x + p.vx, w);
        p.y = wrapCoord(p.y + p.vy, h);

        const twinkle = 0.7 + 0.3 * Math.sin(time * 2 + p.phaseOffset);
        const opacity = p.baseOpacity * twinkle;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 170, 110, ${opacity})`;
        ctx.fill();
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  if (!hasHover) return null;

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: -1 }}>
      <motion.div className="absolute inset-0" style={{ background: deepBg }} />
      <motion.div className="absolute inset-0" style={{ background: primaryBg }} />
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default AmbientBackground;
