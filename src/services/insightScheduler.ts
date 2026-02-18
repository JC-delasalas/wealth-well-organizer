// Insight scheduler service for managing background insight generation

import { supabase } from '@/integrations/supabase/client';
import {
  UserInsightPreferences,
  InsightGenerationResult,
  InsightGenerationContext,
  CreateInsightInput,
  InsightType,
} from '@/types/insights';
import type { Transaction, Category, Budget, SavingsGoal } from '@/types';
import { createInsightWithDeduplication } from '@/utils/insightDeduplication';

// Scheduler class for managing insight generation
export class InsightScheduler {
  private static instance: InsightScheduler;
  private schedulerInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private isGenerating = false; // Prevent concurrent generations
  private lastGenerationTime = 0;
  private readonly MIN_GENERATION_INTERVAL = 30000; // 30 seconds between generations

  private constructor() {}

  static getInstance(): InsightScheduler {
    if (!InsightScheduler.instance) {
      InsightScheduler.instance = new InsightScheduler();
    }
    return InsightScheduler.instance;
  }

  // Start the scheduler
  start(): void {
    if (this.isRunning) {
      console.log('Insight scheduler is already running');
      return;
    }

    this.isRunning = true;
    console.log('Starting insight scheduler...');

    // Check for due insights every 5 minutes
    this.schedulerInterval = setInterval(() => {
      this.checkAndGenerateInsights();
    }, 5 * 60 * 1000);

    // Run initial check
    this.checkAndGenerateInsights();
  }

  // Stop the scheduler
  stop(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
    this.isRunning = false;
    console.log('Insight scheduler stopped');
  }

  // Check if scheduler is running
  isSchedulerRunning(): boolean {
    return this.isRunning;
  }

