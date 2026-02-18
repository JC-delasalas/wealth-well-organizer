import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useDeviceInfo } from "@/hooks/use-mobile"

const mobileButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Mobile-optimized sizes with minimum 44px touch targets
        "mobile-default": "h-12 px-6 py-3 text-base",
        "mobile-sm": "h-11 px-4 py-2",
        "mobile-lg": "h-14 px-8 py-4 text-lg",
        "mobile-icon": "h-12 w-12",
        "mobile-fab": "h-16 w-16 rounded-full shadow-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof mobileButtonVariants> {
  asChild?: boolean
  autoMobileSize?: boolean
}

const MobileButton = React.forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ className, variant, size, asChild = false, autoMobileSize = true, ...props }, ref) => {
    const { isMobile, isTouchDevice } = useDeviceInfo()
    const Comp = asChild ? Slot : "button"
    
    // Automatically use mobile sizes on touch devices
    const effectiveSize = React.useMemo(() => {
      if (!autoMobileSize || !isTouchDevice) return size

      // Preserve mobile-* sizes if already specified
      if (size?.startsWith('mobile-')) return size

      switch (size) {
        case "sm":
          return "mobile-sm"
        case "lg":
          return "mobile-lg"
        case "icon":
          return "mobile-icon"
        default:
          return "mobile-default"
      }
    }, [size, isTouchDevice, autoMobileSize])

    return (
      <Comp
        className={cn(mobileButtonVariants({ variant, size: effectiveSize, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
MobileButton.displayName = "MobileButton"

export { MobileButton, mobileButtonVariants }
