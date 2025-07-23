
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
      {/* Inner glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-finance-green-50/30 pointer-events-none rounded-2xl"></div>

      <CardContent className="relative p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Enhanced title with better typography */}
            <p className="text-sm sm:text-base font-semibold text-gray-700 mb-2 truncate tracking-wide">{title}</p>

            {/* Enhanced value with gradient text */}
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 truncate bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
              {value}
            </p>

            {/* Enhanced trend indicator */}
            <div className="flex items-center text-sm sm:text-base">
              <div className="relative mr-2">
                <div className="absolute inset-0 bg-finance-green-500/20 rounded-full blur-sm"></div>
                <TrendIcon className="relative w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-finance-green-600" />
              </div>
              <span className={cn(
                "font-bold text-base",
                isPositive ? "text-finance-green-600" : "text-red-600"
              )}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-gray-600 ml-2 font-medium hidden sm:inline">vs last month</span>
              <span className="text-gray-600 ml-2 font-medium sm:hidden">vs last</span>
            </div>
          </div>

          {/* Enhanced icon container with neomorphism */}
          <div className="relative flex-shrink-0 ml-4">
            {/* Multiple shadow layers for depth */}
            <div className="absolute inset-0 bg-finance-green-500/20 rounded-2xl blur-lg"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-finance-green-100/80 to-finance-green-200/40 rounded-2xl shadow-inner"></div>

            <div className="relative p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-finance-green-50 to-finance-green-100/70 backdrop-blur-sm border border-finance-green-200/50 shadow-xl shadow-finance-green-500/20">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-finance-green-600 drop-shadow-sm" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
