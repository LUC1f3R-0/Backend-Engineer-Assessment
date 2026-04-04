# GCP Deployment Setup

## 1. Deployment Overview

This backend and its supporting data layer are hosted on **Google Cloud Platform (GCP)**. The deployment is built around four managed services that each solve a distinct problem and are wired together so that **source changes can flow automatically into a running, scaled container** that reads configuration safely and talks to PostgreSQL.

| Service | Role in this project |
|--------|----------------------|
| **Cloud SQL (PostgreSQL)** | Holds application data. Provides a managed PostgreSQL engine, networking endpoint, backups, and credential management patterns that pair cleanly with Cloud Run. |
| **Secret Manager** | Stores sensitive values (database credentials, API keys, Firebase private key material) outside source code and outside plain-text env files in version control. Cloud Run injects these values at runtime via secret references bound to environment variables. |
| **Cloud Build** | Builds the container image from the connected Git repository using the repository’s **`/Dockerfile`**, so every eligible push can produce a new image without manual local builds. |
| **Cloud Run** | Runs the container as a **stateless HTTP service**, scales it based on traffic, applies environment variables and secret bindings, and—when configured—connects to Cloud SQL through Google’s managed integration. |

**End-to-end flow (conceptual):** developers push code to the linked repository; when trigger rules match, **Cloud Build** builds an image from **`/Dockerfile`**; **Cloud Run** deploys a **new revision** of the service with the configured **non-secret variables**, **secret-backed variables**, and **Cloud SQL attachment**; the running containers use **Secret Manager**-backed values for secrets and **Cloud SQL** for persistence. This document walks through that setup in the order a new operator would follow when reproducing or auditing the environment.

---

## 2. Create and Prepare the GCP Project

A **GCP project** is the top-level boundary for this deployment: billing, enabled APIs, IAM identities, service accounts, logs, secrets, and every managed resource (Cloud SQL, Cloud Run, Cloud Build triggers) live **inside** one project. For this application, a dedicated project was created so workloads, costs, and permissions stay isolated from unrelated work.

**Display name vs project ID**

- The project **display name** is a human-readable label shown in the console (for example, **`mo lk project deploment`**). It **can be changed later** without breaking resource names.
- The **project ID** is the stable identifier used in URLs, `gcloud` commands, and many resource names. It is **effectively permanent** once created and **is not intended to be renamed**; treating it as immutable avoids broken automation and confusing references.

Choose naming deliberately: the display name can be adjusted for clarity; the project ID should be unique, memorable, and stable for the life of the deployment.

**What you prepare before other steps**

- **Billing** must be linked if you use paid services (Cloud SQL, Cloud Run beyond free tiers, etc.).
- **Required APIs** may need to be enabled the first time you use a product in the project (for example **Secret Manager API**, **Cloud SQL Admin API**, **Cloud Run API**, **Cloud Build API**, **Artifact Registry** or Container Registry—depending on your build pipeline). The console typically prompts you to enable APIs when you open a product or run an operation that needs them.

Skipping API enablement or using the wrong project is a common source of “works in one console tab, fails in CI” confusion; always confirm you are in the correct project before creating resources.

---

## 3. Create the Cloud SQL PostgreSQL Instance

**Why Cloud SQL here:** the NestJS backend uses **PostgreSQL** as its relational store (TypeORM, migrations, products, orders, devices). **Cloud SQL for PostgreSQL** provides a managed engine: patching, storage, high-availability options (depending on edition), automated backups (when configured), and a clear separation between **infrastructure** and **application code**.

**Why create it early:** Cloud Run does not host the database. The application expects a reachable PostgreSQL instance; **connection parameters and credentials** must exist before the service can start successfully. Provisioning **Cloud SQL first** establishes the **host**, **port**, **database name**, and **user/password** you will later bind into Cloud Run (directly or via secrets).

**What the instance provides (practically):**

