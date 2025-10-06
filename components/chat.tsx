"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { MessageCircle } from "lucide-react"
import type { Socket } from "socket.io-client"
import type { ChatMessage } from "@/types/socket"

interface ChatProps {
  socket: Socket | null
  roomCode: string
  username: string
  avatar?: string
}

export function Chat({ socket, roomCode, username, avatar }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!socket) return

    const handleConnect = () => {
      console.log("[v0] Chat: Socket connected")
      setIsConnected(true)
    }

    const handleDisconnect = () => {
      console.log("[v0] Chat: Socket disconnected")
      setIsConnected(false)
    }

    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)

    // Set initial connection status
    setIsConnected(socket.connected)

    socket.on("chat-history", (history: ChatMessage[]) => {
      console.log("[v0] Chat: Received history", history.length, "messages")
      setMessages(history)
    })

    socket.on("chat-message", (message: ChatMessage) => {
      console.log("[v0] Chat: Received message", message)
      setMessages((prev) => [...prev, message])
    })

    socket.on("user-joined", ({ username: joinedUser }: { username: string }) => {
      const systemMessage: ChatMessage = {
        user: "System",
        message: `${joinedUser} joined the room`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, systemMessage])
    })

    socket.on("user-left", ({ username: leftUser }: { username: string }) => {
      const systemMessage: ChatMessage = {
        user: "System",
        message: `${leftUser} left the room`,
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, systemMessage])
    })

    return () => {
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("chat-history")
      socket.off("chat-message")
      socket.off("user-joined")
      socket.off("user-left")
    }
  }, [socket])

  useEffect(() => {
    if (scrollRef.current) {
      // Use setTimeout to ensure DOM has updated
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
      }, 0)
    }
  }, [messages])

  const sendMessage = () => {
    if (!socket || !inputMessage.trim()) {
      console.log("[v0] Chat: Cannot send - socket or message empty", { socket: !!socket, message: inputMessage })
      return
    }

    if (!isConnected) {
      console.log("[v0] Chat: Cannot send - socket not connected")
      return
    }

    console.log("[v0] Chat: Sending message", inputMessage)
    socket.emit("chat-message", {
      roomCode,
      message: inputMessage.trim(),
      username,
      avatar,
    })

    setInputMessage("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-lg border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b flex-shrink-0">
        <MessageCircle className="w-5 h-5 text-primary" />
        <h2 className="font-semibold">Chat</h2>
        <span className="ml-auto text-sm text-muted-foreground">{messages.length} messages</span>
        {!isConnected && (
          <span className="text-xs text-destructive bg-destructive/10 px-2 py-1 rounded">Disconnected</span>
        )}
      </div>

      {/* Scrollable container with fixed height */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col gap-1 ${msg.user === "System" ? "items-center" : msg.user === username ? "items-end" : "items-start"}`}
              >
                {msg.user === "System" ? (
                  <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">{msg.message}</div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      {msg.user !== username && (
                        <span className="text-xs font-medium text-muted-foreground">{msg.user}</span>
                      )}
                      <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                        msg.user === username ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t flex-shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            disabled={!isConnected}
          />
          <Button onClick={sendMessage} disabled={!inputMessage.trim() || !isConnected} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
