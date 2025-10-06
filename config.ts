// Configuration for the application
// In development, this will use the local WebSocket server
// In production, it will use the Next.js API route

export const NEXT_PUBLIC_SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"
