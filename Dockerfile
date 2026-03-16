# Multi-stage build para Next.js
FROM node:18-alpine AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copiar archivos de dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Build de la aplicación
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyBJHpAYb-P832eAQPvJL8xp3p4pHZsIEAo"
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="gestify-490112.firebaseapp.com"
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID="gestify-490112"
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="gestify-490112.firebasestorage.app"
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="925707353742"
ENV NEXT_PUBLIC_FIREBASE_APP_ID="1:925707353742:web:c1ba6236393f29a1d793df"
ENV NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-19DT9BH3EW"

# Build Next.js
RUN npm run build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Variables de entorno de Firebase (con valores de ejemplo - configurar en Cloud Run)
ENV FIREBASE_PROJECT_ID="gestify-490112"
ENV FIREBASE_PRIVATE_KEY=""
ENV FIREBASE_CLIENT_EMAIL=""

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

ENV PORT 8080
ENV HOSTNAME "0.0.0.0"

# Health check para Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]