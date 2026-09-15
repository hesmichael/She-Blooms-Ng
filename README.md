# SheBlooms

SheBlooms is a community and experiences platform for women in Abuja, Nigeria, founded for women 30+. The website creates room for women to keep learning, connecting, experiencing and enjoying more of life.

## What is included

- A welcoming home page with the SheBlooms story and upcoming activities
- Community information, FAQs, gallery and contact pages
- Events and event registration flows
- SheBlooms Conference information and registration
- Books and curated reading content
- Membership sign-up and member dashboard experiences
- Cookie preferences, privacy, terms and accessibility-minded navigation

The frontend is built with React, TypeScript, Vite, Tailwind CSS and Lucide icons. The existing local application also includes an Express server and Convex integration for events, authentication, registrations and other API-backed features.

## Local development

**Prerequisites:** Node.js 20 or newer

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and configure the services required by the server. `VITE_CONVEX_URL` is exposed to the client at build time.
3. Start the full local application:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000`.

## Production builds

Build and preview the Vite client locally:

```bash
npm run build:netlify
npm run preview
```

Build the full Express-backed application:

```bash
npm run build
npm start
```

## Netlify deployment

This repository includes `netlify.toml`. Netlify should use:

- Build command: `npm run build:netlify`
- Publish directory: `dist`
- Node version: 20

The SPA fallback is configured so direct links such as `/events`, `/join` and `/conference` load correctly. Set `VITE_CONVEX_URL` in Netlify environment variables when using a Convex deployment.

The Netlify configuration publishes the React frontend. The `/api/*` endpoints used for authentication, event registration, contact forms and newsletter submissions still require the Express server (or equivalent Netlify Functions) to be deployed and connected separately. The local full-stack command remains available for that server runtime.
