require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db/database');
const authRoutes = require('./routes/authRoutes');
const notesRoutes = require('./routes/notesRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
 const corsOptions = {
  origin: [
    'https://chefmyklove.github.io',
    'http://localhost:5500',      
    'http://127.0.0.1:5500',      
    'http://localhost:8000',
    'http://localhost:3000',
    'http://localhost:5501',      
    'http://127.0.0.1:5501',
   'https://notes-app-pink-psi.vercel.app',
   'https://notes-app-slx-sage-36.vercel.app'
    
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running'
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
    error: err.message
  });
});

// Only listen on port in development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('API Documentation:');
    console.log('  POST   /api/auth/register - Register a new user');
    console.log('  POST   /api/auth/login - Login user');
    console.log('  GET    /api/notes - Get all notes (requires auth)');
    console.log('  GET    /api/notes/:id - Get single note (requires auth)');
    console.log('  POST   /api/notes - Create note (requires auth)');
    console.log('  PUT    /api/notes/:id - Update note (requires auth)');
    console.log('  DELETE /api/notes/:id - Delete note (requires auth)');
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing server...');
  db.close((err) => {
    if (err) console.error('Error closing database:', err);
    else console.log('Database connection closed');
    process.exit(0);
  });
});

// Export for Vercel serverless
module.exports = app;
