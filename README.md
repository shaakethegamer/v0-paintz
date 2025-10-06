# Multiplayer Drawing Game

A real-time collaborative drawing game built with Next.js and Socket.io.

## Features

- Real-time collaborative canvas with multiple drawing tools
- Pen, eraser, and fill bucket tools
- Adjustable brush size and color palette
- Undo/redo functionality
- Live chat system
- Custom avatar picker
- Room-based lobbies with unique codes

## Local Development Setup

To test the multiplayer features with multiple computers on your local network:

### Prerequisites

- Node.js 18+ installed
- Two or more devices on the same network

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

### Running Locally

#### Option 1: Run both servers with one command (Recommended)

\`\`\`bash
npm run dev:all
\`\`\`

This will start:
- Next.js dev server on `http://localhost:3000`
- WebSocket server on `http://localhost:3001`

#### Option 2: Run servers separately

Terminal 1 - Start the WebSocket server:
\`\`\`bash
npm run dev:socket
\`\`\`

Terminal 2 - Start the Next.js dev server:
\`\`\`bash
npm run dev
\`\`\`

### Testing with Multiple Computers

1. Find your local IP address:
   - **Windows**: Open Command Prompt and run `ipconfig`, look for "IPv4 Address"
   - **Mac/Linux**: Open Terminal and run `ifconfig` or `ip addr`, look for your local IP (usually starts with 192.168.x.x or 10.0.x.x)

2. On the host computer (where the servers are running):
   - Access the app at `http://localhost:3000`

3. On other computers on the same network:
   - Access the app at `http://YOUR_IP_ADDRESS:3000` (replace YOUR_IP_ADDRESS with the IP from step 1)
   - Example: `http://192.168.1.100:3000`

4. Create a room on one device and join it from another using the room code!

### Environment Variables (Optional)

Create a `.env.local` file to customize the WebSocket server URL:

\`\`\`env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
\`\`\`

For testing across devices, update this to your local IP:
\`\`\`env
NEXT_PUBLIC_SOCKET_URL=http://192.168.1.100:3001
\`\`\`

## Deployment

For production deployment to Vercel, the app automatically uses the built-in Next.js API routes for WebSocket handling. No additional configuration needed.

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Real-time**: Socket.io
- **Icons**: Lucide React

## Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── create/            # Create room page
│   ├── join/              # Join room page
│   └── room/[roomCode]/   # Game room page
├── components/            # React components
│   ├── canvas.tsx         # Drawing canvas
│   ├── chat.tsx           # Chat system
│   ├── avatar-picker.tsx  # Avatar customization
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities
│   └── socket.ts          # Socket.io client
├── pages/api/             # Next.js API routes
│   └── socket.ts          # WebSocket handler (production)
├── types/                 # TypeScript types
└── server.js              # Standalone WebSocket server (development)
\`\`\`

## How It Works

- **Development**: Uses a standalone Node.js WebSocket server (`server.js`) for reliable local testing
- **Production**: Uses Next.js API routes with Socket.io for serverless deployment on Vercel
- The app automatically detects the environment and connects to the appropriate WebSocket server
