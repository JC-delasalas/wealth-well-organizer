// Apply multi-currency and tax system migration
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

async function applyMultiCurrencyMigration() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('🌍 APPLYING MULTI-CURRENCY AND TAX SYSTEM MIGRATION');
    console.log('='.repeat(70));
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Read the migration SQL file
    const sqlPath = path.join(__dirname, 'supabase/migrations/20250119140000_add_multicurrency_and_tax_system.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📊 Applying multi-currency and tax system migration...');
    console.log('This will add:');
    console.log('  - Country and currency support to user profiles');
    console.log('  - Philippine tax calculation system');
    console.log('  - Currency exchange rate management');
    console.log('  - Tax brackets and calculation tables');
    
    // Execute the migration
    const result = await client.query(sqlContent);
    
    console.log('✅ Migration applied successfully!');
    
    // Process and display results
    if (Array.isArray(result)) {
      result.forEach((res, index) => {
        if (res.rows && res.rows.length > 0) {
          res.rows.forEach(row => {
            if (row.status) {
              console.log(`\n${row.status}`);
            } else if (row.info) {
              console.log(`\n${row.info}`);
              console.log(row);
            } else if (row.result) {
              console.log(`\n${row.result}`);
            } else {
              console.log(row);
            }
          });
        }
      });
    } else if (result.rows && result.rows.length > 0) {
      console.log('\nMigration Results:');
      result.rows.forEach(row => {
        console.log(row);
      });
    }

  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    
    // Provide specific error guidance
    if (error.message.includes('already exists')) {
      console.log('\n💡 Some tables/columns already exist - this is normal for re-runs');
    } else if (error.message.includes('permission denied')) {
      console.log('\n🔒 Permission error - check database credentials');
    } else {
      console.log('\n🔧 Check the migration SQL for syntax errors');
    }
    
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

async function validateMigration() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n🔍 VALIDATING MIGRATION RESULTS');
    console.log('='.repeat(50));
    await client.connect();

    // Check if new columns were added to profiles
    const profileColumns = await client.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name IN ('country', 'currency', 'locale', 'timezone')
      ORDER BY column_name;
    `);

    console.log('\n📋 New Profile Columns:');
    if (profileColumns.rows.length > 0) {
      profileColumns.rows.forEach(col => {
        console.log(`  ✅ ${col.column_name} (${col.data_type}) - Default: ${col.column_default || 'None'}`);
      });
    } else {
      console.log('  ❌ No new columns found in profiles table');
    }

    // Check new tables
    const newTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_name IN ('supported_currencies', 'countries', 'tax_calculations', 'ph_tax_brackets', 'currency_exchange_rates')
      ORDER BY table_name;
    `);

    console.log('\n🗄️ New Tables Created:');
    if (newTables.rows.length > 0) {
      newTables.rows.forEach(table => {
        console.log(`  ✅ ${table.table_name}`);
      });
    } else {
      console.log('  ❌ No new tables found');
    }

    // Check sample data
    const currencies = await client.query('SELECT code, name, symbol FROM public.supported_currencies LIMIT 5');
    console.log('\n💰 Sample Currencies:');
    currencies.rows.forEach(curr => {
      console.log(`  ${curr.code} - ${curr.name} (${curr.symbol})`);
    });

    const countries = await client.query('SELECT code, name, default_currency FROM public.countries LIMIT 5');
    console.log('\n🌍 Sample Countries:');
    countries.rows.forEach(country => {
      console.log(`  ${country.code} - ${country.name} (${country.default_currency})`);
    });

    const taxBrackets = await client.query(`
      SELECT bracket_order, min_income, max_income, tax_rate 
      FROM public.ph_tax_brackets 
      WHERE tax_year = 2024 
      ORDER BY bracket_order
    `);
    console.log('\n📊 2024 Philippine Tax Brackets:');
    taxBrackets.rows.forEach(bracket => {
      const maxIncome = bracket.max_income ? `₱${bracket.max_income.toLocaleString()}` : 'and above';
      const rate = (bracket.tax_rate * 100).toFixed(1);
      console.log(`  Bracket ${bracket.bracket_order}: ₱${bracket.min_income.toLocaleString()} - ${maxIncome} (${rate}%)`);
    });

    // Check RLS policies
    const policies = await client.query(`
      SELECT tablename, policyname, cmd
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('tax_calculations', 'supported_currencies', 'countries', 'ph_tax_brackets', 'currency_exchange_rates')
      ORDER BY tablename, policyname;
    `);

    console.log('\n🛡️ RLS Policies Created:');
    if (policies.rows.length > 0) {
      policies.rows.forEach(policy => {
        console.log(`  ✅ ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      });
    } else {
      console.log('  ⚠️ No RLS policies found for new tables');
    }

    return true;

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    // Apply the migration
    await applyMultiCurrencyMigration();
    
    // Validate the migration
    const validationSuccess = await validateMigration();
    
    if (validationSuccess) {
      console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('\n✅ FEATURES NOW AVAILABLE:');
      console.log('  - Multi-currency support (PHP, USD, EUR, etc.)');
      console.log('  - Country-based currency selection');
      console.log('  - Philippine tax calculation system');
      console.log('  - BIR tax brackets (2024 TRAIN Law rates)');
      console.log('  - Currency exchange rate management');
      console.log('  - Tax calculation storage and history');
      
      console.log('\n💡 NEXT STEPS:');
      console.log('  1. Update user registration to include country/currency selection');
      console.log('  2. Implement currency formatting utilities');
      console.log('  3. Create Philippine tax calculator components');
      console.log('  4. Update existing financial components for multi-currency');
      
    } else {
      console.log('\n⚠️ Migration completed with some validation issues');
    }
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyMultiCurrencyMigration, validateMigration };
