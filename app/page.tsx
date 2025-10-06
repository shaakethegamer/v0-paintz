import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

const PaintbrushIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m14.622 17.897-10.68-2.913" />
    <path d="M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z" />
    <path d="M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15" />
  </svg>
)

const UsersIcon = () => (
  <svg className="mx-1.5 ml-[-30px]"
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-chart-3 bg-sidebar-ring font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 -z-10" />

      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="flex items-center gap-6 flex-col text-neutral-700">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sidebar-primary">
              <PaintbrushIcon />
            </div>
            <h1 className="text-4xl font-bold text-balance">Paintz</h1>
          </div>

          <p className="text-center text-muted-foreground text-pretty">
            Create art with friends in real-time. Draw, chat, and have fun together!
          </p>

          <div className="w-full flex flex-col gap-3 mt-4">
            <Link href="/create" className="w-full">
              <Button size="lg" className="w-full text-lg font-semibold">
                Create Room
              </Button>
            </Link>

            <Link href="/join" className="w-full">
              <Button size="lg" variant="outline" className="w-full text-lg font-semibold bg-transparent">
                <UsersIcon />
                <span className="ml-2 text-sidebar-primary">Join Room</span>
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Real-time drawing</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span>Live chat</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
