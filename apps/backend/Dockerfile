# docker build -f apps/backend/Dockerfile -t mo.lk:latest .

FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx nx run backend:build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist/apps/backend ./

RUN chown -R node:node /app
USER node

EXPOSE 8080

CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
