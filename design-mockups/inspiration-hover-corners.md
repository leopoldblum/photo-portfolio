# Atmospheric inspiration — background, hover, cursor

Three linked techniques from `landing-atmospheric.html`. They share one color language (a hot magenta + a cool cyan, with no other accents) which is what lets them read as one continuous lighting system: colored washes sit in the background like distant stage lights; a soft halo travels with the cursor; the halo bleeds onto whichever image the cursor lands on.

---

## 1. Background atmosphere — color washes + grain + vignette

A four-layer stack rendered behind everything. Each layer does one thing only:

| Layer | Role |
| --- | --- |
| **Color washes** (radial-gradient blobs) | The mood — warm/cool stage-light bleed |
| **Fine grain** (SVG noise) | Photographic texture / breaks up flat backgrounds |
| **Scanlines** (faint repeating-linear-gradient) | Subtle digital/film grit, optional |
| **Vignette** (radial darken at edges) | Pulls focus inward, frames the page |

The combo of magenta `#ff2b6e` + cyan `#4dd2ff` is what gives it the concert-photography feel — two complementary stage-light colors at low opacity, plus one warm amber accent for variety. No greens, no purples, no pastels — that's what keeps it from drifting into "dreamy/wedding".

```css
/* the color washes — four bleeding radial blobs */
.stage-lights {
  position: fixed;
  inset: -20% -20% -20% -20%;     /* bleed past viewport edges */
  pointer-events: none;
  z-index: -4;                    /* deepest layer */
  background:
    radial-gradient(ellipse 40% 30% at 18% 8%,  rgba(255, 43, 110, 0.30), transparent 60%),
    radial-gradient(ellipse 35% 28% at 82% 22%, rgba( 77, 210, 255, 0.20), transparent 60%),
    radial-gradient(ellipse 45% 35% at 28% 78%, rgba(255, 180,  84, 0.13), transparent 65%),
    radial-gradient(ellipse 38% 32% at 88% 92%, rgba(255,  43, 110, 0.16), transparent 62%);
  filter: blur(40px) saturate(1.2);  /* heavy blur = the gradients fuse into mood */
}

/* fine SVG grain — adds photographic texture */
.grain-fine {
  position: fixed; inset: 0;
  pointer-events: none; z-index: 100;   /* sits above content */
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.6' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.08 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
  opacity: 0.85;
  mix-blend-mode: overlay;
}

/* heavy edge vignette — pulls focus inward */
.vignette {
  position: fixed; inset: 0;
  pointer-events: none; z-index: -1;
  background: radial-gradient(ellipse 80% 65% at 50% 45%,
                              transparent 50%,
                              rgba(0,0,0,0.6) 100%);
}
```

```html
<!-- order matters; fixed elements stack by document order at same z-index -->
<div class="stage-lights"></div>
<div class="vignette"></div>
<div class="grain-fine"></div>
```

### Why the pulse animation should be cut

The mockup originally animates `.stage-lights` with a 16s `pulse` keyframe (slow scale + translate + opacity oscillation). **Don't carry that over.** It looks fine in isolation but on a photography portfolio the constant breathing is distracting — the eye keeps catching motion in the periphery instead of resting on the photographs. A static gradient stack reads as an environment; an animated one reads as a UI animation.

```css
/* DO NOT INCLUDE — the breathing animation reads as nervous, not atmospheric */
@keyframes pulse {
  0%   { transform: translate3d(0,0,0) scale(1);     opacity: 0.85; }
  50%  { transform: translate3d(-3%, 2%, 0) scale(1.06); opacity: 1; }
  100% { transform: translate3d(2%, -1%, 0) scale(1.02); opacity: 0.78; }
}
.stage-lights { animation: pulse 16s ease-in-out infinite alternate; }
```

The static version is the keeper. The cursor bloom (section 3) is the *only* thing that moves in the atmospheric system — that's the lighting; everything else is set.

### Why this works on dark photography sites specifically

- **`inset: -20%`** plus heavy `blur(40px)` means the gradient edges never show — the color just exists, like distant lighting outside the frame
- **Low alphas (0.13–0.30)** keep the washes from competing with photos. They're felt, not seen
- **Two complementary hues plus one warm** is enough variety; more colors muddy into brown
- **Grain at `mix-blend-mode: overlay`** at low opacity (8% alpha noise) integrates the texture with image edges instead of sitting on top as a flat film
- **Vignette at 60% black at corners** is aggressive but works on dark themes — pulls every photograph slightly inward visually

### Notes for porting

