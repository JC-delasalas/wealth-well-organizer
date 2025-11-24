// Test utilities for the enhanced financial insights system

import { supabase } from '@/integrations/supabase/client';
import { 
  CreateInsightInput,
  InsightType,
  InsightFrequency 
} from '@/types/insights';
import { createInsightWithDeduplication, checkForDuplicateInsight } from '@/utils/insightDeduplication';
import { insightScheduler } from '@/services/insightScheduler';

// Test data for insights
const TEST_INSIGHTS: CreateInsightInput[] = [
  {
    insight_type: 'daily',
    title: 'Daily Spending Alert',
    content: 'You spent $45.67 today on dining out, which is 20% higher than your average.',
    priority: 'medium',
    period_start: new Date().toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    generation_trigger: 'manual'
  },
  {
    insight_type: 'weekly',
    title: 'Weekly Financial Summary',
    content: 'This week you spent $234.56 and earned $1,200.00. Your savings rate is 80.5%.',
    priority: 'medium',
    period_start: '2025-01-13',
    period_end: '2025-01-19',
    generation_trigger: 'manual'
  },
  {
    insight_type: 'monthly',
    title: 'Monthly Budget Review',
    content: 'You are on track with your monthly budget. Current spending: $1,234.56 of $2,000.00 budgeted.',
    priority: 'low',
    period_start: '2025-01-01',
    period_end: '2025-01-31',
    generation_trigger: 'manual'
  },
  {
    insight_type: 'threshold_alert',
    title: 'Budget Threshold Alert',
    content: 'You have exceeded 90% of your dining budget for this month.',
    priority: 'high',
    generation_trigger: 'threshold'
  }
];

/**
 * Test the complete insight system functionality
 */
export const testInsightSystem = async (): Promise<void> => {
  console.log('🧪 Starting comprehensive insight system test...');

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    console.log('✅ User authenticated:', user.id);

    // Test 1: Database schema validation
    await testDatabaseSchema();

    // Test 2: User preferences functionality
    await testUserPreferences(user.id);

    // Test 3: Duplicate prevention
    await testDuplicatePrevention(user.id);

    // Test 4: Insight generation
    await testInsightGeneration(user.id);

    // Test 5: Scheduler functionality
    await testScheduler(user.id);

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

/**
 * Test database schema and constraints
 */
const testDatabaseSchema = async (): Promise<void> => {
  console.log('🔍 Testing database schema...');

  try {
    // Test financial_insights table structure
    const { error: insightsError } = await supabase
      .from('financial_insights')
      .select('*')
      .limit(1);

    if (insightsError) {
      throw new Error(`Financial insights table error: ${insightsError.message}`);
    }

    // Test user_insight_preferences table structure
    const { error: prefsError } = await supabase
      .from('user_insight_preferences')
      .select('*')
      .limit(1);

    if (prefsError) {
      throw new Error(`User preferences table error: ${prefsError.message}`);
    }

    console.log('✅ Database schema validation passed');
  } catch (error) {
    console.error('❌ Database schema test failed:', error);
    throw error;
  }
};

/**
 * Test user preferences CRUD operations
 */
const testUserPreferences = async (userId: string): Promise<void> => {
  console.log('🔍 Testing user preferences...');

  try {
    // Create test preferences
    const testPrefs = {
      user_id: userId,
      insight_frequency: 'weekly' as InsightFrequency,
      enabled_insight_types: ['weekly', 'monthly'] as InsightType[],
      preferred_delivery_time: '10:00:00',
      timezone: 'UTC'
    };

    // Insert preferences
    const { data: createdPrefs, error: createError } = await supabase
      .from('user_insight_preferences')
      .upsert([testPrefs])
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create preferences: ${createError.message}`);
    }

    console.log('✅ Preferences created:', createdPrefs.id);

    // Update preferences
    const { data: updatedPrefs, error: updateError } = await supabase
      .from('user_insight_preferences')
      .update({ insight_frequency: 'daily' })
      .eq('id', createdPrefs.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update preferences: ${updateError.message}`);
    }

    console.log('✅ Preferences updated successfully');

    // Test next_generation_due calculation
    if (updatedPrefs.next_generation_due) {
      console.log('✅ Next generation due calculated:', updatedPrefs.next_generation_due);
    }

  } catch (error) {
    console.error('❌ User preferences test failed:', error);
    throw error;
  }
};

/**
 * Test duplicate prevention functionality
 */
