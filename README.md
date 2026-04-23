# Heavenzy SMS

A beautiful PWA for renting temporary phone numbers and receiving SMS verification codes, powered by the [DiddySMS API](https://api.diddysms.com/v1).

## Features

- **Dashboard** — Balance overview, active rentals, codes received
- **Services** — Browse all available services, rent a number with one click
- **Orders** — Manage your orders, auto-polls for SMS codes every 5s, copy codes/numbers
- **Transactions** — Full transaction history with totals
- **PWA** — Installable on mobile and desktop, works offline
- **Secure** — API key stored in localStorage only, proxied server-side (no CORS issues)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/heavenzysms.git
cd heavenzysms
npm install
```

### 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Get a DiddySMS API Key

1. Open the [DiddySMS Telegram Bot](https://t.me/DiddySMSBot)
2. Send the `/apikey` command or go to **Profile → API Key**
3. Copy the key (starts with `dsk_`, 52 chars)

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

### Option B — GitHub Integration

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repo
4. Click **Deploy** — no environment variables needed

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** icons
- **PWA** via custom service worker

## Project Structure

```
src/
├── app/
│   ├── api/proxy/[...path]/route.ts  # Server-side API proxy
│   ├── layout.tsx
│   ├── page.tsx                       # Main app shell
│   └── globals.css
├── components/
│   ├── ApiKeyModal.tsx
│   ├── Dashboard.tsx
│   ├── Services.tsx
│   ├── Orders.tsx
│   └── Transactions.tsx
└── lib/
    └── api.ts                         # Typed API client
public/
├── manifest.json                      # PWA manifest
├── sw.js                              # Service worker
└── icons/                             # App icons
```

## License

MIT
