-- Enhanced Savings Tracking Migration
-- This migration adds automatic savings calculation and multi-currency support

-- =============================================================================
-- 1. ADD SAVINGS GOAL RELATIONSHIP TO TRANSACTIONS
-- =============================================================================

-- Add savings_goal_id to transactions table to link savings transactions to specific goals
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS savings_goal_id UUID REFERENCES public.savings_goals(id) ON DELETE SET NULL;

-- Add index for efficient savings calculation queries
CREATE INDEX IF NOT EXISTS idx_transactions_savings_goal_id 
ON public.transactions(savings_goal_id) 
WHERE savings_goal_id IS NOT NULL;

-- Add index for user_id + savings_goal_id combination
CREATE INDEX IF NOT EXISTS idx_transactions_user_savings_goal 
ON public.transactions(user_id, savings_goal_id) 
WHERE savings_goal_id IS NOT NULL;

-- =============================================================================
-- 2. CREATE SAVINGS CATEGORY
-- =============================================================================

-- Insert default savings category if it doesn't exist
INSERT INTO public.categories (name, icon, color, type, is_default)
SELECT 'Savings', 'PiggyBank', '#10b981', 'expense', true
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories 
    WHERE name = 'Savings' AND type = 'expense' AND is_default = true
);

-- =============================================================================
-- 3. CREATE FUNCTION TO CALCULATE SAVINGS GOAL PROGRESS
-- =============================================================================

-- Function to calculate current amount for a savings goal from transactions
CREATE OR REPLACE FUNCTION calculate_savings_goal_current_amount(goal_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_saved NUMERIC DEFAULT 0;
BEGIN
    -- Sum all transactions linked to this savings goal
    SELECT COALESCE(SUM(amount), 0)
    INTO total_saved
    FROM public.transactions
    WHERE savings_goal_id = goal_id
    AND type = 'expense'; -- Savings are recorded as expenses (money going out to savings)
    
    RETURN total_saved;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 4. CREATE TRIGGER TO AUTO-UPDATE SAVINGS GOAL CURRENT AMOUNT
-- =============================================================================

-- Function to update savings goal current_amount when transactions change
CREATE OR REPLACE FUNCTION update_savings_goal_current_amount()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        -- Update the savings goal if transaction has savings_goal_id
        IF NEW.savings_goal_id IS NOT NULL THEN
            UPDATE public.savings_goals
            SET current_amount = calculate_savings_goal_current_amount(NEW.savings_goal_id),
                updated_at = NOW()
            WHERE id = NEW.savings_goal_id;
        END IF;
        
        -- If this is an UPDATE and the old savings_goal_id was different, update the old goal too
        IF TG_OP = 'UPDATE' AND OLD.savings_goal_id IS NOT NULL AND OLD.savings_goal_id != NEW.savings_goal_id THEN
            UPDATE public.savings_goals
            SET current_amount = calculate_savings_goal_current_amount(OLD.savings_goal_id),
                updated_at = NOW()
            WHERE id = OLD.savings_goal_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE
    IF TG_OP = 'DELETE' THEN
        -- Update the savings goal if transaction had savings_goal_id
        IF OLD.savings_goal_id IS NOT NULL THEN
            UPDATE public.savings_goals
            SET current_amount = calculate_savings_goal_current_amount(OLD.savings_goal_id),
                updated_at = NOW()
            WHERE id = OLD.savings_goal_id;
        END IF;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on transactions table
DROP TRIGGER IF EXISTS trigger_update_savings_goal_current_amount ON public.transactions;
CREATE TRIGGER trigger_update_savings_goal_current_amount
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_savings_goal_current_amount();

-- =============================================================================
-- 5. UPDATE EXISTING SAVINGS GOALS TO CALCULATED AMOUNTS
-- =============================================================================

-- Update all existing savings goals to use calculated current_amount
-- This will set current_amount to 0 for goals without linked transactions
UPDATE public.savings_goals
SET current_amount = calculate_savings_goal_current_amount(id),
    updated_at = NOW();

-- =============================================================================
-- 6. ADD CURRENCY SUPPORT TO EXISTING TABLES
-- =============================================================================

-- Add currency column to transactions (defaults to PHP for existing data)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PHP';

-- Add currency column to budgets (defaults to PHP for existing data)
ALTER TABLE public.budgets 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PHP';

-- Add currency column to savings_goals (defaults to PHP for existing data)
ALTER TABLE public.savings_goals 
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PHP';

-- Add foreign key constraints to supported currencies (if the table exists)
DO $$ 
BEGIN
    -- Check if supported_currencies table exists before adding constraints
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'supported_currencies') THEN
        -- Add foreign key constraints
        ALTER TABLE public.transactions 
        ADD CONSTRAINT fk_transactions_currency 
        FOREIGN KEY (currency) REFERENCES public.supported_currencies(code);
        
        ALTER TABLE public.budgets 
        ADD CONSTRAINT fk_budgets_currency 
        FOREIGN KEY (currency) REFERENCES public.supported_currencies(code);
        
        ALTER TABLE public.savings_goals 
        ADD CONSTRAINT fk_savings_goals_currency 
        FOREIGN KEY (currency) REFERENCES public.supported_currencies(code);
    END IF;
