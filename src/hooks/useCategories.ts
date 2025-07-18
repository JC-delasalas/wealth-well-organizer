
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Category } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DatabaseError extends Error {
  message: string;
}

export const useCategories = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      return data as Category[];
    },
    enabled: !!user,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      toast({
        title: "Category created",
        description: "Your category has been created successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: "Error creating category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      toast({
        title: "Category updated",
        description: "Your category has been updated successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      toast({
        title: "Error updating category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Check how many transactions use a category
  const checkCategoryUsage = async (categoryId: string) => {
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('id')
      .eq('category_id', categoryId)
      .eq('user_id', user?.id);

    if (transactionError) throw transactionError;

    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('id')
      .eq('category_id', categoryId)
      .eq('user_id', user?.id);

    if (budgetError) throw budgetError;

    return {
      transactionCount: transactions?.length || 0,
      budgetCount: budgets?.length || 0,
      totalUsage: (transactions?.length || 0) + (budgets?.length || 0)
    };
  };

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Check if category is being used
      const usage = await checkCategoryUsage(id);

      if (usage.totalUsage > 0) {
        const usageDetails = [];
        if (usage.transactionCount > 0) {
          usageDetails.push(`${usage.transactionCount} transaction${usage.transactionCount > 1 ? 's' : ''}`);
        }
        if (usage.budgetCount > 0) {
          usageDetails.push(`${usage.budgetCount} budget${usage.budgetCount > 1 ? 's' : ''}`);
        }

        throw new Error(
          `Cannot delete category because it's used by ${usageDetails.join(' and ')}. ` +
          `Please reassign or delete these items first.`
        );
      }

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Category deletion error:', error);

        // Handle specific database errors
        if (error.code === '23503') {
          throw new Error('Cannot delete category because it\'s still being used by transactions or budgets.');
        }

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', user?.id] });
      toast({
        title: "Category deleted",
        description: "Your category has been deleted successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Delete category error:', error);
      toast({
        title: "Error deleting category",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Get category usage information for UI display
  const getCategoryUsage = async (categoryId: string) => {
    if (!user) return { transactionCount: 0, budgetCount: 0, totalUsage: 0 };
    return await checkCategoryUsage(categoryId);
  };

  return {
    categories,
    isLoading,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    getCategoryUsage,
    isCreating: createCategoryMutation.isPending,
    isUpdating: updateCategoryMutation.isPending,
    isDeleting: deleteCategoryMutation.isPending,
  };
};
