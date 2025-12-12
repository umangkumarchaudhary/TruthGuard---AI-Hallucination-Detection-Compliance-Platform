# TruthGuard Database Setup Guide

## Quick Start

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Click "New Query"

2. **Copy the Schema**
   - Open `database/schema.sql`
   - Copy the entire file (Ctrl+A, Ctrl+C)

3. **Paste and Run**
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter

4. **Verify**
   - Check that all tables were created
   - Verify indexes are in place
   - Test RLS policies

## What Gets Created

### Tables (9 total)
- `organizations` - Company information
- `users` - User accounts
- `api_keys` - API authentication keys
- `compliance_rules` - Compliance rules
- `company_policies` - Company policies
- `ai_interactions` - AI interaction logs
- `violations` - Detected violations
- `verification_results` - Fact verification results
- `citations` - URL/citation verification

### Indexes (20+)
- Optimized for common queries
- Fast lookups by organization, timestamp, status

### Security
- Row Level Security (RLS) enabled on all tables
- Policies restrict access by organization
- Role-based access (admin, compliance_officer, viewer)

### Functions & Triggers
- Auto-update `updated_at` timestamps
- Automatic timestamp management

## Verification Queries

After running the schema, verify with these queries:

```sql
-- Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
ORDER BY tablename;
```

## Next Steps

1. Create your first organization:
```sql
INSERT INTO organizations (name, industry) 
VALUES ('My Company', 'finance');
```

2. Create a user (after Supabase Auth signup):
```sql
INSERT INTO users (id, email, organization_id, role)
VALUES (
  'your-auth-user-id', 
  'user@example.com',
  'your-organization-id',
  'admin'
);
```

3. Start using the API!

## Notes

- The schema includes comprehensive comments/documentation
- All timestamps use `TIMESTAMP WITH TIME ZONE`
- UUIDs are used for all primary keys
- Foreign keys have proper CASCADE/SET NULL behavior
- Sample data is commented out (uncomment if needed for testing)

## Troubleshooting

**Error: extension "uuid-ossp" does not exist**
- This is normal, the script handles it with `CREATE EXTENSION IF NOT EXISTS`

**RLS policies blocking queries**
- Make sure you're authenticated
- Check that your user has the correct organization_id
- Verify your role has the necessary permissions

**Tables not appearing**
- Check the SQL Editor for error messages
- Verify you're in the correct database
- Check Supabase project settings

