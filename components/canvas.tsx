"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Pen, Eraser, Trash2, PaintBucket, Undo, Redo } from "lucide-react"
import type { Socket } from "socket.io-client"
import type { DrawData } from "@/types/socket"

interface CanvasProps {
  socket: Socket | null
  roomCode: string
}

const COLORS = [
  "#000000", // Black
  "#FFFFFF", // White
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#F97316", // Orange
  "#3B82F6", // Blue
]

export function Canvas({ socket, roomCode }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pen" | "eraser" | "fill">("pen")
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyStep, setHistoryStep] = useState(-1)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientHeight
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    saveToHistory()

    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on("canvas-state", (canvasData: DrawData[]) => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx || !canvas) return

      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      canvasData.forEach((data) => {
        drawOnCanvas(data, ctx)
      })
    })

    socket.on("draw", (data: DrawData) => {
      const ctx = canvasRef.current?.getContext("2d")
      if (ctx) {
        drawOnCanvas(data, ctx)
      }
    })

    socket.on("clear-canvas", () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (ctx && canvas) {
        ctx.fillStyle = "#FFFFFF"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        setHistory([])
        setHistoryStep(-1)
        saveToHistory()
      }
    })

    return () => {
      socket.off("canvas-state")
      socket.off("draw")
      socket.off("clear-canvas")
    }
  }, [socket])

  const saveToHistory = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push(imageData)
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx || !canvas) return

      const newStep = historyStep - 1
      ctx.putImageData(history[newStep], 0, 0)
      setHistoryStep(newStep)
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!ctx || !canvas) return

      const newStep = historyStep + 1
      ctx.putImageData(history[newStep], 0, 0)
      setHistoryStep(newStep)
    }
  }

  const drawOnCanvas = (data: DrawData, ctx: CanvasRenderingContext2D) => {
    if (data.tool === "pen") {
      ctx.strokeStyle = data.color
      ctx.lineWidth = data.size
      ctx.lineCap = "round"
      ctx.lineJoin = "round"

      if (data.isStart) {
        ctx.beginPath()
        ctx.moveTo(data.x, data.y)
      } else {
        ctx.lineTo(data.x, data.y)
        ctx.stroke()
      }
    } else if (data.tool === "eraser") {
      ctx.clearRect(data.x - data.size / 2, data.y - data.size / 2, data.size, data.size)
    }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas!.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    lastPosRef.current = { x, y }

    ctx.beginPath()
    ctx.moveTo(x, y)

    if (tool === "fill") {
      floodFill(x, y)
      setIsDrawing(false)
    } else {
      const drawData: DrawData = {
        x,
        y,
        color: tool === "eraser" ? "#FFFFFF" : color,
        size: brushSize,
        tool,
        isStart: true,
      }

      if (socket) {
        socket.emit("draw", { ...drawData, roomCode })
      }
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || tool === "fill") return

    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const drawData: DrawData = {
      x,
      y,
      color: tool === "eraser" ? "#FFFFFF" : color,
      size: brushSize,
      tool,
      isStart: false,
    }

    drawOnCanvas(drawData, ctx)

    lastPosRef.current = { x, y }

    if (socket) {
      socket.emit("draw", { ...drawData, roomCode })
    }
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      lastPosRef.current = null
      const ctx = canvasRef.current?.getContext("2d")
      if (ctx) {
        ctx.beginPath()
      }
      saveToHistory()
    }
  }

  const floodFill = (startX: number, startY: number) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels = imageData.data
    const targetColor = getPixelColor(pixels, startX, startY, canvas.width)
    const fillColor = hexToRgb(color)

    if (colorsMatch(targetColor, fillColor)) return

    const stack: [number, number][] = [[startX, startY]]

    while (stack.length > 0) {
      const [x, y] = stack.pop()!
      const index = (y * canvas.width + x) * 4

      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue
      if (!colorsMatch(getPixelColor(pixels, x, y, canvas.width), targetColor)) continue

      pixels[index] = fillColor.r
      pixels[index + 1] = fillColor.g
      pixels[index + 2] = fillColor.b
      pixels[index + 3] = 255

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
    }

    ctx.putImageData(imageData, 0, 0)
    saveToHistory()
  }

  const getPixelColor = (pixels: Uint8ClampedArray, x: number, y: number, width: number) => {
    const index = (y * width + x) * 4
    return {
      r: pixels[index],
      g: pixels[index + 1],
      b: pixels[index + 2],
      a: pixels[index + 3],
    }
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const colorsMatch = (a: any, b: any) => {
    return a.r === b.r && a.g === b.g && a.b === b.b
  }

  const clearCanvas = () => {
    if (socket) {
      socket.emit("clear-canvas", { roomCode })
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-xl shadow-lg border">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant={tool === "pen" ? "default" : "outline"}
            onClick={() => setTool("pen")}
            title="Pen"
          >
            <Pen className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant={tool === "eraser" ? "default" : "outline"}
            onClick={() => setTool("eraser")}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant={tool === "fill" ? "default" : "outline"}
            onClick={() => setTool("fill")}
            title="Fill"
          >
            <PaintBucket className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                color === c ? "border-primary ring-2 ring-primary/20" : "border-border"
              }`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-3 min-w-[150px]">
          <span className="text-sm font-medium whitespace-nowrap">Size: {brushSize}</span>
          <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} min={1} max={50} step={1} />
        </div>

        <Separator orientation="vertical" className="h-8" />

        <div className="flex items-center gap-2">
          <Button size="icon" variant="outline" onClick={undo} disabled={historyStep <= 0} title="Undo">
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-8" />

        <Button size="icon" variant="destructive" onClick={clearCanvas} title="Clear Canvas">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 bg-card rounded-xl shadow-lg border overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className="cursor-crosshair w-full h-full"
        />
      </div>
    </div>
  )
}
