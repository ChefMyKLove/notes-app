const express = require('express');
const notesController = require('../controllers/notesController');
const authMiddleware = require('../middleware/auth');
const { validateNote } = require('../middleware/validation');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all notes
router.get('/', notesController.getAllNotes);

// Get single note
router.get('/:id', notesController.getNoteById);

// Create note
router.post('/', validateNote, notesController.createNote);

// Update note
router.put('/:id', validateNote, notesController.updateNote);

// Delete note
router.delete('/:id', notesController.deleteNote);

module.exports = router;
