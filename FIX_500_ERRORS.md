# 🔧 Fix Backend 500 Errors - Troubleshooting Guide

## Issues Fixed ✅
- Frontend was pointing to `localhost:5000` (now `3000`)
- Hardcoded URLs updated in GeneAnalysis.jsx and Profile.jsx

---

## Now Let's Fix the 500 Errors

### Step 1: Check Backend is Running

```powershell
# Terminal 1: Start Backend
cd d:\Aignoz-II\backend
npm install
npm start

# Should show: "✓ Server running on port 3000"
```

### Step 2: Verify MongoDB Connection

```powershell
# Terminal 2: Check MongoDB
curl http://localhost:3000/health

# Should return: {"status":"OK","timestamp":"..."}
```

If MongoDB fails, check your `.env` file:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/aignoz
```

### Step 3: Check Backend Logs

Look for these messages in backend console:
```
✓ Server running on port 3000
✓ MongoDB Connected ✓
✓ FastAPI URL: http://127.0.0.1:8000
```

---

## Common 500 Error Causes

| Error | Solution |
|-------|----------|
| **Cannot find module** | Run `npm install` in backend folder |
| **MongoDB connection error** | Check MONGO_URI in .env file |
| **FastAPI not responding** | Start FastAPI service separately |
| **Wrong port** | ✅ Already fixed (was 5000 → 3000) |
| **Missing environment variables** | Create `.env` file from `.env.example` |

---

## Quick Setup (Do This)

```powershell
# 1. Navigate to backend
cd d:\Aignoz-II\backend

# 2. Create .env file if it doesn't exist
cp .env.example .env

# 3. Edit .env with your MongoDB URI
# (Replace with real connection string)

# 4. Install dependencies
npm install

# 5. Start backend
npm start
```

## Expected Output
```
✓ Server running on port 3000
✓ Environment: production
✓ FastAPI URL: http://127.0.0.1:8000
✓ MongoDB Connected ✓
```

---

## Frontend Refresh

After backend is running:
1. Refresh React app (Ctrl+R or Cmd+R)
2. All 500 errors should be gone ✅
3. API calls will work properly

---

## If Still Getting Errors

### Check Backend Response
```bash
# Test health endpoint
curl http://localhost:3000/health

# Test API endpoint
curl http://localhost:3000/api/gene

# Test with authorization
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/cases
```

### Enable Debug Logging
In backend `server.js`:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
```

### Check MongoDB
```bash
# Test MongoDB connection
node -e "const mongoose = require('mongoose'); 
         const MONGO_URI = process.env.MONGO_URI;
         mongoose.connect(MONGO_URI)
           .then(() => console.log('✓ Connected'))
           .catch(err => console.log('✗ Error:', err.message))"
```

---

## Files Fixed Today ✅

- `frontend/src/services/api.js` → Port 5000 → 3000
- `frontend/src/pages/doctor/GeneAnalysis.jsx` → Port 5000 → 3000
- `frontend/src/pages/doctor/Profile.jsx` → Port 5000 → 3000

---

## Next: Push Changes to Git

```powershell
cd d:\Aignoz-II

git add .
git commit -m "Fix port mismatch: 5000 to 3000"
git push origin main
```

---

**Status: Ready to access APIs! 🚀**
