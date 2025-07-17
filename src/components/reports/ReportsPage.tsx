
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Transaction } from '@/types';

export const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  const filterTransactionsByPeriod = (transactions: Transaction[], period: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (period) {
      case 'current-month':
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
      case 'last-month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });
      case 'current-year':
        return transactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === currentYear;
        });
      default:
        return transactions;
    }
  };

  const filteredTransactions = filterTransactionsByPeriod(transactions, selectedPeriod);

  // Monthly summary data
  const monthlyData = React.useMemo(() => {
    const months = {};
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!months[monthKey]) {
        months[monthKey] = { month: monthKey, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        months[monthKey].income += transaction.amount;
      } else {
        months[monthKey].expenses += transaction.amount;
      }
    });
    
    return Object.values(months).sort((a: any, b: any) => a.month.localeCompare(b.month));
  }, [filteredTransactions]);

  // Category breakdown data
  const categoryData = React.useMemo(() => {
    const categoryTotals = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(transaction => {
        const category = categories.find(c => c.id === transaction.category_id);
        const categoryName = category?.name || 'Unknown';
        const categoryColor = category?.color || '#6b7280';
        
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = { name: categoryName, value: 0, color: categoryColor };
        }
        categoryTotals[categoryName].value += transaction.amount;
      });
    
    return Object.values(categoryTotals);
  }, [filteredTransactions, categories]);

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600 mt-1">Analyze your spending patterns and financial health.</p>
          </div>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-year">Current Year</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Net Income</p>
                <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${(totalIncome - totalExpenses).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="income" fill="#10b981" name="Income" />
                    <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      nameKey="name"
                    >
                      {categoryData.map((entry: any, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
