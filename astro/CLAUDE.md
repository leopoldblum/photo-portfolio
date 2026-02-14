# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this directory.

## Commands

```bash
npm run dev      # Dev server on localhost:4321
npm run build    # Production build to ./dist/
npm run preview  # Preview production build
```

No linter or test runner is configured for this sub-project.

## Architecture

### Data Fetching

Astro pages fetch from the Payload CMS REST API (`PUBLIC_API_URL`, default `http://localhost:3000`). The CMS must be running for dev/build to work.

- **Homepage** (`pages/index.astro`): Fetches `WebsiteLayout` global → iterates `photoProjects` → renders `ImageDisplay` per PhotoProject
- **Project pages** (`pages/projects/[projectSlug].astro`): Uses `getStaticPaths()` from the same `WebsiteLayout` data, passes each `photoProject` as props to `ImageCarouselWithModal`

All API calls happen in Astro frontmatter (server-side). Use `import.meta.env.PUBLIC_API_URL` for the CMS base URL.

### Type Imports

Types are imported directly from the CMS via relative filesystem paths:
```ts
import type { WebsiteLayout } from "../../../photo-cms/src/types/apiTypes";
```
These types (`Image`, `AvailableSizes`, `ImageWrapper`, `PhotoProject`, `PhotoProjectWrapper`, `WebsiteLayout`) are manually maintained in the CMS — not auto-generated. Keep them in sync when changing CMS collections.

### Component Pattern: Astro Islands

- `.astro` files handle layout and data fetching (server-side)
- React components (`.tsx`) are used for interactive elements, mounted via `client:load` or `client:only="react"`
- `client:only` is used for components that rely on browser APIs (e.g., `ImageCarouselWithModal` needs `window` dimensions)

### Key Components

- **`ImageDisplay.tsx`** — Thumbnail grid for the homepage; renders clickable images that link to project pages
- **`ImageCarouselWithModal.tsx`** — Project page carousel with fullscreen modal; wraps `ImageCarouselReact`
- **`ImageCarouselReact.tsx`** — Framer Motion animated carousel with swipe/arrow navigation
- **`CustomCursor.tsx`** — Custom animated cursor; uses `CustomEvent` dispatching for cross-component communication (`CustomCursor.setCursorType()` static method)

### Image Utilities (`src/util/imageUtil.tsx`)

- `getImageSrcSet()` — Builds a full `srcSet` string from all available image sizes
- `getImageURLForGivenWidth()` — Picks the best image size for a given viewport width and scale factor
- `getAllURLs()` — Returns all available size URLs for preloading
- Image sizes: `tinyPreview` (50w, blur placeholder), `small` (800w), `res1080` (1920w), `res1440` (2560w), `res4k` (3840w)

### Styling

Tailwind CSS 4 via `@tailwindcss/vite` plugin (configured in `astro.config.mjs`). Global styles in `src/styles/global.css`.

## Environment Variables (`astro/.env`)

- `PUBLIC_API_URL` — Payload CMS base URL (default: `http://localhost:3000`)
- `PUBLIC_BASE_URL` — This site's base URL (default: `http://localhost:4321`)