- The site already has a subtle vignette in `global.css` — keep that as the base layer, add the color washes and grain on top of it.
- Two new CSS variables would be enough: `--bloom-warm` and `--bloom-cool` (both at ~0.20 alpha), referenced in the `.stage-lights` blob coordinates and reused for the cursor bloom and the image hover glow. One palette, three places, one rule: "hot color = light".
- Grain SVGs inline as data URIs are fine; alternatively serve a single small PNG and reference it via `url()`. Either way the grain layer should never re-render — it's static, browser caches it once.
- `prefers-reduced-motion` doesn't apply here once the pulse is removed; nothing animates.
- For touch / low-end devices, the heavy `filter: blur(40px)` on a fixed full-viewport element can be expensive. If perf matters, prerender the blurred gradient to an SVG/PNG once and use that as a static background image.

---

## 2. Hover technique — corner brackets + lift + sibling dim

Image hover state from `landing-atmospheric.html`. Three things happen at once on hover:

1. **Corner brackets** fade in just inside the image edges (8 hairlines forming 4 L-shapes)
2. The hovered image **lifts** vertically (`translateY(-8px)`) and gains a deeper shadow with a faint magenta glow
3. **Sibling images in the same row dim** (`brightness 0.55, saturate 0.7`)

Reads as: viewfinder framing + film-print lift + spotlight isolation. Photographic, not generic.

## CSS — the corner brackets

The brackets are 8 tiny linear-gradients on a single `::after` pseudo-element, positioned at the four corners with `background-position`. No SVG, no extra elements. The `inset: 6px` controls how far inside the image the brackets sit; `12px 1px` and `1px 12px` are the bracket arm length and thickness.

```css
.row a::after {
  content: '';
  position: absolute;
  inset: 6px;                    /* distance from image edge */
  background:
    linear-gradient(var(--ink-dim), var(--ink-dim)) top    left  / 12px 1px no-repeat,
    linear-gradient(var(--ink-dim), var(--ink-dim)) top    left  / 1px 12px no-repeat,
    linear-gradient(var(--ink-dim), var(--ink-dim)) top    right / 12px 1px no-repeat,
    linear-gradient(var(--ink-dim), var(--ink-dim)) top    right / 1px 12px no-repeat,
    linear-gradient(var(--ink-dim), var(--ink-dim)) bottom left  / 12px 1px no-repeat,
    linear-gradient(var(--ink-dim), var(--ink-dim)) bottom left  / 1px 12px no-repeat,
    linear-gradient(var(--ink-dim), var(--ink-dim)) bottom right / 12px 1px no-repeat,
    linear-gradient(var(--ink-dim), var(--ink-dim)) bottom right / 1px 12px no-repeat;
  opacity: 0;
  transition: opacity 250ms;
  pointer-events: none;
}
.row a:hover::after { opacity: 0.7; }
```

## CSS — the lift + glow

Hot accent in the shadow stack is what makes it feel concert-y instead of clinical. Drop the magenta layer if you want a quieter version.

```css
.row a {
  transition: transform 600ms cubic-bezier(.18,.7,.2,1);
}
.row a img {
  box-shadow:
    0 1px 0 rgba(255,255,255,0.05) inset,
    0 36px 70px -22px rgba(0,0,0,0.95),
    0 12px 24px -8px rgba(0,0,0,0.6);
  transition: transform 700ms cubic-bezier(.18,.7,.2,1),
              box-shadow 700ms,
              filter 600ms;
}
.row a:hover { transform: translateY(-8px); z-index: 2; }
.row a:hover img {
  box-shadow:
    0 1px 0 rgba(255,255,255,0.08) inset,
    0 60px 120px -22px rgba(0,0,0,1),
    0 18px 32px -10px rgba(0,0,0,0.7),
    0 0 60px -10px rgba(255, 43, 110, 0.25);   /* magenta spill */
}
```

## CSS — sibling dim

The trick that makes the hovered image read as "selected" rather than just "raised". `:not(:hover)` on siblings inside the same parent.

```css
.row:hover a:not(:hover) img {
  filter: brightness(0.55) saturate(0.7) contrast(1);
}
```

## Why it works

- **Brackets reference photographic chrome** (viewfinder corners, contact-sheet crop marks) — gives photographic identity at zero typographic cost
- **Lift + magenta glow** is the only place the hot accent touches an image — keeps the color palette disciplined while signaling interactivity
- **Siblings dimming** turns the row into a stage. Without it, the lift alone reads as a wobble; with it, the row becomes a spotlit strip
- **All three transitions are different speeds** (250ms brackets, 600–700ms lift+shadow, instant filter cascade on siblings) — the staggered timing reads as cinematic rather than mechanical

