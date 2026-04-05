# 🚀 RENDER DEPLOYMENT - QUICK REFERENCE CARD

## 📋 One-Page Deployment Guide

### Files Created ✅
```
Dockerfile, docker-compose.yml, docker-entrypoint.sh, .dockerignore
.env.example, test-deployment.bat, test-deployment.sh
DEPLOYMENT_README.md, RENDER_DEPLOYMENT_GUIDE.md, RENDER_CONFIGURATION.md
RENDER_QUICK_CHECKLIST.md, DEPLOYMENT_COMPLETE.md, START_HERE.md
```

### Files Updated ✅
```
backend/server.js → Added PORT fallback & /health endpoint
backend/services/fastapiService.js → Uses FASTAPI_URL env var
```

---

## 🎯 3-Step Deployment Path

```
STEP 1: TEST LOCALLY (Windows)
└─ .\test-deployment.bat

STEP 2: SETUP MONGODB ATLAS
└─ Create cluster, get connection string

STEP 3: DEPLOY TO RENDER
└─ Push GitHub → Create service → Add env vars → Deploy!
```

---

## 🔑 Critical Environment Variables

```
PORT                    = 3000
NODE_ENV                = production
MONGO_URI               = mongodb+srv://aignoz_user:PASSWORD@cluster.mongodb.net/aignoz
FASTAPI_URL             = http://127.0.0.1:8000
JWT_SECRET              = (generate strong random)
FRONTEND_URL            = (your frontend domain)
```

---

## 📊 Architecture at a Glance

```
Internet
  ↓ (https://your-service.onrender.com)
  → Express.js (PORT 3000)
  → FastAPI (port 8000 - internal)
  → MongoDB Atlas (cloud)
```

---

## 🐳 Docker Commands

```bash
# Build image
docker build -t aignoz-backend .

# Local development
docker-compose up
docker-compose down
docker-compose logs -f

# Run container
docker run --env-file .env -p 3000:3000 -p 8000:8000 aignoz-backend
```

---

## ✅ Testing Endpoints

```bash
# Health check
curl http://localhost:3000/health
# Response: {"status":"OK","timestamp":"..."}

# API test
curl http://localhost:3000/api/gene

# After Render deployment
curl https://your-service-url.onrender.com/health
```

---

## 🔧 MongoDB Atlas Setup

```
1. Create account: mongodb.com/cloud/atlas
2. Create cluster: M0 (free)
3. Create user: aignoz_user
4. Whitelist IP: 0.0.0.0/0 (testing)
5. Get URI: mongodb+srv://aignoz_user:PASSWORD@cluster.mongodb.net/aignoz
```

---

## 🚀 Render Setup

```
1. Connect GitHub repository
2. Create Web Service
3. Environment: Docker
4. Dockerfile path: ./Dockerfile
5. Set environment variables
6. Deploy!
7. Check logs: Dashboard → Logs tab
```

---

## 🐛 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| MongoDB connection error | Check MONGO_URI, IP whitelist |
| FastAPI not responding | Check requirements.txt, increase sleep time |
| Service won't start | Check error logs in Render |
| Files not persisting | Use S3/GCS instead of local storage |
| 502 error | Wait for services to start, check logs |

---

## 📖 Documentation Quick Links

| Need | File |
|------|------|
| **Start** | START_HERE.md |
| **Guide** | DEPLOYMENT_README.md |
| **Render Steps** | RENDER_DEPLOYMENT_GUIDE.md |
| **Config** | RENDER_CONFIGURATION.md |
| **Checklist** | RENDER_QUICK_CHECKLIST.md |

---

## 💻 Local .env Example

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://aignoz_user:password@cluster.mongodb.net/aignoz?retryWrites=true&w=majority
FASTAPI_URL=http://127.0.0.1:8000
JWT_SECRET=your_secret_key_here_at_least_32_chars
FRONTEND_URL=http://localhost:5173
```

---

## 🎯 Success Checklist

- [ ] Docker local test passing
- [ ] MongoDB Atlas account created
- [ ] Connection string obtained
- [ ] Code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Deployment complete
- [ ] Health endpoint responding
- [ ] APIs working

---

## ⏱️ Time Estimate

```
Local testing:           10 minutes
MongoDB setup:           10 minutes
Code push:              5 minutes
Render setup:           10 minutes
Deployment:             10 minutes
Verification:           5 minutes
─────────────────────────
TOTAL:                  50 minutes
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong & random
- [ ] MONGO_URI is correct
- [ ] NODE_ENV=production
- [ ] .env file not in git
- [ ] IP whitelist configured
- [ ] HTTPS enabled (auto by Render)
- [ ] Logs monitored
- [ ] Backups enabled

---

## 📞 Common Commands

```bash
# Copy environment template
cp .env.example .env

# Build Docker image
docker build -t aignoz-backend .

# Start local services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Test health
curl http://localhost:3000/health

# Deploy to Render
git push origin main
```

---

## 🚀 Quick Render Deployment

1. **Prepare**
   ```bash
   git add .
   git commit -m "Add Docker deployment"
   git push origin main
   ```

2. **On Render.com**
   - New Web Service
   - Select GitHub repo
   - Environment: Docker
   - Set env vars
   - Deploy!

3. **Verify**
   ```bash
   curl https://your-service.onrender.com/health
   ```

---

## 💡 Pro Tips

✅ Test locally first with docker-compose
✅ Always check Render logs after deployment
✅ Use strong random passwords
✅ Monitor health endpoint regularly
✅ Enable MongoDB backups
✅ Document all changes
✅ Keep dependencies updated

---

## 🎓 Important Ports

| Service | Port | Access |
|---------|------|--------|
| Express | 3000 | Internet (✓) |
| FastAPI | 8000 | Internal Only ✓ |
| MongoDB | N/A | Cloud (Atlas) ✓ |

---

## 📊 File Structure

```
Root/
├── Dockerfile ✓
├── docker-compose.yml ✓
├── docker-entrypoint.sh ✓
├── .env.example ✓
├── START_HERE.md ✓
├── DEPLOYMENT_README.md ✓
└── backend/server.js (UPDATED ✓)
```

---

## 🔄 Deployment Cycle

```
Code Change
    ↓
Commit & Push GitHub
    ↓
Render Auto-Detects
    ↓
Docker Build
    ↓
Container Deploy
    ↓
Services Start
    ↓
Live!
```

---

## ✨ What's Included

✅ Multi-stage Docker build
✅ Node.js + Python in one container
✅ Health check endpoint
✅ Environment variable support
✅ MongoDB integration
✅ AutoRestarts
✅ Logging
✅ Production ready

---

## 🎯 Next Action

**👉 Run this command:**

Windows:
```powershell
.\test-deployment.bat
```

macOS/Linux:
```bash
./test-deployment.sh
```

---

**Status: ✅ DEPLOYMENT READY**

**Version: 1.0 | Created: April 5, 2026**
