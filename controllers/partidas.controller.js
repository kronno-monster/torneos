const { pool } = require('../config/db');

// Obtener todas las partidas con filtros
const obtenerPartidas = async (req, res, next) => {
  try {
    const { torneo_id, estado, orden = 'desc' } = req.query;
    
    let query = `
      SELECT 
        p.*,
        t.nombre as torneo_nombre,
        j1.nickname as jugador1_nickname,
        j2.nickname as jugador2_nickname,
        g.nickname as ganador_nickname
      FROM partidas p
      INNER JOIN torneos t ON p.torneo_id = t.id
      INNER JOIN jugadores j1 ON p.jugador1_id = j1.id
      INNER JOIN jugadores j2 ON p.jugador2_id = j2.id
      LEFT JOIN jugadores g ON p.ganador_id = g.id
      WHERE 1=1
    `;
    const params = [];

    if (torneo_id) {
      query += ' AND p.torneo_id = ?';
      params.push(torneo_id);
    }

    if (estado) {
      query += ' AND p.estado = ?';
      params.push(estado);
    }

    query += ` ORDER BY p.fecha_partida ${orden === 'asc' ? 'ASC' : 'DESC'}`;

    const [partidas] = await pool.query(query, params);

    res.json({
      success: true,
      data: partidas,
      message: `${partidas.length} partidas encontradas`
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una partida por ID
const obtenerPartidaPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [partidas] = await pool.query(`
      SELECT 
        p.*,
        t.nombre as torneo_nombre,
        j1.nickname as jugador1_nickname,
        j2.nickname as jugador2_nickname,
        g.nickname as ganador_nickname
      FROM partidas p
      INNER JOIN torneos t ON p.torneo_id = t.id
      INNER JOIN jugadores j1 ON p.jugador1_id = j1.id
      INNER JOIN jugadores j2 ON p.jugador2_id = j2.id
      LEFT JOIN jugadores g ON p.ganador_id = g.id
      WHERE p.id = ?
    `, [id]);

    if (partidas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partida no encontrada'
      });
    }

    res.json({
      success: true,
      data: partidas[0],
      message: 'Partida encontrada'
    });
  } catch (error) {
    next(error);
  }
};

// Crear una nueva partida
const crearPartida = async (req, res, next) => {
  try {
    const { torneo_id, jugador1_id, jugador2_id, ronda } = req.body;

    if (!torneo_id || !jugador1_id || !jugador2_id) {
      return res.status(400).json({
        success: false,
        message: 'torneo_id, jugador1_id y jugador2_id son obligatorios'
      });
    }

    if (jugador1_id === jugador2_id) {
      return res.status(400).json({
        success: false,
        message: 'Los jugadores deben ser diferentes'
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO partidas (torneo_id, jugador1_id, jugador2_id, ronda) VALUES (?, ?, ?, ?)',
      [torneo_id, jugador1_id, jugador2_id, ronda]
    );

    res.status(201).json({
      success: true,
      data: { id: resultado.insertId },
      message: 'Partida creada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar resultado de partida
const actualizarPartida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { puntos_jugador1, puntos_jugador2, ganador_id, duracion_minutos, estado } = req.body;

    const [resultado] = await pool.query(
      `UPDATE partidas SET 
        puntos_jugador1 = COALESCE(?, puntos_jugador1),
        puntos_jugador2 = COALESCE(?, puntos_jugador2),
        ganador_id = COALESCE(?, ganador_id),
        duracion_minutos = COALESCE(?, duracion_minutos),
        estado = COALESCE(?, estado)
      WHERE id = ?`,
      [puntos_jugador1, puntos_jugador2, ganador_id, duracion_minutos, estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partida no encontrada'
      });
    }

    // Si la partida finalizó, actualizar estadísticas
    if (estado === 'finalizada' && ganador_id) {
      const [partida] = await pool.query('SELECT jugador1_id, jugador2_id FROM partidas WHERE id = ?', [id]);
      
      if (partida.length > 0) {
        const perdedor_id = ganador_id === partida[0].jugador1_id ? partida[0].jugador2_id : partida[0].jugador1_id;

        // Actualizar estadísticas del ganador
        await pool.query(`
          UPDATE estadisticas SET 
            partidas_jugadas = partidas_jugadas + 1,
            partidas_ganadas = partidas_ganadas + 1,
            racha_actual = racha_actual + 1,
            mejor_racha = GREATEST(mejor_racha, racha_actual + 1)
          WHERE jugador_id = ?
        `, [ganador_id]);

        // Actualizar estadísticas del perdedor
        await pool.query(`
          UPDATE estadisticas SET 
            partidas_jugadas = partidas_jugadas + 1,
            partidas_perdidas = partidas_perdidas + 1,
            racha_actual = 0
          WHERE jugador_id = ?
        `, [perdedor_id]);
      }
    }

    res.json({
      success: true,
      message: 'Partida actualizada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar una partida
const eliminarPartida = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM partidas WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Partida no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Partida eliminada exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerPartidas,
  obtenerPartidaPorId,
  crearPartida,
  actualizarPartida,
  eliminarPartida
};
