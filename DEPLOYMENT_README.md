# AIgNOZ Backend - Docker & Render Deployment Guide

Complete guide to containerize and deploy the AIgNOZ backend on Render with MongoDB Atlas.

## 📋 Quick Start

### For Windows Users
```powershell
# Run the testing script (creates .env if needed)
.\test-deployment.bat
```

### For macOS/Linux Users
```bash
# Run the testing script
./test-deployment.sh
```

## 📁 What's Included

### New Deployment Files Created

| File | Purpose |
|------|---------|
| **Dockerfile** | Multi-stage Docker build configuration |
| **docker-compose.yml** | Local development with MongoDB |
| **docker-entrypoint.sh** | Script to start both services |
| **.dockerignore** | Files to exclude from Docker build |
| **.env.example** | Environment variables template |
| **RENDER_DEPLOYMENT_GUIDE.md** | Detailed step-by-step guide |
| **RENDER_QUICK_CHECKLIST.md** | Pre-deployment checklist |
| **test-deployment.sh** | Automated local testing (Linux/Mac) |
| **test-deployment.bat** | Automated local testing (Windows) |

### Modified Files

| File | Changes |
|------|---------|
| **backend/server.js** | Added PORT fallback & health endpoint |
| **backend/services/fastapiService.js** | Uses FASTAPI_URL environment variable |

---

## 🚀 Architecture

### Services
- **Node.js Express Backend** → Port 3000 (internet-facing)
- **Python FastAPI Service** → Port 8000 (internal only)
- **MongoDB Atlas** → Cloud-hosted database

### Data Flow
```
User/Client (Internet)
      ↓
Render.com (https://your-service-url.onrender.com)
      ↓ (PORT 3000)
Express Backend
      ↓ (http://127.0.0.1:8000)
FastAPI Service
      ↓
Python AI Engines
      ↓
MongoDB Atlas (Cloud Database)
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server
PORT=3000
NODE_ENV=production

# Database
MONGO_URI=mongodb+srv://aignoz_user:PASSWORD@cluster.mongodb.net/aignoz?retryWrites=true&w=majority

# Services
FASTAPI_URL=http://127.0.0.1:8000

# Security
JWT_SECRET=your_strong_secret_key_here

# Frontend
FRONTEND_URL=https://your-frontend-url.com
```

### Local Testing

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your settings**
   ```
   MONGO_URI=mongodb+srv://... (update with real MongoDB URI)
   JWT_SECRET=your-secret-key
   ```

3. **Run tests**
   - Windows: `test-deployment.bat`
   - Linux/Mac: `./test-deployment.sh`

### Production (Render)

Set these in Render Dashboard → Environment Variables:

```
PORT = 3000
NODE_ENV = production
MONGO_URI = mongodb+srv://aignoz_user:PASSWORD@cluster.mongodb.net/aignoz?retryWrites=true&w=majority
FASTAPI_URL = http://127.0.0.1:8000
JWT_SECRET = (generate strong random string)
FRONTEND_URL = https://your-frontend-domain.com
```

---

## 🏗️ Local Development

### Option 1: Using Docker Compose (Easiest)

```bash
# Copy environment template
cp .env.example .env

# Update .env with your settings
# (Edit MONGO_URI with a real MongoDB connection string)

# Start services
docker-compose up

# Services running at:
# - Node.js: http://localhost:3000
# - FastAPI: http://localhost:8000
# - Health check: http://localhost:3000/health

# Stop services
docker-compose down
```

### Option 2: Using Docker Build

```bash
# Build image
docker build -t aignoz-backend .

# Run container
docker run --env-file .env -p 3000:3000 -p 8000:8000 aignoz-backend
```

### Option 3: Direct Node/Python (No Docker)

```bash
# Terminal 1 - FastAPI Service
cd backend/AI_services
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminal 2 - Express Server
cd backend
npm install
npm start
```

---

## 🌐 Deployment Steps

### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (M0 free tier for testing)
3. Create database user: `aignoz_user`
4. Set IP whitelist to `0.0.0.0/0` (testing) or specific IPs (production)
5. Get connection string: `mongodb+srv://aignoz_user:PASSWORD@cluster.mongodb.net/aignoz`

### Step 2: Deploy to Render

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add Docker deployment files"
   git push origin main
   ```

2. **Create Render service**
   - Go to https://render.com/dashboard
   - Click "New +" → "Web Service"
   - Select your GitHub repository
   - Choose "Docker" environment

3. **Configure service**
   - Name: `aignoz-backend`
   - Region: Select closest to users
   - Dockerfile: `./Dockerfile`

4. **Add environment variables** (see Configuration section above)

5. **Deploy**
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment
   - You'll get a URL: `https://aignoz-backend.onrender.com`

### Step 3: Verify Deployment

```bash
# Check health endpoint
curl https://your-service-url.onrender.com/health

# Check logs
# In Render Dashboard → Logs tab
```

---

## 🔍 Troubleshooting

### "Cannot connect to MongoDB"
- ✓ Verify MongoDB URI in environment variables
- ✓ Check IP whitelist in MongoDB Atlas (should be 0.0.0.0/0 for testing)
- ✓ Test connection locally first with `docker-compose`

### "FastAPI service not responding"
- ✓ Check `requirements.txt` includes all dependencies
- ✓ Verify sleep time in `docker-entrypoint.sh` (may need to increase)
- ✓ Check logs for Python runtime errors

