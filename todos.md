# Todos

## Frontend (Astro)

### SEO
- [ ] Add meta descriptions to all pages (home, project detail)
- [ ] Add Open Graph tags (og:title, og:description, og:image) for social sharing
- [ ] Add Twitter Card meta tags
- [ ] Generate a sitemap (Astro has `@astrojs/sitemap` integration)
- [ ] Add canonical URLs to all pages
- [ ] Add structured data (JSON-LD) for the portfolio / image gallery

### Page Transitions
- [x] Add Astro View Transitions for smooth navigation between home and project pages

### About/Contact Page
- [ ] Design and build an about/contact page (pending content and design direction)

## CMS (Payload)

### Access Control
- [ ] Add explicit `create` / `update` / `delete` access restrictions to `Media` collection
- [ ] Add explicit `create` / `update` / `delete` access restrictions to `PhotoProjects` collection
- [ ] Add explicit `update` access restriction to `WebsiteLayout` global
- [ ] Add access control to `Users` collection (prevent unauthenticated account creation)

### Deployment
- [ ] Create Dockerfile / docker-compose for Payload CMS
- [ ] Configure Dokploy deployment on Hetzner VPS
- [ ] Set up production environment variables (DATABASE_URI, PAYLOAD_SECRET)
- [ ] Set up persistent volume for media uploads
