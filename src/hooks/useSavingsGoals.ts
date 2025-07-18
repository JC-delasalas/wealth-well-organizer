
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SavingsGoal } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const useSavingsGoals = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savingsGoals = [], isLoading } = useQuery({
    queryKey: ['savings-goals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetching savings goals for user - logging removed for security
      
      const { data, error } = await supabase
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching savings goals');
        throw error;
      }
      
      return data as SavingsGoal[];
    },
    enabled: !!user,
  });

  const createSavingsGoalMutation = useMutation({
    mutationFn: async (goal: Omit<SavingsGoal, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) {
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
      queryClient.invalidateQueries({ queryKey: ['savings-goals', user?.id] });
      toast({
        title: "Savings goal created",
        description: "Your savings goal has been set successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: "Error creating savings goal",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSavingsGoalMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsGoal> & { id: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('savings_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', user?.id] });
      toast({
        title: "Savings goal updated",
        description: "Your savings goal has been updated successfully.",
      });
    },
    onError: (error: DatabaseError) => {
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
