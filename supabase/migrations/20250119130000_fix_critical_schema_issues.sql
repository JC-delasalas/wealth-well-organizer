-- Fix critical database schema issues
-- Migration: 20250119130000_fix_critical_schema_issues.sql
-- This migration ensures all required tables and columns exist with proper constraints

-- =============================================================================
-- 1. FIX SAVINGS GOALS TABLE SCHEMA
-- =============================================================================

-- Ensure savings_goals table exists with all required columns
DO $$ 
BEGIN
    -- Check if savings_goals table exists, create if not
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'savings_goals') THEN
        CREATE TABLE public.savings_goals (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users NOT NULL,
            target_amount NUMERIC NOT NULL,
            current_amount NUMERIC DEFAULT 0,
            savings_percentage_threshold NUMERIC DEFAULT 20,
            salary_date_1 INTEGER DEFAULT 15,
            salary_date_2 INTEGER DEFAULT 30,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view their own savings goals" 
            ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own savings goals" 
            ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own savings goals" 
            ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own savings goals" 
            ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add missing columns to savings_goals table if they don't exist
ALTER TABLE public.savings_goals 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS target_date DATE;

-- Add constraints for new columns with proper validation
DO $$
BEGIN
    -- Add NOT NULL constraint to name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'savings_goals_name_not_null' 
        AND table_name = 'savings_goals'
    ) THEN
        -- First update existing records
        UPDATE public.savings_goals 
        SET name = 'My Savings Goal' 
        WHERE name IS NULL OR name = '';
        
        -- Then add NOT NULL constraint
        ALTER TABLE public.savings_goals 
        ALTER COLUMN name SET NOT NULL;
    END IF;
    
    -- Add NOT NULL constraint to target_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'savings_goals_target_date_not_null' 
        AND table_name = 'savings_goals'
    ) THEN
        -- First update existing records
        UPDATE public.savings_goals 
        SET target_date = CURRENT_DATE + INTERVAL '1 year'
        WHERE target_date IS NULL;
        
        -- Then add NOT NULL constraint
        ALTER TABLE public.savings_goals 
        ALTER COLUMN target_date SET NOT NULL;
    END IF;
END $$;

-- Add check constraint to ensure target_date is in the future
ALTER TABLE public.savings_goals 
DROP CONSTRAINT IF EXISTS savings_goals_target_date_future;

ALTER TABLE public.savings_goals 
ADD CONSTRAINT savings_goals_target_date_future 
CHECK (target_date > CURRENT_DATE);

-- Add check constraint to ensure target_amount is positive
ALTER TABLE public.savings_goals 
DROP CONSTRAINT IF EXISTS savings_goals_target_amount_positive;

ALTER TABLE public.savings_goals 
ADD CONSTRAINT savings_goals_target_amount_positive 
CHECK (target_amount > 0);

-- =============================================================================
-- 2. FIX FINANCIAL INSIGHTS TABLE SCHEMA
-- =============================================================================

