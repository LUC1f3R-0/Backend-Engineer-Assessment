# Mo LK Assessment

Nx monorepo with a **NestJS** API (`apps/backend`) and a **React + Vite** SPA (`apps/frontend`). PostgreSQL stores data; **Firebase Cloud Messaging** is used for web push (client SDK + Admin SDK on the server).

## Clone the repository

This project’s GitHub remote is `https://github.com/LUC1f3R-0/Backend-Engineer-Assessment`. If you use a fork, clone from **your** fork’s URL instead.

- **HTTPS** — works everywhere; Git will prompt for credentials (on GitHub, use a [personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) instead of a password when asked):

  ```sh
  git clone https://github.com/LUC1f3R-0/Backend-Engineer-Assessment.git
  cd Backend-Engineer-Assessment
  ```

- **SSH** — no password prompt if your [SSH key is added to GitHub](https://docs.github.com/en/authentication/connecting-to-github-with-ssh):

  ```sh
  git clone git@github.com:LUC1f3R-0/Backend-Engineer-Assessment.git
  cd Backend-Engineer-Assessment
  ```

- **GitHub CLI** (if you use `gh` and are logged in):

  ```sh
  gh repo clone LUC1f3R-0/Backend-Engineer-Assessment
  cd Backend-Engineer-Assessment
  ```

- **ZIP (no Git):** On the GitHub repo page, use **Code → Download ZIP**, extract it, `cd` into the folder, then run `npm install` as below. You will not have Git history unless you `git init` and add a remote yourself.

## Prerequisites

- **Node.js** (LTS) and npm  
- **PostgreSQL** reachable from your machine  
- A **Firebase** project if you use push notifications (optional for a minimal API-only run)

## Install

From the repository root:

```sh
npm install
```

## Build commands

Run these from the **repository root** (after `npm install`).

| What | Command | Output / notes |
|------|---------|----------------|
| **Backend** (NestJS, webpack) | `npx nx build backend` | `dist/apps/backend/` — compiled API (`main.js`, etc.). |
| **Frontend** (Vite production bundle) | `npx nx build frontend` | `dist/apps/frontend/` — static assets for hosting. |
| **Root npm script** | `npm run build` | Same as `npx nx build backend` only (see `package.json`). To ship the full stack, build **both** apps with the two Nx commands above. |

**After a backend build — run the API without Nx:**

```sh
npm run start:prod
```

Uses `node dist/apps/backend/main.js`. Set the same env vars you use in development (or configure the host). Ensure migrations have been applied against the target database.

**After a frontend build — preview the static bundle locally:**

```sh
npx nx preview frontend
```

Serves `dist/apps/frontend` (default port **4200** in this repo’s Vite config).

## Backend (`apps/backend`)

### Assumptions

- PostgreSQL is running and you can create a database (default name below).
- The API listens on **port 8080** by default (same as `PORT` in `.env`).

### Decisions

- **NestJS** with **TypeORM** and **PostgreSQL** for persistence.
- **Firebase Admin** sends FCM messages; credentials come from env (service account).
- **API key** auth: clients send `x-api-key`; if `X_API_KEY` is unset in env, the server rejects protected routes (set it for local dev).

### Notifications (FCM) — how it works

There is **no** separate `/notifications` CRUD API. Push notifications are implemented as follows:

1. **Device session** — `GET /api/devices/session` establishes an anonymous device id (HttpOnly cookies).
2. **FCM registration token** — the client sends the token to `PUT /api/devices/push-token` (or the legacy device-scoped routes under `/api/devices/...`).
3. **Order placement** — `POST /api/orders` persists the order; on success the server calls **`FcmService.sendOrderPlacedNotification`** (`apps/backend/src/modules/notifications/fcm.service.ts`), which uses **Firebase Admin** to send a web push when credentials and a stored token exist.

So **notifications** are delivered via **FCM** and wired from the **orders** flow, not via a dedicated notifications resource.

### Logging

Successful responses emit **structured JSON** lines to stdout from `LoggingInterceptor` (`level`, `type: http_request`, `method`, `path`, `url`, `statusCode`, `durationMs`, `timestamp`). Errors emit **structured JSON** from `HttpExceptionFilter` (`type: http_error`, same routing fields, `message`, and `stack` only for server-side failures). Suitable for ingestion by Cloud Logging or any log aggregator.

### Environment file

1. Copy the example file:

   ```sh
   cp apps/backend/.env.example apps/backend/.env
   ```

2. Edit `apps/backend/.env`:

   | Variable | What to put |
   |----------|-------------|
   | `NODE_ENV` | `development` locally. |
   | `PORT` | API port (default `8080`). |
   | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | Your PostgreSQL connection. Default database name in the example is `mo_lk_assessment` — create it if it does not exist. |
   | `X_API_KEY` | Secret string the frontend (or tools) send as the `x-api-key` header. **Required** for normal API use. |
   | `FIREBASE_PROJECT_ID` | Firebase project ID (Console → Project settings). |
   | `FIREBASE_CLIENT_EMAIL` | Service account email (JSON key from Firebase / GCP IAM). |
   | `FIREBASE_PRIVATE_KEY` | Private key from the same JSON. Paste as one line; use `\n` where the key has line breaks (the app converts `\n` to real newlines). |
   | `SWAGGER_ENABLED` | Set to **`true`** to turn on **Swagger UI** for interactive API testing. Any other value or omitting it keeps Swagger **off** (no docs route). |

   Optional (see `apps/backend/src/config/app.config.ts` if you need them): `CORS_ORIGINS` (comma-separated; `http://localhost:4200` is always allowed), cookie-related `DEVICE_COOKIE_*` for production-style cookies.

### Swagger (test the API in the browser)

Swagger is **only** available when **`SWAGGER_ENABLED=true`** in `apps/backend/.env`. Restart the server after changing it.

With the default port, open **`http://localhost:8080/api/docs`** (replace the port if `PORT` is different). In Swagger UI, use **Authorize**, set the **`x-api-key`** header to the same value as `X_API_KEY`, then you can execute requests against the API from the UI.

**API documentation:** Interactive docs are available via **Swagger UI** when enabled (above). This repository does **not** include a Postman collection; you can import the OpenAPI document from Swagger or call the REST endpoints directly.

### Run migrations and seed (first time)

```sh
npm run migration:run
npm run seed:run
```

### Build the API

```sh
npx nx build backend
```

### Start the API (dev)

```sh
npx nx serve backend
```

---

## Frontend (`apps/frontend`)

### Assumptions

- The backend is running and reachable at the URL you set in `VITE_BACKEND_URL` (default `http://localhost:8080`).
- Dev server uses **port 4200** (see `vite.config.mts`).

### Decisions

- **Vite + React**; env vars exposed to the client must be prefixed with `VITE_`.
- **Firebase client** config powers in-app messaging; **VAPID** is used for web push. The Vite build can generate `public/firebase-messaging-sw.js` when the Firebase env vars are set.

### Environment file

1. Copy the example file:

   ```sh
   cp apps/frontend/.env.example apps/frontend/.env
   ```

2. Edit `apps/frontend/.env`:

   | Variable | What to put |
   |----------|-------------|
   | `VITE_BACKEND_URL` | Base URL of the API (e.g. `http://localhost:8080`). No trailing slash needed for typical use. |
   | `VITE_X_API_KEY` | Same value as backend `X_API_KEY` so the SPA can call the API. |
   | `VITE_FIREBASE_*` | From Firebase Console → Project settings → Your apps → Web app config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId). |
   | `VITE_FIREBASE_VAPID_KEY` | Firebase Console → Cloud Messaging → **Web Push certificates** → Key pair. |

   If Firebase keys are missing, the app may still run for non-push flows; the service worker snippet is skipped until the core Firebase web config is complete.

