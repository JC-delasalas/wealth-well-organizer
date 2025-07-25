-- Enhanced Default Categories Migration
-- Adds description field and comprehensive default categories for wealth-well-organizer

-- Add description field to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT;

-- Clear existing default categories to avoid conflicts
DELETE FROM public.categories WHERE is_default = true;

-- Insert comprehensive default categories
INSERT INTO public.categories (name, icon, color, type, description, is_default) VALUES
-- INCOME CATEGORIES
('Salary/Wages', 'DollarSign', '#059669', 'income', 'Regular employment income, salaries, and wages', true),
('Business Income', 'Building2', '#0891b2', 'income', 'Revenue from business operations and self-employment', true),
('Investment Returns', 'TrendingUp', '#7c3aed', 'income', 'Dividends, interest, capital gains, and investment profits', true),
('Freelance/Side Income', 'Briefcase', '#0d9488', 'income', 'Freelance work, gig economy, and side hustle income', true),
('Government Benefits', 'Shield', '#2563eb', 'income', 'Social security, unemployment benefits, and government assistance', true),
('Other Income', 'Plus', '#16a34a', 'income', 'Miscellaneous income sources not covered by other categories', true),

-- EXPENSE CATEGORIES
('Housing', 'Home', '#dc2626', 'expense', 'Rent, mortgage, utilities, and home maintenance', true),
('Transportation', 'Car', '#f97316', 'expense', 'Fuel, public transport, car maintenance, and travel costs', true),
('Food & Dining', 'Utensils', '#ef4444', 'expense', 'Groceries, restaurants, food delivery, and dining out', true),
('Healthcare', 'Heart', '#10b981', 'expense', 'Medical expenses, insurance, pharmacy, and health services', true),
('Entertainment', 'Film', '#8b5cf6', 'expense', 'Movies, hobbies, subscriptions, and recreational activities', true),
('Shopping', 'ShoppingBag', '#ec4899', 'expense', 'Clothing, electronics, personal items, and general shopping', true),
('Education', 'BookOpen', '#3b82f6', 'expense', 'Tuition, books, courses, and educational expenses', true),
('Debt Payments', 'CreditCard', '#dc2626', 'expense', 'Credit card payments, loans, and debt servicing', true),
('Insurance', 'Shield', '#0891b2', 'expense', 'Life, auto, home, and other insurance premiums', true),
('Taxes', 'Receipt', '#991b1b', 'expense', 'Income tax, property tax, and other tax payments', true),
('Emergency Fund', 'AlertTriangle', '#ea580c', 'expense', 'Emergency fund contributions and unexpected expenses', true),
('Other Expenses', 'MoreHorizontal', '#6b7280', 'expense', 'Miscellaneous expenses not covered by other categories', true),

-- SAVINGS & INVESTMENT CATEGORIES
('Emergency Savings', 'Shield', '#dc2626', 'expense', 'Emergency fund for unexpected expenses and financial security', true),
('Retirement Savings', 'Clock', '#7c3aed', 'expense', '401k, IRA, pension contributions, and retirement planning', true),
('Investment Portfolio', 'TrendingUp', '#059669', 'expense', 'Stocks, bonds, mutual funds, and investment contributions', true),
('Education Fund', 'GraduationCap', '#2563eb', 'expense', 'College savings, education planning, and learning investments', true),
('Vacation Fund', 'Plane', '#0891b2', 'expense', 'Travel savings, vacation planning, and leisure fund', true),
('Home Down Payment', 'Home', '#16a34a', 'expense', 'Savings for home purchase, down payment, and real estate', true),
('Other Savings Goals', 'Target', '#0d9488', 'expense', 'Custom savings goals and specific financial targets', true);

-- Create function to seed categories for new users
CREATE OR REPLACE FUNCTION public.seed_user_categories(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert default categories for the new user
  INSERT INTO public.categories (user_id, name, icon, color, type, description, is_default)
  SELECT 
    user_id,
    name,
    icon,
    color,
    type,
    description,
    false -- User-specific copies are not marked as default
  FROM public.categories 
  WHERE is_default = true
  ON CONFLICT DO NOTHING;
END;
$$;

-- Create trigger to automatically seed categories for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Seed default categories for the new user
  PERFORM public.seed_user_categories(NEW.id);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created_categories ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created_categories
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_categories();

-- Update RLS policies to handle the new structure
DROP POLICY IF EXISTS "Users can view own categories and defaults" ON public.categories;
CREATE POLICY "Users can view own categories and defaults" ON public.categories
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (is_default = true AND user_id IS NULL)
  );

-- Allow users to create their own categories
DROP POLICY IF EXISTS "Users can create own categories" ON public.categories;
CREATE POLICY "Users can create own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id AND is_default = false);

-- Allow users to update their own categories (not defaults)
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id AND is_default = false);

-- Allow users to delete their own categories (not defaults)
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_categories_user_id_type ON public.categories(user_id, type);
CREATE INDEX IF NOT EXISTS idx_categories_is_default ON public.categories(is_default);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.seed_user_categories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user_categories() TO service_role;
