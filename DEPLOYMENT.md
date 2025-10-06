# Deployment Guide

This multiplayer drawing game requires a WebSocket server for real-time communication. Here are your deployment options:

## Option 1: Deploy WebSocket Server Separately (Recommended for Production)

Socket.io requires persistent connections, which don't work well with Vercel's serverless functions. For production use, deploy the WebSocket server separately.

### Deploy to Railway (Recommended)

1. **Create a new project on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure the deployment**
   - Railway will auto-detect Node.js
   - Set the start command: `node server.js`
   - Set environment variable: `PORT=3001`

3. **Get your WebSocket URL**
   - After deployment, Railway will provide a URL like `https://your-app.railway.app`
   - Copy this URL

4. **Configure your Vercel deployment**
   - In your Vercel project settings, add environment variable:
     - `NEXT_PUBLIC_SOCKET_URL` = `https://your-app.railway.app`
   - Redeploy your Vercel app

### Deploy to Render

1. **Create a new Web Service**
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your repository

2. **Configure the service**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add environment variable: `PORT=3001`

3. **Get your WebSocket URL**
   - Render will provide a URL like `https://your-app.onrender.com`
   - Copy this URL

4. **Configure your Vercel deployment**
   - In Vercel project settings, add:
     - `NEXT_PUBLIC_SOCKET_URL` = `https://your-app.onrender.com`
   - Redeploy

### Deploy to Heroku

1. **Create a new Heroku app**
   \`\`\`bash
   heroku create your-app-name
   \`\`\`

2. **Add a Procfile** to your project root:
   \`\`\`
   web: node server.js
   \`\`\`

3. **Deploy**
   \`\`\`bash
   git push heroku main
   \`\`\`

4. **Configure Vercel**
   - Add environment variable in Vercel:
     - `NEXT_PUBLIC_SOCKET_URL` = `https://your-app-name.herokuapp.com`

## Option 2: Local Development Only

For local testing with multiple computers:

1. **Start both servers**
   \`\`\`bash
   npm run dev:all
   \`\`\`

2. **Find your local IP address**
   - Windows: `ipconfig` (look for IPv4 Address)
   - Mac/Linux: `ifconfig` or `ip addr`

3. **Access from other devices**
   - Host: `http://localhost:3000`
   - Other devices: `http://YOUR_IP:3000`

## Option 3: Use Vercel (Limited - Not Recommended)

The app includes a Socket.io API route at `/pages/api/socket.ts` that attempts to work on Vercel, but has limitations:

- May not work reliably due to serverless function timeouts
- Limited to short-lived connections
- Not suitable for production use

If you want to try it anyway:
1. Deploy to Vercel normally
2. Don't set `NEXT_PUBLIC_SOCKET_URL`
3. The app will attempt to use the API route

**Note:** This is not recommended for production. Users may experience frequent disconnections and connection timeouts.

## Troubleshooting

### "Connection timeout - server may be unavailable"

This means the WebSocket server isn't accessible. Check:

1. Is `NEXT_PUBLIC_SOCKET_URL` set correctly in Vercel?
2. Is your WebSocket server running and accessible?
3. Check the browser console for detailed error messages
4. Verify CORS settings allow your Vercel domain

### Chat not working

- Ensure WebSocket connection is established (check connection status in UI)
- Verify both users are in the same room
- Check browser console for errors

### Drawing not syncing

- Confirm WebSocket connection is active
- Check that both users successfully joined the room
- Look for network errors in browser dev tools
