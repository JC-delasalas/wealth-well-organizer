-- Multi-Currency and Philippine Tax Calculator System Migration
-- This migration extends the existing schema to support multi-currency and tax calculations

-- =============================================================================
-- 1. EXTEND PROFILES TABLE FOR COUNTRY AND CURRENCY
-- =============================================================================

-- Add country and currency columns to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country VARCHAR(2) DEFAULT 'PH',
ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'PHP',
ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'en-PH',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Manila';

-- Add constraints for country codes (ISO 3166-1 alpha-2)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_country_check 
CHECK (country ~ '^[A-Z]{2}$');

-- Add constraints for currency codes (ISO 4217)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_currency_check 
CHECK (currency ~ '^[A-Z]{3}$');

-- =============================================================================
-- 2. CREATE SUPPORTED CURRENCIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.supported_currencies (
  code VARCHAR(3) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  decimal_places INTEGER DEFAULT 2,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert supported currencies
INSERT INTO public.supported_currencies (code, name, symbol, decimal_places) VALUES
('PHP', 'Philippine Peso', '₱', 2),
('USD', 'US Dollar', '$', 2),
('EUR', 'Euro', '€', 2),
('JPY', 'Japanese Yen', '¥', 0),
('GBP', 'British Pound', '£', 2),
('AUD', 'Australian Dollar', 'A$', 2),
('CAD', 'Canadian Dollar', 'C$', 2),
('SGD', 'Singapore Dollar', 'S$', 2),
('HKD', 'Hong Kong Dollar', 'HK$', 2),
('CNY', 'Chinese Yuan', '¥', 2)
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 3. CREATE COUNTRIES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.countries (
  code VARCHAR(2) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  default_currency VARCHAR(3) REFERENCES public.supported_currencies(code),
  tax_system VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert supported countries (focus on Philippines and major countries)
INSERT INTO public.countries (code, name, default_currency, tax_system) VALUES
('PH', 'Philippines', 'PHP', 'BIR'),
('US', 'United States', 'USD', 'IRS'),
('GB', 'United Kingdom', 'GBP', 'HMRC'),
('AU', 'Australia', 'AUD', 'ATO'),
('CA', 'Canada', 'CAD', 'CRA'),
('SG', 'Singapore', 'SGD', 'IRAS'),
('HK', 'Hong Kong', 'HKD', 'IRD'),
('JP', 'Japan', 'JPY', 'NTA'),
('DE', 'Germany', 'EUR', 'BMF'),
('FR', 'France', 'EUR', 'DGFiP')
ON CONFLICT (code) DO NOTHING;

-- =============================================================================
-- 4. CREATE TAX CALCULATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.tax_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  calculation_type VARCHAR(50) NOT NULL, -- 'income_tax', 'itr_1700', 'itr_1701', 'itr_1702', 'withholding_tax', 'property_tax'
  tax_year INTEGER NOT NULL,
  country_code VARCHAR(2) REFERENCES public.countries(code) DEFAULT 'PH',
  currency VARCHAR(3) REFERENCES public.supported_currencies(code) DEFAULT 'PHP',
  
  -- Input data (stored as JSONB for flexibility)
  input_data JSONB NOT NULL,
  
  -- Calculation results
  gross_income DECIMAL(15,2),
  taxable_income DECIMAL(15,2),
  tax_due DECIMAL(15,2),
  tax_withheld DECIMAL(15,2),
  tax_payable DECIMAL(15,2),
  tax_refund DECIMAL(15,2),
  
  -- Detailed breakdown (stored as JSONB)
  calculation_breakdown JSONB,
  
  -- Metadata
  calculation_name VARCHAR(200),
  notes TEXT,
  is_saved BOOLEAN DEFAULT false,
  is_filed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. CREATE PHILIPPINE TAX BRACKETS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.ph_tax_brackets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tax_year INTEGER NOT NULL,
  bracket_order INTEGER NOT NULL,
  min_income DECIMAL(15,2) NOT NULL,
  max_income DECIMAL(15,2), -- NULL for highest bracket
  base_tax DECIMAL(15,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(5,4) NOT NULL, -- e.g., 0.20 for 20%
  excess_over DECIMAL(15,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tax_year, bracket_order)
);

-- Insert 2024 Philippine tax brackets (TRAIN Law)
INSERT INTO public.ph_tax_brackets (tax_year, bracket_order, min_income, max_income, base_tax, tax_rate, excess_over) VALUES
(2024, 1, 0, 250000, 0, 0.0000, 0),           -- 0% for first ₱250,000
(2024, 2, 250000, 400000, 0, 0.2000, 250000), -- 20% for ₱250,001 - ₱400,000
(2024, 3, 400000, 800000, 30000, 0.2500, 400000), -- 25% for ₱400,001 - ₱800,000
(2024, 4, 800000, 2000000, 130000, 0.3000, 800000), -- 30% for ₱800,001 - ₱2,000,000
(2024, 5, 2000000, 8000000, 490000, 0.3200, 2000000), -- 32% for ₱2,000,001 - ₱8,000,000
(2024, 6, 8000000, NULL, 2410000, 0.3500, 8000000) -- 35% for over ₱8,000,000
ON CONFLICT (tax_year, bracket_order) DO NOTHING;

-- =============================================================================
-- 6. CREATE CURRENCY EXCHANGE RATES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.currency_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) REFERENCES public.supported_currencies(code),
  to_currency VARCHAR(3) REFERENCES public.supported_currencies(code),
  rate DECIMAL(15,8) NOT NULL,
  rate_date DATE NOT NULL DEFAULT CURRENT_DATE,
  source VARCHAR(50) DEFAULT 'manual', -- 'api', 'manual', 'central_bank'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(from_currency, to_currency, rate_date)
);

