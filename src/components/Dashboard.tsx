
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Plus,
  ArrowUpRight,
  Target,
  Lightbulb,
  Calculator,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from './StatsCard';
import { RecentTransactions } from './RecentTransactions';
import { CategoryChart } from './CategoryChart';
import { TransactionForm } from './transactions/TransactionForm';
import { SavingsGoalForm } from './savings/SavingsGoalForm';
import { InsightsDashboard } from './insights/InsightsDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useTransactions } from '@/hooks/useTransactions';
import { useCurrencyFormatter } from '@/hooks/useCurrency';

export const Dashboard = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const { savingsGoals } = useSavingsGoals();
  const { transactions } = useTransactions();
  const { standard: formatCurrency, compact: formatCompactCurrency } = useCurrencyFormatter();
  const hasSavingsGoal = savingsGoals.length > 0;

  // Count transactions with receipts
  const receiptsCount = transactions.filter(t => t.receipt_url).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Welcome back! Here's your financial overview.</p>
          </div>
        </div>

        {/* Quick Actions - Moved to top */}
        <Card className="shadow-card animate-fade-in mb-6 lg:mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <TransactionForm
                defaultType="income"
                trigger={
                  <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm">
                    <Plus className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Add Income</span>
                    <span className="sm:hidden">Income</span>
                  </Button>
                }
              />
              <TransactionForm
                defaultType="expense"
                trigger={
                  <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm">
                    <Receipt className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="hidden sm:inline">Add Expense</span>
                    <span className="sm:hidden">Expense</span>
                  </Button>
                }
              />
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm"
                onClick={() => navigate('/reports')}
              >
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">View Reports</span>
                <span className="sm:hidden">Reports</span>
              </Button>
              {hasSavingsGoal ? (
                <Button
                  variant="outline"
                  className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm"
                  onClick={() => navigate('/goals')}
                >
                  <Target className="w-4 h-4 sm:w-6 sm:h-6" />
                  <span className="hidden sm:inline">Update Goal</span>
                  <span className="sm:hidden">Goal</span>
                </Button>
              ) : (
                <SavingsGoalForm 
                  trigger={
                    <Button variant="outline" className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm">
                      <Target className="w-4 h-4 sm:w-6 sm:h-6" />
                      <span className="hidden sm:inline">Set Goal</span>
                      <span className="sm:hidden">Goal</span>
                    </Button>
                  }
                />
              )}
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm"
                onClick={() => navigate('/receipts')}
              >
                <Receipt className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">View Receipts</span>
                <span className="sm:hidden">Receipts</span>
                {receiptsCount > 0 && (
                  <span className="text-xs text-gray-500">({receiptsCount})</span>
                )}
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm"
                onClick={() => navigate('/insights')}
              >
                <Lightbulb className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Get Insights</span>
                <span className="sm:hidden">Insights</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm"
                onClick={() => navigate('/tax-calculator')}
              >
                <Calculator className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Tax Calculator</span>
                <span className="sm:hidden">Tax Calc</span>
              </Button>
              <Button
                variant="outline"
                className="h-16 sm:h-20 flex-col gap-1 sm:gap-2 hover:bg-primary/5 hover:border-primary transition-colors text-xs sm:text-sm"
                onClick={() => navigate('/profile')}
              >
                <Settings className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="hidden sm:inline">Settings</span>
                <span className="sm:hidden">Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-slide-up mb-6 lg:mb-8">
          <StatsCard
            title="Total Balance"
            value={formatCurrency(stats.totalBalance)}
            change={+12.5}
            icon={DollarSign}
            trend="up"
            className="gradient-primary text-white"
          />
          <StatsCard
            title="Monthly Income"
            value={formatCurrency(stats.monthlyIncome)}
            change={+8.2}
            icon={TrendingUp}
            trend="up"
            className="gradient-success text-white"
          />
          <StatsCard
            title="Monthly Expenses"
            value={formatCurrency(stats.monthlyExpenses)}
            change={-3.1}
            icon={TrendingDown}
            trend="down"
            className="bg-white text-gray-900 border shadow-card"
          />
          <StatsCard
            title="Transactions"
            value={stats.transactionCount.toString()}
            change={+15.3}
            icon={Receipt}
            trend="up"
            className="bg-white text-gray-900 border shadow-card"
          />
        </div>

        {/* Insights Dashboard */}
        <div className="animate-slide-up mb-6 lg:mb-8" style={{ animationDelay: '0.1s' }}>
          <InsightsDashboard />
        </div>

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Category Breakdown */}
          <Card className="xl:col-span-2 shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCategories.length > 0 ? (
                <div className="h-64 sm:h-72 lg:h-80">
                  <CategoryChart data={stats.topCategories} />
                </div>
              ) : (
                <div className="h-64 sm:h-72 lg:h-80 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm sm:text-base">No expense data available for this month</p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">Add some expenses to see the breakdown</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Recent Transactions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80 text-xs sm:text-sm"
                onClick={() => navigate('/transactions')}
              >
                <span className="hidden sm:inline">View All</span>
                <span className="sm:hidden">All</span>
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={stats.recentTransactions} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
