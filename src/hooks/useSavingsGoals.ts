
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SavingsGoal } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSavingsGoals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: savingsGoals = [], isLoading } = useQuery({
    queryKey: ['savings-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavingsGoal[];
    },
  });

  const createSavingsGoalMutation = useMutation({
    mutationFn: async (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([{ ...goal, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: "Savings goal created",
        description: "Your savings goal has been set successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating savings goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSavingsGoalMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals'] });
      toast({
        title: "Savings goal updated",
        description: "Your savings goal has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating savings goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    savingsGoals,
    isLoading,
    createSavingsGoal: createSavingsGoalMutation.mutate,
    updateSavingsGoal: updateSavingsGoalMutation.mutate,
    isCreating: createSavingsGoalMutation.isPending,
    isUpdating: updateSavingsGoalMutation.isPending,
  };
};
