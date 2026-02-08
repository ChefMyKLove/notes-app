# 📝 Accessible Note-Taking App

A **full-featured, accessibility-focused note-taking application** built with Node.js, Express, SQLite, HTML5, CSS3, and vanilla JavaScript. This app prioritizes inclusivity with screen reader support, keyboard navigation, voice-to-text capabilities, and comprehensive accessibility controls.

## 🌟 Key Features

### ✅ User Authentication & Security
- User registration with email validation
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Personalized note collections per user

### ✅ Note Management
- Create, read, update, and delete notes
- Rich text editing capabilities
- Character count tracking (up to 10,000 characters)
- Real-time note list updates

### ✅ **Multi-Language AI Speech Recognition** ⭐ NEW
- Voice-to-text using Vosk offline speech recognition
- Supported languages: English, Portuguese, French, Chinese
- Automatic speech-to-text conversion for hands-free note creation
- Models hosted on Supabase Storage (no server processing required)

### ✅ **Rich Text Editor** ⭐ NEW
- Format text with bold, italic, underline, strikethrough
- Create headers (h1-h6)
- Lists (ordered and unordered)
- Code blocks with syntax highlighting
- Full keyboard support

### ✅ **Comprehensive Accessibility Features** ⭐ NEW
- **ARIA Labels & Roles:** Full semantic HTML for screen readers
- **Keyboard Navigation:** Complete app control via keyboard (Tab, Enter, Arrow keys)
- **Screen Reader Support:** Optimized for NVDA, JAWS, VoiceOver
- **Text-to-Speech:** ReadAloud feature with voice selection
- **Font Size Controls:** Zoom in/out for better readability
- **High Contrast Mode:** Enhanced visibility for visually impaired users
- **Screen Magnifier:** 300x300px magnifier with 2x zoom for precise reading
- **Focus Management:** Clear visual focus indicators
- **Color-Blind Friendly:** Accessible color palette

### ✅ Frontend Interface
- Clean, responsive UI with dark sidebar
- Mobile-friendly design
- Error handling with user feedback
- Real-time character count

### ✅ Backend API
- RESTful API design
- Comprehensive input validation
- Meaningful error handling
- CORS enabled for frontend integration
- SQLite database with proper relationships

## 📋 Project Structure

```
notes-app/
├── backend/
│   ├── api/
│   │   └── index.js              # Main API handler (Vercel)
│   ├── db/
│   │   └── database.js           # SQLite database initialization
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   └── validation.js         # Input validation
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   └── notesRoutes.js        # Notes CRUD endpoints
│   ├── controllers/
│   │   ├── authController.js     # Auth logic
│   │   └── notesController.js    # Notes logic
│   ├── package.json              # Dependencies
│   ├── .env                      # Environment variables
│   └── server.js                 # Express server
├── docs/
│   ├── index.html                # Main application
│   ├── css/
│   │   └── styles.css            # Styling & accessibility
│   └── js/
│       ├── app.js                # Main application logic
│       ├── accessibility-handler.js  # Accessibility features
│       ├── vosk-handler.js       # Speech recognition
│       └── (other utilities)
├── API/
│   └── vosk-proxy.js             # Speech model proxy
├── README.md                     # This file
├── package.json                  # Root dependencies
├── vercel.json                   # Deployment configuration
└── .gitignore                    # Git configuration
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** v14 or higher
- **npm** (Node Package Manager)
- Git (optional)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables:**
   Create a `.env` file in the `backend/` directory:
   ```
   PORT=5000
   JWT_SECRET=generate_a_strong_secret_key_here
   DATABASE_PATH=./db/notes.db
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   npm start
   ```
   Expected output: `Server is running on http://localhost:5000`

### Frontend Setup

1. **Navigate to docs directory:**
   ```bash
   cd docs
   ```

