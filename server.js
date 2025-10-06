const { createServer } = require("http")
const { Server } = require("socket.io")

const httpServer = createServer((req, res) => {
  if (req.url === "/" || req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/html" })
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WebSocket Server</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
            h1 { margin: 0 0 1rem 0; }
            .status { 
              display: inline-block;
              padding: 0.5rem 1rem;
              background: #10b981;
              border-radius: 0.5rem;
              font-weight: bold;
            }
            .info {
              margin-top: 1rem;
              opacity: 0.9;
              font-size: 0.9rem;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🎨 Multiplayer Drawing Game</h1>
            <div class="status">✓ WebSocket Server Running</div>
            <div class="info">
              <p>This is the backend WebSocket server.</p>
              <p>Connect your frontend app to this URL to enable real-time features.</p>
            </div>
          </div>
        </body>
      </html>
    `)
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("Not Found")
  }
})

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

const rooms = new Map()

io.on("connection", (socket) => {
  console.log("[Server] Client connected:", socket.id)

  socket.on("join-room", ({ roomCode, username, avatar }) => {
    console.log("[Server] User joining room:", { roomCode, username, socket: socket.id })

    socket.join(roomCode)

    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, {
        users: new Map(),
        canvas: [],
        chat: [],
      })
    }

    const room = rooms.get(roomCode)
    room.users.set(socket.id, { username, avatar })

    // Send existing canvas data to new user
    socket.emit("canvas-state", room.canvas)
    socket.emit("chat-history", room.chat)

    // Notify others
    socket.to(roomCode).emit("user-joined", {
      username,
      avatar,
      userCount: room.users.size,
    })

    // Send current user count
    socket.emit("user-count", room.users.size)
  })

  socket.on("draw", (data) => {
    const { roomCode, ...drawData } = data
    const room = rooms.get(roomCode)

    if (room) {
      room.canvas.push(drawData)
      socket.to(roomCode).emit("draw", drawData)
    }
  })

  socket.on("clear-canvas", ({ roomCode }) => {
    const room = rooms.get(roomCode)
    if (room) {
      room.canvas = []
      io.to(roomCode).emit("clear-canvas")
    }
  })

  socket.on("chat-message", ({ roomCode, message, username, avatar }) => {
    const room = rooms.get(roomCode)
    if (room) {
      const chatMessage = {
        user: username,
        message,
        timestamp: Date.now(),
        avatar,
      }
      room.chat.push(chatMessage)
      io.to(roomCode).emit("chat-message", chatMessage)
    }
  })

  socket.on("disconnect", () => {
    console.log("[Server] Client disconnected:", socket.id)

    // Find and remove user from all rooms
    rooms.forEach((room, roomCode) => {
      if (room.users.has(socket.id)) {
        const user = room.users.get(socket.id)
        room.users.delete(socket.id)

        socket.to(roomCode).emit("user-left", {
          username: user?.username,
          userCount: room.users.size,
        })

        // Clean up empty rooms
        if (room.users.size === 0) {
          rooms.delete(roomCode)
        }
      }
    })
  })
})

const PORT = process.env.PORT || process.env.SOCKET_PORT || 3001

httpServer.listen(PORT, () => {
  console.log(`[Server] WebSocket server running on port ${PORT}`)
  console.log(`[Server] Connect from: http://localhost:${PORT}`)
})
