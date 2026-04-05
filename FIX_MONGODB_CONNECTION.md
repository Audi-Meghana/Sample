# 🔧 MongoDB Connection Fix - Step by Step

## ✅ Issues Fixed
- **Port**: Changed from 5000 → 3000 in `.env`
- **MongoDB URI**: Added database name `/aignoz` to URI
- **Environment Variables**: Added missing `NODE_ENV` and `FASTAPI_URL`

---

## 🚀 Restart Backend Server

### Terminal 1: Stop current server (Ctrl+C)
### Terminal 2: Start fresh
```powershell
cd d:\Aignoz-II\backend
npm run dev
```

**You should now see:**
```
✓ Server running on port 3000  ← Fixed!
✓ Environment: development
✓ FastAPI URL: http://127.0.0.1:8000
MongoDB Connected ✓
```

---

## 🔍 MongoDB Atlas Configuration Check

### Step 1: Verify Credentials
Go to [MongoDB Atlas](https://cloud.mongodb.com) → Your Cluster

**Check Database Access:**
- Username: `mekalabhavana029_db_user`
- Password: `aicare`
- Role: Should have `Atlas Admin` or `Read and write` permissions

### Step 2: Check Network Access
**IP Whitelist:**
- Should allow `0.0.0.0/0` (Allow Access from Anywhere)
- OR add your current IP address

### Step 3: Verify Cluster Status
- Cluster should be in `RUNNING` state
- No maintenance or issues

---

## 🧪 Test Connection

### Test 1: Health Endpoint
```powershell
curl http://localhost:3000/health
```
**Expected:** `{"status":"OK","timestamp":"..."}`

### Test 2: MongoDB Direct Test
```powershell
# In PowerShell
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✓ Connected'))
  .catch(err => console.log('✗ Error:', err.message));
"
```

### Test 3: API Test
```powershell
curl http://localhost:3000/api/gene
```
**Expected:** JSON response or 200 status

---

## 🔧 If Still Having Issues

### Option 1: Create New MongoDB User
1. Go to **Database Access** → **Add New Database User**
2. Username: `aignoz_user`
3. Password: Generate strong password
4. Built-in Role: `Atlas Admin`
5. Save

### Option 2: Update Connection String
```env
MONGO_URI=mongodb+srv://aignoz_user:YOUR_NEW_PASSWORD@cluster0.2c789gy.mongodb.net/aignoz?retryWrites=true&w=majority
```

### Option 3: Check Firewall
- Ensure no firewall blocking outbound connections
- Try different network (if possible)

### Option 4: Use MongoDB Compass
Download [MongoDB Compass](https://www.mongodb.com/products/compass) and test connection directly.

---

## 📊 Current Configuration

### .env File (Updated)
```env
PORT=3000                    # ✅ Fixed
MONGO_URI=mongodb+srv://mekalabhavana029_db_user:aicare@cluster0.2c789gy.mongodb.net/aignoz?appName=Cluster0  # ✅ Fixed
JWT_SECRET=supersecretkey
NODE_ENV=development         # ✅ Added
FASTAPI_URL=http://127.0.0.1:8000  # ✅ Added
```

### Expected Server Output
```
✓ Server running on port 3000
✓ Environment: development
✓ FastAPI URL: http://127.0.0.1:8000
MongoDB Connected ✓
```

---

## 🚨 Common MongoDB Issues

| Error | Cause | Solution |
|-------|-------|----------|
| `Authentication failed` | Wrong username/password | Check Database Access in Atlas |
| `connection timed out` | Network/firewall | Check IP whitelist, try different network |
| `getaddrinfo ENOTFOUND` | Wrong cluster URL | Verify cluster URL in Atlas |
| `connection closed` | Cluster issues | Check cluster status, restart if needed |
| `no such database` | Wrong database name | Add `/database_name` to URI |

---

## ✅ Verification Steps

- [ ] Backend server running on port 3000
- [ ] MongoDB connection successful
- [ ] Health endpoint responds
- [ ] API endpoints accessible
- [ ] Frontend can connect (no more ERR_CONNECTION_REFUSED)

---

## 🎯 Next Steps

1. **Restart backend** with `npm run dev`
2. **Check logs** for successful connection
3. **Test health endpoint** with curl
4. **Refresh frontend** browser
5. **Verify APIs work**

---

**Status: Configuration Fixed ✅ - Ready to test!**
