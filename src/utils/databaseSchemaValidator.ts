// Database schema validation utility to diagnose critical schema issues

import { supabase } from '@/integrations/supabase/client';

interface SchemaValidationResult {
  table: string;
  exists: boolean;
  columns: string[];
  missingColumns: string[];
  errors: string[];
}

interface ValidationSummary {
  allValid: boolean;
  results: SchemaValidationResult[];
  criticalIssues: string[];
  recommendations: string[];
}

// Expected schema definitions
const EXPECTED_SCHEMAS = {
  savings_goals: [
    'id', 'user_id', 'target_amount', 'current_amount', 
    'savings_percentage_threshold', 'salary_date_1', 'salary_date_2',
    'name', 'description', 'target_date', 'created_at', 'updated_at'
  ],
  financial_insights: [
    'id', 'user_id', 'insight_type', 'title', 'content', 'priority',
    'period_start', 'period_end', 'is_read', 'created_at',
    'content_hash', 'generation_trigger', 'last_generated_at'
  ],
  user_insight_preferences: [
    'id', 'user_id', 'insight_frequency', 'enabled_insight_types',
    'preferred_delivery_time', 'last_insight_generation', 'next_generation_due',
    'timezone', 'created_at', 'updated_at'
  ]
};

/**
 * Validate a single table schema
 */
const validateTableSchema = async (tableName: string): Promise<SchemaValidationResult> => {
  const result: SchemaValidationResult = {
    table: tableName,
    exists: false,
    columns: [],
    missingColumns: [],
    errors: []
  };

  try {
    // Check if table exists by trying to select from it
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        result.errors.push(`Table '${tableName}' does not exist`);
        result.missingColumns = EXPECTED_SCHEMAS[tableName as keyof typeof EXPECTED_SCHEMAS] || [];
        return result;
      } else {
        result.errors.push(`Error accessing table '${tableName}': ${error.message}`);
        return result;
      }
    }

    result.exists = true;

    // Get table column information
    const { data: columnData, error: columnError } = await supabase.rpc('get_table_columns', {
      table_name: tableName
    });

    if (columnError) {
      // Fallback: try to infer columns from a sample query
      try {
        const { data: sampleData } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)
          .single();

        if (sampleData) {
          result.columns = Object.keys(sampleData);
        }
      } catch (fallbackError) {
        result.errors.push(`Could not determine columns for table '${tableName}'`);
      }
    } else if (columnData) {
      result.columns = columnData.map((col: any) => col.column_name);
    }

    // Check for missing columns
    const expectedColumns = EXPECTED_SCHEMAS[tableName as keyof typeof EXPECTED_SCHEMAS] || [];
    result.missingColumns = expectedColumns.filter(col => !result.columns.includes(col));

  } catch (error) {
    result.errors.push(`Unexpected error validating table '${tableName}': ${error}`);
  }

  return result;
};

/**
 * Validate all critical database schemas
 */
export const validateDatabaseSchema = async (): Promise<ValidationSummary> => {
  console.log('🔍 Starting database schema validation...');

  const results: SchemaValidationResult[] = [];
  const criticalIssues: string[] = [];
  const recommendations: string[] = [];

  // Validate each critical table
  for (const tableName of Object.keys(EXPECTED_SCHEMAS)) {
    const result = await validateTableSchema(tableName);
    results.push(result);

    // Analyze results for critical issues
    if (!result.exists) {
      criticalIssues.push(`Missing table: ${tableName}`);
      recommendations.push(`Run migration to create ${tableName} table`);
    } else if (result.missingColumns.length > 0) {
      const criticalColumns = getCriticalColumns(tableName);
      const missingCritical = result.missingColumns.filter(col => criticalColumns.includes(col));
      
      if (missingCritical.length > 0) {
        criticalIssues.push(`Missing critical columns in ${tableName}: ${missingCritical.join(', ')}`);
        recommendations.push(`Run migration to add missing columns to ${tableName}`);
      }
    }

    if (result.errors.length > 0) {
      criticalIssues.push(...result.errors);
    }
  }

  const allValid = criticalIssues.length === 0;

  // Add general recommendations
  if (!allValid) {
    recommendations.push('Run the latest database migrations');
    recommendations.push('Check Supabase dashboard for migration status');
    recommendations.push('Verify RLS policies are properly configured');
  }

  const summary: ValidationSummary = {
    allValid,
    results,
    criticalIssues,
    recommendations
  };

  console.log('✅ Database schema validation completed:', summary);
  return summary;
};

