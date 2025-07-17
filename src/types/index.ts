
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string | null;
  description: string;
  date: string;
  receipt_url?: string;
  receipt_name?: string;
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
  target_amount: number;
  current_amount: number;
  savings_percentage_threshold: number;
  salary_date_1: number;
  salary_date_2: number;
  created_at?: string;
  updated_at?: string;
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
