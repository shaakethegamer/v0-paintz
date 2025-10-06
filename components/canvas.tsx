"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Pen, Eraser, Trash2, PaintBucket, Undo, Redo, Maximize2, Minimize2 } from "lucide-react"
import type { Socket } from "socket.io-client"
import type { DrawData } from "@/types/socket"

interface CanvasProps {
  socket: Socket | null
  roomCode: string
  isMaximized: boolean
  onToggleMaximize: () => void
}

export function Canvas({ socket, roomCode, isMaximized, onToggleMaximize }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pen" | "eraser" | "fill">("pen")
  const [color, setColor] = useState("#000000")
  const [brushSize, setBrushSize] = useState(5)
  const [history, setHistory] = useState<ImageData[]>([])
  const [historyStep, setHistoryStep] = useState(-1)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [showCursor, setShowCursor] = useState(false)
  const [colorPresets, setColorPresets] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("colorPresets")
      return saved ? JSON.parse(saved) : ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"]
    }
    return ["#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00"]
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("colorPresets", JSON.stringify(colorPresets))
    }
  }, [colorPresets])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 1024
    canvas.height = 768

    // Fill with white background
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    saveToHistory()
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

      ctx.beginPath()

      if (data.isStart || !data.prevX || !data.prevY) {
        // First point of a stroke - draw a dot
        ctx.arc(data.x, data.y, data.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = data.color
        ctx.fill()
      } else {
        // Subsequent points - draw line from previous position
        ctx.moveTo(data.prevX, data.prevY)
        ctx.lineTo(data.x, data.y)
        ctx.stroke()
      }
    } else if (data.tool === "eraser") {
      ctx.clearRect(data.x - data.size / 2, data.y - data.size / 2, data.size, data.size)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    // Calculate scaled coordinates for drawing
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    // Set cursor position in CSS pixels relative to canvas (not scaled)
    setCursorPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    draw(e)
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    setIsDrawing(true)

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    lastPosRef.current = { x, y }

    ctx.beginPath()
    ctx.moveTo(x, y)

    if (tool === "fill") {
      floodFill(Math.floor(x), Math.floor(y))
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

      drawOnCanvas(drawData, ctx)

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
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const drawData: DrawData = {
      x,
      y,
      prevX: lastPosRef.current?.x,
      prevY: lastPosRef.current?.y,
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

  const saveColorPreset = (index: number) => {
    const newPresets = [...colorPresets]
    newPresets[index] = color
    setColorPresets(newPresets)
  }

  const toggleMaximize = () => {
    onToggleMaximize()
  }

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-xl shadow-lg border flex-shrink-0">
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

        <div className="flex items-center gap-3">
          <label
            htmlFor="color-picker"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg border-2 border-border" style={{ backgroundColor: color }} />
            <span className="text-sm font-medium">Pick Color</span>
          </label>
          <input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="sr-only"
          />
          <span className="text-xs font-mono text-muted-foreground">{color.toUpperCase()}</span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground text-center">Right click to save preset</span>
          <div className="flex items-center gap-2">
            {colorPresets.map((presetColor, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => setColor(presetColor)}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    saveColorPreset(index)
                  }}
                  className="w-8 h-8 rounded-lg border-2 border-border hover:border-primary transition-colors cursor-pointer"
                  style={{ backgroundColor: presetColor }}
                  title={`Preset ${index + 1}\nClick to use\nRight-click to save current color`}
                />
              </div>
            ))}
          </div>
        </div>

        {!isMaximized && (
          <>
            <Separator orientation="vertical" className="h-8" />

            <div className="flex items-center gap-3 min-w-[150px]">
              <span className="text-sm font-medium whitespace-nowrap">Size: {brushSize}</span>
              <Slider value={[brushSize]} onValueChange={(v) => setBrushSize(v[0])} min={1} max={50} step={1} />
            </div>
          </>
        )}

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

        <Button
          size="icon"
          variant="outline"
          onClick={toggleMaximize}
          title={isMaximized ? "Exit Fullscreen" : "Maximize Canvas"}
        >
          {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      <div
        ref={containerRef}
        className={`bg-card rounded-xl shadow-lg border overflow-auto min-h-0 relative ${
          isMaximized ? "fixed inset-4 z-50 flex-none" : "flex-1"
        }`}
      >
        <div className="inline-block min-w-full min-h-full p-4">
          <div className="relative inline-block border-4 border-primary/30 rounded-lg">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={handleMouseMove}
              onMouseUp={stopDrawing}
              onMouseLeave={() => {
                stopDrawing()
                setShowCursor(false)
              }}
              onMouseEnter={() => setShowCursor(true)}
              className="block"
              style={{
                cursor: tool === "fill" ? "crosshair" : "none",
                width: "1024px",
                height: "768px",
              }}
            />
            {tool !== "fill" && showCursor && (
              <div
                className="pointer-events-none absolute rounded-full border-2 border-primary/50 bg-transparent"
                style={{
                  width: `${brushSize}px`,
                  height: `${brushSize}px`,
                  left: `${cursorPos.x}px`,
                  top: `${cursorPos.y}px`,
                  transform: "translate(-50%, -50%)",
                  transition: "width 0.1s, height 0.1s",
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
