const express = require('express');
const router = express.Router();
const {
  obtenerTorneos,
  obtenerTorneoPorId,
  crearTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerJugadoresInscritos,
  inscribirJugador,
  obtenerEstadisticasTorneo
} = require('../controllers/torneos.controller');

// Rutas principales
router.get('/', obtenerTorneos);
router.get('/:id', obtenerTorneoPorId);
router.get('/:id/jugadores', obtenerJugadoresInscritos);
router.get('/:id/estadisticas', obtenerEstadisticasTorneo);
router.post('/', crearTorneo);
router.post('/:id/inscribir', inscribirJugador);
router.put('/:id', actualizarTorneo);
router.delete('/:id', eliminarTorneo);

module.exports = router;