- A **PostgreSQL engine** compatible with the app’s drivers and migrations.
- A **connection endpoint** (host name / connection name) and **port** used by `DB_HOST` and `DB_PORT` on Cloud Run.
- **Credentials** (user and password) and a **database name**—sensitive or environment-specific pieces that this project treats as **Secret Manager** material for `database-user-name`, `database-password`, and `database-name`, rather than hardcoding them in the repo.

**How this ties to Cloud Run**

- **Host and port** are often set as **non-secret** environment variables (`DB_HOST`, `DB_PORT`) because they identify *where* to connect, not the secret *credential*.
- **Database name, user, and password** are stored as **secrets** and exposed to the process as environment variables mapped from Secret Manager (see [Section 7](#7-configure-variables-and-secrets-in-cloud-run)), matching how production systems avoid leaking credentials in build logs or Dockerfiles.

This separation—non-secret routing vs secret credentials—is a deliberate operational pattern, not optional theory.

---

## 4. Enable and Configure Secret Manager

**Why not hardcode secrets:** database passwords, Firebase private keys, and API keys must **never** be committed to Git, baked into a `Dockerfile`, or pasted into public environment files. Secret Manager exists so sensitive values are **stored encrypted**, **access-controlled**, and **audited**, while applications still receive them at runtime as normal environment variables.

**First-time enablement:** if Secret Manager has never been used in this GCP project, **enable the Secret Manager API** under **APIs & Services**. Until the API is enabled, secret creation and IAM bindings will fail.

**How secrets work conceptually**

1. You **create a secret** and upload a **version** containing the **secret value** (password, key, etc.).
2. You **grant IAM** so only intended principals (for example the **Cloud Run service’s runtime service account**) can **access secret versions**.
3. On Cloud Run, you **bind** a secret to an **environment variable name** the application already expects (for example `DB_PASSWORD` mapping to a secret that stores the password).

The application code reads `process.env.DB_PASSWORD` as usual; it does not need to call the Secret Manager API directly when using Cloud Run’s **“Reference a secret”** integration.

**Secret reference names used in this project**

These are the **Secret Manager secret names** (identifiers) created for binding to Cloud Run. Preserve them exactly as listed:

- `database-name`
- `database-password`
- `database-user-name`
- `fire-base-project-id`
- `firebase-client-email`
- `firebase-private-key`
- `x-api-key`

**Reference name vs value vs application variable**

| Concept | Meaning |
|--------|---------|
| **Secret reference name** | The name of the secret **resource** in Secret Manager (for example `x-api-key`). This is what you select when wiring “Reference a secret.” |
| **Secret value** | The payload stored in a secret **version** (the actual password or key). It is not shown in routine UI views and should not appear in build output. |
| **Environment variable name** | The name the **container process** sees (for example `X_API_KEY` or `DB_PASSWORD`). You choose this when binding; it must match what the NestJS app reads (`X_API_KEY`, `FIREBASE_PRIVATE_KEY`, etc.). |

The **reference name** (`x-api-key`) is **not** automatically the same string as the **runtime env var** (`X_API_KEY`). In the Cloud Run UI you map: *env var* → *secret* → *version*. The app only cares about the **env var name** matching its configuration.

**IAM and permissions (critical)**

- Cloud Run runs as a **service account** (the **runtime identity**). That identity must have permission to **access the specific secrets** (typically `secretmanager.versions.access` on those secrets, often via roles such as **Secret Manager Secret Accessor** scoped to the secrets in use).
- If IAM is wrong, **deployment may succeed** but **the revision will fail at runtime** (container exits, database connection fails, Firebase init fails) because the process cannot read bound secrets.

**Least privilege:** grant the Cloud Run service account access **only** to the secrets it needs—no project-wide secret admin for production runtimes.

> **Warning:** Misconfigured Secret Manager IAM is one of the **most common** causes of “green deploy, red logs.” Always verify the **same service account** Cloud Run uses is the one granted accessor rights on each secret.

---

## 5. Create the Cloud Run Service

**Why Cloud Run for this backend:** the API is packaged as a **container** (see repository root **`/Dockerfile`**). Cloud Run runs that image as a **fully managed** HTTP service: you do not manage VMs or Kubernetes control planes for this deployment path. Scaling, HTTPS fronting for the default service URL, and revision management are handled by the platform.

**Service vs Job vs Worker Pool**

- This deployment uses a **Cloud Run service**: long-lived **request/response** HTTP handling for the NestJS API.
- It is **not** a **Cloud Run Job** (batch/one-shot workloads).
- It is **not** a **Worker Pool** (different execution model). Choosing **service** matches a continuously reachable API.

**Continuous deployment from a repository**

The setup uses **Continuously deploy from a repository** so that:

1. A **Git provider** (GitHub, Cloud Source Repositories, etc.) is **connected** and authorized for Google Cloud.
2. The **correct repository** containing this monorepo is selected.
3. **Cloud Build** uses the repository as **build source** and builds the image automatically when triggers fire—avoiding a manual “build locally, push image, update service” loop for every change.

**Dockerfile path: `/Dockerfile`**

- The path **`/Dockerfile`** means the **Dockerfile at the repository root** (not under `apps/backend/` alone). Cloud Build’s build context is the repo; the Dockerfile’s `COPY` and `RUN` instructions must match that layout (this project’s root Dockerfile builds the backend via Nx).
- Pointing the pipeline at the wrong path is a frequent mistake: the build either fails immediately or produces an image that does not match what you tested locally.

**Revisions**

Each successful deployment creates a **new revision** of the Cloud Run service. Revisions are immutable snapshots of image + configuration; traffic can be shifted between revisions for rollbacks or gradual rollouts (depending on how you configure routing).

**Region: Mumbai**

- The selected region for this deployment is **`asia-south1` (Mumbai)**.
- **Region** affects **latency** for users near that geography, **colocation** with other resources (for example Cloud SQL if placed in a compatible region), and **data residency** considerations. Choose based on audience and compliance; this project’s choice reflects proximity and operational preference for the target users.

---

## 6. Configure Build Trigger Behavior

**What the trigger does:** a **build trigger** connects repository events (for example pushes to **`main`**) to **Cloud Build** so that a matching event starts a build that produces a container image and (in this flow) deploys to Cloud Run.

**Why path-based (include path) triggers matter**

- Only **relevant** changes should rebuild and redeploy the backend container.
- Configure **include paths** so pushes touching backend, Docker, or shared build config trigger builds, while unrelated edits (documentation-only, frontend-only if excluded) do **not** spin builds.

**Benefits**

- **Saves build minutes** and shortens feedback loops.
- **Avoids pointless revisions** with identical application code.
- Encourages **disciplined CI/CD**: deploys correlate with actual deployable changes.

**CI/CD vocabulary:** when `main` receives a qualifying push, **continuous integration** (build + test, if configured in the build steps) and **continuous delivery** (image build + deploy to Cloud Run) occur in one pipeline—this is the **CI/CD** story for this project on GCP.

---

## 7. Configure Variables and Secrets in Cloud Run

Runtime configuration for the container is set under **Cloud Run → your service → Edit & deploy new revision → Variables & Secrets** (wording may vary slightly in the console). Here the service receives **non-secret** settings as plain environment variables and **sensitive** values via **Secret Manager references**.

### 7.1 Non-secret environment variables

These values are safe to set as **ordinary environment variables** (not secret references): they describe **routing**, **feature flags**, or **non-sensitive** tuning. They are still sensitive to correctness—wrong `DB_HOST` breaks the database—but they are not passwords.

| Variable | What it represents |
|----------|-------------------|
| `DB_HOST` | Hostname or connection target for PostgreSQL (for example the Cloud SQL instance connection name or IP, depending on how you connect). Must match how the app and Cloud SQL connector are configured. |
| `DB_PORT` | TCP port for PostgreSQL (commonly `5432`). |
| `CORS_ORIGINS` | Comma-separated list of allowed browser origins for cross-origin API calls; required when the SPA is hosted on a different origin than the API. |
| `SWAGGER_ENABLED` | Set to `true` only when you intentionally expose Swagger UI; otherwise keep it `false` or unset in production to reduce attack surface. |
| `DEVICE_COOKIE_MAX_AGE_SEC` | Controls HttpOnly device cookie lifetime (seconds) for anonymous device sessions used with orders and push registration. |
| `DEVICE_COOKIE_SECURE` | Whether cookies require HTTPS (`true` in production behind HTTPS). |
| `DEVICE_COOKIE_DOMAIN` | Optional cookie domain scope (for example a shared parent domain when frontend and API share DNS layout). |

### 7.2 Secret-backed environment variables

Use **Reference a secret** for values that must never appear in logs or plain env screens as raw text in shared workflows.

**How binding works**

1. In Cloud Run, you add an environment variable **name** the application expects (for example `DB_PASSWORD`, `X_API_KEY`, `FIREBASE_PRIVATE_KEY`).
2. You set its value source to **Secret Manager** and pick the secret by **reference name** (for example `database-password`, `x-api-key`).
3. You select the **secret version** (often “latest” for operations, pinned in stricter environments).

At runtime the process sees a normal environment variable; the **value** is injected securely. Console views typically **mask** secret-derived values.

**Reference name vs env var name (again)**

- Secret **`x-api-key`** in Secret Manager might bind to runtime env var **`X_API_KEY`**—the names differ on purpose; Cloud Run maps them.
- Ensure each binding uses the **exact env var names** the NestJS app reads (`apps/backend/src/config/app.config.ts`, database config).

This is strictly better than pasting secrets into “plain” env fields or checking them into Git.

---

## 8. Configure Scaling and Runtime Behavior

**Minimum instances: `0`**

- With **min = 0**, Cloud Run **scales to zero** when there is no traffic, which **reduces cost** during idle periods.
- **Scale-to-zero does not mean the service cannot be public.** Public access is controlled by **IAM**, **ingress** settings, and whether you use authentication on the service—not by minimum instances.
- **Cold starts:** when traffic returns after idle, the first requests may see **higher latency** while a new instance starts. For many APIs this is acceptable; for latency-critical paths you might raise minimum instances (at higher cost).

**Maximum instances: `5`**

- **Max = 5** caps concurrent scaling: under load, Cloud Run will not run more than **five** instances for this service configuration.
- **Max must be a positive integer** for a sensible cap; **`0`** is not a valid maximum for “no instances”—it would contradict running a service.

**Trade-offs**

- Lower min → lower idle cost, more cold-start risk.
- Lower max → cost ceiling and blast-radius control; risk of **throttling** or queueing if traffic exceeds what five instances can handle.

This project’s values (**min `0`**, **max `5`**) reflect a balance between **cost** and **capacity** appropriate to expected load; adjust based on metrics and SLOs.

---

## 9. Attach Cloud SQL to Cloud Run

**What “Add connection” does:** in the Cloud Run service configuration, **connecting** the **Cloud SQL PostgreSQL instance** authorizes the service to use Google’s **managed connectivity path** to the database (Unix socket / Cloud SQL Auth Proxy pattern under the hood, depending on configuration), rather than exposing the database broadly on the public internet.

**Why it matters**

- The containerized backend must reach PostgreSQL **securely** and **reliably**.
- The **Add connection** step wires the **same** Cloud SQL instance you created in [Section 3](#3-create-the-cloud-sql-postgresql-instance) into the **same** Cloud Run service that runs **`/Dockerfile`**’s image.

Skipping this step while pointing `DB_HOST` at Cloud SQL will typically fail or be insecure unless you have deliberately chosen another supported pattern.

---

## 10. Full Deployment Flow in This Project

The following is the **sequential** flow from developer action to serving traffic:

1. **Source code** is pushed to the **connected Git repository** (for example to `main`).
2. The **build trigger** evaluates **branch** and **path** rules; if they match, a build is **queued**.
3. **Cloud Build** checks out the revision and runs the build steps defined for the pipeline (building from the configured source and **`/Dockerfile`**).
4. The **`/Dockerfile`** at the repository root defines how **Node**, **Nx**, and dependencies produce the **backend image**.
5. **Cloud Build** produces a **container image** and pushes it to the configured **image registry** (Artifact Registry or GCR, depending on setup).
6. **Cloud Run** **deploys a new revision** using that image.
7. **Environment variables** and **secret bindings** from [Section 7](#7-configure-variables-and-secrets-in-cloud-run) are applied to the revision.
8. The **Cloud SQL connection** from [Section 9](#9-attach-cloud-sql-to-cloud-run) is attached so the app can open database connections.
9. The **service starts**; health depends on correct **DB** and **secret** configuration.
10. **HTTP requests** hit the Cloud Run **service URL**; the platform **routes** traffic to healthy instances for that revision.

If any step fails (build error, missing secret permission, wrong `DB_HOST`), the new revision may not become healthy—use **Cloud Logging** and revision status to diagnose.

---

## 11. How Cloud Run, Load Balancing, and CI/CD Work in This Project

### 11.1 Cloud Run

Cloud Run is a **serverless container platform**: you supply an **image**, and Google runs it as a **service** with **automatic scaling** between configured min and max instances. Deployments are **revision-based**—each rollout is a new immutable revision. This fits a **stateless NestJS API** behind HTTP: instances can scale horizontally without sticky session requirements at the platform layer (application session behavior is handled by cookies and your own logic).

### 11.2 Load balancing

For the **standard HTTPS endpoint** Cloud Run provides for the service, **Google’s front end** routes incoming requests to **available container instances**. When the service **scales out** to multiple instances, **traffic is distributed across them**, which helps handle **concurrent requests**. This is the **managed request routing** behavior of Cloud Run for that endpoint.

This documentation does **not** claim that you separately configured **External HTTP(S) Load Balancing** with a custom load balancer resource unless you add that architecture explicitly. The behavior described here is the **built-in traffic handling** for the Cloud Run service URL and scaling model.

### 11.3 CI/CD

In this project’s context, **CI/CD** means:

- **Integration:** code merged to the tracked branch triggers an **automated build** from source.
- **Delivery:** a new **container image** is produced and **deployed** to Cloud Run as a **new revision**.

That loop—**push → build (`/Dockerfile`) → deploy → run**—is continuous delivery of the backend without manual image handoff for each change, which is the practical CI/CD outcome this setup targets.

---

## 12. Security and Operational Notes

- **Never hardcode** passwords, Firebase private keys, or API keys in repositories, Dockerfiles, or client-side bundles.
- **Do not confuse** Secret Manager **secret names** (`x-api-key`) with **environment variable names** (`X_API_KEY`); bind them explicitly in Cloud Run.
- **Verify IAM:** the Cloud Run **runtime service account** must be a **Secret Accessor** (or equivalent) on each secret it needs.
- **Double-check region** alignment between Cloud Run (**Mumbai** for this deployment) and Cloud SQL placement for **latency** and **connectivity** rules.
- **Use path-based triggers** to avoid unnecessary builds and noisy revision history.
- **Remember cold starts** when **min instances = 0**—monitor p99 latency after idle periods.
- **Ingress and authentication:** public reachability and whether callers must authenticate are separate from scaling; configure **IAM** and **ingress** deliberately for production.

---

## 13. Conclusion

This deployment arrangement gives the project a **production-style** path on **GCP**: **Cloud SQL** hosts PostgreSQL for durable data; **Secret Manager** protects credentials and keys; **Cloud Build** automates image builds from **`/Dockerfile`** when triggers fire; and **Cloud Run** runs and scales the backend in **Mumbai** with explicit **scaling bounds** (**min `0`**, **max `5`**) and managed connectivity to the database. Together, these pieces implement a clear flow from **source repository** to **running API** with separation between **non-secret configuration** and **secret-backed** settings, suitable for teams that need repeatable operations and safer credential handling than ad-hoc deploys.
