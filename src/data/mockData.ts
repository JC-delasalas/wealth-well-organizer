
import { Transaction, DashboardStats } from '@/types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 5000,
    type: 'income',
    category_id: 'salary-cat-id',
    description: 'Monthly Salary',
    date: '2024-01-15',
  },
  {
    id: '2',
    amount: 85.50,
    type: 'expense',
    category_id: 'food-cat-id',
    description: 'Grocery shopping',
    date: '2024-01-14',
  },
  {
    id: '3',
    amount: 1200,
    type: 'expense',
    category_id: 'bills-cat-id',
    description: 'Rent payment',
    date: '2024-01-01',
  },
  {
    id: '4',
    amount: 45.25,
    type: 'expense',
    category_id: 'transportation-cat-id',
    description: 'Gas station',
    date: '2024-01-13',
  },
  {
    id: '5',
    amount: 120,
    type: 'expense',
    category_id: 'entertainment-cat-id',
    description: 'Movie tickets and dinner',
    date: '2024-01-12',
  },
  {
    id: '6',
    amount: 300,
    type: 'income',
    category_id: 'freelance-cat-id',
    description: 'Website project',
    date: '2024-01-10',
  }
];

export const mockDashboardStats: DashboardStats = {
  totalBalance: 3548.25,
  monthlyIncome: 5300,
  monthlyExpenses: 1751.75,
  transactionCount: 6,
  topCategories: [
    {
      category: 'Bills & Utilities',
      amount: 1200,
      percentage: 68.5,
      count: 1,
      color: '#06b6d4'
    },
    {
      category: 'Entertainment',
      amount: 120,
      percentage: 6.9,
      count: 1,
      color: '#8b5cf6'
    },
    {
      category: 'Food & Dining',
      amount: 85.50,
      percentage: 4.9,
      count: 1,
      color: '#ef4444'
    },
    {
      category: 'Transportation',
      amount: 45.25,
      percentage: 2.6,
      count: 1,
      color: '#f97316'
    }
  ],
  recentTransactions: mockTransactions.slice(0, 5)
};
