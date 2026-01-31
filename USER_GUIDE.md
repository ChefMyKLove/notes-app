# 🎨 User Guide - How to Use the Note-Taking App

## First Time Users

### Step 1: Start the Application

**Backend:**
```bash
cd backend
npm install              # Only first time
npm start               # Should see "Server is running on http://localhost:5000"
```

**Frontend (new terminal):**
```bash
cd frontend
python -m http.server 8000  # Or use http-server
```

**Open Browser:**
- Navigate to `http://localhost:8000`

### Step 2: Register Your Account

You'll see the login screen:

```
┌─────────────────────────────────────────┐
│                                         │
│         Note-Taking App                 │
│                                         │
│     ┌──────────────────────────┐       │
│     │      LOGIN               │       │
│     │                          │       │
│     │ Username: ________       │       │
│     │ Password: ________       │       │
│     │                          │       │
│     │ [  Login Button  ]       │       │
│     │                          │       │
│     │ Don't have an account?   │       │
│     │ [  Register  ]           │       │
│     └──────────────────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

Click "Register" to switch to the registration form:

```
┌─────────────────────────────────────────┐
│         Note-Taking App                 │
│                                         │
│     ┌──────────────────────────┐       │
│     │    REGISTER              │       │
│     │                          │       │
│     │ Username: ________       │       │
│     │ Email:    ________       │       │
│     │ Password: ________       │       │
│     │                          │       │
│     │ [  Register Button  ]    │       │
│     │                          │       │
│     │ Already have an account? │       │
│     │ [  Login  ]              │       │
│     └──────────────────────────┘       │
│                                         │
└─────────────────────────────────────────┘
```

**Enter:**
- **Username:** e.g., `john_doe` (3-50 characters)
- **Email:** e.g., `john@example.com`
- **Password:** e.g., `SecurePassword123` (6+ characters)

Click "Register" button.

### Step 3: Login

After registration, you're automatically logged in. You'll see the main app:

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│ ┌────────────────────┐ ┌──────────────────────────────┐ │
│ │      SIDEBAR       │ │       MAIN EDITOR            │ │
│ │                    │ │                              │ │
│ │ Notes              │ │  No notes yet                │ │
│ │ ────────────────   │ │                              │ │
│ │ [Logout]           │ │  Create your first note to   │ │
│ │                    │ │  get started!                │ │
│ │ Welcome, john_doe  │ │                              │ │
│ │                    │ │  [  Create Note  ]           │ │
│ │ [+ New Note]       │ │                              │ │
│ │                    │ │                              │ │
│ │ (empty list)       │ │                              │ │
│ │                    │ │                              │ │
│ └────────────────────┘ └──────────────────────────────┘ │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## Creating Your First Note

### Click "+ New Note"

The editor will appear:

```
┌──────────────────────────────────────────────────────────┐
│ ┌────────────────────┐ ┌──────────────────────────────┐ │
│ │      SIDEBAR       │ │  [Note Title Input]          │ │
│ │                    │ │  [Save] [Delete] [Cancel]    │ │
│ │ Notes              │ │ ──────────────────────────── │ │
│ │ ────────────────   │ │ │                            │ │
│ │ [Logout]           │ │ │ Start typing your note...   │ │
│ │                    │ │ │                            │ │
│ │ Welcome, john_doe  │ │ │                            │ │
│ │                    │ │ │                            │ │
│ │ [+ New Note]       │ │ │                            │ │
│ │                    │ │ │                            │ │
│ │ (empty list)       │ │ 0 / 10000 characters        │ │
│ │                    │ │                              │ │
│ └────────────────────┘ └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Fill in Your Note

1. **Click in the title field** and type: `My First Note`
2. **Click in the content area** and type:
   ```
   This is my first note in the Note-Taking App.
   
   I can write multiple lines.
   The character counter helps me track my content.
   ```

### Save the Note

Click the "Save" button. Your note will be saved and:
- ✅ Stored in the database
- ✅ Appears in the sidebar
- ✅ Editor clears for next note

Result:

```
┌──────────────────────────────────────────────────────────┐
│ ┌────────────────────┐ ┌──────────────────────────────┐ │
│ │      SIDEBAR       │ │  No notes yet                │ │
│ │                    │ │                              │ │
│ │ Notes              │ │  Create your first note to   │ │
│ │ ────────────────   │ │  get started!                │ │
│ │ [Logout]           │ │                              │ │
│ │                    │ │  [  Create Note  ]           │ │
│ │ Welcome, john_doe  │ │                              │ │
│ │                    │ │                              │ │
│ │ [+ New Note]       │ │                              │ │
│ │                    │ │                              │ │
│ │ ┌──────────────┐   │ │                              │ │
│ │ │ My First...  │   │ │                              │ │
│ │ └──────────────┘   │ │                              │ │
│ │                    │ │                              │ │
│ └────────────────────┘ └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

## Managing Your Notes

### View All Notes

Your notes appear in the sidebar. Click any note to view or edit it:

```
┌──────────────────────────────────────────────────────────┐
│ ┌────────────────────┐ ┌──────────────────────────────┐ │
│ │ Notes              │ │  My First Note               │ │
│ │ ────────────────   │ │  [Save] [Delete] [Cancel]    │ │
│ │ [Logout]           │ │ ──────────────────────────── │ │
│ │                    │ │ │ This is my first note...   │ │
│ │ Welcome, john_doe  │ │ │                            │ │
│ │                    │ │ │ I can write multiple lines.│ │
│ │ [+ New Note]       │ │ │                            │ │
│ │                    │ │ │                            │ │
│ │ ┌──────────────┐   │ │ 67 / 10000 characters       │ │
│ │ │►My First...  │   │ │                              │ │
│ │ └──────────────┘   │ │ (► indicates active note)    │ │
│ │ ┌──────────────┐   │ │                              │ │
│ │ │ My Second... │   │ │                              │ │
│ │ └──────────────┘   │ │                              │ │
│ │ ┌──────────────┐   │ │                              │ │
│ │ │ My Third...  │   │ │                              │ │
│ │ └──────────────┘   │ │                              │ │
│ └────────────────────┘ └──────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

