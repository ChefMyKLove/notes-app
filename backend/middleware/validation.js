const validateNote = (req, res, next) => {
  const { title, content } = req.body;

  const errors = [];

  if (!title || typeof title !== 'string') {
    errors.push('Title is required and must be a string');
  } else if (title.trim().length === 0) {
    errors.push('Title cannot be empty');
  } else if (title.length > 255) {
    errors.push('Title cannot exceed 255 characters');
  }

  if (content && typeof content !== 'string' && content !== null) {
    errors.push('Content must be a string');
  } else if (content && content.length > 10000) {
    errors.push('Content cannot exceed 10000 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { username, email, password } = req.body;

  const errors = [];

  if (!username || typeof username !== 'string') {
    errors.push('Username is required and must be a string');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.length > 50) {
    errors.push('Username cannot exceed 50 characters');
  }

  if (!email || typeof email !== 'string') {
    errors.push('Email is required and must be a string');
  } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.push('Invalid email format');
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required and must be a string');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  next();
};

module.exports = { validateNote, validateUser };
