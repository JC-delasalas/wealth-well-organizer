// Standalone database schema validation script
// Run this script to validate the critical database schema fixes

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - replace with your actual values
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Critical columns that must exist for basic functionality
const CRITICAL_COLUMNS = {
  savings_goals: ['id', 'user_id', 'target_amount', 'name', 'target_date'],
  financial_insights: ['id', 'user_id', 'insight_type', 'title', 'content'],
  user_insight_preferences: ['id', 'user_id', 'insight_frequency', 'enabled_insight_types']
};

async function validateTableSchema(tableName) {
  console.log(`\n🔍 Validating ${tableName} table...`);
  
  const result = {
    table: tableName,
    exists: false,
    columns: [],
    missingColumns: [],
    missingCriticalColumns: [],
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
        result.errors.push(`❌ Table '${tableName}' does not exist`);
        result.missingColumns = EXPECTED_SCHEMAS[tableName] || [];
        result.missingCriticalColumns = CRITICAL_COLUMNS[tableName] || [];
        return result;
      } else {
        result.errors.push(`❌ Error accessing table '${tableName}': ${error.message}`);
        return result;
      }
    }

    result.exists = true;
    console.log(`✅ Table '${tableName}' exists`);

    // Infer columns from sample data
    if (data && data.length > 0) {
      result.columns = Object.keys(data[0]);
    } else {
      // Try to get columns from an empty result
      const { data: emptyData, error: emptyError } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (!emptyError && emptyData) {
        // This won't work for empty results, so we'll use a different approach
        result.columns = [];
      }
    }

    // Check for missing columns
    const expectedColumns = EXPECTED_SCHEMAS[tableName] || [];
    result.missingColumns = expectedColumns.filter(col => !result.columns.includes(col));
    
    const criticalColumns = CRITICAL_COLUMNS[tableName] || [];
    result.missingCriticalColumns = criticalColumns.filter(col => !result.columns.includes(col));

    // Report column status
    if (result.columns.length > 0) {
      console.log(`📋 Found columns: ${result.columns.join(', ')}`);
    }
    
    if (result.missingColumns.length > 0) {
      console.log(`⚠️  Missing columns: ${result.missingColumns.join(', ')}`);
    }
    
    if (result.missingCriticalColumns.length > 0) {
      console.log(`🚨 Missing CRITICAL columns: ${result.missingCriticalColumns.join(', ')}`);
    }

  } catch (error) {
    result.errors.push(`❌ Unexpected error validating table '${tableName}': ${error.message}`);
  }

  return result;
}

async function testDatabaseConnectivity() {
  console.log('\n🔌 Testing database connectivity...');
  
  const result = {
    connected: false,
    authenticated: false,
    errors: []
  };

  try {
    // Test basic connectivity with a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === '42P01') {
        result.errors.push('❌ Profiles table does not exist - basic schema missing');
      } else {
        result.errors.push(`❌ Database query error: ${error.message}`);
      }
      return result;
    }

    result.connected = true;
    console.log('✅ Database connection successful');

    // Test authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      result.errors.push(`⚠️  Authentication check failed: ${authError.message}`);
    } else {
      result.authenticated = !!user;
      if (user) {
        console.log(`✅ User authenticated: ${user.id}`);
      } else {
        console.log('ℹ️  No authenticated user (this is normal for schema validation)');
      }
    }

  } catch (error) {
    result.errors.push(`❌ Connection test failed: ${error.message}`);
  }

  return result;
}

async function testConstraints() {
  console.log('\n🛡️  Testing database constraints...');
  
  const results = [];

  try {
    // Test savings_goals constraints if table exists
    const { data: savingsData, error: savingsError } = await supabase
      .from('savings_goals')
      .select('id')
      .limit(1);

    if (!savingsError) {
      console.log('✅ Savings goals table accessible for constraint testing');
      
      // Note: We can't easily test constraints without inserting data
      // This would require authentication and could affect real data
      console.log('ℹ️  Constraint testing requires authenticated user and test data');
      results.push('Savings goals table exists - constraints need manual testing');
    }

  } catch (error) {
    results.push(`❌ Constraint testing failed: ${error.message}`);
  }

  return results;
}

