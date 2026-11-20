# Stage 1: Build the Vite frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Explicitly ensure devDependencies are installed
ENV NODE_ENV=development

COPY frontend/package*.json ./
RUN npm ci --include=dev

COPY frontend/ ./
# Build production bundle
RUN npm run build

# Stage 2: Runtime Backend
FROM node:20-alpine
WORKDIR /app

RUN apk add --no-cache curl

# Copy backend package files and install production dependencies
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package*.json ./
RUN npm ci --omit=dev

# Copy backend source code
COPY backend/src ./src

# Create uploads directory for screenshots
RUN mkdir -p uploads/advance_proofs

# Copy built frontend assets from builder stage
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Expose port
EXPOSE 5000
ENV PORT=5000

CMD ["node", "src/server.js"]
