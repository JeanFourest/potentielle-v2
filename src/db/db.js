const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT,
});

async function initializeDatabase() {
  try {
    console.log("[DATABASE] Starting database initialization...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        channel_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        user_id TEXT,
        username VARCHAR(255)
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        topic TEXT NOT NULL,
        scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
        recurrence TEXT
      );
    `);

    console.log("[DATABASE] Database initialized successfully");
  } catch (error) {
    console.error("[ERROR] Database initialization failed:", error);
    throw error;
  }
}

module.exports = {
  pool,
  initializeDatabase,
};
