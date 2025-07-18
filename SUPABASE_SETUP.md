# Supabase Configuration Setup

## Project Details
- **Project ID**: iwzkguwkirrojxewsoqc
- **Project URL**: https://iwzkguwkirrojxewsoqc.supabase.co
- **Database**: PostgreSQL (Direct connection available)

## Configuration Files

### 1. Environment Variables (`.env`)
```
VITE_SUPABASE_URL=https://iwzkguwkirrojxewsoqc.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_DB_PASSWORD=your_db_password_here
```

### 2. Supabase Config (`supabase/config.toml`)
- Project ID configured
- Local development ports configured
- Auth, API, Storage, and Realtime enabled

### 3. Client Configuration (`src/integrations/supabase/client.ts`)
- Updated to use environment variables
- Fallback to hardcoded values for compatibility

## Direct Database Connection
```
postgresql://postgres:[YOUR_DB_PASSWORD]@db.iwzkguwkirrojxewsoqc.supabase.co:5432/postgres
```

## Usage

### For Development
1. The client is already configured and ready to use
2. Import the client: `import { supabase } from "@/integrations/supabase/client"`
3. Use standard Supabase client methods

### For CLI Operations
- The project is configured but requires authentication
- Use the service role key for admin operations
- Database password is available for direct connections

## Next Steps
1. Test the client connection in your application
2. Set up authentication if needed
3. Configure any additional Supabase features (Storage, Edge Functions, etc.)
4. Run migrations if you have any pending schema changes
