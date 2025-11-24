
import { useEffect, useCallback, useRef } from 'react';
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

  // Refs to track what insights have been generated to prevent spam
  const generatedInsightsRef = useRef<Set<string>>(new Set());
  const lastGenerationTimeRef = useRef<number>(0);
  const thresholdAlertGeneratedRef = useRef<boolean>(false);

  // Throttling constants
  const GENERATION_COOLDOWN = 30000; // 30 seconds between generations
  const MAX_INSIGHTS_PER_SESSION = 10; // Maximum insights per session

  // Memoize the createInsight function
  const memoizedCreateInsight = useCallback(createInsight, [createInsight]);

  // Helper function to create insight hash for deduplication
  const createInsightHash = useCallback((title: string, content: string) => {
    return `${title}-${content}`.replace(/\s+/g, '').toLowerCase();
  }, []);

  // Throttled insight generation with deduplication
  const generateInsightsThrottled = useCallback(() => {
    const now = Date.now();

    // Check throttling
    if (now - lastGenerationTimeRef.current < GENERATION_COOLDOWN) {
      return;
    }

    // Check session limits
    if (generatedInsightsRef.current.size >= MAX_INSIGHTS_PER_SESSION) {
      return;
    }

    if (transactions.length > 0 && categories.length > 0) {
      const aiInsights = FinancialAdvisorService.generateInsights(
        transactions,
        currentSavingsGoal
      );

      // Filter out already generated insights and limit to 3 per generation
      const newInsights = aiInsights
        .filter(insight => {
          const hash = createInsightHash(insight.title, insight.description);
          return !generatedInsightsRef.current.has(hash);
        })
        .slice(0, 3); // Limit to 3 insights per generation

      // Create insights in database with deduplication
      newInsights.forEach(insight => {
        const hash = createInsightHash(insight.title, insight.description);
        generatedInsightsRef.current.add(hash);

        memoizedCreateInsight({
          insight_type: 'monthly',
          title: insight.title,
          content: insight.description,
          priority: insight.impact
        });
      });

      lastGenerationTimeRef.current = now;
    }
  }, [transactions, categories, currentSavingsGoal, memoizedCreateInsight, createInsightHash]);

  // Generate new insights when data changes (throttled)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateInsightsThrottled();
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timeoutId);
  }, [generateInsightsThrottled]);

  // Check savings threshold
  const thresholdCheck = currentSavingsGoal
    ? FinancialAdvisorService.checkSavingsThreshold(transactions, currentSavingsGoal)
    : null;

  // Generate threshold alert if needed (with deduplication)
  useEffect(() => {
    if (thresholdCheck?.belowThreshold && currentSavingsGoal && !thresholdAlertGeneratedRef.current) {
      // Check if we already have a recent threshold alert
      const recentThresholdAlert = insights.find(insight =>
        insight.insight_type === 'threshold_alert' &&
        insight.title === 'Savings Threshold Alert' &&
        !insight.is_read &&
        new Date(insight.created_at).getTime() > Date.now() - 24 * 60 * 60 * 1000 // Within last 24 hours
      );

      if (!recentThresholdAlert) {
        memoizedCreateInsight({
          insight_type: 'threshold_alert',
          title: 'Savings Threshold Alert',
          content: `Your current savings rate is ${thresholdCheck.currentRate.toFixed(1)}%, below your ${currentSavingsGoal.savings_percentage_threshold}% target. You have ${thresholdCheck.daysUntilSalary} days until your next salary.`,
          priority: 'high'
        });

        thresholdAlertGeneratedRef.current = true;

        // Reset the flag after 24 hours
        setTimeout(() => {
          thresholdAlertGeneratedRef.current = false;
        }, 24 * 60 * 60 * 1000);
      }
    }
  }, [thresholdCheck?.belowThreshold, currentSavingsGoal, memoizedCreateInsight, insights]);

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
        <Alert className="border-red-300 bg-red-50 border">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-gray-900">
            <div className="font-semibold mb-2 text-red-700">Savings Alert: Below {currentSavingsGoal?.savings_percentage_threshold}% Target</div>
            <div className="space-y-1 text-sm">
              <p>Current savings rate: <span className="text-finance-green-600">{thresholdCheck.currentRate.toFixed(1)}%</span></p>
              <p>Days until next salary: <span className="text-finance-green-600">{thresholdCheck.daysUntilSalary}</span></p>
              <div className="mt-3">
                <p className="font-medium mb-1 text-gray-900">Recommendations:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
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
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Target className="w-5 h-5 text-finance-green-600" />
              Savings Goal <span className="text-finance-green-600">Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-finance-green-600">
                  {thresholdCheck?.currentRate.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">Current Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {currentSavingsGoal.savings_percentage_threshold}%
                </div>
                <div className="text-sm text-gray-600">Target Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-finance-green-600">
                  {thresholdCheck?.daysUntilSalary}
                </div>
                <div className="text-sm text-gray-600">Days to Salary</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Insights */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Lightbulb className="w-5 h-5 text-finance-green-600" />
              Financial <span className="text-finance-green-600">Insights</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="bg-finance-green-600 text-white">{unreadCount} new</Badge>
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
            <div className="text-center py-8 text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50 text-gray-400" />
              <p className="text-gray-900">No insights available yet</p>
              <p className="text-sm text-gray-500">Add more transactions to get personalized recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  className={cn(
                    "p-4 rounded-lg border",
                    insight.is_read
                      ? "bg-gray-50 border-gray-200 opacity-75"
                      : "bg-finance-green-50 border-finance-green-200 shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(insight.priority)}
                      <h4 className={cn(
                        "font-semibold",
                        insight.is_read ? "text-gray-500" : "text-gray-900"
                      )}>
                        {insight.title}
                      </h4>
                      <Badge variant={getPriorityColor(insight.priority)} className="bg-finance-green-100 text-finance-green-700 border-finance-green-200">
                        {insight.priority}
                      </Badge>
                      {insight.is_read && (
                        <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
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
                          className="text-finance-green-600"
                        >
                          Mark as read
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
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
                              className="bg-red-600"
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
                    "text-sm",
                    insight.is_read ? "text-gray-500" : "text-gray-700"
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