2. **Serve locally** (choose one):
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:8000`

## 🎯 Using the Application

### Getting Started

1. **Register a new account** with username, email, and password
2. **Login** with your credentials
3. **Click "+ New Note"** to create your first note
4. **Use the editor** to write with rich text formatting or voice input
5. **Save** to store your note

### Voice-to-Text (Speech Recognition)

1. In the accessibility panel, click **"Load Model"** for your preferred language
2. Wait for the model to download (~30-90 seconds, first time only)
3. Click **"Start Recording"** when ready
4. Speak naturally into your microphone
5. Your speech is converted to text in real-time
6. Click **"Stop Recording"** when done
7. Text is inserted into your note

**Supported Languages:**
- 🇬🇧 English (40MB)
- 🇵🇹 Portuguese (31MB)
- 🇫🇷 French (41MB)
- 🇨🇳 Chinese (42MB)

### Accessibility Features

**Text-to-Speech (ReadAloud):**
- Click the speaker icon to read your note aloud
- Select from available system voices
- Control playback speed

**Screen Magnifier:**
- Press `Ctrl+Alt+M` or click the magnifier button
- Move your mouse to see 2x magnified area
- Perfect for detailed reading

**Zoom Controls:**
- Use `Ctrl+Plus` to zoom in
- Use `Ctrl+Minus` to zoom out
- Use `Ctrl+0` to reset zoom

**Keyboard Shortcuts:**
| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between elements |
| `Enter` | Submit forms |
| `Ctrl+Alt+M` | Toggle magnifier |
| `Ctrl+Plus` | Zoom in |
| `Ctrl+Minus` | Zoom out |
| `Ctrl+0` | Reset zoom |
| `Shift+F10` | Open context menu |
| `Alt+H` | Focus on heading |

**Rich Text Formatting:**
- **Bold:** `Ctrl+B` or use toolbar
- **Italic:** `Ctrl+I` or use toolbar
- **Underline:** `Ctrl+U` or use toolbar
- **Code Block:** Toolbar button
- **Lists:** Toolbar buttons

### Managing Notes

**View Notes:**
- All your notes appear in the left sidebar
- Click any note to open and edit
- Active note has a blue indicator

**Edit Notes:**
- Click note title to edit the heading
- Edit content in the main editor
- Character count shows progress (0-10,000)
- Click "Save" to store changes

**Delete Notes:**
- Open the note to delete
- Click "Delete" button
- Confirm deletion
- Note is removed from database

**Search & Filter:**
- Notes are sorted by most recently updated
- Sidebar shows last updated date

## 🔐 Security

✅ **Password Security**
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plain text

✅ **Authentication**
- JWT tokens with 7-day expiration
- Token required for all note operations
- Tokens validated on every request

✅ **Authorization**
- Users can only access their own notes
- Database enforces user-note relationships

✅ **Input Validation**
- All inputs validated server-side
- SQL injection prevention via parameterized queries
- XSS protection through proper input handling

✅ **Data Privacy**
- Your notes are personal and encrypted in transit
- Only you can access your notes

## 🌐 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```
POST /api/auth/register

Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secure_password_123"
}

Response (Success):
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

#### Login User
```
POST /api/auth/login

Request:
{
  "username": "john_doe",
  "password": "secure_password_123"
}

Response (Success):
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

### Notes Endpoints

**All endpoints require:** `Authorization: Bearer <token>`

#### Get All Notes
```
GET /api/notes

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My First Note",
      "content": "Note content...",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Note
```
POST /api/notes

Request:
{
  "title": "My Note",
  "content": "Note content"
}

Response:
{
  "success": true,
  "data": {
    "id": 3,
    "title": "My Note",
    "content": "Note content",
    "created_at": "2024-01-17T08:15:00Z"
  }
}
```

#### Update Note
```
PUT /api/notes/:id

Request:
{
  "title": "Updated Title",
  "content": "Updated content"
}

Response:
{
  "success": true,
  "data": { /* updated note */ }
}
```

#### Delete Note
```
DELETE /api/notes/:id

Response:
{
  "success": true,
  "message": "Note deleted successfully"
}
```

## 📚 Database Schema

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

## 🛠 Technologies Used

**Backend:**
- Express.js - Web framework
- SQLite3 - Database
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication
- CORS - Cross-origin requests
- dotenv - Configuration

**Frontend:**
- HTML5 - Semantic markup
- CSS3 - Styling with accessibility
- Vanilla JavaScript - No framework dependencies
- Vosk-Browser - Offline speech recognition
- Fetch API - HTTP requests

**Deployment:**
- Vercel - Frontend & backend hosting
- Supabase Storage - ML model hosting

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```

2. **Create Vercel project:**
   - Go to https://vercel.com
   - Import GitHub repository
   - Set environment variables in dashboard

3. **Deploy:**
   ```bash
   vercel --prod
   ```

4. **Your app is live** at the Vercel URL

## 🧠 Future Enhancements

📌 **Planned Features:**
- Note categories and tags
- Full-text search
- Note sharing between users
- Collaborative editing
- Note history/versioning
- Export to PDF/Markdown/Word
- Dark/Light theme toggle
- Offline support with service workers
- Cloud backup synchronization
- Note encryption
- Custom fonts for dyslexia support
- High DPI (Retina) display support
- Mobile app (iOS/Android)

## 🐛 Troubleshooting

**Backend won't start:**
```bash
# Check if port is in use
netstat -ano | findstr :5000

# Kill process (Windows)
taskkill /PID <PID> /F

# Change port in .env
PORT=5001
```

**CORS errors:**
- Ensure backend is running on http://localhost:5000
- Check frontend URL matches in app.js
- Verify CORS is enabled in backend

**Models not loading:**
- Check internet connection
- Ensure Supabase bucket has public access
- Verify model files exist in Supabase
- Try different language model

**Token expired:**
- Clear browser localStorage
- Re-login
- Tokens expire after 7 days

**Notes not appearing:**
- Check browser console (F12) for errors
- Ensure token is valid
- Try logging out and back in

**Microphone not working:**
- Check browser permissions (allow microphone)
- Ensure HTTPS is enabled
- Try a different browser

## 📞 Support & Feedback

For issues or suggestions:
1. Check this README for troubleshooting
2. Review browser console for error messages
3. Ensure all prerequisites are installed
4. Check network connectivity

## 📄 License

MIT License - Feel free to use for personal and commercial projects

---

**Version:** 2.0.0  
**Last Updated:** February 7, 2026  
**Built with ❤️ for accessibility**
