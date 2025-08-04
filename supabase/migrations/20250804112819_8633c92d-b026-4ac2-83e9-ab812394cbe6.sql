-- SECURITY FIX: Update database functions with proper search_path and address security definer issues
-- This addresses the critical security definer view vulnerability and function search path issues

-- =============================================================================
-- 1. UPDATE ALL DATABASE FUNCTIONS WITH PROPER SEARCH_PATH
-- =============================================================================

-- Update handle_new_user_categories function
CREATE OR REPLACE FUNCTION public.handle_new_user_categories()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
AS $function$
BEGIN
  -- Seed default categories for the new user
  PERFORM public.seed_user_categories(NEW.id);
  RETURN NEW;
END;
$function$;

-- Update seed_user_categories function
CREATE OR REPLACE FUNCTION public.seed_user_categories(user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
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
  AND NOT EXISTS (
    SELECT 1 FROM public.categories existing
    WHERE existing.user_id = seed_user_categories.user_id
    AND existing.name = categories.name
  );
END;
$function$;

-- Update calculate_next_generation_due function
CREATE OR REPLACE FUNCTION public.calculate_next_generation_due(frequency character varying, preferred_time time without time zone, user_timezone character varying DEFAULT 'UTC'::character varying)
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
    next_due TIMESTAMP WITH TIME ZONE;
    current_time_in_tz TIMESTAMP WITH TIME ZONE;
BEGIN
    current_time_in_tz := now() AT TIME ZONE user_timezone;
    
    CASE frequency
        WHEN 'daily' THEN
            next_due := (current_time_in_tz::date + INTERVAL '1 day' + preferred_time) AT TIME ZONE user_timezone;
        WHEN 'weekly' THEN
            next_due := (current_time_in_tz::date + INTERVAL '7 days' + preferred_time) AT TIME ZONE user_timezone;
        WHEN 'monthly' THEN
            next_due := (date_trunc('month', current_time_in_tz) + INTERVAL '1 month' + preferred_time) AT TIME ZONE user_timezone;
        ELSE
            next_due := NULL;
    END CASE;
    
    RETURN next_due;
END;
$function$;

-- Update update_next_generation_due function
CREATE OR REPLACE FUNCTION public.update_next_generation_due()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    NEW.next_generation_due := calculate_next_generation_due(
        NEW.insight_frequency,
        NEW.preferred_delivery_time,
        NEW.timezone
    );
    NEW.updated_at := now();
    RETURN NEW;
END;
$function$;

-- Update check_duplicate_insight function
CREATE OR REPLACE FUNCTION public.check_duplicate_insight(p_user_id uuid, p_insight_type text, p_period_start date, p_period_end date, p_content_hash character varying)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

-- Update get_test_user_id function
CREATE OR REPLACE FUNCTION public.get_test_user_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
    -- Return a consistent test UUID
    RETURN '00000000-0000-0000-0000-000000000001'::UUID;
END;
$function$;

-- Update get_exchange_rate function
CREATE OR REPLACE FUNCTION public.get_exchange_rate(from_curr character varying, to_curr character varying, rate_date date DEFAULT CURRENT_DATE)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  exchange_rate DECIMAL(15,8);
BEGIN
  -- If same currency, return 1
  IF from_curr = to_curr THEN
    RETURN 1.0;
  END IF;
  
  -- Get the most recent rate for the date or before
  SELECT rate INTO exchange_rate
  FROM public.currency_exchange_rates
  WHERE from_currency = from_curr 
    AND to_currency = to_curr 
    AND rate_date <= rate_date
  ORDER BY rate_date DESC
  LIMIT 1;
  
  -- If no rate found, return NULL
  RETURN COALESCE(exchange_rate, NULL);
END;
$function$;

-- Update convert_currency function
CREATE OR REPLACE FUNCTION public.convert_currency(amount numeric, from_curr character varying, to_curr character varying, rate_date date DEFAULT CURRENT_DATE)
 RETURNS numeric
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  exchange_rate DECIMAL(15,8);
  converted_amount DECIMAL(15,2);
BEGIN
  -- Get exchange rate
  SELECT public.get_exchange_rate(from_curr, to_curr, rate_date) INTO exchange_rate;
  
  -- If no rate available, return original amount
  IF exchange_rate IS NULL THEN
    RETURN amount;
  END IF;
  
  -- Convert and round to 2 decimal places
  converted_amount := ROUND(amount * exchange_rate, 2);
  
  RETURN converted_amount;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, auth
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, currency, locale, timezone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'country', 'PH'),
    COALESCE(NEW.raw_user_meta_data->>'currency', 'PHP'),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'en-PH'),
    COALESCE(NEW.raw_user_meta_data->>'timezone', 'Asia/Manila')
  );
  RETURN NEW;
END;
$function$;