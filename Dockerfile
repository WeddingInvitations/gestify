# Usar imagen oficial de Node.js
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S gestify -u 1001

# Cambiar propiedad de archivos
RUN chown -R gestify:nodejs /app

# Cambiar a usuario no-root
USER gestify

# Exponer puerto
EXPOSE 8080

# Comando por defecto
CMD ["npm", "start"]