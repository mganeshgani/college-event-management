# 🚀 Quick Deployment Checklist

## ☑️ Pre-Deployment
- [x] Code pushed to GitHub: `https://github.com/mganeshgani/college-event-management`
- [ ] MongoDB Atlas cluster created
- [ ] Vercel account ready
- [ ] Render account ready

---

## 📋 Deployment Order

### 1️⃣ MongoDB Atlas (5 mins)
```
✓ Create cluster at mongodb.com/cloud/atlas
✓ Get connection string
✓ Whitelist all IPs (0.0.0.0/0)
✓ Connection format: mongodb+srv://user:pass@cluster.net/event-management
```

### 2️⃣ Render Backend (10 mins)
```
Dashboard: https://dashboard.render.com/
✓ New Web Service
✓ Connect GitHub repo
✓ Root Directory: backend
✓ Build: npm install && npm run build
✓ Start: npm start
✓ Add Environment Variables:
  - NODE_ENV=production
  - PORT=5000
  - MONGODB_URI=<atlas-connection-string>
  - JWT_SECRET=<generate-random-32-chars>
✓ Deploy & copy backend URL
```

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3️⃣ Vercel Frontend (5 mins)
```
Dashboard: https://vercel.com/dashboard
✓ New Project
✓ Import GitHub repo
✓ Root Directory: frontend
✓ Framework: Vite
✓ Add Environment Variable:
  - VITE_API_URL=https://your-backend.onrender.com/api
✓ Deploy & copy frontend URL
```

### 4️⃣ Update CORS (2 mins)
```
✓ Go back to Render
✓ Add Environment Variable:
  - FRONTEND_URL=https://your-app.vercel.app
✓ Save (auto-redeploys)
```

### 5️⃣ Seed Database (Optional)
```bash
# In Render Shell or locally:
npm run seed
```

**Test Accounts:**
- Student: `student1@college.edu` / `Student@123`
- Faculty: `dr.sharma@college.edu` / `Faculty@123`

---

## ✅ Verification

Visit your Vercel URL and test:
- [ ] Login as student
- [ ] Browse activities
- [ ] Enroll in activity
- [ ] Login as faculty
- [ ] Create activity
- [ ] Edit activity
- [ ] View activity reports

---

## 🐛 Common Issues

**"Cannot connect to database"**
→ Check MongoDB IP whitelist (must include 0.0.0.0/0)

**"Network Error"**
→ Verify VITE_API_URL includes `/api` at the end

**"CORS Error"**
→ Add FRONTEND_URL to backend environment variables

**Backend slow on first request**
→ Normal for Render free tier (spins down after 15 min)

---

## 🔗 Important URLs

**GitHub Repo**: https://github.com/mganeshgani/college-event-management
**MongoDB Atlas**: https://cloud.mongodb.com
**Render Dashboard**: https://dashboard.render.com
**Vercel Dashboard**: https://vercel.com/dashboard

---

## 📱 After Deployment

Your URLs will be:
- **Frontend**: `https://[project-name].vercel.app`
- **Backend**: `https://[service-name].onrender.com`

Both will auto-deploy on `git push origin main` 🎉

---

Full details in [DEPLOYMENT.md](./DEPLOYMENT.md)
