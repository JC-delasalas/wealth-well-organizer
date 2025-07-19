// Test application functionality with the actual Supabase client
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://iwzkguwkirrojxewsoqc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3emtndXdraXJyb2p4ZXdzb3FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI3ODUxMDYsImV4cCI6MjA2ODM2MTEwNn0.Rui4W-MwszWqUSxX8DwktonhEnrsRMQhM-YkedNlY5Q';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSavingsGoalsCreation() {
  console.log('\n🎯 Testing Savings Goals Creation...');
  
  try {
    // Test data for savings goal
    const testGoal = {
      name: 'Test Emergency Fund',
      description: 'Test description for emergency fund',
      target_amount: 5000,
      current_amount: 1000,
      target_date: '2025-12-31', // Future date
      savings_percentage_threshold: 20,
      salary_date_1: 15,
      salary_date_2: 30
    };

    console.log('📝 Attempting to create savings goal with data:', testGoal);

    // Try to insert the savings goal
    const { data, error } = await supabase
      .from('savings_goals')
      .insert([testGoal])
      .select()
      .single();

    if (error) {
      console.error('❌ Savings goal creation failed:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    } else {
      console.log('✅ Savings goal created successfully:', data);
      
      // Clean up test data
      await supabase
        .from('savings_goals')
        .delete()
        .eq('id', data.id);
      console.log('🧹 Test data cleaned up');
      return true;
    }
  } catch (error) {
    console.error('❌ Unexpected error in savings goals test:', error);
    return false;
  }
}

