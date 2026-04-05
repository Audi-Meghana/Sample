# Render Deployment Quick Checklist

## Before Deployment

### Code Preparation
- [ ] All code pushed to GitHub
- [ ] `.gitignore` includes: `node_modules`, `__pycache__`, `.env`, `uploads`
- [ ] `Dockerfile` is in root directory ✓
- [ ] `docker-entrypoint.sh` created and executable ✓
- [ ] `.dockerignore` configured ✓
- [ ] `server.js` has PORT fallback ✓
- [ ] `fastapiService.js` uses FASTAPI_URL env var ✓

### Database Setup
- [ ] MongoDB Atlas account created
- [ ] Cluster created (M0 free or paid tier)
- [ ] Database user created with password
- [ ] Database: `aignoz`
- [ ] IP whitelist configured (0.0.0.0/0 for testing)
- [ ] Connection string copied and saved

### Environment Variables (for Render)
- [ ] `PORT` = 3000
- [ ] `NODE_ENV` = production
- [ ] `MONGO_URI` = mongodb+srv://... (with correct password)
- [ ] `FASTAPI_URL` = http://127.0.0.1:8000
- [ ] `JWT_SECRET` = strong random string
- [ ] `FRONTEND_URL` = your frontend URL

---

## Deployment Steps

### On Render.com
1. [ ] Sign in to Render Dashboard
2. [ ] New Web Service
3. [ ] Select GitHub repository
4. [ ] Set service name to `aignoz-backend`
5. [ ] Environment: **Docker**
6. [ ] Add all environment variables
7. [ ] Click **Create Web Service**
8. [ ] Wait for deployment (5-10 minutes)

### After Deployment
- [ ] Test health endpoint: `https://service-url.onrender.com/health`
- [ ] Check MongoDB connection in logs
- [ ] Check FastAPI service started in logs
- [ ] Test API endpoints

---

## File Structure for Deployment

```
project-root/
├── Dockerfile                    ✓ Created
├── docker-entrypoint.sh          ✓ Created
├── .dockerignore                 ✓ Created
├── .env.example                  ✓ Created
├── docker-compose.yml            ✓ Created
├── RENDER_DEPLOYMENT_GUIDE.md    ✓ Created
├── backend/
│   ├── package.json
│   ├── server.js                 ✓ Updated
│   ├── services/
│   │   ├── fastapiService.js     ✓ Updated
│   │   └── ...
│   ├── AI_services/
│   │   ├── requirements.txt
│   │   ├── app/
│   │   │   └── main.py
│   │   └── ...
│   └── ...
└── ...
```

---

## Key Changes Made

1. **Dockerfile** - Multi-stage build with Node.js + Python
2. **docker-entrypoint.sh** - Starts both FastAPI and Node.js
3. **server.js** - Added PORT fallback and health endpoint
4. **fastapiService.js** - Uses FASTAPI_URL environment variable
5. **Environment Variables** - All configuration externalized

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot connect to MongoDB" | Verify MongoDB URI, check IP whitelist |
| "FastAPI not responding" | Check if it started, increase sleep time in entrypoint |
| "Service keeps restarting" | Check logs, verify environment variables |
| "Port already in use" | Render handles port binding automatically |
| "File uploads not persisting" | Use cloud storage (S3 or GCS) instead |

---

## Monitoring After Deployment

- Check **Logs** tab in Render for errors
- Monitor **Metrics** for CPU and memory usage
- Set up **Alerts** for service failures
- Test endpoints regularly using Postman or curl

---

## Next Steps

1. Read `RENDER_DEPLOYMENT_GUIDE.md` for detailed instructions
2. Set up MongoDB Atlas
3. Push code to GitHub
4. Deploy on Render
5. Monitor and test

---

**All files are ready for Render deployment! ✓**