## Notes for porting into the real site

- In `PortfolioShell.tsx` / `ImageDisplay`-equivalent, the brackets need `position: relative` on the link and `position: absolute` on `::after` — already true in current grid
- The `--ink-dim` and magenta accent can be the existing CSS variables; no new tokens needed if you already have a hot accent
- `:hover` interactions don't fire on touch — pair with `@media (hover: hover)` to avoid stuck states on iOS
- If the image grid uses `transition:persist` (the persistent shell), make sure `:hover` styles don't conflict with the Framer Motion `layoutId` morph — they shouldn't, since the bracket pseudo-element doesn't participate in layout

---

## 3. Cursor halo (bloom) — and how it connects to the image glow

A 720px soft magenta light tracks the pointer at `mix-blend-mode: screen`. The same magenta appears as the outer glow on a hovered image (`box-shadow: 0 0 60px -10px rgba(255, 43, 110, 0.25)`). The user reads it as one light source: the cursor *is* the spotlight, and when it lands on a frame, the frame catches it.

### CSS — the bloom element

A single fixed-position element, sized larger than the cursor by a wide margin so the falloff is gentle. `mix-blend-mode: screen` is what makes it lighten anything underneath without looking like a flat overlay; on dark backgrounds it reads as warm light, on lit images it spills onto highlights only.

```css
.bloom {
  position: fixed;
  left: 50%; top: 30%;                /* initial position, before mouse */
  width: 720px; height: 720px;
  transform: translate(-50%, -50%);
  pointer-events: none;               /* so it never blocks clicks */
  z-index: -1;                        /* sits behind content, in front of bg */
  background: radial-gradient(circle,
    rgba(255, 43, 110, 0.10) 0%,
    rgba(255, 43, 110, 0.03) 30%,
    transparent 60%);
  transition: left 500ms ease-out, top 500ms ease-out;  /* trailing motion */
  mix-blend-mode: screen;
  will-change: transform, left, top;
}
```

```html
<div class="bloom" id="bloom"></div>
```

### JS — pointer tracking with rAF coalescing

`pointermove` fires very rapidly. Coalesce updates with `requestAnimationFrame` so we never queue more than one position change per frame. The 500ms CSS transition on `left/top` adds the trailing-light feeling — without it the bloom snaps and reads as a UI cursor instead of a light.

```js
const bloom = document.getElementById('bloom');
let raf = 0;
window.addEventListener('pointermove', (e) => {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    bloom.style.left = e.clientX + 'px';
    bloom.style.top  = e.clientY + 'px';
    raf = 0;
  });
});
```

### The glow link — same color on hover

This is what closes the loop. The hovered image's outer shadow uses *the same magenta* as the cursor bloom. Once both are present at once, the eye reads them as one continuous light spilling from the pointer onto the picture.

```css
.row a:hover img {
  box-shadow:
    0 1px 0 rgba(255,255,255,0.08) inset,
    0 60px 120px -22px rgba(0,0,0,1),
    0 18px 32px -10px rgba(0,0,0,0.7),
    0 0 60px -10px rgba(255, 43, 110, 0.25);   /* ← same hot magenta as the bloom */
}
```

## Why the cursor + glow combo works

- **One color, two places**: the rule is "the hot accent only ever appears as light". It never appears as type, fills, or borders. That self-imposed constraint is what makes it read as lighting design instead of branding.
- **Screen blend mode is essential**: any other blend mode (multiply, overlay, normal) breaks the illusion — only `screen` reads as additive light on dark.
- **Trailing motion (500ms)** is what separates "cursor light" from "UI cursor". A snappy follow feels mechanical; a lagging follow feels like physical light traveling.
- **rAF coalescing** keeps it 60fps even on slow machines — without it, `pointermove` fires faster than paints and the page hitches.

## How the existing `CursorBloom.tsx` compares

The site already has `astro/src/components/CursorBloom.tsx`. It works, but the mockup version is meaningfully better for several specific reasons. The current implementation is roughly:

```ts
// current — paints a full-viewport radial-gradient, springs the position,
// no blend mode, and uses a purple unrelated to the rest of the site
const bg = useMotionTemplate`radial-gradient(ellipse 600px 450px at ${smoothX}px ${smoothY}px,
                              hsla(260, 50%, 65%, 0.1), transparent 70%)`
return <motion.div className="fixed inset-0" style={{ background: bg, zIndex: -1 }} />
```

What's improvable, in priority order:

