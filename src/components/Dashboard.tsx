
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Sophisticated Glassmorphism Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-finance-green-50/20">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-finance-green-100/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-purple-100/8 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-finance-green-200/12 rounded-full blur-3xl animate-pulse delay-3000"></div>

        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-12">
        {/* Enhanced Header with Glassmorphism */}
        <div className="relative mb-8 lg:mb-12">
          {/* Glassmorphism Header Background */}
          <div className="absolute -inset-4 bg-white/60 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl shadow-black/5"></div>

          <div className="relative p-6 lg:p-8">
            {/* Decorative elements */}
            <div className="absolute -top-2 -left-2 w-6 h-6 bg-finance-green-200/30 rounded-full blur-sm"></div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-200/20 rounded-full blur-sm"></div>

            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Financial
                </span>
                <span className="block lg:inline lg:ml-3 bg-gradient-to-r from-finance-green-600 via-finance-green-500 to-finance-green-700 bg-clip-text text-transparent drop-shadow-sm">
                  Dashboard
                </span>
              </h1>

              <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
                Welcome back! Here's your comprehensive financial overview.
              </p>

              {/* Decorative underline */}
              <div className="h-1 w-24 bg-gradient-to-r from-finance-green-500 to-transparent mt-4 rounded-full mx-auto lg:mx-0"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Financial Overview Cards */}
        <div className="relative mb-10 lg:mb-14">
          {/* Glassmorphism container for stats */}
          <div className="absolute -inset-2 bg-gradient-to-r from-white/40 to-white/20 backdrop-blur-sm rounded-3xl border border-white/20 shadow-lg shadow-black/5"></div>

          <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 p-4">
            <div className="group relative">
              {/* Neomorphism background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-white/40"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-finance-green-50/20 to-transparent rounded-2xl"></div>

              <StatsCard
                title="Total Balance"
                value={formatCurrency(stats.totalBalance)}
                change={+12.5}
                icon={DollarSign}
                trend="up"
                className="relative bg-white/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-black/5 rounded-2xl"
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-white/40"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-finance-green-50/20 to-transparent rounded-2xl"></div>

              <StatsCard
                title="Monthly Income"
                value={formatCurrency(stats.monthlyIncome)}
                change={+8.2}
                icon={TrendingUp}
                trend="up"
                className="relative bg-white/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-black/5 rounded-2xl"
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-white/40"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-finance-green-50/20 to-transparent rounded-2xl"></div>

              <StatsCard
                title="Monthly Expenses"
                value={formatCurrency(stats.monthlyExpenses)}
                change={-3.1}
                icon={TrendingDown}
                trend="down"
                className="relative bg-white/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-black/5 rounded-2xl"
              />
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/10 border border-white/40"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-finance-green-50/20 to-transparent rounded-2xl"></div>

              <StatsCard
                title="Transactions"
                value={stats.transactionCount.toString()}
                change={+15.3}
                icon={Receipt}
                trend="up"
                className="relative bg-white/80 backdrop-blur-sm border border-white/50 shadow-2xl shadow-black/5 rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Insights Dashboard */}
        <div className="relative mb-10 lg:mb-14">
          {/* Glassmorphism background for insights */}
          <div className="absolute -inset-3 bg-gradient-to-br from-white/50 via-white/30 to-white/20 backdrop-blur-xl rounded-3xl border border-white/30 shadow-xl shadow-black/5"></div>

          <div className="relative p-2">
            <InsightsDashboard />
          </div>
        </div>

        {/* Enhanced Financial Analytics and Activity */}
        <div className="relative grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Enhanced Category Breakdown */}
          <div className="xl:col-span-2 relative group">
            {/* Multi-layer glassmorphism background */}
            <div className="absolute -inset-2 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/40"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-finance-green-50/15 to-transparent rounded-3xl"></div>

            <Card className="relative bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="relative pb-4 pt-6 px-6">
                {/* Decorative elements */}
                <div className="absolute top-2 right-4 w-2 h-2 bg-finance-green-300/30 rounded-full"></div>
                <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-blue-300/20 rounded-full"></div>

                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-finance-green-500/20 rounded-xl blur-md"></div>
                    <div className="relative bg-gradient-to-br from-finance-green-50 to-finance-green-100/50 p-2 rounded-xl border border-finance-green-200/30">
                      <TrendingDown className="w-5 h-5 text-finance-green-600" />
                    </div>
                  </div>
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                    Expense
                  </span>
                  <span className="bg-gradient-to-r from-finance-green-600 to-finance-green-700 bg-clip-text text-transparent">
                    Categories
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative px-6 pb-6">
                {stats.topCategories.length > 0 ? (
                  <div className="h-64 sm:h-72 lg:h-80">
                    <CategoryChart data={stats.topCategories} />
                  </div>
                ) : (
                  <div className="h-64 sm:h-72 lg:h-80 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Receipt className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-sm sm:text-base text-gray-900">No expense data available for this month</p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">Add some expenses to see the breakdown</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Recent Transactions */}
          <div className="relative group">
            {/* Multi-layer glassmorphism background */}
            <div className="absolute -inset-2 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/10 border border-white/40"></div>
            <div className="absolute -inset-1 bg-gradient-to-br from-finance-green-50/15 to-transparent rounded-3xl"></div>

            <Card className="relative bg-white/90 backdrop-blur-sm border border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="relative flex flex-row items-center justify-between pb-4 pt-6 px-6">
                {/* Decorative elements */}
                <div className="absolute top-2 left-4 w-2 h-2 bg-finance-green-300/30 rounded-full"></div>
                <div className="absolute top-4 left-2 w-1.5 h-1.5 bg-blue-300/20 rounded-full"></div>

                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-finance-green-500/20 rounded-xl blur-md"></div>
                    <div className="relative bg-gradient-to-br from-finance-green-50 to-finance-green-100/50 p-2 rounded-xl border border-finance-green-200/30">
                      <Receipt className="w-5 h-5 text-finance-green-600" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                    <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                      Recent
                    </span>
                    <span className="bg-gradient-to-r from-finance-green-600 to-finance-green-700 bg-clip-text text-transparent">
                      Activity
                    </span>
                  </div>
                </CardTitle>

                <div className="relative">
                  <div className="absolute inset-0 bg-finance-green-500/10 rounded-xl blur-sm"></div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative bg-white/70 backdrop-blur-sm border border-white/30 text-finance-green-600 text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-lg shadow-black/5"
                    onClick={() => navigate('/transactions')}
                  >
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">All</span>
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="relative px-6 pb-6">
                <RecentTransactions transactions={stats.recentTransactions} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
