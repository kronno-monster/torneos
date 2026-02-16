# 🚀 Guía Completa de Despliegue

Esta guía te llevará paso a paso para desplegar tu API de Torneos en servicios gratuitos.

## 📋 Requisitos Previos

- Cuenta de GitHub (para conectar repositorios)
- Código subido a GitHub
- Base de datos MySQL lista

---

## 🎯 Opción 1: Render (Recomendado)

Render ofrece hosting gratuito para aplicaciones Node.js y bases de datos MySQL.

### Paso 1: Crear cuenta en Render

1. Ve a [https://render.com](https://render.com)
2. Haz clic en "Get Started"
3. Regístrate con GitHub (recomendado)

### Paso 2: Crear Base de Datos MySQL

1. En el dashboard de Render, haz clic en "New +"
2. Selecciona "MySQL"
3. Configura:
   - **Name**: `torneos-db`
   - **Database**: `torneos_db`
   - **User**: (se genera automáticamente)
   - **Region**: Elige el más cercano
   - **Plan**: Free
4. Haz clic en "Create Database"
5. **IMPORTANTE**: Guarda las credenciales que aparecen:
   - Internal Database URL
   - External Database URL
   - Host
   - Port
   - Database
   - Username
   - Password

### Paso 3: Importar el Schema SQL

1. Descarga un cliente MySQL como:
   - [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
   - [DBeaver](https://dbeaver.io/)
   - [TablePlus](https://tableplus.com/)

2. Conecta usando las credenciales de Render:
   ```
   Host: <tu-host-render>
   Port: <tu-puerto>
   User: <tu-usuario>
   Password: <tu-password>
   Database: torneos_db
   ```

3. Ejecuta el contenido completo del archivo `database/schema.sql`

4. Verifica que las tablas se crearon correctamente

### Paso 4: Desplegar la API

1. En Render, haz clic en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura el servicio:
   - **Name**: `torneos-api`
   - **Region**: Mismo que la base de datos
   - **Branch**: `main` o `master`
   - **Root Directory**: (dejar vacío)
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Haz clic en "Advanced" y agrega las variables de entorno:

```env
PORT=3000
NODE_ENV=production
DB_HOST=<host-de-render>
DB_USER=<usuario-de-render>
DB_PASSWORD=<password-de-render>
DB_NAME=torneos_db
DB_PORT=<puerto-de-render>
```

5. Haz clic en "Create Web Service"

### Paso 5: Verificar el Despliegue

1. Espera a que termine el despliegue (5-10 minutos)
2. Render te dará una URL como: `https://torneos-api.onrender.com`
3. Prueba la API:
   ```bash
   curl https://torneos-api.onrender.com/
   ```

4. Deberías ver:
   ```json
   {
     "success": true,
     "message": "🎮 API de Torneos de Videojuegos",
     "version": "1.0.0"
   }
   ```

### ⚠️ Limitaciones del Plan Gratuito de Render

- La aplicación se "duerme" después de 15 minutos de inactividad
- Primera petición después de dormir tarda ~30 segundos
- 750 horas gratis al mes
- Base de datos expira después de 90 días

---

## 🚂 Opción 2: Railway

Railway es otra excelente opción con generoso plan gratuito.

### Paso 1: Crear cuenta en Railway

1. Ve a [https://railway.app](https://railway.app)
2. Haz clic en "Login" → "Login with GitHub"
3. Autoriza Railway

### Paso 2: Crear Proyecto

1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona tu repositorio `torneos-api`
4. Railway detectará automáticamente que es Node.js

### Paso 3: Agregar MySQL

1. En tu proyecto, haz clic en "New"
2. Selecciona "Database" → "Add MySQL"
3. Railway creará automáticamente:
   - Base de datos MySQL
   - Variables de entorno conectadas

### Paso 4: Configurar Variables de Entorno

1. Haz clic en tu servicio de API
2. Ve a la pestaña "Variables"
3. Railway ya habrá agregado las variables de MySQL automáticamente
4. Agrega manualmente:
   ```
   PORT=3000
   NODE_ENV=production
   ```

### Paso 5: Importar Schema SQL

1. En Railway, haz clic en tu base de datos MySQL
2. Ve a "Connect" y copia las credenciales
3. Usa MySQL Workbench o similar para conectar
4. Ejecuta el contenido de `database/schema.sql`

### Paso 6: Desplegar

1. Railway desplegará automáticamente
2. Ve a "Settings" → "Generate Domain" para obtener una URL pública
3. Tu API estará en: `https://tu-proyecto.up.railway.app`

### Paso 7: Verificar

```bash
curl https://tu-proyecto.up.railway.app/api/jugadores/ranking
```

### 💰 Plan Gratuito de Railway

- $5 de crédito gratis al mes
- Sin tarjeta de crédito requerida
- Suficiente para proyectos pequeños

---

## ☁️ Opción 3: Vercel + PlanetScale

Combinación de Vercel (frontend/API) con PlanetScale (MySQL serverless).

### Paso 1: Base de Datos en PlanetScale

1. Ve a [https://planetscale.com](https://planetscale.com)
2. Regístrate con GitHub
3. Crea nueva base de datos:
   - **Name**: `torneos-db`
   - **Region**: Elige el más cercano
   - **Plan**: Hobby (gratis)

4. En la base de datos, ve a "Console"
5. Pega y ejecuta el contenido de `database/schema.sql`

6. Ve a "Connect" → "Create password"
7. Guarda las credenciales

### Paso 2: Preparar para Vercel

Vercel requiere algunas modificaciones:

1. Crea `vercel.json` en la raíz:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

2. Modifica `server.js` para exportar la app:

```javascript
// Al final del archivo, reemplaza:
// iniciarServidor();

// Por:
if (process.env.NODE_ENV !== 'production') {
  iniciarServidor();
}

module.exports = app;
```

### Paso 3: Desplegar en Vercel

1. Instala Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. En la carpeta del proyecto:
   ```bash
   vercel
   ```

3. Sigue las instrucciones:
   - Link to existing project? **N**
   - Project name? **torneos-api**
   - Directory? **./
   - Override settings? **N**

4. Configura variables de entorno:
   ```bash
   vercel env add DB_HOST
   vercel env add DB_USER
   vercel env add DB_PASSWORD
   vercel env add DB_NAME
   vercel env add DB_PORT
   ```

5. Despliega a producción:
   ```bash
   vercel --prod
   ```

### 📊 Comparación de Servicios

| Característica | Render | Railway | Vercel + PlanetScale |
|----------------|--------|---------|----------------------|
| Facilidad | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| MySQL incluido | ✅ | ✅ | ❌ (requiere PlanetScale) |
| Plan gratuito | 750h/mes | $5/mes | Ilimitado |
| Cold start | ~30s | ~10s | ~5s |
| Configuración | Simple | Muy simple | Moderada |

---

## 🧪 Probar la API en Producción

### Usando cURL

```bash
# Reemplaza con tu URL de producción
export API_URL="https://tu-api.onrender.com"

# Obtener ranking
curl $API_URL/api/jugadores/ranking

# Crear jugador
curl -X POST $API_URL/api/jugadores \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "TestPlayer",
    "email": "test@email.com",
    "nombre_completo": "Test User",
    "pais": "México"
  }'

# Obtener torneos activos
curl "$API_URL/api/torneos?estado=en_curso"
```

### Usando Postman

1. Importa `postman_collection.json`
2. Edita la variable `base_url`
3. Cambia de `http://localhost:3000` a tu URL de producción
4. Prueba todos los endpoints

### Usando JavaScript (Frontend)

```javascript
const API_URL = 'https://tu-api.onrender.com';

// Obtener ranking
fetch(`${API_URL}/api/jugadores/ranking?limite=10`)
  .then(res => res.json())
  .then(data => console.log(data));

// Crear jugador
fetch(`${API_URL}/api/jugadores`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nickname: 'NuevoJugador',
    email: 'nuevo@email.com',
    pais: 'México'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to database"

1. Verifica que las variables de entorno estén correctas
2. Asegúrate de usar el host externo (no el interno)
3. Verifica que el puerto sea correcto (usualmente 3306)

### Error: "Table doesn't exist"

1. Verifica que ejecutaste el schema SQL completo
2. Conéctate a la base de datos y verifica las tablas:
   ```sql
   SHOW TABLES;
   ```

### La API responde lento

- Es normal en planes gratuitos después de inactividad
- Primera petición tarda más (cold start)
- Considera upgrade a plan de pago para producción

### Error 500 en producción

1. Revisa los logs en el dashboard del servicio
2. Verifica que todas las dependencias estén en `package.json`
3. Asegúrate de que `NODE_ENV=production`

---

## 📈 Monitoreo

### Render

- Dashboard → Tu servicio → "Logs"
- Ver logs en tiempo real
- Métricas de CPU y memoria

### Railway

- Dashboard → Tu servicio → "Deployments"
- Click en deployment → "View Logs"
- Métricas de uso

### Herramientas Externas

- [UptimeRobot](https://uptimerobot.com) - Monitoreo gratuito
- [Pingdom](https://www.pingdom.com) - Alertas de caída
- [Better Uptime](https://betteruptime.com) - Status page

---

## 🎉 ¡Listo!

Tu API está desplegada y lista para usar. Comparte la URL con tu equipo y comienza a construir tu frontend.

**URL de ejemplo:**
```
https://torneos-api.onrender.com/api/jugadores/ranking
```

**Próximos pasos:**
- Agregar autenticación JWT
- Implementar rate limiting
- Crear documentación con Swagger
- Desarrollar frontend con React/Vue
