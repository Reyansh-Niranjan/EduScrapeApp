import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-medium tracking-wide uppercase transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring select-none [&>svg]:size-3 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-border bg-secondary text-secondary-foreground",
        outline:
          "border-border text-foreground bg-transparent",
        green:
          "border-transparent bg-[var(--pastel-green-bg)] text-[var(--pastel-green-text)]",
        blue:
          "border-transparent bg-[var(--pastel-blue-bg)] text-[var(--pastel-blue-text)]",
        amber:
          "border-transparent bg-[var(--pastel-amber-bg)] text-[var(--pastel-amber-text)]",
        red:
          "border-transparent bg-[var(--pastel-red-bg)] text-[var(--pastel-red-text)]",
        mono:
          "border-border bg-secondary text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
