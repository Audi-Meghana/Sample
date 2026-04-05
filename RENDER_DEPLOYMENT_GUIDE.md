# Render Deployment Guide - AIgNOZ Backend

## Overview
This guide provides step-by-step instructions to deploy the AIgNOZ backend on Render.com with MongoDB Atlas as the database.

## Prerequisites
- Render account (https://render.com)
- MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
- GitHub repository with the code
- Docker image ready (Dockerfile is included)

---

## Step 1: Set Up MongoDB Atlas

### 1.1 Create MongoDB Atlas Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new project
3. Create a Cluster (M0 free tier is sufficient for testing)
4. Wait for cluster to initialize

### 1.2 Create Database User
1. Go to **Database Access** → **Add New Database User**
2. Choose **Password** authentication
3. Username: `aignoz_user`
4. Password: Generate a strong password and save it securely
5. Set Database User Privileges to **Atlas Admin**

### 1.3 Get Connection String
1. Go to **Clusters** → **Connect**
2. Choose **Drivers** → **Node.js**
3. Copy the connection string
4. Replace `<password>` with your database password
5. Replace `myFirstDatabase` with `aignoz`
6. Example: `mongodb+srv://aignoz_user:PASSWORD@cluster.mongodb.net/aignoz?retryWrites=true&w=majority`

### 1.4 Whitelist IPs
1. Go to **Network Access**
2. Click **Add IP Address**
3. Select **Allow Access from Anywhere** (0.0.0.0/0) for development
4. Click **Confirm**

---

## Step 2: Deploy on Render

### 2.1 Connect GitHub Repository
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub account
4. Select your repository

### 2.2 Configure Web Service

| Setting | Value |
|---------|-------|
| **Name** | aignoz-backend |
| **Environment** | Docker |
| **Region** | Select closest to your users (US, EU, etc.) |
| **Branch** | main (or your default branch) |
| **Build Command** | Leave empty (Docker will handle it) |
| **Start Command** | Leave empty (Docker will handle it) |

### 2.3 Set Environment Variables

Click **Advanced** and add these environment variables:

```
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://aignoz_user:YOUR_PASSWORD@cluster.mongodb.net/aignoz?retryWrites=true&w=majority
FASTAPI_URL=http://127.0.0.1:8000
JWT_SECRET=your_strong_jwt_secret_key_here
FRONTEND_URL=https://your-frontend-url.com
```

### 2.4 Configure Build Settings
- **Dockerfile Path**: `./Dockerfile`
- **Docker Compose File** (if using): `./docker-compose.yml`

### 2.5 Deploy
1. Click **Create Web Service**
2. Render will automatically build and deploy
3. Watch the deployment logs to ensure everything starts correctly
4. After successful deployment, you'll get a URL like: `https://aignoz-backend.onrender.com`

---

## Step 3: Verify Deployment

### 3.1 Check Health Endpoint
```bash
curl https://your-service-url.onrender.com/health
```
Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### 3.2 Check Logs
1. In Render Dashboard, select your service
2. Go to **Logs** tab
3. Look for:
   - "FastAPI service on port 8000" ✓
   - "Server running on port 3000" ✓
   - "MongoDB Connected ✓" ✓

### 3.3 Test MongoDB Connection
```bash
curl https://your-service-url.onrender.com/api/gene
```
If database is connected, should return data or 200 status.

---

## Step 4: Important Configuration Notes

### Port Configuration
- **Node.js Server**: Runs on `PORT` (provided by Render, auto-set to 3000)
- **FastAPI Service**: Runs on port 8000 internally (not exposed to internet)
- **Communication**: Services communicate via `http://127.0.0.1:8000`

### Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Port for Express server | `3000` |
| `NODE_ENV` | Application environment | `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://...` |
| `FASTAPI_URL` | Internal FastAPI service URL | `http://127.0.0.1:8000` |
| `JWT_SECRET` | Secret for JWT token signing | Complex string |
| `FRONTEND_URL` | Frontend application URL | `https://frontend.com` |

### File Upload Handling
- Uploads are stored in `/app/backend/uploads`
- For production, consider using cloud storage (AWS S3, Google Cloud Storage)
- Render's file system is ephemeral - files will be lost on redeployment

---

## Step 5: Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
1. Verify MongoDB URI in environment variables
2. Check IP whitelist in MongoDB Atlas
3. Ensure password is URL-encoded if it contains special characters

### Issue: "FastAPI service not responding"
**Solution:**
1. Check if `requirements.txt` includes all dependencies
2. Verify FastAPI starts on port 8000
3. Check logs for Python errors

### Issue: "Service keeps restarting"
**Solution:**
1. Check for errors in logs
2. Increase memory if available (paid plan)
3. Verify all environment variables are set

### Issue: "Timeout connecting to services"
**Solution:**
1. Ensure both services start in `docker-entrypoint.sh`
2. Increase sleep time between service starts
3. Check port bindings in Dockerfile

---

## Step 6: Deployment Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Database user and password set
- [ ] IP whitelist configured (0.0.0.0/0 for testing)
- [ ] MongoDB URI copied and verified
- [ ] GitHub repository up-to-date with code
- [ ] Dockerfile exists and builds successfully
- [ ] All environment variables set in Render
- [ ] Health check endpoint responds
- [ ] MongoDB connection verified
- [ ] API endpoints returning data

---

## Step 7: Production Considerations

### Security
1. Use strong, randomly generated passwords
2. Implement rate limiting
3. Use HTTPS (Render provides free SSL)
4. Set `NODE_ENV=production`
5. Rotate JWT_SECRET periodically

### Performance
1. Use MongoDB Atlas paid tier for production
2. Enable automatic backups
3. Consider CDN for frontend
4. Monitor logs and performance metrics

### File Storage
Replace local uploads with:
```javascript
// AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});

// Or Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID
});
```

### Database Backups
1. Enable MongoDB Atlas automated backups
2. Set retention to 35 days
3. Test restore procedures

---

## Step 8: Scaling & Maintenance

### Auto-scaling
- Render provides automatic scaling for paid plans
- Monitor CPU and memory usage
- Scale database as needed

### Updates
1. Push code changes to GitHub
2. Render automatically rebuilds and redeploys
3. Monitor deployment logs
4. Rollback if issues occur

### Monitoring
- Use Render's built-in monitoring
- Set up error alerts
- Monitor API response times
- Track MongoDB performance

---

## Useful Commands

### Local Testing with Docker
```bash
# Build image
docker build -t aignoz-backend .

# Run with environment file
docker run --env-file .env -p 3000:3000 -p 8000:8000 aignoz-backend

# Run with docker-compose
docker-compose up
```

### View Service Logs
```bash
# From Render Dashboard or use Render CLI
render logs aignoz-backend
```

### Restart Service
```bash
# From Render Dashboard or CLI
render restart aignoz-backend
```

---

## Support Resources
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Docker Documentation](https://docs.docker.com/)
- [Express.js Guide](https://expressjs.com/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)

---

**Last Updated:** April 5, 2026
**Version:** 1.0
