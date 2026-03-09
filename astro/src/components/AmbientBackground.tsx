import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useMotionTemplate,
  useSpring,
  useScroll,
  useTransform,
} from "motion/react";

// --- Grain layer ---

interface GrainSpeck {
  x: number;
  y: number;
  radius: number;
  baseOpacity: number;
}

const GRAIN_COUNT = 500;

function createGrainSpeck(w: number, h: number): GrainSpeck {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    radius: 0.8 + Math.random() * 1.0,
    baseOpacity: 0.3 + Math.random() * 0.4,
  };
}

// --- Star shapes & tints ---

type StarShape = 4 | 5 | 6 | 8 | "cluster";
const SHAPES: StarShape[] = [4, 4, 5, 6, 8, "cluster"];

const TINTS: [number, number, number][] = [
  [220, 230, 255], // silver-white
  [180, 210, 255], // cool blue
  [255, 200, 230], // warm pink
  [210, 190, 255], // pale violet
];

function randomShape(): StarShape {
  return SHAPES[Math.floor(Math.random() * SHAPES.length)];
}

function randomTint(): [number, number, number] {
  return TINTS[Math.floor(Math.random() * TINTS.length)];
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
  rotation: number;
  shape: StarShape;
  tint: [number, number, number];
}

const PARTICLE_COUNT = 350;
const BIG_STAR_COUNT = 25;
const HUGE_STAR_COUNT = 10;
const CURSOR_RADIUS = 150;
const CURSOR_FORCE = 0.8;

function createParticle(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    radius: 1 + Math.random() * 4,
    baseOpacity: 0.2 + Math.random() * 0.4,
    phaseOffset: Math.random() * Math.PI * 2,
    rotation: (Math.random() - 0.5) * 0.8,
    shape: randomShape(),
    tint: randomTint(),
  };
}

function createBigStar(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    radius: 8 + Math.random() * 12,
    baseOpacity: 0.08 + Math.random() * 0.12,
    phaseOffset: Math.random() * Math.PI * 2,
    rotation: (Math.random() - 0.5) * 0.8,
    shape: randomShape(),
    tint: randomTint(),
  };
}

function createHugeStar(w: number, h: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.08,
    vy: (Math.random() - 0.5) * 0.08,
    radius: 25 + Math.random() * 25,
    baseOpacity: 0.04 + Math.random() * 0.06,
    phaseOffset: Math.random() * Math.PI * 2,
    rotation: (Math.random() - 0.5) * 0.8,
    shape: randomShape(),
    tint: randomTint(),
  };
}

// --- Lens flare orbs ---

interface LensFlare {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseOpacity: number;
  hueOffset: number;
}

const LENS_FLARE_COUNT = 15;

function createLensFlare(w: number, h: number): LensFlare {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.15,
    vy: (Math.random() - 0.5) * 0.15,
    radius: 15 + Math.random() * 25,
    baseOpacity: 0.06 + Math.random() * 0.08,
    hueOffset: Math.random() * 360,
  };
}


// --- Utility ---

function wrapCoord(val: number, max: number): number {
  if (val < 0) return val + max;
  if (val > max) return val - max;
  return val;
}

// --- Drawing functions ---

function drawNPointStar(
  ctx: CanvasRenderingContext2D,
  points: number,
  radius: number,
  innerRatio: number,
) {
  const inner = radius * innerRatio;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const r = i % 2 === 0 ? radius : inner;
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawCluster(
  ctx: CanvasRenderingContext2D,
  radius: number,
  innerRatio: number,
) {
  const offsets = [
    { x: 0, y: -radius * 0.5, s: 1.0 },
    { x: -radius * 0.45, y: radius * 0.35, s: 0.65 },
    { x: radius * 0.5, y: radius * 0.25, s: 0.5 },
  ];
  for (const o of offsets) {
    ctx.save();
    ctx.translate(o.x, o.y);
    drawNPointStar(ctx, 4, radius * o.s, innerRatio);
    ctx.restore();
  }
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number = 0,
  shape: StarShape = 4,
) {
  const innerRatio = 0.12;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const baseColor = ctx.fillStyle as string;

  // Soft glow behind the star (skip for clusters)
  if (shape !== "cluster") {
    const glowRadius = radius * 0.6;
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRadius);
    glow.addColorStop(0, baseColor);
    glow.addColorStop(1, baseColor.replace(/[\d.]+\)$/, "0)"));
    ctx.beginPath();
    ctx.arc(0, 0, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();
  }

  // Draw shape
  ctx.fillStyle = baseColor;
  if (shape === "cluster") {
    drawCluster(ctx, radius, innerRatio);
  } else {
    drawNPointStar(ctx, shape, radius, innerRatio);
  }

  ctx.restore();
}


