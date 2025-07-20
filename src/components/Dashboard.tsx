
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowUpRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from './StatsCard';
import { RecentTransactions } from './RecentTransactions';
import { CategoryChart } from './CategoryChart';
import { InsightsDashboard } from './insights/InsightsDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCurrencyFormatter } from '@/hooks/useCurrency';

export const Dashboard = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const { standard: formatCurrency } = useCurrencyFormatter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-finance-gray-900 via-finance-gray-800 to-finance-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="animate-fade-in">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Financial <span className="text-finance-green-400">Dashboard</span>
            </h1>
            <p className="text-finance-gray-300 mt-1 text-sm sm:text-base">
              Welcome back! Here's your comprehensive financial overview.
            </p>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 animate-slide-up mb-6 lg:mb-8">
          <StatsCard
            title="Total Balance"
            value={formatCurrency(stats.totalBalance)}
            change={+12.5}
            icon={DollarSign}
            trend="up"
            className="glass-card-green text-white border-finance-green-500/30"
          />
          <StatsCard
            title="Monthly Income"
            value={formatCurrency(stats.monthlyIncome)}
            change={+8.2}
            icon={TrendingUp}
            trend="up"
            className="glass-card text-white border-finance-green-400/20"
          />
          <StatsCard
            title="Monthly Expenses"
            value={formatCurrency(stats.monthlyExpenses)}
            change={-3.1}
            icon={TrendingDown}
            trend="down"
            className="glass-card text-white border-finance-gray-600/30"
          />
          <StatsCard
            title="Transactions"
            value={stats.transactionCount.toString()}
            change={+15.3}
            icon={Receipt}
            trend="up"
            className="glass-card text-white border-finance-gray-600/30"
          />
        </div>

        {/* Insights Dashboard */}
        <div className="animate-slide-up mb-6 lg:mb-8" style={{ animationDelay: '0.1s' }}>
          <InsightsDashboard />
        </div>

        {/* Financial Analytics and Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Category Breakdown */}
          <Card className="xl:col-span-2 glass-card border-finance-gray-600/30 hover:border-finance-green-500/40 transition-all duration-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-finance-green-400" />
                Expense <span className="text-finance-green-400">Categories</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCategories.length > 0 ? (
                <div className="h-64 sm:h-72 lg:h-80">
                  <CategoryChart data={stats.topCategories} />
                </div>
              ) : (
                <div className="h-64 sm:h-72 lg:h-80 flex items-center justify-center text-finance-gray-400">
                  <div className="text-center">
                    <Receipt className="w-12 h-12 mx-auto mb-4 text-finance-gray-500" />
                    <p className="text-sm sm:text-base text-white">No expense data available for this month</p>
                    <p className="text-xs sm:text-sm text-finance-gray-400 mt-1">Add some expenses to see the breakdown</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="glass-card border-finance-gray-600/30 hover:border-finance-green-500/40 transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-finance-green-400" />
                Recent <span className="text-finance-green-400">Activity</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-finance-green-400 hover:text-finance-green-300 hover:bg-finance-green-500/10 text-xs sm:text-sm transition-colors"
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
