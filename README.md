# Note-Taking App

A full-stack note-taking application built with Node.js, Express, SQLite, HTML5, CSS3, and vanilla JavaScript. This application allows users to create personalized accounts, authenticate securely, and manage their personal note collections with full CRUD operations.

## Features

✅ **User Authentication**
- User registration with email validation
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Personalized note collections per user

✅ **Note Management**
- Create new notes with title and content
- Read all personal notes
- Update existing notes
- Delete notes
- Character count for content

✅ **Frontend Interface**
- Clean, responsive UI with dark sidebar
- Real-time note list updates
- Rich note editor
- Error handling and user feedback
- Mobile-friendly design

✅ **Backend API**
- RESTful API design
- Comprehensive input validation
- Error handling with meaningful messages
- CORS enabled for frontend integration
- SQLite database with proper relationships

## Project Structure

```
notes/
├── backend/
│   ├── db/
│   │   └── database.js          # SQLite database initialization
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── validation.js        # Input validation middleware
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication endpoints
│   │   └── notesRoutes.js       # Notes CRUD endpoints
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   └── notesController.js   # Notes logic
│   ├── package.json             # Backend dependencies
│   ├── .env.example             # Environment variables template
│   ├── .gitignore               # Git ignore rules
│   └── server.js                # Main Express server
└── frontend/
    ├── css/
    │   └── styles.css           # Application styling
    ├── js/
    │   └── app.js               # Main application logic
    └── index.html               # Main HTML file
```

## Installation & Setup

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** (Node Package Manager)
- **Git** (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update values (especially `JWT_SECRET` for production):
   ```
   PORT=5000
   JWT_SECRET=your_secret_key_here_change_in_production
   DATABASE_PATH=./db/notes.db
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   
   You should see:
   ```
   Server is running on http://localhost:5000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Open in browser:**
   - Simply open `index.html` in your web browser, or
   - Use a local server (Python, Node.js, etc.):
     ```bash
     # Using Python 3
     python -m http.server 8000
     
     # Or using Node.js http-server (install: npm install -g http-server)
     http-server
     ```

3. **Access the application:**
   - Open your browser and navigate to `http://localhost:8000` (or the appropriate port)

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
- **Endpoint:** `POST /auth/register`
- **Description:** Create a new user account
- **Request Body:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password_123"
  }
  ```
- **Validation Rules:**
  - Username: 3-50 characters
  - Email: Valid email format
  - Password: Minimum 6 characters
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": [
      "Username must be at least 3 characters long",
      "Invalid email format"
    ]
  }
  ```

#### Login User
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate and receive JWT token
- **Request Body:**
  ```json
  {
    "username": "john_doe",
    "password": "secure_password_123"
  }
  ```
- **Response (Success):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "userId": 1,
      "username": "john_doe",
      "email": "john@example.com",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Response (Error):**
  ```json
  {
    "success": false,
    "message": "Invalid username or password"
  }
  ```

### Notes Endpoints

**All notes endpoints require authentication:**
- Include `Authorization: Bearer <token>` header in all requests

#### Get All Notes
- **Endpoint:** `GET /notes`
- **Description:** Retrieve all notes for the authenticated user
- **Headers:**
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "Notes retrieved successfully",
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "title": "My First Note",
        "content": "This is my first note content",
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "title": "Shopping List",
        "content": "Milk, eggs, bread",
        "created_at": "2024-01-16T14:20:00.000Z",
        "updated_at": "2024-01-16T14:20:00.000Z"
      }
    ]
  }
  ```

#### Get Single Note
- **Endpoint:** `GET /notes/:id`
- **Description:** Retrieve a specific note by ID
- **Parameters:**
  - `id` (integer): Note ID
- **Response:**
  ```json
  {
    "success": true,
    "message": "Note retrieved successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "title": "My First Note",
      "content": "This is my first note content",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "Note not found"
  }
  ```

#### Create Note
- **Endpoint:** `POST /notes`
- **Description:** Create a new note
- **Request Body:**
  ```json
  {
    "title": "My New Note",
    "content": "This is the content of my note"
  }
  ```
- **Validation Rules:**
  - Title: Required, 1-255 characters
  - Content: Optional, maximum 10,000 characters
- **Response:**
  ```json
  {
    "success": true,
    "message": "Note created successfully",
    "data": {
      "id": 3,
      "user_id": 1,
      "title": "My New Note",
      "content": "This is the content of my note",
      "created_at": "2024-01-17T08:15:00.000Z",
      "updated_at": "2024-01-17T08:15:00.000Z"
    }
  }
  ```

#### Update Note
- **Endpoint:** `PUT /notes/:id`
- **Description:** Update an existing note
- **Parameters:**
  - `id` (integer): Note ID
- **Request Body:**
  ```json
  {
    "title": "Updated Title",
    "content": "Updated content"
  }
  ```
- **Validation Rules:**
  - Title: Required, 1-255 characters
  - Content: Optional, maximum 10,000 characters
- **Response:**
  ```json
  {
    "success": true,
    "message": "Note updated successfully",
    "data": {
      "id": 3,
      "user_id": 1,
      "title": "Updated Title",
      "content": "Updated content",
      "created_at": "2024-01-17T08:15:00.000Z",
      "updated_at": "2024-01-17T09:20:00.000Z"
    }
  }
  ```

#### Delete Note
- **Endpoint:** `DELETE /notes/:id`
- **Description:** Delete a note
- **Parameters:**
  - `id` (integer): Note ID
- **Response:**
  ```json
  {
    "success": true,
    "message": "Note deleted successfully",
    "data": {
      "id": 3
    }
  }
  ```
- **Error Response:**
  ```json
  {
    "success": false,
    "message": "Note not found"
  }
  ```

### Error Handling

Common error scenarios:

**Unauthorized (401):**
```json
{
  "success": false,
  "message": "No token provided. Please log in."
}
```

**Invalid Input (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["Title cannot be empty"]
}
```

