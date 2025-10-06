import type { Server as NetServer, Socket } from "net"
import type { NextApiResponse } from "next"
import type { Server as SocketIOServer } from "socket.io"

export type NextApiResponseServerIO = NextApiResponse & {
  socket: Socket & {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

export interface DrawData {
  x: number
  y: number
  color: string
  size: number
  tool: "pen" | "eraser" | "fill"
  isStart?: boolean
}

export interface ChatMessage {
  user: string
  message: string
  timestamp: number
  avatar?: string
}

export interface UserData {
  username: string
  avatar?: string
}
