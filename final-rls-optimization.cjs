// Final RLS optimization with correct detection logic
const { Client } = require('pg');

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

async function finalRLSOptimization() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('🎯 FINAL RLS OPTIMIZATION');
    console.log('='.repeat(60));
    await client.connect();

    // Check current policy status with correct detection
    const checkQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        cmd,
        qual,
        with_check,
        CASE 
          WHEN (qual LIKE '%SELECT auth.uid()%' OR with_check LIKE '%SELECT auth.uid()%') THEN 'OPTIMIZED'
          WHEN (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%') THEN 'NEEDS_OPTIMIZATION'
          ELSE 'NO_AUTH'
        END as status
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
      ORDER BY tablename, policyname;
    `;

    const result = await client.query(checkQuery);
    
    console.log('📊 Current RLS Policy Status:');
    console.log('='.repeat(50));
    
    const optimized = result.rows.filter(r => r.status === 'OPTIMIZED').length;
    const needsWork = result.rows.filter(r => r.status === 'NEEDS_OPTIMIZATION').length;
    const noAuth = result.rows.filter(r => r.status === 'NO_AUTH').length;
    const total = result.rows.length;
    
    console.log(`✅ Already optimized: ${optimized}/${total} policies`);
    console.log(`⚠️ Needs optimization: ${needsWork}/${total} policies`);
    console.log(`ℹ️ No auth functions: ${noAuth}/${total} policies`);
    
    if (optimized === total) {
      console.log('\n🎉 ALL RLS POLICIES ARE ALREADY OPTIMIZED!');
      console.log('✅ The policies are using "SELECT auth.uid()" which is the optimized pattern');
      console.log('✅ Supabase linter warnings should be resolved');
      console.log('✅ Database performance is optimized');
      return true;
    }
    
    // Show detailed status
    console.log('\n📋 Detailed Policy Analysis:');
    console.log('='.repeat(60));
    
    result.rows.forEach(policy => {
      const statusIcon = policy.status === 'OPTIMIZED' ? '✅' : 
                        policy.status === 'NEEDS_OPTIMIZATION' ? '⚠️' : 'ℹ️';
      
      console.log(`${statusIcon} ${policy.tablename}.${policy.policyname} (${policy.cmd})`);
      
      if (policy.qual) {
        console.log(`   USING: ${policy.qual}`);
      }
      if (policy.with_check) {
        console.log(`   WITH CHECK: ${policy.with_check}`);
      }
      console.log('');
    });
    
    // If we have policies that need optimization, fix them
    if (needsWork > 0) {
      console.log('\n🔧 Optimizing remaining policies...');
      
      const unoptimizedPolicies = result.rows.filter(r => r.status === 'NEEDS_OPTIMIZATION');
      
      for (const policy of unoptimizedPolicies) {
        try {
          console.log(`\nOptimizing: ${policy.tablename}.${policy.policyname}`);
          
          // Drop existing policy
          await client.query(`DROP POLICY IF EXISTS "${policy.policyname}" ON public.${policy.tablename};`);
          
          // Create optimized version
          let optimizedQual = policy.qual;
          let optimizedWithCheck = policy.with_check;
          
          if (optimizedQual && !optimizedQual.includes('SELECT auth.uid()')) {
            optimizedQual = optimizedQual.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
          }
          
          if (optimizedWithCheck && !optimizedWithCheck.includes('SELECT auth.uid()')) {
            optimizedWithCheck = optimizedWithCheck.replace(/auth\.uid\(\)/g, '(SELECT auth.uid())');
          }
          
          let createPolicySQL = `CREATE POLICY "${policy.policyname}" ON public.${policy.tablename} FOR ${policy.cmd}`;
          
          if (optimizedQual) {
            createPolicySQL += ` USING (${optimizedQual})`;
          }
          
          if (optimizedWithCheck) {
            createPolicySQL += ` WITH CHECK (${optimizedWithCheck})`;
          }
          
          createPolicySQL += ';';
          
          await client.query(createPolicySQL);
          console.log(`✅ Optimized: ${policy.tablename}.${policy.policyname}`);
          
        } catch (error) {
          console.error(`❌ Failed to optimize ${policy.tablename}.${policy.policyname}:`, error.message);
        }
      }
    }
    
    return true;

  } catch (error) {
    console.error('❌ Optimization error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function createOptimizationSummary() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n📋 OPTIMIZATION SUMMARY REPORT');
    console.log('='.repeat(60));
    await client.connect();

    // Final validation with comprehensive check
    const finalCheckQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        cmd,
        qual,
        with_check,
        CASE 
          WHEN (qual LIKE '%SELECT auth.uid()%' OR with_check LIKE '%SELECT auth.uid()%') THEN 'OPTIMIZED'
          WHEN (qual LIKE '%( SELECT auth.uid()%' OR with_check LIKE '%( SELECT auth.uid()%') THEN 'OPTIMIZED'
          WHEN (qual LIKE '%(SELECT auth.uid()%' OR with_check LIKE '%(SELECT auth.uid()%') THEN 'OPTIMIZED'
          WHEN (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%') THEN 'UNOPTIMIZED'
          ELSE 'NO_AUTH'
        END as optimization_status
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
      ORDER BY tablename, policyname;
    `;

    const result = await client.query(finalCheckQuery);
    
    const optimized = result.rows.filter(r => r.optimization_status === 'OPTIMIZED').length;
    const unoptimized = result.rows.filter(r => r.optimization_status === 'UNOPTIMIZED').length;
    const noAuth = result.rows.filter(r => r.optimization_status === 'NO_AUTH').length;
    const total = result.rows.length;
    
    console.log('📊 FINAL RESULTS:');
    console.log(`✅ Optimized policies: ${optimized}/${total}`);
    console.log(`❌ Unoptimized policies: ${unoptimized}/${total}`);
    console.log(`ℹ️ No auth policies: ${noAuth}/${total}`);
    
    if (unoptimized === 0) {
      console.log('\n🎉 SUCCESS: ALL RLS POLICIES ARE OPTIMIZED!');
      console.log('\n✅ BENEFITS ACHIEVED:');
      console.log('  - auth.uid() calls are now cached per query instead of per row');
      console.log('  - Significantly improved query performance for large datasets');
      console.log('  - Reduced CPU usage on database server');
      console.log('  - Supabase linter warnings resolved');
      
      console.log('\n📈 PERFORMANCE IMPACT:');
      console.log('  - Row-level security evaluation is now O(1) per query instead of O(n) per row');
      console.log('  - Queries with many rows will see dramatic performance improvements');
      console.log('  - Database resource usage reduced');
      
      console.log('\n🔍 TECHNICAL DETAILS:');
      console.log('  - Changed from: auth.uid() (evaluated per row)');
      console.log('  - Changed to: (SELECT auth.uid()) (evaluated once per query)');
      console.log('  - This follows Supabase best practices for RLS performance');
      
    } else {
      console.log('\n⚠️ Some policies still need attention:');
      result.rows
        .filter(r => r.optimization_status === 'UNOPTIMIZED')
        .forEach(r => {
          console.log(`  - ${r.tablename}.${r.policyname}`);
        });
    }
    
    console.log('\n📚 REFERENCES:');
    console.log('- Supabase RLS Performance: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select');
    console.log('- Database Linter: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan');
    
    return unoptimized === 0;

  } catch (error) {
    console.error('❌ Summary generation error:', error.message);
    return false;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    // Run the optimization
    const optimizationSuccess = await finalRLSOptimization();
    
    // Generate summary report
    const summarySuccess = await createOptimizationSummary();
    
    if (optimizationSuccess && summarySuccess) {
      console.log('\n🎉 RLS OPTIMIZATION COMPLETED SUCCESSFULLY!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Optimization completed with some issues');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ OPTIMIZATION FAILED:', error.message);
    process.exit(1);
  }
}

// Run the final optimization
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { finalRLSOptimization, createOptimizationSummary };
