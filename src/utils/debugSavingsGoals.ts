import { supabase } from '@/integrations/supabase/client';

// Debug utility to test savings goals creation
export const debugSavingsGoals = async () => {
  try {
    console.log('🔍 Debugging Savings Goals...');
    
    // Check if user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('❌ User not authenticated:', userError);
      return;
    }
    console.log('✅ User authenticated:', user.id);

    // Check table structure
    console.log('🔍 Checking table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('savings_goals')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table access error:', tableError);
      return;
    }
    console.log('✅ Table accessible');

    // Try a minimal insert
    console.log('🔍 Testing minimal insert...');
    const minimalData = {
      user_id: user.id,
      target_amount: 1000,
      current_amount: 0,
      savings_percentage_threshold: 20,
      salary_date_1: 15,
      salary_date_2: 30
    };

    const { data: minimalResult, error: minimalError } = await supabase
      .from('savings_goals')
      .insert([minimalData])
      .select()
      .single();

    if (minimalError) {
      console.error('❌ Minimal insert failed:', minimalError);
      
      // Try with required fields based on migration
      console.log('🔍 Testing with required fields...');
      const requiredData = {
        ...minimalData,
        name: 'Test Goal',
        target_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };

      const { data: requiredResult, error: requiredError } = await supabase
        .from('savings_goals')
        .insert([requiredData])
        .select()
        .single();

      if (requiredError) {
        console.error('❌ Required fields insert failed:', requiredError);
        return;
      } else {
        console.log('✅ Required fields insert succeeded:', requiredResult);
        
        // Clean up test data
        await supabase
          .from('savings_goals')
          .delete()
          .eq('id', requiredResult.id);
        console.log('🧹 Test data cleaned up');
      }
    } else {
      console.log('✅ Minimal insert succeeded:', minimalResult);
      
      // Clean up test data
      await supabase
        .from('savings_goals')
        .delete()
        .eq('id', minimalResult.id);
      console.log('🧹 Test data cleaned up');
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
};

// Test file download functionality
export const debugFileDownload = async (receiptUrl: string) => {
  try {
    console.log('🔍 Debugging file download for:', receiptUrl);
    
    const url = new URL(receiptUrl);
    let filePath = '';
    
    // Handle different URL formats from Supabase storage
    if (url.pathname.includes('/storage/v1/object/public/receipts/')) {
      // Format: /storage/v1/object/public/receipts/user_id/filename
      const pathAfterReceipts = url.pathname.split('/storage/v1/object/public/receipts/')[1];
      filePath = pathAfterReceipts;
    } else {
      // Fallback: assume last two parts are user_id/filename
      const pathParts = url.pathname.split('/').filter(part => part.length > 0);
      filePath = pathParts.slice(-2).join('/');
    }
    
    console.log('📁 Extracted file path:', filePath);
    
    // Test if file exists
    const { data: fileData, error: fileError } = await supabase.storage
      .from('receipts')
      .download(filePath);
    
    if (fileError) {
      console.error('❌ File download failed:', fileError);
      
      // Try to list files in the bucket to see what's available
      const { data: listData, error: listError } = await supabase.storage
        .from('receipts')
        .list('', { limit: 10 });
      
      if (listError) {
        console.error('❌ Cannot list files:', listError);
      } else {
        console.log('📂 Available files:', listData);
      }
    } else {
      console.log('✅ File download succeeded:', fileData.type, fileData.size);
    }
    
  } catch (error) {
    console.error('❌ Debug file download error:', error);
  }
};

// Add to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).debugSavingsGoals = debugSavingsGoals;
  (window as any).debugFileDownload = debugFileDownload;
}
