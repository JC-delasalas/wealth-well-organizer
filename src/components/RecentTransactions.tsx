
import React from 'react';
import { Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const { categories } = useCategories();

  const getCategoryInfo = (categoryId: string | null) => {
    return categories.find(cat => cat.id === categoryId) || {
      name: 'Unknown',
      icon: 'HelpCircle',
      color: '#6b7280'
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions yet</p>
        <p className="text-sm">Add your first transaction to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction, index) => {
        const category = getCategoryInfo(transaction.category_id);
        const isIncome = transaction.type === 'income';
        
        return (
          <div 
            key={transaction.id} 
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                style={{ backgroundColor: category.color }}
              >
                {isIncome ? (
                  <ArrowUpRight className="w-5 h-5" />
                ) : (
                  <ArrowDownRight className="w-5 h-5" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500">
                  {category.name} • {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className={cn(
                "font-semibold text-sm",
                isIncome ? "text-green-600" : "text-red-600"
              )}>
                {isIncome ? '+' : '-'}${transaction.amount.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
