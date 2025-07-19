// Insight preferences settings component with mobile-friendly UI

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useInsightPreferences } from '@/hooks/useInsightPreferences';
import { useFinancialInsights } from '@/hooks/useFinancialInsights';
import { 
  Settings, 
  Clock, 
  Zap, 
  BarChart3, 
  Calendar,
  RefreshCw,
  Trash2,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import {
  InsightFrequency,
  InsightType,
  INSIGHT_FREQUENCIES,
  INSIGHT_TYPES,
  CreateInsightPreferencesInput,
  UpdateInsightPreferencesInput
} from '@/types/insights';

interface InsightPreferencesSettingsProps {
  className?: string;
}

export const InsightPreferencesSettings = ({ className }: InsightPreferencesSettingsProps) => {
  const { toast } = useToast();
  const {
    preferences,
    isLoading,
    schedule,
    isGenerationDue,
    timeUntilNext,
    createPreferences,
    updatePreferences,
    getOrCreatePreferences,
    resetToDefaults,
    isCreating,
    isUpdating,
    isSaving,
    userTimezone
  } = useInsightPreferences();

  const {
    generateInsights,
    cleanupOldInsights,
    analytics,
    isGenerating,
    isCleaningUp
  } = useFinancialInsights();

  // Local state for form
  const [formData, setFormData] = useState<{
    insight_frequency: InsightFrequency;
    enabled_insight_types: InsightType[];
    preferred_delivery_time: string;
  }>({
    insight_frequency: 'weekly',
    enabled_insight_types: ['weekly', 'monthly', 'threshold_alert'],
    preferred_delivery_time: '09:00'
  });

  // Update form data when preferences load
  useEffect(() => {
    if (preferences) {
      setFormData({
        insight_frequency: preferences.insight_frequency,
        enabled_insight_types: preferences.enabled_insight_types,
        preferred_delivery_time: preferences.preferred_delivery_time.slice(0, 5) // HH:MM format
      });
    }
  }, [preferences]);

  // Handle frequency change
  const handleFrequencyChange = (frequency: InsightFrequency) => {
    setFormData(prev => ({ ...prev, insight_frequency: frequency }));
  };

  // Handle insight type toggle
  const handleInsightTypeToggle = (type: InsightType, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      enabled_insight_types: enabled
        ? [...prev.enabled_insight_types, type]
        : prev.enabled_insight_types.filter(t => t !== type)
    }));
  };

  // Handle time change
  const handleTimeChange = (time: string) => {
    setFormData(prev => ({ ...prev, preferred_delivery_time: time }));
  };

  // Save preferences
  const handleSave = async () => {
    try {
      if (preferences) {
        // Update existing preferences
        const updateData: UpdateInsightPreferencesInput = {
          id: preferences.id,
          insight_frequency: formData.insight_frequency,
          enabled_insight_types: formData.enabled_insight_types,
          preferred_delivery_time: `${formData.preferred_delivery_time}:00`
        };
        updatePreferences(updateData);
      } else {
        // Create new preferences
        const createData: CreateInsightPreferencesInput = {
          insight_frequency: formData.insight_frequency,
          enabled_insight_types: formData.enabled_insight_types,
          preferred_delivery_time: `${formData.preferred_delivery_time}:00`,
          timezone: userTimezone
        };
        createPreferences(createData);
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  // Manual insight generation
  const handleGenerateInsights = async () => {
    try {
      await generateInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  // Cleanup old insights
  const handleCleanup = async () => {
    try {
      await cleanupOldInsights(90); // Keep last 90 days
    } catch (error) {
      console.error('Error cleaning up insights:', error);
    }
  };

  // Reset to defaults
  const handleReset = async () => {
    try {
      await resetToDefaults();
      toast({
        title: "Settings Reset",
        description: "Your insight preferences have been reset to defaults.",
      });
    } catch (error) {
      console.error('Error resetting preferences:', error);
    }
  };

  // Format time until next generation
  const formatTimeUntilNext = () => {
    const { days, hours, minutes } = timeUntilNext;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            <span>Loading preferences...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Insight Preferences
          </CardTitle>
          <CardDescription>
            Configure when and how often you receive financial insights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequency Setting */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Generation Frequency</Label>
            <Select 
              value={formData.insight_frequency} 
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                {INSIGHT_FREQUENCIES.map(freq => (
                  <SelectItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preferred Time */}
          {formData.insight_frequency !== 'disabled' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Preferred Time</Label>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <Input
                  type="time"
                  value={formData.preferred_delivery_time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="w-32"
                />
                <span className="text-sm text-gray-500">({userTimezone})</span>
              </div>
            </div>
          )}

          {/* Insight Types */}
          {formData.insight_frequency !== 'disabled' && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Enabled Insight Types</Label>
              <div className="space-y-3">
                {INSIGHT_TYPES.map(type => (
                  <div key={type.value} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Label className="font-medium">{type.label}</Label>
                        {type.value === 'threshold_alert' && (
                          <Badge variant="secondary" className="text-xs">
                            Real-time
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </div>
                    <Switch
                      checked={formData.enabled_insight_types.includes(type.value)}
                      onCheckedChange={(checked) => handleInsightTypeToggle(type.value, checked)}
                      className="flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="flex gap-2 pt-4">
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isSaving}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Insight Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Generation Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {isGenerationDue ? (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <div>
                <p className="font-medium">
                  {isGenerationDue ? 'Generation Due' : 'Next Generation'}
                </p>
                <p className="text-sm text-gray-600">
                  {isGenerationDue ? 'Ready to generate' : `In ${formatTimeUntilNext()}`}
                </p>
              </div>
            </div>
            <Button
              onClick={handleGenerateInsights}
              disabled={isGenerating}
              size="sm"
              variant={isGenerationDue ? "default" : "outline"}
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{analytics.total_insights}</p>
              <p className="text-sm text-blue-600">Total Insights</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{analytics.read_rate.toFixed(0)}%</p>
              <p className="text-sm text-green-600">Read Rate</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{analytics.insights_by_priority.high}</p>
              <p className="text-sm text-purple-600">High Priority</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{analytics.average_generation_interval.toFixed(0)}</p>
              <p className="text-sm text-gray-600">Avg Days</p>
            </div>
          </div>

          {/* Actions */}
          <Separator />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCleanup}
              disabled={isCleaningUp}
              size="sm"
              className="flex-1 sm:flex-none"
            >
              {isCleaningUp ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Cleanup Old
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>How it works:</strong> Insights are automatically generated based on your frequency settings and financial activity.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Daily insights focus on recent spending patterns</li>
                <li>Weekly insights provide broader trend analysis</li>
                <li>Monthly insights offer comprehensive financial reviews</li>
                <li>Threshold alerts notify you of budget overruns in real-time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
