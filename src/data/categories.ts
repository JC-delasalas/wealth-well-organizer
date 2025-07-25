
import { Category } from '@/types';

/**
 * Comprehensive default financial categories for the wealth-well-organizer application
 * Organized by type: Income, Expense, and Savings & Investment categories
 */

export const defaultCategories: Category[] = [
  // ===== INCOME CATEGORIES =====
  {
    id: 'salary-wages',
    name: 'Salary/Wages',
    icon: 'DollarSign',
    color: '#059669',
    type: 'income',
    description: 'Regular employment income, salaries, and wages'
  },
  {
    id: 'business-income',
    name: 'Business Income',
    icon: 'Building2',
    color: '#0891b2',
    type: 'income',
    description: 'Revenue from business operations and self-employment'
  },
  {
    id: 'investment-returns',
    name: 'Investment Returns',
    icon: 'TrendingUp',
    color: '#7c3aed',
    type: 'income',
    description: 'Dividends, interest, capital gains, and investment profits'
  },
  {
    id: 'freelance-side-income',
    name: 'Freelance/Side Income',
    icon: 'Briefcase',
    color: '#0d9488',
    type: 'income',
    description: 'Freelance work, gig economy, and side hustle income'
  },
  {
    id: 'government-benefits',
    name: 'Government Benefits',
    icon: 'Shield',
    color: '#2563eb',
    type: 'income',
    description: 'Social security, unemployment benefits, and government assistance'
  },
  {
    id: 'other-income',
    name: 'Other Income',
    icon: 'Plus',
    color: '#16a34a',
    type: 'income',
    description: 'Miscellaneous income sources not covered by other categories'
  },

  // ===== EXPENSE CATEGORIES =====
  {
    id: 'housing',
    name: 'Housing',
    icon: 'Home',
    color: '#dc2626',
    type: 'expense',
    description: 'Rent, mortgage, utilities, and home maintenance'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: 'Car',
    color: '#f97316',
    type: 'expense',
    description: 'Fuel, public transport, car maintenance, and travel costs'
  },
  {
    id: 'food-dining',
    name: 'Food & Dining',
    icon: 'Utensils',
    color: '#ef4444',
    type: 'expense',
    description: 'Groceries, restaurants, food delivery, and dining out'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: 'Heart',
    color: '#10b981',
    type: 'expense',
    description: 'Medical expenses, insurance, pharmacy, and health services'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'Film',
    color: '#8b5cf6',
    type: 'expense',
    description: 'Movies, hobbies, subscriptions, and recreational activities'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: 'ShoppingBag',
    color: '#ec4899',
    type: 'expense',
    description: 'Clothing, electronics, personal items, and general shopping'
  },
  {
    id: 'education',
    name: 'Education',
    icon: 'BookOpen',
    color: '#3b82f6',
    type: 'expense',
    description: 'Tuition, books, courses, and educational expenses'
  },
  {
    id: 'debt-payments',
    name: 'Debt Payments',
    icon: 'CreditCard',
    color: '#dc2626',
    type: 'expense',
    description: 'Credit card payments, loans, and debt servicing'
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: 'Shield',
    color: '#0891b2',
    type: 'expense',
    description: 'Life, auto, home, and other insurance premiums'
  },
  {
    id: 'taxes',
    name: 'Taxes',
    icon: 'Receipt',
    color: '#991b1b',
    type: 'expense',
    description: 'Income tax, property tax, and other tax payments'
  },
  {
    id: 'emergency-fund',
    name: 'Emergency Fund',
    icon: 'AlertTriangle',
    color: '#ea580c',
    type: 'expense',
    description: 'Emergency fund contributions and unexpected expenses'
  },
  {
    id: 'other-expenses',
    name: 'Other Expenses',
    icon: 'MoreHorizontal',
    color: '#6b7280',
    type: 'expense',
    description: 'Miscellaneous expenses not covered by other categories'
  },

  // ===== SAVINGS & INVESTMENT CATEGORIES =====
  {
    id: 'emergency-savings',
    name: 'Emergency Savings',
    icon: 'Shield',
    color: '#dc2626',
    type: 'expense',
    description: 'Emergency fund for unexpected expenses and financial security'
  },
  {
    id: 'retirement-savings',
    name: 'Retirement Savings',
    icon: 'Clock',
    color: '#7c3aed',
    type: 'expense',
    description: '401k, IRA, pension contributions, and retirement planning'
  },
  {
    id: 'investment-portfolio',
    name: 'Investment Portfolio',
    icon: 'TrendingUp',
    color: '#059669',
    type: 'expense',
    description: 'Stocks, bonds, mutual funds, and investment contributions'
  },
  {
    id: 'education-fund',
    name: 'Education Fund',
    icon: 'GraduationCap',
    color: '#2563eb',
    type: 'expense',
    description: 'College savings, education planning, and learning investments'
  },
  {
    id: 'vacation-fund',
    name: 'Vacation Fund',
    icon: 'Plane',
    color: '#0891b2',
    type: 'expense',
    description: 'Travel savings, vacation planning, and leisure fund'
  },
  {
    id: 'home-down-payment',
    name: 'Home Down Payment',
    icon: 'Home',
    color: '#16a34a',
    type: 'expense',
    description: 'Savings for home purchase, down payment, and real estate'
  },
  {
    id: 'other-savings-goals',
    name: 'Other Savings Goals',
    icon: 'Target',
    color: '#0d9488',
    type: 'expense',
    description: 'Custom savings goals and specific financial targets'
  }
];

/**
 * Get categories by type
 */
export const getCategoriesByType = (type: 'income' | 'expense') => {
  return defaultCategories.filter(category => category.type === type);
};

/**
 * Get income categories
 */
export const getIncomeCategories = () => getCategoriesByType('income');

/**
 * Get expense categories
 */
export const getExpenseCategories = () => getCategoriesByType('expense');

/**
 * Get category by ID
 */
export const getCategoryById = (id: string) => {
  return defaultCategories.find(category => category.id === id);
};

/**
 * Category color palette for consistent theming
 */
export const categoryColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#c084fc', '#ec4899', '#f43f5e', '#dc2626'
];

/**
 * Available icons for categories
 */
export const categoryIcons = [
  'DollarSign', 'Building2', 'TrendingUp', 'Briefcase', 'Shield', 'Plus',
  'Home', 'Car', 'Utensils', 'Heart', 'Film', 'ShoppingBag', 'BookOpen',
  'CreditCard', 'Receipt', 'AlertTriangle', 'MoreHorizontal', 'Clock',
  'GraduationCap', 'Plane', 'Target', 'PiggyBank', 'Wallet'
];
