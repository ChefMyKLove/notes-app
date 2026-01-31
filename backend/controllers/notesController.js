const db = require('../db/database');

const notesController = {
  // Get all notes for the authenticated user
  getAllNotes: (req, res) => {
    const userId = req.userId;

    db.all(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
      (err, notes) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error retrieving notes',
            error: err.message
          });
        }

        res.status(200).json({
          success: true,
          message: 'Notes retrieved successfully',
          data: notes || []
        });
      }
    );
  },

  // Get a single note by ID
  getNoteById: (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    db.get(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId],
      (err, note) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error retrieving note',
            error: err.message
          });
        }

        if (!note) {
          return res.status(404).json({
            success: false,
            message: 'Note not found'
          });
        }

        res.status(200).json({
          success: true,
          message: 'Note retrieved successfully',
          data: note
        });
      }
    );
  },

  // Create a new note
  createNote: (req, res) => {
    const { title, content } = req.body;
    const userId = req.userId;

    db.run(
      'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
      [userId, title, content || ''],
      function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error creating note',
            error: err.message
          });
        }

        res.status(201).json({
          success: true,
          message: 'Note created successfully',
          data: {
            id: this.lastID,
            user_id: userId,
            title,
            content: content || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        });
      }
    );
  },

  // Update a note
  updateNote: (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.userId;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    // Check if note exists and belongs to user
    db.get(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId],
      (err, note) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error retrieving note',
            error: err.message
          });
        }

        if (!note) {
          return res.status(404).json({
            success: false,
            message: 'Note not found'
          });
        }

        db.run(
          'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
          [title, content || '', id, userId],
          function(updateErr) {
            if (updateErr) {
              return res.status(500).json({
                success: false,
                message: 'Error updating note',
                error: updateErr.message
              });
            }

            res.status(200).json({
              success: true,
              message: 'Note updated successfully',
              data: {
                id: parseInt(id),
                user_id: userId,
                title,
                content: content || '',
                created_at: note.created_at,
                updated_at: new Date().toISOString()
              }
            });
          }
        );
      }
    );
  },

  // Delete a note
  deleteNote: (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID'
      });
    }

    // Check if note exists and belongs to user
    db.get(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      [id, userId],
      (err, note) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error retrieving note',
            error: err.message
          });
        }

        if (!note) {
          return res.status(404).json({
            success: false,
            message: 'Note not found'
          });
        }

        db.run(
          'DELETE FROM notes WHERE id = ? AND user_id = ?',
          [id, userId],
          function(deleteErr) {
            if (deleteErr) {
              return res.status(500).json({
                success: false,
                message: 'Error deleting note',
                error: deleteErr.message
              });
            }

            res.status(200).json({
              success: true,
              message: 'Note deleted successfully',
              data: { id: parseInt(id) }
            });
          }
        );
      }
    );
  }
};

module.exports = notesController;
