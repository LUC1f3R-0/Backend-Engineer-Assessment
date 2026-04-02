FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx nx run backend:build


FROM builder AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

RUN chown -R node:node /app
USER node

EXPOSE 8080

CMD ["sh", "-c", "npm run migration:run && npm run start:prod"]
