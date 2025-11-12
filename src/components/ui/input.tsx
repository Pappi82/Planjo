import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground bg-white/5 border border-white/10 h-12 w-full min-w-0 rounded-2xl px-5 text-base shadow-[0_10px_35px_rgba(0,0,0,0.35)] transition-all duration-200 outline-none backdrop-blur-xl file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        "focus-visible:border-[#59caff] focus-visible:ring-2 focus-visible:ring-[#59caff]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060f]",
        "aria-invalid:ring-destructive/30 aria-invalid:border-destructive/70",
        className
      )}
      {...props}
    />
  )
}

export { Input }
