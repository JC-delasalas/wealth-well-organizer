-- Enhance financial insights system with duplicate prevention and user preferences
-- Migration: 20250119120000_enhance_financial_insights.sql

-- First, add new columns to existing financial_insights table
ALTER TABLE public.financial_insights 
ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64),
ADD COLUMN IF NOT EXISTS generation_trigger VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS last_generated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index on content_hash for faster duplicate detection
CREATE INDEX IF NOT EXISTS idx_financial_insights_content_hash 
ON public.financial_insights(content_hash);

-- Create index on user_id and insight_type for faster queries
CREATE INDEX IF NOT EXISTS idx_financial_insights_user_type 
ON public.financial_insights(user_id, insight_type);

-- Create index on period dates for faster period-based queries
CREATE INDEX IF NOT EXISTS idx_financial_insights_periods 
ON public.financial_insights(user_id, period_start, period_end);

-- Add unique constraint to prevent duplicate insights for same period
-- Note: We'll handle this in application logic to allow for better error handling
-- ALTER TABLE public.financial_insights 
-- ADD CONSTRAINT unique_insight_period 
-- UNIQUE (user_id, insight_type, period_start, period_end);

-- Create user_insight_preferences table
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
CREATE POLICY "Users can view their own insight preferences" 
  ON public.user_insight_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insight preferences" 
  ON public.user_insight_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insight preferences" 
  ON public.user_insight_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insight preferences" 
  ON public.user_insight_preferences 
  FOR DELETE 
  USING (auth.uid() = user_id);

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
  -- Get current time in user's timezone
  current_time_in_tz := now() AT TIME ZONE user_timezone;
  
  CASE frequency
    WHEN 'daily' THEN
      -- Next day at preferred time
      next_due := (current_time_in_tz::date + INTERVAL '1 day' + preferred_time) AT TIME ZONE user_timezone;
      
    WHEN 'weekly' THEN
      -- Next Monday at preferred time
      next_due := (
        current_time_in_tz::date + 
        INTERVAL '1 week' - 
        INTERVAL (EXTRACT(DOW FROM current_time_in_tz) - 1) || ' days' +
        preferred_time
      ) AT TIME ZONE user_timezone;
      
    WHEN 'monthly' THEN
      -- First day of next month at preferred time
      next_due := (
        date_trunc('month', current_time_in_tz) + 
        INTERVAL '1 month' + 
        preferred_time
      ) AT TIME ZONE user_timezone;
      
    ELSE
      -- Disabled or unknown frequency
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
CREATE TRIGGER trigger_update_next_generation_due
  BEFORE INSERT OR UPDATE ON public.user_insight_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_next_generation_due();

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION create_default_insight_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_insight_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences when user signs up
-- Note: This assumes the auth.users table exists and we can create triggers on it
-- In practice, this might need to be handled in application code
-- CREATE TRIGGER trigger_create_default_preferences
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION create_default_insight_preferences();

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
    AND created_at > (now() - INTERVAL '7 days'); -- Only check recent insights
    
  RETURN existing_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to get users due for insight generation
CREATE OR REPLACE FUNCTION get_users_due_for_insights()
RETURNS TABLE(
  user_id UUID,
  insight_frequency VARCHAR(20),
  enabled_insight_types JSONB,
  preferred_delivery_time TIME,
  timezone VARCHAR(50)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uip.user_id,
    uip.insight_frequency,
    uip.enabled_insight_types,
    uip.preferred_delivery_time,
    uip.timezone
  FROM public.user_insight_preferences uip
  WHERE uip.insight_frequency != 'disabled'
    AND (
      uip.next_generation_due IS NULL 
      OR uip.next_generation_due <= now()
    );
END;
$$ LANGUAGE plpgsql;

-- Update existing insights to have generation_trigger
UPDATE public.financial_insights 
SET generation_trigger = 'legacy'
WHERE generation_trigger IS NULL;

-- Add comments for documentation
COMMENT ON TABLE public.user_insight_preferences IS 'User preferences for financial insight generation frequency and settings';
COMMENT ON COLUMN public.user_insight_preferences.insight_frequency IS 'How often to generate insights: daily, weekly, monthly, or disabled';
COMMENT ON COLUMN public.user_insight_preferences.enabled_insight_types IS 'JSON array of enabled insight types';
COMMENT ON COLUMN public.user_insight_preferences.preferred_delivery_time IS 'Preferred time of day for insight generation';
COMMENT ON COLUMN public.user_insight_preferences.next_generation_due IS 'When the next insight generation is due';
COMMENT ON COLUMN public.user_insight_preferences.timezone IS 'User timezone for scheduling insights';

COMMENT ON COLUMN public.financial_insights.content_hash IS 'SHA-256 hash of insight content for duplicate detection';
COMMENT ON COLUMN public.financial_insights.generation_trigger IS 'What triggered this insight generation: scheduled, manual, threshold, legacy';
COMMENT ON COLUMN public.financial_insights.last_generated_at IS 'When this insight was generated';
