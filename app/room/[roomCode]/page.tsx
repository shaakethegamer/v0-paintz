import { Suspense } from "react"
import { RoomContent } from "@/components/room-content"

export default function RoomPage({ params }: { params: { roomCode: string } }) {
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
      <RoomContent roomCode={params.roomCode} />
    </Suspense>
  )
}
