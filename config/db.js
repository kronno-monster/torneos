const mysql = require('mysql2');
require('dotenv').config();

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Convertir a promesas para usar async/await
const promisePool = pool.promise();

// Verificar conexión
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error al conectar a MySQL:', error.message);
  }
};

module.exports = { pool: promisePool, testConnection };
