
import { useMemo } from 'react';
import { useTransactions } from './useTransactions';
import { useCategories } from './useCategories';
import { DashboardStats, CategoryStats } from '@/types';

export const useDashboardStats = (): DashboardStats => {
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  return useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter transactions for current month
    const currentMonthTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate total balance from all transactions
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalBalance = totalIncome - totalExpenses;

    // Calculate category stats for expenses
    const categoryTotals = {};
    const expenseTransactions = currentMonthTransactions.filter(t => t.type === 'expense');
    
    expenseTransactions.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category_id);
      const categoryName = category?.name || 'Unknown';
      
      if (!categoryTotals[categoryName]) {
        categoryTotals[categoryName] = {
          category: categoryName,
          amount: 0,
          count: 0,
          color: category?.color || '#6b7280'
        };
      }
      
      categoryTotals[categoryName].amount += transaction.amount;
      categoryTotals[categoryName].count += 1;
    });

    // Convert to array and calculate percentages
    const topCategories: CategoryStats[] = Object.values(categoryTotals)
      .map((cat: any) => ({
        ...cat,
        percentage: monthlyExpenses > 0 ? Math.round((cat.amount / monthlyExpenses) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Recent transactions (last 5)
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      transactionCount: transactions.length,
      topCategories,
      recentTransactions,
    };
  }, [transactions, categories]);
};
