const express = require('express');
const authController = require('../controllers/authController');
const { validateUser } = require('../middleware/validation');

const router = express.Router();

// Register route
router.post('/register', validateUser, authController.register);

// Login route
router.post('/login', authController.login);

module.exports = router;
