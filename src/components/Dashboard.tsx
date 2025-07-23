
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowUpRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsCard } from './StatsCard';
import { RecentTransactions } from './RecentTransactions';
import { CategoryChart } from './CategoryChart';
import { InsightsDashboard } from './insights/InsightsDashboard';
import { TransactionForm } from './transactions/TransactionForm';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCurrencyFormatter } from '@/hooks/useCurrency';

export const Dashboard = () => {
  const navigate = useNavigate();
  const stats = useDashboardStats();
  const { standard: formatCurrency } = useCurrencyFormatter();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-8 lg:py-12">
        {/* Clean Header */}
        <div className="mb-8 lg:mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                <span className="text-gray-900">Financial</span>
                <span className="block lg:inline lg:ml-3 text-finance-green-600">Dashboard</span>
              </h1>
              <p className="text-gray-600 text-base sm:text-lg font-medium leading-relaxed">
                Welcome back! Here's your comprehensive financial overview.
              </p>
            </div>

            {/* Quick Transaction Button */}
            <div className="flex justify-center lg:justify-end">
              <TransactionForm
                trigger={
                  <Button className="bg-finance-green-600 hover:bg-finance-green-700 text-white px-6 py-3 text-base font-semibold shadow-lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Transaction
                  </Button>
                }
              />
            </div>
          </div>
        </div>

        {/* Clean Financial Overview Cards */}
        <div className="mb-10 lg:mb-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <StatsCard
              title="Total Balance"
              value={formatCurrency(stats.totalBalance)}
              change={+12.5}
              icon={DollarSign}
              trend="up"
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            />

            <StatsCard
              title="Monthly Income"
              value={formatCurrency(stats.monthlyIncome)}
              change={+8.2}
              icon={TrendingUp}
              trend="up"
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            />

            <StatsCard
              title="Monthly Expenses"
              value={formatCurrency(stats.monthlyExpenses)}
              change={-3.1}
              icon={TrendingDown}
              trend="down"
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            />

            <StatsCard
              title="Transactions"
              value={stats.transactionCount.toString()}
              change={+15.3}
              icon={Receipt}
              trend="up"
              className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            />
          </div>
        </div>

        {/* Clean Insights Dashboard */}
        <div className="mb-10 lg:mb-14">
          <InsightsDashboard />
        </div>

        {/* Clean Financial Analytics and Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          {/* Clean Category Breakdown */}
          <div className="xl:col-span-2">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-gray-900">
                  <div className="bg-finance-green-100 p-2 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-finance-green-600" />
                  </div>
                  <span>Expense Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
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

          {/* Clean Recent Transactions */}
          <div>
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <CardTitle className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-gray-900">
                  <div className="bg-finance-green-100 p-2 rounded-lg">
                    <Receipt className="w-5 h-5 text-finance-green-600" />
                  </div>
                  <span>Recent Activity</span>
                </CardTitle>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-finance-green-600 border-finance-green-200 hover:bg-finance-green-50"
                  onClick={() => navigate('/transactions')}
                >
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <RecentTransactions transactions={stats.recentTransactions} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