async function performComprehensiveValidation() {
  console.log('🏥 COMPREHENSIVE DATABASE SCHEMA VALIDATION');
  console.log('='.repeat(50));

  // Test connectivity
  const connectivity = await testDatabaseConnectivity();
  
  if (!connectivity.connected) {
    console.log('\n❌ VALIDATION FAILED: Cannot connect to database');
    console.log('Please check your Supabase configuration and try again.');
    return;
  }

  // Validate each critical table
  const tableResults = [];
  let allTablesValid = true;
  let criticalIssuesFound = false;

  for (const tableName of Object.keys(EXPECTED_SCHEMAS)) {
    const result = await validateTableSchema(tableName);
    tableResults.push(result);

    if (!result.exists) {
      allTablesValid = false;
      criticalIssuesFound = true;
    } else if (result.missingCriticalColumns.length > 0) {
      criticalIssuesFound = true;
    }
  }

  // Test constraints
  const constraintResults = await testConstraints();

  // Generate summary
  console.log('\n📊 VALIDATION SUMMARY');
  console.log('='.repeat(30));

  console.log(`\n🔌 Database Connectivity: ${connectivity.connected ? '✅ Connected' : '❌ Failed'}`);
  console.log(`👤 Authentication: ${connectivity.authenticated ? '✅ Authenticated' : 'ℹ️  No user'}`);

  console.log('\n📋 Table Status:');
  for (const result of tableResults) {
    const status = result.exists ? '✅' : '❌';
    const criticalStatus = result.missingCriticalColumns.length === 0 ? '✅' : '🚨';
    console.log(`  ${status} ${result.table} (Critical columns: ${criticalStatus})`);
    
    if (result.missingCriticalColumns.length > 0) {
      console.log(`    🚨 Missing critical: ${result.missingCriticalColumns.join(', ')}`);
    }
    if (result.missingColumns.length > 0 && result.missingColumns.length !== result.missingCriticalColumns.length) {
      const nonCriticalMissing = result.missingColumns.filter(col => 
        !result.missingCriticalColumns.includes(col)
      );
      if (nonCriticalMissing.length > 0) {
        console.log(`    ⚠️  Missing optional: ${nonCriticalMissing.join(', ')}`);
      }
    }
  }

  // Overall status
  console.log('\n🎯 OVERALL STATUS:');
  if (connectivity.connected && !criticalIssuesFound) {
    console.log('✅ SCHEMA VALIDATION PASSED - All critical components are present');
    console.log('✅ The migration appears to have been applied successfully');
  } else if (connectivity.connected && criticalIssuesFound) {
    console.log('⚠️  SCHEMA VALIDATION PARTIAL - Some issues found');
    console.log('🔧 The migration may need to be applied or re-run');
  } else {
    console.log('❌ SCHEMA VALIDATION FAILED - Cannot validate due to connectivity issues');
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  if (criticalIssuesFound) {
    console.log('1. Apply the migration: supabase db push');
    console.log('2. Or manually run: supabase/migrations/20250119130000_fix_critical_schema_issues.sql');
    console.log('3. Re-run this validation script after applying migrations');
  } else {
    console.log('1. Schema appears healthy - test application functionality');
    console.log('2. Create test savings goals and financial insights');
    console.log('3. Verify user preferences can be created');
  }

  return {
    connectivity,
    tableResults,
    constraintResults,
    allValid: connectivity.connected && !criticalIssuesFound
  };
}

// Run the validation
if (require.main === module) {
  performComprehensiveValidation()
    .then(() => {
      console.log('\n✅ Validation complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Validation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  performComprehensiveValidation,
  validateTableSchema,
  testDatabaseConnectivity
};