-- Insert some base exchange rates (these should be updated via API)
INSERT INTO public.currency_exchange_rates (from_currency, to_currency, rate, rate_date) VALUES
('USD', 'PHP', 56.50, CURRENT_DATE),
('EUR', 'PHP', 61.20, CURRENT_DATE),
('PHP', 'USD', 0.0177, CURRENT_DATE),
('USD', 'USD', 1.0000, CURRENT_DATE),
('PHP', 'PHP', 1.0000, CURRENT_DATE),
('EUR', 'EUR', 1.0000, CURRENT_DATE)
ON CONFLICT (from_currency, to_currency, rate_date) DO NOTHING;

-- =============================================================================
-- 7. CREATE INDEXES FOR PERFORMANCE
-- =============================================================================

-- Indexes for tax calculations
CREATE INDEX IF NOT EXISTS idx_tax_calculations_user_id ON public.tax_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_type_year ON public.tax_calculations(calculation_type, tax_year);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_country ON public.tax_calculations(country_code);

-- Indexes for tax brackets
CREATE INDEX IF NOT EXISTS idx_ph_tax_brackets_year ON public.ph_tax_brackets(tax_year);
CREATE INDEX IF NOT EXISTS idx_ph_tax_brackets_active ON public.ph_tax_brackets(is_active);

-- Indexes for exchange rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON public.currency_exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_date ON public.currency_exchange_rates(rate_date DESC);

-- Indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_country_currency ON public.profiles(country, currency);

-- =============================================================================
-- 8. ENABLE RLS ON NEW TABLES
-- =============================================================================

-- Enable RLS on new tables
ALTER TABLE public.tax_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supported_currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ph_tax_brackets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_exchange_rates ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 9. CREATE RLS POLICIES
-- =============================================================================

-- Tax calculations policies (users can only access their own calculations)
CREATE POLICY "Users can view their own tax calculations" 
    ON public.tax_calculations FOR SELECT 
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can create their own tax calculations" 
    ON public.tax_calculations FOR INSERT 
    WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own tax calculations" 
    ON public.tax_calculations FOR UPDATE 
    USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete their own tax calculations" 
    ON public.tax_calculations FOR DELETE 
    USING (user_id = (SELECT auth.uid()));

-- Reference tables policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view supported currencies" 
    ON public.supported_currencies FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view countries" 
    ON public.countries FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view tax brackets" 
    ON public.ph_tax_brackets FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view exchange rates" 
    ON public.currency_exchange_rates FOR SELECT 
    USING (auth.role() = 'authenticated');

-- =============================================================================
-- 10. UPDATE EXISTING HANDLE_NEW_USER FUNCTION
-- =============================================================================

-- Update the existing function to set default country and currency
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 11. CREATE HELPER FUNCTIONS
-- =============================================================================

-- Function to get current exchange rate
CREATE OR REPLACE FUNCTION public.get_exchange_rate(
  from_curr VARCHAR(3),
  to_curr VARCHAR(3),
  rate_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(15,8) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to convert currency amounts
CREATE OR REPLACE FUNCTION public.convert_currency(
  amount DECIMAL(15,2),
  from_curr VARCHAR(3),
  to_curr VARCHAR(3),
  rate_date DATE DEFAULT CURRENT_DATE
)
RETURNS DECIMAL(15,2) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 12. VALIDATION QUERIES
-- =============================================================================

-- Verify the migration was successful
SELECT 'VALIDATION: Multi-currency and tax system migration completed' as status;

-- Check new columns in profiles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles' 
  AND column_name IN ('country', 'currency', 'locale', 'timezone');

-- Check new tables
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('supported_currencies', 'countries', 'tax_calculations', 'ph_tax_brackets', 'currency_exchange_rates');

-- Check sample data
SELECT 'Sample currencies:' as info, code, name, symbol FROM public.supported_currencies LIMIT 5;
SELECT 'Sample countries:' as info, code, name, default_currency FROM public.countries LIMIT 5;
SELECT 'Sample tax brackets:' as info, tax_year, bracket_order, min_income, max_income, tax_rate FROM public.ph_tax_brackets WHERE tax_year = 2024;

SELECT '✅ MULTI-CURRENCY AND TAX SYSTEM MIGRATION COMPLETED SUCCESSFULLY!' as result;
