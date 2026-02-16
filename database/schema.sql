-- ============================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Plataforma de Torneos de Videojuegos
-- ============================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS torneos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE torneos_db;

-- ============================================
-- TABLA: jugadores
-- Almacena información de los jugadores
-- ============================================
CREATE TABLE jugadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    nombre_completo VARCHAR(100),
    pais VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    puntos_totales INT DEFAULT 0,
    estado ENUM('activo', 'inactivo', 'baneado') DEFAULT 'activo',
    INDEX idx_nickname (nickname),
    INDEX idx_puntos (puntos_totales DESC),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: torneos
-- Almacena información de los torneos
-- ============================================
CREATE TABLE torneos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    juego VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    premio_total DECIMAL(10, 2),
    max_participantes INT DEFAULT 32,
    estado ENUM('pendiente', 'en_curso', 'finalizado', 'cancelado') DEFAULT 'pendiente',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_juego (juego),
    INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: inscripciones (Relación N:M)
-- Relaciona jugadores con torneos
-- ============================================
CREATE TABLE inscripciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT NOT NULL,
    torneo_id INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    posicion_final INT,
    puntos_obtenidos INT DEFAULT 0,
    estado ENUM('inscrito', 'confirmado', 'eliminado', 'retirado') DEFAULT 'inscrito',
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE,
    FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
    UNIQUE KEY unique_inscripcion (jugador_id, torneo_id),
    INDEX idx_jugador (jugador_id),
    INDEX idx_torneo (torneo_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: partidas
-- Registra las partidas jugadas en torneos
-- ============================================
CREATE TABLE partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    torneo_id INT NOT NULL,
    jugador1_id INT NOT NULL,
    jugador2_id INT NOT NULL,
    ganador_id INT,
    ronda VARCHAR(50),
    puntos_jugador1 INT DEFAULT 0,
    puntos_jugador2 INT DEFAULT 0,
    fecha_partida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_minutos INT,
    estado ENUM('programada', 'en_curso', 'finalizada', 'cancelada') DEFAULT 'programada',
    FOREIGN KEY (torneo_id) REFERENCES torneos(id) ON DELETE CASCADE,
    FOREIGN KEY (jugador1_id) REFERENCES jugadores(id) ON DELETE CASCADE,
    FOREIGN KEY (jugador2_id) REFERENCES jugadores(id) ON DELETE CASCADE,
    FOREIGN KEY (ganador_id) REFERENCES jugadores(id) ON DELETE SET NULL,
    INDEX idx_torneo (torneo_id),
    INDEX idx_jugadores (jugador1_id, jugador2_id),
    INDEX idx_ganador (ganador_id),
    INDEX idx_estado (estado)
) ENGINE=InnoDB;

-- ============================================
-- TABLA: estadisticas
-- Almacena estadísticas acumuladas por jugador
-- ============================================
CREATE TABLE estadisticas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT NOT NULL UNIQUE,
    partidas_jugadas INT DEFAULT 0,
    partidas_ganadas INT DEFAULT 0,
    partidas_perdidas INT DEFAULT 0,
    torneos_participados INT DEFAULT 0,
    torneos_ganados INT DEFAULT 0,
    racha_actual INT DEFAULT 0,
    mejor_racha INT DEFAULT 0,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(id) ON DELETE CASCADE,
    INDEX idx_partidas_ganadas (partidas_ganadas DESC),
    INDEX idx_torneos_ganados (torneos_ganados DESC)
) ENGINE=InnoDB;

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Insertar jugadores de ejemplo
INSERT INTO jugadores (nickname, email, nombre_completo, pais, puntos_totales, estado) VALUES
('ProGamer123', 'progamer@email.com', 'Juan Pérez', 'México', 1500, 'activo'),
('ShadowNinja', 'shadow@email.com', 'María García', 'España', 2300, 'activo'),
('DragonSlayer', 'dragon@email.com', 'Carlos López', 'Argentina', 1800, 'activo'),
('ThunderBolt', 'thunder@email.com', 'Ana Martínez', 'Colombia', 2100, 'activo'),
('IceQueen', 'ice@email.com', 'Laura Rodríguez', 'Chile', 1950, 'activo');

