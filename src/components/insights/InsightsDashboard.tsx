
import React, { useEffect, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Target,
  Calendar,
  DollarSign,
  CheckCheck,
  Trash2
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useFinancialInsights } from '@/hooks/useFinancialInsights';
import { useCurrencyFormatter } from '@/hooks/useCurrency';
import { FinancialAdvisorService } from '@/services/financialAdvisor';
import { cn } from '@/lib/utils';

export const InsightsDashboard = () => {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { savingsGoals } = useSavingsGoals();
  const { insights, createInsight, markAsRead, markAllAsRead, deleteInsight, isMarkingAllAsRead, isDeletingInsight, unreadCount } = useFinancialInsights();
  const { standard: formatCurrency } = useCurrencyFormatter();

  const currentSavingsGoal = savingsGoals[0]; // Use first savings goal

  // Memoize the createInsight function
  const memoizedCreateInsight = useCallback(createInsight, [createInsight]);

  // Generate new insights when data changes
  useEffect(() => {
    if (transactions.length > 0 && categories.length > 0) {
      const aiInsights = FinancialAdvisorService.generateInsights(
        transactions,
        categories,
        currentSavingsGoal
      );

      // Create insights in database
      aiInsights.forEach(insight => {
        memoizedCreateInsight({
          insight_type: 'monthly',
          title: insight.title,
          content: insight.description,
          priority: insight.impact,
          is_read: false
        });
      });
    }
  }, [transactions, categories, currentSavingsGoal, memoizedCreateInsight]);

  // Check savings threshold
  const thresholdCheck = currentSavingsGoal 
    ? FinancialAdvisorService.checkSavingsThreshold(transactions, currentSavingsGoal)
    : null;

  // Generate threshold alert if needed
  useEffect(() => {
    if (thresholdCheck?.belowThreshold && currentSavingsGoal) {
      memoizedCreateInsight({
        insight_type: 'threshold_alert',
        title: 'Savings Threshold Alert',
        content: `Your current savings rate is ${thresholdCheck.currentRate.toFixed(1)}%, below your ${currentSavingsGoal.savings_percentage_threshold}% target. You have ${thresholdCheck.daysUntilSalary} days until your next salary.`,
        priority: 'high',
        is_read: false
      });
    }
  }, [thresholdCheck, currentSavingsGoal, memoizedCreateInsight]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'medium':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default:
        return <Lightbulb className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Savings Threshold Alert */}
      {thresholdCheck?.belowThreshold && (
        <Alert className="border-red-400/30 bg-red-500/10 glass-card">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-white">
            <div className="font-semibold mb-2 text-red-300">Savings Alert: Below {currentSavingsGoal?.savings_percentage_threshold}% Target</div>
            <div className="space-y-1 text-sm">
              <p>Current savings rate: <span className="text-finance-green-400">{thresholdCheck.currentRate.toFixed(1)}%</span></p>
              <p>Days until next salary: <span className="text-finance-green-400">{thresholdCheck.daysUntilSalary}</span></p>
              <div className="mt-3">
                <p className="font-medium mb-1 text-white">Recommendations:</p>
                <ul className="list-disc list-inside space-y-1 text-finance-gray-300">
                  {thresholdCheck.recommendations.slice(0, 3).map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Savings Overview */}
      {currentSavingsGoal && (
        <Card className="glass-card border-finance-gray-600/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-finance-green-400" />
              Savings Goal <span className="text-finance-green-400">Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-finance-green-400">
                  {thresholdCheck?.currentRate.toFixed(1)}%
                </div>
                <div className="text-sm text-finance-gray-300">Current Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {currentSavingsGoal.savings_percentage_threshold}%
                </div>
                <div className="text-sm text-finance-gray-300">Target Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-finance-green-400">
                  {thresholdCheck?.daysUntilSalary}
                </div>
                <div className="text-sm text-finance-gray-300">Days to Salary</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Insights */}
      <Card className="glass-card border-finance-gray-600/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <Lightbulb className="w-5 h-5 text-finance-green-400" />
              Financial <span className="text-finance-green-400">Insights</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="bg-finance-green-500 text-white">{unreadCount} new</Badge>
              )}
            </CardTitle>

            {unreadCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isMarkingAllAsRead}
                    className="flex items-center gap-2"
                  >
                    <CheckCheck className="w-4 h-4" />
                    {isMarkingAllAsRead ? 'Marking...' : 'Mark All as Read'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Mark All Insights as Read?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark all {unreadCount} unread insight{unreadCount !== 1 ? 's' : ''} as read.
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => markAllAsRead()}
                      disabled={isMarkingAllAsRead}
                    >
                      {isMarkingAllAsRead ? 'Marking...' : 'Mark All as Read'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-finance-gray-400">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50 text-finance-gray-500" />
              <p className="text-white">No insights available yet</p>
              <p className="text-sm text-finance-gray-400">Add more transactions to get personalized recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-300",
                    insight.is_read
                      ? "bg-finance-gray-800/30 border-finance-gray-600/30 opacity-75"
                      : "bg-finance-green-500/10 border-finance-green-500/30 shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(insight.priority)}
                      <h4 className={cn(
                        "font-semibold transition-colors",
                        insight.is_read ? "text-finance-gray-400" : "text-white"
                      )}>
                        {insight.title}
                      </h4>
                      <Badge variant={getPriorityColor(insight.priority)} className="bg-finance-green-500/20 text-finance-green-300 border-finance-green-500/30">
                        {insight.priority}
                      </Badge>
                      {insight.is_read && (
                        <Badge variant="secondary" className="text-xs bg-finance-gray-700/50 text-finance-gray-300">
                          Read
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!insight.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(insight.id)}
                          className="text-finance-green-400 hover:text-finance-green-300 hover:bg-finance-green-500/10"
                        >
                          Mark as read
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            disabled={isDeletingInsight}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Insight?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this insight "{insight.title}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteInsight(insight.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={isDeletingInsight}
                            >
                              {isDeletingInsight ? 'Deleting...' : 'Delete Insight'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                  <p className={cn(
                    "text-sm transition-colors",
                    insight.is_read ? "text-finance-gray-400" : "text-finance-gray-200"
                  )}>
                    {insight.content}
                  </p>
                  {insight.period_start && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {insight.period_start} to {insight.period_end}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
