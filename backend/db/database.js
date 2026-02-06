const path = require('path');

let db;

// Check if using PostgreSQL (production) or SQLite (development)
if (process.env.DATABASE_URL) {
  // PostgreSQL for production
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });

  // Simple query wrapper that converts SQLite ? to PostgreSQL $1, $2
  const convertQuery = (sql, params) => {
    let paramIndex = 1;
    const converted = sql.replace(/\?/g, () => `$${paramIndex++}`);
    return { sql: converted, params };
  };

  db = {
    run: (sql, params = [], callback) => {
      try {
        const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
        
        // Add RETURNING id for INSERT statements
        let finalSql = convertedSql;
        if (convertedSql.toUpperCase().includes('INSERT')) {
          finalSql = convertedSql.replace(/;?\s*$/, ' RETURNING id');
        }
        
        pool.query(finalSql, convertedParams, (err, result) => {
          if (callback) {
            const context = {
              lastID: result?.rows?.[0]?.id || null,
              changes: result?.rowCount || 0
            };
            callback.call(context, err);
          }
        });
      } catch (e) {
        console.error('db.run error:', e);
        if (callback) callback(e);
      }
    },
    
    get: (sql, params = [], callback) => {
      try {
        const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
        pool.query(convertedSql, convertedParams, (err, result) => {
          if (callback) {
            callback(err, result?.rows?.[0] || null);
          }
        });
      } catch (e) {
        console.error('db.get error:', e);
        if (callback) callback(e);
      }
    },
    
    all: (sql, params = [], callback) => {
      try {
        const { sql: convertedSql, params: convertedParams } = convertQuery(sql, params);
        pool.query(convertedSql, convertedParams, (err, result) => {
          if (callback) {
            callback(err, result?.rows || []);
          }
        });
      } catch (e) {
        console.error('db.all error:', e);
        if (callback) callback(e);
      }
    },
    
    exec: (sql, callback) => {
      try {
        pool.query(sql, (err) => {
          if (callback) callback(err);
        });
      } catch (e) {
        console.error('db.exec error:', e);
        if (callback) callback(e);
      }
    },
    
    serialize: (callback) => {
      if (callback) callback();
    },
    
    close: (callback) => {
      pool.end(() => {
        if (callback) callback();
      });
    }
  };

  console.log('Using PostgreSQL database from Supabase');
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
  console.log('Initializing database tables...');
  
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
      if (err) {
        console.error('Error creating users table:', err);
      } else {
        console.log('✅ Users table ready');
      }
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
      if (err) {
        console.error('Error creating notes table:', err);
      } else {
        console.log('✅ Notes table ready');
      }
    });
  });
}

module.exports = db;