### Edit a Note

1. Click any note in the sidebar to open it
2. Edit the title or content
3. Click "Save" button
4. Changes are saved

### Delete a Note

1. Open the note you want to delete
2. Click "Delete" button
3. Confirm deletion when asked
4. Note is removed from database and sidebar

### Character Counter

The character counter shows your progress:
- **Format:** `Current / Maximum`
- **Example:** `150 / 10000`
- **Feature:** Prevents you from exceeding 10,000 characters

### Cancel Editing

Click "Cancel" to:
- Discard unsaved changes
- Return to empty state
- Reload sidebar

## Account Management

### View Your Account

Your username appears at the top of the sidebar:
```
Welcome, john_doe
```

### Logout

Click the "Logout" button in the sidebar:
```
[Logout]
```

You'll be asked to confirm. After confirming:
- ✅ Logged out of app
- ✅ Token removed
- ✅ Redirected to login screen
- ✅ Your notes are safe in the database

### Login Again

After logout, login with your credentials:
1. Username: `john_doe`
2. Password: `SecurePassword123`
3. Click "Login"
4. You'll see all your saved notes

## Tips & Tricks

### 💡 Best Practices

1. **Use Clear Titles:** Make note titles descriptive
   ```
   Good: "Meeting with Sarah - Q4 Planning"
   Bad: "Note 1"
   ```

2. **Organize Thoughts:** Use line breaks for readability
   ```
   Grocery List
   - Milk
   - Eggs
   - Bread
   ```

3. **Save Frequently:** Click Save after each change

4. **Monitor Character Count:** Watch the counter to stay within limit

### 🎨 Keyboard Shortcuts

- **Tab:** Move between fields
- **Enter:** Submit form (with Ctrl in textarea)
- **Ctrl+A:** Select all text

### 📱 Mobile Usage

The app works on mobile! Try:
- Rotating your device
- Using touch to edit
- Pinch to zoom if needed

### 🔐 Security Notes

- Never share your password
- Your notes are private
- Only you can see your notes
- Passwords are securely hashed

## Troubleshooting

### "I forgot my password"
- Create a new account with different username
- (Future feature: password reset)

### "My note disappeared"
- Check sidebar - might be off-screen
- Try refreshing the page (F5)
- Notes are saved in database

### "I get an error when saving"
- Check that title is not empty
- Check that content is under 10,000 characters
- See detailed error message in UI

### "The app won't load"
- Check backend is running: `http://localhost:5000/api/health`
- Check frontend is running: `http://localhost:8000`
- Check browser console (F12) for errors
- Try refreshing page (F5)

### "I'm having connection issues"
- Ensure backend server is running
- Ensure frontend server is running
- Check firewall isn't blocking ports
- Try using `localhost` instead of `127.0.0.1`

## Common Tasks

### Create a Daily Journal Entry

1. Click "+ New Note"
2. Title: `Daily Journal - December 16, 2024`
3. Content:
   ```
   Today's Accomplishments:
   - Completed project
   - Organized files
   - Learned new features
   
   Tomorrow's Goals:
   - Review feedback
   - Plan enhancements
   - Test thoroughly
   ```
4. Click Save

### Make a To-Do List

1. Click "+ New Note"
2. Title: `Task List`
3. Content:
   ```
   ☐ Buy groceries
   ☐ Finish report
   ☐ Call Sarah
   ☐ Fix bug
   ☐ Meeting at 3pm
   ```
4. Edit to check off items as you complete them

### Keep Meeting Notes

1. Click "+ New Note"
2. Title: `Q4 Planning Meeting - Dec 16`
3. Content:
   ```
   Attendees: Sarah, Mike, Jane
   
   Key Topics:
   - Budget review
   - Resource allocation
   - Timeline updates
   
   Action Items:
   - Send follow-up email
   - Update spreadsheet
   ```
4. Save and reference later

## Frequently Asked Questions

**Q: Where are my notes stored?**
A: In a SQLite database on the server at `backend/db/notes.db`

**Q: Can I share notes?**
A: Not in version 1.0. Future enhancement planned.

**Q: Can I export notes?**
A: Not in version 1.0. Manual copy/paste works.

**Q: Is my data secure?**
A: Yes! Passwords are hashed, and you can only access your own notes.

**Q: Can I delete my account?**
A: Not in version 1.0. All notes are deleted when not accessing.

**Q: How long do notes last?**
A: Forever! Until you delete them.

**Q: Can I access notes from my phone?**
A: Yes! The app is responsive and works on mobile.

**Q: What's the maximum note length?**
A: 10,000 characters per note.

**Q: Can I edit the title?**
A: Yes! Just click in the title field and change it, then save.

## Getting Help

- **Can't login?** Check username and password
- **Notes not saving?** Verify backend is running
- **UI looks broken?** Try refreshing (F5)
- **Still stuck?** See README.md for troubleshooting

---

**Happy Note-Taking! 📝✨**

**Questions?** Check README.md or DOCUMENTATION_INDEX.md
