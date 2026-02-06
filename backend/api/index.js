require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('../db/database');
const authRoutes = require('../routes/authRoutes');
const notesRoutes = require('../routes/notesRoutes');

const app = express();

// CORS Configuration - Dynamic origin checking
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://chefmyklove.github.io',
      'http://localhost:5500',
      'http://127.0.0.1:5500',
      'http://localhost:8000',
      'http://localhost:3000',
      'http://localhost:5501',
      'http://127.0.0.1:5501',
      'https://notes-app-pink-psi.vercel.app',
      'https://notes-app-slx-sage-36.vercel.app',
      'https://notes-rkvh0so1x-chefmykloves-projects.vercel.app',
      'https://notes-dt3spbm83-chefmykloves-projects.vercel.app',
      'https://notes-et4e0ov04-chefmykloves-projects.vercel.app',
      'https://notes-nsghe730y-chefmykloves-projects.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    // Allow any Vercel URL or localhost
    if (!origin || 
        allowedOrigins.includes(origin) || 
        origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV,
    databaseURL: process.env.DATABASE_URL ? 'CONFIGURED' : 'NOT SET'
  });
});

// Database diagnostic endpoint
app.get('/api/db-test', (req, res) => {
  console.log('DB test endpoint hit');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  
  if (!process.env.DATABASE_URL) {
    return res.status(500).json({
      success: false,
      message: 'DATABASE_URL environment variable not set!',
      NODE_ENV: process.env.NODE_ENV
    });
  }
  
  // Test a simple query
  const db = require('../db/database');
  db.get('SELECT NOW() as current_time', [], (err, row) => {
    if (err) {
      console.error('DB query error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Database query failed',
        error: err.message
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Database connected successfully',
      data: row
    });
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Unknown error'
  });
});

module.exports = app;
