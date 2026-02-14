# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photography portfolio website with two independent sub-projects (no monorepo workspaces). Each has its own `CLAUDE.md` with detailed commands and architecture:

- **`astro/`** — Public frontend: Astro 5 + React 19 + Tailwind CSS 4 + Framer Motion
- **`photo-cms/`** — Backend CMS: Payload CMS 3 + Next.js 15 + MongoDB

Package manager is **npm** (not pnpm). Each sub-project has its own `package.json` and `package-lock.json`. Install dependencies and run commands from within each directory.

## Cross-Project Architecture

### Data Flow

1. **Payload CMS** (`localhost:3000`) serves a REST API backed by MongoDB (container `photoDB`, managed via Podman)
2. **Astro frontend** (`localhost:4321`) fetches from Payload's REST API at build/request time
3. The `WebsiteLayout` global defines which `PhotoProject` entries appear on the homepage and their order
4. Each `PhotoProject` contains its metadata (title, date, slug) and `Media` images (with thumbnail flags) in a single collection
5. Project detail pages (`/projects/[projectSlug]`) render image carousels

### Type Sharing

The Astro frontend imports types directly from the CMS via relative filesystem paths (`../../../photo-cms/src/types/apiTypes`). These are manually maintained — keep them in sync when changing CMS collections. Separately, `payload-types.ts` is auto-generated (`npm run generate:types`) and should not be edited manually.

### Image Pipeline

Media uploads are processed by Sharp into 5 responsive WebP sizes: `tinyPreview` (50w, blur placeholder), `small` (800w), `res1080` (1920w), `res1440` (2560w), `res4k` (3840w) — all at 85% quality. The frontend builds `srcSet` from these.