-- Ensure financial_insights table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'financial_insights') THEN
        CREATE TABLE public.financial_insights (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID REFERENCES auth.users NOT NULL,
            insight_type TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            priority TEXT DEFAULT 'medium',
            period_start DATE,
            period_end DATE,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
        
        -- Enable RLS
        ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;
        
        -- Create RLS policies
        CREATE POLICY "Users can view their own financial insights" 
            ON public.financial_insights FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can create their own financial insights" 
            ON public.financial_insights FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update their own financial insights" 
            ON public.financial_insights FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete their own financial insights" 
            ON public.financial_insights FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- Add missing columns to financial_insights table
ALTER TABLE public.financial_insights 
ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS generation_trigger VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_financial_insights_content_hash 
ON public.financial_insights(content_hash);

CREATE INDEX IF NOT EXISTS idx_financial_insights_user_type 
ON public.financial_insights(user_id, insight_type);

CREATE INDEX IF NOT EXISTS idx_financial_insights_periods 
ON public.financial_insights(user_id, period_start, period_end);

-- Update existing insights to have generation_trigger
UPDATE public.financial_insights 
SET generation_trigger = 'legacy'
WHERE generation_trigger IS NULL;

-- =============================================================================
-- 3. CREATE USER INSIGHT PREFERENCES TABLE
-- =============================================================================

-- Create user_insight_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_insight_preferences (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
    insight_frequency VARCHAR(20) NOT NULL DEFAULT 'weekly' CHECK (insight_frequency IN ('daily', 'weekly', 'monthly', 'disabled')),
    enabled_insight_types JSONB NOT NULL DEFAULT '["daily", "weekly", "monthly", "threshold_alert"]'::jsonb,
    preferred_delivery_time TIME NOT NULL DEFAULT '09:00:00',
    last_insight_generation TIMESTAMP WITH TIME ZONE,
    next_generation_due TIMESTAMP WITH TIME ZONE,
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for user_insight_preferences
CREATE INDEX IF NOT EXISTS idx_user_insight_preferences_user_id 
ON public.user_insight_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_user_insight_preferences_next_due 
ON public.user_insight_preferences(next_generation_due) 
WHERE next_generation_due IS NOT NULL;

-- Enable RLS on user_insight_preferences
ALTER TABLE public.user_insight_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_insight_preferences
DROP POLICY IF EXISTS "Users can view their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can create their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can update their own insight preferences" ON public.user_insight_preferences;
DROP POLICY IF EXISTS "Users can delete their own insight preferences" ON public.user_insight_preferences;

CREATE POLICY "Users can view their own insight preferences" 
    ON public.user_insight_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own insight preferences" 
    ON public.user_insight_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own insight preferences" 
    ON public.user_insight_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own insight preferences" 
    ON public.user_insight_preferences FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- 4. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to calculate next generation due date
CREATE OR REPLACE FUNCTION calculate_next_generation_due(
    frequency VARCHAR(20),
    preferred_time TIME,
    user_timezone VARCHAR(50) DEFAULT 'UTC'
) RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    next_due TIMESTAMP WITH TIME ZONE;
    current_time_in_tz TIMESTAMP WITH TIME ZONE;
BEGIN
    current_time_in_tz := now() AT TIME ZONE user_timezone;
    
    CASE frequency
        WHEN 'daily' THEN
            next_due := (current_time_in_tz::date + INTERVAL '1 day' + preferred_time) AT TIME ZONE user_timezone;
        WHEN 'weekly' THEN
            next_due := (
                current_time_in_tz::date + 
                INTERVAL '1 week' - 
                INTERVAL (EXTRACT(DOW FROM current_time_in_tz) - 1) || ' days' +
                preferred_time
            ) AT TIME ZONE user_timezone;
        WHEN 'monthly' THEN
            next_due := (
                date_trunc('month', current_time_in_tz) + 
                INTERVAL '1 month' + 
                preferred_time
            ) AT TIME ZONE user_timezone;
        ELSE
            next_due := NULL;
    END CASE;
    
    RETURN next_due;
END;
$$ LANGUAGE plpgsql;

-- Function to update next_generation_due when preferences change
CREATE OR REPLACE FUNCTION update_next_generation_due()
RETURNS TRIGGER AS $$
BEGIN
    NEW.next_generation_due := calculate_next_generation_due(
        NEW.insight_frequency,
        NEW.preferred_delivery_time,
        NEW.timezone
    );
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update next_generation_due
DROP TRIGGER IF EXISTS trigger_update_next_generation_due ON public.user_insight_preferences;
CREATE TRIGGER trigger_update_next_generation_due
    BEFORE INSERT OR UPDATE ON public.user_insight_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_next_generation_due();

-- Function to check for duplicate insights
CREATE OR REPLACE FUNCTION check_duplicate_insight(
    p_user_id UUID,
    p_insight_type TEXT,
    p_period_start DATE,
    p_period_end DATE,
    p_content_hash VARCHAR(64)
) RETURNS BOOLEAN AS $$
DECLARE
    existing_count INTEGER;
BEGIN
    -- Check for exact period match
    SELECT COUNT(*) INTO existing_count
    FROM public.financial_insights
    WHERE user_id = p_user_id
        AND insight_type = p_insight_type
        AND period_start = p_period_start
        AND period_end = p_period_end;
        
    IF existing_count > 0 THEN
        RETURN TRUE;
    END IF;
    
    -- Check for content hash match (same content, different period)
    SELECT COUNT(*) INTO existing_count
    FROM public.financial_insights
    WHERE user_id = p_user_id
        AND insight_type = p_insight_type
        AND content_hash = p_content_hash
        AND created_at > (now() - INTERVAL '7 days');
        
    RETURN existing_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE public.user_insight_preferences IS 'User preferences for financial insight generation frequency and settings';
COMMENT ON COLUMN public.financial_insights.content_hash IS 'SHA-256 hash of insight content for duplicate detection';
COMMENT ON COLUMN public.financial_insights.generation_trigger IS 'What triggered this insight generation: scheduled, manual, threshold, legacy';

-- =============================================================================
-- 5. DATA VALIDATION AND CLEANUP
-- =============================================================================

-- Ensure all existing savings goals have valid data
UPDATE public.savings_goals 
SET name = 'My Savings Goal' 
WHERE name IS NULL OR name = '';

UPDATE public.savings_goals 
SET target_date = CURRENT_DATE + INTERVAL '1 year'
WHERE target_date IS NULL OR target_date <= CURRENT_DATE;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'Critical schema fixes completed successfully';
END $$;
