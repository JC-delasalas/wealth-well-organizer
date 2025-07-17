
-- Create savings_goals table to track user savings targets and thresholds
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC DEFAULT 0,
  savings_percentage_threshold NUMERIC DEFAULT 20,
  salary_date_1 INTEGER DEFAULT 15, -- day of month for first salary
  salary_date_2 INTEGER DEFAULT 30, -- day of month for second salary
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_insights table to store AI-generated insights
CREATE TABLE public.financial_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  insight_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'threshold_alert'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  period_start DATE,
  period_end DATE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_insights ENABLE ROW LEVEL SECURITY;

-- RLS policies for savings_goals
CREATE POLICY "Users can view their own savings goals" 
  ON public.savings_goals 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own savings goals" 
  ON public.savings_goals 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals" 
  ON public.savings_goals 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals" 
  ON public.savings_goals 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for financial_insights
CREATE POLICY "Users can view their own financial insights" 
  ON public.financial_insights 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own financial insights" 
  ON public.financial_insights 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own financial insights" 
  ON public.financial_insights 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own financial insights" 
  ON public.financial_insights 
  FOR DELETE 
  USING (auth.uid() = user_id);
