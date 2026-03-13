# Gestify - Google Cloud Run

Aplicación Node.js lista para desplegarse en Google Cloud Run.

## 🚀 Despliegue Rápido

### Prerrequisitos
- Tener Google Cloud CLI instalado
- Proyecto de Google Cloud configurado
- Docker instalado (opcional para pruebas locales)

### 1. Configurar Google Cloud
```bash
# Autenticarse
gcloud auth login

# Configurar proyecto (reemplazar PROJECT_ID)
gcloud config set project [PROJECT_ID]

# Habilitar APIs necesarias
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Desplegar a Cloud Run

**Opción A: Script automatizado (Recomendado)**
```powershell
# Windows PowerShell
.\deploy.ps1 [TU_PROJECT_ID] [REGION]

# Bash/Linux
./deploy.sh [TU_PROJECT_ID] [REGION]
```

**Opción B: Comando directo**
```bash
gcloud run deploy gestify \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --set-env-vars NODE_ENV=production
```

**Opción C: Con Docker (si falla la build)**
```bash
# Usar Dockerfile simplificado
cp Dockerfile.simple Dockerfile
gcloud run deploy gestify --source . --region us-central1
```

### 3. Probar la aplicación
Una vez desplegado, Cloud Run te dará una URL. Prueba estos endpoints:

- `GET /` - Página principal
- `GET /health` - Verificación de salud
- `GET /api/test` - Endpoint de prueba de API

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# La aplicación estará disponible en http://localhost:8080
```

## 📁 Estructura del Proyecto

```
gestify/
├── index.js          # Aplicación principal
├── package.json      # Dependencias de Node.js
├── Dockerfile        # Imagen de contenedor
├── .dockerignore     # Archivos excluidos del contenedor
├── cloudrun.yaml     # Configuración de Cloud Run
└── README.md         # Este archivo
```

## 🔧 Configuración

La aplicación usa las siguientes variables de entorno:

- `PORT`: Puerto donde corre la aplicación (Cloud Run lo configura automáticamente)
- `NODE_ENV`: Ambiente de ejecución (development/production)

## 📝 Próximos Pasos

1. Personaliza la lógica de negocio en `index.js`
2. Añade más rutas según tus necesidades
3. Configura una base de datos si es necesario
4. Implementa autenticación si es requerida
5. Añade tests y CI/CD

## 🔧 Troubleshooting

### Error: "build step 0 failed: step exited with non-zero status: 1"
**Solución:**
1. Usar el Dockerfile simplificado:
   ```bash
   cp Dockerfile.simple Dockerfile
   ```
2. O desplegar sin Docker:
   ```bash
   gcloud run deploy gestify --source . --region us-central1
   ```

### Error: "Permission denied" o problemas de usuario
El Dockerfile incluye configuración de seguridad. Si hay problemas, usa `Dockerfile.simple`.

### Error: APIs no habilitadas
```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com
```

### Verificar logs del despliegue
```bash
gcloud run services logs tail gestify --region us-central1
```

### Cambiar región si hay errores
Prueba diferentes regiones:
- `us-central1` (predeterminado)
- `europe-west1`
- `asia-southeast1`