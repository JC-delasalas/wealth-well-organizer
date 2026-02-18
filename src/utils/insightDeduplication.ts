// Insight deduplication utilities for preventing duplicate financial insights

import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
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

// Cache for duplicate checks to prevent excessive API calls
const duplicateCheckCache = new Map<string, { result: DuplicateCheckResult; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Request throttling to prevent API overload
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 100; // 100ms between requests

/**
 * Throttle requests to prevent API overload
 */
const throttleRequest = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  lastRequestTime = Date.now();
};

/**
 * Check if an insight is a duplicate based on period and content with caching and throttling
 */
export const checkForDuplicateInsight = async (
  userId: string,
  insight: CreateInsightInput
): Promise<DuplicateCheckResult> => {
  try {
    // Generate cache key
    const normalizedContent = normalizeInsightContent(insight);
    const cacheKey = `${userId}-${insight.insight_type}-${normalizedContent}`;

    // Check cache first
    const cached = duplicateCheckCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      console.log('Using cached duplicate check result');
      return cached.result;
    }

    // Throttle request to prevent API overload
    await throttleRequest();

    // Generate content hash
    const contentHash = await generateContentHash(normalizedContent);

    // Single optimized query to check for duplicates
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: existingInsights, error } = await supabase
      .from('financial_insights')
      .select('id, title, content, content_hash, period_start, period_end')
      .eq('user_id', userId)
      .eq('insight_type', insight.insight_type)
      .gte('created_at', sevenDaysAgo.toISOString())
      .limit(20);

    if (error) {
      console.error('Error checking for duplicates:', error);

      // Handle specific error types
      if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
        console.warn('API rate limit or resource exhaustion detected, skipping duplicate check');
        return {
          is_duplicate: false,
          duplicate_type: 'none'
        };
      }

      throw error;
    }

    if (!existingInsights || existingInsights.length === 0) {
      const result = {
        is_duplicate: false,
        duplicate_type: 'none' as const
      };

      // Cache the result
      duplicateCheckCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }

    // Check for exact period match
    if (insight.period_start && insight.period_end) {
      const periodMatch = existingInsights.find(existing =>
        existing.period_start === insight.period_start &&
        existing.period_end === insight.period_end
      );

      if (periodMatch) {
        const result = {
          is_duplicate: true,
          duplicate_type: 'period' as const,
          existing_insight_id: periodMatch.id
        };

        // Cache the result
        duplicateCheckCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
      }
    }

    // Check for content hash match
    const contentMatch = existingInsights.find(existing =>
      existing.content_hash === contentHash
    );

    if (contentMatch) {
      const result = {
        is_duplicate: true,
        duplicate_type: 'content' as const,
        existing_insight_id: contentMatch.id
      };

      // Cache the result
      duplicateCheckCache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }

    // Check for high similarity (only if we have few existing insights to avoid performance issues)
    if (existingInsights.length <= 10) {
      for (const existing of existingInsights) {
        const similarity = calculateTextSimilarity(
          insight.content.toLowerCase(),
          existing.content.toLowerCase()
        );

        if (similarity > 0.85) { // 85% similarity threshold
          const result = {
            is_duplicate: true,
            duplicate_type: 'content' as const,
            existing_insight_id: existing.id,
            similarity_score: similarity
          };

          // Cache the result
          duplicateCheckCache.set(cacheKey, { result, timestamp: Date.now() });
          return result;
        }
      }
    }

    const result = {
      is_duplicate: false,
      duplicate_type: 'none' as const
    };

    // Cache the result
    duplicateCheckCache.set(cacheKey, { result, timestamp: Date.now() });
    return result;

  } catch (error) {
    console.error('Error in duplicate check:', error);

    // Log specific error details for debugging
    if (error && typeof error === 'object') {
      const dbError = error as { code?: string; message?: string; [key: string]: unknown };
      if (dbError.code === '42703') {
        console.error('Database column missing - content_hash field may not exist');
      } else if (dbError.code === '42P01') {
        console.error('Database table missing - financial_insights table may not exist');
      } else if (dbError.message?.includes('Failed to fetch')) {
        console.error('Network error - API may be overloaded');
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
        duplicateGroups.push([insight as FinancialInsight, ...(duplicates as FinancialInsight[])]);
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

// Request queue to prevent simultaneous requests
const requestQueue: Array<() => Promise<unknown>> = [];
let isProcessingQueue = false;

/**
 * Process request queue to prevent API overload
 */
const processRequestQueue = async (): Promise<void> => {
  if (isProcessingQueue || requestQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;

  while (requestQueue.length > 0) {
    const request = requestQueue.shift();
    if (request) {
      try {
        await request();
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error('Error processing queued request:', error);
      }
    }
  }

  isProcessingQueue = false;
};

/**
 * Create insight with duplicate prevention and request throttling
 */
export const createInsightWithDeduplication = async (
  userId: string,
  insight: CreateInsightInput
): Promise<{ success: boolean; insight?: FinancialInsight; error?: string; skipped?: boolean }> => {
  return new Promise((resolve) => {
    // Add to request queue to prevent API overload
    requestQueue.push(async () => {
      try {
        // Validate content
        const validationErrors = validateInsightContent(insight);
        if (validationErrors.length > 0) {
          resolve({
            success: false,
            error: validationErrors.join(', ')
          });
          return;
        }

        // Check for duplicates with throttling
        const duplicateCheck = await checkForDuplicateInsight(userId, insight);
        if (duplicateCheck.is_duplicate) {
          console.log(`Skipping duplicate insight for user ${userId}:`, duplicateCheck);
          resolve({
            success: true,
            skipped: true,
            error: `Duplicate insight detected (${duplicateCheck.duplicate_type})`
          });
          return;
        }

        // Generate content hash
        const normalizedContent = normalizeInsightContent(insight);
        const contentHash = await generateContentHash(normalizedContent);

        // Throttle the insert request
        await throttleRequest();

        // Create the insight with fallback for missing columns
        const insertData: Database['public']['Tables']['financial_insights']['Insert'] = {
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

          // Handle specific error types
          let errorMessage = error.message;

          if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_INSUFFICIENT_RESOURCES')) {
            errorMessage = 'API rate limit exceeded. Please try again in a moment.';
          } else if (error.code === '42703') {
            errorMessage = 'Database schema mismatch - some insight features may not be available';
          } else if (error.code === '42P01') {
            errorMessage = 'Financial insights table not found - please contact support';
          } else if (error.code === '23505') {
            errorMessage = 'Duplicate insight detected by database constraint';
          }

          resolve({
            success: false,
            error: errorMessage
          });
          return;
        }

        resolve({
          success: true,
          insight: data as FinancialInsight
        });

      } catch (error) {
        console.error('Error in createInsightWithDeduplication:', error);

        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
          errorMessage = error.message;

          if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error - please check your connection and try again';
          }
        }

        resolve({
          success: false,
          error: errorMessage
        });
      }
    });

    // Start processing the queue
    processRequestQueue();
  });
};

/**
 * Clear duplicate check cache to prevent memory leaks
 */
export const clearDuplicateCheckCache = (): void => {
  duplicateCheckCache.clear();
  console.log('Duplicate check cache cleared');
};

/**
 * Clean up expired cache entries
 */
export const cleanupExpiredCache = (): void => {
  const now = Date.now();
  const expiredKeys: string[] = [];

  duplicateCheckCache.forEach((value, key) => {
    if (now - value.timestamp > CACHE_DURATION) {
      expiredKeys.push(key);
    }
  });

  expiredKeys.forEach(key => duplicateCheckCache.delete(key));

  if (expiredKeys.length > 0) {
    console.log(`Cleaned up ${expiredKeys.length} expired cache entries`);
  }
};

// Automatically clean up expired cache entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}
