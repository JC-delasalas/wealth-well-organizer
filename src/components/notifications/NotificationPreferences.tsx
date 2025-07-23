/**
 * Notification Preferences Component
 * Allows users to configure smart notification settings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  BellOff,
  Clock,
  Filter,
  BarChart3,
  Settings,
  Info
} from 'lucide-react';
import { smartNotifications, NotificationPreferences } from '@/utils/smartNotifications';

export const NotificationPreferencesComponent: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    smartNotifications.getPreferences()
  );
  const [stats, setStats] = useState(smartNotifications.getNotificationStats());

  useEffect(() => {
    // Update stats every minute
    const interval = setInterval(() => {
      setStats(smartNotifications.getNotificationStats());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handlePreferenceChange = (updates: Partial<NotificationPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    smartNotifications.updatePreferences(updates);
  };

  const handleCategoryToggle = (category: keyof NotificationPreferences['categories'], enabled: boolean) => {
    const newCategories = { ...preferences.categories, [category]: enabled };
    handlePreferenceChange({ categories: newCategories });
  };

  const testNotification = () => {
    smartNotifications.info(
      'Test Notification',
      'This is a test notification to verify your settings are working correctly.',
      'system'
    );
  };

  return (
    <div className="space-y-6">
      {/* Main Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Master Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Enable Notifications</Label>
              <p className="text-sm text-gray-600">
                Turn on/off all notifications from the application
              </p>
            </div>
            <Switch
              checked={preferences.enabled}
              onCheckedChange={(enabled) => handlePreferenceChange({ enabled })}
            />
          </div>

          <Separator />

          {/* Rate Limiting */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <Label className="text-base font-medium">Rate Limiting</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxPerHour">Maximum per hour</Label>
                <Input
                  id="maxPerHour"
                  type="number"
                  min="1"
                  max="20"
                  value={preferences.maxPerHour}
                  onChange={(e) => handlePreferenceChange({ maxPerHour: parseInt(e.target.value) || 5 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxPerDay">Maximum per day</Label>
                <Input
                  id="maxPerDay"
                  type="number"
                  min="1"
                  max="100"
                  value={preferences.maxPerDay}
                  onChange={(e) => handlePreferenceChange({ maxPerDay: parseInt(e.target.value) || 20 })}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BellOff className="w-4 h-4" />
              <Label className="text-base font-medium">Quiet Hours</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quietStart">Start time</Label>
                <Input
                  id="quietStart"
                  type="time"
                  value={preferences.quietHoursStart}
                  onChange={(e) => handlePreferenceChange({ quietHoursStart: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quietEnd">End time</Label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={preferences.quietHoursEnd}
                  onChange={(e) => handlePreferenceChange({ quietHoursEnd: e.target.value })}
                />
              </div>
            </div>
            
            <p className="text-sm text-gray-600">
              No notifications will be shown during quiet hours (except high priority alerts)
            </p>
          </div>

          <Separator />

          {/* Priority Threshold */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <Label className="text-base font-medium">Priority Threshold</Label>
            </div>
            
            <Select
              value={preferences.priorityThreshold}
              onValueChange={(value: 'low' | 'medium' | 'high') => 
                handlePreferenceChange({ priorityThreshold: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Show all notifications</SelectItem>
                <SelectItem value="medium">Medium - Show medium and high priority</SelectItem>
                <SelectItem value="high">High - Show only high priority</SelectItem>
              </SelectContent>
            </Select>
            
            <p className="text-sm text-gray-600">
              Only notifications at or above this priority level will be shown
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Notification Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(preferences.categories).map(([category, enabled]) => (
            <div key={category} className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium capitalize">{category}</Label>
                <p className="text-sm text-gray-600">
                  {getCategoryDescription(category as keyof NotificationPreferences['categories'])}
                </p>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={(checked) => 
                  handleCategoryToggle(category as keyof NotificationPreferences['categories'], checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Notification Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalThisHour}</div>
              <div className="text-sm text-gray-600">This Hour</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalToday}</div>
              <div className="text-sm text-gray-600">Today</div>
            </div>
          </div>

          {Object.keys(stats.byCategory).length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">By Category (Today)</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byCategory).map(([category, count]) => (
                  <Badge key={category} variant="outline">
                    {category}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button onClick={testNotification} variant="outline" size="sm">
              <Info className="w-4 h-4 mr-2" />
              Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

function getCategoryDescription(category: keyof NotificationPreferences['categories']): string {
  const descriptions = {
    financial: 'Transaction confirmations and financial updates',
    budget: 'Budget alerts and spending warnings',
    savings: 'Savings goal progress and achievements',
    insights: 'AI-generated financial insights and recommendations',
    system: 'System messages and important updates',
  };
  
  return descriptions[category] || 'Notification category';
}
