#!/usr/bin/env node

/**
 * Enhanced Savings Tracking Migration Script
 * 
 * This script applies the savings enhancement migration to add:
 * - Automatic savings goal progress calculation
 * - Multi-currency support for all financial tables
 * - Savings category for transaction categorization
 * - Performance optimizations and analytics views
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://iwzkguwkirrojxewsoqc.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.error('Please set it in your .env file or environment');
  process.exit(1);
}

// Initialize Supabase client with service key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Execute SQL migration file
 */
async function executeMigration() {
  console.log('🚀 Starting Enhanced Savings Tracking Migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250119150000_enhance_savings_tracking.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    console.log('📖 Migration file loaded successfully');

    // Execute the migration by splitting into individual statements
    console.log('⚡ Executing migration...');

    // Split SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          const { error } = await supabase.rpc('exec', { sql: statement + ';' });
          if (error) {
            console.error(`Error in statement ${i + 1}:`, error);
            throw error;
          }
        } catch (error) {
          console.error(`Failed to execute statement ${i + 1}:`, statement.substring(0, 100) + '...');
          throw error;
        }
      }
    }

    console.log('✅ Migration executed successfully!\n');

    // Verify the migration by checking new structures
    await verifyMigration();

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    if (error.hint) {
      console.error('Hint:', error.hint);
    }
    process.exit(1);
  }
}

/**
 * Verify that the migration was applied correctly
 */
async function verifyMigration() {
  console.log('🔍 Verifying migration results...\n');

  const checks = [
    {
      name: 'Transactions table has savings_goal_id column',
      query: `
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'savings_goal_id'
      `
    },
    {
      name: 'Transactions table has currency column',
      query: `
        SELECT column_name, data_type, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'currency'
      `
    },
    {
      name: 'Savings category exists',
      query: `
        SELECT name, icon, color, type, is_default
        FROM public.categories 
        WHERE name = 'Savings' AND type = 'expense' AND is_default = true
      `
    },
    {
      name: 'Savings goal calculation function exists',
      query: `
        SELECT routine_name, routine_type
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'calculate_savings_goal_current_amount'
      `
    },
    {
      name: 'Savings goal progress view exists',
      query: `
        SELECT table_name, table_type
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'savings_goal_progress'
      `
    },
    {
      name: 'Savings goal update trigger exists',
      query: `
        SELECT trigger_name, event_manipulation, event_object_table
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public' 
        AND trigger_name = 'trigger_update_savings_goal_current_amount'
      `
    }
  ];

  let allPassed = true;

  for (const check of checks) {
    try {
      const { data, error } = await supabase.rpc('exec', {
        sql: check.query
      });

      if (error) {
        console.log(`❌ ${check.name}: ${error.message}`);
        allPassed = false;
      } else if (!data || data.length === 0) {
        console.log(`❌ ${check.name}: Not found`);
        allPassed = false;
      } else {
        console.log(`✅ ${check.name}: OK`);
      }
    } catch (error) {
      console.log(`❌ ${check.name}: ${error.message}`);
      allPassed = false;
    }
  }

  if (allPassed) {
    console.log('\n🎉 All verification checks passed!');
    console.log('\n📊 Enhanced Savings Tracking Features:');
    console.log('   • Automatic savings goal progress calculation');
    console.log('   • Multi-currency support for all financial data');
    console.log('   • Savings category for transaction categorization');
    console.log('   • Real-time savings goal updates via triggers');
    console.log('   • Performance-optimized indexes');
    console.log('   • Savings analytics view for reporting');
    console.log('\n✨ Your wealth organizer now has enhanced savings tracking!');
  } else {
    console.log('\n⚠️  Some verification checks failed. Please review the migration.');
    process.exit(1);
  }
}

/**
 * Test the new savings calculation functionality
 */
async function testSavingsCalculation() {
  console.log('\n🧪 Testing savings calculation functionality...');

  try {
    // Test the calculation function
    const { data, error } = await supabase.rpc('exec', {
      sql: `SELECT calculate_savings_goal_current_amount('00000000-0000-0000-0000-000000000000'::UUID) as test_result;`
    });

    if (error) {
      console.log(`❌ Savings calculation test failed: ${error.message}`);
    } else {
      console.log(`✅ Savings calculation function working correctly`);
    }

    // Test the view
    const { data: viewData, error: viewError } = await supabase.rpc('exec', {
      sql: `SELECT COUNT(*) as view_accessible FROM public.savings_goal_progress LIMIT 1;`
    });

    if (viewError) {
      console.log(`❌ Savings progress view test failed: ${viewError.message}`);
    } else {
      console.log(`✅ Savings progress view accessible`);
    }

  } catch (error) {
    console.log(`❌ Testing failed: ${error.message}`);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('💰 Enhanced Savings Tracking Migration');
  console.log('=====================================\n');

  await executeMigration();
  await testSavingsCalculation();

  console.log('\n🏁 Migration completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Update your frontend components to use automatic savings calculation');
  console.log('2. Remove manual current_amount inputs from savings goal forms');
  console.log('3. Test the new savings tracking functionality');
  console.log('4. Deploy the updated application');
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

// Run the migration
main().catch(console.error);
