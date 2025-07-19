
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

      // Validate required fields
      if (!goal.name || goal.name.trim() === '') {
        throw new Error('Goal name is required');
      }
      if (!goal.target_amount || goal.target_amount <= 0) {
        throw new Error('Target amount must be greater than 0');
      }
      if (!goal.target_date) {
        throw new Error('Target date is required');
      }

      // Ensure proper data types and handle null/undefined values
      const goalData: any = {
        user_id: user.id,
        target_amount: Number(goal.target_amount),
        current_amount: Number(goal.current_amount || 0),
        savings_percentage_threshold: Number(goal.savings_percentage_threshold || 20),
        salary_date_1: Number(goal.salary_date_1 || 15),
        salary_date_2: Number(goal.salary_date_2 || 30),
      };

      // Only add fields that exist in the database schema
      if (goal.name) {
        goalData.name = goal.name.trim();
      }

      if (goal.description !== undefined) {
        goalData.description = goal.description?.trim() || null;
      }

      if (goal.target_date) {
        goalData.target_date = goal.target_date;
      }

      console.log('Creating savings goal with data:', goalData);

      const { data, error } = await supabase
        .from('savings_goals')
        .insert([goalData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error creating savings goal:', error);
        throw error;
      }
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
      console.error('Create savings goal mutation error:', error);
      toast({
        title: "Error creating savings goal",
        description: error.message || "Failed to create savings goal. Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const updateSavingsGoalMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavingsGoal> & { id: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!id) {
        throw new Error('Goal ID is required for update');
      }

      // Clean and validate update data
      const cleanUpdates: any = {};

      if (updates.name !== undefined) {
        if (!updates.name || updates.name.trim() === '') {
          throw new Error('Goal name cannot be empty');
        }
        cleanUpdates.name = updates.name.trim();
      }

      if (updates.description !== undefined) {
        cleanUpdates.description = updates.description?.trim() || null;
      }

      if (updates.target_amount !== undefined) {
        if (updates.target_amount <= 0) {
          throw new Error('Target amount must be greater than 0');
        }
        cleanUpdates.target_amount = Number(updates.target_amount);
      }

      if (updates.current_amount !== undefined) {
        cleanUpdates.current_amount = Number(updates.current_amount || 0);
      }

      if (updates.target_date !== undefined) {
        if (!updates.target_date) {
          throw new Error('Target date is required');
        }
        cleanUpdates.target_date = updates.target_date;
      }

      if (updates.savings_percentage_threshold !== undefined) {
        cleanUpdates.savings_percentage_threshold = Number(updates.savings_percentage_threshold || 20);
      }

      if (updates.salary_date_1 !== undefined) {
        cleanUpdates.salary_date_1 = Number(updates.salary_date_1 || 15);
      }

      if (updates.salary_date_2 !== undefined) {
        cleanUpdates.salary_date_2 = Number(updates.salary_date_2 || 30);
      }

      console.log('Updating savings goal with data:', { id, updates: cleanUpdates });

      const { data, error } = await supabase
        .from('savings_goals')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating savings goal:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', user?.id] });
      toast({
        title: "Savings goal updated",
        description: "Your savings goal has been updated successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Update savings goal mutation error:', error);
      toast({
        title: "Error updating savings goal",
        description: error.message || "Failed to update savings goal. Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteSavingsGoalMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('savings_goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goals', user?.id] });
      toast({
        title: "Savings goal deleted",
        description: "Your savings goal has been deleted successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: "Error deleting savings goal",
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
    deleteSavingsGoal: deleteSavingsGoalMutation.mutate,
    isCreating: createSavingsGoalMutation.isPending,
    isUpdating: updateSavingsGoalMutation.isPending,
    isDeleting: deleteSavingsGoalMutation.isPending,
  };
};
