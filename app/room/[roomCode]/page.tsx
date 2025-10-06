import { Suspense } from "react"
import { RoomContent } from "@/components/room-content"

export default async function RoomPage({
  params,
  searchParams,
}: {
  params: Promise<{ roomCode: string }>
  searchParams: Promise<{ username?: string; avatar?: string }>
}) {
  const { roomCode } = await params
  const search = await searchParams
  const username = search.username || "Anonymous"
  const avatar = search.avatar

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading room...</p>
          </div>
        </div>
      }
    >
      <RoomContent roomCode={roomCode} username={username} avatar={avatar} />
    </Suspense>
  )
}
