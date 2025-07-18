
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
      "relative overflow-hidden transition-all duration-200 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-card-hover",
      className
    )}>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium opacity-80 mb-1 truncate">{title}</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 truncate">{value}</p>
            <div className="flex items-center text-xs sm:text-sm">
              <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className={cn(
                "font-medium",
                isPositive ? "text-green-300" : "text-red-300"
              )}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="opacity-60 ml-1 hidden sm:inline">vs last month</span>
              <span className="opacity-60 ml-1 sm:hidden">vs last</span>
            </div>
          </div>
          <div className="p-2 sm:p-3 rounded-full bg-white/20 backdrop-blur-sm flex-shrink-0 ml-2">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
