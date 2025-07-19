-- Fix RLS policies to ensure proper authentication handling
-- This script updates RLS policies to handle both authenticated and service role access

-- =============================================================================
-- 1. UPDATE SAVINGS_GOALS RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own savings goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can create their own savings goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can update their own savings goals" ON public.savings_goals;
DROP POLICY IF EXISTS "Users can delete their own savings goals" ON public.savings_goals;

-- Create updated policies that handle auth properly
CREATE POLICY "Users can view their own savings goals" 
    ON public.savings_goals FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can create their own savings goals" 
    ON public.savings_goals FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can update their own savings goals" 
    ON public.savings_goals FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can delete their own savings goals" 
    ON public.savings_goals FOR DELETE 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- =============================================================================
-- 2. UPDATE FINANCIAL_INSIGHTS RLS POLICIES
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own financial insights" ON public.financial_insights;
DROP POLICY IF EXISTS "Users can create their own financial insights" ON public.financial_insights;
DROP POLICY IF EXISTS "Users can update their own financial insights" ON public.financial_insights;
DROP POLICY IF EXISTS "Users can delete their own financial insights" ON public.financial_insights;

-- Create updated policies
CREATE POLICY "Users can view their own financial insights" 
    ON public.financial_insights FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can create their own financial insights" 
    ON public.financial_insights FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can update their own financial insights" 
    ON public.financial_insights FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can delete their own financial insights" 
    ON public.financial_insights FOR DELETE 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- =============================================================================
-- 3. ENSURE USER_INSIGHT_PREFERENCES POLICIES ARE CORRECT
-- =============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can create their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can update their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can delete their own insight preferences" ON public.user_insight_preferences;

-- Create updated policies
CREATE POLICY "Users can view their own insight preferences" 
    ON public.user_insight_preferences FOR SELECT 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can create their own insight preferences" 
    ON public.user_insight_preferences FOR INSERT 
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can update their own insight preferences" 
    ON public.user_insight_preferences FOR UPDATE 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

CREATE POLICY "Users can delete their own insight preferences" 
    ON public.user_insight_preferences FOR DELETE 
    USING (
        auth.uid() = user_id OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- =============================================================================
-- 4. CREATE HELPER FUNCTION FOR TESTING
-- =============================================================================

-- Function to create a test user_id for testing purposes
CREATE OR REPLACE FUNCTION get_test_user_id() 
RETURNS UUID AS $$
BEGIN
    -- Return a consistent test UUID
    RETURN '00000000-0000-0000-0000-000000000001'::UUID;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 5. VALIDATION QUERIES
-- =============================================================================

-- Check RLS policies
SELECT 'VALIDATION: Checking RLS policies' as check_type;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN ('savings_goals', 'financial_insights', 'user_insight_preferences')
ORDER BY tablename, policyname;

-- Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('savings_goals', 'financial_insights', 'user_insight_preferences')
ORDER BY tablename;

SELECT '✅ RLS POLICIES UPDATED SUCCESSFULLY!' as result;
