# 📊 Modelo Entidad-Relación - Plataforma de Torneos

## 🎯 Descripción General

Este modelo representa una plataforma completa para gestionar torneos de videojuegos, incluyendo jugadores, torneos, partidas y estadísticas.

## 📋 Entidades Principales

### 1️⃣ JUGADORES
**Descripción:** Almacena la información de los usuarios registrados en la plataforma.

**Atributos:**
- `id` (PK): Identificador único
- `nickname`: Nombre de usuario único
- `email`: Correo electrónico único
- `nombre_completo`: Nombre real del jugador
- `pais`: País de origen
- `fecha_registro`: Fecha de creación de cuenta
- `puntos_totales`: Puntos acumulados (para ranking)
- `estado`: Estado de la cuenta (activo/inactivo/baneado)

**Índices:**
- Índice en `nickname` para búsquedas rápidas
- Índice en `puntos_totales` para ranking
- Índice en `estado` para filtros

---

### 2️⃣ TORNEOS
**Descripción:** Representa los torneos organizados en la plataforma.

**Atributos:**
- `id` (PK): Identificador único
- `nombre`: Nombre del torneo
- `juego`: Videojuego del torneo
- `descripcion`: Descripción detallada
- `fecha_inicio`: Fecha de inicio
- `fecha_fin`: Fecha de finalización
- `premio_total`: Monto del premio
- `max_participantes`: Límite de jugadores
- `estado`: Estado del torneo (pendiente/en_curso/finalizado/cancelado)
- `fecha_creacion`: Fecha de creación del registro

**Índices:**
- Índice en `estado` para filtros
- Índice en `juego` para búsquedas por videojuego
- Índice compuesto en fechas

---

### 3️⃣ INSCRIPCIONES (Tabla Intermedia - Relación N:M)
**Descripción:** Relaciona jugadores con torneos. Un jugador puede inscribirse en múltiples torneos y un torneo tiene múltiples jugadores.

**Atributos:**
- `id` (PK): Identificador único
- `jugador_id` (FK): Referencia a jugadores
- `torneo_id` (FK): Referencia a torneos
- `fecha_inscripcion`: Fecha de inscripción
- `posicion_final`: Posición obtenida en el torneo
- `puntos_obtenidos`: Puntos ganados en el torneo
- `estado`: Estado de la inscripción

**Restricciones:**
- Clave única compuesta (jugador_id, torneo_id) para evitar inscripciones duplicadas
- ON DELETE CASCADE: Si se elimina un jugador o torneo, se eliminan sus inscripciones

---

### 4️⃣ PARTIDAS
**Descripción:** Registra las partidas individuales jugadas dentro de los torneos.

**Atributos:**
- `id` (PK): Identificador único
- `torneo_id` (FK): Torneo al que pertenece
- `jugador1_id` (FK): Primer jugador
- `jugador2_id` (FK): Segundo jugador
- `ganador_id` (FK): Jugador ganador
- `ronda`: Fase del torneo (Cuartos, Semifinal, etc.)
- `puntos_jugador1`: Puntos del jugador 1
- `puntos_jugador2`: Puntos del jugador 2
- `fecha_partida`: Fecha y hora de la partida
- `duracion_minutos`: Duración de la partida
- `estado`: Estado de la partida

**Restricciones:**
- ON DELETE CASCADE para torneo
- ON DELETE CASCADE para jugadores
- ON DELETE SET NULL para ganador (mantiene histórico)

---

### 5️⃣ ESTADISTICAS
**Descripción:** Almacena estadísticas acumuladas de cada jugador.

**Atributos:**
- `id` (PK): Identificador único
- `jugador_id` (FK): Referencia única a jugadores
- `partidas_jugadas`: Total de partidas
- `partidas_ganadas`: Partidas ganadas
- `partidas_perdidas`: Partidas perdidas
- `torneos_participados`: Total de torneos
- `torneos_ganados`: Torneos ganados
- `racha_actual`: Racha de victorias actual
- `mejor_racha`: Mejor racha histórica
- `ultima_actualizacion`: Timestamp de última actualización

**Restricciones:**
- Relación 1:1 con jugadores (UNIQUE en jugador_id)
- ON DELETE CASCADE

---

## 🔗 Relaciones

### Relación 1:N (Uno a Muchos)

