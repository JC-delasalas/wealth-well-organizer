/**
 * React Hook for Smart Notifications
 * Provides easy access to the smart notification system with React integration
 */

import { useCallback, useEffect, useState } from 'react';
import { smartNotifications, NotificationPreferences, NotificationData } from '@/utils/smartNotifications';

export interface UseSmartNotificationsReturn {
  // Notification methods
  notify: (notification: Omit<NotificationData, 'id' | 'timestamp'>) => boolean;
  success: (title: string, description?: string, category?: keyof NotificationPreferences['categories']) => boolean;
  error: (title: string, description?: string, category?: keyof NotificationPreferences['categories']) => boolean;
  warning: (title: string, description?: string, category?: keyof NotificationPreferences['categories']) => boolean;
  info: (title: string, description?: string, category?: keyof NotificationPreferences['categories']) => boolean;
  
  // Preference management
  preferences: NotificationPreferences;
  updatePreferences: (updates: Partial<NotificationPreferences>) => void;
  
  // Statistics
  stats: {
    totalToday: number;
    totalThisHour: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    queueSize: number;
  };
  
  // Utility methods
  isQuietTime: boolean;
  canNotify: boolean;
}

/**
 * Hook for using smart notifications with React state management
 * Provides reactive updates to preferences and statistics
 */
export const useSmartNotifications = (): UseSmartNotificationsReturn => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    smartNotifications.getPreferences()
  );
  
  const [stats, setStats] = useState(
    smartNotifications.getNotificationStats()
  );

  const [isQuietTime, setIsQuietTime] = useState(false);

  // Update stats and quiet time status periodically
  useEffect(() => {
    const updateStatus = () => {
      setStats(smartNotifications.getNotificationStats());
      
      // Check if we're in quiet hours
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const { quietHoursStart, quietHoursEnd } = preferences;
      
      let inQuietHours = false;
      if (quietHoursStart > quietHoursEnd) {
        // Overnight quiet hours
        inQuietHours = currentTime >= quietHoursStart || currentTime <= quietHoursEnd;
      } else {
        // Same-day quiet hours
        inQuietHours = currentTime >= quietHoursStart && currentTime <= quietHoursEnd;
      }
      
      setIsQuietTime(inQuietHours);
    };

    // Update immediately
    updateStatus();

    // Update every minute
    const interval = setInterval(updateStatus, 60000);

    return () => clearInterval(interval);
  }, [preferences.quietHoursStart, preferences.quietHoursEnd]);

  // Notification methods
  const notify = useCallback((notification: Omit<NotificationData, 'id' | 'timestamp'>) => {
    return smartNotifications.notify(notification);
  }, []);

  const success = useCallback((
    title: string, 
    description?: string, 
    category: keyof NotificationPreferences['categories'] = 'system'
  ) => {
    return smartNotifications.success(title, description, category);
  }, []);

  const error = useCallback((
    title: string, 
    description?: string, 
    category: keyof NotificationPreferences['categories'] = 'system'
  ) => {
    return smartNotifications.error(title, description, category);
  }, []);

  const warning = useCallback((
    title: string, 
    description?: string, 
    category: keyof NotificationPreferences['categories'] = 'system'
  ) => {
    return smartNotifications.warning(title, description, category);
  }, []);

  const info = useCallback((
    title: string, 
    description?: string, 
    category: keyof NotificationPreferences['categories'] = 'system'
  ) => {
    return smartNotifications.info(title, description, category);
  }, []);

  // Preference management
  const updatePreferences = useCallback((updates: Partial<NotificationPreferences>) => {
    smartNotifications.updatePreferences(updates);
    setPreferences(smartNotifications.getPreferences());
  }, []);

  // Cleanup methods
  const clearQueue = useCallback(() => {
    smartNotifications.clearNotificationQueue();
    setStats(smartNotifications.getNotificationStats());
  }, []);

  const cleanupOld = useCallback((daysToKeep: number = 7) => {
    smartNotifications.cleanupOldNotifications(daysToKeep);
    setStats(smartNotifications.getNotificationStats());
  }, []);

  // Calculate if notifications can be sent
  const canNotify = preferences.enabled &&
    stats.totalThisHour < preferences.maxPerHour &&
    stats.totalToday < preferences.maxPerDay;

  return {
    notify,
    success,
    error,
    warning,
    info,
    preferences,
    updatePreferences,
    stats,
    isQuietTime,
    canNotify,
    clearQueue,
    cleanupOld,
  };
};

/**
 * Hook for financial notifications with predefined categories
 * Provides convenience methods for common financial notification scenarios
 */
export const useFinancialNotifications = () => {
  const notifications = useSmartNotifications();

  const transactionAdded = useCallback((amount: string, type: 'income' | 'expense') => {
    return notifications.success(
      `${type === 'income' ? 'Income' : 'Expense'} Added`,
      `Successfully recorded ${amount}`,
      'financial'
    );
  }, [notifications]);

  const budgetWarning = useCallback((category: string, percentage: number) => {
    return notifications.warning(
      'Budget Alert',
      `You've used ${percentage}% of your ${category} budget`,
      'budget'
    );
  }, [notifications]);

  const budgetExceeded = useCallback((category: string) => {
    return notifications.error(
      'Budget Exceeded',
      `You've exceeded your ${category} budget`,
      'budget'
    );
  }, [notifications]);

  const savingsGoalReached = useCallback((goalName: string) => {
    return notifications.success(
      'Savings Goal Achieved! 🎉',
      `Congratulations! You've reached your ${goalName} goal`,
      'savings'
    );
  }, [notifications]);

  const savingsProgress = useCallback((goalName: string, percentage: number) => {
    return notifications.info(
      'Savings Progress',
      `You're ${percentage}% towards your ${goalName} goal`,
      'savings'
    );
  }, [notifications]);

  const insightGenerated = useCallback((title: string, description: string) => {
    return notifications.info(
      title,
      description,
      'insights'
    );
  }, [notifications]);

  return {
    ...notifications,
    transactionAdded,
    budgetWarning,
    budgetExceeded,
    savingsGoalReached,
    savingsProgress,
    insightGenerated,
  };
};

export default useSmartNotifications;
