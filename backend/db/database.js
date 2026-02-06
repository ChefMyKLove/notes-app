const path = require('path');

let db;

// Check if using PostgreSQL (production) or SQLite (development)
if (process.env.DATABASE_URL) {
  // PostgreSQL for production
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  db = {
    run: (sql, params = [], callback) => {
      pool.query(sql, params, (err, result) => {
        if (callback) callback(err);
      });
    },
    get: (sql, params = [], callback) => {
      pool.query(sql, params, (err, result) => {
        if (callback) callback(err, result?.rows?.[0]);
      });
    },
    all: (sql, params = [], callback) => {
      pool.query(sql, params, (err, result) => {
        if (callback) callback(err, result?.rows);
      });
    },
    exec: (sql, callback) => {
      pool.query(sql, (err) => {
        if (callback) callback(err);
      });
    },
    serialize: (callback) => callback(),
    close: (callback) => {
      pool.end(callback);
    }
  };

  console.log('Using PostgreSQL database');
  initializeDatabase();
} else {
  // SQLite for development
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'notes.db');

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening database:', err);
    } else {
      console.log('Connected to SQLite database at', dbPath);
      initializeDatabase();
    }
  });
}

function initializeDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id ${process.env.DATABASE_URL ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) console.error('Error creating users table:', err);
      else console.log('Users table initialized');
    });

    // Create notes table
    db.run(`
      CREATE TABLE IF NOT EXISTS notes (
        id ${process.env.DATABASE_URL ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) console.error('Error creating notes table:', err);
      else console.log('Notes table initialized');
    });
  });
}

module.exports = db;
