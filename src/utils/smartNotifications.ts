/**
 * Smart Notification Manager with Throttling and Filtering
 * Prevents notification spam and provides intelligent notification controls
 */

import { toast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  enabled: boolean;
  maxPerHour: number;
  maxPerDay: number;
  quietHoursStart: string; // HH:MM format
  quietHoursEnd: string; // HH:MM format
  priorityThreshold: 'low' | 'medium' | 'high';
  categories: {
    financial: boolean;
    budget: boolean;
    savings: boolean;
    insights: boolean;
    system: boolean;
  };
}

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  category: keyof NotificationPreferences['categories'];
  priority: 'low' | 'medium' | 'high';
  title: string;
  description?: string;
  timestamp: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

class SmartNotificationManager {
  private static instance: SmartNotificationManager;
  private notificationHistory: NotificationData[] = [];
  private preferences: NotificationPreferences;
  private readonly STORAGE_KEY = 'notification-preferences';
  private readonly HISTORY_KEY = 'notification-history';
  private notificationQueue: NotificationData[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 2000; // 2 seconds
  private readonly MAX_BATCH_SIZE = 3;

  constructor() {
    this.preferences = this.loadPreferences();
    this.notificationHistory = this.loadHistory();
    this.cleanupOldHistory();
  }

  static getInstance(): SmartNotificationManager {
    if (!SmartNotificationManager.instance) {
      SmartNotificationManager.instance = new SmartNotificationManager();
    }
    return SmartNotificationManager.instance;
  }

  private loadPreferences(): NotificationPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.getDefaultPreferences(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }
    return this.getDefaultPreferences();
  }

