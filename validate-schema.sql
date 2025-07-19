-- Database Schema Validation Script
-- Run this in your Supabase SQL Editor to validate the critical schema fixes

-- =============================================================================
-- 1. CHECK TABLE EXISTENCE
-- =============================================================================

SELECT 'CHECKING TABLE EXISTENCE' as validation_step;

-- Check if all required tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('savings_goals', 'financial_insights', 'user_insight_preferences')
ORDER BY table_name;

-- =============================================================================
-- 2. CHECK SAVINGS_GOALS TABLE COLUMNS
-- =============================================================================

SELECT 'CHECKING SAVINGS_GOALS COLUMNS' as validation_step;

-- Check if savings_goals has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'user_id', 'target_amount', 'current_amount', 'savings_percentage_threshold', 'salary_date_1', 'salary_date_2', 'created_at', 'updated_at') THEN '🔵 ORIGINAL'
        WHEN column_name IN ('name', 'description', 'target_date') THEN '🟢 ADDED'
        ELSE '🟡 OTHER'
    END as column_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'savings_goals'
ORDER BY ordinal_position;

-- Check for missing critical columns in savings_goals
SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ All critical columns present in savings_goals'
        ELSE '❌ Missing columns in savings_goals: ' || 
             CASE 
                 WHEN SUM(CASE WHEN column_name = 'name' THEN 1 ELSE 0 END) = 0 THEN 'name, '
                 ELSE ''
             END ||
             CASE 
                 WHEN SUM(CASE WHEN column_name = 'description' THEN 1 ELSE 0 END) = 0 THEN 'description, '
                 ELSE ''
             END ||
             CASE 
                 WHEN SUM(CASE WHEN column_name = 'target_date' THEN 1 ELSE 0 END) = 0 THEN 'target_date'
                 ELSE ''
             END
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'savings_goals'
    AND column_name IN ('name', 'description', 'target_date');

-- =============================================================================
-- 3. CHECK FINANCIAL_INSIGHTS TABLE COLUMNS
-- =============================================================================

SELECT 'CHECKING FINANCIAL_INSIGHTS COLUMNS' as validation_step;

-- Check if financial_insights has all required columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'user_id', 'insight_type', 'title', 'content', 'priority', 'period_start', 'period_end', 'is_read', 'created_at') THEN '🔵 ORIGINAL'
        WHEN column_name IN ('content_hash', 'generation_trigger', 'last_generated_at') THEN '🟢 ADDED'
        ELSE '🟡 OTHER'
    END as column_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'financial_insights'
ORDER BY ordinal_position;

-- Check for missing enhanced columns in financial_insights
SELECT 
    CASE 
        WHEN COUNT(*) = 3 THEN '✅ All enhanced columns present in financial_insights'
        ELSE '❌ Missing columns in financial_insights: ' || 
             CASE 
                 WHEN SUM(CASE WHEN column_name = 'content_hash' THEN 1 ELSE 0 END) = 0 THEN 'content_hash, '
                 ELSE ''
             END ||
             CASE 
                 WHEN SUM(CASE WHEN column_name = 'generation_trigger' THEN 1 ELSE 0 END) = 0 THEN 'generation_trigger, '
                 ELSE ''
             END ||
             CASE 
                 WHEN SUM(CASE WHEN column_name = 'last_generated_at' THEN 1 ELSE 0 END) = 0 THEN 'last_generated_at'
                 ELSE ''
             END
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'financial_insights'
    AND column_name IN ('content_hash', 'generation_trigger', 'last_generated_at');

-- =============================================================================
-- 4. CHECK USER_INSIGHT_PREFERENCES TABLE
-- =============================================================================

SELECT 'CHECKING USER_INSIGHT_PREFERENCES TABLE' as validation_step;

-- Check if user_insight_preferences table exists and has columns
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ user_insight_preferences table exists with ' || COUNT(*) || ' columns'
        ELSE '❌ user_insight_preferences table does not exist'
    END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'user_insight_preferences';

-- List all columns in user_insight_preferences if it exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'user_insight_preferences'
ORDER BY ordinal_position;

-- =============================================================================
-- 5. CHECK DATABASE CONSTRAINTS
-- =============================================================================

SELECT 'CHECKING DATABASE CONSTRAINTS' as validation_step;

