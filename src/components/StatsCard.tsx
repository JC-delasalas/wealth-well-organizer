
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
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {/* Clean title with better readability */}
            <p className="text-sm sm:text-base font-semibold text-gray-600 mb-2 truncate">{title}</p>

            {/* Clean value with high contrast */}
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 truncate text-gray-900">
              {value}
            </p>

            {/* Clean trend indicator */}
            <div className="flex items-center text-sm sm:text-base">
              <TrendIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-finance-green-600 mr-2" />
              <span className={cn(
                "font-semibold",
                isPositive ? "text-finance-green-600" : "text-red-600"
              )}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-gray-500 ml-2 font-medium hidden sm:inline">vs last month</span>
              <span className="text-gray-500 ml-2 font-medium sm:hidden">vs last</span>
            </div>
          </div>

          {/* Clean icon container */}
          <div className="flex-shrink-0 ml-4">
            <div className="p-3 sm:p-4 rounded-xl bg-finance-green-100 border border-finance-green-200">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-finance-green-600" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
