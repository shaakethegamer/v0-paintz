const { createServer } = require("http")
const { Server } = require("socket.io")

const httpServer = createServer()
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
