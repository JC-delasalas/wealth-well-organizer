// Insight deduplication utilities for preventing duplicate financial insights

import { supabase } from '@/integrations/supabase/client';
import { 
  FinancialInsight, 
  InsightType, 
  DuplicateCheckResult,
  CreateInsightInput 
} from '@/types/insights';

/**
 * Generate SHA-256 hash of insight content for duplicate detection
 */
export const generateContentHash = async (content: string): Promise<string> => {
  // Use Web Crypto API for hashing
  const encoder = new TextEncoder();
  const data = encoder.encode(content.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

/**
 * Generate a normalized content string for consistent hashing
 */
export const normalizeInsightContent = (insight: CreateInsightInput): string => {
  // Create a normalized string that captures the essence of the insight
  const normalized = [
    insight.insight_type,
    insight.title.trim().toLowerCase(),
    insight.content.trim().toLowerCase().replace(/\s+/g, ' '),
    insight.period_start || '',
    insight.period_end || ''
  ].join('|');
  
  return normalized;
};

/**
 * Check if an insight is a duplicate based on period and content
 */
export const checkForDuplicateInsight = async (
  userId: string,
  insight: CreateInsightInput
): Promise<DuplicateCheckResult> => {
  try {
    // Generate content hash
    const normalizedContent = normalizeInsightContent(insight);
    const contentHash = await generateContentHash(normalizedContent);

    // Check for exact period match first
    if (insight.period_start && insight.period_end) {
      const { data: periodDuplicates, error: periodError } = await supabase
        .from('financial_insights')
        .select('id, title, content')
        .eq('user_id', userId)
        .eq('insight_type', insight.insight_type)
        .eq('period_start', insight.period_start)
        .eq('period_end', insight.period_end)
        .limit(1);

      if (periodError) {
        console.error('Error checking for period duplicates:', periodError);
      } else if (periodDuplicates && periodDuplicates.length > 0) {
        return {
          is_duplicate: true,
          duplicate_type: 'period',
          existing_insight_id: periodDuplicates[0].id
        };
      }
    }

    // Check for content hash match (recent insights only)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: contentDuplicates, error: contentError } = await supabase
      .from('financial_insights')
      .select('id, title, content, content_hash')
      .eq('user_id', userId)
      .eq('insight_type', insight.insight_type)
      .eq('content_hash', contentHash)
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(1);

    if (contentError) {
      console.error('Error checking for content duplicates:', contentError);
    } else if (contentDuplicates && contentDuplicates.length > 0) {
      return {
        is_duplicate: true,
        duplicate_type: 'content',
        existing_insight_id: contentDuplicates[0].id
      };
    }

    // Check for similar content using text similarity
    const { data: recentInsights, error: recentError } = await supabase
      .from('financial_insights')
      .select('id, title, content')
      .eq('user_id', userId)
      .eq('insight_type', insight.insight_type)
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(10);

    if (recentError) {
      console.error('Error checking for recent insights:', recentError);
    } else if (recentInsights && recentInsights.length > 0) {
      // Check for high similarity with recent insights
      for (const recentInsight of recentInsights) {
        const similarity = calculateTextSimilarity(
          insight.content.toLowerCase(),
          recentInsight.content.toLowerCase()
        );
        
        if (similarity > 0.85) { // 85% similarity threshold
          return {
            is_duplicate: true,
            duplicate_type: 'content',
            existing_insight_id: recentInsight.id,
            similarity_score: similarity
          };
        }
      }
    }

    return {
      is_duplicate: false,
      duplicate_type: 'none'
    };

  } catch (error) {
    console.error('Error in duplicate check:', error);

    // Log specific error details for debugging
    if (error && typeof error === 'object') {
      const dbError = error as any;
      if (dbError.code === '42703') {
        console.error('Database column missing - content_hash field may not exist');
      } else if (dbError.code === '42P01') {
        console.error('Database table missing - financial_insights table may not exist');
      } else {
        console.error('Database error details:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details
        });
      }
    }

    // In case of error, assume not duplicate to avoid blocking insight generation
    return {
      is_duplicate: false,
      duplicate_type: 'none'
    };
  }
};

/**
 * Calculate text similarity using Jaccard similarity coefficient
 */
export const calculateTextSimilarity = (text1: string, text2: string): number => {
  // Simple word-based Jaccard similarity
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};

/**
 * Clean up old insights to prevent database bloat
 */
export const cleanupOldInsights = async (userId: string, daysToKeep: number = 90): Promise<void> => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const { error } = await supabase
      .from('financial_insights')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (error) {
      console.error('Error cleaning up old insights:', error);
    } else {
      console.log(`Cleaned up insights older than ${daysToKeep} days for user ${userId}`);
    }
  } catch (error) {
    console.error('Error in cleanup process:', error);
  }
};

