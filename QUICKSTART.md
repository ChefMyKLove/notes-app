# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### Step 1: Backend Setup

```bash
cd backend
npm install
npm start
```

You should see:
```
Server is running on http://localhost:5000
```

### Step 2: Frontend Setup (New Terminal)

```bash
cd frontend
python -m http.server 8000
```

Or if using Node's http-server:
```bash
npx http-server
```

### Step 3: Open in Browser

Navigate to:
- **http://localhost:8000** (if using Python server)
- **http://localhost:5000** (if using http-server)

### Step 4: Create an Account

1. Click "Register"
2. Fill in username, email, and password
3. Click "Register" button
4. You're now logged in!

### Step 5: Create Your First Note

1. Click "+ New Note"
2. Add a title and content
3. Click "Save"
4. Your note appears in the sidebar!

## 📝 Test the App

**Try these actions:**
- ✅ Create multiple notes
- ✅ Click a note to edit it
- ✅ Update the content and save
- ✅ Delete a note
- ✅ Logout and login again to verify persistence
- ✅ Create a second account to verify user isolation

## 🔐 Default Test Credentials

Create your own during registration. Example:
- **Username:** testuser
- **Email:** test@example.com
- **Password:** password123

## 📱 API Testing

Open another terminal and test the API directly:

```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apiuser",
    "email": "api@test.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "apiuser",
    "password": "password123"
  }'

# Get all notes (replace TOKEN with the token from login response)
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer TOKEN"
```

## ❌ Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 in use | Change PORT in `backend/.env` |
| CORS errors | Ensure backend URL matches in `frontend/js/app.js` |
| Blank page in browser | Check browser console (F12) for errors |
| Can't create account | Check password is at least 6 characters |
| Can't save note | Check note title is not empty |

## 📚 Full Documentation

See `README.md` for complete API documentation and features.

Happy note-taking! 📝✨
