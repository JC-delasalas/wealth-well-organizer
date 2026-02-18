
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string | null;
  description: string;
  date: string;
  receipt_url?: string;
  receipt_name?: string;
  savings_goal_id?: string | null;
  currency?: string;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  description?: string;
  is_default?: boolean;
  user_id?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  start_date: string;
  end_date?: string;
  currency?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  savings_percentage_threshold: number;
  salary_date_1: number;
  salary_date_2: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SavingsGoalProgress {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  currency: string;
  created_at: string;
  updated_at: string;
  progress_percentage: number;
  remaining_amount: number;
  days_remaining: number;
  monthly_savings_needed: number;
  status: 'completed' | 'overdue' | 'urgent' | 'active';
}

export interface FinancialInsight {
  id: string;
  user_id: string;
  insight_type: 'daily' | 'weekly' | 'monthly' | 'threshold_alert';
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high';
  period_start?: string;
  period_end?: string;
  is_read: boolean;
  created_at?: string;
}

export interface MonthlyStats {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netAmount: number;
  transactionCount: number;
}

export interface CategoryStats {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface DashboardStats {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  transactionCount: number;
  topCategories: CategoryStats[];
  recentTransactions: Transaction[];
  savingsRate?: number;
  daysUntilSalary?: number;
}

export interface InsightRecommendation {
  type: 'spending_reduction' | 'income_increase' | 'budget_optimization' | 'savings_strategy';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionItems: string[];
}

export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Multi-currency and localization types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  country: string;
  currency: string;
  locale: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  decimal_places: number;
  is_active: boolean;
}

export interface Country {
  code: string;
  name: string;
  default_currency: string;
  tax_system: string;
  is_active: boolean;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  rate_date: string;
  source: string;
  created_at: string;
}

// Philippine tax calculation types
export interface TaxCalculation {
  id: string;
  user_id: string;
  calculation_type: 'income_tax' | 'itr_1700' | 'itr_1701' | 'itr_1702' | 'withholding_tax' | 'property_tax';
  tax_year: number;
  country_code: string;
  currency: string;
  input_data: Record<string, unknown>;
  gross_income?: number;
  taxable_income?: number;
  tax_due?: number;
  tax_withheld?: number;
  tax_payable?: number;
  tax_refund?: number;
  calculation_breakdown?: Record<string, unknown>;
  calculation_name?: string;
  notes?: string;
  is_saved: boolean;
  is_filed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PhilippineTaxBracket {
  id: string;
  tax_year: number;
  bracket_order: number;
  min_income: number;
  max_income?: number;
  base_tax: number;
  tax_rate: number;
  excess_over: number;
  is_active: boolean;
  created_at: string;
}
