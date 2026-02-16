const express = require('express');
const router = express.Router();
const {
  obtenerJugadores,
  obtenerJugadorPorId,
  crearJugador,
  actualizarJugador,
  eliminarJugador,
  obtenerRanking,
  obtenerEstadisticasJugador,
  obtenerTorneosJugador
} = require('../controllers/jugadores.controller');

// Rutas principales
router.get('/', obtenerJugadores);
router.get('/ranking', obtenerRanking);
router.get('/:id', obtenerJugadorPorId);
router.get('/:id/estadisticas', obtenerEstadisticasJugador);
router.get('/:id/torneos', obtenerTorneosJugador);
router.post('/', crearJugador);
router.put('/:id', actualizarJugador);
router.delete('/:id', eliminarJugador);

module.exports = router;
