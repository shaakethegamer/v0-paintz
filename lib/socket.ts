import { io, type Socket } from "socket.io-client"
import { NEXT_PUBLIC_SOCKET_URL } from "@/config"

let socket: Socket | null = null

export const initSocket = async (): Promise<Socket> => {
  if (socket?.connected) {
    console.log("[v0] Socket: Already connected, reusing existing socket")
    return socket
  }

  const externalSocketUrl = NEXT_PUBLIC_SOCKET_URL
  const useExternalServer = externalSocketUrl && externalSocketUrl !== "http://localhost:3001"

  if (useExternalServer) {
    // Use external WebSocket server (e.g., deployed on Railway, Render, etc.)
    console.log("[v0] Socket: Connecting to external server at", externalSocketUrl)
    socket = io(externalSocketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
    })
  } else {
    // Use Next.js API route (local development or Vercel with limitations)
    console.log("[v0] Socket: Connecting to Next.js API route")

    try {
      const response = await fetch("/api/socket")
      console.log("[v0] Socket: API route response status:", response.status)
    } catch (error) {
      console.error("[v0] Socket: Failed to initialize API route", error)
    }

    const socketUrl = typeof window !== "undefined" ? window.location.origin : ""
    console.log("[v0] Socket: Connecting to", socketUrl)

    socket = io(socketUrl, {
      path: "/api/socket",
      addTrailingSlash: false,
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      timeout: 20000,
      autoConnect: true,
    })
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (!socket?.connected) {
        console.error("[v0] Socket: Connection timeout after 20 seconds")
        reject(
          new Error(
            "Connection timeout - WebSocket server may be unavailable. " +
              "For production use, deploy the WebSocket server separately and set NEXT_PUBLIC_SOCKET_URL.",
          ),
        )
      }
    }, 20000)

    socket!.on("connect", () => {
      clearTimeout(timeout)
      console.log("[v0] Socket: Connected successfully with ID:", socket!.id)
      resolve(socket!)
    })

    socket!.on("connect_error", (error) => {
      console.error("[v0] Socket: Connection error:", error.message)
      console.error("[v0] Socket: Error details:", error)
    })

    socket!.on("disconnect", (reason) => {
      console.log("[v0] Socket: Disconnected, reason:", reason)
    })

    socket!.on("reconnect", (attemptNumber) => {
      console.log("[v0] Socket: Reconnected after", attemptNumber, "attempts")
    })

    socket!.on("reconnect_attempt", (attemptNumber) => {
      console.log("[v0] Socket: Reconnection attempt", attemptNumber)
    })

    socket!.on("reconnect_error", (error) => {
      console.error("[v0] Socket: Reconnection error:", error.message)
    })

    socket!.on("reconnect_failed", () => {
      console.error("[v0] Socket: Reconnection failed after all attempts")
      clearTimeout(timeout)
      reject(new Error("Failed to connect after multiple attempts"))
    })
  })
}

export const getSocket = (): Socket | null => {
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    console.log("[v0] Socket: Disconnecting")
    socket.disconnect()
    socket = null
  }
}