-- Check for constraints on savings_goals table
SELECT 
    constraint_name,
    constraint_type,
    CASE 
        WHEN constraint_name LIKE '%target_date%' THEN '🎯 DATE CONSTRAINT'
        WHEN constraint_name LIKE '%target_amount%' THEN '💰 AMOUNT CONSTRAINT'
        WHEN constraint_type = 'PRIMARY KEY' THEN '🔑 PRIMARY KEY'
        WHEN constraint_type = 'FOREIGN KEY' THEN '🔗 FOREIGN KEY'
        ELSE '📋 OTHER'
    END as constraint_purpose
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
    AND table_name = 'savings_goals'
ORDER BY constraint_type, constraint_name;

-- =============================================================================
-- 6. CHECK INDEXES
-- =============================================================================

SELECT 'CHECKING INDEXES' as validation_step;

-- Check for indexes on financial_insights
SELECT 
    indexname,
    tablename,
    CASE 
        WHEN indexname LIKE '%content_hash%' THEN '🔍 CONTENT HASH INDEX'
        WHEN indexname LIKE '%user_type%' THEN '👤 USER TYPE INDEX'
        WHEN indexname LIKE '%periods%' THEN '📅 PERIODS INDEX'
        ELSE '📋 OTHER INDEX'
    END as index_purpose
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND tablename IN ('financial_insights', 'user_insight_preferences')
ORDER BY tablename, indexname;

-- =============================================================================
-- 7. CHECK RLS POLICIES
-- =============================================================================

SELECT 'CHECKING RLS POLICIES' as validation_step;

-- Check RLS is enabled on tables
SELECT 
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('savings_goals', 'financial_insights', 'user_insight_preferences')
ORDER BY tablename;

-- =============================================================================
-- 8. OVERALL VALIDATION SUMMARY
-- =============================================================================

SELECT 'VALIDATION SUMMARY' as validation_step;

-- Count tables that exist
WITH table_check AS (
    SELECT COUNT(*) as existing_tables
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name IN ('savings_goals', 'financial_insights', 'user_insight_preferences')
),
savings_columns AS (
    SELECT COUNT(*) as critical_columns
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
        AND table_name = 'savings_goals'
        AND column_name IN ('name', 'description', 'target_date')
),
insights_columns AS (
    SELECT COUNT(*) as enhanced_columns
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
        AND table_name = 'financial_insights'
        AND column_name IN ('content_hash', 'generation_trigger', 'last_generated_at')
),
preferences_table AS (
    SELECT COUNT(*) as preferences_exists
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
        AND table_name = 'user_insight_preferences'
)
SELECT 
    CASE 
        WHEN tc.existing_tables = 3 
             AND sc.critical_columns = 3 
             AND ic.enhanced_columns = 3 
             AND pt.preferences_exists = 1 
        THEN '🎉 SCHEMA VALIDATION PASSED - All critical fixes applied successfully!'
        ELSE '⚠️ SCHEMA VALIDATION ISSUES DETECTED:'
    END as overall_status,
    tc.existing_tables || '/3 tables exist' as tables_status,
    sc.critical_columns || '/3 savings_goals columns exist' as savings_status,
    ic.enhanced_columns || '/3 financial_insights columns exist' as insights_status,
    CASE WHEN pt.preferences_exists = 1 THEN 'user_insight_preferences exists' ELSE 'user_insight_preferences missing' END as preferences_status
FROM table_check tc, savings_columns sc, insights_columns ic, preferences_table pt;

-- =============================================================================
-- 9. MIGRATION RECOMMENDATIONS
-- =============================================================================

SELECT 'MIGRATION RECOMMENDATIONS' as validation_step;

-- Provide recommendations based on what's missing
WITH validation_results AS (
    SELECT 
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('savings_goals', 'financial_insights', 'user_insight_preferences')) as tables_count,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'savings_goals' AND column_name IN ('name', 'description', 'target_date')) as savings_columns,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'financial_insights' AND column_name IN ('content_hash', 'generation_trigger', 'last_generated_at')) as insights_columns,
        (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_insight_preferences') as preferences_exists
)
SELECT 
    CASE 
        WHEN tables_count = 3 AND savings_columns = 3 AND insights_columns = 3 AND preferences_exists = 1 
        THEN '✅ No migration needed - schema is up to date'
        ELSE '🔧 Run migration: supabase db push or execute 20250119130000_fix_critical_schema_issues.sql'
    END as recommendation
FROM validation_results;
