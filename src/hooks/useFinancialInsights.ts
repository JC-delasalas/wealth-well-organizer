
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  FinancialInsight,
  CreateInsightInput,
  InsightGenerationResult,
  InsightAnalytics,
  GenerationStats
} from '@/types/insights';
import { createInsightWithDeduplication, cleanupOldInsights } from '@/utils/insightDeduplication';
import { insightScheduler } from '@/services/insightScheduler';
import { useInsightPreferences } from '@/hooks/useInsightPreferences';

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
  const { preferences, updateLastGeneration } = useInsightPreferences();

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

  // Enhanced create insight mutation with deduplication
  const createInsightMutation = useMutation({
    mutationFn: async (insight: CreateInsightInput) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await createInsightWithDeduplication(user.id, insight);

      if (!result.success) {
        throw new Error(result.error || 'Failed to create insight');
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights', user?.id] });
    },
    onError: (error: DatabaseError) => {
      console.error('Error creating insight:', error);

      // Provide specific error messages
      let errorMessage = "Failed to create insight. Please try again.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.code === '42703') {
        errorMessage = "Database schema issue detected. Some features may not be available.";
      } else if (error.code === '42P01') {
        errorMessage = "Required database tables are missing. Please contact support.";
      }

      toast({
        title: "Error creating insight",
        description: errorMessage,
        variant: "destructive",
      });
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

  const deleteInsightMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('financial_insights')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights', user?.id] });
      toast({
        title: "Success",
        description: "Insight deleted successfully",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Error deleting insight');
      toast({
        title: "Error",
        description: "Failed to delete insight. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Manual insight generation mutation with rate limiting
  const generateInsightsMutation = useMutation({
    mutationFn: async (): Promise<InsightGenerationResult> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const result = await insightScheduler.generateInsightsForUser(user.id, preferences || undefined);

      if (result.success && updateLastGeneration) {
        await updateLastGeneration();
      }

      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['insight-preferences', user?.id] });

      if (result.success) {
        if (result.insights_generated > 0) {
          toast({
            title: "Insights Generated",
            description: `Generated ${result.insights_generated} new insights${result.insights_skipped > 0 ? `, skipped ${result.insights_skipped} duplicates` : ''}.`,
          });
        } else if (result.insights_skipped > 0) {
          toast({
            title: "No New Insights",
            description: `All ${result.insights_skipped} insights were duplicates and skipped.`,
          });
        } else {
          toast({
            title: "No Insights Generated",
            description: "No new insights were created. Try again later.",
          });
        }
      } else {
        // Handle partial success with errors
        const errorMessages = result.errors.join(', ');
        if (errorMessages.includes('rate limit') || errorMessages.includes('already in progress')) {
          toast({
            title: "Generation Rate Limited",
            description: "Please wait a moment before generating more insights.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Generation Issues",
            description: errorMessages,
            variant: "destructive",
          });
        }
      }
    },
    onError: (error: DatabaseError) => {
      console.error('Error generating insights:', error);

      let errorMessage = "Failed to generate insights. Please try again.";

      if (error.message?.includes('rate limit') || error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
        errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
      } else if (error.message?.includes('already in progress')) {
        errorMessage = "Insight generation is already in progress. Please wait.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Error generating insights",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Cleanup old insights mutation
  const cleanupInsightsMutation = useMutation({
    mutationFn: async (daysToKeep: number = 90) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      await cleanupOldInsights(user.id, daysToKeep);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-insights', user?.id] });
      toast({
        title: "Cleanup Complete",
        description: "Old insights have been cleaned up successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Error cleaning up insights:', error);
      toast({
        title: "Cleanup Failed",
        description: error.message || "Failed to cleanup insights. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate analytics
  const getAnalytics = (): InsightAnalytics => {
    const totalInsights = insights.length;
    const readInsights = insights.filter(i => i.is_read).length;
    const readRate = totalInsights > 0 ? (readInsights / totalInsights) * 100 : 0;

    const insightsByType = insights.reduce((acc, insight) => {
      acc[insight.insight_type as keyof typeof acc] = (acc[insight.insight_type as keyof typeof acc] || 0) + 1;
      return acc;
    }, { daily: 0, weekly: 0, monthly: 0, threshold_alert: 0 });

    const insightsByPriority = insights.reduce((acc, insight) => {
      acc[insight.priority as keyof typeof acc] = (acc[insight.priority as keyof typeof acc] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0 });

    const lastGeneration = preferences?.last_insight_generation || '';
    const nextGeneration = preferences?.next_generation_due || '';

    // Calculate average generation interval
    const sortedInsights = [...insights].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    let averageInterval = 0;
    if (sortedInsights.length > 1) {
      const intervals = [];
      for (let i = 1; i < sortedInsights.length; i++) {
        const prev = new Date(sortedInsights[i - 1].created_at);
        const curr = new Date(sortedInsights[i].created_at);
        intervals.push((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)); // Days
      }
      averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    }

    return {
      total_insights: totalInsights,
      insights_by_type: insightsByType,
      insights_by_priority: insightsByPriority,
      read_rate: readRate,
      average_generation_interval: averageInterval,
      last_generation: lastGeneration,
      next_generation: nextGeneration
    };
  };

  return {
    // Data
    insights,
    isLoading,
    analytics: getAnalytics(),
    unreadCount: insights.filter(i => !i.is_read).length,

    // Basic actions
    createInsight: createInsightMutation.mutate,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteInsight: deleteInsightMutation.mutate,

    // Enhanced actions
    generateInsights: generateInsightsMutation.mutate,
    cleanupOldInsights: cleanupInsightsMutation.mutate,

    // Loading states
    isCreating: createInsightMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingInsight: deleteInsightMutation.isPending,
    isGenerating: generateInsightsMutation.isPending,
    isCleaningUp: cleanupInsightsMutation.isPending,

    // Utility functions
    getAnalytics
  };
};