  private loadHistory(): NotificationData[] {
    try {
      const stored = localStorage.getItem(this.HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load notification history:', error);
    }
    return [];
  }

  private getDefaultPreferences(): NotificationPreferences {
    return {
      enabled: true,
      maxPerHour: 3, // Reduced from 5 to 3
      maxPerDay: 10, // Reduced from 20 to 10
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
      priorityThreshold: 'medium',
      categories: {
        financial: true,
        budget: true,
        savings: true,
        insights: false, // Disabled by default to reduce spam
        system: true,
      },
    };
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.preferences));
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }

  private saveHistory(): void {
    try {
      // Keep only last 100 notifications
      const recentHistory = this.notificationHistory.slice(-100);
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(recentHistory));
    } catch (error) {
      console.warn('Failed to save notification history:', error);
    }
  }

  private cleanupOldHistory(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.notificationHistory = this.notificationHistory.filter(
      (notification) => notification.timestamp > oneDayAgo
    );
    this.saveHistory();
  }

  private isInQuietHours(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const { quietHoursStart, quietHoursEnd } = this.preferences;
    
    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (quietHoursStart > quietHoursEnd) {
      return currentTime >= quietHoursStart || currentTime <= quietHoursEnd;
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return currentTime >= quietHoursStart && currentTime <= quietHoursEnd;
  }

  private hasExceededLimits(): boolean {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const recentNotifications = this.notificationHistory.filter(
      (notification) => notification.timestamp > oneHourAgo
    );

    const todayNotifications = this.notificationHistory.filter(
      (notification) => notification.timestamp > oneDayAgo
    );

    return (
      recentNotifications.length >= this.preferences.maxPerHour ||
      todayNotifications.length >= this.preferences.maxPerDay
    );
  }

  private isDuplicateNotification(notification: NotificationData): boolean {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Check for duplicate notifications in the last hour
    return this.notificationHistory.some(existing =>
      existing.title === notification.title &&
      existing.category === notification.category &&
      existing.timestamp > oneHourAgo
    );
  }

  private shouldShowNotification(notification: NotificationData): boolean {
    // Check for duplicates first
    if (this.isDuplicateNotification(notification)) {
      return false;
    }

    // Always show high priority notifications (but still check duplicates)
    if (notification.priority === 'high') {
      return true;
    }

    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      return false;
    }

    // Check category preferences
    if (!this.preferences.categories[notification.category]) {
      return false;
    }

    // Check priority threshold
    const priorityLevels = { low: 0, medium: 1, high: 2 };
    const notificationLevel = priorityLevels[notification.priority];
    const thresholdLevel = priorityLevels[this.preferences.priorityThreshold];

    if (notificationLevel < thresholdLevel) {
      return false;
    }

    // Check quiet hours (except for high priority)
    if (this.isInQuietHours()) {
      return false;
    }

    // Check rate limits
    if (this.hasExceededLimits()) {
      return false;
    }

    return true;
  }

  private processBatch(): void {
    if (this.notificationQueue.length === 0) return;

    // Take up to MAX_BATCH_SIZE notifications from queue
    const batch = this.notificationQueue.splice(0, this.MAX_BATCH_SIZE);

    // Group by category for better presentation
    const groupedNotifications = batch.reduce((groups, notification) => {
      if (!groups[notification.category]) {
        groups[notification.category] = [];
      }
      groups[notification.category].push(notification);
      return groups;
    }, {} as Record<string, NotificationData[]>);

    // Show notifications by category
    Object.entries(groupedNotifications).forEach(([category, notifications]) => {
      if (notifications.length === 1) {
        // Single notification
        const notification = notifications[0];
        toast({
          title: notification.title,
          description: notification.description,
          variant: notification.type === 'error' ? 'destructive' : 'default',
          action: notification.action ? {
            altText: notification.action.label,
            onClick: notification.action.onClick,
            children: notification.action.label,
          } : undefined,
        });
      } else {
        // Multiple notifications - batch them
        const highPriority = notifications.filter(n => n.priority === 'high');
        const others = notifications.filter(n => n.priority !== 'high');

        if (highPriority.length > 0) {
          // Show high priority notifications individually
          highPriority.forEach(notification => {
            toast({
              title: notification.title,
              description: notification.description,
              variant: notification.type === 'error' ? 'destructive' : 'default',
            });
          });
        }

        if (others.length > 0) {
          // Batch other notifications
          toast({
            title: `${others.length} ${category} notifications`,
            description: `You have ${others.length} new ${category} updates. Check your dashboard for details.`,
          });
        }
      }
    });

    // Continue processing if there are more notifications
    if (this.notificationQueue.length > 0) {
      this.batchTimeout = setTimeout(() => this.processBatch(), this.BATCH_DELAY);
    }
  }

  public notify(notification: Omit<NotificationData, 'id' | 'timestamp'>): boolean {
    const fullNotification: NotificationData = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add to history for tracking
    this.notificationHistory.push(fullNotification);
    this.saveHistory();

    // Check if notification should be shown
    if (!this.shouldShowNotification(fullNotification)) {
      return false;
    }

    // Add to queue for batch processing
    this.notificationQueue.push(fullNotification);

    // Start batch processing if not already running
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
        this.batchTimeout = null;
      }, this.BATCH_DELAY);
    }

    return true;
  }

  // Convenience methods for different notification types
  public success(title: string, description?: string, category: keyof NotificationPreferences['categories'] = 'system'): boolean {
    return this.notify({
      type: 'success',
      category,
      priority: 'low',
      title,
      description,
    });
  }

  public error(title: string, description?: string, category: keyof NotificationPreferences['categories'] = 'system'): boolean {
    return this.notify({
      type: 'error',
      category,
      priority: 'high',
      title,
      description,
    });
  }

  public warning(title: string, description?: string, category: keyof NotificationPreferences['categories'] = 'system'): boolean {
    return this.notify({
      type: 'warning',
      category,
      priority: 'medium',
      title,
      description,
    });
  }

  public info(title: string, description?: string, category: keyof NotificationPreferences['categories'] = 'system'): boolean {
    return this.notify({
      type: 'info',
      category,
      priority: 'low',
      title,
      description,
    });
  }

  // Preference management
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
  }

  public clearNotificationQueue(): void {
    this.notificationQueue = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }

  public cleanupOldNotifications(daysToKeep: number = 7): void {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    this.notificationHistory = this.notificationHistory.filter(
      notification => notification.timestamp > cutoffTime
    );
    this.saveHistory();
  }

  public getNotificationStats(): {
    totalToday: number;
    totalThisHour: number;
    byCategory: Record<string, number>;
    byPriority: Record<string, number>;
    queueSize: number;
  } {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const todayNotifications = this.notificationHistory.filter(
      (notification) => notification.timestamp > oneDayAgo
    );

    const thisHourNotifications = this.notificationHistory.filter(
      (notification) => notification.timestamp > oneHourAgo
    );

    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    todayNotifications.forEach((notification) => {
      byCategory[notification.category] = (byCategory[notification.category] || 0) + 1;
      byPriority[notification.priority] = (byPriority[notification.priority] || 0) + 1;
    });

    return {
      totalToday: todayNotifications.length,
      totalThisHour: thisHourNotifications.length,
      byCategory,
      byPriority,
      queueSize: this.notificationQueue.length,
    };
  }
}

// Export singleton instance
export const smartNotifications = SmartNotificationManager.getInstance();
