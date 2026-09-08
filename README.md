# eCommerceX

Learning full-stack store: a customer shop and an admin console that share one catalog API.

The storefront lists products by department, handles cart and checkout, and shows order history. The console manages products (including Cloudinary uploads), categories, orders, and users.

## Architecture

```
Next.js store + admin UI  :3000
            │
            ▼  /api/v1
Express API               :4000
            │
            ▼
MongoDB                   :27017
```

- **Store** — `/` catalog, product pages, bag, checkout, orders  
- **Admin** — `/admin` dashboard, catalog, fulfillment, accounts  
- **API** — `/api/v1/store/*` and `/api/v1/admin/*`  
- **Health** — `GET /health` (no prefix)

## Tech stack

| Layer | Stack |
| --- | --- |
| Store + admin UI | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui (Base UI), Lucide |
| API | Node.js, Express 5, TypeScript, Zod, JWT, bcryptjs, Morgan, CORS |
| Data | MongoDB 7, Mongoose 9 |
| Media | Cloudinary (signed browser uploads) |
| Run | Docker Compose (`db` + `api`), or local `npm` / `yarn` against published Mongo |

## Features

**Store**

- Register / login (customer JWT)
- Department catalog (two-level categories)
- Product gallery, bag, checkout with address snapshot
- Order history with line-item photos

**Admin**

- Admin-only JWT console
- Dashboard totals, pipeline, low-stock
- Product CRUD, Cloudinary image upload
- Store settings (name, tagline, announcement, logo, favicon)
- Categories, order status / payment, users

## Prerequisites

- Node.js 20+
- Docker Desktop (Mongo, or Mongo + API)
- Optional: a [Cloudinary](https://console.cloudinary.com) account for product photo uploads

## Quick start (Docker API + local UI)

1. Copy env files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

2. Set `JWT_SECRET` (16+ characters) in `backend/.env`. Add Cloudinary keys if you want uploads.

3. Start Mongo and the API:

```bash
docker compose up -d --build
```

4. On boot the API runs [migrate-mongo](https://github.com/seppevs/migrate-mongo) (`changelog` collection). The first two scripts create store settings and the demo catalog.

To wipe and reseed:

```bash
docker compose exec api node dist/scripts/seed.js
```

5. Run the UI on the host:

```bash
cd frontend
yarn install   # or npm install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The UI calls [http://localhost:4000/api/v1](http://localhost:4000/api/v1).

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@ecommercex.local` | `Admin123!` |
| Customer | `customer@ecommercex.local` | `Customer123!` |

## Local development (API on the host)

Use this when you want `tsx watch` and a debugger. Compose still provides Mongo.

```bash
docker compose up -d db

cd backend
npm install
# MONGODB_URI=mongodb://127.0.0.1:27017/ecommercex
npm run dev
npm run seed
```

```bash
cd frontend
yarn dev
```

| Script | What it does |
| --- | --- |
| `backend`: `npm run dev` | API with reload on `:4000` |
| `backend`: `npm test` | Unit tests (Vitest) |
| `backend`: `npm run test:docker` | Same suite inside the Compose `api-test` image |
| `backend`: `npm run migrate` | Apply pending migrate-mongo scripts |
| `backend`: `npm run migrate:status` | Show applied / pending files |
| `backend`: `npm run migrate:create -- add_index` | Scaffold a new migration |
| `backend`: `npm run seed` | Wipe catalog and insert demo data |
| `backend`: `npm run db:up` | Start only the `db` service |
| `backend`: `npm run compose:up` | Build and start `db` + `api` |
| `frontend`: `yarn dev` | Next.js on `:3000` |

## Docker services

| Service | Image / build | Port | Notes |
| --- | --- | --- | --- |
| `db` | `mongo:7` | 27017 | Volume `ecommercex_mongo` |
| `api-test` | `backend/Dockerfile` target `test` | — | Runs Vitest. `api` waits until this exits 0. |
| `api` | `backend/Dockerfile` target `runner` | 4000 | Waits for `api-test` and a healthy Mongo. `MONGODB_URI` is `mongodb://db:27017/ecommercex` |

```bash
docker compose up -d --build    # api-test, then db + api
docker compose run --rm api-test
docker compose logs -f api
docker compose exec api node dist/scripts/seed.js
docker compose down             # keep the Mongo volume
docker compose down -v          # wipe the database volume
```

The API container reads `backend/.env` for JWT (file is not committed). Cloudinary is declared on the `api` service and interpolated from a root `.env` or `docker compose --env-file backend/.env`. Mongo is always `mongodb://db:27017/ecommercex`.

```bash
cp .env.example .env   # fill Cloudinary keys, do not commit
docker compose --env-file backend/.env up -d --build
```

## Environment

**`backend/.env`**

| Variable | Purpose |
| --- | --- |
| `PORT` | API port (default `4000`) |
| `MONGODB_URI` | Host dev: `mongodb://127.0.0.1:27017/ecommercex`. Compose overrides this. |
| `JWT_SECRET` | Access-token signing key (min 16 chars) |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CORS_ORIGIN` | Comma-separated UI origins |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary product environment name |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Upload signing (keep secret on the server) |
| `CLOUDINARY_FOLDER` | Upload folder (default `ecommercex/products`) |

**`frontend/.env.local`**

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | API base, including `/api/v1` |

## API map

| Prefix | Audience |
| --- | --- |
| `GET /health` | Liveness |
| `/api/v1/store/auth`, `/categories`, `/products`, `/cart`, `/orders`, `/settings` | Customers |
| `/api/v1/admin/auth`, `/dashboard`, `/settings`, `/products`, `/categories`, `/orders`, `/users`, `/uploads` | Admins |

## Project layout

```
eCommerceX/
├── docker-compose.yml
├── backend/                 Express + Mongoose API
│   ├── migrate-mongo-config.js
│   ├── src/migrations/      migrate-mongo up/down scripts
│   ├── src/models/          User, Category, Product, Cart, Order, Settings
│   ├── src/modules/         route → controller → service
│   └── src/scripts/         migrate.ts, seed.ts
└── frontend/                Next.js store (`app/(store)`) + admin (`app/admin`)
```

The API runs pending [migrate-mongo](https://github.com/seppevs/migrate-mongo) scripts on startup. Applied files are stored in the `changelog` collection.

```bash
cd backend
npm run migrate:create -- add-order-index
# edit src/migrations/<timestamp>-add-order-index.ts
npm run migrate
```

`npm run seed` still **deletes** users, categories, products, carts, and orders, then inserts the demo catalog. Sign in again after a reseed.
