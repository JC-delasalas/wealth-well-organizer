
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FinancialInsight } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useFinancialInsights = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: ['financial-insights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_insights')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FinancialInsight[];
    },
  });

  const createInsightMutation = useMutation({
    mutationFn: async (insight: Omit<FinancialInsight, 'id' | 'created_at' | 'user_id'>) => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
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
      queryClient.invalidateQueries({ queryKey: ['financial-insights'] });
    },
    onError: (error: any) => {
      console.error('Error creating insight:', error);
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_insights')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights'] });
    },
  });

  return {
    insights,
    isLoading,
    createInsight: createInsightMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    unreadCount: insights.filter(i => !i.is_read).length,
  };
};
