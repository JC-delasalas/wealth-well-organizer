
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FinancialInsight } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const useFinancialInsights = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['financial-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      // Fetching financial insights for user - logging removed for security
      
      const { data, error } = await supabase
        .from('financial_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching insights');
        throw error;
      }
      
      return data as FinancialInsight[];
    },
    enabled: !!user,
  });

  const createInsightMutation = useMutation({
    mutationFn: async (insight: Omit<FinancialInsight, 'id' | 'created_at' | 'user_id'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('financial_insights')
        .insert([{ ...insight, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights', user?.id] });
    },
    onError: (error: DatabaseError) => {
      console.error('Error creating insight');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('financial_insights')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights', user?.id] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('financial_insights')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false); // Only update unread insights

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights', user?.id] });
      toast({
        title: "Success",
        description: "All insights marked as read",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Error marking all insights as read');
      toast({
        title: "Error",
        description: "Failed to mark insights as read. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    insights,
    isLoading,
    createInsight: createInsightMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    unreadCount: insights.filter(i => !i.is_read).length,
  };
};
