-- Fix security issue with savings_goal_progress view
-- The view should not use SECURITY DEFINER as it bypasses RLS policies

-- Drop the existing view if it exists
DROP VIEW IF EXISTS public.savings_goal_progress CASCADE;

-- Since savings_goal_progress is actually a table (not a view), 
-- let's ensure it has proper RLS policies
ALTER TABLE public.savings_goal_progress ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for savings_goal_progress table
CREATE POLICY "Users can view their own savings goal progress" 
ON public.savings_goal_progress 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own savings goal progress" 
ON public.savings_goal_progress 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own savings goal progress" 
ON public.savings_goal_progress 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own savings goal progress" 
ON public.savings_goal_progress 
FOR DELETE 
USING (user_id = auth.uid());