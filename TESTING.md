## Testing Guide

### Manual Testing Checklist

#### 1. Authentication Testing

- [ ] **Register new user**
  - Empty fields validation
  - Password < 6 characters validation
  - Duplicate username/email rejection
  - Successful registration and auto-login

- [ ] **Login**
  - Invalid credentials rejection
  - Successful login with valid credentials
  - Token generation and storage
  - Auto-redirect to notes page

- [ ] **Logout**
  - Confirm logout dialog appears
  - Token cleared from localStorage
  - Redirected to login page
  - Cannot access app without re-login

#### 2. Note Creation Testing

- [ ] **Create empty note**
  - Empty title validation error
  - Can't save without title

- [ ] **Create basic note**
  - Title saved correctly
  - Content saved correctly
  - Note appears in sidebar
  - Timestamps correct

- [ ] **Create note with max content**
  - 10,000 character limit enforced
  - Character counter updates
  - Note saves successfully

- [ ] **Multiple notes**
  - All notes display in sidebar
  - Can switch between notes
  - Each note shows correct content

#### 3. Note Editing Testing

- [ ] **Edit note**
  - Select note from sidebar
  - Modify title
  - Modify content
  - Save changes
  - Verify updated_at timestamp changed

- [ ] **Edit validation**
  - Cannot save empty title
  - Content limit enforced
  - Error messages display

- [ ] **Cancel editing**
  - Changes discarded
  - Sidebar updates
  - Empty state shows if no notes

#### 4. Note Deletion Testing

- [ ] **Delete note**
  - Confirmation dialog appears
  - Note removed from database
  - Note removed from sidebar
  - Empty state shows if last note

- [ ] **Delete while editing**
  - Delete button present
  - Deletes and returns to empty state

#### 5. UI/UX Testing

- [ ] **Responsive design**
  - Mobile view (< 768px)
  - Tablet view (768px - 1024px)
  - Desktop view (> 1024px)
  - Buttons clickable on all sizes

- [ ] **Error display**
  - Error messages visible
  - Error messages clear on success
  - No overlapping errors

- [ ] **Loading states**
  - App doesn't freeze during API calls
  - User can't accidentally create duplicates
  - Logout completes successfully

#### 6. Data Persistence Testing

- [ ] **Refresh page**
  - User still logged in
  - Notes still available
  - Correct note content shown

- [ ] **Multiple users**
  - Create second account
  - Login with first account - only their notes show
  - Login with second account - only their notes show
  - Logout/login cycles work correctly

#### 7. Cross-browser Testing

Test on:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### API Testing with cURL

#### Register Multiple Users

```bash
# User 1
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "alice",
    "email": "alice@test.com",
    "password": "password123"
  }'

# User 2
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "bob",
    "email": "bob@test.com",
    "password": "password123"
  }'
```

#### Test Authentication

```bash
# Valid login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "password123"}'

# Invalid login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "wrongpassword"}'

# Invalid username
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "nonexistent", "password": "password123"}'
```

#### Test Notes CRUD

Save token from login response:
```bash
TOKEN="<token-from-login-response>"
```

**Get notes (no notes yet):**
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN"
```

**Create note:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Note",
    "content": "This is a test note"
  }'
```

Save the returned ID: `"id": 1`

**Get all notes:**
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN"
```

**Get single note:**
```bash
curl -X GET http://localhost:5000/api/notes/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Update note:**
```bash
curl -X PUT http://localhost:5000/api/notes/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

**Delete note:**
```bash
curl -X DELETE http://localhost:5000/api/notes/1 \
  -H "Authorization: Bearer $TOKEN"
```

**Verify deletion:**
```bash
curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN"
```

### Validation Testing

#### Invalid Requests

**No token:**
```bash
curl -X GET http://localhost:5000/api/notes
# Expected: 401 Unauthorized
```

**Empty title:**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "", "content": "text"}'
# Expected: 400 Bad Request
```

**Title too long (> 255 chars):**
```bash
curl -X POST http://localhost:5000/api/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title": "'$(printf 'a%.0s' {1..256})'", "content": "text"}'
# Expected: 400 Bad Request
```

**Invalid note ID:**
```bash
curl -X GET http://localhost:5000/api/notes/invalid \
  -H "Authorization: Bearer $TOKEN"
# Expected: 400 Bad Request

curl -X GET http://localhost:5000/api/notes/99999 \
  -H "Authorization: Bearer $TOKEN"
# Expected: 404 Not Found
```

### Performance Testing

**Create 100 notes:**
```bash
for i in {1..100}; do
  curl -X POST http://localhost:5000/api/notes \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"title\": \"Note $i\", \"content\": \"Content $i\"}"
done
```

**Measure response time:**
```bash
time curl -X GET http://localhost:5000/api/notes \
  -H "Authorization: Bearer $TOKEN"
```

### Browser DevTools Testing

1. **Open DevTools** (F12 or Right-click → Inspect)
2. **Network tab:**
   - Create/update/delete note
   - Verify requests to /api/notes
   - Check response codes (201 create, 200 success)
   - Verify Authorization header present

3. **Application tab:**
   - Check localStorage has 'token' and 'currentUser'
   - Verify token format (JWT three parts with dots)
   - Token cleared on logout

4. **Console tab:**
   - No JavaScript errors
   - API responses logged correctly
   - No CORS errors

### Security Testing

- [ ] **XSS Prevention**
  - Try adding `<script>alert('xss')</script>` in note title
  - Verify it's displayed as text, not executed

- [ ] **SQL Injection Prevention**
  - Try adding `'; DROP TABLE notes; --` in note title
  - Verify database still intact

- [ ] **Authentication bypass**
  - Try accessing `/api/notes` without token
  - Try accessing other user's notes (if possible to intercept)
  - Verify authorization fails

- [ ] **Password security**
  - Create account with password
  - Check database - password not stored plaintext
  - Verify bcryptjs hash in SQLite

### Regression Testing Checklist

After any code changes, verify:
- [ ] Register still works
- [ ] Login still works
- [ ] Create note still works
- [ ] Read notes still works
- [ ] Update note still works
- [ ] Delete note still works
- [ ] Logout still works
- [ ] No console errors
- [ ] No new bugs introduced

### Automated Testing (Future Enhancement)

Consider adding:
- Jest for unit tests
- Supertest for API tests
- Cypress for E2E tests

Example test structure:
```
tests/
├── unit/
│   ├── authController.test.js
│   └── notesController.test.js
├── api/
│   ├── auth.api.test.js
│   └── notes.api.test.js
└── e2e/
    └── app.e2e.spec.js
```

### Known Issues & Edge Cases

Document any found:
- Issue: [Description]
- Reproduction: [Steps]
- Expected: [What should happen]
- Actual: [What actually happens]
- Fix: [If known]
