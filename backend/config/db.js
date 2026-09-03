/**
 * Database Layer Abstraction
 * Seamlessly supports SQLite for zero-config local development
 * and PostgreSQL for production environments via DATABASE_URL.
 */
const path = require('path');
const fs = require('fs');

let sqliteDb = null;
let pgPool = null;
const isPostgres = Boolean(process.env.DATABASE_URL);

function getSqliteInstance() {
  if (!sqliteDb) {
    const Database = require('better-sqlite3');
    const dbDir = path.resolve(__dirname, '../../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const dbPath = path.join(dbDir, 'lumiere.db');
    sqliteDb = new Database(dbPath);
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('foreign_keys = ON');
  }
  return sqliteDb;
}

function getPgPool() {
  if (!pgPool) {
    const { Pool } = require('pg');
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
  }
  return pgPool;
}

/**
 * Execute parameterized query returning multiple rows
 */
async function query(sql, params = []) {
  if (isPostgres) {
    const pool = getPgPool();
    // Convert ? to $1, $2 for Postgres if needed
    let pIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
    const res = await pool.query(pgSql, params);
    return res.rows;
  } else {
    const db = getSqliteInstance();
    // Convert $1, $2 to ? for SQLite if needed
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = db.prepare(sqliteSql);
    return stmt.all(params);
  }
}

/**
 * Execute parameterized query returning a single row
 */
async function get(sql, params = []) {
  if (isPostgres) {
    const rows = await query(sql, params);
    return rows[0] || null;
  } else {
    const db = getSqliteInstance();
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = db.prepare(sqliteSql);
    return stmt.get(params) || null;
  }
}

/**
 * Execute insert / update / delete query
 */
async function run(sql, params = []) {
  if (isPostgres) {
    const pool = getPgPool();
    let pIndex = 1;
    let pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
    // If INSERT and no RETURNING, add RETURNING id
    if (/^\s*insert\s+/i.test(pgSql) && !/returning/i.test(pgSql)) {
      pgSql += ' RETURNING id';
    }
    const res = await pool.query(pgSql, params);
    return {
      lastInsertRowid: res.rows && res.rows[0] ? res.rows[0].id : null,
      changes: res.rowCount,
    };
  } else {
    const db = getSqliteInstance();
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    const stmt = db.prepare(sqliteSql);
    const info = stmt.run(params);
    return {
      lastInsertRowid: info.lastInsertRowid,
      changes: info.changes,
    };
  }
}

/**
 * Execute raw multi-statement SQL script (DDL / migrations)
 */
async function exec(sql) {
  if (isPostgres) {
    const pool = getPgPool();
    await pool.query(sql);
  } else {
    const db = getSqliteInstance();
    db.exec(sql);
  }
}

/**
 * Run a batch of operations inside an atomic transaction
 */
async function transaction(fn) {
  if (isPostgres) {
    const client = await getPgPool().connect();
    try {
      await client.query('BEGIN');
      const tx = {
        query: async (sql, params = []) => {
          let pIndex = 1;
          const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
          const res = await client.query(pgSql, params);
          return res.rows;
        },
        get: async (sql, params = []) => {
          let pIndex = 1;
          const pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
          const res = await client.query(pgSql, params);
          return res.rows[0] || null;
        },
        run: async (sql, params = []) => {
          let pIndex = 1;
          let pgSql = sql.replace(/\?/g, () => `$${pIndex++}`);
          if (/^\s*insert\s+/i.test(pgSql) && !/returning/i.test(pgSql)) {
            pgSql += ' RETURNING id';
          }
          const res = await client.query(pgSql, params);
          return {
            lastInsertRowid: res.rows && res.rows[0] ? res.rows[0].id : null,
            changes: res.rowCount,
          };
        },
      };
      const result = await fn(tx);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } else {
    const db = getSqliteInstance();
    db.exec('BEGIN IMMEDIATE');
    try {
      const tx = {
        query: async (sql, params = []) => {
          const stmt = db.prepare(sql.replace(/\$\d+/g, '?'));
          return stmt.all(params);
        },
        get: async (sql, params = []) => {
          const stmt = db.prepare(sql.replace(/\$\d+/g, '?'));
          return stmt.get(params) || null;
        },
        run: async (sql, params = []) => {
          const stmt = db.prepare(sql.replace(/\$\d+/g, '?'));
          const info = stmt.run(params);
          return { lastInsertRowid: info.lastInsertRowid, changes: info.changes };
        },
      };
      const result = await fn(tx);
      db.exec('COMMIT');
      return result;
    } catch (err) {
      try { db.exec('ROLLBACK'); } catch {}
      throw err;
    }
  }
}

function connectDB() {
  if (isPostgres) {
    console.log('[Database] Connecting to PostgreSQL instance...');
    getPgPool().query('SELECT NOW()', (err) => {
      if (err) console.error('[Database] PostgreSQL connection error:', err.message);
      else console.log('[Database] PostgreSQL connected successfully.');
    });
  } else {
    getSqliteInstance();
    console.log('[Database] SQLite initialized at database/lumiere.db');
  }
}

module.exports = {
  isPostgres,
  query,
  get,
  run,
  exec,
  transaction,
  connectDB,
};
