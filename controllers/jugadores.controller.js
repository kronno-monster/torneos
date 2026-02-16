const { pool } = require('../config/db');

// Obtener todos los jugadores con filtros
const obtenerJugadores = async (req, res, next) => {
  try {
    const { estado, orden = 'desc', limite = 50 } = req.query;
    
    let query = 'SELECT * FROM jugadores WHERE 1=1';
    const params = [];

    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }

    query += ` ORDER BY puntos_totales ${orden === 'asc' ? 'ASC' : 'DESC'} LIMIT ?`;
    params.push(parseInt(limite));

    const [jugadores] = await pool.query(query, params);

    res.json({
      success: true,
      data: jugadores,
      message: `${jugadores.length} jugadores encontrados`
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un jugador por ID
const obtenerJugadorPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [jugadores] = await pool.query('SELECT * FROM jugadores WHERE id = ?', [id]);

    if (jugadores.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.json({
      success: true,
      data: jugadores[0],
      message: 'Jugador encontrado'
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo jugador
const crearJugador = async (req, res, next) => {
  try {
    const { nickname, email, nombre_completo, pais } = req.body;

    if (!nickname || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nickname y email son obligatorios'
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO jugadores (nickname, email, nombre_completo, pais) VALUES (?, ?, ?, ?)',
      [nickname, email, nombre_completo, pais]
    );

    // Crear estadísticas iniciales
    await pool.query('INSERT INTO estadisticas (jugador_id) VALUES (?)', [resultado.insertId]);

    res.status(201).json({
      success: true,
      data: { id: resultado.insertId, nickname, email },
      message: 'Jugador creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un jugador
const actualizarJugador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre_completo, pais, estado } = req.body;

    const [resultado] = await pool.query(
      'UPDATE jugadores SET nombre_completo = COALESCE(?, nombre_completo), pais = COALESCE(?, pais), estado = COALESCE(?, estado) WHERE id = ?',
      [nombre_completo, pais, estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Jugador actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un jugador
const eliminarJugador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM jugadores WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Jugador eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener ranking de jugadores
const obtenerRanking = async (req, res, next) => {
  try {
    const { limite = 10 } = req.query;

    const [ranking] = await pool.query(`
      SELECT 
        j.id,
        j.nickname,
        j.pais,
        j.puntos_totales,
        e.partidas_ganadas,
        e.partidas_perdidas,
        e.torneos_ganados,
        e.mejor_racha,
        ROUND((e.partidas_ganadas / NULLIF(e.partidas_jugadas, 0)) * 100, 2) as porcentaje_victorias
      FROM jugadores j
      LEFT JOIN estadisticas e ON j.id = e.jugador_id
      WHERE j.estado = 'activo'
      ORDER BY j.puntos_totales DESC
      LIMIT ?
    `, [parseInt(limite)]);

    res.json({
      success: true,
      data: ranking,
      message: `Top ${ranking.length} jugadores`
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas de un jugador
const obtenerEstadisticasJugador = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [estadisticas] = await pool.query(`
      SELECT 
        j.nickname,
        j.puntos_totales,
        e.*,
        ROUND((e.partidas_ganadas / NULLIF(e.partidas_jugadas, 0)) * 100, 2) as porcentaje_victorias
      FROM jugadores j
      LEFT JOIN estadisticas e ON j.id = e.jugador_id
      WHERE j.id = ?
    `, [id]);

    if (estadisticas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Jugador no encontrado'
      });
    }

    res.json({
      success: true,
      data: estadisticas[0],
      message: 'Estadísticas obtenidas'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener torneos de un jugador
const obtenerTorneosJugador = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [torneos] = await pool.query(`
      SELECT 
        t.id,
        t.nombre,
        t.juego,
        t.fecha_inicio,
        t.fecha_fin,
        t.estado as estado_torneo,
        i.posicion_final,
        i.puntos_obtenidos,
        i.estado as estado_inscripcion
      FROM inscripciones i
      INNER JOIN torneos t ON i.torneo_id = t.id
      WHERE i.jugador_id = ?
      ORDER BY t.fecha_inicio DESC
    `, [id]);

    res.json({
      success: true,
      data: torneos,
      message: `${torneos.length} torneos encontrados`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerJugadores,
  obtenerJugadorPorId,
  crearJugador,
  actualizarJugador,
  eliminarJugador,
  obtenerRanking,
  obtenerEstadisticasJugador,
  obtenerTorneosJugador
};
