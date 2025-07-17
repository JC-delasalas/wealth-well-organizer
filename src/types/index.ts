
export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  receiptName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
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
