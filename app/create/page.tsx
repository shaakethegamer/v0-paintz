"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarPicker } from "@/components/avatar-picker"
import { Copy, Check, Sparkles } from "lucide-react"

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

export default function CreateRoomPage() {
  const router = useRouter()
  const [roomCode] = useState(generateRoomCode())
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("#8B5CF6-circle")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleJoin = () => {
    if (username.trim()) {
      router.push(`/room/${roomCode}?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}`)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 -z-10" />

      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Create Room</h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Your Name</Label>
              <Input
                id="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Your Avatar</Label>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>

            <div className="space-y-2">
              <Label>Room Code</Label>
              <div className="flex gap-2">
                <div className="flex-1 bg-muted rounded-lg px-4 py-3 font-mono text-2xl font-bold text-center tracking-wider">
                  {roomCode}
                </div>
                <Button size="icon" variant="outline" onClick={handleCopy} className="h-auto bg-transparent">
                  {copied ? <Check className="w-5 h-5 text-primary" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">Share this code with friends to invite them</p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleJoin}
            disabled={!username.trim()}
            className="w-full text-lg font-semibold mt-2"
          >
            Start Drawing
          </Button>

          <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  )
}
