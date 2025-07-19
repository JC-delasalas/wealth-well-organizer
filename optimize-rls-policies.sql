-- Optimize RLS policies for better performance
-- Fix auth.uid() re-evaluation issues identified by Supabase linter

-- =============================================================================
-- 1. OPTIMIZE PROFILES TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create optimized policies using (select auth.uid())
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile" 
    ON public.profiles FOR UPDATE 
    USING (id = (select auth.uid()));

CREATE POLICY "Users can insert own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (id = (select auth.uid()));

-- =============================================================================
-- 2. OPTIMIZE CATEGORIES TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

-- Create optimized policies
CREATE POLICY "Users can view own categories" 
    ON public.categories FOR SELECT 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own categories" 
    ON public.categories FOR INSERT 
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own categories" 
    ON public.categories FOR UPDATE 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own categories" 
    ON public.categories FOR DELETE 
    USING (user_id = (select auth.uid()));

-- =============================================================================
-- 3. OPTIMIZE TRANSACTIONS TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

-- Create optimized policies
CREATE POLICY "Users can view own transactions" 
    ON public.transactions FOR SELECT 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own transactions" 
    ON public.transactions FOR INSERT 
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own transactions" 
    ON public.transactions FOR UPDATE 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own transactions" 
    ON public.transactions FOR DELETE 
    USING (user_id = (select auth.uid()));

-- =============================================================================
-- 4. OPTIMIZE BUDGETS TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

-- Create optimized policies
CREATE POLICY "Users can view own budgets" 
    ON public.budgets FOR SELECT 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own budgets" 
    ON public.budgets FOR INSERT 
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own budgets" 
    ON public.budgets FOR UPDATE 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own budgets" 
    ON public.budgets FOR DELETE 
    USING (user_id = (select auth.uid()));

-- =============================================================================
-- 5. OPTIMIZE SAVINGS_GOALS TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own savings goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can create their own savings goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can update their own savings goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can delete their own savings goals" ON public.savings_goals;

-- Create optimized policies
CREATE POLICY "Users can view their own savings goals" 
    ON public.savings_goals FOR SELECT 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own savings goals" 
    ON public.savings_goals FOR INSERT 
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own savings goals" 
    ON public.savings_goals FOR UPDATE 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own savings goals" 
    ON public.savings_goals FOR DELETE 
    USING (user_id = (select auth.uid()));

-- =============================================================================
-- 6. OPTIMIZE FINANCIAL_INSIGHTS TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own financial insights" ON public.financial_insights;
DROP POLICY IF EXISTS "Users can create their own financial insights" ON public.financial_insights;
DROP POLICY IF EXISTS "Users can update their own financial insights" ON public.financial_insights;
DROP POLICY IF EXISTS "Users can delete their own financial insights" ON public.financial_insights;

-- Create optimized policies
CREATE POLICY "Users can view their own financial insights" 
    ON public.financial_insights FOR SELECT 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own financial insights" 
    ON public.financial_insights FOR INSERT 
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own financial insights" 
    ON public.financial_insights FOR UPDATE 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own financial insights" 
    ON public.financial_insights FOR DELETE 
    USING (user_id = (select auth.uid()));

-- =============================================================================
-- 7. OPTIMIZE USER_INSIGHT_PREFERENCES TABLE RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can create their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can update their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can delete their own insight preferences" ON public.user_insight_preferences;

-- Create optimized policies
CREATE POLICY "Users can view their own insight preferences" 
    ON public.user_insight_preferences FOR SELECT 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create their own insight preferences" 
    ON public.user_insight_preferences FOR INSERT 
    WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update their own insight preferences" 
    ON public.user_insight_preferences FOR UPDATE 
    USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete their own insight preferences" 
    ON public.user_insight_preferences FOR DELETE 
    USING (user_id = (select auth.uid()));

-- =============================================================================
-- 8. CREATE INDEXES FOR BETTER RLS PERFORMANCE
-- =============================================================================

-- Create indexes on user_id columns for better RLS performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_insights_user_id ON public.financial_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insight_preferences_user_id ON public.user_insight_preferences(user_id);

-- =============================================================================
-- 9. VALIDATION QUERIES
-- =============================================================================

-- Verify all policies are using optimized pattern
SELECT 'VALIDATION: Checking optimized RLS policies' as check_type;

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN '✅ OPTIMIZED'
        WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN '⚠️ NEEDS OPTIMIZATION'
        ELSE '❓ UNKNOWN'
    END as optimization_status,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
ORDER BY tablename, policyname;

-- Check if indexes exist
SELECT 'VALIDATION: Checking RLS performance indexes' as check_type;

SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
    AND indexname LIKE '%user_id%'
ORDER BY tablename, indexname;

SELECT '✅ RLS POLICIES OPTIMIZED FOR PERFORMANCE!' as result;
