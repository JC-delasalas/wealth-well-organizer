
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
  Lightbulb
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { RecentTransactions } from './RecentTransactions';
import { CategoryChart } from './CategoryChart';
import { TransactionForm } from './transactions/TransactionForm';
import { SavingsGoalForm } from './savings/SavingsGoalForm';
import { InsightsDashboard } from './insights/InsightsDashboard';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';

export const Dashboard = () => {
  const stats = useDashboardStats();
  const { savingsGoals } = useSavingsGoals();
  const hasSavingsGoal = savingsGoals.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          <div className="flex gap-2">
            <TransactionForm />
            {!hasSavingsGoal && <SavingsGoalForm />}
          </div>
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

        {/* Insights Dashboard */}
        <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <InsightsDashboard />
        </div>

        {/* Charts and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Category Breakdown */}
          <Card className="lg:col-span-2 shadow-card hover:shadow-card-hover transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Expense Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCategories.length > 0 ? (
                <CategoryChart data={stats.topCategories} />
              ) : (
                <div className="h-80 flex items-center justify-center text-gray-500">
                  <p>No expense data available for this month</p>
                </div>
              )}
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
        <Card className="shadow-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-gray-900">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <TransactionForm 
                trigger={
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                    <Plus className="w-6 h-6" />
                    Add Income
                  </Button>
                }
              />
              <TransactionForm 
                trigger={
                  <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                    <Receipt className="w-6 h-6" />
                    Add Expense
                  </Button>
                }
              />
              <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                <TrendingUp className="w-6 h-6" />
                View Reports
              </Button>
              {hasSavingsGoal ? (
                <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                  <Target className="w-6 h-6" />
                  Update Goal
                </Button>
              ) : (
                <SavingsGoalForm 
                  trigger={
                    <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                      <Target className="w-6 h-6" />
                      Set Goal
                    </Button>
                  }
                />
              )}
              <Button variant="outline" className="h-20 flex-col gap-2 hover:bg-primary/5 hover:border-primary transition-colors">
                <Lightbulb className="w-6 h-6" />
                Get Insights
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
