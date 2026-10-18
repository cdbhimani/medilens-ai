# Stage 1: Build React + Vite frontend
FROM node:24-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Ensure Vite generated the frontend entry point
RUN test -f /app/frontend/dist/index.html


# Stage 2: Build TypeScript backend
FROM node:24-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json backend/tsconfig.json ./
RUN npm ci

COPY backend/src/ ./src/
RUN npm run build

# Ensure the backend entry point exists
RUN test -f /app/backend/dist/server.js


# Stage 3: Production image
FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install backend production dependencies
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy compiled backend
COPY --chown=node:node --from=backend-builder /app/backend/dist ./dist

# Copy built frontend into /app/public and /app/dist/public
COPY --chown=node:node --from=frontend-builder /app/frontend/dist ./public
COPY --chown=node:node --from=frontend-builder /app/frontend/dist ./dist/public

# Ensure the deployed image contains index.html
RUN test -f /app/public/index.html && test -f /app/dist/public/index.html

# Run as non-root user
USER node

EXPOSE 8080

CMD ["node", "dist/server.js"]
