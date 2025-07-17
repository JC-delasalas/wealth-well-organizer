
import { Category } from '@/types';

export const defaultCategories: Category[] = [
  // Expense Categories
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#ef4444',
    type: 'expense'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: 'Car',
    color: '#f97316',
    type: 'expense'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8b5cf6',
    type: 'expense'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899',
    type: 'expense'
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: 'Receipt',
    color: '#06b6d4',
    type: 'expense'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Heart',
    color: '#10b981',
    type: 'expense'
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'BookOpen',
    color: '#3b82f6',
    type: 'expense'
  },
  {
    id: 'other-expense',
    name: 'Other Expenses',
    icon: 'MoreHorizontal',
    color: '#6b7280',
    type: 'expense'
  },
  // Income Categories
  {
    id: 'salary',
    name: 'Salary',
    icon: 'DollarSign',
    color: '#059669',
    type: 'income'
  },
  {
    id: 'freelance',
    name: 'Freelance',
    icon: 'Briefcase',
    color: '#0891b2',
    type: 'income'
  },
  {
    id: 'investment',
    name: 'Investments',
    icon: 'TrendingUp',
    color: '#7c3aed',
    type: 'income'
  },
  {
    id: 'other-income',
    name: 'Other Income',
    icon: 'Plus',
    color: '#059669',
    type: 'income'
  }
];
