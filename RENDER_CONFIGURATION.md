# Render Configuration Reference

Complete reference for configuring and deploying on Render.com

## 📋 Render Service Configuration

### Basic Settings

```
Name:                   aignoz-backend
Environment:            Docker
Region:                 Select closest to users (us-east-1, eu-west-1, etc.)
Branch:                 main (or your default branch)
Dockerfile Path:        ./Dockerfile
Render YAML Path:       (leave empty)
Build Command:          (leave empty - Docker handles)
Start Command:          (leave empty - Docker handles)
```

### Resource Settings

```
Plan: Free (for testing)
     OR
Plan: Starter ($7/month) for production

Specs (Free):           0.5 GB RAM
Specs (Starter+):       1+ GB RAM (recommended for production)
```

---

## 🔑 Environment Variables

### Required (Must Set)

| Variable | Value | Example |
|----------|-------|---------|
| `PORT` | 3000 | `3000` |
| `NODE_ENV` | production | `production` |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://aignoz_user:password@cluster.mongodb.net/aignoz?retryWrites=true&w=majority` |
| `FASTAPI_URL` | Internal FastAPI URL | `http://127.0.0.1:8000` |
| `JWT_SECRET` | Strong random string | Generate with: `openssl rand -base64 32` |

### Optional (Recommended)

| Variable | Value |
|----------|-------|
| `FRONTEND_URL` | Your frontend URL for CORS |
| `LOG_LEVEL` | debug, info, warn, error |

### Optional (For Cloud Storage)

```
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=your-bucket-name
AWS_REGION=us-east-1

Or for Google Cloud Storage:
GCP_PROJECT_ID=your-project
GCP_CREDENTIALS=(path to JSON file)
```

---

## 🔗 How to Get MongoDB URI

### Step 1: MongoDB Atlas Setup
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create Account → Login
3. Create Organization → Create Project
4. Create Cluster (M0 free)
5. Wait for cluster to initialize (5-10 min)
```

### Step 2: Create Database User
```
1. Go to Database Access
2. Add New Database User
3. Username: aignoz_user
4. Password: Generate secure password
5. Database User Privileges: Atlas Admin
6. Save and note the password
```

### Step 3: Get Connection String
```
1. Go to Clusters → Connect
2. Choose "Drivers"
3. Select "Node.js"
4. Copy connection string
5. Replace:
   - <password> with your password
   - myFirstDatabase with aignoz
6. Paste into MONGO_URI env var
```

### Step 4: Allow Network Access
```
1. Go to Network Access
2. Add IP Address
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
   OR Add specific Render IP
4. Confirm

Note: Render IPs: You can find these in Render dashboard
```

### Example MONGO_URI
```
mongodb+srv://aignoz_user:MySecurePassword123@cluster0.abcde.mongodb.net/aignoz?retryWrites=true&w=majority
```

---

## 🔐 Generating JWT Secret

### Option 1: Online (OpenSSL)
```bash
openssl rand -base64 32
# Output: someRandomBase64String...
```

### Option 2: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: 64 character hex string
```

### Option 3: Python
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
# Output: URLsafe random string
```

**Use the output as JWT_SECRET in Render**

---

## 🚀 Step-by-Step Render Deployment

### 1. Prepare GitHub Repository
```bash
# Make sure all files are committed
git status

# Should see only new deployment files:
# - Dockerfile
# - docker-entrypoint.sh
# - docker-compose.yml
# - .dockerignore
# - .env.example
# - Various markdown files

# Commit and push
git add .
git commit -m "Add Docker and Render deployment files"
git push origin main
```

### 2. Create Render Account
- Go to https://render.com
- Sign up with GitHub (easier)
- Connect your GitHub account

### 3. Create Web Service
```
1. Dashboard → New +
2. Select "Web Service"
3. Select your GitHub repository
4. Choose "aignoz-II" repo
```

### 4. Configure Service
```
Name:              aignoz-backend
Environment:       Docker
Region:            us-east-1 (or closest to you)
Branch:            main
Dockerfile Path:   ./Dockerfile
Render YAML:       (leave empty)
```

### 5. Add Environment Variables
```
ADD THE FOLLOWING:

PORT
3000

NODE_ENV
production

MONGO_URI
mongodb+srv://aignoz_user:YourPassword@cluster.mongodb.net/aignoz?retryWrites=true&w=majority

FASTAPI_URL
http://127.0.0.1:8000

JWT_SECRET
(generated random string)

FRONTEND_URL
(your frontend domain or leave empty)
```

**Click "Add Environment Variable" for each one**

### 6. Deploy
```
Click "Create Web Service"
  ↓
Watch build progress in Logs
  ↓
Wait for "Service started" message
  ↓
Note the service URL: https://aignoz-backend.onrender.com
```

### 7. Verify Deployment
```bash
# Test health endpoint
curl https://aignoz-backend.onrender.com/health

