const express = require('express');
const router = express.Router();
const {
  obtenerPartidas,
  obtenerPartidaPorId,
  crearPartida,
  actualizarPartida,
  eliminarPartida
} = require('../controllers/partidas.controller');

// Rutas principales
router.get('/', obtenerPartidas);
router.get('/:id', obtenerPartidaPorId);
router.post('/', crearPartida);
router.put('/:id', actualizarPartida);
router.delete('/:id', eliminarPartida);

module.exports = router;