1. **JUGADORES → ESTADISTICAS** (1:1)
   - Un jugador tiene una única entrada de estadísticas
   - Tipo: Identificadora
   - Cardinalidad: (1,1) - (1,1)

2. **TORNEOS → PARTIDAS** (1:N)
   - Un torneo tiene múltiples partidas
   - Una partida pertenece a un solo torneo
   - Cardinalidad: (1,1) - (0,N)

3. **JUGADORES → PARTIDAS** (1:N)
   - Un jugador puede participar en múltiples partidas
   - Una partida tiene dos jugadores específicos
   - Cardinalidad: (1,1) - (0,N)
   - Nota: Hay 3 relaciones FK desde partidas hacia jugadores (jugador1, jugador2, ganador)

### Relación N:M (Muchos a Muchos)

4. **JUGADORES ↔ TORNEOS** (N:M)
   - Implementada mediante la tabla intermedia `inscripciones`
   - Un jugador puede inscribirse en múltiples torneos
   - Un torneo puede tener múltiples jugadores inscritos
   - Cardinalidad: (0,N) - (0,N)
   - Atributos de la relación: posicion_final, puntos_obtenidos, estado

---

## 🎨 Diagrama Textual

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  JUGADORES  │────1:1──│ ESTADISTICAS │         │   TORNEOS   │
│             │         │              │         │             │
│ PK: id      │         │ PK: id       │         │ PK: id      │
│    nickname │         │ FK: jugador  │         │    nombre   │
│    email    │         │    partidas  │         │    juego    │
│    puntos   │         │    ganadas   │         │    estado   │
└──────┬──────┘         └──────────────┘         └──────┬──────┘
       │                                                 │
       │                                                 │
       │         ┌──────────────────┐                   │
       └────N:M──│  INSCRIPCIONES   │──N:M──────────────┘
                 │                  │
                 │ PK: id           │
                 │ FK: jugador_id   │
                 │ FK: torneo_id    │
                 │    posicion      │
                 │    puntos        │
                 └──────────────────┘
       
       ┌─────────────────────────────────────┐
       │                                     │
       ↓                                     ↓
┌──────────────┐                      ┌──────────────┐
│   PARTIDAS   │──────────────────────│   TORNEOS    │
│              │         N:1          │              │
│ PK: id       │                      │              │
│ FK: torneo   │                      │              │
│ FK: jugador1 │←─────────────────────┘              │
│ FK: jugador2 │                                     │
│ FK: ganador  │                                     │
│    ronda     │                                     │
│    estado    │                                     │
└──────────────┘                                     │
```

---

## 🔐 Integridad Referencial

### Claves Primarias (PK)
Todas las tablas tienen un `id` autoincremental como clave primaria.

### Claves Foráneas (FK)

| Tabla | Campo FK | Referencia | Acción ON DELETE |
|-------|----------|------------|------------------|
| inscripciones | jugador_id | jugadores(id) | CASCADE |
| inscripciones | torneo_id | torneos(id) | CASCADE |
| partidas | torneo_id | torneos(id) | CASCADE |
| partidas | jugador1_id | jugadores(id) | CASCADE |
| partidas | jugador2_id | jugadores(id) | CASCADE |
| partidas | ganador_id | jugadores(id) | SET NULL |
| estadisticas | jugador_id | jugadores(id) | CASCADE |

### Restricciones UNIQUE
- `jugadores.nickname`
- `jugadores.email`
- `inscripciones(jugador_id, torneo_id)` - Compuesta
- `estadisticas.jugador_id`

---

## 📈 Índices para Optimización

- **Búsquedas frecuentes:** nickname, email
- **Ordenamiento:** puntos_totales DESC
- **Filtros:** estado en todas las tablas
- **Joins:** Todas las FK tienen índices automáticos
- **Consultas de ranking:** partidas_ganadas, torneos_ganados

---

## 💡 Casos de Uso Principales

1. **Ranking Global:** Consultar jugadores ordenados por puntos_totales
2. **Inscripción a Torneo:** Insertar en tabla inscripciones (validar N:M)
3. **Registro de Partida:** Insertar partida y actualizar estadísticas
4. **Historial de Jugador:** JOIN entre jugadores, inscripciones, torneos
5. **Estadísticas de Torneo:** JOIN entre torneos, partidas, jugadores
