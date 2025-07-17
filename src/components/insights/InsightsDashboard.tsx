
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  Lightbulb,
  Target,
  Calendar,
  DollarSign
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { useFinancialInsights } from '@/hooks/useFinancialInsights';
import { FinancialAdvisorService } from '@/services/financialAdvisor';
import { cn } from '@/lib/utils';

export const InsightsDashboard = () => {
  const { transactions } = useTransactions();
  const { categories } = useCategories();
  const { savingsGoals } = useSavingsGoals();
  const { insights, createInsight, markAsRead, unreadCount } = useFinancialInsights();

  const currentSavingsGoal = savingsGoals[0]; // Use first savings goal

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
        createInsight({
          insight_type: 'monthly',
          title: insight.title,
          content: insight.description,
          priority: insight.impact,
          is_read: false
        });
      });
    }
  }, [transactions.length, categories.length, currentSavingsGoal?.id]);

  // Check savings threshold
  const thresholdCheck = currentSavingsGoal 
    ? FinancialAdvisorService.checkSavingsThreshold(transactions, currentSavingsGoal)
    : null;

  // Generate threshold alert if needed
  useEffect(() => {
    if (thresholdCheck?.belowThreshold && currentSavingsGoal) {
      createInsight({
        insight_type: 'threshold_alert',
        title: 'Savings Threshold Alert',
        content: `Your current savings rate is ${thresholdCheck.currentRate.toFixed(1)}%, below your ${currentSavingsGoal.savings_percentage_threshold}% target. You have ${thresholdCheck.daysUntilSalary} days until your next salary.`,
        priority: 'high',
        is_read: false
      });
    }
  }, [thresholdCheck?.belowThreshold, currentSavingsGoal?.id]);

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
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Savings Alert: Below {currentSavingsGoal?.savings_percentage_threshold}% Target</div>
            <div className="space-y-1 text-sm">
              <p>Current savings rate: {thresholdCheck.currentRate.toFixed(1)}%</p>
              <p>Days until next salary: {thresholdCheck.daysUntilSalary}</p>
              <div className="mt-3">
                <p className="font-medium mb-1">Recommendations:</p>
                <ul className="list-disc list-inside space-y-1">
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Savings Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {thresholdCheck?.currentRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Current Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {currentSavingsGoal.savings_percentage_threshold}%
                </div>
                <div className="text-sm text-gray-600">Target Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {thresholdCheck?.daysUntilSalary}
                </div>
                <div className="text-sm text-gray-600">Days to Salary</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Financial Insights
            </span>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} new</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No insights available yet</p>
              <p className="text-sm">Add more transactions to get personalized recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.slice(0, 5).map((insight) => (
                <div 
                  key={insight.id}
                  className={cn(
                    "p-4 rounded-lg border transition-colors",
                    insight.is_read ? "bg-gray-50" : "bg-blue-50 border-blue-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(insight.priority)}
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge variant={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    {!insight.is_read && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => markAsRead(insight.id)}
                      >
                        Mark as read
                      </Button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{insight.content}</p>
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
