import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { Calendar, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

interface CategoryData {
  name: string;
  amount: number;
  color: string;
}

export const AdvancedReports = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const { transactions } = useTransactions();
  const { categories } = useCategories();

  const getFilteredTransactions = () => {
    const now = new Date();
    let start: Date, end: Date;

    switch (period) {
      case 'daily':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'weekly':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'monthly':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }

    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  };

  const generateSpendingByCategory = (): CategoryData[] => {
    const filtered = getFilteredTransactions().filter(t => t.type === 'expense');
    const categoryMap: Record<string, CategoryData> = {};

    filtered.forEach(transaction => {
      const category = categories.find(c => c.id === transaction.category_id);
      const categoryName = category?.name || 'Unknown';
      
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = {
          name: categoryName,
          amount: 0,
          color: category?.color || '#6b7280'
        };
      }
      categoryMap[categoryName].amount += transaction.amount;
    });

    return Object.values(categoryMap);
  };

  const generateIncomeVsExpenses = () => {
    const filtered = getFilteredTransactions();
    const data = {};

    filtered.forEach(transaction => {
      const date = format(new Date(transaction.date), period === 'daily' ? 'MMM dd' : period === 'weekly' ? 'MMM dd' : 'MMM yyyy');
      
      if (!data[date]) {
        data[date] = { date, income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        data[date].income += transaction.amount;
      } else {
        data[date].expenses += transaction.amount;
      }
    });

    return Object.values(data);
  };

  const generateTrends = () => {
    const filtered = getFilteredTransactions();
    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      savingsRate,
      transactionCount: filtered.length
    };
  };

  const categoryData = generateSpendingByCategory();
  const incomeExpenseData = generateIncomeVsExpenses();
  const trends = generateTrends();

  const downloadReport = () => {
    const reportData = {
      period,
      dateGenerated: new Date().toISOString(),
      summary: trends,
      categoryBreakdown: categoryData,
      transactions: getFilteredTransactions()
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `financial-report-${period}-${format(new Date(), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Advanced Financial Reports</h2>
          <p className="text-gray-600">Detailed insights into your financial patterns</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${trends.totalIncome.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${trends.totalExpenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Net Amount</p>
                <p className={`text-2xl font-bold ${trends.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${trends.netAmount.toLocaleString()}
                </p>
              </div>
              <Badge variant={trends.netAmount >= 0 ? 'default' : 'destructive'}>
                {trends.netAmount >= 0 ? 'Surplus' : 'Deficit'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {trends.savingsRate.toFixed(1)}%
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeExpenseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No expense data available for this period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
