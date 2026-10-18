# ===================================================================
# MediLens AI — Unified Production Dockerfile for Google Cloud Run
# Builds both Frontend (Vite + React) & Backend (Node.js + Express)
# Serves the complete web application directly on the root URL
# ===================================================================

# -------------------------------------------------------------
# Stage 1: Build the React + TypeScript Frontend
# -------------------------------------------------------------
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Build the TypeScript Backend
# -------------------------------------------------------------
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json backend/tsconfig.json ./
RUN npm ci

COPY backend/src/ ./src/
RUN npm run build

# -------------------------------------------------------------
# Stage 3: Production Runner Container
# -------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies for the backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy compiled backend JavaScript
COPY --from=backend-builder /app/backend/dist ./dist

# Copy compiled frontend static assets into public/ (served by Express)
COPY --from=frontend-builder /app/frontend/dist ./public

# Security best practice: run as non-root user
USER node

EXPOSE 8080

# Start server
CMD ["node", "dist/server.js"]
