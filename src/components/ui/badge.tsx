import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold tracking-[0.08em] uppercase w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none transition-all",
  {
    variants: {
      variant: {
        default: "border-white/30 bg-white/10 text-white",
        secondary: "border-[#8c6ff7]/60 text-[#8c6ff7] bg-[#8c6ff7]/10",
        destructive: "border-destructive/70 bg-destructive/10 text-destructive",
        outline: "border-white/25 text-white/70",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
