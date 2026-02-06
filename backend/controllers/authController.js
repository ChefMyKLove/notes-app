const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Register a new user
  register: (req, res) => {
    console.log('Register request received:', { username: req.body.username, email: req.body.email });
    
    const { username, email, password } = req.body;

    // Check if user already exists
    db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, user) => {
      if (err) {
        console.error('Database error during user check:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }

      if (user) {
        console.log('User already exists:', username);
        return res.status(409).json({
          success: false,
          message: 'Username or email already exists'
        });
      }

      // Hash password
      bcrypt.hash(password, 10, (hashErr, hashedPassword) => {
        if (hashErr) {
          console.error('Error hashing password:', hashErr);
          return res.status(500).json({
            success: false,
            message: 'Error hashing password',
            error: hashErr.message
          });
        }

        // Insert new user
        console.log('Attempting to insert user:', username);
        db.run(
          'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
          [username, email, hashedPassword],
          function(insertErr) {
            if (insertErr) {
              console.error('Error inserting user:', insertErr);
              return res.status(500).json({
                success: false,
                message: 'Error creating user',
                error: insertErr.message
              });
            }

            console.log('User created successfully with ID:', this.lastID);
            const token = jwt.sign(
              { userId: this.lastID, username },
              process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
              { expiresIn: '7d' }
            );

            res.status(201).json({
              success: true,
              message: 'User registered successfully',
              data: {
                userId: this.lastID,
                username,
                email,
                token
              }
            });
          }
        );
      });
    });
  },

  // Login user
  login: (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Database error',
          error: err.message
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid username or password'
        });
      }

      // Compare passwords
      bcrypt.compare(password, user.password, (compareErr, isMatch) => {
        if (compareErr) {
          return res.status(500).json({
            success: false,
            message: 'Error comparing passwords',
            error: compareErr.message
          });
        }

        if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: 'Invalid username or password'
          });
        }

        const token = jwt.sign(
          { userId: user.id, username: user.username },
          process.env.JWT_SECRET || 'your_secret_key_here_change_in_production',
          { expiresIn: '7d' }
        );

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: {
            userId: user.id,
            username: user.username,
            email: user.email,
            token
          }
        });
      });
    });
  }
};

module.exports = authController;
