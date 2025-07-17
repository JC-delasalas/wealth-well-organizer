
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  trend: 'up' | 'down';
  className?: string;
}

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
      "relative overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-card-hover",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-80 mb-1">{title}</p>
            <p className="text-2xl font-bold mb-2">{value}</p>
            <div className="flex items-center text-sm">
              <TrendIcon className="w-4 h-4 mr-1" />
              <span className={cn(
                "font-medium",
                isPositive ? "text-green-300" : "text-red-300"
              )}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="opacity-60 ml-1">vs last month</span>
            </div>
          </div>
          <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
