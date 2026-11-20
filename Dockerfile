# Stage 1: Build the Vite frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# Build production bundle
RUN npm run build

# Stage 2: Runtime Backend
FROM node:20-alpine
WORKDIR /app

# Install curl/dependencies if needed
RUN apk add --no-cache curl

# Copy backend package files and install dependencies
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy backend source code
COPY backend/src ./src

# Create uploads directory for screenshots
RUN mkdir -p uploads/advance_proofs

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 5000
ENV PORT=5000
ENV NODE_ENV=production

CMD ["node", "src/server.js"]