### Build the SPA

```sh
npx nx build frontend
```

### Start the SPA (dev)

```sh
npx nx dev frontend
```

Open `http://localhost:4200`.

---

## Useful Nx commands

```sh
npx nx graph              # dependency graph
npx nx run backend:test
npx nx run frontend:test
```

Root `package.json` also defines `migration:*`, `seed:run`, `build` (backend only), and `start:prod` (backend).

---

## Demo video (simple instruction walkthrough)

A short screen recording that walks through setup and basic usage is available on Google Drive:

**[Open instruction video (Google Drive)](https://drive.google.com/file/d/1Q4Usmfp5gNzrBg4V5tSRA8hFYhU-FZgi/view?usp=drivesdk)**

If the link asks you to sign in, the file may be restricted—use **Request access** or share the file with reviewers as needed.

Suggested topics covered (or to follow along yourself): clone → `npm install` → configure `.env` → `npm run migration:run` / `npm run seed:run` → start backend → optional Swagger walkthrough → place an order.

---

## Public deployment URL

This repository **does not** ship a guaranteed public API URL. Run the API **locally** or deploy using the root **`Dockerfile`** and **[docs/gcp-deployment.md](docs/gcp-deployment.md)**. If you deploy Cloud Run (or similar), add your own **stable URL** in your submission cover letter or demo notes—do not commit secrets or environment-specific URLs here unless you intend to maintain them.

---

## GCP deployment

Step-by-step deployment on Google Cloud (Cloud SQL, Secret Manager, Cloud Run, Cloud Build) is documented in **[docs/gcp-deployment.md](docs/gcp-deployment.md)**.

