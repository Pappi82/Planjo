import * as React from "react"

import { cn } from "@/lib/utils"

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  value?: number[]
  defaultValue?: number[]
  min?: number
  max?: number
  step?: number
  onValueChange?: (value: number[]) => void
}

export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
  ...props
}: SliderProps) {
  const currentValue =
    value?.[0] ?? defaultValue?.[0] ?? ((min + max) / 2)

  const percent =
    ((currentValue - min) / (max - min || 1)) * 100

  return (
    <div
      className={cn("relative w-full py-2", className)}
      {...props}
    >
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#8c6ff7] to-[#38f8c7]"
          style={{ width: `${percent}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={(event) =>
          onValueChange?.([Number(event.target.value)])
        }
        className="planjo-slider relative z-10 w-full appearance-none bg-transparent"
      />
    </div>
  )
}