// --- Component ---

const AmbientBackground = () => {
  const [hasHover, setHasHover] = useState(true);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Primary glow — moderate lag
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 30, mass: 1 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 30, mass: 1 });

  // Deep glow — heavier lag for parallax depth
  const deepX = useSpring(mouseX, { stiffness: 25, damping: 25, mass: 1.5 });
  const deepY = useSpring(mouseY, { stiffness: 25, damping: 25, mass: 1.5 });

  // Scroll-based glow radius modulation
  const { scrollYProgress } = useScroll();
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.15, 0.9]);
  const radiusX = useTransform(glowScale, (s) => Math.round(700 * s));
  const radiusY = useTransform(glowScale, (s) => Math.round(525 * s));

  // Hue motion values for color-cycling glows
  const primaryHue = useMotionValue(220);
  const deepHue = useMotionValue(270);

  // Compose gradients with color-cycling hues
  const primaryBg = useMotionTemplate`radial-gradient(ellipse ${radiusX}px ${radiusY}px at ${smoothX}px ${smoothY}px, hsla(${primaryHue}, 60%, 75%, 0.12), transparent 70%)`;
  const deepBg = useMotionTemplate`radial-gradient(ellipse 900px 700px at ${deepX}px ${deepY}px, hsla(${deepHue}, 50%, 70%, 0.07), transparent 65%)`;

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

    const scrollRef = { y: 0 };
    const onScroll = () => { scrollRef.y = window.scrollY; };
    window.addEventListener("scroll", onScroll, { passive: true });
    scrollRef.y = window.scrollY;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const worldH = () => Math.max(document.documentElement.scrollHeight, window.innerHeight);

    // Initialize all layers
    const grain: GrainSpeck[] = Array.from({ length: GRAIN_COUNT }, () =>
      createGrainSpeck(canvas.width, worldH())
    );
    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () =>
      createParticle(canvas.width, worldH())
    );
    const bigStars: Particle[] = Array.from({ length: BIG_STAR_COUNT }, () =>
      createBigStar(canvas.width, worldH())
    );
    const hugeStars: Particle[] = Array.from({ length: HUGE_STAR_COUNT }, () =>
      createHugeStar(canvas.width, worldH())
    );
    const flares: LensFlare[] = Array.from({ length: LENS_FLARE_COUNT }, () =>
      createLensFlare(canvas.width, worldH())
    );
    let frameId: number;
    let time = 0;
    let prevWorldH = worldH();

    const allLayers = [grain, particles, bigStars, hugeStars, flares];

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y + scrollRef.y;
      const sy = scrollRef.y;
      const wh = worldH();

      // Rescale particle Y positions when document height changes
      if (wh !== prevWorldH && prevWorldH > 0) {
        const scale = wh / prevWorldH;
        for (const layer of allLayers) {
          for (const p of layer) {
            p.y *= scale;
          }
        }
        prevWorldH = wh;
      }
      time += 0.01;

      // Update color-cycling hue values
      primaryHue.set(230 + 30 * Math.sin(time * 0.6));
      deepHue.set(280 + 30 * Math.sin(time * 0.6 + 2));

      // --- Layer 1: grain specks (silver-white) ---
      for (const g of grain) {
        const screenY = g.y - sy;
        if (screenY < -5 || screenY > h + 5) continue;
        const drawX = g.x + (Math.random() - 0.5);
        const drawY = screenY + (Math.random() - 0.5);
        const opacity = g.baseOpacity * (0.3 + Math.random() * 0.7);

        ctx.beginPath();
        ctx.arc(drawX, drawY, g.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 230, 255, ${opacity})`;
        ctx.fill();
      }

      // --- Layer 2: floating star particles (drift + cursor repulsion) ---
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
        p.y = wrapCoord(p.y + p.vy, wh);

        const screenY = p.y - sy;
        if (screenY < -10 || screenY > h + 10) continue;

        const twinkle = 0.7 + 0.3 * Math.sin(time * 2 + p.phaseOffset);
        const opacity = p.baseOpacity * twinkle;

        ctx.fillStyle = `rgba(${p.tint[0]}, ${p.tint[1]}, ${p.tint[2]}, ${opacity})`;
        drawStar(ctx, p.x, screenY, p.radius, p.rotation, p.shape);
      }

      // --- Layer 2b: big star sparkles ---
      for (const p of bigStars) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_RADIUS * 1.5 && dist > 0) {
          const force = (1 - dist / (CURSOR_RADIUS * 1.5)) * CURSOR_FORCE * 0.4;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.05) {
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
        }
        p.x = wrapCoord(p.x + p.vx, w);
        p.y = wrapCoord(p.y + p.vy, wh);

        const screenY = p.y - sy;
        if (screenY < -30 || screenY > h + 30) continue;

        const twinkle = 0.6 + 0.4 * Math.sin(time * 1.5 + p.phaseOffset);
        const opacity = p.baseOpacity * twinkle;

        ctx.fillStyle = `rgba(${p.tint[0]}, ${p.tint[1]}, ${p.tint[2]}, ${opacity})`;
        drawStar(ctx, p.x, screenY, p.radius, p.rotation, p.shape);
      }

      // --- Layer 2c: huge star sparkles ---
      for (const p of hugeStars) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_RADIUS * 2 && dist > 0) {
          const force = (1 - dist / (CURSOR_RADIUS * 2)) * CURSOR_FORCE * 0.2;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        p.vx *= 0.995;
        p.vy *= 0.995;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < 0.03) {
          p.vx += (Math.random() - 0.5) * 0.01;
          p.vy += (Math.random() - 0.5) * 0.01;
        }
        p.x = wrapCoord(p.x + p.vx, w);
        p.y = wrapCoord(p.y + p.vy, wh);

        const screenY = p.y - sy;
        if (screenY < -60 || screenY > h + 60) continue;

        const twinkle = 0.5 + 0.5 * Math.sin(time * 0.8 + p.phaseOffset);
        const opacity = p.baseOpacity * twinkle;

        ctx.fillStyle = `rgba(${p.tint[0]}, ${p.tint[1]}, ${p.tint[2]}, ${opacity})`;
        drawStar(ctx, p.x, screenY, p.radius, p.rotation, p.shape);
      }

      // --- Layer 3: lens flare orbs ---
      for (const f of flares) {
        const dx = f.x - mx;
        const dy = f.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CURSOR_RADIUS * 1.8 && dist > 0) {
          const force = (1 - dist / (CURSOR_RADIUS * 1.8)) * CURSOR_FORCE * 0.3;
          f.vx += (dx / dist) * force;
          f.vy += (dy / dist) * force;
        }
        f.vx *= 0.985;
        f.vy *= 0.985;

        f.x = wrapCoord(f.x + f.vx, w);
        f.y = wrapCoord(f.y + f.vy, wh);

        const screenY = f.y - sy;
        if (screenY < -f.radius || screenY > h + f.radius) continue;

        const hue = (f.hueOffset + time * 8) % 360;
        const opacity = f.baseOpacity * (0.8 + 0.2 * Math.sin(time + f.hueOffset));

        const grad = ctx.createRadialGradient(f.x, screenY, 0, f.x, screenY, f.radius);
        grad.addColorStop(0, `hsla(${hue}, 60%, 80%, ${opacity})`);
        grad.addColorStop(0.6, `hsla(${hue + 30}, 50%, 70%, ${opacity * 0.4})`);
        grad.addColorStop(1, `hsla(${hue + 60}, 40%, 60%, 0)`);

        ctx.beginPath();
        ctx.arc(f.x, screenY, f.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
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
