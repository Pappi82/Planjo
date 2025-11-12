import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border border-white/10 placeholder:text-muted-foreground bg-white/5 min-h-24 w-full rounded-2xl px-5 py-3 text-base shadow-[0_15px_40px_rgba(0,0,0,0.4)] transition-all duration-200 outline-none backdrop-blur-xl disabled:cursor-not-allowed disabled:opacity-60 md:text-sm",
        "focus-visible:border-[#59caff] focus-visible:ring-2 focus-visible:ring-[#59caff]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060f]",
        "aria-invalid:ring-destructive/30 aria-invalid:border-destructive/70",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
