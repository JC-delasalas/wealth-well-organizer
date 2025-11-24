import { useState } from 'react';
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
  Cell,
  ComposedChart,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useBudgets } from '@/hooks/useBudgets';
import { Calendar, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, subWeeks, subDays, subYears } from 'date-fns';

interface CategoryData {
  name: string;
  amount: number;
  color: string;
}

export const AdvancedReports = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [historicalPeriods, setHistoricalPeriods] = useState(6); // Number of periods to show
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'budgets' | 'seasonal'>('overview');
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { budgets } = useBudgets();

  // Get transactions for current period only (for current period stats)
  const getCurrentPeriodTransactions = () => {
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
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
    }

    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= start && date <= end;
    });
  };

  // Get historical transactions for trend analysis
  const getHistoricalTransactions = () => {
    const now = new Date();
    const historicalData: Array<{
      period: string;
      transactions: typeof transactions;
      start: Date;
      end: Date;
    }> = [];

    for (let i = historicalPeriods - 1; i >= 0; i--) {
      let start: Date, end: Date, periodLabel: string;

      switch (period) {
        case 'daily':
          const dayDate = subDays(now, i);
          start = startOfDay(dayDate);
          end = endOfDay(dayDate);
          periodLabel = format(dayDate, 'MMM dd');
          break;
        case 'weekly':
          const weekDate = subWeeks(now, i);
          start = startOfWeek(weekDate);
          end = endOfWeek(weekDate);
          periodLabel = format(start, 'MMM dd');
          break;
        case 'monthly':
          const monthDate = subMonths(now, i);
          start = startOfMonth(monthDate);
          end = endOfMonth(monthDate);
          periodLabel = format(monthDate, 'MMM yyyy');
          break;
        case 'yearly':
          const yearDate = subYears(now, i);
          start = new Date(yearDate.getFullYear(), 0, 1);
          end = new Date(yearDate.getFullYear(), 11, 31);
          periodLabel = yearDate.getFullYear().toString();
          break;
      }

      const periodTransactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date >= start && date <= end;
      });

      historicalData.push({
        period: periodLabel,
        transactions: periodTransactions,
        start,
        end
      });
    }

    return historicalData;
  };

  const generateSpendingByCategory = (): CategoryData[] => {
    const filtered = getCurrentPeriodTransactions().filter(t => t.type === 'expense');
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
    const historicalData = getHistoricalTransactions();

    return historicalData.map(periodData => {
      const income = periodData.transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = periodData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        date: periodData.period,
        income,
        expenses,
        net: income - expenses
      };
    });
  };

  const generateTrends = () => {
    const currentPeriodTransactions = getCurrentPeriodTransactions();
    const historicalData = getHistoricalTransactions();

    const totalIncome = currentPeriodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = currentPeriodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netAmount / totalIncome) * 100 : 0;

    // Calculate trends compared to previous period
    const previousPeriod = historicalData[historicalData.length - 2];
    let incomeChange = 0;
    let expenseChange = 0;

    if (previousPeriod) {
      const prevIncome = previousPeriod.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const prevExpenses = previousPeriod.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

      incomeChange = prevIncome > 0 ? ((totalIncome - prevIncome) / prevIncome) * 100 : 0;
      expenseChange = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;
    }

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      savingsRate,
      transactionCount: currentPeriodTransactions.length,
      incomeChange,
      expenseChange,
      historicalPeriods: historicalData.length
    };
  };

  // Category Trend Analysis - Multi-month spending patterns per category
  const generateCategoryTrends = () => {
    const historicalData = getHistoricalTransactions();
    const categoryTrends: Record<string, any[]> = {};

    historicalData.forEach(periodData => {
      const categorySpending: Record<string, number> = {};

      periodData.transactions
        .filter(t => t.type === 'expense')
        .forEach(transaction => {
          const category = categories.find(c => c.id === transaction.category_id);
          const categoryName = category?.name || 'Unknown';
          categorySpending[categoryName] = (categorySpending[categoryName] || 0) + transaction.amount;
        });

      Object.entries(categorySpending).forEach(([categoryName, amount]) => {
        if (!categoryTrends[categoryName]) {
          categoryTrends[categoryName] = [];
        }
        categoryTrends[categoryName].push({
          period: periodData.period,
          amount,
          category: categoryName
        });
      });
    });

    // Convert to format suitable for LineChart
    const trendData = historicalData.map(periodData => {
      const dataPoint: any = { period: periodData.period };
      Object.keys(categoryTrends).forEach(categoryName => {
        const periodAmount = categoryTrends[categoryName].find(
          item => item.period === periodData.period
        )?.amount || 0;
        dataPoint[categoryName] = periodAmount;
      });
      return dataPoint;
    });

    return { trendData, categories: Object.keys(categoryTrends) };
  };

  // Year-over-Year Comparison
  const generateYearOverYearComparison = () => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    const currentYearTransactions = transactions.filter(t =>
      new Date(t.date).getFullYear() === currentYear
    );

    const previousYearTransactions = transactions.filter(t =>
      new Date(t.date).getFullYear() === previousYear
    );

    const monthlyComparison = [];

    for (let month = 0; month < 12; month++) {
      const currentMonthData = currentYearTransactions.filter(t =>
        new Date(t.date).getMonth() === month
      );

      const previousMonthData = previousYearTransactions.filter(t =>
        new Date(t.date).getMonth() === month
      );

      const currentIncome = currentMonthData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const currentExpenses = currentMonthData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const previousIncome = previousMonthData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const previousExpenses = previousMonthData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      monthlyComparison.push({
        month: format(new Date(currentYear, month, 1), 'MMM'),
        currentIncome,
        currentExpenses,
        previousIncome,
        previousExpenses,
        currentNet: currentIncome - currentExpenses,
        previousNet: previousIncome - previousExpenses
      });
    }

    return monthlyComparison;
  };

  // Spending Velocity - Rate of change in spending
  const generateSpendingVelocity = () => {
    const historicalData = getHistoricalTransactions();

    return historicalData.map((periodData, index) => {
      const expenses = periodData.transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      let velocity = 0;
      if (index > 0) {
        const previousExpenses = historicalData[index - 1].transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        velocity = previousExpenses > 0 ? ((expenses - previousExpenses) / previousExpenses) * 100 : 0;
      }

      return {
        period: periodData.period,
        expenses,
        velocity,
        trend: velocity > 0 ? 'increasing' : velocity < 0 ? 'decreasing' : 'stable'
      };
    });
  };

  // Budget vs Actual Analysis
  const generateBudgetVsActual = () => {
    const currentPeriodTransactions = getCurrentPeriodTransactions();
    const budgetComparison: any[] = [];

    budgets.forEach(budget => {
      const category = categories.find(c => c.id === budget.category_id);
      const categoryName = category?.name || 'Unknown';

      // Calculate actual spending for this category in current period
      const actualSpending = currentPeriodTransactions
        .filter(t => t.category_id === budget.category_id && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const budgetAmount = budget.amount;
      const variance = actualSpending - budgetAmount;
      const utilizationRate = budgetAmount > 0 ? (actualSpending / budgetAmount) * 100 : 0;

      budgetComparison.push({
        category: categoryName,
        budgeted: budgetAmount,
        actual: actualSpending,
        variance,
        utilizationRate,
        status: utilizationRate > 100 ? 'over' : utilizationRate > 80 ? 'warning' : 'good',
        color: category?.color || '#6b7280'
      });
    });

    return budgetComparison;
  };

  // Seasonal Analysis - Quarterly spending patterns
  const generateSeasonalAnalysis = () => {
    const quarterlyData = [
      { quarter: 'Q1', months: [0, 1, 2], name: 'Jan-Mar' },
      { quarter: 'Q2', months: [3, 4, 5], name: 'Apr-Jun' },
      { quarter: 'Q3', months: [6, 7, 8], name: 'Jul-Sep' },
      { quarter: 'Q4', months: [9, 10, 11], name: 'Oct-Dec' }
    ];

    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    return quarterlyData.map(quarter => {
      const currentYearData = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === currentYear &&
               quarter.months.includes(date.getMonth());
      });

      const previousYearData = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === previousYear &&
               quarter.months.includes(date.getMonth());
      });

      const currentExpenses = currentYearData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const previousExpenses = previousYearData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const change = previousExpenses > 0 ?
        ((currentExpenses - previousExpenses) / previousExpenses) * 100 : 0;

      return {
        quarter: quarter.quarter,
        name: quarter.name,
        currentYear: currentExpenses,
        previousYear: previousExpenses,
        change,
        fill: change > 0 ? '#ef4444' : '#10b981'
      };
    });
  };

  // Cash Flow Projections
  const generateCashFlowProjections = () => {
    const historicalData = getHistoricalTransactions();
    const projections = [];

    // Calculate average income and expenses
    const avgIncome = historicalData.reduce((sum, period) => {
      return sum + period.transactions
        .filter(t => t.type === 'income')
        .reduce((periodSum, t) => periodSum + t.amount, 0);
    }, 0) / historicalData.length;

    const avgExpenses = historicalData.reduce((sum, period) => {
      return sum + period.transactions
        .filter(t => t.type === 'expense')
        .reduce((periodSum, t) => periodSum + t.amount, 0);
    }, 0) / historicalData.length;

    // Project next 6 periods
    let cumulativeBalance = trends.netAmount;

    for (let i = 1; i <= 6; i++) {
      const projectedIncome = avgIncome * (1 + (Math.random() - 0.5) * 0.1); // ±5% variance
      const projectedExpenses = avgExpenses * (1 + (Math.random() - 0.5) * 0.1); // ±5% variance
      const projectedNet = projectedIncome - projectedExpenses;

      cumulativeBalance += projectedNet;

      projections.push({
        period: `+${i} ${period}`,
        projectedIncome,
        projectedExpenses,
        projectedNet,
        cumulativeBalance,
        confidence: Math.max(0.9 - (i * 0.1), 0.4) // Decreasing confidence over time
      });
    }

    return projections;
  };

  const categoryData = generateSpendingByCategory();
  const incomeExpenseData = generateIncomeVsExpenses();
  const trends = generateTrends();
  const categoryTrends = generateCategoryTrends();
  const yearOverYearData = generateYearOverYearComparison();
  const spendingVelocityData = generateSpendingVelocity();
  const budgetVsActualData = generateBudgetVsActual();
  const seasonalData = generateSeasonalAnalysis();
  const cashFlowProjections = generateCashFlowProjections();

  const downloadReport = () => {
    const reportData = {
      period,
      historicalPeriods,
      dateGenerated: new Date().toISOString(),
      summary: trends,
      categoryBreakdown: categoryData,
      historicalData: getHistoricalTransactions(),
      currentPeriodTransactions: getCurrentPeriodTransactions()
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
          <Select value={period} onValueChange={(value: 'daily' | 'weekly' | 'monthly' | 'yearly') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Select value={historicalPeriods.toString()} onValueChange={(value) => setHistoricalPeriods(parseInt(value))}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Periods</SelectItem>
              <SelectItem value="6">6 Periods</SelectItem>
              <SelectItem value="12">12 Periods</SelectItem>
              <SelectItem value="24">24 Periods</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={downloadReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'overview' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('overview')}
          className="flex-1"
        >
          Overview
        </Button>
        <Button
          variant={activeTab === 'trends' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('trends')}
          className="flex-1"
        >
          Trends & Analysis
        </Button>
        <Button
          variant={activeTab === 'budgets' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('budgets')}
          className="flex-1"
        >
          Budget Analysis
        </Button>
        <Button
          variant={activeTab === 'seasonal' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('seasonal')}
          className="flex-1"
        >
          Seasonal & Projections
        </Button>
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
                {trends.incomeChange !== 0 && (
                  <p className={`text-xs ${trends.incomeChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trends.incomeChange > 0 ? '+' : ''}{trends.incomeChange.toFixed(1)}% vs prev period
                  </p>
                )}
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
                {trends.expenseChange !== 0 && (
                  <p className={`text-xs ${trends.expenseChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {trends.expenseChange > 0 ? '+' : ''}{trends.expenseChange.toFixed(1)}% vs prev period
                  </p>
                )}
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
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
      )}

      {/* Trends & Analysis Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Category Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Category Spending Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={categoryTrends.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {categoryTrends.categories.slice(0, 5).map((category, index) => (
                    <Line
                      key={category}
                      type="monotone"
                      dataKey={category}
                      stroke={`hsl(${index * 60}, 70%, 50%)`}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Year-over-Year Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={yearOverYearData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="currentIncome" fill="#10b981" name="Current Year Income" />
                  <Bar dataKey="previousIncome" fill="#6ee7b7" name="Previous Year Income" />
                  <Line type="monotone" dataKey="currentNet" stroke="#059669" name="Current Net" strokeWidth={3} />
                  <Line type="monotone" dataKey="previousNet" stroke="#34d399" name="Previous Net" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Spending Velocity */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Velocity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={spendingVelocityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="velocity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Budget Analysis Tab */}
      {activeTab === 'budgets' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual Spending</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetVsActualData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetVsActualData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
                    <Bar dataKey="actual" fill="#ef4444" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  No budget data available. Create budgets to see analysis.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Utilization */}
          {budgetVsActualData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {budgetVsActualData.map((budget, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{budget.category}</h4>
                      <Badge variant={budget.status === 'over' ? 'destructive' : budget.status === 'warning' ? 'secondary' : 'default'}>
                        {budget.utilizationRate.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Budgeted:</span>
                        <span>${budget.budgeted.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Actual:</span>
                        <span>${budget.actual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span>Variance:</span>
                        <span className={budget.variance > 0 ? 'text-red-600' : 'text-green-600'}>
                          {budget.variance > 0 ? '+' : ''}${budget.variance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Seasonal & Projections Tab */}
      {activeTab === 'seasonal' && (
        <div className="space-y-6">
          {/* Seasonal Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Spending Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadialBarChart data={seasonalData} innerRadius="30%" outerRadius="90%">
                  <RadialBar dataKey="currentYear" cornerRadius={10} fill="#8884d8" />
                  <Tooltip />
                  <Legend />
                </RadialBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cash Flow Projections */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cashFlowProjections}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="projectedIncome" stroke="#10b981" strokeWidth={2} name="Projected Income" />
                  <Line type="monotone" dataKey="projectedExpenses" stroke="#ef4444" strokeWidth={2} name="Projected Expenses" />
                  <Line type="monotone" dataKey="cumulativeBalance" stroke="#3b82f6" strokeWidth={3} name="Cumulative Balance" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Projection Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cashFlowProjections.slice(0, 3).map((projection, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{projection.period}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Projected Income:</span>
                      <span className="text-green-600">${projection.projectedIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Projected Expenses:</span>
                      <span className="text-red-600">${projection.projectedExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Net:</span>
                      <span className={projection.projectedNet > 0 ? 'text-green-600' : 'text-red-600'}>
                        ${projection.projectedNet.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Confidence:</span>
                      <span>{(projection.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