# Should return:
# {"status":"OK","timestamp":"..."}
```

---

## 📊 Monitoring Deployment

### View Logs
1. Render Dashboard → Your Service
2. Logs tab → View real-time logs

### Key Log Messages (Should See)
```
✓ Starting FastAPI service on port 8000
✓ Server running on port 3000
✓ MongoDB Connected ✓
✓ Application started successfully
```

### Restart Service
1. Dashboard → Your Service
2. Click "Restart Service"

### Stop Service
1. Dashboard → Your Service  
2. Click "Suspend Service"

---

## ⚙️ Advanced Configuration

### Increase Memory
```
1. Dashboard → Your Service
2. Settings → Plan
3. Upgrade from Free to Starter ($7/month)
   - Includes 1 GB RAM
   - HTTP /health check
   - Unlimited deployments
```

### Enable Auto-Deploy
```
1. Dashboard → Your Service
2. Settings → Auto-deploy
3. Toggle "Deploy latest commit"
```

### Set Up Alerts
```
1. Dashboard → Service
2. Click "Alerts" (bell icon)
3. Add email for notifications
4. Enable alerts for:
   - Service down
   - High CPU
   - High memory
```

### Custom Domain
```
1. Dashboard → Service
2. Custom Domain
3. Enter your domain
4. Update DNS with provided records
5. Wait for SSL certificate (24 hours)
```

---

## 🔄 Redeployment

### Automatic (Git Push)
```bash
# Make changes locally
git add .
git commit -m "Updated API endpoints"
git push origin main

# Render automatically detects push
# Starts building and deploying
# Check logs to monitor
```

### Manual
1. Dashboard → Service
2. Manual Deploys → Deploy latest commit
3. Watch logs

---

## 🐛 Common Render Issues

### Service Shows "Deploy Failed"
**Check:**
1. Logs for error messages
2. Dockerfile syntax
3. Dependencies installed
4. Required environment variables set

**Fix:**
1. Fix issue locally
2. Test with `docker-compose`
3. Commit and push
4. Render auto-redeploys

### Service Running But Returning 502
**Cause:** Backend not properly responding
**Fix:**
1. Check logs for startup errors
2. Verify MONGO_URI is correct
3. Check if FastAPI started
4. Increase startup time in docker-entrypoint.sh

### Cannot Connect to MongoDB
**Cause:** Connection string or IP whitelist wrong
**Fix:**
1. Verify MONGO_URI in Render env vars
2. Check MongoDB Atlas IP whitelist
3. Test connection locally first
4. Check MongoDB cluster status

### Service Won't Stay Running
**Cause:** Memory, crashes, or infinite loops
**Fix:**
1. Check error logs
2. Upgrade to Starter plan (more RAM)
3. Test locally for bugs
4. Increase timeouts if needed

---

## 💰 Pricing

### Free Plan
- $0/month
- 0.5 GB RAM
- Auto-sleep after inactivity
- Shared CPU
- Manual rollout

### Starter Plan
- $7/month
- 1 GB RAM
- Always on
- Shared CPU
- Auto-deploy
- Email support

### Standard Plan
- $12/month
- 4 GB RAM
- Dedicated CPU
- Advanced features

---

## 🔒 Security Best Practices

### Secrets Management
```
✓ Never commit .env file
✓ Store secrets only in Render env vars
✓ Rotate secrets regularly
✓ Use strong random passwords
✓ Use different keys for prod/staging
```

### Network Security
```
✓ Keep MongoDB Atlas IP whitelist minimal in production
✓ Use HTTPS only (Render provides free SSL)
✓ Implement rate limiting
✓ Add request validation
✓ Log suspicious activity
```

### Database Security
```
✓ Use separate credentials for each environment
✓ Enable MongoDB backup
✓ Test disaster recovery
✓ Monitor database access
✓ Use connection pooling
```

---

## 📚 Useful Links

| Resource | URL |
|----------|-----|
| Render Docs | https://render.com/docs |
| Render Dashboard | https://dashboard.render.com |
| MongoDB Atlas | https://cloud.mongodb.com |
| Docker Docs | https://docs.docker.com |
| Express.js | https://expressjs.com |
| FastAPI | https://fastapi.tiangolo.com |

---

## ✅ Deployment Checklist for Render

- [ ] GitHub repository ready
- [ ] Dockerfile in root
- [ ] docker-entrypoint.sh created
- [ ] All environment setup files included
- [ ] Code pushed to GitHub
- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string obtained
- [ ] IP whitelist configured
- [ ] Render account created
- [ ] GitHub connected to Render
- [ ] Web service created
- [ ] Dockerfile path set correctly
- [ ] All environment variables added
- [ ] Service deployed
- [ ] Logs show successful startup
- [ ] Health endpoint responding
- [ ] MongoDB connected
- [ ] API endpoints working

---

**Status:** ✓ Ready for Render Deployment
**Last Updated:** April 5, 2026