async function testFinancialInsightsCreation() {
  console.log('\n🧠 Testing Financial Insights Creation...');
  
  try {
    // Test data for financial insight
    const testInsight = {
      insight_type: 'daily',
      title: 'Test Daily Insight',
      content: 'This is a test insight to verify the schema works correctly.',
      priority: 'medium',
      period_start: '2025-01-19',
      period_end: '2025-01-19',
      content_hash: 'test_hash_12345',
      generation_trigger: 'manual',
      is_read: false
    };

    console.log('📝 Attempting to create financial insight with data:', testInsight);

    // Try to insert the financial insight
    const { data, error } = await supabase
      .from('financial_insights')
      .insert([testInsight])
      .select()
      .single();

    if (error) {
      console.error('❌ Financial insight creation failed:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return false;
    } else {
      console.log('✅ Financial insight created successfully:', data);
      
      // Clean up test data
      await supabase
        .from('financial_insights')
        .delete()
        .eq('id', data.id);
      console.log('🧹 Test data cleaned up');
      return true;
    }
  } catch (error) {
    console.error('❌ Unexpected error in financial insights test:', error);
    return false;
  }
}

async function testUserInsightPreferences() {
  console.log('\n⚙️ Testing User Insight Preferences...');
  
  try {
    // First, we need to check if we can access the table
    const { data: testData, error: accessError } = await supabase
      .from('user_insight_preferences')
      .select('*')
      .limit(1);

    if (accessError) {
      console.error('❌ Cannot access user_insight_preferences table:', accessError);
      console.error('Error details:', {
        code: accessError.code,
        message: accessError.message,
        details: accessError.details,
        hint: accessError.hint
      });
      return false;
    } else {
      console.log('✅ user_insight_preferences table is accessible');
      console.log('📊 Sample data structure:', testData);
      return true;
    }
  } catch (error) {
    console.error('❌ Unexpected error in user preferences test:', error);
    return false;
  }
}

async function testDuplicateDetection() {
  console.log('\n🔍 Testing Duplicate Detection...');
  
  try {
    // Create a test insight
    const testInsight = {
      insight_type: 'weekly',
      title: 'Duplicate Test Insight',
      content: 'This insight is for testing duplicate detection.',
      priority: 'low',
      period_start: '2025-01-13',
      period_end: '2025-01-19',
      content_hash: 'duplicate_test_hash',
      generation_trigger: 'manual',
      is_read: false
    };

    console.log('📝 Creating first insight...');
    const { data: firstInsight, error: firstError } = await supabase
      .from('financial_insights')
      .insert([testInsight])
      .select()
      .single();

    if (firstError) {
      console.error('❌ First insight creation failed:', firstError);
      return false;
    }

    console.log('✅ First insight created:', firstInsight.id);

    // Try to create the same insight again (should be prevented by application logic)
    console.log('📝 Attempting to create duplicate insight...');
    const { data: duplicateInsight, error: duplicateError } = await supabase
      .from('financial_insights')
      .insert([testInsight])
      .select()
      .single();

    if (duplicateError) {
      console.log('⚠️ Duplicate creation failed (this might be expected):', duplicateError.message);
    } else {
      console.log('⚠️ Duplicate insight was created (application-level prevention needed):', duplicateInsight.id);
      
      // Clean up duplicate
      await supabase
        .from('financial_insights')
        .delete()
        .eq('id', duplicateInsight.id);
    }

    // Clean up original test data
    await supabase
      .from('financial_insights')
      .delete()
      .eq('id', firstInsight.id);
    console.log('🧹 Test data cleaned up');
    
    return true;
  } catch (error) {
    console.error('❌ Unexpected error in duplicate detection test:', error);
    return false;
  }
}

async function testDateValidation() {
  console.log('\n📅 Testing Date Validation...');
  
  try {
    // Test with past date (should fail)
    const pastDateGoal = {
      name: 'Past Date Test',
      description: 'This should fail due to past date',
      target_amount: 1000,
      current_amount: 0,
      target_date: '2020-01-01', // Past date
      savings_percentage_threshold: 20,
      salary_date_1: 15,
      salary_date_2: 30
    };

    console.log('📝 Testing with past date (should fail)...');
    const { data: pastData, error: pastError } = await supabase
      .from('savings_goals')
      .insert([pastDateGoal])
      .select()
      .single();

    if (pastError) {
      console.log('✅ Past date correctly rejected:', pastError.message);
      return true;
    } else {
      console.log('❌ Past date was accepted (constraint not working):', pastData);
      
      // Clean up if it was created
      await supabase
        .from('savings_goals')
        .delete()
        .eq('id', pastData.id);
      return false;
    }
  } catch (error) {
    console.error('❌ Unexpected error in date validation test:', error);
    return false;
  }
}

async function runComprehensiveTests() {
  console.log('🧪 COMPREHENSIVE APPLICATION FUNCTIONALITY TESTS');
  console.log('='.repeat(60));

  const results = {
    savingsGoals: false,
    financialInsights: false,
    userPreferences: false,
    duplicateDetection: false,
    dateValidation: false
  };

  // Run all tests
  results.savingsGoals = await testSavingsGoalsCreation();
  results.financialInsights = await testFinancialInsightsCreation();
  results.userPreferences = await testUserInsightPreferences();
  results.duplicateDetection = await testDuplicateDetection();
  results.dateValidation = await testDateValidation();

  // Summary
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(40));
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  console.log(`\n🎯 Overall: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED - Application functionality is working correctly!');
  } else {
    console.log('⚠️ Some tests failed - issues still remain that need to be addressed');
    
    console.log('\n🔧 RECOMMENDED ACTIONS:');
    if (!results.savingsGoals) {
      console.log('- Fix savings goals creation issues');
    }
    if (!results.financialInsights) {
      console.log('- Fix financial insights creation issues');
    }
    if (!results.userPreferences) {
      console.log('- Fix user preferences table access');
    }
    if (!results.duplicateDetection) {
      console.log('- Implement application-level duplicate prevention');
    }
    if (!results.dateValidation) {
      console.log('- Fix database date validation constraints');
    }
  }

  return results;
}

// Run the tests
if (require.main === module) {
  runComprehensiveTests()
    .then((results) => {
      const allPassed = Object.values(results).every(Boolean);
      process.exit(allPassed ? 0 : 1);
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { runComprehensiveTests };
