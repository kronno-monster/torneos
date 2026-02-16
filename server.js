const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/db');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const jugadoresRoutes = require('./routes/jugadores.routes');
const torneosRoutes = require('./routes/torneos.routes');
const partidasRoutes = require('./routes/partidas.routes');
const setupRoutes = require('./routes/setup.routes');

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

// Rutas
app.use('/api/jugadores', jugadoresRoutes);
app.use('/api/torneos', torneosRoutes);
app.use('/api/partidas', partidasRoutes);
app.use('/setup', setupRoutes);

// Errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const iniciarServidor = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error.message);
  }
};

iniciarServidor();
