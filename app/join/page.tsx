"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AvatarPicker } from "@/components/avatar-picker"
import { Users } from "lucide-react"

export default function JoinRoomPage() {
  const router = useRouter()
  const [roomCode, setRoomCode] = useState("")
  const [username, setUsername] = useState("")
  const [avatar, setAvatar] = useState("#8B5CF6-circle")

  const handleJoin = () => {
    if (username.trim() && roomCode.trim()) {
      router.push(
        `/room/${roomCode.toUpperCase()}?username=${encodeURIComponent(username)}&avatar=${encodeURIComponent(avatar)}`,
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 -z-10" />

      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-xl">
              <Users className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold">Join Room</h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Your Name</Label>
              <Input
                id="username"
                placeholder="Enter your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label>Your Avatar</Label>
              <AvatarPicker value={avatar} onChange={setAvatar} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomCode">Room Code</Label>
              <Input
                id="roomCode"
                placeholder="Enter 6-digit code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                maxLength={6}
                className="text-lg font-mono tracking-wider text-center uppercase"
              />
              <p className="text-sm text-muted-foreground">Ask your friend for the room code</p>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleJoin}
            disabled={!username.trim() || !roomCode.trim() || roomCode.length !== 6}
            className="w-full text-lg font-semibold mt-2"
          >
            Join Room
          </Button>

          <Button variant="ghost" onClick={() => router.push("/")} className="w-full">
            Back to Home
          </Button>
        </div>
      </Card>
    </div>
  )
}
