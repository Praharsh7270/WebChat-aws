# syntax=docker/dockerfile:1
# Monolith: Vite frontend + Express API. Build from repo root.

# --- Stage 1: build the SPA (Vite) ---
# Produces static HTML/JS/CSS under frontend/dist.
FROM node:22-bookworm-slim AS frontend-build
WORKDIR /app/Frontend

COPY Frontend/package*.json ./
RUN npm ci --no-audit --no-fund

COPY Frontend/ ./

# Browser calls the same host /api by default. Override in production if needed.
ARG VITE_API_URL=/api
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

RUN test -n "$VITE_CLERK_PUBLISHABLE_KEY" || { echo "Missing VITE_CLERK_PUBLISHABLE_KEY build arg"; exit 1; }
RUN npm run build

# --- Stage 2: build the API bundle ---
# This backend is ESM JavaScript, so npm run build copies src/ to dist/.
FROM node:22-bookworm-slim AS backend-build
WORKDIR /app

COPY Backend/package*.json ./
RUN npm ci --no-audit --no-fund

COPY Backend/ ./
RUN npm run build

# --- Stage 3: runtime image (only prod deps + built assets) ---
# Express serves API routes and static files from public/.
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY Backend/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=backend-build /app/dist ./dist
COPY --from=frontend-build /app/Frontend/dist ./public

EXPOSE 3001
USER node

CMD ["node", "dist/index.js"]