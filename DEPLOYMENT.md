# Deployment Guide

## 📦 Prerequisites
- GitHub repository with your code
- MongoDB Atlas account (free tier available)
- Vercel account (free tier available)
- Render account (free tier available)

---

## 🗄️ Step 1: Setup MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like: `mongodb+srv://username:<password>@cluster.mongodb.net/`)
5. Replace `<password>` with your database password
6. Add `/event-management` after `.net/` to specify database name
7. **Whitelist all IP addresses**: Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

---

## 🖥️ Step 2: Deploy Backend on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `event-management-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=<your-mongodb-atlas-connection-string>
   JWT_SECRET=<generate-a-secure-random-string-at-least-32-chars>
   ```
   
   To generate JWT_SECRET, run in terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. **Copy your backend URL** (e.g., `https://event-management-backend.onrender.com`)

---

## 🌐 Step 3: Deploy Frontend on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. **Add Environment Variable**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com/api`
   - ⚠️ Replace with your actual Render backend URL from Step 2
   - ⚠️ Make sure to include `/api` at the end

6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. **Copy your frontend URL** (e.g., `https://event-management.vercel.app`)

---

## 🔄 Step 4: Update Backend CORS

After deploying frontend, update backend to allow your frontend domain:

1. Go to Render Dashboard → Your Web Service
2. Go to "Environment"
3. Add new environment variable:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
4. Click "Save Changes" (will trigger auto-redeploy)

---

## 🌱 Step 5: Seed Database (Optional)

To add test data:

1. In Render Dashboard → Your Web Service → "Shell"
2. Run:
   ```bash
   npm run seed
   ```

Or run locally:
```bash
cd backend
MONGODB_URI="<your-atlas-connection-string>" npm run seed
```

**Test Accounts:**
- Student: `student1@college.edu` / `Student@123`
- Faculty: `dr.sharma@college.edu` / `Faculty@123`

---

## ✅ Step 6: Verify Deployment

1. Open your Vercel frontend URL
2. Try logging in with test credentials
3. Create an activity as faculty
4. Enroll as student
5. Check all features work

---

## 🐛 Troubleshooting

### Backend Issues
- **Check Render Logs**: Dashboard → Your Service → "Logs"
- **MongoDB Connection**: Verify connection string and IP whitelist
- **Environment Variables**: Ensure all vars are set correctly

### Frontend Issues
- **API Errors**: Check VITE_API_URL is correct (with `/api`)
- **CORS Errors**: Verify FRONTEND_URL is set in backend
- **Check Browser Console**: Open DevTools → Console tab

### Common Errors

**"Cannot connect to database"**
- MongoDB Atlas IP whitelist not configured (add 0.0.0.0/0)
- Wrong connection string format
- Missing database name in connection string

**"Network Error" in frontend**
- Wrong VITE_API_URL (missing `/api` or wrong domain)
- Backend not deployed yet
- CORS not configured

**"401 Unauthorized"**
- JWT_SECRET mismatch between deployments
- Try logging out and logging back in

---

## 🔧 Updating Your Deployment

### Update Backend
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render will auto-deploy on push to main branch.

### Update Frontend
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel will auto-deploy on push to main branch.

---

## 📊 Free Tier Limits

**Render (Free):**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds
- 750 hours/month

**Vercel (Free):**
- 100 GB bandwidth/month
- Unlimited projects
- Auto-scaling

**MongoDB Atlas (Free):**
- 512 MB storage
- Shared clusters
- Perfect for testing/development

---

## 🚀 Your Deployed URLs

**Frontend**: https://your-app.vercel.app  
**Backend**: https://your-backend.onrender.com  
**MongoDB**: mongodb+srv://...

---

## 📝 Next Steps

1. Set up custom domain (optional)
2. Configure email notifications
3. Add monitoring (e.g., Sentry)
4. Set up CI/CD pipelines
5. Add automated tests

---

## 🆘 Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

Good luck with your deployment! 🎉
