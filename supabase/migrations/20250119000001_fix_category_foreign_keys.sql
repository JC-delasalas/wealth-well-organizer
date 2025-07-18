-- Fix category foreign key constraints to allow proper deletion handling
-- This migration adds proper CASCADE options for category references

-- First, drop existing foreign key constraints
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_category_id_fkey;
ALTER TABLE public.budgets DROP CONSTRAINT IF EXISTS budgets_category_id_fkey;

-- Add new foreign key constraints with proper CASCADE behavior
-- For transactions: SET NULL on category deletion (transactions remain but lose category)
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;

-- For budgets: CASCADE delete (budgets are deleted when category is deleted)
ALTER TABLE public.budgets 
ADD CONSTRAINT budgets_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE;

-- Add index for better performance on category lookups
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category_id ON public.budgets(category_id);

-- Update RLS policy for categories to allow deletion of categories with no active references
-- The application will handle the usage check before attempting deletion
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;
CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id AND is_default = false);
