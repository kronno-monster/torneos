const { pool } = require('../config/db');

// Obtener todos los torneos con filtros
const obtenerTorneos = async (req, res, next) => {
  try {
    const { estado, juego, orden = 'desc' } = req.query;
    
    let query = 'SELECT * FROM torneos WHERE 1=1';
    const params = [];

    if (estado) {
      query += ' AND estado = ?';
      params.push(estado);
    }

    if (juego) {
      query += ' AND juego LIKE ?';
      params.push(`%${juego}%`);
    }

    query += ` ORDER BY fecha_inicio ${orden === 'asc' ? 'ASC' : 'DESC'}`;

    const [torneos] = await pool.query(query, params);

    res.json({
      success: true,
      data: torneos,
      message: `${torneos.length} torneos encontrados`
    });
  } catch (error) {
    next(error);
  }
};

// Obtener un torneo por ID
const obtenerTorneoPorId = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [torneos] = await pool.query('SELECT * FROM torneos WHERE id = ?', [id]);

    if (torneos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado'
      });
    }

    res.json({
      success: true,
      data: torneos[0],
      message: 'Torneo encontrado'
    });
  } catch (error) {
    next(error);
  }
};

// Crear un nuevo torneo
const crearTorneo = async (req, res, next) => {
  try {
    const { nombre, juego, descripcion, fecha_inicio, fecha_fin, premio_total, max_participantes } = req.body;

    if (!nombre || !juego || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, juego, fecha_inicio y fecha_fin son obligatorios'
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO torneos (nombre, juego, descripcion, fecha_inicio, fecha_fin, premio_total, max_participantes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nombre, juego, descripcion, fecha_inicio, fecha_fin, premio_total, max_participantes]
    );

    res.status(201).json({
      success: true,
      data: { id: resultado.insertId, nombre, juego },
      message: 'Torneo creado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Actualizar un torneo
const actualizarTorneo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, fecha_inicio, fecha_fin, premio_total, estado } = req.body;

    const [resultado] = await pool.query(
      `UPDATE torneos SET 
        nombre = COALESCE(?, nombre),
        descripcion = COALESCE(?, descripcion),
        fecha_inicio = COALESCE(?, fecha_inicio),
        fecha_fin = COALESCE(?, fecha_fin),
        premio_total = COALESCE(?, premio_total),
        estado = COALESCE(?, estado)
      WHERE id = ?`,
      [nombre, descripcion, fecha_inicio, fecha_fin, premio_total, estado, id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Torneo actualizado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Eliminar un torneo
const eliminarTorneo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [resultado] = await pool.query('DELETE FROM torneos WHERE id = ?', [id]);

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Torneo eliminado exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener jugadores inscritos en un torneo
const obtenerJugadoresInscritos = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [jugadores] = await pool.query(`
      SELECT 
        j.id,
        j.nickname,
        j.nombre_completo,
        j.pais,
        j.puntos_totales,
        i.fecha_inscripcion,
        i.posicion_final,
        i.puntos_obtenidos,
        i.estado
      FROM inscripciones i
      INNER JOIN jugadores j ON i.jugador_id = j.id
      WHERE i.torneo_id = ?
      ORDER BY i.posicion_final ASC, j.puntos_totales DESC
    `, [id]);

    res.json({
      success: true,
      data: jugadores,
      message: `${jugadores.length} jugadores inscritos`
    });
  } catch (error) {
    next(error);
  }
};

// Inscribir jugador a torneo
const inscribirJugador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { jugador_id } = req.body;

    if (!jugador_id) {
      return res.status(400).json({
        success: false,
        message: 'jugador_id es obligatorio'
      });
    }

    // Verificar que el torneo existe y está abierto
    const [torneos] = await pool.query('SELECT estado, max_participantes FROM torneos WHERE id = ?', [id]);
    
    if (torneos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado'
      });
    }

    if (torneos[0].estado !== 'pendiente') {
      return res.status(400).json({
        success: false,
        message: 'El torneo no está aceptando inscripciones'
      });
    }

    // Verificar límite de participantes
    const [inscritos] = await pool.query('SELECT COUNT(*) as total FROM inscripciones WHERE torneo_id = ?', [id]);
    
    if (inscritos[0].total >= torneos[0].max_participantes) {
      return res.status(400).json({
        success: false,
        message: 'El torneo ha alcanzado el límite de participantes'
      });
    }

    const [resultado] = await pool.query(
      'INSERT INTO inscripciones (jugador_id, torneo_id) VALUES (?, ?)',
      [jugador_id, id]
    );

    res.status(201).json({
      success: true,
      data: { id: resultado.insertId },
      message: 'Jugador inscrito exitosamente'
    });
  } catch (error) {
    next(error);
  }
};

// Obtener estadísticas del torneo
const obtenerEstadisticasTorneo = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [stats] = await pool.query(`
      SELECT 
        t.nombre,
        t.juego,
        t.estado,
        COUNT(DISTINCT i.jugador_id) as total_participantes,
        COUNT(DISTINCT p.id) as total_partidas,
        COUNT(DISTINCT CASE WHEN p.estado = 'finalizada' THEN p.id END) as partidas_finalizadas,
        AVG(p.duracion_minutos) as duracion_promedio
      FROM torneos t
      LEFT JOIN inscripciones i ON t.id = i.torneo_id
      LEFT JOIN partidas p ON t.id = p.torneo_id
      WHERE t.id = ?
      GROUP BY t.id
    `, [id]);

    if (stats.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Torneo no encontrado'
      });
    }

    res.json({
      success: true,
      data: stats[0],
      message: 'Estadísticas del torneo'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerTorneos,
  obtenerTorneoPorId,
  crearTorneo,
  actualizarTorneo,
  eliminarTorneo,
  obtenerJugadoresInscritos,
  inscribirJugador,
  obtenerEstadisticasTorneo
};
