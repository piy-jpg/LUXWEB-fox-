/**
 * Database Configuration & Connection Pool
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'lumiere_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

function connectDB() {
  console.log(`[DB] Connected to database: ${dbConfig.database} at ${dbConfig.host}:${dbConfig.port}`);
}

module.exports = {
  dbConfig,
  connectDB,
};
