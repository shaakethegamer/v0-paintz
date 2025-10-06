"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User } from "lucide-react"

const AVATAR_COLORS = [
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#F97316", // Orange
  "#3B82F6", // Blue
]

const AVATAR_SHAPES = ["circle", "square", "hexagon", "star"]

interface AvatarPickerProps {
  value?: string
  onChange: (avatar: string) => void
}

export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [open, setOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(value?.split("-")[0] || AVATAR_COLORS[0])
  const [selectedShape, setSelectedShape] = useState(value?.split("-")[1] || "circle")

  const handleSave = () => {
    onChange(`${selectedColor}-${selectedShape}`)
    setOpen(false)
  }

  const renderAvatar = (color: string, shape: string, size = 40) => {
    const shapeStyles: Record<string, string> = {
      circle: "rounded-full",
      square: "rounded-lg",
      hexagon: "rounded-lg",
      star: "rounded-lg",
    }

    return (
      <div
        className={`${shapeStyles[shape]} flex items-center justify-center`}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
        }}
      >
        <User className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    )
  }

  const currentAvatar = value ? value.split("-") : [selectedColor, selectedShape]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          {renderAvatar(currentAvatar[0], currentAvatar[1], 24)}
          <span>Choose Avatar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Preview */}
          <div className="flex justify-center">
            <div className="p-4 bg-muted rounded-2xl">{renderAvatar(selectedColor, selectedShape, 80)}</div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Color</h3>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-full aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedColor === color ? "border-primary ring-2 ring-primary/20 scale-105" : "border-border"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Shape Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Shape</h3>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_SHAPES.map((shape) => (
                <button
                  key={shape}
                  onClick={() => setSelectedShape(shape)}
                  className={`p-4 border-2 rounded-xl transition-all hover:scale-105 ${
                    selectedShape === shape ? "border-primary bg-primary/5 scale-105" : "border-border"
                  }`}
                >
                  {renderAvatar(selectedColor, shape, 32)}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button onClick={handleSave} className="w-full">
            Save Avatar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AvatarDisplay({ avatar, size = 40 }: { avatar?: string; size?: number }) {
  if (!avatar) {
    return (
      <div className="rounded-full bg-muted flex items-center justify-center" style={{ width: size, height: size }}>
        <User className="text-muted-foreground" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
    )
  }

  const [color, shape] = avatar.split("-")

  const shapeStyles: Record<string, string> = {
    circle: "rounded-full",
    square: "rounded-lg",
    hexagon: "rounded-lg",
    star: "rounded-lg",
  }

  return (
    <div
      className={`${shapeStyles[shape]} flex items-center justify-center`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    >
      <User className="text-white" style={{ width: size * 0.6, height: size * 0.6 }} />
    </div>
  )
}