EXCEPTION
    WHEN duplicate_object THEN
        -- Constraints already exist, ignore
        NULL;
END $$;

-- =============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for currency-based queries
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON public.transactions(currency);
CREATE INDEX IF NOT EXISTS idx_budgets_currency ON public.budgets(currency);
CREATE INDEX IF NOT EXISTS idx_savings_goals_currency ON public.savings_goals(currency);

-- Index for user + currency combination
CREATE INDEX IF NOT EXISTS idx_transactions_user_currency ON public.transactions(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_budgets_user_currency ON public.budgets(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_currency ON public.savings_goals(user_id, currency);

-- =============================================================================
-- 8. UPDATE RLS POLICIES FOR NEW COLUMNS
-- =============================================================================

-- RLS policies should already cover the new columns since they filter by user_id
-- But let's ensure the savings goal relationship is properly secured

-- Create policy for savings goal access through transactions
CREATE POLICY IF NOT EXISTS "Users can link transactions to their own savings goals" 
ON public.transactions 
FOR ALL 
USING (
    user_id = (SELECT auth.uid()) 
    AND (
        savings_goal_id IS NULL 
        OR savings_goal_id IN (
            SELECT id FROM public.savings_goals 
            WHERE user_id = (SELECT auth.uid())
        )
    )
);

-- =============================================================================
-- 9. CREATE HELPER VIEWS FOR SAVINGS ANALYTICS
-- =============================================================================

-- View for savings goal progress with calculated metrics
CREATE OR REPLACE VIEW public.savings_goal_progress AS
SELECT 
    sg.id,
    sg.user_id,
    sg.name,
    sg.description,
    sg.target_amount,
    sg.current_amount,
    sg.target_date,
    sg.currency,
    sg.created_at,
    sg.updated_at,
    -- Progress percentage
    CASE 
        WHEN sg.target_amount > 0 THEN 
            ROUND((sg.current_amount / sg.target_amount * 100)::numeric, 2)
        ELSE 0 
    END as progress_percentage,
    -- Remaining amount
    (sg.target_amount - sg.current_amount) as remaining_amount,
    -- Days until target
    (sg.target_date - CURRENT_DATE) as days_remaining,
    -- Monthly savings needed (if target date is in future)
    CASE 
        WHEN sg.target_date > CURRENT_DATE AND sg.target_amount > sg.current_amount THEN
            ROUND(
                (sg.target_amount - sg.current_amount) / 
                GREATEST(1, EXTRACT(EPOCH FROM (sg.target_date - CURRENT_DATE)) / (30.44 * 24 * 3600))
            , 2)
        ELSE 0 
    END as monthly_savings_needed,
    -- Goal status
    CASE 
        WHEN sg.current_amount >= sg.target_amount THEN 'completed'
        WHEN sg.target_date < CURRENT_DATE THEN 'overdue'
        WHEN sg.target_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'urgent'
        ELSE 'active'
    END as status
FROM public.savings_goals sg;

-- RLS policy for the view
ALTER VIEW public.savings_goal_progress OWNER TO postgres;
CREATE POLICY IF NOT EXISTS "Users can view their own savings goal progress" 
ON public.savings_goal_progress 
FOR SELECT 
USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- 10. GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant permissions for the new function
GRANT EXECUTE ON FUNCTION calculate_savings_goal_current_amount(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_savings_goal_current_amount() TO authenticated;

-- Grant permissions for the view
GRANT SELECT ON public.savings_goal_progress TO authenticated;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log successful migration
DO $$ 
BEGIN
    RAISE NOTICE 'Enhanced savings tracking migration completed successfully';
    RAISE NOTICE 'Features added:';
    RAISE NOTICE '- Automatic savings goal progress calculation';
    RAISE NOTICE '- Savings category for transaction categorization';
    RAISE NOTICE '- Multi-currency support for all financial tables';
    RAISE NOTICE '- Performance indexes for efficient queries';
    RAISE NOTICE '- Savings goal progress analytics view';
END $$;
