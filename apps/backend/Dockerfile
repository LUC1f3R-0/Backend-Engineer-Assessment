# Build from repository root:
#   docker build -f apps/backend/Dockerfile .
#
# Run (set env for DB, X_API_KEY, CORS, etc.):
#   docker run --rm -p 3000:3000 --env-file apps/backend/.env <image>

# --- Install dependencies (cached layer when package files unchanged) ---
FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- Build Nest app (webpack bundle → dist/apps/backend) ---
FROM node:20-bookworm-slim AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx nx run backend:build

# --- Production runtime: only bundle + pruned production deps ---
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN groupadd --gid 1001 nodejs \
  && useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nestjs

COPY --from=builder /app/dist/apps/backend ./

# Webpack’s generated package.json omits `pg`; TypeORM loads it at runtime for PostgreSQL.
RUN npm ci --omit=dev \
  && npm install pg@^8.20.0 --omit=dev \
  && npm cache clean --force \
  && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "main.js"]
