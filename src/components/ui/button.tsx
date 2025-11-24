import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#59caff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060f]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-[#8c6ff7] via-[#6f9eff] to-[#38f8c7] text-[#05060f] shadow-[0_15px_35px_rgba(93,112,255,0.35)] hover:shadow-[0_25px_45px_rgba(93,112,255,0.45)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40 shadow-[0_10px_25px_rgba(255,92,135,0.35)]",
        outline:
          "border border-white/20 bg-transparent text-white/90 hover:bg-white/5",
        secondary: "bg-white/10 text-white hover:bg-white/15",
        ghost: "text-white/70 hover:text-white hover:bg-white/5",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
      },
      size: {
        default: "h-11 px-5 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-2xl px-7 text-base has-[>svg]:px-5",
        icon: "size-11 rounded-2xl",
        "icon-sm": "size-9 rounded-xl",
        "icon-lg": "size-12 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
