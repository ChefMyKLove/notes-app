## Environment Configuration

### Backend Environment Variables (.env)

Copy `.env.example` to `.env` and configure:

```env
# Server Port
PORT=5000

# JWT Configuration
# Change this to a strong secret key in production!
# Generate one: openssl rand -hex 32
JWT_SECRET=your_secret_key_here_change_in_production

# Database
DATABASE_PATH=./db/notes.db

# Environment
NODE_ENV=development
```

### Environment Details

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 5000 | Server port number |
| `JWT_SECRET` | your_secret_key_here_change_in_production | JWT signing secret (MUST change for production) |
| `DATABASE_PATH` | ./db/notes.db | SQLite database file location |
| `NODE_ENV` | development | Node environment (development/production) |

### Production Configuration

For production deployment:

1. **Generate a secure JWT_SECRET:**
   ```bash
   # macOS/Linux
   openssl rand -hex 32
   
   # Windows PowerShell
   [Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256})) -replace '\+|/|=' 
   ```

2. **Update .env:**
   ```env
   PORT=5000
   JWT_SECRET=<generated-secret-key>
   DATABASE_PATH=./db/notes.db
   NODE_ENV=production
   ```

3. **Use a reverse proxy** (nginx/Apache) in front of Node

4. **Enable HTTPS** with proper SSL certificates

5. **Consider database migration** to PostgreSQL or MySQL for scalability

### Frontend Configuration

The frontend is configured in `frontend/js/app.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

**For production, change to your server URL:**
```javascript
const API_BASE_URL = 'https://api.yourdomain.com/api';
```

### Database Configuration

SQLite database is automatically created at `backend/db/notes.db`

**For PostgreSQL/MySQL**, modify `backend/db/database.js` to use a different driver:

```bash
npm install pg pg-pool
# or
npm install mysql2
```

### Docker Configuration (Optional)

For containerized deployment, create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend/ ./

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t note-app .
docker run -p 5000:5000 -e JWT_SECRET=<your-secret> note-app
```

### Debugging Configuration

Enable debug mode by adding to `.env`:

```env
DEBUG=*
```

Or for specific modules:

```env
DEBUG=express:*
```

Then run:
```bash
npm start
```

You'll see detailed debug information in console.
