const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

// Importar rutas
const jugadoresRoutes = require('./routes/jugadores.routes');
const torneosRoutes = require('./routes/torneos.routes');
const partidasRoutes = require('./routes/partidas.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎮 API de Torneos de Videojuegos',
    version: '1.0.0',
    endpoints: {
      jugadores: '/api/jugadores',
      torneos: '/api/torneos',
      partidas: '/api/partidas'
    }
  });
});

// Rutas de la API
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/torneos', torneosRoutes);
app.use('/api/partidas', partidasRoutes);

// Middlewares de error
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📚 Documentación: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
