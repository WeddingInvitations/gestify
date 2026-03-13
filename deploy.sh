#!/bin/bash

# Script de despliegue para Gestify en Google Cloud Run
# Uso: ./deploy.sh [PROJECT_ID] [REGION]

set -e

# Configuración por defecto
PROJECT_ID=${1:-"tu-proyecto-id"}
REGION=${2:-"us-central1"}
SERVICE_NAME="gestify"

echo "🚀 Desplegando Gestify a Google Cloud Run..."
echo "📍 Proyecto: $PROJECT_ID"
echo "📍 Región: $REGION"
echo "📍 Servicio: $SERVICE_NAME"

# Verificar que gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud CLI no está instalado"
    echo "📥 Instala desde: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Configurar proyecto
echo "🔧 Configurando proyecto..."
gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias
echo "🔌 Habilitando APIs necesarias..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Desplegar usando source
echo "📦 Desplegando desde código fuente..."
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --set-env-vars NODE_ENV=production

# Obtener la URL del servicio
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo "✅ ¡Despliegue completado exitosamente!"
echo "🌐 URL del servicio: $SERVICE_URL"
echo ""
echo "🧪 Prueba los endpoints:"
echo "   • Inicio: $SERVICE_URL"
echo "   • Salud: $SERVICE_URL/health"
echo "   • API: $SERVICE_URL/api/test"
echo ""
echo "📊 Monitorear logs:"
echo "   gcloud run services logs tail $SERVICE_NAME --region $REGION"