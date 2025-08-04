/**
 * Category Seeder Service
 * Handles seeding default categories for users in the wealth-well-organizer application
 */

import { supabase } from '@/integrations/supabase/client';
import { defaultCategories } from '@/data/categories';


export interface CategorySeedResult {
  success: boolean;
  categoriesCreated: number;
  categoriesSkipped: number;
  errors: string[];
}

/**
 * Seeds default categories for a specific user
 */
export const seedUserCategories = async (userId: string): Promise<CategorySeedResult> => {
  const result: CategorySeedResult = {
    success: false,
    categoriesCreated: 0,
    categoriesSkipped: 0,
    errors: []
  };

  try {
    // Check if user already has categories
    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', userId);

    if (fetchError) {
      result.errors.push(`Failed to fetch existing categories: ${fetchError.message}`);
      return result;
    }

    const existingCategoryNames = new Set(existingCategories?.map(cat => cat.name) || []);

    // Filter out categories that already exist
    const categoriesToCreate = defaultCategories.filter(
      category => !existingCategoryNames.has(category.name)
    );

    if (categoriesToCreate.length === 0) {
      result.success = true;
      result.categoriesSkipped = defaultCategories.length;
      return result;
    }

    // Prepare categories for insertion
    const categoryInserts = categoriesToCreate.map(category => ({
      user_id: userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      description: category.description || null,
      is_default: false // User-specific copies are not marked as default
    }));

    // Insert categories in batches to avoid hitting limits
    const batchSize = 10;
    let totalCreated = 0;

    for (let i = 0; i < categoryInserts.length; i += batchSize) {
      const batch = categoryInserts.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('categories')
        .insert(batch)
        .select('id');

      if (error) {
        result.errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
        continue;
      }

      totalCreated += data?.length || 0;
    }

    result.success = result.errors.length === 0;
    result.categoriesCreated = totalCreated;
    result.categoriesSkipped = existingCategoryNames.size;

  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Seeds categories for all users who don't have them
 * This is useful for migrating existing users
 */
export const seedCategoriesForAllUsers = async (): Promise<{
  success: boolean;
  usersProcessed: number;
  totalCategoriesCreated: number;
  errors: string[];
}> => {
  const result = {
    success: false,
    usersProcessed: 0,
    totalCategoriesCreated: 0,
    errors: [] as string[]
  };

  try {
    // Get all users who don't have categories or have fewer than expected
    const { data: usersWithoutCategories, error: usersError } = await supabase
      .from('profiles')
      .select(`
        id,
        categories:categories(count)
      `);

    if (usersError) {
      result.errors.push(`Failed to fetch users: ${usersError.message}`);
      return result;
    }

    const usersNeedingCategories = usersWithoutCategories?.filter(user => {
      const categoryCount = (user.categories?.[0] as any)?.count || 0;
      return categoryCount < defaultCategories.length;
    }) || [];

    if (usersNeedingCategories.length === 0) {
      result.success = true;
      return result;
    }

    // Process each user
    for (const user of usersNeedingCategories) {
      try {
        const seedResult = await seedUserCategories(user.id);
        
        if (seedResult.success) {
          result.usersProcessed++;
          result.totalCategoriesCreated += seedResult.categoriesCreated;
        } else {
          result.errors.push(`User ${user.id}: ${seedResult.errors.join(', ')}`);
        }
      } catch (error) {
        result.errors.push(`User ${user.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    result.success = result.errors.length === 0;

  } catch (error) {
    result.errors.push(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Validates that a user has all default categories
 */
export const validateUserCategories = async (userId: string): Promise<{
  isValid: boolean;
  missingCategories: string[];
  totalCategories: number;
}> => {
  try {
    const { data: userCategories, error } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    const userCategoryNames = new Set(userCategories?.map(cat => cat.name) || []);
    const missingCategories = defaultCategories
      .filter(category => !userCategoryNames.has(category.name))
      .map(category => category.name);

    return {
      isValid: missingCategories.length === 0,
      missingCategories,
      totalCategories: userCategories?.length || 0
    };

  } catch (error) {
    return {
      isValid: false,
      missingCategories: [],
      totalCategories: 0
    };
  }
};

/**
 * Gets category statistics for the application
 */
export const getCategoryStats = async (): Promise<{
  totalUsers: number;
  usersWithCategories: number;
  averageCategoriesPerUser: number;
  mostUsedCategories: Array<{ name: string; userCount: number }>;
}> => {
  try {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Get users with categories
    const { data: categoryStats } = await supabase
      .from('categories')
      .select('user_id, name')
      .not('user_id', 'is', null);

    const userCategoryCounts = new Map<string, number>();
    const categoryUsage = new Map<string, number>();

    categoryStats?.forEach(category => {
      // Count categories per user
      const currentCount = userCategoryCounts.get(category.user_id || '') || 0;
      userCategoryCounts.set(category.user_id || '', currentCount + 1);

      // Count category usage
      const currentUsage = categoryUsage.get(category.name) || 0;
      categoryUsage.set(category.name, currentUsage + 1);
    });

    const usersWithCategories = userCategoryCounts.size;
    const totalCategories = categoryStats?.length || 0;
    const averageCategoriesPerUser = usersWithCategories > 0 ? totalCategories / usersWithCategories : 0;

    const mostUsedCategories = Array.from(categoryUsage.entries())
      .map(([name, userCount]) => ({ name, userCount }))
      .sort((a, b) => b.userCount - a.userCount)
      .slice(0, 10);

    return {
      totalUsers: totalUsers || 0,
      usersWithCategories,
      averageCategoriesPerUser: Math.round(averageCategoriesPerUser * 100) / 100,
      mostUsedCategories
    };

  } catch (error) {
    return {
      totalUsers: 0,
      usersWithCategories: 0,
      averageCategoriesPerUser: 0,
      mostUsedCategories: []
    };
  }
};
