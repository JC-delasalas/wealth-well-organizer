
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Props for the StatsCard component
 */
interface StatsCardProps {
  /** The title/label for the statistic */
  title: string;
  /** The formatted value to display */
  value: string;
  /** Percentage change from previous period */
  change: number;
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Whether the trend is positive or negative */
  trend: 'up' | 'down';
  /** Optional CSS classes for styling */
  className?: string;
}

/**
 * StatsCard component displays a financial statistic with trend information
 * Features responsive design, hover effects, and trend indicators
 *
 * @param props - StatsCard properties
 * @returns JSX element representing a statistics card
 */
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  trend,
  className
}) => {
  const isPositive = change > 0;
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown;

  return (
    <Card className={cn(
      "relative overflow-hidden",
      className
    )}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Compact title with better readability */}
            <p className="text-xs sm:text-sm font-semibold text-gray-600 mb-1 leading-tight">{title}</p>

            {/* Optimized value with responsive sizing */}
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-1 sm:mb-2 leading-tight text-gray-900 break-words">
              {value}
            </p>

            {/* Compact trend indicator */}
            <div className="flex items-center text-xs sm:text-sm">
              <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 text-finance-green-600 mr-1" />
              <span className={cn(
                "font-semibold whitespace-nowrap",
                isPositive ? "text-finance-green-600" : "text-red-600"
              )}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-gray-500 ml-1 font-medium text-xs hidden sm:inline whitespace-nowrap">vs last month</span>
              <span className="text-gray-500 ml-1 font-medium text-xs sm:hidden whitespace-nowrap">vs last</span>
            </div>
          </div>

          {/* Compact icon container */}
          <div className="flex-shrink-0">
            <div className="p-2 sm:p-2.5 rounded-lg bg-finance-green-100 border border-finance-green-200">
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-finance-green-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
