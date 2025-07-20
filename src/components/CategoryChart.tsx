
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CategoryStats } from '@/types';

interface CategoryChartProps {
  data: CategoryStats[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: CategoryStats;
  }>;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="glass-card p-3 rounded-lg shadow-lg border border-finance-gray-600/30">
          <p className="font-medium text-white">{data.category}</p>
          <p className="text-sm text-finance-gray-300">
            Amount: <span className="font-semibold text-finance-green-400">${data.amount.toLocaleString()}</span>
          </p>
          <p className="text-sm text-finance-gray-300">
            Percentage: <span className="font-semibold text-finance-green-400">{data.percentage}%</span>
          </p>
          <p className="text-sm text-finance-gray-300">
            Transactions: <span className="font-semibold text-finance-green-400">{data.count}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
    return (
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-white font-medium">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
            dataKey="amount"
            nameKey="category"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
