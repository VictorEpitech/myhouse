# ----------------------------------------------------
# Stage 1: Build the Vite Frontend
# ----------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including build tools)
RUN npm ci

# Copy source files
COPY . .

# Build production static assets
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Server & SQLite DB Runner
# ----------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Copy backend server code and data
COPY server ./server
COPY src/data ./src/data

# Prepare directory for persistent SQLite database
RUN mkdir -p /app/data

# Expose standard application port
EXPOSE 3000

# Run production Express server with native SQLite
CMD ["node", "server/index.js"]