-- Insertar torneos de ejemplo
INSERT INTO torneos (nombre, juego, descripcion, fecha_inicio, fecha_fin, premio_total, max_participantes, estado) VALUES
('Copa Primavera 2024', 'League of Legends', 'Torneo clasificatorio para el campeonato mundial', '2024-03-15', '2024-03-20', 10000.00, 32, 'finalizado'),
('Battle Royale Championship', 'Fortnite', 'Torneo de eliminación directa', '2024-04-01', '2024-04-05', 15000.00, 64, 'finalizado'),
('Summer Masters', 'Valorant', 'Torneo de verano con los mejores equipos', '2024-06-10', '2024-06-15', 20000.00, 32, 'en_curso'),
('Winter Cup 2024', 'Counter-Strike 2', 'Copa de invierno internacional', '2024-12-01', '2024-12-10', 25000.00, 16, 'pendiente');

-- Insertar inscripciones (relación N:M)
INSERT INTO inscripciones (jugador_id, torneo_id, posicion_final, puntos_obtenidos, estado) VALUES
(1, 1, 3, 500, 'confirmado'),
(2, 1, 1, 1000, 'confirmado'),
(3, 1, 5, 300, 'confirmado'),
(4, 1, 2, 750, 'confirmado'),
(1, 2, 8, 200, 'confirmado'),
(2, 2, 4, 400, 'confirmado'),
(5, 2, 1, 1000, 'confirmado'),
(1, 3, NULL, 0, 'inscrito'),
(2, 3, NULL, 0, 'inscrito'),
(3, 3, NULL, 0, 'inscrito'),
(4, 3, NULL, 0, 'inscrito'),
(5, 3, NULL, 0, 'inscrito');

-- Insertar partidas de ejemplo
INSERT INTO partidas (torneo_id, jugador1_id, jugador2_id, ganador_id, ronda, puntos_jugador1, puntos_jugador2, duracion_minutos, estado) VALUES
(1, 1, 3, 1, 'Cuartos de Final', 16, 12, 45, 'finalizada'),
(1, 2, 4, 2, 'Cuartos de Final', 18, 15, 50, 'finalizada'),
(1, 1, 2, 2, 'Semifinal', 14, 16, 55, 'finalizada'),
(2, 1, 5, 5, 'Octavos de Final', 10, 15, 40, 'finalizada'),
(2, 2, 4, 2, 'Octavos de Final', 13, 11, 38, 'finalizada'),
(3, 1, 2, NULL, 'Fase de Grupos', 0, 0, NULL, 'programada'),
(3, 3, 4, NULL, 'Fase de Grupos', 0, 0, NULL, 'programada');

-- Insertar estadísticas
INSERT INTO estadisticas (jugador_id, partidas_jugadas, partidas_ganadas, partidas_perdidas, torneos_participados, torneos_ganados, racha_actual, mejor_racha) VALUES
(1, 15, 8, 7, 3, 0, 2, 5),
(2, 20, 15, 5, 3, 1, 5, 8),
(3, 12, 5, 7, 2, 0, 0, 3),
(4, 18, 10, 8, 2, 0, 1, 4),
(5, 14, 9, 5, 2, 1, 3, 6);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista: Ranking de jugadores
CREATE VIEW ranking_jugadores AS
SELECT 
    j.id,
    j.nickname,
    j.pais,
    j.puntos_totales,
    e.partidas_ganadas,
    e.torneos_ganados,
    e.mejor_racha
FROM jugadores j
LEFT JOIN estadisticas e ON j.id = e.jugador_id
WHERE j.estado = 'activo'
ORDER BY j.puntos_totales DESC;

-- Vista: Torneos activos con participantes
CREATE VIEW torneos_activos AS
SELECT 
    t.id,
    t.nombre,
    t.juego,
    t.fecha_inicio,
    t.fecha_fin,
    t.premio_total,
    COUNT(i.id) as total_inscritos,
    t.max_participantes
FROM torneos t
LEFT JOIN inscripciones i ON t.id = i.torneo_id
WHERE t.estado IN ('pendiente', 'en_curso')
GROUP BY t.id;
