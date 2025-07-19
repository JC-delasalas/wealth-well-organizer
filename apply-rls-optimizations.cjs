// Apply RLS policy optimizations to fix performance issues
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

async function applyRLSOptimizations() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully');

    // Read the RLS optimization SQL file
    const sqlPath = path.join(__dirname, 'optimize-rls-policies.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('⚡ Applying RLS policy optimizations...');
    console.log('='.repeat(60));

    // Execute the SQL
    const result = await client.query(sqlContent);
    
    console.log('✅ RLS policy optimizations applied successfully!');
    
    // Process and display results
    if (Array.isArray(result)) {
      let validationResults = [];
      
      result.forEach((res, index) => {
        if (res.rows && res.rows.length > 0) {
          res.rows.forEach(row => {
            if (row.check_type) {
              console.log(`\n${row.check_type}`);
            } else if (row.optimization_status) {
              validationResults.push(row);
            } else if (row.result) {
              console.log(`\n${row.result}`);
            } else {
              console.log(row);
            }
          });
        }
      });

      // Display optimization status
      if (validationResults.length > 0) {
        console.log('\n📊 RLS Policy Optimization Status:');
        console.log('='.repeat(50));
        
        const optimized = validationResults.filter(r => r.optimization_status === '✅ OPTIMIZED').length;
        const needsOptimization = validationResults.filter(r => r.optimization_status === '⚠️ NEEDS OPTIMIZATION').length;
        const unknown = validationResults.filter(r => r.optimization_status === '❓ UNKNOWN').length;
        
        console.log(`✅ Optimized policies: ${optimized}`);
        console.log(`⚠️ Needs optimization: ${needsOptimization}`);
        console.log(`❓ Unknown status: ${unknown}`);
        console.log(`📊 Total policies: ${validationResults.length}`);
        
        if (needsOptimization > 0) {
          console.log('\n⚠️ Policies that still need optimization:');
          validationResults
            .filter(r => r.optimization_status === '⚠️ NEEDS OPTIMIZATION')
            .forEach(r => {
              console.log(`  - ${r.tablename}.${r.policyname}`);
            });
        }
        
        if (optimized === validationResults.length) {
          console.log('\n🎉 ALL RLS POLICIES ARE NOW OPTIMIZED!');
        }
      }
      
    } else if (result.rows && result.rows.length > 0) {
      console.log('\nResults:');
      result.rows.forEach(row => {
        console.log(row);
      });
    }

  } catch (error) {
    console.error('❌ Error applying RLS optimizations:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('🔌 Disconnected from database');
  }
}

async function validateOptimizations() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n🔍 Validating RLS optimizations...');
    await client.connect();

    // Check for any remaining unoptimized policies
    const checkQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        CASE 
          WHEN qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%' THEN 'OPTIMIZED'
          WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%' THEN 'NEEDS_OPTIMIZATION'
          ELSE 'UNKNOWN'
        END as status
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
      ORDER BY tablename, policyname;
    `;

    const result = await client.query(checkQuery);
    
    console.log('\n📋 Final Optimization Status:');
    console.log('='.repeat(40));
    
    const policies = result.rows;
    const optimized = policies.filter(p => p.status === 'OPTIMIZED').length;
    const needsWork = policies.filter(p => p.status === 'NEEDS_OPTIMIZATION').length;
    const unknown = policies.filter(p => p.status === 'UNKNOWN').length;
    
    console.log(`✅ Optimized: ${optimized}/${policies.length} policies`);
    console.log(`⚠️ Needs work: ${needsWork}/${policies.length} policies`);
    console.log(`❓ Unknown: ${unknown}/${policies.length} policies`);
    
    if (needsWork === 0) {
      console.log('\n🎉 ALL RLS POLICIES ARE OPTIMIZED!');
      console.log('✅ Database performance should be significantly improved');
      console.log('✅ Supabase linter warnings should be resolved');
    } else {
      console.log('\n⚠️ Some policies still need optimization:');
      policies
        .filter(p => p.status === 'NEEDS_OPTIMIZATION')
        .forEach(p => {
          console.log(`  - ${p.tablename}.${p.policyname}`);
        });
    }

    return needsWork === 0;

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    console.log('⚡ OPTIMIZING RLS POLICIES FOR PERFORMANCE');
    console.log('='.repeat(60));
    console.log('Fixing Supabase linter warnings about auth.uid() re-evaluation');
    
    // Apply the optimizations
    await applyRLSOptimizations();
    
    // Validate the optimizations
    const success = await validateOptimizations();
    
    console.log('\n💡 PERFORMANCE IMPROVEMENTS:');
    if (success) {
      console.log('✅ auth.uid() calls are now cached per query instead of per row');
      console.log('✅ RLS policy evaluation is significantly faster');
      console.log('✅ Database performance improved for large datasets');
      console.log('✅ Supabase linter warnings resolved');
    } else {
      console.log('⚠️ Some optimizations may need manual review');
      console.log('🔧 Check the policies listed above for manual optimization');
    }
    
    console.log('\n📚 REFERENCE:');
    console.log('- Supabase RLS Performance Guide: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select');
    console.log('- Database Linter: https://supabase.com/docs/guides/database/database-linter');
    
    console.log('\n🎉 RLS optimization complete!');
    
  } catch (error) {
    console.error('\n❌ OPTIMIZATION FAILED:', error.message);
    process.exit(1);
  }
}

// Run the optimization
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyRLSOptimizations, validateOptimizations };
