# 🚀 TruthGuard - Deployment Guide

**Project:** TruthGuard - AI Hallucination Detection & Compliance Platform  
**Status:** Deployment Ready ✅

---

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] All phases complete (1-6)
- [x] Integration testing done
- [x] Demo data seeding scripts ready
- [x] Environment variables documented
- [x] Database schema ready
- [x] API endpoints tested
- [x] Frontend build tested

### ⚠️ Required Before Deployment
- [ ] Set up production Supabase project
- [ ] Configure production environment variables
- [ ] Set up production database
- [ ] Configure API keys
- [ ] Set up domain/URLs
- [ ] Configure CORS for production
- [ ] Set up monitoring/logging
- [ ] Configure SSL certificates

---

## 🗄️ Database Setup

### 1. Supabase Production Setup

1. **Create Supabase Project:**
   - Go to https://supabase.com
   - Create new project
   - Note down:
     - Project URL
     - Anon Key
     - Service Role Key

2. **Run Database Schema:**
   ```bash
   # In Supabase SQL Editor, run:
   # Copy contents of database/schema.sql
   ```

3. **Verify Tables:**
   - Check all 9 tables are created
   - Verify indexes are created
   - Check RLS policies are enabled

### 2. Environment Variables

**Backend (.env):**
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# API Configuration
NODE_ENV=production
API_BASE_URL=https://api.yourdomain.com

# Optional: OpenAI API (for auto-correction)
OPENAI_API_KEY=your_openai_key_here
```

**Frontend (.env.local):**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

---

## 🖥️ Backend Deployment

### Option 1: Railway (Recommended)

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project:**
   ```bash
   cd backend
   railway init
   ```

3. **Set Environment Variables:**
   ```bash
   railway variables set SUPABASE_URL=your_url
   railway variables set SUPABASE_SERVICE_ROLE_KEY=your_key
   railway variables set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

5. **Get URL:**
   - Railway provides URL automatically
   - Update frontend `.env.local` with this URL

### Option 2: Render

1. **Create Web Service:**
   - Go to https://render.com
   - New → Web Service
   - Connect GitHub repository

2. **Configure:**
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment:** Python 3

3. **Set Environment Variables:**
   - Add all variables from `.env`

4. **Deploy:**
   - Render auto-deploys on git push

### Option 3: Heroku

1. **Install Heroku CLI:**
   ```bash
   heroku login
   ```

2. **Create App:**
   ```bash
   cd backend
   heroku create your-app-name
   ```

3. **Set Environment Variables:**
   ```bash
   heroku config:set SUPABASE_URL=your_url
   heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_key
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

### Option 4: Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM python:3.11-slim
   
   WORKDIR /app
   
   COPY requirements.txt .
   RUN pip install --no-cache-dir -r requirements.txt
   
   COPY . .
   
   EXPOSE 8000
   
   CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
   ```

2. **Build and Run:**
   ```bash
   docker build -t truthguard-backend .
   docker run -p 8000:8000 --env-file .env truthguard-backend
   ```

---

## 🎨 Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Deploy:**
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables:**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from `.env.local`

4. **Configure:**
   - Framework: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Custom Domain (Optional):**
   - Add domain in Vercel dashboard
   - Configure DNS

### Option 2: Netlify

1. **Install Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   ```

2. **Deploy:**
   ```bash
   cd frontend
   netlify deploy --prod
   ```

3. **Set Environment Variables:**
   - In Netlify dashboard → Site settings → Environment variables

### Option 3: Self-Hosted

1. **Build:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start:**
   ```bash
   npm start
   ```

3. **Use Nginx/Reverse Proxy:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🔒 Security Configuration

### 1. CORS Configuration

**Backend (app/main.py):**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://yourdomain.com",
        "https://www.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. API Key Security

- Store API keys in environment variables
- Never commit keys to git
- Use different keys for production/staging
- Rotate keys regularly

### 3. Database Security

- Enable Row Level Security (RLS) in Supabase
- Use service role key only in backend
- Use anon key in frontend
- Review RLS policies

---

## 📊 Monitoring & Logging

### 1. Application Monitoring

**Recommended Services:**
- **Sentry:** Error tracking
- **LogRocket:** Session replay
- **Datadog:** APM and logging

### 2. Database Monitoring

- Use Supabase dashboard for database metrics
- Monitor query performance
- Set up alerts for errors

### 3. API Monitoring

- Monitor API response times
- Track error rates
- Set up uptime monitoring (UptimeRobot, Pingdom)

---

## 🧪 Post-Deployment Testing

### 1. Health Checks

```bash
# Backend
curl https://api.yourdomain.com/health

# Should return: {"status": "healthy"}
```

### 2. API Testing

```bash
# Test validation endpoint
curl -X POST https://api.yourdomain.com/api/v1/validate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "query": "Test query",
    "ai_response": "Test response",
    "ai_model": "gpt-4",
    "organization_id": "your_org_id"
  }'
```

### 3. Frontend Testing

- Visit https://yourdomain.com
- Test login/signup
- Test dashboard
- Test all pages
- Test on mobile devices

---

## 🔄 CI/CD Setup (Optional)

### GitHub Actions Example

**.github/workflows/deploy.yml:**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        run: |
          vercel --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database schema deployed
- [ ] API keys generated
- [ ] CORS configured
- [ ] SSL certificates ready

### Deployment
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Environment variables set
- [ ] Database connected
- [ ] Health checks passing

### Post-Deployment
- [ ] API endpoints tested
- [ ] Frontend pages tested
- [ ] Authentication working
- [ ] Database operations working
- [ ] Monitoring configured
- [ ] Documentation updated

---

## 🆘 Troubleshooting

### Common Issues

**1. CORS Errors:**
- Check CORS configuration in backend
- Verify frontend URL is in allowed origins

**2. Database Connection Errors:**
- Verify Supabase URL and keys
- Check network connectivity
- Verify RLS policies

**3. API Key Errors:**
- Verify API key is set correctly
- Check key format
- Verify key is sent in headers

**4. Build Errors:**
- Check Node.js/Python versions
- Verify all dependencies installed
- Check environment variables

---

## 📞 Support

For deployment issues:
1. Check logs in deployment platform
2. Review error messages
3. Check environment variables
4. Verify database connection
5. Test locally first

---

**Ready to deploy? Follow the steps above! 🚀**

