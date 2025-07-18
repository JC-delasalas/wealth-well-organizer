-- Add missing fields to savings_goals table
ALTER TABLE public.savings_goals 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'My Savings Goal',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS target_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 year');

-- Update existing records to have a default name if they don't have one
UPDATE public.savings_goals 
SET name = 'My Savings Goal' 
WHERE name IS NULL OR name = '';

-- Remove the default constraint after updating existing records
ALTER TABLE public.savings_goals 
ALTER COLUMN name DROP DEFAULT;