const testDuplicatePrevention = async (userId: string): Promise<void> => {
  console.log('🔍 Testing duplicate prevention...');

  try {
    const testInsight = TEST_INSIGHTS[0];

    // Test 1: Create original insight
    const result1 = await createInsightWithDeduplication(userId, testInsight);
    if (!result1.success || result1.skipped) {
      throw new Error('Failed to create original insight');
    }
    console.log('✅ Original insight created:', result1.insight?.id);

    // Test 2: Try to create duplicate (should be prevented)
    const result2 = await createInsightWithDeduplication(userId, testInsight);
    if (!result2.success || !result2.skipped) {
      throw new Error('Duplicate prevention failed');
    }
    console.log('✅ Duplicate insight prevented');

    // Test 3: Create similar but different insight
    const modifiedInsight = {
      ...testInsight,
      content: testInsight.content + ' Additional information.',
      period_start: '2025-01-20',
      period_end: '2025-01-20'
    };

    const result3 = await createInsightWithDeduplication(userId, modifiedInsight);
    if (!result3.success || result3.skipped) {
      throw new Error('Failed to create modified insight');
    }
    console.log('✅ Modified insight created:', result3.insight?.id);

    // Test 4: Direct duplicate check function
    const duplicateCheck = await checkForDuplicateInsight(userId, testInsight);
    if (!duplicateCheck.is_duplicate) {
      throw new Error('Duplicate check function failed');
    }
    console.log('✅ Duplicate check function working');

  } catch (error) {
    console.error('❌ Duplicate prevention test failed:', error);
    throw error;
  }
};

/**
 * Test insight generation functionality
 */
const testInsightGeneration = async (userId: string): Promise<void> => {
  console.log('🔍 Testing insight generation...');

  try {
    // Create multiple test insights
    let successCount = 0;
    let duplicateCount = 0;

    for (const insight of TEST_INSIGHTS) {
      const result = await createInsightWithDeduplication(userId, insight);
      if (result.success && !result.skipped) {
        successCount++;
      } else if (result.skipped) {
        duplicateCount++;
      }
    }

    console.log(`✅ Insights created: ${successCount}, duplicates prevented: ${duplicateCount}`);

    // Test insight retrieval
    const { data: insights, error: fetchError } = await supabase
      .from('financial_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (fetchError) {
      throw new Error(`Failed to fetch insights: ${fetchError.message}`);
    }

    console.log(`✅ Retrieved ${insights?.length || 0} insights`);

    // Test insight analytics
    const insightsByType = insights?.reduce((acc, insight) => {
      acc[insight.insight_type] = (acc[insight.insight_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    console.log('✅ Insights by type:', insightsByType);

  } catch (error) {
    console.error('❌ Insight generation test failed:', error);
    throw error;
  }
};

/**
 * Test scheduler functionality
 */
const testScheduler = async (userId: string): Promise<void> => {
  console.log('🔍 Testing scheduler functionality...');

  try {
    // Test manual insight generation
    const result = await insightScheduler.generateInsightsForUser(userId);
    
    console.log('✅ Scheduler generation result:', {
      success: result.success,
      generated: result.insights_generated,
      skipped: result.insights_skipped,
      errors: result.errors.length
    });

    // Test scheduler status
    const isRunning = insightScheduler.isSchedulerRunning();
    console.log('✅ Scheduler running status:', isRunning);

    if (!isRunning) {
      console.log('ℹ️ Starting scheduler for testing...');
      insightScheduler.start();
      
      // Wait a moment then stop
      setTimeout(() => {
        insightScheduler.stop();
        console.log('✅ Scheduler start/stop test completed');
      }, 1000);
    }

  } catch (error) {
    console.error('❌ Scheduler test failed:', error);
    throw error;
  }
};

/**
 * Clean up test data
 */
export const cleanupTestData = async (): Promise<void> => {
  console.log('🧹 Cleaning up test data...');

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Delete test insights (keep only recent ones)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { error: deleteError } = await supabase
      .from('financial_insights')
      .delete()
      .eq('user_id', user.id)
      .eq('generation_trigger', 'manual')
      .gte('created_at', oneDayAgo.toISOString());

    if (deleteError) {
      console.error('Error cleaning up insights:', deleteError);
    } else {
      console.log('✅ Test insights cleaned up');
    }

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
};

/**
 * Performance test for duplicate detection
 */
export const testDuplicatePerformance = async (): Promise<void> => {
  console.log('🔍 Testing duplicate detection performance...');

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const testInsight = TEST_INSIGHTS[0];
    const iterations = 100;
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      await checkForDuplicateInsight(user.id, {
        ...testInsight,
        content: `${testInsight.content} ${i}` // Make each slightly different
      });
    }

    const endTime = performance.now();
    const avgTime = (endTime - startTime) / iterations;

    console.log(`✅ Duplicate check performance: ${avgTime.toFixed(2)}ms average over ${iterations} checks`);

  } catch (error) {
    console.error('❌ Performance test failed:', error);
    throw error;
  }
};

// Make functions available in browser console for testing
if (typeof window !== 'undefined') {
  (window as any).testInsightSystem = testInsightSystem;
  (window as any).cleanupTestData = cleanupTestData;
  (window as any).testDuplicatePerformance = testDuplicatePerformance;
}
