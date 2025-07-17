
import { Transaction, Category, SavingsGoal, InsightRecommendation } from '@/types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, differenceInDays } from 'date-fns';

export class FinancialAdvisorService {
  static generateInsights(
    transactions: Transaction[],
    categories: Category[],
    savingsGoal?: SavingsGoal
  ): InsightRecommendation[] {
    const insights: InsightRecommendation[] = [];
    const now = new Date();

    // Calculate spending patterns
    const monthlyData = this.getMonthlySpendingData(transactions, categories);
    const weeklyData = this.getWeeklySpendingData(transactions, categories);
    
    // Generate spending reduction recommendations
    insights.push(...this.generateSpendingReductions(monthlyData));
    
    // Generate savings optimization recommendations
    if (savingsGoal) {
      insights.push(...this.generateSavingsOptimizations(monthlyData, savingsGoal));
    }
    
    // Generate budget optimization recommendations
    insights.push(...this.generateBudgetOptimizations(monthlyData, weeklyData));
    
    return insights;
  }

  static checkSavingsThreshold(
    transactions: Transaction[],
    savingsGoal: SavingsGoal
  ): { belowThreshold: boolean; currentRate: number; daysUntilSalary: number; recommendations: string[] } {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Calculate current month's income and expenses
    const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentSavingsAmount = monthlyIncome - monthlyExpenses;
    const currentSavingsRate = monthlyIncome > 0 ? (currentSavingsAmount / monthlyIncome) * 100 : 0;

    // Calculate days until next salary
    const today = now.getDate();
    let nextSalaryDate: number;
    if (today <= savingsGoal.salary_date_1) {
      nextSalaryDate = savingsGoal.salary_date_1;
    } else if (today <= savingsGoal.salary_date_2) {
      nextSalaryDate = savingsGoal.salary_date_2;
    } else {
      // Next month's first salary date
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, savingsGoal.salary_date_1);
      return {
        belowThreshold: currentSavingsRate < savingsGoal.savings_percentage_threshold,
        currentRate: currentSavingsRate,
        daysUntilSalary: differenceInDays(nextMonth, now),
        recommendations: this.generateThresholdRecommendations(currentSavingsRate, savingsGoal, monthlyTransactions)
      };
    }

    const daysUntilSalary = nextSalaryDate - today;

    return {
      belowThreshold: currentSavingsRate < savingsGoal.savings_percentage_threshold,
      currentRate: currentSavingsRate,
      daysUntilSalary,
      recommendations: this.generateThresholdRecommendations(currentSavingsRate, savingsGoal, monthlyTransactions)
    };
  }

  private static generateThresholdRecommendations(
    currentRate: number,
    savingsGoal: SavingsGoal,
    transactions: Transaction[]
  ): string[] {
    const recommendations: string[] = [];
    const deficit = savingsGoal.savings_percentage_threshold - currentRate;

    if (deficit > 0) {
      // Analyze spending categories for reduction opportunities
      const expensesByCategory = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const key = t.category_id || 'uncategorized';
          expensesByCategory[key] = (expensesByCategory[key] || 0) + t.amount;
        });

      const sortedExpenses = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3);

      recommendations.push(
        `Reduce spending by ${deficit.toFixed(1)}% to meet your ${savingsGoal.savings_percentage_threshold}% savings target`
      );

      if (sortedExpenses.length > 0) {
        recommendations.push(
          `Consider reducing expenses in your top spending categories`
        );
      }

      recommendations.push(
        'Pack meals instead of dining out until your next salary',
        'Postpone non-essential purchases',
        'Use public transportation or walk when possible',
        'Review subscriptions and cancel unused services'
      );
    }

    return recommendations;
  }

  private static getMonthlySpendingData(transactions: Transaction[], categories: Category[]) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= monthStart && date <= monthEnd;
    });
  }

  private static getWeeklySpendingData(transactions: Transaction[], categories: Category[]) {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= weekStart && date <= weekEnd;
    });
  }

  private static generateSpendingReductions(monthlyTransactions: Transaction[]): InsightRecommendation[] {
    const expenses = monthlyTransactions.filter(t => t.type === 'expense');
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses === 0) return [];

    // Group by category
    const categorySpending = {};
    expenses.forEach(t => {
      const key = t.category_id || 'uncategorized';
      categorySpending[key] = (categorySpending[key] || 0) + t.amount;
    });

    const topSpendingCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => (b as number) - (a as number))[0];

    if (!topSpendingCategory) return [];

    const [categoryId, amount] = topSpendingCategory;
    const percentage = ((amount as number) / totalExpenses * 100).toFixed(1);

    return [{
      type: 'spending_reduction',
      title: 'High Category Spending Detected',
      description: `You've spent ${percentage}% of your monthly budget on one category. Consider reducing this spending.`,
      impact: 'high',
      actionItems: [
        'Set a weekly limit for this category',
        'Find alternative cheaper options',
        'Track daily spending in this category',
        'Consider bulk purchases to save money'
      ]
    }];
  }

  private static generateSavingsOptimizations(
    monthlyTransactions: Transaction[],
    savingsGoal: SavingsGoal
  ): InsightRecommendation[] {
    const monthlyIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentSavingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
    const targetRate = savingsGoal.savings_percentage_threshold;

    if (currentSavingsRate >= targetRate) {
      return [{
        type: 'savings_strategy',
        title: 'Great Savings Performance!',
        description: `You're saving ${currentSavingsRate.toFixed(1)}% of your income, exceeding your ${targetRate}% target.`,
        impact: 'medium',
        actionItems: [
          'Consider increasing your savings target',
          'Explore investment opportunities',
          'Build an emergency fund if you haven\'t already',
          'Set up automatic transfers to savings'
        ]
      }];
    }

    const deficit = targetRate - currentSavingsRate;
    const amountToReduce = (deficit / 100) * monthlyIncome;

    return [{
      type: 'savings_strategy',
      title: 'Savings Target Improvement Needed',
      description: `You need to save an additional $${amountToReduce.toFixed(2)} monthly to reach your ${targetRate}% savings goal.`,
      impact: 'high',
      actionItems: [
        `Reduce monthly expenses by $${amountToReduce.toFixed(2)}`,
        'Automate savings to make it effortless',
        'Review and cancel unnecessary subscriptions',
        'Implement the 24-hour rule for purchases over $50'
      ]
    }];
  }

  private static generateBudgetOptimizations(
    monthlyTransactions: Transaction[],
    weeklyTransactions: Transaction[]
  ): InsightRecommendation[] {
    const weeklyExpenses = weeklyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Estimate monthly spending based on weekly data
    const projectedMonthlySpending = weeklyExpenses * 4;
    const spendingTrend = projectedMonthlySpending > monthlyExpenses ? 'increasing' : 'stable';

    if (spendingTrend === 'increasing') {
      return [{
        type: 'budget_optimization',
        title: 'Spending Trend Alert',
        description: 'Your weekly spending suggests you might exceed your monthly budget.',
        impact: 'medium',
        actionItems: [
          'Review this week\'s transactions for unnecessary expenses',
          'Set weekly spending limits',
          'Use the envelope budgeting method',
          'Check in on your budget every few days'
        ]
      }];
    }

    return [];
  }
}
