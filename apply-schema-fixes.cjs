// Direct database connection script to apply critical schema fixes
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection configuration
const DB_CONFIG = {
  host: 'db.iwzkguwkirrojxewsoqc.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Harleycoby*08',
  ssl: {
    rejectUnauthorized: false
  }
};

async function applySchemaFixes() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'apply-critical-schema-fixes.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 Executing critical schema fixes...');
    console.log('='.repeat(60));

    // Execute the SQL
    const result = await client.query(sqlContent);
    
    console.log('✅ Schema fixes applied successfully!');
    console.log('📊 Results:');
    
    // The result will contain multiple result sets, let's process them
    if (Array.isArray(result)) {
      result.forEach((res, index) => {
        if (res.rows && res.rows.length > 0) {
          console.log(`\nResult set ${index + 1}:`);
          res.rows.forEach(row => {
            console.log(row);
          });
        }
      });
    } else if (result.rows && result.rows.length > 0) {
      result.rows.forEach(row => {
        console.log(row);
      });
    }

  } catch (error) {
    console.error('❌ Error applying schema fixes:', error.message);
    console.error('Details:', error);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

async function validateSchemaFixes() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n🔍 Validating schema fixes...');
    await client.connect();

    // Check savings_goals table
    const savingsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'savings_goals' 
        AND column_name IN ('name', 'description', 'target_date')
      ORDER BY column_name;
    `);

    console.log('\n📋 savings_goals table columns:');
    if (savingsCheck.rows.length === 3) {
      console.log('✅ All required columns present:');
      savingsCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('❌ Missing columns:', 3 - savingsCheck.rows.length);
      savingsCheck.rows.forEach(row => {
        console.log(`  ✅ ${row.column_name} (${row.data_type})`);
      });
    }

    // Check financial_insights table
    const insightsCheck = await client.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'financial_insights' 
        AND column_name IN ('content_hash', 'generation_trigger', 'last_generated_at')
      ORDER BY column_name;
    `);

    console.log('\n📋 financial_insights table columns:');
    if (insightsCheck.rows.length === 3) {
      console.log('✅ All required columns present:');
      insightsCheck.rows.forEach(row => {
        console.log(`  - ${row.column_name} (${row.data_type}, nullable: ${row.is_nullable})`);
      });
    } else {
      console.log('❌ Missing columns:', 3 - insightsCheck.rows.length);
      insightsCheck.rows.forEach(row => {
        console.log(`  ✅ ${row.column_name} (${row.data_type})`);
      });
    }

    // Check user_insight_preferences table
    const preferencesCheck = await client.query(`
      SELECT COUNT(*) as column_count
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_insight_preferences';
    `);

    console.log('\n📋 user_insight_preferences table:');
    if (preferencesCheck.rows[0].column_count > 0) {
      console.log(`✅ Table exists with ${preferencesCheck.rows[0].column_count} columns`);
    } else {
      console.log('❌ Table does not exist');
    }

    // Check constraints
    const constraintsCheck = await client.query(`
      SELECT constraint_name, constraint_type
      FROM information_schema.table_constraints 
      WHERE table_schema = 'public' 
        AND table_name = 'savings_goals'
        AND constraint_name LIKE '%target_date%' OR constraint_name LIKE '%target_amount%'
      ORDER BY constraint_name;
    `);

    console.log('\n📋 savings_goals constraints:');
    if (constraintsCheck.rows.length > 0) {
      constraintsCheck.rows.forEach(row => {
        console.log(`  ✅ ${row.constraint_name} (${row.constraint_type})`);
      });
    } else {
      console.log('⚠️  No validation constraints found');
    }

    // Overall validation
    const allValid = 
      savingsCheck.rows.length === 3 && 
      insightsCheck.rows.length === 3 && 
      preferencesCheck.rows[0].column_count > 0;

    console.log('\n🎯 OVERALL VALIDATION RESULT:');
    if (allValid) {
      console.log('✅ ALL CRITICAL SCHEMA FIXES SUCCESSFULLY APPLIED!');
      console.log('✅ The application should now work without 400/404 errors');
    } else {
      console.log('⚠️  Some issues remain - manual intervention may be required');
    }

    return allValid;

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('🚀 APPLYING CRITICAL DATABASE SCHEMA FIXES');
    console.log('='.repeat(60));
    
    // Apply the schema fixes
    await applySchemaFixes();
    
    // Validate the fixes
    const success = await validateSchemaFixes();
    
    console.log('\n💡 NEXT STEPS:');
    if (success) {
      console.log('1. ✅ Test savings goal creation with description field');
      console.log('2. ✅ Test financial insights generation');
      console.log('3. ✅ Test user insight preferences creation');
      console.log('4. ✅ Verify no more 400/404 errors in the application');
    } else {
      console.log('1. 🔧 Review the error messages above');
      console.log('2. 🔄 Re-run this script if needed');
      console.log('3. 🧪 Test critical functionality manually');
    }
    
    console.log('\n🎉 Schema synchronization complete!');
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applySchemaFixes, validateSchemaFixes };