/**
 * Get critical columns for a table (columns that are essential for basic functionality)
 */
const getCriticalColumns = (tableName: string): string[] => {
  const criticalColumns: Record<string, string[]> = {
    savings_goals: ['id', 'user_id', 'target_amount', 'name', 'target_date'],
    financial_insights: ['id', 'user_id', 'insight_type', 'title', 'content'],
    user_insight_preferences: ['id', 'user_id', 'insight_frequency', 'enabled_insight_types']
  };

  return criticalColumns[tableName] || [];
};

/**
 * Check if a specific table and column exist
 */
export const checkTableColumn = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const result = await validateTableSchema(tableName);
    return result.exists && result.columns.includes(columnName);
  } catch (error) {
    console.error(`Error checking ${tableName}.${columnName}:`, error);
    return false;
  }
};

/**
 * Generate a migration script based on validation results
 */
export const generateMigrationScript = (validationResults: ValidationSummary): string => {
  let script = '-- Auto-generated migration script based on schema validation\n\n';

  for (const result of validationResults.results) {
    if (!result.exists) {
      script += `-- Create missing table: ${result.table}\n`;
      script += `-- Please run the appropriate migration file for ${result.table}\n\n`;
    } else if (result.missingColumns.length > 0) {
      script += `-- Add missing columns to ${result.table}\n`;
      for (const column of result.missingColumns) {
        script += `ALTER TABLE public.${result.table} ADD COLUMN IF NOT EXISTS ${column} TEXT;\n`;
      }
      script += '\n';
    }
  }

  return script;
};

/**
 * Test database connectivity and basic functionality
 */
export const testDatabaseConnectivity = async (): Promise<{
  connected: boolean;
  authenticated: boolean;
  errors: string[];
}> => {
  const result = {
    connected: false,
    authenticated: false,
    errors: [] as string[]
  };

  try {
    // Test basic connectivity
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      result.errors.push(`Authentication error: ${authError.message}`);
      return result;
    }

    result.authenticated = !!user;

    // Test database query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      result.errors.push(`Database query error: ${error.message}`);
      return result;
    }

    result.connected = true;

  } catch (error) {
    result.errors.push(`Connection test failed: ${error}`);
  }

  return result;
};

/**
 * Comprehensive database health check
 */
export const performDatabaseHealthCheck = async (): Promise<{
  healthy: boolean;
  connectivity: any;
  schema: ValidationSummary;
  recommendations: string[];
}> => {
  console.log('🏥 Performing comprehensive database health check...');

  const connectivity = await testDatabaseConnectivity();
  const schema = await validateDatabaseSchema();

  const recommendations: string[] = [];

  if (!connectivity.connected) {
    recommendations.push('Check database connection and credentials');
  }

  if (!connectivity.authenticated) {
    recommendations.push('Ensure user is properly authenticated');
  }

  recommendations.push(...schema.recommendations);

  const healthy = connectivity.connected && connectivity.authenticated && schema.allValid;

  return {
    healthy,
    connectivity,
    schema,
    recommendations
  };
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).validateDatabaseSchema = validateDatabaseSchema;
  (window as any).performDatabaseHealthCheck = performDatabaseHealthCheck;
  (window as any).checkTableColumn = checkTableColumn;
}
