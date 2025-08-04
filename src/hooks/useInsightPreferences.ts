// Hook for managing user insight preferences with duplicate prevention

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  UserInsightPreferences,
  CreateInsightPreferencesInput,
  UpdateInsightPreferencesInput,
  InsightSchedule,
  DEFAULT_PREFERENCES
} from '@/types/insights';

interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

export const useInsightPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userTimezone, setUserTimezone] = useState<string>('UTC');

  // Detect user timezone
  useEffect(() => {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(timezone);
    } catch (error) {
      console.warn('Could not detect timezone, using UTC:', error);
      setUserTimezone('UTC');
    }
  }, []);

  // Fetch user preferences
  const { 
    data: preferences, 
    isLoading, 
    error: fetchError 
  } = useQuery({
    queryKey: ['insight-preferences', user?.id],
    queryFn: async (): Promise<UserInsightPreferences | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_insight_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, return null to trigger creation
          return null;
        }
        throw error;
      }

      return data as UserInsightPreferences;
    },
    enabled: !!user,
  });

  // Create default preferences mutation
  const createPreferencesMutation = useMutation({
    mutationFn: async (input: CreateInsightPreferencesInput): Promise<UserInsightPreferences> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_insight_preferences')
        .insert([{
          user_id: user.id,
          insight_frequency: input.insight_frequency,
          enabled_insight_types: input.enabled_insight_types,
          preferred_delivery_time: input.preferred_delivery_time,
          timezone: input.timezone || userTimezone
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating preferences:', error);
        throw error;
      }

      return data as UserInsightPreferences;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['insight-preferences', user?.id], data);
      toast({
        title: "Preferences saved",
        description: "Your insight preferences have been set successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Create preferences error:', error);
      toast({
        title: "Error saving preferences",
        description: error.message || "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (input: UpdateInsightPreferencesInput): Promise<UserInsightPreferences> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('user_insight_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating preferences:', error);
        throw error;
      }

      return data as UserInsightPreferences;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['insight-preferences', user?.id], data);
      toast({
        title: "Preferences updated",
        description: "Your insight preferences have been updated successfully.",
      });
    },
    onError: (error: DatabaseError) => {
      console.error('Update preferences error:', error);
      toast({
        title: "Error updating preferences",
        description: error.message || "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Calculate next generation schedule
  const calculateNextGeneration = (prefs: UserInsightPreferences): InsightSchedule => {
    const now = new Date();
    const nextDue = prefs.next_generation_due ? new Date(prefs.next_generation_due) : null;
    const isOverdue = nextDue ? nextDue <= now : false;
    
    let daysUntilNext = 0;
    if (nextDue && !isOverdue) {
      daysUntilNext = Math.ceil((nextDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    }

    return {
      user_id: prefs.user_id,
      frequency: prefs.insight_frequency,
      next_due: prefs.next_generation_due || '',
      timezone: prefs.timezone,
      enabled_types: prefs.enabled_insight_types,
      is_overdue: isOverdue,
      days_until_next: daysUntilNext
    };
  };

  // Get or create preferences
  const getOrCreatePreferences = async (): Promise<UserInsightPreferences> => {
    if (preferences) {
      return preferences;
    }

    // Create default preferences
    const defaultPrefs: CreateInsightPreferencesInput = {
      ...DEFAULT_PREFERENCES,
      timezone: userTimezone
    };

    return createPreferencesMutation.mutateAsync(defaultPrefs);
  };

  // Update last generation timestamp
  const updateLastGeneration = async (): Promise<void> => {
    if (!preferences) return;

    try {
      await supabase
        .from('user_insight_preferences')
        .update({
          last_insight_generation: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', preferences.id)
        .eq('user_id', user?.id || '');

      // Invalidate query to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['insight-preferences', user?.id] });
    } catch (error) {
      console.error('Error updating last generation timestamp:', error);
    }
  };

  // Check if insights are due for generation
  const isGenerationDue = (): boolean => {
    if (!preferences || preferences.insight_frequency === 'disabled') {
      return false;
    }

    if (!preferences.next_generation_due) {
      return true; // First time generation
    }

    const nextDue = new Date(preferences.next_generation_due);
    return nextDue <= new Date();
  };

  // Get time until next generation
  const getTimeUntilNext = (): { days: number; hours: number; minutes: number } => {
    if (!preferences?.next_generation_due) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const now = new Date();
    const nextDue = new Date(preferences.next_generation_due);
    const diff = nextDue.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  // Reset preferences to defaults
  const resetToDefaults = async (): Promise<void> => {
    if (!preferences) return;

    const defaultPrefs: UpdateInsightPreferencesInput = {
      id: preferences.id,
      ...DEFAULT_PREFERENCES,
      timezone: userTimezone
    };

    await updatePreferencesMutation.mutateAsync(defaultPrefs);
  };

  return {
    // Data
    preferences,
    isLoading,
    error: fetchError,
    userTimezone,

    // Computed values
    schedule: preferences ? calculateNextGeneration(preferences) : null,
    isGenerationDue: isGenerationDue(),
    timeUntilNext: getTimeUntilNext(),

    // Actions
    createPreferences: createPreferencesMutation.mutate,
    updatePreferences: updatePreferencesMutation.mutate,
    getOrCreatePreferences,
    updateLastGeneration,
    resetToDefaults,

    // Loading states
    isCreating: createPreferencesMutation.isPending,
    isUpdating: updatePreferencesMutation.isPending,
    isSaving: createPreferencesMutation.isPending || updatePreferencesMutation.isPending,

    // Utility functions
    calculateNextGeneration: (prefs: UserInsightPreferences) => calculateNextGeneration(prefs)
  };
};
