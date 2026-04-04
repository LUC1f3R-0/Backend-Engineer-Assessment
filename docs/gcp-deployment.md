# GCP Deployment Setup

## 1. Overview

The backend runs on **Google Cloud Platform** using:

| Service | Purpose |
|--------|---------|
| **Cloud SQL (PostgreSQL)** | Application database (TypeORM). |
| **Secret Manager** | Passwords and keys—not in Git or plain env files. Injected into Cloud Run as env vars via **Reference a secret**. |
| **Cloud Build** | Builds the image from the repo using **`/Dockerfile`**. |
| **Cloud Run** | Runs the container, scales it, applies env + secrets, connects to Cloud SQL when configured. |

**Flow:** push to the linked repo → (trigger matches) **Cloud Build** builds from **`/Dockerfile`** → **Cloud Run** deploys a **new revision** with vars, secret bindings, and **Cloud SQL** attachment.

---

## 2. GCP project

Use a dedicated project for billing, APIs, IAM, and resources. Example **display name**: **`mo lk project deploment`** (you can use another).

- **Display name** — can be changed later in the console.
- **Project ID** — effectively **permanent**; pick it once and keep automation pointing at it.

Enable billing as needed. Enable APIs the first time you use each product (e.g. Secret Manager, Cloud SQL Admin, Cloud Run, Cloud Build, Artifact Registry / GCR).

---

## 3. Cloud SQL (PostgreSQL)

Provision **Cloud SQL for PostgreSQL** before the app can run: the API needs a host, port, database name, and credentials.

- **`DB_HOST` / `DB_PORT`** — usually plain env vars (where to connect).
- **DB name, user, password** — this project uses Secret Manager secret names `database-name`, `database-user-name`, `database-password`, bound to whatever env vars your NestJS config expects.

---

## 4. Secret Manager

Enable the **Secret Manager API** if this is the first use in the project.

**Secret resource names** (use exactly):

- `database-name`
- `database-password`
- `database-user-name`
- `fire-base-project-id`
- `firebase-client-email`
- `firebase-private-key`
- `x-api-key`

**Binding:** in Cloud Run, **env var name** (e.g. `X_API_KEY`) ≠ **secret name** (e.g. `x-api-key`). You map env var → secret → version. The app reads normal `process.env.*`.

**IAM:** the **Cloud Run runtime service account** needs **Secret Accessor** (or equivalent) on those secrets. Wrong IAM → deploy can succeed but the revision **fails at runtime**. Prefer least privilege.

---

## 5. Cloud Run service

- Use a **Cloud Run service** (HTTP API), not a **Job** or **Worker Pool**.
- **Continuous deploy from repository:** connect Git, select the repo, build from source with **`/Dockerfile`** at the **repository root** (Nx monorepo layout).
- **Region:** **Mumbai** (`asia-south1`) for this deployment—latency and colocation with other resources matter.
- Each deploy creates a **new revision** (image + config).

---

## 6. Build triggers

Configure triggers (e.g. on **`main`**) with **include paths** so only relevant changes (backend, Docker, shared build config) rebuild—saves minutes and avoids useless revisions.

---

## 7. Variables and secrets (Cloud Run → *Edit & deploy new revision* → *Variables & Secrets*)

### Non-secret env vars

| Variable | Role |
|----------|------|
| `DB_HOST` | DB host / connection target. |
| `DB_PORT` | Port (often `5432`). |
| `CORS_ORIGINS` | Allowed browser origins for the API. |
| `SWAGGER_ENABLED` | `true` only if you want Swagger in that environment. |
| `DEVICE_COOKIE_MAX_AGE_SEC` | Device cookie lifetime (seconds). |
| `DEVICE_COOKIE_SECURE` | HTTPS-only cookies in prod. |
| `DEVICE_COOKIE_DOMAIN` | Optional shared parent domain for cookies. |

### Secret-backed

Use **Reference a secret** for sensitive values. Map app env names to the secrets listed in §4.

---

## 8. Scaling

- **Min instances:** `0` — scale to zero when idle (lower cost; **cold starts** possible). Does **not** block public access (that is IAM / ingress).
- **Max instances:** `5` — cap parallelism; must be **positive** (not `0`).

---

## 9. Cloud SQL attachment

On the Cloud Run service, use **Add connection** to attach the **same** Cloud SQL instance so the container uses Google’s managed path to PostgreSQL (not a wide-open public DB).

---

## 10. End-to-end flow

1. Push to the connected repo (e.g. `main`).
2. Trigger matches branch + paths → **Cloud Build** runs.
3. Build uses **`/Dockerfile`** → image pushed to registry.
4. **Cloud Run** deploys a new revision with env + secrets.
5. **Cloud SQL** connection is attached.
6. Traffic hits the service URL; instances scale between min/max.

---

## 11. Cloud Run, traffic, CI/CD

- **Cloud Run** — managed containers, autoscaling, revisions.
- **Traffic** — for the default service URL, Google routes requests across instances when scaled out. This is **not** the same as claiming a separate **External HTTP(S) Load Balancer** unless you add that.
- **CI/CD here** — push → Cloud Build (`/Dockerfile`) → new Cloud Run revision.

---

## 12. Quick checks

- No secrets in Git or Dockerfile.
- Secret **names** vs **env var** names mapped correctly in Cloud Run.
- Runtime service account can read secrets.
- Region (**Mumbai**) aligns with Cloud SQL for connectivity/latency.
- Path triggers avoid pointless deploys.
- Min `0` → watch cold-start latency if it matters.

---

## 13. Summary

**GCP** hosts this stack: **Cloud SQL** for PostgreSQL, **Secret Manager** for sensitive config, **Cloud Build** from **`/Dockerfile`**, **Cloud Run** in **Mumbai** with **min `0`**, **max `5`**, env vars as above, and Cloud SQL connected—giving a repeatable path from **repo** to **running API**.
