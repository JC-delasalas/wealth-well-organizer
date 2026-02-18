import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Budget } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const useBudgets = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching budgets');
        throw error;
      }
      
      return data as Budget[];
    },
    enabled: !!user,
  });

  const createBudgetMutation = useMutation({
    mutationFn: async (budget: Omit<Budget, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Validate required fields
      if (!budget.amount || budget.amount <= 0) {
        throw new Error('Budget amount must be greater than 0');
      }
      if (!budget.period) {
        throw new Error('Budget period is required');
      }
      if (!budget.start_date) {
        throw new Error('Start date is required');
      }

      const budgetData = {
        ...budget,
        user_id: user.id,
        amount: Number(budget.amount),
      };

      console.log('Creating budget with data:', budgetData);

      const { data, error } = await supabase
        .from('budgets')
        .insert([budgetData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating budget:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] });
      toast({
        title: "Budget created",
        description: "Your budget has been set successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Create budget mutation error:', error);
      toast({
        title: "Error creating budget",
        description: error.message || "Failed to create budget. Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const updateBudgetMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Budget> & { id: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!id) {
        throw new Error('Budget ID is required for update');
      }

      // Clean and validate update data
      const cleanUpdates: Database['public']['Tables']['budgets']['Update'] = {};
      
      if (updates.amount !== undefined) {
        if (updates.amount <= 0) {
          throw new Error('Budget amount must be greater than 0');
        }
        cleanUpdates.amount = Number(updates.amount);
      }
      
      if (updates.period !== undefined) {
        if (!updates.period) {
          throw new Error('Budget period is required');
        }
        cleanUpdates.period = updates.period;
      }
      
      if (updates.start_date !== undefined) {
        if (!updates.start_date) {
          throw new Error('Start date is required');
        }
        cleanUpdates.start_date = updates.start_date;
      }
      
      if (updates.end_date !== undefined) {
        cleanUpdates.end_date = updates.end_date || null;
      }
      
      if (updates.category_id !== undefined) {
        cleanUpdates.category_id = updates.category_id;
      }

      console.log('Updating budget with data:', { id, updates: cleanUpdates });

      const { data, error } = await supabase
        .from('budgets')
        .update(cleanUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating budget:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] });
      toast({
        title: "Budget updated",
        description: "Your budget has been updated successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Update budget mutation error:', error);
      toast({
        title: "Error updating budget",
        description: error.message || "Failed to update budget. Please check your input and try again.",
        variant: "destructive",
      });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets', user?.id] });
      toast({
        title: "Budget deleted",
        description: "Your budget has been deleted successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Delete budget mutation error:', error);
      toast({
        title: "Error deleting budget",
        description: error.message || "Failed to delete budget. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    budgets,
    isLoading,
    createBudget: createBudgetMutation.mutate,
    updateBudget: updateBudgetMutation.mutate,
    deleteBudget: deleteBudgetMutation.mutate,
    isCreating: createBudgetMutation.isPending,
    isUpdating: updateBudgetMutation.isPending,
    isDeleting: deleteBudgetMutation.isPending,
  };
};