/**
 * Get duplicate insights for a user (for debugging/admin purposes)
 */
export const findDuplicateInsights = async (userId: string): Promise<FinancialInsight[][]> => {
  try {
    const { data: insights, error } = await supabase
      .from('financial_insights')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !insights) {
      console.error('Error fetching insights for duplicate detection:', error);
      return [];
    }

    const duplicateGroups: FinancialInsight[][] = [];
    const processedHashes = new Set<string>();

    for (const insight of insights) {
      if (!insight.content_hash || processedHashes.has(insight.content_hash)) {
        continue;
      }

      // Find all insights with the same content hash
      const duplicates = insights.filter(i => 
        i.content_hash === insight.content_hash && 
        i.id !== insight.id
      );

      if (duplicates.length > 0) {
        duplicateGroups.push([insight, ...duplicates]);
        processedHashes.add(insight.content_hash);
      }
    }

    return duplicateGroups;
  } catch (error) {
    console.error('Error finding duplicate insights:', error);
    return [];
  }
};

/**
 * Remove duplicate insights, keeping the most recent one
 */
export const removeDuplicateInsights = async (userId: string): Promise<number> => {
  try {
    const duplicateGroups = await findDuplicateInsights(userId);
    let removedCount = 0;

    for (const group of duplicateGroups) {
      // Sort by created_at descending (most recent first)
      group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Keep the first (most recent) and remove the rest
      const toRemove = group.slice(1);
      
      for (const insight of toRemove) {
        const { error } = await supabase
          .from('financial_insights')
          .delete()
          .eq('id', insight.id);

        if (error) {
          console.error(`Error removing duplicate insight ${insight.id}:`, error);
        } else {
          removedCount++;
        }
      }
    }

    console.log(`Removed ${removedCount} duplicate insights for user ${userId}`);
    return removedCount;
  } catch (error) {
    console.error('Error removing duplicate insights:', error);
    return 0;
  }
};

/**
 * Validate insight content before creation
 */
export const validateInsightContent = (insight: CreateInsightInput): string[] => {
  const errors: string[] = [];

  if (!insight.title || insight.title.trim().length === 0) {
    errors.push('Insight title is required');
  }

  if (!insight.content || insight.content.trim().length === 0) {
    errors.push('Insight content is required');
  }

  if (insight.title && insight.title.length > 200) {
    errors.push('Insight title must be 200 characters or less');
  }

  if (insight.content && insight.content.length > 2000) {
    errors.push('Insight content must be 2000 characters or less');
  }

  if (insight.period_start && insight.period_end) {
    const startDate = new Date(insight.period_start);
    const endDate = new Date(insight.period_end);
    
    if (startDate >= endDate) {
      errors.push('Period start date must be before end date');
    }
  }

  return errors;
};

/**
 * Create insight with duplicate prevention
 */
export const createInsightWithDeduplication = async (
  userId: string,
  insight: CreateInsightInput
): Promise<{ success: boolean; insight?: FinancialInsight; error?: string; skipped?: boolean }> => {
  try {
    // Validate content
    const validationErrors = validateInsightContent(insight);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(', ')
      };
    }

    // Check for duplicates
    const duplicateCheck = await checkForDuplicateInsight(userId, insight);
    if (duplicateCheck.is_duplicate) {
      console.log(`Skipping duplicate insight for user ${userId}:`, duplicateCheck);
      return {
        success: true,
        skipped: true,
        error: `Duplicate insight detected (${duplicateCheck.duplicate_type})`
      };
    }

    // Generate content hash
    const normalizedContent = normalizeInsightContent(insight);
    const contentHash = await generateContentHash(normalizedContent);

    // Create the insight with fallback for missing columns
    const insertData: any = {
      user_id: userId,
      insight_type: insight.insight_type,
      title: insight.title,
      content: insight.content,
      priority: insight.priority || 'medium',
      period_start: insight.period_start || null,
      period_end: insight.period_end || null,
      is_read: false
    };

    // Only add enhanced fields if they might exist
    try {
      insertData.content_hash = contentHash;
      insertData.generation_trigger = insight.generation_trigger || 'manual';
    } catch (error) {
      console.warn('Enhanced insight fields not available, using basic fields only');
    }

    const { data, error } = await supabase
      .from('financial_insights')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Error creating insight:', error);

      // Provide specific error messages
      let errorMessage = error.message;
      if (error.code === '42703') {
        errorMessage = 'Database schema mismatch - some insight features may not be available';
      } else if (error.code === '42P01') {
        errorMessage = 'Financial insights table not found - please contact support';
      }

      return {
        success: false,
        error: errorMessage
      };
    }

    return {
      success: true,
      insight: data as FinancialInsight
    };

  } catch (error) {
    console.error('Error in createInsightWithDeduplication:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
