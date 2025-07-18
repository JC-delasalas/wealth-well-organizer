
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const useTransactions = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching transactions for user:', user.id);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      console.log('Fetched transactions:', data);
      return data as Transaction[];
    },
    enabled: !!user,
  });

  const addTransactionMutation = useMutation({
    mutationFn: async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const transactionWithUserId = {
        ...transaction,
        user_id: user.id
      };

      console.log('Adding transaction:', transactionWithUserId);

      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionWithUserId])
        .select()
        .single();
      
      if (error) {
        console.error('Transaction insert error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: "Transaction added",
        description: "Your transaction has been successfully added.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Add transaction error:', error);
      toast({
        title: "Error adding transaction",
        description: error.message || "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Updating transaction:', { id, updates });

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error('Transaction update error:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: "Transaction updated",
        description: "Your transaction has been successfully updated.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Update transaction error:', error);
      toast({
        title: "Error updating transaction",
        description: error.message || "Failed to update transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Deleting transaction:', id);

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Transaction delete error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been successfully deleted.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Delete transaction error:', error);
      toast({
        title: "Error deleting transaction",
        description: error.message || "Failed to delete transaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    transactions,
    isLoading,
    addTransaction: addTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,
    isAdding: addTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,
  };
};
