## Deployment Guide

### Local Development Deployment

See QUICKSTART.md for immediate setup.

### Heroku Deployment

#### Prerequisites
- Heroku account (free tier available)
- Heroku CLI installed
- Git repository initialized

#### Steps

1. **Login to Heroku:**
   ```bash
   heroku login
   ```

2. **Create Heroku app:**
   ```bash
   heroku create your-app-name
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=your_generated_secret_key
   heroku config:set NODE_ENV=production
   ```

4. **Create Procfile in root:**
   ```
   web: cd backend && npm start
   ```

5. **Create package.json in root:**
   ```json
   {
     "name": "note-taking-app",
     "version": "1.0.0",
     "scripts": {
       "start": "cd backend && npm start"
     }
   }
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

7. **View logs:**
   ```bash
   heroku logs --tail
   ```

8. **Frontend deployment to Netlify/Vercel:**
   - Push frontend folder to GitHub
   - Connect GitHub repo to Netlify/Vercel
   - Update API_BASE_URL in app.js
   - Deploy

### DigitalOcean App Platform

1. **Push code to GitHub**

2. **Create App on DigitalOcean:**
   - Connect GitHub repo
   - Select backend folder
   - Set environment variables
   - Deploy

3. **Frontend deployment:**
   - Use Netlify or Vercel (steps above)

### AWS Deployment

#### Elastic Beanstalk

1. **Install AWS CLI:**
   ```bash
   pip install awsebcli
   ```

2. **Initialize EB:**
   ```bash
   eb init -p node.js-18 note-app
   ```

3. **Create environment:**
   ```bash
   eb create production
   ```

4. **Set environment variables:**
   ```bash
   eb setenv JWT_SECRET=your_secret NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   eb deploy
   ```

#### EC2 Manual Deployment

1. **Launch EC2 instance** (Ubuntu 20.04)

2. **SSH into instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-instance-ip
   ```

3. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install nodejs npm git
   ```

4. **Clone repository:**
   ```bash
   git clone your-repo-url
   cd notes/backend
   ```

5. **Install Node dependencies:**
   ```bash
   npm install
   ```

6. **Create .env file:**
   ```bash
   nano .env
   ```

7. **Install PM2 for process management:**
   ```bash
   sudo npm install -g pm2
   ```

8. **Start application:**
   ```bash
   pm2 start server.js --name "notes-app"
   pm2 startup
   pm2 save
   ```

9. **Setup Nginx reverse proxy:**
   ```bash
   sudo apt install nginx
   ```

   Edit `/etc/nginx/sites-available/default`:
   ```nginx
   server {
       listen 80 default_server;
       listen [::]:80 default_server;
       
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

10. **Enable SSL with Let's Encrypt:**
    ```bash
    sudo apt install certbot python3-certbot-nginx
    sudo certbot --nginx -d your-domain.com
    ```

### Docker Deployment

1. **Create Dockerfile in backend:**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY backend/package*.json ./
   RUN npm install
   COPY backend/ ./
   EXPOSE 5000
   CMD ["npm", "start"]
   ```

2. **Create docker-compose.yml in root:**
   ```yaml
   version: '3'
   services:
     backend:
       build: ./
       ports:
         - "5000:5000"
       environment:
         - PORT=5000
         - JWT_SECRET=${JWT_SECRET}
         - NODE_ENV=production
       volumes:
         - ./backend/db:/app/db
     frontend:
       image: nginx:alpine
       ports:
         - "80:80"
       volumes:
         - ./frontend:/usr/share/nginx/html
   ```

3. **Build and run:**
   ```bash
   docker-compose up --build
   ```

### Database Considerations

#### SQLite (Current)
- ✅ No setup required
- ✅ Great for development/small apps
- ❌ Limited concurrent users
- ❌ Not ideal for distributed deployments

#### PostgreSQL (Recommended for production)

1. **Install pg module:**
   ```bash
   npm install pg pg-pool
   ```

2. **Update database.js:**
   ```javascript
   const { Pool } = require('pg');
   
   const pool = new Pool({
     user: process.env.DB_USER,
     host: process.env.DB_HOST,
     database: process.env.DB_NAME,
     password: process.env.DB_PASSWORD,
     port: process.env.DB_PORT || 5432,
   });
   ```

3. **Set environment variables:**
   ```bash
   DB_USER=postgres
   DB_HOST=your-rds-endpoint.amazonaws.com
   DB_NAME=notesdb
   DB_PASSWORD=your_secure_password
   DB_PORT=5432
   ```

### Frontend Deployment Options

#### Netlify

1. Connect GitHub repo
2. Set build command: (none for static HTML)
3. Set publish directory: `frontend`
4. Add environment variable: `REACT_APP_API_URL=https://your-api.com`

#### Vercel

1. Import project from GitHub
2. Set root directory: `frontend`
3. No build step needed
4. Deploy

#### GitHub Pages

1. Build static files
2. Push to gh-pages branch
3. Enable GitHub Pages in settings
4. Configure custom domain

### SSL/TLS Certificate

#### Let's Encrypt (Free)

For Nginx:
```bash
sudo certbot --nginx -d your-domain.com
```

For Apache:
```bash
sudo certbot --apache -d your-domain.com
```

Auto-renewal:
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Performance Optimization

1. **Enable gzip compression:**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

2. **Add caching headers:**
   ```javascript
   app.use(express.static('public', {
     maxAge: '1d'
   }));
   ```

3. **Database indexing:**
   ```sql
   CREATE INDEX idx_user_id ON notes(user_id);
   CREATE INDEX idx_username ON users(username);
   ```

4. **CDN for frontend:**
   - Use Cloudflare or similar
   - Cache static assets
   - DDoS protection

### Monitoring & Logging

#### PM2 Monitoring

```bash
pm2 monit
pm2 logs notes-app
```

#### Cloud Logging

- CloudWatch (AWS)
- Stackdriver (GCP)
- Azure Monitor (Azure)

#### Application Insights

Add to server.js:
```javascript
const logger = require('morgan');
app.use(logger('combined'));
```

### Backup Strategy

1. **Database backups:**
   ```bash
   sqlite3 db/notes.db ".dump" > backup.sql
   ```

2. **Automated backups:**
   - Set cron job on server
   - Upload to S3/Cloud Storage
   - Retain last 30 days

3. **Restore:**
   ```bash
   sqlite3 db/notes.db < backup.sql
   ```

### Zero-Downtime Deployment

1. **Blue-Green Deployment:**
   - Run two production environments
   - Switch load balancer between them
   - Update one while other serves traffic

2. **Rolling Deployment:**
   - Update one instance at a time
   - Keep service running
   - Kubernetes automates this

### Scaling Strategies

**Vertical Scaling:**
- Increase server resources (CPU/RAM)

**Horizontal Scaling:**
- Add multiple server instances
- Use load balancer (nginx, AWS ELB)
- Use sessions store (Redis) instead of JWT

**Database Scaling:**
- Read replicas for PostgreSQL
- Connection pooling
- Caching layer (Redis)

### Cost Optimization

| Platform | Free Tier | Paid |
|----------|-----------|------|
| Heroku | Yes (limited) | $7+/month |
| DigitalOcean | No | $4+/month |
| AWS | 12 months | Variable |
| Netlify | Yes | $19+/month |
| Vercel | Yes | $20+/month |

### Health Check Endpoint

Frontend can monitor backend:
```bash
curl http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Server is running"
}
```

### Rollback Procedure

If deployment fails:

1. **Check logs:**
   ```bash
   heroku logs --tail
   # or
   pm2 logs notes-app
   ```

2. **Rollback to previous version:**
   ```bash
   heroku rollback
   # or
   git revert HEAD
   git push heroku main
   ```

3. **Verify:**
   ```bash
   curl https://your-app.com/api/health
   ```

### Troubleshooting Production Issues

**Application won't start:**
- Check environment variables
- Check database connection
- Review error logs

**High memory usage:**
- Check for memory leaks
- Review database queries
- Consider caching

**Database connection errors:**
- Verify connection string
- Check network connectivity
- Ensure database is running

**CORS errors in production:**
- Update CORS configuration
- Add production domain to whitelist
- Check proxy configuration

### Support & Monitoring Services

- **Sentry** - Error tracking
- **DataDog** - Performance monitoring
- **New Relic** - APM monitoring
- **PagerDuty** - Incident management
- **Uptimerobot** - Uptime monitoring

---

For more information, refer to platform-specific documentation.
