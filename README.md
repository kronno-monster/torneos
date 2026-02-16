# 🎮 API REST - Plataforma de Torneos de Videojuegos

API completa para gestionar torneos de videojuegos con ranking de jugadores, gestión de partidas y estadísticas acumuladas.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Endpoints](#endpoints)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Despliegue](#despliegue)

## ✨ Características

- ✅ CRUD completo para jugadores, torneos y partidas
- ✅ Sistema de ranking de jugadores
- ✅ Gestión de inscripciones (relación N:M)
- ✅ Estadísticas acumuladas por jugador
- ✅ Filtros y ordenamiento con query params
- ✅ Consultas relacionales con JOIN
- ✅ Manejo centralizado de errores
- ✅ Respuestas JSON estructuradas
- ✅ Base de datos MySQL con integridad referencial

## 🛠️ Tecnologías

- Node.js
- Express.js
- MySQL2
- dotenv
- CORS

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <tu-repositorio>
cd torneos-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar base de datos

Ejecuta el script SQL en tu servidor MySQL:

```bash
mysql -u root -p < database/schema.sql
```

O importa manualmente el archivo `database/schema.sql` usando phpMyAdmin, MySQL Workbench, etc.

### 4. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=torneos_db
DB_PORT=3306
```

### 5. Iniciar el servidor

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
torneos-api/
│
├── config/
│   └── db.js                    # Configuración de conexión MySQL
│
├── controllers/
│   ├── jugadores.controller.js  # Lógica de jugadores
│   ├── torneos.controller.js    # Lógica de torneos
│   └── partidas.controller.js   # Lógica de partidas
│
├── routes/
│   ├── jugadores.routes.js      # Rutas de jugadores
│   ├── torneos.routes.js        # Rutas de torneos
│   └── partidas.routes.js       # Rutas de partidas
│
├── middlewares/
│   └── errorHandler.js          # Manejo de errores
│
├── database/
│   ├── schema.sql               # Script de creación de BD
│   └── modelo-entidad-relacion.md
│
├── .env                         # Variables de entorno (no subir a git)
├── .env.example                 # Ejemplo de variables
├── .gitignore
├── package.json
├── server.js                    # Punto de entrada
└── README.md
```

## 🚀 Endpoints

### 📍 Ruta Base

```
http://localhost:3000/api
```

### 👤 Jugadores

| Método | Endpoint | Descripción | Query Params |
|--------|----------|-------------|--------------|
| GET | `/jugadores` | Obtener todos los jugadores | `?estado=activo&orden=desc&limite=50` |
| GET | `/jugadores/:id` | Obtener jugador por ID | - |
| GET | `/jugadores/ranking` | Obtener ranking de jugadores | `?limite=10` |
| GET | `/jugadores/:id/estadisticas` | Estadísticas de un jugador | - |
| GET | `/jugadores/:id/torneos` | Torneos de un jugador | - |
| POST | `/jugadores` | Crear nuevo jugador | - |
| PUT | `/jugadores/:id` | Actualizar jugador | - |
| DELETE | `/jugadores/:id` | Eliminar jugador | - |

### 🏆 Torneos

| Método | Endpoint | Descripción | Query Params |
|--------|----------|-------------|--------------|
| GET | `/torneos` | Obtener todos los torneos | `?estado=activo&juego=Valorant&orden=desc` |
| GET | `/torneos/:id` | Obtener torneo por ID | - |
| GET | `/torneos/:id/jugadores` | Jugadores inscritos en torneo | - |
| GET | `/torneos/:id/estadisticas` | Estadísticas del torneo | - |
| POST | `/torneos` | Crear nuevo torneo | - |
| POST | `/torneos/:id/inscribir` | Inscribir jugador a torneo | - |
| PUT | `/torneos/:id` | Actualizar torneo | - |
| DELETE | `/torneos/:id` | Eliminar torneo | - |

### 🎯 Partidas

| Método | Endpoint | Descripción | Query Params |
|--------|----------|-------------|--------------|
| GET | `/partidas` | Obtener todas las partidas | `?torneo_id=1&estado=finalizada&orden=desc` |
| GET | `/partidas/:id` | Obtener partida por ID | - |
| POST | `/partidas` | Crear nueva partida | - |
| PUT | `/partidas/:id` | Actualizar resultado de partida | - |
| DELETE | `/partidas/:id` | Eliminar partida | - |

## 📝 Ejemplos de Uso

### Crear un jugador

```bash
POST http://localhost:3000/api/jugadores
Content-Type: application/json

{
  "nickname": "ProGamer123",
  "email": "progamer@email.com",
  "nombre_completo": "Juan Pérez",
  "pais": "México"
}
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nickname": "ProGamer123",
    "email": "progamer@email.com"
  },
  "message": "Jugador creado exitosamente"
}
```

### Obtener ranking de jugadores

```bash
GET http://localhost:3000/api/jugadores/ranking?limite=10
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "nickname": "ShadowNinja",
      "pais": "España",
      "puntos_totales": 2300,
      "partidas_ganadas": 15,
      "partidas_perdidas": 5,
      "torneos_ganados": 1,
      "mejor_racha": 8,
      "porcentaje_victorias": 75.00
    }
  ],
  "message": "Top 10 jugadores"
}
```

### Crear un torneo

```bash
POST http://localhost:3000/api/torneos
Content-Type: application/json

{
  "nombre": "Copa Primavera 2024",
  "juego": "League of Legends",
  "descripcion": "Torneo clasificatorio",
  "fecha_inicio": "2024-03-15",
  "fecha_fin": "2024-03-20",
  "premio_total": 10000.00,
  "max_participantes": 32
}
```

### Inscribir jugador a torneo

```bash
POST http://localhost:3000/api/torneos/1/inscribir
Content-Type: application/json

{
  "jugador_id": 1
}
```

### Obtener jugadores inscritos en un torneo

```bash
GET http://localhost:3000/api/torneos/1/jugadores
```

### Crear una partida

```bash
POST http://localhost:3000/api/partidas
Content-Type: application/json

{
  "torneo_id": 1,
  "jugador1_id": 1,
  "jugador2_id": 2,
  "ronda": "Cuartos de Final"
}
```

### Actualizar resultado de partida

```bash
PUT http://localhost:3000/api/partidas/1
Content-Type: application/json

{
  "puntos_jugador1": 16,
  "puntos_jugador2": 12,
  "ganador_id": 1,
  "duracion_minutos": 45,
  "estado": "finalizada"
}
```

### Filtrar torneos activos

```bash
GET http://localhost:3000/api/torneos?estado=en_curso
```

### Obtener partidas de un torneo

```bash
GET http://localhost:3000/api/partidas?torneo_id=1&estado=finalizada
```

## 🌐 Despliegue

### Opción 1: Render

1. Crea una cuenta en [Render](https://render.com)

2. Crea un nuevo Web Service:
   - Conecta tu repositorio de GitHub
   - Build Command: `npm install`
   - Start Command: `npm start`

3. Crea una base de datos MySQL en Render:
   - Ve a "New" → "MySQL"
   - Copia las credenciales

4. Configura las variables de entorno en Render:
   ```
   PORT=3000
   NODE_ENV=production
   DB_HOST=<tu-host-render>
   DB_USER=<tu-usuario>
   DB_PASSWORD=<tu-password>
   DB_NAME=<tu-database>
   DB_PORT=3306
   ```

5. Importa el schema SQL:
   - Conéctate a tu base de datos usando MySQL Workbench o similar
   - Ejecuta el contenido de `database/schema.sql`

6. Despliega y prueba tu API

### Opción 2: Railway

1. Crea una cuenta en [Railway](https://railway.app)

2. Crea un nuevo proyecto:
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"

3. Agrega MySQL:
   - Click en "New" → "Database" → "Add MySQL"
   - Railway creará automáticamente las variables de entorno

4. Configura las variables de entorno:
   ```
   PORT=3000
   NODE_ENV=production
   ```

5. Railway detectará automáticamente tu `package.json` y ejecutará `npm start`

6. Importa el schema SQL usando el cliente MySQL de Railway

### Opción 3: Vercel + PlanetScale

1. Base de datos en PlanetScale:
   - Crea cuenta en [PlanetScale](https://planetscale.com)
   - Crea una nueva base de datos
   - Importa el schema SQL

2. API en Vercel:
   - Instala Vercel CLI: `npm i -g vercel`
   - Ejecuta: `vercel`
   - Configura las variables de entorno

## 🧪 Probar Endpoints

### Usando cURL

```bash
# Obtener todos los jugadores
curl http://localhost:3000/api/jugadores

# Crear un jugador
curl -X POST http://localhost:3000/api/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nickname":"TestPlayer","email":"test@email.com"}'
```

### Usando Postman

Importa la colección de Postman incluida en `postman_collection.json`

## 📊 Modelo de Base de Datos

Consulta el archivo `database/modelo-entidad-relacion.md` para ver:
- Diagrama entidad-relación
- Descripción de tablas
- Relaciones y cardinalidades
- Restricciones de integridad

## 🔒 Códigos de Estado HTTP

- `200` - OK: Solicitud exitosa
- `201` - Created: Recurso creado exitosamente
- `400` - Bad Request: Datos inválidos o faltantes
- `404` - Not Found: Recurso no encontrado
- `500` - Internal Server Error: Error del servidor

## 📄 Licencia

ISC

## 👨‍💻 Autor

Desarrollado como proyecto de demostración de API REST con Node.js, Express y MySQL.
