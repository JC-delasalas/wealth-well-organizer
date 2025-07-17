
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
  ArrowDownRight
} from 'lucide-react';
import { mockDashboardStats } from '@/data/mockData';
import { StatsCard } from './StatsCard';
import { RecentTransactions } from './RecentTransactions';
import { CategoryChart } from './CategoryChart';

export const Dashboard = () => {
  const stats = mockDashboardStats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <Button 
            className="gradient-primary text-white shadow-lg hover:shadow-xl transition-all duration-200 animate-fade-in"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up">
          <StatsCard
            title="Total Balance"
            value={`$${stats.totalBalance.toLocaleString()}`}
            change={+12.5}
            icon={DollarSign}
            trend="up"
            className="gradient-primary text-white"
          />
          <StatsCard
            title="Monthly Income"
            value={`$${stats.monthlyIncome.toLocaleString()}`}
            change={+8.2}
            icon={TrendingUp}
            trend="up"
            className="gradient-success text-white"
          />
          <StatsCard
            title="Monthly Expenses"
            value={`$${stats.monthlyExpenses.toLocaleString()}`}
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

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Category Breakdown */}
          <Card className="lg:col-span-2 shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart data={stats.topCategories} />
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-semibold text-gray-900">
                Recent Transactions
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                View All
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <RecentTransactions transactions={stats.recentTransactions} />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                <Plus className="w-6 h-6" />
                Add Income
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                <Receipt className="w-6 h-6" />
                Add Expense
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                <TrendingUp className="w-6 h-6" />
                View Reports
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                <ArrowUpRight className="w-6 h-6" />
                Upload Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
