"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Canvas } from "@/components/canvas"
import { Chat } from "@/components/chat"
import { Button } from "@/components/ui/button"
import { AvatarDisplay } from "@/components/avatar-picker"
import { initSocket, disconnectSocket } from "@/lib/socket"
import type { Socket } from "socket.io-client"

const LogOutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
)

export function RoomContent({
  roomCode,
  username,
  avatar,
}: {
  roomCode: string
  username: string
  avatar?: string
}) {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [userCount, setUserCount] = useState(1)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const setupSocket = async () => {
      try {
        console.log("[v0] Room: Setting up socket connection")
        setIsConnecting(true)
        const newSocket = await initSocket()
        setSocket(newSocket)
        setConnectionError(null)
        setIsConnecting(false)

        console.log("[v0] Room: Joining room", roomCode, "as", username)
        newSocket.emit("join-room", { roomCode, username, avatar })

        newSocket.on("user-count", (count: number) => {
          console.log("[v0] Room: User count updated to", count)
          setUserCount(count)
        })

        newSocket.on("user-joined", ({ userCount: count }: { userCount: number }) => {
          console.log("[v0] Room: User joined, count:", count)
          setUserCount(count)
        })

        newSocket.on("user-left", ({ userCount: count }: { userCount: number }) => {
          console.log("[v0] Room: User left, count:", count)
          setUserCount(count)
        })
      } catch (error) {
        console.error("[v0] Room: Failed to setup socket", error)
        setConnectionError(
          error instanceof Error ? error.message : "Failed to connect to the server. Please try again.",
        )
        setIsConnecting(false)
      }
    }

    setupSocket()

    return () => {
      console.log("[v0] Room: Cleaning up socket connection")
      disconnectSocket()
    }
  }, [roomCode, username, avatar])

  const handleLeave = () => {
    disconnectSocket()
    router.push("/")
  }

  return (
    <div className="fixed inset-0 flex flex-col p-4 gap-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 -z-10" />

      {isConnecting && (
        <div className="bg-blue-500/10 border border-blue-500 text-blue-700 px-4 py-2 rounded-lg text-sm flex-shrink-0">
          Connecting to server...
        </div>
      )}

      {connectionError && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-2 rounded-lg text-sm flex-shrink-0">
          {connectionError}
        </div>
      )}

      {/* Header */}
      {!isMaximized && (
        <div className="flex items-center justify-between bg-card rounded-xl shadow-lg border p-4 flex-shrink-0">
          <div className="flex items-center gap-4">
            <AvatarDisplay avatar={avatar} size={40} />
            <div>
              <h1 className="text-xl font-bold">{username}</h1>
              <p className="text-sm text-muted-foreground">Room: {roomCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
              <UsersIcon />
              <span className="text-sm font-medium">{userCount} online</span>
            </div>
            <Button variant="outline" onClick={handleLeave}>
              <LogOutIcon />
              <span className="ml-2">Leave</span>
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`flex-1 ${isMaximized ? "" : "grid grid-cols-1 lg:grid-cols-[1fr_350px]"} gap-4 min-h-0 overflow-hidden`}
      >
        <div className="h-full min-h-0 overflow-hidden">
          <Canvas
            socket={socket}
            roomCode={roomCode}
            isMaximized={isMaximized}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
          />
        </div>
        {!isMaximized && (
          <div className="h-full min-h-0 overflow-hidden">
            <Chat socket={socket} roomCode={roomCode} username={username} avatar={avatar} />
          </div>
        )}
      </div>
    </div>
  )
}
