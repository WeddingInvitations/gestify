# Script simple de despliegue para Gestify
# Uso: .\deploy-simple.ps1 gestify-490112

param([string]$ProjectId)

if (-not $ProjectId) {
    Write-Host "❌ Error: Debes proporcionar el PROJECT_ID" -ForegroundColor Red
    Write-Host "💡 Uso: .\deploy-simple.ps1 TU_PROJECT_ID" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Desplegando a Cloud Run..." -ForegroundColor Green
Write-Host "📍 Proyecto: $ProjectId" -ForegroundColor Cyan

# Configurar proyecto
gcloud config set project $ProjectId

# Desplegar (comando simple)
gcloud run deploy gestify --source . --platform managed --region us-central1 --allow-unauthenticated

Write-Host "✅ Despliegue completado!" -ForegroundColor Green