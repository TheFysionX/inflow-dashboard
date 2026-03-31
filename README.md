# Inflow Dashboard

React + Vite starter project for the dashboard that can later be deployed to `dashboard.inflow.net`.

## Local development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Because the dev server runs on `0.0.0.0`, you can also test it from another device on the same network using your computer's local IP address on port `3000`.

## Production build

Create the deployable build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Publishing on dashboard.inflow.net

Recommended setup:

1. Host this app separately from the main Framer site.
2. Deploy the `dist` output to a static host such as Vercel, Netlify, or Cloudflare Pages.
3. In your DNS provider, create a `CNAME` record for `dashboard.inflow.net` pointing to that host.
4. Add `dashboard.inflow.net` as a custom domain in the hosting platform.

This keeps the dashboard independent from the Framer site at `inflow.net` while still using the same root domain.

## Public previews while building

If you want to share work-in-progress before deploying production:

- Use deployment previews from your hosting platform.
- Or expose local development temporarily with a tunnel service such as Cloudflare Tunnel.

That gives you a public URL during development without needing to put unfinished work on the live subdomain.
