# Design Backlog — Photo Portfolio

Living document of editorial improvements for the photo portfolio frontend. Pulled out of the `.claude/plans/` workflow so it survives outside any individual planning session.

---

## Design constraints (non-negotiable)

- **No labels or captions on the homepage thumbnail grid.** The wordless visual experience IS the homepage's purpose. Project metadata stays in the hover-only custom cursor, individual project pages, or dedicated pages (About, Archive). Year markers in the gutter (NOT under thumbnails) are a possible exception worth flagging case-by-case.

---

## Shipped

### #1 Masthead
- `astro/src/components/Masthead.astro` — Bodoni Moda italic name (clamp 2.75rem → 5.5rem), gradient hairline, small-caps "PHOTOGRAPHS · YYYY–YYYY" meta, staggered entry animation
- `astro/src/layouts/Layout.astro` accepts optional `masthead?: { name, yearRange }` prop, renders between TopBar and shell
- `astro/src/pages/index.astro` computes `yearRange` from min/max of `photoProject.date`, passes `masthead={{ name: "Leopold Blum", yearRange }}`
- TopBar adapted: on home (when masthead present) the "LB" mark is hidden and the rule is replaced with a right-anchored gradient-fading line ending at the Instagram link. On project pages, mark + rule + Instagram all return.

### #6 Colophon footer
- `Footer.astro` rewritten: `© LEOPOLD BLUM <year>` on the left, hairline in the middle, `BERLIN` on the right
- Small caps, tracked, neutral-500/40, mirrors TopBar structure
- Footer animation gated behind IntersectionObserver so it only fires when scrolled into view (prevents pre-hydration flash)
- Wrapper `<div class="min-h-[100svh]">` around `PortfolioShell` in `Layout.astro` reserves vertical space so the footer can't appear in the initial viewport during the React hydration window

### #7 Typography swap
- Replaced Space Grotesk with **General Sans** (Fontshare, free) as the body sans
- Bodoni Moda italic stays as the display serif
- `global.css`: `--font-sans` updated, `--font-display` added
- `Layout.astro`: Fontshare `<link>` replaces the Google Fonts Space Grotesk import; Fontshare preconnect added
- `Masthead.astro`: explicit `"Space Grotesk"` reference updated to `"General Sans"`

### #8 Coordinated curtain rise
Coordinated entry timeline on home (replays when returning from a project page):
- 0.00s — TopBar mark fades in
- 0.15s — TopBar rule draws
- 0.30s — "Leopold Blum" fades up
- 0.40s — Instagram link fades in
- 0.55s — Masthead hairline draws
- 0.65s — em-dash appears
- 0.80s — `PHOTOGRAPHS · YYYY–YYYY` meta fades in
- 0.95s — first grid row begins its rise; subsequent rows scroll-reveal as before

`ScrollReveal` extended with optional `delay` prop so only the first project gets the masthead-coordinated wait.

### #10 Scroll-driven masthead → mark crossfade
- TopBar's `showMark` boolean replaced with `markBehavior?: 'visible' | 'reveal-on-scroll'`
- On home: LB mark renders structurally in top-left at opacity 0; IntersectionObserver on `#masthead` toggles `.is-revealed` once the masthead is ~40px above the viewport, fading the mark in over 450ms
- On project pages: mark always visible, no observer attached
- `prefers-reduced-motion: reduce` skips the transition; `pointer-events: none` while invisible

---

## Active (in its own plan file)

### #5 Archive subpage
New `/archive` route showing every project from the `PhotoProjects` collection sorted newest-first, with year markers in the left gutter. Homepage stays curated (current `WebsiteLayout` becomes the "featured" set). Pure Astro, no React shell. New "Archive" link in TopBar before Instagram.

See `.claude/plans/melodic-seeking-zebra.md` for full plan.

---

## Remaining backlog (deferred)

### #3 Wire the unused `siteDescription`
`index.astro` line 14 fetches `siteDescription` and discards it. Pull it into the masthead (or a new line below it) as a one-sentence artist statement, set in italic serif.

### #4 About / Statement page + nav cluster
New `pages/about.astro` — single column of editorial typography. Drop-cap intro, 200–400 words bio, contact, locations. Add to TopBar nav cluster alongside the new Archive link.

### #9 Cursor preview thumbnail
On hover over a project, show the project's `tinyPreview` next to the cursor. Image already loaded for color extraction, so ~free. Extends `CustomCursor.tsx`.

---

## Removed from roadmap

- **#2 Static project captions** — explicitly rejected. Visible labels under thumbnails undermine the wordless visual experience.

## Out of scope

- More particles, glows, or shaders (atmosphere layer is at its ceiling)
- Horizontal scroll, view-mode toggles, tag filters, video reels

---

## Open questions / known issues

- **Footer flash on slow loads (Firefox especially)** — root cause is the `client:only` PortfolioShell creating an empty hydration window. Mitigated by IntersectionObserver-gated footer animation + `min-h-[100svh]` wrapper around PortfolioShell. Verify on Firefox after each significant change.
- **Static vs CMS-backed hosting** — discussed, deferred. Static deploy improves load speed but does not eliminate the hydration window because PortfolioShell remains `client:only="react"`. Eliminating the hydration window cleanly would require refactoring the home view into server-rendered Astro markup with React only attached for interactivity. Non-trivial, not urgent.

---

## Potential future ideas (raised but not committed)

- **First-load coordination across grid + atmosphere** — the curtain rise currently coordinates TopBar + Masthead + first grid row but doesn't sync with AmbientBackground / starfield startup. Could be tightened.
- **Project page editorial treatment** — mostly untouched. A small text panel with project title/date/location/EXIF could live in the carousel without violating the no-grid-labels constraint (it's the project page, not the home grid).
- **Print stylesheet** — for editorial sites, a `@media print` style that produces a clean black-on-white index is a nice flex.
