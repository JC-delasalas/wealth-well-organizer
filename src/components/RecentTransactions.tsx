
import React from 'react';
import { Transaction } from '@/types';
import { useCategories } from '@/hooks/useCategories';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const { categories } = useCategories();
  const { standard: formatCurrency } = useCurrencyFormatter();

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
      <div className="text-center py-6 sm:py-8 text-gray-500">
        <ArrowUpRight className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p className="text-sm sm:text-base text-gray-900">No transactions yet</p>
        <p className="text-xs sm:text-sm mt-1 text-gray-500">Add your first transaction to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 sm:space-y-3">
      {transactions.map((transaction, index) => {
        const category = getCategoryInfo(transaction.category_id);
        const isIncome = transaction.type === 'income';
        
        return (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-finance-green-50 transition-colors duration-150 border border-gray-200 hover:border-finance-green-300"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                style={{ backgroundColor: category.color }}
              >
                {isIncome ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                  {transaction.description}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  <span className="hidden sm:inline">{category.name} • </span>
                  {formatDate(transaction.date)}
                </p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={cn(
                "font-semibold text-xs sm:text-sm",
                isIncome ? "text-finance-green-600" : "text-red-600"
              )}>
                {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
