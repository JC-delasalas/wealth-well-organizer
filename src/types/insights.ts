// Enhanced types for financial insights system with duplicate prevention and user preferences
import type { Transaction, Category, Budget, SavingsGoal } from './index';

export type InsightType = 'daily' | 'weekly' | 'monthly' | 'threshold_alert';

export type InsightFrequency = 'daily' | 'weekly' | 'monthly' | 'disabled';

export type InsightPriority = 'low' | 'medium' | 'high';

export type GenerationTrigger = 'scheduled' | 'manual' | 'threshold' | 'legacy';

// Enhanced Financial Insight interface
export interface FinancialInsight {
  id: string;
  user_id: string;
  insight_type: InsightType;
  title: string;
  content: string;
  priority: InsightPriority;
  period_start?: string; // ISO date string
  period_end?: string; // ISO date string
  is_read: boolean;
  content_hash?: string; // SHA-256 hash for duplicate detection
  generation_trigger: GenerationTrigger;
  last_generated_at: string; // ISO timestamp
  created_at: string; // ISO timestamp
}

// User Insight Preferences interface
export interface UserInsightPreferences {
  id: string;
  user_id: string;
  insight_frequency: InsightFrequency;
  enabled_insight_types: InsightType[];
  preferred_delivery_time: string; // HH:MM:SS format
  last_insight_generation?: string; // ISO timestamp
  next_generation_due?: string; // ISO timestamp
  timezone: string; // IANA timezone identifier
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

// Input types for creating/updating preferences
export interface CreateInsightPreferencesInput {
  insight_frequency: InsightFrequency;
  enabled_insight_types: InsightType[];
  preferred_delivery_time: string;
  timezone?: string;
}

export interface UpdateInsightPreferencesInput extends Partial<CreateInsightPreferencesInput> {
  id: string;
}

// Input types for creating insights
export interface CreateInsightInput {
  insight_type: InsightType;
  title: string;
  content: string;
  priority?: InsightPriority;
  period_start?: string;
  period_end?: string;
  generation_trigger?: GenerationTrigger;
}

// Insight generation context
export interface InsightGenerationContext {
  user_id: string;
  preferences: UserInsightPreferences;
  transactions: Transaction[]; // Transaction data for analysis
  categories: Category[]; // Category data
  budgets?: Budget[]; // Budget data if available
  savings_goals?: SavingsGoal[]; // Savings goals data if available
}

// Insight generation result
export interface InsightGenerationResult {
  success: boolean;
  insights_generated: number;
  insights_skipped: number; // Due to duplicates
  errors: string[];
  next_generation_due?: string;
}

// Insight analytics data
export interface InsightAnalytics {
  total_insights: number;
  insights_by_type: Record<InsightType, number>;
  insights_by_priority: Record<InsightPriority, number>;
  read_rate: number; // Percentage of insights that have been read
  average_generation_interval: number; // Days between generations
  last_generation: string; // ISO timestamp
  next_generation: string; // ISO timestamp
}

// Insight content templates
export interface InsightTemplate {
  type: InsightType;
  title_template: string;
  content_template: string;
  priority: InsightPriority;
  conditions: InsightCondition[];
}

export interface InsightCondition {
  field: string; // e.g., 'spending_increase', 'savings_rate'
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'between';
  value: number | [number, number];
  threshold?: number; // For percentage-based conditions
}

// Insight scheduling information
export interface InsightSchedule {
  user_id: string;
  frequency: InsightFrequency;
  next_due: string; // ISO timestamp
  timezone: string;
  enabled_types: InsightType[];
  is_overdue: boolean;
  days_until_next: number;
}

// Duplicate detection result
export interface DuplicateCheckResult {
  is_duplicate: boolean;
  duplicate_type: 'period' | 'content' | 'none';
  existing_insight_id?: string;
  similarity_score?: number; // 0-1, for content similarity
}

// Insight generation statistics
export interface GenerationStats {
  total_generated: number;
  duplicates_prevented: number;
  generation_time_ms: number;
  insights_by_type: Record<InsightType, number>;
  errors_encountered: number;
}

// Time-based insight data
export interface TimeBasedInsightData {
  current_period: {
    start: string;
    end: string;
    spending: number;
    income: number;
    transactions: number;
  };
  previous_period: {
    start: string;
    end: string;
    spending: number;
    income: number;
    transactions: number;
  };
  comparison: {
    spending_change: number; // Percentage
    income_change: number; // Percentage
    transaction_change: number; // Percentage
    net_change: number; // Absolute value
  };
}

// Category-based insight data
export interface CategoryInsightData {
  category_id: string;
  category_name: string;
  current_spending: number;
  previous_spending: number;
  change_percentage: number;
  transaction_count: number;
  average_transaction: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

// Budget-related insight data
export interface BudgetInsightData {
  budget_id: string;
  category_name: string;
  budgeted_amount: number;
  actual_spending: number;
  utilization_percentage: number;
  remaining_amount: number;
  days_remaining: number;
  projected_overspend: number;
  status: 'on_track' | 'warning' | 'over_budget';
}

// Savings goal insight data
export interface SavingsGoalInsightData {
  goal_id: string;
  goal_name: string;
  target_amount: number;
  current_amount: number;
  progress_percentage: number;
  target_date: string;
  days_remaining: number;
  required_monthly_savings: number;
  current_monthly_rate: number;
  on_track: boolean;
}

// Insight notification settings
export interface InsightNotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  priority_threshold: InsightPriority; // Only notify for this priority and above
  quiet_hours_start: string; // HH:MM format
  quiet_hours_end: string; // HH:MM format
}

// Export utility types
export type InsightTypeArray = InsightType[];
export type InsightFrequencyOption = { value: InsightFrequency; label: string };
export type InsightTypeOption = { value: InsightType; label: string; description: string };

// Constants for insight system
export const INSIGHT_FREQUENCIES: InsightFrequencyOption[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'disabled', label: 'Disabled' }
];

export const INSIGHT_TYPES: InsightTypeOption[] = [
  { 
    value: 'daily', 
    label: 'Daily Insights', 
    description: 'Daily spending patterns and quick tips' 
  },
  { 
    value: 'weekly', 
    label: 'Weekly Insights', 
    description: 'Weekly financial summaries and trends' 
  },
  { 
    value: 'monthly', 
    label: 'Monthly Insights', 
    description: 'Monthly financial analysis and planning' 
  },
  { 
    value: 'threshold_alert', 
    label: 'Threshold Alerts', 
    description: 'Alerts when spending exceeds limits' 
  }
];

export const DEFAULT_PREFERENCES: Omit<UserInsightPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  insight_frequency: 'weekly',
  enabled_insight_types: ['weekly', 'monthly', 'threshold_alert'],
  preferred_delivery_time: '09:00:00',
  timezone: 'UTC'
};
