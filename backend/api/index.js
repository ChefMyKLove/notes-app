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
  res.status(200).json({
    success: true,
    message: 'Server is running',
    environment: process.env.NODE_ENV
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