### "Service keeps restarting"
- ✓ Check Render logs for errors
- ✓ Verify all environment variables are set
- ✓ Check available memory (may need to upgrade)

### "Files not persisting after redeployment"
- ✓ Render's file system is ephemeral
- ✓ Use MongoDB for data, cloud storage (S3/GCS) for files
- ✓ See `RENDER_DEPLOYMENT_GUIDE.md` for S3 setup

---

## 📊 Monitoring

### Health Endpoint
```bash
curl https://your-service-url.onrender.com/health
```

Response:
```json
{
  "status": "OK",
  "timestamp": "2024-04-05T10:30:00.000Z"
}
```

### Logs
- View in Render Dashboard → Logs tab
- Look for:
  - `✓ FastAPI service on port 8000`
  - `✓ Server running on port 3000`
  - `✓ MongoDB Connected`

### Performance
- Monitor CPU and memory in Render Dashboard
- Scale as needed (paid plans support auto-scaling)

---

## 📚 Documentation References

- **Render Deployment**: See `RENDER_DEPLOYMENT_GUIDE.md`
- **Quick Checklist**: See `RENDER_QUICK_CHECKLIST.md`
- **Docker Basics**: [Docker Docs](https://docs.docker.com/)
- **Render Docs**: [Render Documentation](https://render.com/docs)
- **MongoDB Atlas**: [Atlas Docs](https://docs.atlas.mongodb.com/)
- **FastAPI**: [FastAPI Docs](https://fastapi.tiangolo.com/)

---

## 🔐 Security Considerations

### Development
- Use strong random passwords
- Keep `.env` files local (added to `.gitignore`)
- Test thoroughly in staging before production

### Production
- Use MongoDB Atlas paid tier for backups
- Enable automated backups (35-day retention minimum)
- Use strong, randomly generated JWT_SECRET
- Set `NODE_ENV=production`
- Implement rate limiting
- Monitor logs for suspicious activity
- Rotate secrets periodically

---

## 📦 File Upload Handling

### Current (Local Storage)
Files stored in `/app/backend/uploads` - **NOT PERSISTENT** on Render

### Production Recommendation
Switch to cloud storage:

**AWS S3 Setup** (example):
```bash
npm install aws-sdk
```

```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
```

See `RENDER_DEPLOYMENT_GUIDE.md` for full S3 integration steps.

---

## 🧪 Testing

### Local with Docker
```bash
./test-deployment.bat    # Windows
./test-deployment.sh     # Linux/Mac
```

### Manual Testing
```bash
# Health check
curl http://localhost:3000/health

# Test API endpoints
curl http://localhost:3000/api/gene

# Test with Postman
# Import collection and test endpoints
```

---

## 📝 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user and password set
- [ ] Connection string obtained
- [ ] IP whitelist configured
- [ ] Code pushed to GitHub
- [ ] Dockerfile builds successfully
- [ ] `.env` file created with all variables
- [ ] Tested locally with `docker-compose`
- [ ] Services starting correctly
- [ ] Health endpoint responding
- [ ] Created Render web service
- [ ] Environment variables set in Render
- [ ] Deployment successful
- [ ] Health check passing
- [ ] Logs show all services running
- [ ] API endpoints responding

---

## 🚨 Support & Debugging

### Enable Debug Logging
```env
NODE_DEBUG=express
DEBUG=*
```

### Common Issues Matrix

| Issue | Cause | Solution |
|-------|-------|----------|
| MongoDB connection timeout | Wrong URI or IP whitelist | Check Atlas settings |
| FastAPI 502 error | Service not started | Increase sleep in entrypoint.sh |
| Port already in use | Local conflict | Stop other services |
| Build failure | Missing dependencies | Check requirements.txt |
| Out of memory | Large file processing | Upgrade Render plan |

---

## 🔄 Updates & Maintenance

### Update Application
1. Make code changes locally
2. Test with `docker-compose`
3. Push to GitHub
4. Render automatically rebuilds

### Monitor Deployment
- Check logs regularly
- Monitor error rates
- Review performance metrics
- Plan scaling as needed

### Backup Strategy
- MongoDB Atlas automated backups: 35 days
- Test restore procedures regularly
- Keep database snapshots before major updates

---

## 📞 Getting Help

1. **Check logs first**
   ```bash
   docker-compose logs -f  # Local
   # Or Render Dashboard → Logs  # Production
   ```

2. **Read documentation**
   - `RENDER_DEPLOYMENT_GUIDE.md` - Full guide
   - `RENDER_QUICK_CHECKLIST.md` - Checklist
   - `.env.example` - Variable reference

3. **Community Resources**
   - [Render Community](https://render.com/docs)
   - [MongoDB Support](https://support.mongodb.com/)
   - [Docker Support](https://www.docker.com/support)

---

## ✅ Success Criteria

After deployment, you should have:
- [ ] Service running at `https://your-service.onrender.com`
- [ ] Health endpoint returning 200 status
- [ ] MongoDB successfully connected
- [ ] FastAPI service running internally
- [ ] API endpoints responding with data
- [ ] Uploads directory accessible
- [ ] Logs showing no errors

---

**Last Updated**: April 5, 2026
**Status**: ✓ Ready for Production Deployment
**Version**: 1.0

---

## 📞 Quick Links

| Resource | Link |
|----------|------|
| Render Dashboard | https://dashboard.render.com |
| MongoDB Atlas | https://www.mongodb.com/cloud/atlas |
| Docker Hub | https://hub.docker.com |
| GitHub | https://github.com |

---

**Happy Deploying! 🚀**
