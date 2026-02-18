import * as React from "react"
import { cn } from "@/lib/utils"
import { useDeviceInfo } from "@/hooks/use-mobile"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"

const MobileTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => {
  const { isMobile } = useDeviceInfo()
  
  if (isMobile) {
    return (
      <ScrollArea className="w-full">
        <div className="min-w-full">
          <table
            ref={ref}
            className={cn("w-full caption-bottom text-sm", className)}
            {...props}
          />
        </div>
      </ScrollArea>
    )
  }
  
  return (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
})
MobileTable.displayName = "MobileTable"

const MobileTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
MobileTableHeader.displayName = "MobileTableHeader"

const MobileTableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
))
MobileTableBody.displayName = "MobileTableBody"

const MobileTableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
))
MobileTableFooter.displayName = "MobileTableFooter"

const MobileTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => {
  const { isMobile } = useDeviceInfo()
  
  return (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
        isMobile && "min-h-[60px]", // Larger touch targets on mobile
        className
      )}
      {...props}
    />
  )
})
MobileTableRow.displayName = "MobileTableRow"

const MobileTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { isMobile } = useDeviceInfo()
  
  return (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        isMobile && "px-2 text-xs", // Compact headers on mobile
        className
      )}
      {...props}
    />
  )
})
MobileTableHead.displayName = "MobileTableHead"

const MobileTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const { isMobile } = useDeviceInfo()
  
  return (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        isMobile && "p-2 text-sm", // Compact cells on mobile
        className
      )}
      {...props}
    />
  )
})
MobileTableCell.displayName = "MobileTableCell"

const MobileTableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
))
MobileTableCaption.displayName = "MobileTableCaption"

// Mobile Card List Alternative
interface MobileCardListProps {
  children: React.ReactNode
  className?: string
}

const MobileCardList = ({ children, className }: MobileCardListProps) => {
  const { isMobile } = useDeviceInfo()
  
  if (!isMobile) {
    return <div className={className}>{children}</div>
  }
  
  return (
    <div className={cn("space-y-3", className)}>
      {children}
    </div>
  )
}

interface MobileCardItemProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

const MobileCardItem = ({ children, className, onClick }: MobileCardItemProps) => {
  const { isMobile } = useDeviceInfo()
  
  if (!isMobile) {
    return <div className={className} onClick={onClick}>{children}</div>
  }
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-colors hover:bg-muted/50 active:bg-muted",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}

export {
  MobileTable,
  MobileTableHeader,
  MobileTableBody,
  MobileTableFooter,
  MobileTableHead,
  MobileTableRow,
  MobileTableCell,
  MobileTableCaption,
  MobileCardList,
  MobileCardItem,
}
