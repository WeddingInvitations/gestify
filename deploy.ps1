# Script de despliegue para Gestify en Google Cloud Run (PowerShell)
# Uso: .\deploy.ps1 [PROJECT_ID] [REGION]

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "tu-proyecto-id",
    
    [Parameter(Mandatory=$false)]
    [string]$Region = "us-central1"
)

$ServiceName = "gestify"
$ErrorActionPreference = "Stop"

Write-Host "🚀 Desplegando Gestify a Google Cloud Run..." -ForegroundColor Green
Write-Host "📍 Proyecto: $ProjectId" -ForegroundColor Cyan
Write-Host "📍 Región: $Region" -ForegroundColor Cyan
Write-Host "📍 Servicio: $ServiceName" -ForegroundColor Cyan
Write-Host ""

# Verificar que gcloud está instalado
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "❌ Error: Google Cloud CLI no está instalado" -ForegroundColor Red
    Write-Host "📥 Instala desde: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Configurar proyecto
Write-Host "🔧 Configurando proyecto..." -ForegroundColor Yellow
gcloud config set project $ProjectId

# Habilitar APIs necesarias
Write-Host "🔌 Habilitando APIs necesarias..." -ForegroundColor Yellow
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Desplegar usando source
Write-Host "📦 Desplegando desde código fuente..." -ForegroundColor Yellow
gcloud run deploy $ServiceName `
  --source . `
  --platform managed `
  --region $Region `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --cpu 1 `
  --max-instances 10 `
  --set-env-vars NODE_ENV=production

# Obtener la URL del servicio
$ServiceUrl = gcloud run services describe $ServiceName --platform managed --region $Region --format 'value(status.url)'

Write-Host ""
Write-Host "✅ ¡Despliegue completado exitosamente!" -ForegroundColor Green
Write-Host "🌐 URL del servicio: $ServiceUrl" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Prueba los endpoints:" -ForegroundColor Yellow
Write-Host "   • Inicio: $ServiceUrl"
Write-Host "   • Salud: $ServiceUrl/health"
Write-Host "   • API: $ServiceUrl/api/test"
Write-Host ""
Write-Host "📊 Monitorear logs:" -ForegroundColor Yellow
Write-Host "   gcloud run services logs tail $ServiceName --region $Region"