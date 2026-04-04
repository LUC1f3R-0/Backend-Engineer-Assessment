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

## GCP Deployment Setup

This section describes how this project is deployed on **Google Cloud Platform (GCP)**, including **Cloud SQL** (PostgreSQL), **Secret Manager**, **Cloud Build**, and **Cloud Run**.

### 1. Create the GCP Project

A dedicated GCP project was created to host this application. For example, the project **display name** may be set to **`mo lk project deploment`** (you may use another display name if you prefer).

> **Note:** The **project display name** can be changed later in the Google Cloud Console. The **project ID**, however, is effectively permanent once assigned and is not intended to be changed—choose it carefully when the project is created.

### 2. Create the Cloud SQL PostgreSQL Database

Provision a **Cloud SQL for PostgreSQL** instance and database for the application. Use the resulting connection details when configuring the runtime (for example, host and port via environment variables, and database name and credentials via Secret Manager as described below).

### 3. Configure Secret Manager

1. **Enable Secret Manager** for the GCP project if this is the first time you use it in that project (enable the Secret Manager API under **APIs & Services**).
2. **Create secrets** in Secret Manager using the **reference names** you will bind to Cloud Run. In this project, those names are:

   - `database-name`
   - `database-password`
   - `database-user-name`
   - `fire-base-project-id`
   - `firebase-client-email`
   - `firebase-private-key`
   - `x-api-key`

3. **Grant IAM access:** After the secrets exist, configure **IAM** so the **Cloud Run service** runtime identity (service account) can **read** the secrets it needs—for example, by granting Secret Manager access on the relevant secrets or resources, following least privilege.

> **Important:** After values are stored, secret payloads are **not** exposed as plain text in routine views. Applications consume them through **Secret Manager references** (for example, environment variable bindings on Cloud Run), not by pasting secret values into service configuration.

### 4. Create the Cloud Run Service

1. Create a **Cloud Run service** for the application. This is a **service** deployment (not a **Cloud Run Job** or **Worker Pool**).
2. Use **Continuously deploy from a repository** so that:
   - The Git repository is **connected** to Google Cloud.
   - **Cloud Build** **builds the Docker image automatically from source** when changes land in the repository, instead of requiring a manual image rebuild and redeploy for every update.
3. **Connect the Git provider:** Link the Git provider account (or organization), then select the **correct repository**.
4. **Set the Dockerfile path** to **`/Dockerfile`** (Dockerfile at the repository root).
5. **Choose a region** based on **proximity and latency** to your users. For this deployment, the selected region is **Mumbai**.
6. **Configure a build trigger** so that only **relevant** changes rebuild and redeploy the container. Use **include paths** (path-based triggers) so that pushes to **`main`** produce a new deployment **only when** files under those paths change; **unrelated** changes **do not** trigger a redeploy.

### 5. Configure Variables and Secrets

For **Deploy new revision → Variables & Secrets**:

1. **Non-secret environment variables** — add these as ordinary environment variables (not Secret Manager references):

   - `DB_HOST`
   - `DB_PORT`
   - `CORS_ORIGINS`
   - `SWAGGER_ENABLED`
   - `DEVICE_COOKIE_MAX_AGE_SEC`
   - `DEVICE_COOKIE_SECURE`
   - `DEVICE_COOKIE_DOMAIN`

2. **Secrets** — use **Reference a secret**. Map each **application environment variable name** to the corresponding **Secret Manager** secret (by its reference name). The app reads the value through the **env var binding**; the **actual secret value** stays **hidden** in the Cloud Run UI and configuration.

### 6. Configure Scaling and Database Connection

1. **Revision scaling** — configure **minimum** and **maximum** instances for the service. For this setup:

   - **Minimum instances:** `0`
   - **Maximum instances:** `5`

   - **Minimum instances `0`** means the service **may scale to zero** when there is no traffic, which **reduces cost** when idle. It **does not** mean the service cannot be **public**; public reachability is controlled separately (for example, ingress and IAM).
   - **Maximum instances** sets the **upper bound** on how many instances can run under load. Use a **positive** number such as **`5`**; **`0`** is not appropriate as a maximum scale limit.

2. **Database connection** — use **Add connection** (Cloud SQL integration) on the Cloud Run service to attach the **Cloud SQL PostgreSQL** instance created earlier so the application can reach the database through the managed connection.

### 7. How Cloud Run, Load Balancing, and CI/CD Work in This Project

1. **Cloud Run**  
   **Cloud Run** is Google’s **serverless container platform**: it runs your container image, scales the number of instances based on demand, and manages the underlying runtime for the service.

2. **Load balancing**  
   Cloud Run **automatically distributes incoming HTTP traffic** across **running instances** of the service when it **scales out**, which helps the application handle **concurrent requests** without you configuring a separate load balancer for the standard HTTPS endpoint.

3. **CI/CD**  
   In this setup, **CI/CD** means: **pushing code** to the **connected repository** triggers **Cloud Build** to **build the Docker image** and **deploy a new Cloud Run revision** automatically—so integration and delivery from Git to a running revision are continuous.

