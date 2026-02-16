-- ============================================
-- SCHEMA PARA POSTGRESQL
-- ============================================

-- Eliminar tablas si existen (en orden inverso por las FK)
DROP TABLE IF EXISTS estadisticas CASCADE;
DROP TABLE IF EXISTS partidas CASCADE;
DROP TABLE IF EXISTS inscripciones CASCADE;
DROP TABLE IF EXISTS torneos CASCADE;
DROP TABLE IF EXISTS jugadores CASCADE;

-- ============================================
-- TABLA: jugadores
-- ============================================
CREATE TABLE jugadores (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre_completo VARCHAR(100),
    pais VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntos_totales INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'baneado'))
);

CREATE INDEX idx_nickname ON jugadores(nickname);
CREATE INDEX idx_puntos ON jugadores(puntos_totales);
CREATE INDEX idx_estado ON jugadores(estado);

-- ============================================
-- TABLA: torneos
-- ============================================
CREATE TABLE torneos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    juego VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    premio_total DECIMAL(10, 2),
    max_participantes INT DEFAULT 32,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_curso', 'finalizado', 'cancelado')),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_estado_torneo ON torneos(estado);
CREATE INDEX idx_juego ON torneos(juego);
CREATE INDEX idx_fechas ON torneos(fecha_inicio, fecha_fin);

-- ============================================
-- TABLA: inscripciones
-- ============================================
CREATE TABLE inscripciones (
    id SERIAL PRIMARY KEY,
    jugador_id INT NOT NULL,
    torneo_id INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posicion_final INT,
    puntos_obtenidos INT DEFAULT 0,
    estado VARCHAR(20) DEFAULT 'inscrito' CHECK (estado IN ('inscrito', 'confirmado', 'eliminado', 'retirado')),
    UNIQUE (jugador_id, torneo_id),
    CONSTRAINT fk_insc_jugador FOREIGN KEY (jugador_id)
      REFERENCES jugadores(id) ON DELETE CASCADE,
    CONSTRAINT fk_insc_torneo FOREIGN KEY (torneo_id)
      REFERENCES torneos(id) ON DELETE CASCADE
);

CREATE INDEX idx_jugador ON inscripciones(jugador_id);
CREATE INDEX idx_torneo ON inscripciones(torneo_id);
CREATE INDEX idx_estado_insc ON inscripciones(estado);

-- ============================================
-- TABLA: partidas
-- ============================================
CREATE TABLE partidas (
    id SERIAL PRIMARY KEY,
    torneo_id INT NOT NULL,
    jugador1_id INT NOT NULL,
    jugador2_id INT NOT NULL,
    ganador_id INT,
    ronda VARCHAR(50),
    puntos_jugador1 INT DEFAULT 0,
    puntos_jugador2 INT DEFAULT 0,
    fecha_partida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_minutos INT,
    estado VARCHAR(20) DEFAULT 'programada' CHECK (estado IN ('programada', 'en_curso', 'finalizada', 'cancelada')),
    CONSTRAINT fk_part_torneo FOREIGN KEY (torneo_id)
      REFERENCES torneos(id) ON DELETE CASCADE,
    CONSTRAINT fk_part_j1 FOREIGN KEY (jugador1_id)
      REFERENCES jugadores(id) ON DELETE CASCADE,
    CONSTRAINT fk_part_j2 FOREIGN KEY (jugador2_id)
      REFERENCES jugadores(id) ON DELETE CASCADE,
    CONSTRAINT fk_part_ganador FOREIGN KEY (ganador_id)
      REFERENCES jugadores(id) ON DELETE SET NULL
);

CREATE INDEX idx_torneo_part ON partidas(torneo_id);
CREATE INDEX idx_jugadores_part ON partidas(jugador1_id, jugador2_id);
CREATE INDEX idx_ganador ON partidas(ganador_id);
CREATE INDEX idx_estado_part ON partidas(estado);

-- ============================================
-- TABLA: estadisticas
-- ============================================
CREATE TABLE estadisticas (
    id SERIAL PRIMARY KEY,
    jugador_id INT NOT NULL UNIQUE,
    partidas_jugadas INT DEFAULT 0,
    partidas_ganadas INT DEFAULT 0,
    partidas_perdidas INT DEFAULT 0,
    torneos_participados INT DEFAULT 0,
    torneos_ganados INT DEFAULT 0,
    racha_actual INT DEFAULT 0,
    mejor_racha INT DEFAULT 0,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_est_jugador FOREIGN KEY (jugador_id)
      REFERENCES jugadores(id) ON DELETE CASCADE
);

CREATE INDEX idx_partidas_ganadas ON estadisticas(partidas_ganadas);
CREATE INDEX idx_torneos_ganados ON estadisticas(torneos_ganados);

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================
INSERT INTO jugadores (nickname, email, nombre_completo, pais, puntos_totales)
VALUES
('ProGamer123', 'progamer@email.com', 'Juan Pérez', 'México', 1500),
('ShadowNinja', 'shadow@email.com', 'María García', 'España', 2300),
('DragonSlayer', 'dragon@email.com', 'Carlos López', 'Argentina', 1800),
('ThunderBolt', 'thunder@email.com', 'Ana Martínez', 'Colombia', 2100),
('IceQueen', 'ice@email.com', 'Laura Rodríguez', 'Chile', 1950)
ON CONFLICT (nickname) DO NOTHING;

INSERT INTO torneos (nombre, juego, descripcion, fecha_inicio, fecha_fin, premio_total, estado)
VALUES
('Copa Primavera 2024', 'League of Legends', 'Torneo clasificatorio', '2024-03-15', '2024-03-20', 10000, 'finalizado'),
('Battle Royale Championship', 'Fortnite', 'Eliminación directa', '2024-04-01', '2024-04-05', 15000, 'finalizado'),
('Summer Masters', 'Valorant', 'Torneo de verano', '2024-06-10', '2024-06-15', 20000, 'en_curso');

INSERT INTO estadisticas (jugador_id, partidas_jugadas, partidas_ganadas)
VALUES
(1, 15, 8),
(2, 20, 15),
(3, 12, 5),
(4, 18, 10),
(5, 14, 9)
ON CONFLICT (jugador_id) DO NOTHING;

-- ============================================
-- VISTAS
-- ============================================
CREATE OR REPLACE VIEW ranking_jugadores AS
SELECT 
    j.id,
    j.nickname,
    j.pais,
    j.puntos_totales,
    COALESCE(e.partidas_ganadas, 0) as partidas_ganadas,
    COALESCE(e.torneos_ganados, 0) as torneos_ganados,
    COALESCE(e.mejor_racha, 0) as mejor_racha
FROM jugadores j
LEFT JOIN estadisticas e ON j.id = e.jugador_id
WHERE j.estado = 'activo'
ORDER BY j.puntos_totales DESC;

CREATE OR REPLACE VIEW torneos_activos AS
SELECT 
    t.id,
    t.nombre,
    t.juego,
    t.fecha_inicio,
    t.fecha_fin,
    t.premio_total,
    COUNT(i.id) AS total_inscritos,
    t.max_participantes
FROM torneos t
LEFT JOIN inscripciones i ON t.id = i.torneo_id
WHERE t.estado IN ('pendiente', 'en_curso')
GROUP BY t.id, t.nombre, t.juego, t.fecha_inicio, t.fecha_fin, t.premio_total, t.max_participantes;