  // Main method to check and generate insights for all users
  private async checkAndGenerateInsights(): Promise<void> {
    try {
      console.log('Checking for users due for insight generation...');

      // Get current user (in a real app, this would check all users)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.log('No authenticated user found');
        return;
      }

      // Check if this user is due for insights
      const { data: preferences, error: prefError } = await supabase
        .from('user_insight_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefError || !preferences) {
        console.log('No preferences found for user:', user.id);
        return;
      }

      // Check if generation is due
      if (!this.isGenerationDue(preferences)) {
        console.log('Insight generation not due for user:', user.id);
        return;
      }

      console.log('Generating insights for user:', user.id);
      await this.generateInsightsForUser(user.id, preferences);

    } catch (error) {
      console.error('Error in scheduled insight generation:', error);
    }
  }

  // Check if insight generation is due for a user
  private isGenerationDue(preferences: UserInsightPreferences): boolean {
    if (preferences.insight_frequency === 'disabled') {
      return false;
    }

    if (!preferences.next_generation_due) {
      return true; // First time generation
    }

    const nextDue = new Date(preferences.next_generation_due);
    const now = new Date();

    return nextDue <= now;
  }

  // Generate insights for a specific user with concurrency protection
  async generateInsightsForUser(
    userId: string,
    preferences?: UserInsightPreferences
  ): Promise<InsightGenerationResult> {
    // Prevent concurrent generations
    if (this.isGenerating) {
      console.log('Insight generation already in progress, skipping...');
      return {
        success: false,
        insights_generated: 0,
        insights_skipped: 0,
        errors: ['Insight generation already in progress']
      };
    }

    // Check minimum interval between generations
    const now = Date.now();
    if (now - this.lastGenerationTime < this.MIN_GENERATION_INTERVAL) {
      const remainingTime = this.MIN_GENERATION_INTERVAL - (now - this.lastGenerationTime);
      console.log(`Generation rate limited, ${remainingTime}ms remaining`);
      return {
        success: false,
        insights_generated: 0,
        insights_skipped: 0,
        errors: [`Rate limited - please wait ${Math.ceil(remainingTime / 1000)} seconds`]
      };
    }

    this.isGenerating = true;
    this.lastGenerationTime = now;

    try {
      console.log(`Generating insights for user: ${userId}`);

      // Get user preferences if not provided
      if (!preferences) {
        const { data: prefs, error: prefError } = await supabase
          .from('user_insight_preferences')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (prefError || !prefs) {
          throw new Error('User preferences not found');
        }
        preferences = prefs;
      }

      // Get user data for analysis
      const context = await this.getUserDataContext(userId, preferences!);

      // Generate insights based on enabled types
      const results: InsightGenerationResult = {
        success: true,
        insights_generated: 0,
        insights_skipped: 0,
        errors: []
      };

      // Process insight types sequentially to prevent API overload
      for (const insightType of preferences!.enabled_insight_types) {
        try {
          const insights = await this.generateInsightsByType(insightType, context);

          // Process insights sequentially with delays
          for (let i = 0; i < insights.length; i++) {
            const insight = insights[i];

            // Add delay between insight creations to prevent API overload
            if (i > 0) {
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            const result = await createInsightWithDeduplication(userId, insight);

            if (result.success && !result.skipped) {
              results.insights_generated++;
            } else if (result.skipped) {
              results.insights_skipped++;
            } else if (result.error) {
              results.errors.push(result.error);

              // If we hit rate limits, stop generating more insights
              if (result.error.includes('rate limit') || result.error.includes('ERR_INSUFFICIENT_RESOURCES')) {
                console.log('Rate limit detected, stopping insight generation');
                break;
              }
            }
          }

          // Add delay between insight types
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          results.errors.push(`Error generating ${insightType} insights: ${errorMessage}`);
        }
      }

      // Update last generation timestamp
      await this.updateLastGeneration(userId);

      console.log(`Insight generation completed for user ${userId}:`, results);
      return results;

    } catch (error) {
      console.error('Error generating insights for user:', error);
      return {
        success: false,
        insights_generated: 0,
        insights_skipped: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    } finally {
      this.isGenerating = false;
    }
  }

  // Get user data context for insight generation
  private async getUserDataContext(
    userId: string, 
    preferences: UserInsightPreferences
  ): Promise<InsightGenerationContext> {
    // Fetch user's financial data
    const [transactions, categories, budgets, savingsGoals] = await Promise.all([
      this.getUserTransactions(userId),
      this.getUserCategories(userId),
      this.getUserBudgets(userId),
      this.getUserSavingsGoals(userId)
    ]);

    return {
      user_id: userId,
      preferences,
      transactions,
      categories,
      budgets,
      savings_goals: savingsGoals
    };
  }

  // Fetch user transactions
  private async getUserTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1000); // Last 1000 transactions

    if (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }

    return data || [];
  }

  // Fetch user categories
  private async getUserCategories(userId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data || [];
  }

  // Fetch user budgets
  private async getUserBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching budgets:', error);
      return [];
    }

    return data || [];
  }

  // Fetch user savings goals
  private async getUserSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    const { data, error } = await supabase
      .from('savings_goals')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching savings goals:', error);
      return [];
    }

    return data || [];
  }

  // Generate insights by type
  private async generateInsightsByType(
    type: InsightType, 
    context: InsightGenerationContext
  ): Promise<CreateInsightInput[]> {
    switch (type) {
      case 'daily':
        return this.generateDailyInsights(context);
      case 'weekly':
        return this.generateWeeklyInsights(context);
      case 'monthly':
        return this.generateMonthlyInsights(context);
      case 'threshold_alert':
        return this.generateThresholdAlerts(context);
      default:
        return [];
    }
  }

  // Generate daily insights
  private async generateDailyInsights(context: InsightGenerationContext): Promise<CreateInsightInput[]> {
    const insights: CreateInsightInput[] = [];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's and yesterday's transactions
    const todayTransactions = context.transactions.filter(t => 
      new Date(t.date).toDateString() === today.toDateString()
    );
    
    const yesterdayTransactions = context.transactions.filter(t => 
      new Date(t.date).toDateString() === yesterday.toDateString()
    );

    // Daily spending summary
    const todaySpending = todayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const yesterdaySpending = yesterdayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    if (todayTransactions.length > 0) {
      const change = yesterdaySpending > 0 ? 
        ((todaySpending - yesterdaySpending) / yesterdaySpending) * 100 : 0;

      insights.push({
        insight_type: 'daily',
        title: 'Daily Spending Update',
        content: `Today you spent $${todaySpending.toFixed(2)} across ${todayTransactions.length} transactions. ${
          change > 0 ? 
            `This is ${change.toFixed(1)}% more than yesterday.` :
            change < 0 ?
              `This is ${Math.abs(change).toFixed(1)}% less than yesterday.` :
              'This is about the same as yesterday.'
        }`,
        priority: todaySpending > yesterdaySpending * 1.5 ? 'high' : 'medium',
        period_start: today.toISOString().split('T')[0],
        period_end: today.toISOString().split('T')[0],
        generation_trigger: 'scheduled'
      });
    }

    return insights;
  }

  // Generate weekly insights
  private async generateWeeklyInsights(context: InsightGenerationContext): Promise<CreateInsightInput[]> {
    const insights: CreateInsightInput[] = [];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Start of current week
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // End of current week

    // Get this week's transactions
    const weekTransactions = context.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= weekStart && transactionDate <= weekEnd;
    });

    if (weekTransactions.length > 0) {
      const weeklySpending = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const weeklyIncome = weekTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      insights.push({
        insight_type: 'weekly',
        title: 'Weekly Financial Summary',
        content: `This week you spent $${weeklySpending.toFixed(2)} and earned $${weeklyIncome.toFixed(2)}. Your net change is $${(weeklyIncome - weeklySpending).toFixed(2)}.`,
        priority: 'medium',
        period_start: weekStart.toISOString().split('T')[0],
        period_end: weekEnd.toISOString().split('T')[0],
        generation_trigger: 'scheduled'
      });
    }

    return insights;
  }

  // Generate monthly insights
  private async generateMonthlyInsights(context: InsightGenerationContext): Promise<CreateInsightInput[]> {
    const insights: CreateInsightInput[] = [];
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get this month's transactions
    const monthTransactions = context.transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    if (monthTransactions.length > 0) {
      const monthlySpending = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const savingsRate = monthlyIncome > 0 ? 
        ((monthlyIncome - monthlySpending) / monthlyIncome) * 100 : 0;

      insights.push({
        insight_type: 'monthly',
        title: 'Monthly Financial Review',
        content: `This month you spent $${monthlySpending.toFixed(2)} and earned $${monthlyIncome.toFixed(2)}. Your savings rate is ${savingsRate.toFixed(1)}%.`,
        priority: savingsRate < 10 ? 'high' : 'medium',
        period_start: monthStart.toISOString().split('T')[0],
        period_end: monthEnd.toISOString().split('T')[0],
        generation_trigger: 'scheduled'
      });
    }

    return insights;
  }

  // Generate threshold alerts
  private async generateThresholdAlerts(context: InsightGenerationContext): Promise<CreateInsightInput[]> {
    const insights: CreateInsightInput[] = [];
    
    // Check budget thresholds
    for (const budget of context.budgets || []) {
      const category = context.categories.find(c => c.id === budget.category_id);
      const categoryName = category?.name || 'Unknown Category';
      
      // Get spending for this budget period
      const budgetSpending = context.transactions
        .filter(t => 
          t.type === 'expense' && 
          t.category_id === budget.category_id &&
          new Date(t.date) >= new Date(budget.start_date) &&
          (!budget.end_date || new Date(t.date) <= new Date(budget.end_date))
        )
        .reduce((sum, t) => sum + t.amount, 0);

      const utilizationRate = (budgetSpending / budget.amount) * 100;

      if (utilizationRate >= 90) {
        insights.push({
          insight_type: 'threshold_alert',
          title: `Budget Alert: ${categoryName}`,
          content: `You've used ${utilizationRate.toFixed(1)}% of your ${categoryName} budget ($${budgetSpending.toFixed(2)} of $${budget.amount.toFixed(2)}).`,
          priority: utilizationRate >= 100 ? 'high' : 'medium',
          generation_trigger: 'threshold'
        });
      }
    }

    return insights;
  }

  // Update last generation timestamp
  private async updateLastGeneration(userId: string): Promise<void> {
    try {
      await supabase
        .from('user_insight_preferences')
        .update({
          last_insight_generation: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last generation timestamp:', error);
    }
  }
}

// Export singleton instance
export const insightScheduler = InsightScheduler.getInstance();
