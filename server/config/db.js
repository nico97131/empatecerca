import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '13072130',
  database: process.env.MYSQL_DB || 'fundacion_empate',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Mensaje de éxito (sin acceder a propiedades internas no garantizadas)
console.log('✅ MySQL Pool conectado con éxito');
export default db;
