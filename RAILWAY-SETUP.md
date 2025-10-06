# Railway Deployment Guide

## Quick Setup

Railway is a platform that hosts your WebSocket server. Here's how to deploy:

### Step 1: Push Your Code to GitHub

Make sure your code is pushed to GitHub (you've already done this).

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `v0-paintz` repository
5. Railway will automatically detect it's a Node.js project

### Step 3: Configure Railway

Railway should automatically:
- Install dependencies (`npm install`)
- Start your server using the `start` script from package.json

**Important:** Make sure Railway is using the correct start command:
- Go to your Railway project settings
- Under "Deploy" → "Start Command", it should be: `node server.js`
- Railway will automatically provide a `PORT` environment variable (no need to set it manually)

### Step 4: Get Your Public URL

After deployment:
1. Go to your Railway project
2. Click "Settings" → "Networking"
3. Click "Generate Domain"
4. Your URL will be something like: `v0-paintz-production.up.railway.app`

### Step 5: Configure Vercel

Now that you have your Railway URL, add it to Vercel:

1. Go to your Vercel project
2. Go to "Settings" → "Environment Variables"
3. Add a new variable:
   - **Name:** `NEXT_PUBLIC_SOCKET_URL`
   - **Value:** `https://v0-paintz-production.up.railway.app` (use YOUR Railway URL)
4. Redeploy your Vercel app

### Verify It's Working

Check Railway logs to see if the server is running:
1. Go to your Railway project
2. Click "Deployments" → Select latest deployment
3. Click "View Logs"
4. You should see: `[Server] WebSocket server running on port XXXX`

### Troubleshooting

**Server not starting?**
- Check Railway logs for errors
- Verify the start command is `node server.js`
- Make sure all dependencies are in package.json

**Can't connect from Vercel?**
- Verify the Railway domain is correct
- Make sure you're using `https://` (not `http://`)
- Check that you redeployed Vercel after adding the environment variable

**Still having issues?**
- Check Railway logs for connection attempts
- Use browser console to see connection errors
- Verify CORS is allowing your Vercel domain
