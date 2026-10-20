FROM node:22-bookworm-slim AS build
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
RUN npm install --no-audit --no-fund
COPY backend/prisma ./prisma
RUN npx prisma generate
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

# CLI de migraciones aislada: no incluir TypeScript ni dependencias de desarrollo.
FROM node:22-bookworm-slim AS migration-cli
WORKDIR /opt/migrations
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install --no-audit --no-fund prisma@6.16.2

FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=migration-cli /opt/migrations /opt/migrations
COPY --chown=node:node backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x /app/entrypoint.sh
USER node
EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
