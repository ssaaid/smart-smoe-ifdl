# ============================================================
# SMART SMOE IFDL — Backend Dockerfile
# NestJS · Multi-stage build · Production optimized
# node:20 (Debian) pour les stages de build → pas de problème
# apk/DNS ; node:20-alpine pour le stage final (image légère)
# ============================================================

# ── Stage 1: Dependencies (Debian — build tools inclus) ──
FROM node:20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: Builder (Debian — compile bcrypt, sharp…) ───
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 3: Production (Alpine — image finale légère) ───
FROM node:20-alpine AS production
WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy production deps and built app
COPY --from=deps    --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist        ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./

# Create upload directory
RUN mkdir -p uploads && chown nestjs:nodejs uploads

USER nestjs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main.js"]
