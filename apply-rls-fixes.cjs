// Apply RLS policy fixes to resolve authentication issues
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

async function applyRLSFixes() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Read the RLS fix SQL file
    const sqlPath = path.join(__dirname, 'fix-rls-policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🛡️ Applying RLS policy fixes...');
    console.log('='.repeat(60));

    // Execute the SQL
    const result = await client.query(sqlContent);
    
    console.log('✅ RLS policy fixes applied successfully!');
    
    // The result will contain multiple result sets
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
      console.log('\nResults:');
      result.rows.forEach(row => {
        console.log(row);
      });
    }

  } catch (error) {
    console.error('❌ Error applying RLS fixes:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

// Run the RLS fixes
if (require.main === module) {
  applyRLSFixes()
    .then(() => {
      console.log('\n✅ RLS policy fixes completed successfully!');
      console.log('\n💡 Next steps:');
      console.log('1. Test the application with authenticated users');
      console.log('2. Verify savings goals and insights can be created');
      console.log('3. Check that RLS still provides proper security');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ RLS fix failed:', error);
      process.exit(1);
    });
}

module.exports = { applyRLSFixes };
