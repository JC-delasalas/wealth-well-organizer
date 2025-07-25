/**
 * Script to seed categories for existing users
 * Run this script to ensure all existing users have the comprehensive default categories
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://iwzkguwkirrojxewsoqc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Default categories to seed
const defaultCategories = [
  // Income Categories
  { name: 'Salary/Wages', icon: 'DollarSign', color: '#059669', type: 'income', description: 'Regular employment income, salaries, and wages' },
  { name: 'Business Income', icon: 'Building2', color: '#0891b2', type: 'income', description: 'Revenue from business operations and self-employment' },
  { name: 'Investment Returns', icon: 'TrendingUp', color: '#7c3aed', type: 'income', description: 'Dividends, interest, capital gains, and investment profits' },
  { name: 'Freelance/Side Income', icon: 'Briefcase', color: '#0d9488', type: 'income', description: 'Freelance work, gig economy, and side hustle income' },
  { name: 'Government Benefits', icon: 'Shield', color: '#2563eb', type: 'income', description: 'Social security, unemployment benefits, and government assistance' },
  { name: 'Other Income', icon: 'Plus', color: '#16a34a', type: 'income', description: 'Miscellaneous income sources not covered by other categories' },

  // Expense Categories
  { name: 'Housing', icon: 'Home', color: '#dc2626', type: 'expense', description: 'Rent, mortgage, utilities, and home maintenance' },
  { name: 'Transportation', icon: 'Car', color: '#f97316', type: 'expense', description: 'Fuel, public transport, car maintenance, and travel costs' },
  { name: 'Food & Dining', icon: 'Utensils', color: '#ef4444', type: 'expense', description: 'Groceries, restaurants, food delivery, and dining out' },
  { name: 'Healthcare', icon: 'Heart', color: '#10b981', type: 'expense', description: 'Medical expenses, insurance, pharmacy, and health services' },
  { name: 'Entertainment', icon: 'Film', color: '#8b5cf6', type: 'expense', description: 'Movies, hobbies, subscriptions, and recreational activities' },
  { name: 'Shopping', icon: 'ShoppingBag', color: '#ec4899', type: 'expense', description: 'Clothing, electronics, personal items, and general shopping' },
  { name: 'Education', icon: 'BookOpen', color: '#3b82f6', type: 'expense', description: 'Tuition, books, courses, and educational expenses' },
  { name: 'Debt Payments', icon: 'CreditCard', color: '#dc2626', type: 'expense', description: 'Credit card payments, loans, and debt servicing' },
  { name: 'Insurance', icon: 'Shield', color: '#0891b2', type: 'expense', description: 'Life, auto, home, and other insurance premiums' },
  { name: 'Taxes', icon: 'Receipt', color: '#991b1b', type: 'expense', description: 'Income tax, property tax, and other tax payments' },
  { name: 'Emergency Fund', icon: 'AlertTriangle', color: '#ea580c', type: 'expense', description: 'Emergency fund contributions and unexpected expenses' },
  { name: 'Other Expenses', icon: 'MoreHorizontal', color: '#6b7280', type: 'expense', description: 'Miscellaneous expenses not covered by other categories' },

  // Savings & Investment Categories
  { name: 'Emergency Savings', icon: 'Shield', color: '#dc2626', type: 'expense', description: 'Emergency fund for unexpected expenses and financial security' },
  { name: 'Retirement Savings', icon: 'Clock', color: '#7c3aed', type: 'expense', description: '401k, IRA, pension contributions, and retirement planning' },
  { name: 'Investment Portfolio', icon: 'TrendingUp', color: '#059669', type: 'expense', description: 'Stocks, bonds, mutual funds, and investment contributions' },
  { name: 'Education Fund', icon: 'GraduationCap', color: '#2563eb', type: 'expense', description: 'College savings, education planning, and learning investments' },
  { name: 'Vacation Fund', icon: 'Plane', color: '#0891b2', type: 'expense', description: 'Travel savings, vacation planning, and leisure fund' },
  { name: 'Home Down Payment', icon: 'Home', color: '#16a34a', type: 'expense', description: 'Savings for home purchase, down payment, and real estate' },
  { name: 'Other Savings Goals', icon: 'Target', color: '#0d9488', type: 'expense', description: 'Custom savings goals and specific financial targets' }
];

async function seedUserCategories(userId) {
  console.log(`📝 Seeding categories for user: ${userId}`);
  
  try {
    // Get existing categories for this user
    const { data: existingCategories, error: fetchError } = await supabase
      .from('categories')
      .select('name')
      .eq('user_id', userId);

    if (fetchError) {
      console.error(`❌ Error fetching existing categories for user ${userId}:`, fetchError.message);
      return { success: false, error: fetchError.message };
    }

    const existingCategoryNames = new Set(existingCategories?.map(cat => cat.name) || []);
    
    // Filter out categories that already exist
    const categoriesToCreate = defaultCategories.filter(
      category => !existingCategoryNames.has(category.name)
    );

    if (categoriesToCreate.length === 0) {
      console.log(`✅ User ${userId} already has all categories`);
      return { success: true, categoriesCreated: 0, categoriesSkipped: existingCategories.length };
    }

    // Prepare categories for insertion
    const categoryInserts = categoriesToCreate.map(category => ({
      user_id: userId,
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
      description: category.description,
      is_default: false
    }));

    // Insert categories
    const { data, error } = await supabase
      .from('categories')
      .insert(categoryInserts)
      .select('id');

    if (error) {
      console.error(`❌ Error creating categories for user ${userId}:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`✅ Created ${data.length} categories for user ${userId}`);
    return { 
      success: true, 
      categoriesCreated: data.length, 
      categoriesSkipped: existingCategories.length 
    };

  } catch (error) {
    console.error(`❌ Unexpected error for user ${userId}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Starting category seeding for existing users...\n');

  try {
    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name');

    if (profilesError) {
      console.error('❌ Error fetching user profiles:', profilesError.message);
      process.exit(1);
    }

    if (!profiles || profiles.length === 0) {
      console.log('ℹ️  No users found to seed categories for.');
      return;
    }

    console.log(`📊 Found ${profiles.length} users to process\n`);

    let totalCategoriesCreated = 0;
    let usersProcessed = 0;
    let usersWithErrors = 0;

    // Process each user
    for (const profile of profiles) {
      const result = await seedUserCategories(profile.id);
      
      if (result.success) {
        usersProcessed++;
        totalCategoriesCreated += result.categoriesCreated;
      } else {
        usersWithErrors++;
        console.error(`❌ Failed to process user ${profile.email || profile.id}: ${result.error}`);
      }

      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📈 Summary:');
    console.log(`✅ Users processed successfully: ${usersProcessed}`);
    console.log(`❌ Users with errors: ${usersWithErrors}`);
    console.log(`📝 Total categories created: ${totalCategoriesCreated}`);
    console.log(`📊 Average categories per user: ${usersProcessed > 0 ? (totalCategoriesCreated / usersProcessed).toFixed(1) : 0}`);

    if (usersWithErrors > 0) {
      console.log('\n⚠️  Some users had errors. Please check the logs above.');
      process.exit(1);
    } else {
      console.log('\n🎉 All users processed successfully!');
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { seedUserCategories, defaultCategories };
