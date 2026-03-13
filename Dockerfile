# Usar imagen oficial de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (comando actualizado)
RUN npm ci --omit=dev && npm cache clean --force

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad (Alpine Linux compatible)
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup && \
    chown -R appuser:appgroup /app

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 8080

# Health check para Cloud Run
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando por defecto
CMD ["npm", "start"]