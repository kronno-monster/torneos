const { Pool } = require('pg');
require('dotenv').config();

// Crear pool de conexiones para PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  connectionTimeoutMillis: 60000,
  max: 10
});

// Verificar conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conexión exitosa a PostgreSQL');
    client.release();
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