**Not Found (404):**
```json
{
  "success": false,
  "message": "Note not found"
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details"
}
```

## Usage Examples

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "secure_password"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "secure_password"
  }'
```

**Get All Notes (replace TOKEN with actual token):**
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer TOKEN"
```

**Create Note:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "My Note",
    "content": "Note content"
  }'
```

**Update Note (replace ID with actual note ID):**
```bash
curl -X PUT http://localhost:5000/api/notes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "title": "Updated Note",
    "content": "Updated content"
  }'
```

**Delete Note:**
```bash
curl -X DELETE http://localhost:5000/api/notes/1 \
  -H "Authorization: Bearer TOKEN"
```

## Security Features

✅ **Password Security**
- Passwords hashed using bcryptjs with 10 salt rounds
- Never stored in plain text

✅ **Authentication**
- JWT tokens with 7-day expiration
- Token required for all note operations
- Tokens validated on every protected route

✅ **Authorization**
- Users can only access their own notes
- Database enforces user-note relationship with foreign keys

✅ **Input Validation**
- All user inputs validated server-side
- SQL injection prevented with parameterized queries
- XSS protection through proper input handling

✅ **CORS**
- Configured to accept requests from frontend
- Prevents unauthorized cross-origin requests

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Notes Table
```sql
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Technologies Used

**Backend:**
- **Express.js** - Web framework
- **SQLite3** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment configuration

**Frontend:**
- **HTML5** - Structure
- **CSS3** - Styling with CSS variables
- **Vanilla JavaScript** - Application logic
- **Fetch API** - HTTP requests

## Future Enhancements

📝 Potential features for future versions:
- Note categories/tags
- Search functionality
- Note sharing between users
- Rich text editor
- Note history/versioning
- Dark mode toggle
- Export notes to PDF/Markdown
- Collaborative editing
- Offline support with service workers
- Cloud synchronization

## Troubleshooting

**Port 5000 already in use:**
- Change PORT in `.env` file or kill existing process
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`

**CORS errors:**
- Ensure backend is running on http://localhost:5000
- Check frontend URL in browser matches API_BASE_URL in `js/app.js`

**Database errors:**
- Delete `db/notes.db` to reset database (will lose all data)
- Ensure `db` directory is writable

**Token expired:**
- Clear browser localStorage and re-login
- Tokens expire after 7 days

**Blank notes list:**
- Check browser console for errors (F12)
- Ensure JWT token is valid
- Try logging out and logging back in

## Development Notes

### Running Both Backend and Frontend

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   python -m http.server 8000
   # or
   http-server
   ```

3. Open browser to frontend URL (usually `http://localhost:8000`)

### Database Management

The SQLite database is automatically created on first run. To reset:
```bash
# Delete the database file
rm db/notes.db

# Restart the server to recreate
npm start
```

### JWT Token Debugging

Decode JWT tokens at [jwt.io](https://jwt.io) for debugging purposes.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues or questions, please refer to the project documentation or contact the development team.

---

**Last Updated:** December 16, 2024
**Version:** 1.0.0
