# Environment Variables Setup

## Your Current .env File

Update your `.env` file to match this structure:

```env
# Supabase Configuration
SUPABASE_URL=https://dufausqnubtmnsfhdlty.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1ZmF1c3FudWJ0bW5zZmhkbHR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MzkzMzMsImV4cCI6MjA4MTExNTMzM30.A4ZvVF88e22yVwW2cBPq9ldMC_kCgCa2NXNRi2VKkkU
SUPABASE_SERVICE_ROLE_KEY=sb_secret_u4zPxk0GCLq524RrHBoI1g_B8MQpp7p

# Application Configuration
NODE_ENV=development
PORT=3000
```

## Key Notes:

1. **SUPABASE_URL**: Your project URL
2. **SUPABASE_ANON_KEY**: Public key (safe for frontend)
3. **SUPABASE_SERVICE_ROLE_KEY**: Secret key (backend only - never expose!)

## Verify Your Service Role Key:

Go to Supabase Dashboard → Settings → API
- Check if `sb_secret_...` is your service_role key
- If not, copy the actual service_role key from there

