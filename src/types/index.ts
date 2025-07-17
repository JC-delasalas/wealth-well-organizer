
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
}
