
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error } = await supabaseClient.auth.getUser(token)

    if (error || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if user already has categories
    const { data: existingCategories } = await supabaseClient
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (existingCategories && existingCategories.length > 0) {
      return new Response(JSON.stringify({ message: 'User data already seeded' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create default categories for the user
    const defaultCategories = [
      { name: 'Food & Dining', icon: '🍽️', color: '#ef4444', type: 'expense', user_id: user.id },
      { name: 'Transportation', icon: '🚗', color: '#3b82f6', type: 'expense', user_id: user.id },
      { name: 'Shopping', icon: '🛒', color: '#8b5cf6', type: 'expense', user_id: user.id },
      { name: 'Entertainment', icon: '🎬', color: '#f59e0b', type: 'expense', user_id: user.id },
      { name: 'Bills & Utilities', icon: '💡', color: '#10b981', type: 'expense', user_id: user.id },
      { name: 'Healthcare', icon: '🏥', color: '#ec4899', type: 'expense', user_id: user.id },
      { name: 'Salary', icon: '💼', color: '#059669', type: 'income', user_id: user.id },
      { name: 'Freelance', icon: '💻', color: '#0d9488', type: 'income', user_id: user.id },
      { name: 'Investment', icon: '📈', color: '#7c3aed', type: 'income', user_id: user.id },
    ]

    const { error: categoriesError } = await supabaseClient
      .from('categories')
      .insert(defaultCategories)

    if (categoriesError) {
      console.error('Error creating categories:', categoriesError)
      return new Response(JSON.stringify({ error: 'Failed to create categories' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ message: 'User data seeded successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
