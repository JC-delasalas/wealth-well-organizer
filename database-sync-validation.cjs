// Database synchronization and validation script
// This script connects directly to Supabase and validates/applies schema fixes

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

// Critical columns that must exist
const CRITICAL_COLUMNS = {
  savings_goals: ['name', 'description', 'target_date'],
  financial_insights: ['content_hash', 'generation_trigger', 'last_generated_at'],
  user_insight_preferences: ['id', 'user_id', 'insight_frequency', 'enabled_insight_types']
};

class DatabaseValidator {
  constructor() {
    this.client = new Client(DB_CONFIG);
    this.connected = false;
  }

  async connect() {
    try {
      await this.client.connect();
      this.connected = true;
      console.log('✅ Connected to Supabase database');
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to database:', error.message);
      return false;
    }
  }

  async disconnect() {
    if (this.connected) {
      await this.client.end();
      this.connected = false;
      console.log('🔌 Disconnected from database');
    }
  }

  async validateTableSchema(tableName) {
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
      // Check if table exists
      const tableExistsQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;
      
      const tableResult = await this.client.query(tableExistsQuery, [tableName]);
      result.exists = tableResult.rows[0].exists;

      if (!result.exists) {
        console.log(`❌ Table '${tableName}' does not exist`);
        result.missingColumns = EXPECTED_SCHEMAS[tableName] || [];
        result.missingCriticalColumns = CRITICAL_COLUMNS[tableName] || [];
        return result;
      }

      console.log(`✅ Table '${tableName}' exists`);

      // Get table columns
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `;

      const columnsResult = await this.client.query(columnsQuery, [tableName]);
      result.columns = columnsResult.rows.map(row => row.column_name);

      console.log(`📋 Found columns: ${result.columns.join(', ')}`);

      // Check for missing columns
      const expectedColumns = EXPECTED_SCHEMAS[tableName] || [];
      result.missingColumns = expectedColumns.filter(col => !result.columns.includes(col));
      
      const criticalColumns = CRITICAL_COLUMNS[tableName] || [];
      result.missingCriticalColumns = criticalColumns.filter(col => !result.columns.includes(col));

      if (result.missingColumns.length > 0) {
        console.log(`⚠️  Missing columns: ${result.missingColumns.join(', ')}`);
      }
      
      if (result.missingCriticalColumns.length > 0) {
        console.log(`🚨 Missing CRITICAL columns: ${result.missingCriticalColumns.join(', ')}`);
      }

      if (result.missingColumns.length === 0) {
        console.log(`✅ All expected columns present in ${tableName}`);
      }

    } catch (error) {
      result.errors.push(`❌ Error validating table '${tableName}': ${error.message}`);
      console.error(`❌ Error validating table '${tableName}':`, error.message);
    }

    return result;
  }

  async checkConstraints() {
    console.log('\n🛡️  Checking database constraints...');
    
    try {
      const constraintsQuery = `
        SELECT 
          tc.table_name,
          tc.constraint_name,
          tc.constraint_type,
          cc.check_clause
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.check_constraints cc 
          ON tc.constraint_name = cc.constraint_name
        WHERE tc.table_schema = 'public' 
          AND tc.table_name IN ('savings_goals', 'financial_insights', 'user_insight_preferences')
        ORDER BY tc.table_name, tc.constraint_type;
      `;

      const result = await this.client.query(constraintsQuery);
      
      console.log('📋 Found constraints:');
      for (const row of result.rows) {
        const type = row.constraint_type === 'CHECK' ? '✓' : 
                    row.constraint_type === 'PRIMARY KEY' ? '🔑' :
                    row.constraint_type === 'FOREIGN KEY' ? '🔗' : '📋';
        console.log(`  ${type} ${row.table_name}.${row.constraint_name} (${row.constraint_type})`);
        if (row.check_clause) {
          console.log(`    └─ ${row.check_clause}`);
        }
      }

      return result.rows;
    } catch (error) {
      console.error('❌ Error checking constraints:', error.message);
      return [];
    }
  }

  async checkIndexes() {
    console.log('\n📊 Checking database indexes...');
    
    try {
      const indexQuery = `
        SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public' 
          AND tablename IN ('financial_insights', 'user_insight_preferences')
        ORDER BY tablename, indexname;
      `;

      const result = await this.client.query(indexQuery);
      
      console.log('📋 Found indexes:');
      for (const row of result.rows) {
        const purpose = row.indexname.includes('content_hash') ? '🔍 CONTENT HASH' :
                       row.indexname.includes('user_type') ? '👤 USER TYPE' :
                       row.indexname.includes('periods') ? '📅 PERIODS' :
                       row.indexname.includes('pkey') ? '🔑 PRIMARY KEY' : '📋 OTHER';
        console.log(`  ${purpose} ${row.tablename}.${row.indexname}`);
      }

      return result.rows;
    } catch (error) {
      console.error('❌ Error checking indexes:', error.message);
      return [];
    }
  }

  async applyMigration() {
    console.log('\n🔧 Applying critical schema migration...');
    
    try {
      // Read the migration file
      const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20250119130000_fix_critical_schema_issues.sql');
      
      if (!fs.existsSync(migrationPath)) {
        console.error('❌ Migration file not found:', migrationPath);
        return false;
      }

      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      console.log('📄 Migration file loaded, executing...');

      // Execute the migration
      await this.client.query(migrationSQL);
      console.log('✅ Migration executed successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
  }

  async performComprehensiveValidation() {
    console.log('🏥 COMPREHENSIVE DATABASE SCHEMA VALIDATION');
    console.log('='.repeat(60));

    if (!this.connected) {
      console.log('❌ Not connected to database');
      return false;
    }

    // Validate each critical table
    const tableResults = [];
    let allTablesValid = true;
    let criticalIssuesFound = false;

    for (const tableName of Object.keys(EXPECTED_SCHEMAS)) {
      const result = await this.validateTableSchema(tableName);
      tableResults.push(result);

      if (!result.exists) {
        allTablesValid = false;
        criticalIssuesFound = true;
      } else if (result.missingCriticalColumns.length > 0) {
        criticalIssuesFound = true;
      }
    }

    // Check constraints and indexes
    const constraints = await this.checkConstraints();
    const indexes = await this.checkIndexes();

    // Generate summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('='.repeat(40));

    console.log('\n📋 Table Status:');
    for (const result of tableResults) {
      const status = result.exists ? '✅' : '❌';
      const criticalStatus = result.missingCriticalColumns.length === 0 ? '✅' : '🚨';
      console.log(`  ${status} ${result.table} (Critical columns: ${criticalStatus})`);
      
      if (result.missingCriticalColumns.length > 0) {
        console.log(`    🚨 Missing critical: ${result.missingCriticalColumns.join(', ')}`);
      }
    }

    // Overall status
    console.log('\n🎯 OVERALL STATUS:');
    if (!criticalIssuesFound) {
      console.log('✅ SCHEMA VALIDATION PASSED - All critical components are present');
      console.log('✅ The migration has been applied successfully');
    } else {
      console.log('⚠️  SCHEMA VALIDATION FAILED - Critical issues found');
      console.log('🔧 The migration needs to be applied');
    }

    return {
      allValid: !criticalIssuesFound,
      tableResults,
      constraints,
      indexes,
      criticalIssuesFound
    };
  }
}

// Main execution function
async function main() {
  const validator = new DatabaseValidator();
  
  try {
    // Connect to database
    const connected = await validator.connect();
    if (!connected) {
      process.exit(1);
    }

    // Perform initial validation
    const initialValidation = await validator.performComprehensiveValidation();

    if (initialValidation.criticalIssuesFound) {
      console.log('\n🔧 Critical issues found. Applying migration...');
      
      const migrationSuccess = await validator.applyMigration();
      
      if (migrationSuccess) {
        console.log('\n🔄 Re-validating after migration...');
        const postMigrationValidation = await validator.performComprehensiveValidation();
        
        if (!postMigrationValidation.criticalIssuesFound) {
          console.log('\n🎉 SUCCESS: All critical schema issues have been resolved!');
        } else {
          console.log('\n⚠️  Some issues remain after migration. Manual intervention may be required.');
        }
      }
    } else {
      console.log('\n🎉 SUCCESS: Database schema is already up to date!');
    }

    // Recommendations
    console.log('\n💡 NEXT STEPS:');
    if (!initialValidation.criticalIssuesFound) {
      console.log('1. ✅ Test savings goal creation with description field');
      console.log('2. ✅ Test financial insights generation with duplicate prevention');
      console.log('3. ✅ Test user insight preferences creation');
      console.log('4. ✅ Verify date validation prevents past dates');
    } else {
      console.log('1. 🔧 Check migration logs for any errors');
      console.log('2. 🔄 Re-run this validation script');
      console.log('3. 🧪 Test critical functionality after fixes');
    }

  } catch (error) {
    console.error('❌ Validation failed:', error);
  } finally {
    await validator.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { DatabaseValidator, main };
