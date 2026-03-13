const express = require('express');
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Puerto desde variable de entorno (Cloud Run usa PORT)
const PORT = process.env.PORT || 8080;

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    message: '¡Gestify está funcionando en Cloud Run!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta de salud para Cloud Run
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Ruta de ejemplo para API
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API endpoint funcionando correctamente',
    data: {
      example: 'Aquí puedes añadir tu lógica de negocio'
    }
  });
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Algo salió mal!',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Gestify corriendo en puerto ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});