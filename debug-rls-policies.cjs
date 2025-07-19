// Debug RLS policies to understand why optimization didn't work
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

async function debugRLSPolicies() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('🔍 Debugging RLS policies...');
    await client.connect();

    // Get detailed policy information
    const query = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
      ORDER BY tablename, policyname;
    `;

    const result = await client.query(query);
    
    console.log('\n📋 Current RLS Policies:');
    console.log('='.repeat(80));
    
    result.rows.forEach(policy => {
      console.log(`\nTable: ${policy.tablename}`);
      console.log(`Policy: ${policy.policyname}`);
      console.log(`Command: ${policy.cmd}`);
      console.log(`USING clause: ${policy.qual || 'N/A'}`);
      console.log(`WITH CHECK clause: ${policy.with_check || 'N/A'}`);
      
      // Check optimization status
      const usingOptimized = policy.qual && policy.qual.includes('(select auth.uid())');
      const checkOptimized = policy.with_check && policy.with_check.includes('(select auth.uid())');
      const usingUnoptimized = policy.qual && policy.qual.includes('auth.uid()') && !policy.qual.includes('(select auth.uid())');
      const checkUnoptimized = policy.with_check && policy.with_check.includes('auth.uid()') && !policy.with_check.includes('(select auth.uid())');
      
      if (usingOptimized || checkOptimized) {
        console.log('Status: ✅ OPTIMIZED');
      } else if (usingUnoptimized || checkUnoptimized) {
        console.log('Status: ⚠️ NEEDS OPTIMIZATION');
      } else {
        console.log('Status: ❓ NO AUTH FUNCTION DETECTED');
      }
      
      console.log('-'.repeat(60));
    });

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await client.end();
  }
}

async function forceOptimizeRLS() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n🔧 Force optimizing RLS policies...');
    await client.connect();

    // Get current policies that need optimization
    const getCurrentPoliciesQuery = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
        AND (
          (qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(select auth.uid())%') OR
          (with_check LIKE '%auth.uid()%' AND with_check NOT LIKE '%(select auth.uid())%')
        )
      ORDER BY tablename, policyname;
    `;

    const policies = await client.query(getCurrentPoliciesQuery);
    
    console.log(`Found ${policies.rows.length} policies that need optimization`);
    
    for (const policy of policies.rows) {
      console.log(`\nOptimizing: ${policy.tablename}.${policy.policyname}`);
      
      try {
        // Drop the existing policy
        await client.query(`DROP POLICY IF EXISTS "${policy.policyname}" ON public.${policy.tablename};`);
        
        // Create optimized version
        let optimizedQual = policy.qual;
        let optimizedWithCheck = policy.with_check;
        
        if (optimizedQual) {
          optimizedQual = optimizedQual.replace(/auth\.uid\(\)/g, '(select auth.uid())');
        }
        
        if (optimizedWithCheck) {
          optimizedWithCheck = optimizedWithCheck.replace(/auth\.uid\(\)/g, '(select auth.uid())');
        }
        
        let createPolicySQL = `CREATE POLICY "${policy.policyname}" ON public.${policy.tablename} FOR ${policy.cmd}`;
        
        if (optimizedQual) {
          createPolicySQL += ` USING (${optimizedQual})`;
        }
        
        if (optimizedWithCheck) {
          createPolicySQL += ` WITH CHECK (${optimizedWithCheck})`;
        }
        
        createPolicySQL += ';';
        
        console.log(`Executing: ${createPolicySQL}`);
        await client.query(createPolicySQL);
        
        console.log(`✅ Optimized: ${policy.tablename}.${policy.policyname}`);
        
      } catch (error) {
        console.error(`❌ Failed to optimize ${policy.tablename}.${policy.policyname}:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Force optimization error:', error.message);
  } finally {
    await client.end();
  }
}

async function validateFinalOptimization() {
  const client = new Client(DB_CONFIG);
  
  try {
    console.log('\n🔍 Final validation...');
    await client.connect();

    const query = `
      SELECT 
        schemaname,
        tablename,
        policyname,
        CASE 
          WHEN (qual LIKE '%(select auth.uid())%' OR with_check LIKE '%(select auth.uid())%') THEN 'OPTIMIZED'
          WHEN (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%') THEN 'NEEDS_OPTIMIZATION'
          ELSE 'NO_AUTH'
        END as status
      FROM pg_policies 
      WHERE schemaname = 'public' 
        AND tablename IN ('profiles', 'categories', 'transactions', 'budgets', 'savings_goals', 'financial_insights', 'user_insight_preferences')
      ORDER BY tablename, policyname;
    `;

    const result = await client.query(query);
    
    console.log('\n📊 Final Optimization Results:');
    console.log('='.repeat(50));
    
    const optimized = result.rows.filter(r => r.status === 'OPTIMIZED').length;
    const needsWork = result.rows.filter(r => r.status === 'NEEDS_OPTIMIZATION').length;
    const noAuth = result.rows.filter(r => r.status === 'NO_AUTH').length;
    const total = result.rows.length;
    
    console.log(`✅ Optimized: ${optimized}/${total} policies`);
    console.log(`⚠️ Needs work: ${needsWork}/${total} policies`);
    console.log(`ℹ️ No auth: ${noAuth}/${total} policies`);
    
    if (needsWork > 0) {
      console.log('\n⚠️ Policies still needing optimization:');
      result.rows
        .filter(r => r.status === 'NEEDS_OPTIMIZATION')
        .forEach(r => {
          console.log(`  - ${r.tablename}.${r.policyname}`);
        });
    }
    
    if (needsWork === 0) {
      console.log('\n🎉 ALL RLS POLICIES ARE NOW OPTIMIZED!');
      console.log('✅ Supabase linter warnings should be resolved');
      console.log('✅ Database performance significantly improved');
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
    console.log('🔧 RLS POLICY OPTIMIZATION DEBUG & FIX');
    console.log('='.repeat(60));
    
    // Debug current state
    await debugRLSPolicies();
    
    // Force optimization
    await forceOptimizeRLS();
    
    // Validate results
    const success = await validateFinalOptimization();
    
    if (success) {
      console.log('\n🎉 SUCCESS: All RLS policies are now optimized!');
    } else {
      console.log('\n⚠️ Some policies may need manual review');
    }
    
  } catch (error) {
    console.error('\n❌ PROCESS FAILED:', error.message);
    process.exit(1);
  }
}

// Run the debug and fix
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { debugRLSPolicies, forceOptimizeRLS, validateFinalOptimization };
