"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-white/20 bg-white/5 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[#8c6ff7] data-[state=checked]:to-[#38f8c7] data-[state=checked]:text-[#05060f] size-5 shrink-0 rounded-lg border shadow-[0_6px_18px_rgba(0,0,0,0.35)] transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#59caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060f] disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
