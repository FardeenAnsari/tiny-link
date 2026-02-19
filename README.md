# TinyLink — Simple URL Shortener

A self-hosted, minimal URL shortener built with **Next.js 16**, **Prisma 7**, and **PostgreSQL**. Create short links, track clicks, and manage everything from a clean dashboard — no external analytics services required.

---

## Features

- **Shorten URLs** — Paste any long URL and get a short `/<code>` link back instantly.
- **Custom Short Codes** — Optionally choose your own 6-8 character alphanumeric code.
- **Click Tracking** — Every redirect increments a counter and records the last-clicked timestamp.
- **Dashboard** — Server-rendered overview showing total links, total clicks, and per-link average.
- **Per-Link Analytics Page** — Visit `/code/<code>` to see detailed stats for any link.
- **Copy to Clipboard** — One-click copy buttons for both short and target URLs.
- **Soft Delete** — Links are marked as deleted rather than removed, preserving data integrity.
- **Health Check Endpoint** — `/healthz` reports app uptime and database connectivity.
- **Dark/Light Theme** — Powered by `next-themes` with system preference detection.
- **Docker Ready** — Ship the whole stack with a single `docker compose up`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router, React 19) |
| **Language** | TypeScript |
| **Database** | PostgreSQL 15 |
| **ORM** | [Prisma 7](https://www.prisma.io) with `@prisma/adapter-pg` (native `pg` driver) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com) (Radix UI + Tailwind CSS 4) |
| **Data Table** | [TanStack Table v8](https://tanstack.com/table) |
| **Forms** | React Hook Form + Zod validation |
| **ID Generation** | [nanoid](https://github.com/ai/nanoid) (custom alphabet, 6-8 chars) |
| **Notifications** | [Sonner](https://sonner.emilkowal.dev) toast library |
| **Data Fetching** | SWR (client-side), Server Components (SSR) |
| **Styling** | Tailwind CSS 4 + `tw-animate-css` |
| **Fonts** | [Geist & Geist Mono](https://vercel.com/font) via `next/font` |
| **Containerization** | Docker (multi-stage build) + Docker Compose |

---

## Project Structure

```
tiny-link/
├── app/
│   ├── layout.tsx                 # Root layout (fonts, metadata, Toaster)
│   ├── page.tsx                   # Dashboard — lists all links with stats
│   ├── globals.css                # Tailwind CSS entry point
│   ├── [code]/
│   │   └── page.tsx               # Redirect handler — increments clicks & redirects
│   ├── code/
│   │   └── [code]/
│   │       └── page.tsx           # Per-link analytics page
│   ├── api/
│   │   └── links/
│   │       ├── route.ts           # GET all links, POST create new link
│   │       └── [code]/
│   │           └── route.ts       # GET link by code, DELETE (soft) link
│   ├── healthz/
│   │   └── route.ts               # Health check endpoint
│   └── generated/
│       └── prisma/                # Auto-generated Prisma client
├── components/
│   ├── dashboard/
│   │   ├── columns.tsx            # TanStack Table column definitions
│   │   ├── dashboard-header.tsx   # Dashboard page header
│   │   ├── dashboard-table-header.tsx  # "New Link" dialog + table header
│   │   └── data-table.tsx         # Generic data table component
│   ├── link/
│   │   └── CopyButtonClient.tsx   # Clipboard copy button
│   └── ui/                        # shadcn/ui primitives (button, dialog, form, etc.)
├── lib/
│   ├── prisma.ts                  # Prisma client singleton (pg adapter)
│   ├── date.ts                    # UTC date formatting helpers
│   └── utils.ts                   # Utility functions (cn)
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # SQL migration files
├── docker-compose.yml             # Full-stack Docker Compose setup
├── dockerfile                     # Multi-stage Docker build
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## Database Schema

**Prisma 7** is used with the **adapter pattern** (`@prisma/adapter-pg`), which means:
- No `url` property in `schema.prisma` — the database connection is configured directly in the client (see `lib/prisma.ts`)
- The `DATABASE_URL` is passed through the PostgreSQL adapter at runtime
- No `prisma.config.ts` file is needed for this configuration

A single `Link` model stores everything:

```prisma
model Link {
  id           Int       @id @default(autoincrement())
  code         String    @unique        // short code (e.g. "aBcD12")
  targetUrl    String                   // original long URL
  clickCount   Int       @default(0)    // total redirect count
  lstClickedAt DateTime?               // last click timestamp
  createdAt    DateTime  @default(now())
  deleted      Boolean   @default(false) // soft delete flag
}
```

---

## API Reference

### `GET /api/links`

Returns all links with their metadata.

**Response:**
```json
{
  "linksCount": 42,
  "links": [
    {
      "id": 1,
      "code": "aBcD12",
      "targetUrl": "https://example.com/long-url",
      "clickCount": 137,
      "lstClickedAt": "2025-12-01T10:30:00.000Z",
      "createdAt": "2025-11-24T18:09:41.000Z"
    }
  ]
}
```

### `POST /api/links`

Create a new shortened link.

**Body:**
```json
{
  "targetUrl": "https://example.com/my-long-url",
  "code": "myCode1"  // optional, 6-8 alphanumeric chars
}
```

**Responses:**
- `201` — Link created successfully.
- `400` — Invalid URL or code format.
- `409` — Custom code already exists.
- `503` — Could not generate a unique code (retry).

### `GET /api/links/:code`

Fetch metadata for a specific link by its short code.

### `DELETE /api/links/:code`

Soft-delete a link (sets `deleted: true`). The link will no longer redirect.

### `GET /:code`

**The redirect endpoint.** When a user visits a short link, this page:
1. Looks up the code in the database.
2. Increments `clickCount` and updates `lstClickedAt`.
3. Issues a server-side redirect to `targetUrl`.
4. Returns 404 if the code doesn't exist or is deleted.

### `GET /healthz`

Returns application health status including uptime and database connectivity.

**Response:**
```json
{
  "ok": true,
  "version": "1.0",
  "uptime": "2 days, 3 hours, 15 minutes",
  "db": { "ok": true }
}
```

---

## Getting Started

### Prerequisites

- **Node.js** 24+ (or 20+ for local dev)
- **PostgreSQL** 15+
- **npm** (or your preferred package manager)

### 1. Clone the repository

```bash
git clone https://github.com/FardeenAnsari/tiny-link.git
cd tiny-link
```

### 2. Install dependencies

```bash
npm install
```

This also runs `prisma generate` automatically via the `postinstall` script.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/tiny_link"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_BASE_URL` | Public base URL used to construct short link URLs |

### 4. Set up the database

```bash
npx prisma migrate deploy
```

Or for development (creates & applies migrations interactively):

```bash
npx prisma migrate dev
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the dashboard.

---

## Docker Deployment

The project includes a ready-to-use Docker Compose setup that runs both the app and PostgreSQL.

### Quick start

```bash
docker compose up -d
```

This will:
- Build the TinyLink application image
- Start a PostgreSQL 15 container with persistent storage
- Expose the app on port **3000** and Postgres on port **5432**

### Building the image locally

```bash
docker build -t tiny-link .
```

The Dockerfile uses a **multi-stage build**:
1. **Builder stage** — Installs dependencies, generates the Prisma client, and builds the Next.js app.
2. **Runner stage** — Copies the built app into a clean Node.js Alpine image for a smaller footprint.

### Environment variables (Docker)

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgres://postgres:postgres@db:5432/tiny_link` | Connection string pointing to the Compose `db` service |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` | Public URL for generating short links |

---

## How It Works

### Link Creation Flow

1. User clicks **"New Link"** on the dashboard → opens a dialog form.
2. Form validates the target URL (must be a valid URL) and optional custom code (6-8 alphanumeric chars) using **Zod**.
3. Submits a `POST /api/links` request.
4. If no custom code is provided, the server generates one using **nanoid** with a custom alphanumeric alphabet (length 6-8), retrying up to 10 times to ensure uniqueness.
5. The new link record is stored in PostgreSQL via Prisma.

### Redirect Flow

1. A visitor hits `/<code>` (e.g., `https://yourdomain.com/aBcD12`).
2. The `app/[code]/page.tsx` server component looks up the code.
3. If found and not deleted, it increments `clickCount`, sets `lstClickedAt`, and performs a **server-side redirect** to the target URL.
4. If not found or soft-deleted, it returns a **404** page.

### Dashboard

- The main page (`app/page.tsx`) is a **server component** that queries all non-deleted links directly via Prisma.
- Displays three stat cards: **Total Links**, **Total Clicks**, and **Average Clicks**.
- Below the stats, a **TanStack Table** lists all links with sortable columns, copy actions, analytics links, and delete confirmation dialogs.
- Marked as `force-dynamic` to always show fresh data.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create an optimized production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma migrate dev` | Create/apply database migrations (dev) |
| `npx prisma migrate deploy` | Apply migrations (production) |
| `npx prisma generate` | Regenerate the Prisma client |
| `npx prisma studio` | Open Prisma Studio (database GUI) |

---

## License

This project is open source. See the repository for license details.
