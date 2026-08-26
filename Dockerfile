# syntax=docker/dockerfile:1
# Unified Full-Stack Dockerfile (Vite + Express)

FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Copy root package.json
COPY package*.json ./

# Use npm install instead of npm ci to avoid package-lock.json missing errors
RUN npm install --no-audit --no-fund

# Copy the entire workspace
COPY . .

# Environment variables for Vite build
ARG VITE_CLERK_PUBLISHABLE_KEY=""
ARG VITE_API_URL=/api
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL

# Build frontend to dist/public
RUN npm run build

# --- Stage 2: Runner ---
FROM node:22-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

# Copy unified server and backend source
COPY --from=builder /app/server.js ./
COPY --from=builder /app/Backend ./Backend

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

EXPOSE 3000
USER node

# Start the unified server
CMD ["node", "server.js"]