1. **No `mix-blend-mode: screen`.** This is the single biggest upgrade. The current bloom sits *on top of* the page as a flat lavender haze (alpha 0.1). With `mix-blend-mode: screen` it would behave like real additive light — only lifting darks, leaving lit pixels alone. That's the difference between "purple overlay" and "spotlight". Free and one line of CSS.
2. **Color is unrelated to the rest of the site.** The current `hsla(260, 50%, 65%, 0.1)` is a soft violet that doesn't echo anywhere else. Switching to the accent color (whatever the site picks — the mockup uses magenta `rgba(255, 43, 110, 0.10)`, but it could equally be any single defined accent) ties the bloom to image hover glows, focus rings, etc. — one accent used as light, used everywhere.
3. **Painting a full-viewport gradient is wasteful.** Repainting `inset: 0` with a moving radial-gradient invalidates the whole viewport on every pointer-move. The mockup paints a 720×720px positioned element instead — the browser only redraws that rectangle. Big win on large displays / lower-end machines, and lets you crank up the size or add multiple bloom layers without paying for it.
4. **Spring damping makes it follow too tightly.** `stiffness: 120, damping: 40, mass: 0.5` produces a snappy, near-pointer follow that reads as a UI cursor. A long, eased transition (500ms ease-out on `left/top`) makes the light *trail* like a physical lamp dragged through space. The lag is the metaphor — without it, it's just a colored circle stuck to the pointer.
5. **Gradient falloff is single-stop.** `transparent 70%` produces one ring of dropoff. A multi-stop falloff (`10% at 0%, 3% at 30%, transparent at 60%`) gives a hot core, a long warm midband, and a soft fade — closer to how light actually scatters.
6. **Shape is an ellipse (600×450).** A circle reads more naturally as a point-light source unless the elongation is intentional. The ellipse here looks slightly wrong without context.
7. **Doesn't respect `prefers-reduced-motion`.** Sensitive users get a moving light following their cursor. Easy fix: drop the smoothing/transition under that media query so the bloom either snaps or stays still.

### A sketch of what an improved `CursorBloom.tsx` could look like

Smaller positioned element, screen blend, accent color, long trailing transition, multi-stop falloff, reduced-motion respected, RAF-coalesced. Same Astro island contract — `client:only="react"` + `transition:persist` so it survives navigations.

```tsx
import { useEffect, useRef, useState } from 'react'

const CursorBloom = () => {
  const ref = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(true)

  useEffect(() => {
    const hover = window.matchMedia('(hover: hover)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setEnabled(hover)
    if (!hover) return

    const el = ref.current!
    if (reduced) el.style.transition = 'none'

    let pendingX = window.innerWidth / 2
    let pendingY = window.innerHeight / 2
    let raf = 0
    const flush = () => {
      raf = 0
      el.style.left = pendingX + 'px'
      el.style.top  = pendingY + 'px'
    }
    const onMove = (e: PointerEvent) => {
      pendingX = e.clientX; pendingY = e.clientY
      if (!raf) raf = requestAnimationFrame(flush)
    }
    window.addEventListener('pointermove', onMove)
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  if (!enabled) return null
  return <div ref={ref} className="cursor-bloom" />
}

export default CursorBloom
```

```css
.cursor-bloom {
  position: fixed;
  left: 50%; top: 30%;
  width: 720px; height: 720px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: -1;
  background: radial-gradient(circle,
    var(--accent-bloom-hot)  0%,
    var(--accent-bloom-mid) 30%,
    transparent             60%);
  mix-blend-mode: screen;
  transition: left 500ms ease-out, top 500ms ease-out;
  will-change: left, top;
}
```

Where `--accent-bloom-hot` and `--accent-bloom-mid` are two tints of the site accent at ~10% and ~3% alpha — defined once, reused on every "light" effect across the site.

## Notes for porting the broader hover system

- The bloom and the existing `CustomCursor` should coexist: bloom is the warm light *under* the page (`z-index: -1`); `CustomCursor` is the small UI dot/text *over* it (`z-index` high). Different layers, no conflict.
- The same accent color should be reused for any future focus rings, link underline animations on hover, image-hover glow shadows, etc. — keeping the "accent = light" rule consistent across the site.
- On touch devices `pointermove` works but there's no idle hover — the bloom will jump to wherever the user last tapped. Hide it via `(hover: hover)` matchMedia (the existing component already does this — keep that behavior).
- If the image grid uses `transition:persist` (the persistent shell), make sure the bloom element is also persisted, otherwise it'll be re-created on every navigation and the trailing motion resets.
