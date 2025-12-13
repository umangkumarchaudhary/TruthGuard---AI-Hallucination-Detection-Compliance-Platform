# DevOps Learning Guide for TruthGuard

## 🎓 Welcome to DevOps!

**This guide will teach you DevOps concepts by implementing them in TruthGuard.**

Don't worry if you're new to DevOps - we'll learn together, step by step, with real examples from this project.

---

## 📚 What is DevOps? (Simple Explanation)

**DevOps = Development + Operations**

Think of it like this:
- **Development**: Writing code (what you've been doing)
- **Operations**: Making sure code runs reliably in production (what we'll learn)

**DevOps is about:**
1. **Automating** repetitive tasks (testing, deployment)
2. **Making code reliable** (testing, monitoring)
3. **Deploying safely** (containers, CI/CD)
4. **Catching problems early** (automated checks)

---

## 🎯 Learning Path (Start Here!)

### Level 1: Docker Basics (Week 1)
**What you'll learn:**
- What containers are
- Why Docker matters
- How to package your app

**What you'll build:**
- Dockerfile for backend
- Dockerfile for frontend
- docker-compose.yml

**Time:** 2-3 days

---

### Level 2: CI/CD Basics (Week 2)
**What you'll learn:**
- What CI/CD means
- How GitHub Actions works
- Automated testing

**What you'll build:**
- GitHub Actions workflow
- Automated tests
- Automated deployment

**Time:** 3-4 days

---

### Level 3: Testing (Week 3)
**What you'll learn:**
- Why testing matters
- Unit tests vs integration tests
- Test coverage

**What you'll build:**
- Backend tests (pytest)
- Frontend tests (Jest)
- Coverage reports

**Time:** 2-3 days

---

### Level 4: Monitoring (Week 4)
**What you'll learn:**
- Why monitoring matters
- Logging best practices
- Health checks

**What you'll build:**
- Structured logging
- Health check endpoints
- Error tracking

**Time:** 2-3 days

---

## 🚀 Let's Start: Level 1 - Docker

### What is Docker? (Simple Explanation)

**Without Docker:**
```
Your code works on your computer
But might not work on:
- Your friend's computer
- A server
- Production environment
```

**With Docker:**
```
Your code + everything it needs = Container
Container works the same everywhere!
```

**Real Example:**
- Your backend needs Python 3.11, specific packages
- Your friend has Python 3.9, different packages
- **Problem:** Code might not work
- **Solution:** Docker container has everything inside it

---

### Docker Concepts (Simple Terms)

#### 1. **Dockerfile**
**What it is:** Instructions for building a container
**Like:** A recipe for baking a cake
**Contains:** What to install, what files to copy, how to run

#### 2. **Docker Image**
**What it is:** A snapshot of your app with everything it needs
**Like:** A photo of your perfectly set up computer
**Contains:** Your code, Python, packages, everything

#### 3. **Docker Container**
**What it is:** A running instance of an image
**Like:** Actually running the app from that snapshot
**Contains:** Your running application

#### 4. **docker-compose**
**What it is:** A way to run multiple containers together
**Like:** Running backend + frontend + database all at once
**Contains:** Configuration for multiple services

---

### Step 1: Create Backend Dockerfile

**File:** `backend/Dockerfile`

**What this does:**
1. Starts with Python 3.11
2. Installs your packages
3. Copies your code
4. Runs your app

**Let's build it together!**

```dockerfile
# Step 1: Start with Python 3.11
FROM python:3.11-slim

# Step 2: Set working directory (like cd into folder)
WORKDIR /app

# Step 3: Install system dependencies (if needed)
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Step 4: Copy requirements first (for caching)
COPY requirements.txt .

# Step 5: Install Python packages
RUN pip install --no-cache-dir -r requirements.txt

# Step 6: Copy your code
COPY . .

# Step 7: Expose port 8000 (where FastAPI runs)
EXPOSE 8000

# Step 8: Health check (check if app is running)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"

# Step 9: Run the app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**What each line means:**
- `FROM python:3.11-slim` = Start with Python 3.11
- `WORKDIR /app` = Work in /app folder
- `RUN apt-get...` = Install system tools
- `COPY requirements.txt .` = Copy requirements file
- `RUN pip install...` = Install Python packages
- `COPY . .` = Copy all your code
- `EXPOSE 8000` = Make port 8000 available
- `CMD [...]` = Run this command when container starts

---

### Step 2: Create Frontend Dockerfile

**File:** `frontend/Dockerfile`

**What this does:**
1. Builds your Next.js app
2. Creates a production-ready image
3. Runs the app

```dockerfile
# Build stage - compile your app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Production stage - run the app
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

# Expose port 3000
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
```

**Why two stages?**
- **Builder stage:** Has all build tools (bigger, slower)
- **Production stage:** Only has what's needed to run (smaller, faster)

---

### Step 3: Create docker-compose.yml

**File:** `docker-compose.yml` (in root folder)

**What this does:**
- Runs backend and frontend together
- Sets up environment variables
- Connects them

```yaml
version: '3.8'

services:
  # Backend service
  backend:
    build: ./backend          # Build from backend/Dockerfile
    ports:
      - "8000:8000"          # Map port 8000
    environment:             # Environment variables
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_KEY=${SUPABASE_KEY}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
    volumes:
      - ./backend:/app        # Mount code for development
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s

  # Frontend service
  frontend:
    build: ./frontend         # Build from frontend/Dockerfile
    ports:
      - "3000:3000"          # Map port 3000
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend              # Wait for backend to start
    volumes:
      - ./frontend:/app
      - /app/node_modules
```

**What each part means:**
- `services:` = List of containers to run
- `build:` = Where to find Dockerfile
- `ports:` = Map container port to host port
- `environment:` = Environment variables
- `depends_on:` = Start order (frontend waits for backend)

---

### Step 4: Create .dockerignore Files

**Why?** Don't copy unnecessary files (makes build faster)

**File:** `backend/.dockerignore`
```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.env
.venv
*.log
.git
.gitignore
README.md
.pytest_cache
.coverage
htmlcov/
```

**File:** `frontend/.dockerignore`
```
node_modules
.next
.git
.gitignore
.env.local
.env*.local
npm-debug.log*
.DS_Store
coverage
```

---

### How to Use Docker (Commands)

#### Build Images
```bash
# Build backend
docker build -t truthguard-backend ./backend

# Build frontend
docker build -t truthguard-frontend ./frontend
```

#### Run with docker-compose
```bash
# Start everything
docker-compose up

# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Rebuild and start
docker-compose up --build
```

#### Useful Commands
```bash
# See running containers
docker ps

# See logs
docker-compose logs backend
docker-compose logs frontend

# Stop a container
docker stop <container-id>

# Remove containers
docker-compose down
```

---

## 🎓 Learning Checkpoint 1

**After completing Docker setup, you should understand:**
- ✅ What Docker is and why it's useful
- ✅ What a Dockerfile does
- ✅ How docker-compose works
- ✅ How to build and run containers

**Test your knowledge:**
1. What is the difference between a Docker image and container?
2. Why do we use docker-compose?
3. What does `EXPOSE 8000` mean?

---

## 🚀 Level 2: CI/CD Basics

### What is CI/CD? (Simple Explanation)

**CI = Continuous Integration**
- Every time you push code, automatically test it
- Catch bugs before they reach production

**CD = Continuous Deployment**
- Automatically deploy code that passes tests
- No manual deployment needed

**Real Example:**
```
You push code to GitHub
  ↓
GitHub Actions automatically:
  1. Runs tests
  2. Checks code quality
  3. Builds Docker images
  4. Deploys to production
```

**Benefits:**
- Catch bugs early
- Deploy faster
- Less manual work
- More confidence

---

### CI/CD Concepts (Simple Terms)

#### 1. **Workflow**
**What it is:** A set of automated steps
**Like:** A recipe that runs automatically
**Contains:** Steps like "test", "build", "deploy"

#### 2. **Trigger**
**What it is:** What starts the workflow
**Like:** A button that starts the process
**Examples:** Push to main, pull request, schedule

#### 3. **Job**
**What it is:** A task that runs
**Like:** "Run tests" or "Build Docker image"
**Contains:** Steps to complete the task

#### 4. **Step**
**What it is:** One action in a job
**Like:** "Install dependencies" or "Run tests"
**Contains:** Commands to run

---

### Step 1: Create GitHub Actions Workflow

**File:** `.github/workflows/backend-ci.yml`

**What this does:**
1. Runs when you push code
2. Tests your code
3. Builds Docker image
4. (Optional) Deploys

```yaml
name: Backend CI/CD

# When to run
on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'  # Only if backend files change
  pull_request:
    branches: [main, develop]
    paths:
      - 'backend/**'

# Jobs to run
jobs:
  test:
    runs-on: ubuntu-latest  # Use Ubuntu server
    
    steps:
      # Step 1: Get your code
      - uses: actions/checkout@v4
      
      # Step 2: Set up Python
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          cache: 'pip'  # Cache packages for speed
      
      # Step 3: Install dependencies
      - name: Install dependencies
        working-directory: ./backend
        run: |
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      # Step 4: Run tests
      - name: Run tests
        working-directory: ./backend
        run: pytest --cov=app
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_KEY: ${{ secrets.SUPABASE_KEY }}
      
      # Step 5: Build Docker image
      - name: Build Docker image
        working-directory: ./backend
        run: docker build -t truthguard-backend:latest .
```

**What each part means:**
- `on:` = When to trigger (push, PR, schedule)
- `jobs:` = Tasks to run
- `runs-on:` = What server to use
- `steps:` = Individual actions
- `uses:` = Use a pre-made action
- `run:` = Run a command
- `env:` = Environment variables

---

### Step 2: Set Up GitHub Secrets

**Why?** Store sensitive info (API keys) securely

**How:**
1. Go to GitHub repo
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `GEMINI_API_KEY`

**What are secrets?**
- Environment variables that are hidden
- Only accessible in workflows
- Never shown in logs

---

### Step 3: Create Frontend CI/CD

**File:** `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci
      
      - name: Lint
        working-directory: ./frontend
        run: npm run lint
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}
```

---

## 🎓 Learning Checkpoint 2

**After completing CI/CD setup, you should understand:**
- ✅ What CI/CD means
- ✅ How GitHub Actions works
- ✅ What triggers a workflow
- ✅ How to use secrets

**Test your knowledge:**
1. What's the difference between CI and CD?
2. When does the workflow run?
3. Why do we use secrets?

---

## 🚀 Level 3: Testing Basics

### Why Testing? (Simple Explanation)

**Without tests:**
- You manually test everything
- Easy to miss bugs
- Scary to change code

**With tests:**
- Automated checking
- Catch bugs early
- Safe to change code

**Real Example:**
```
You change a function
  ↓
Tests run automatically
  ↓
If tests pass → Code is probably OK
If tests fail → Something broke
```

---

### Testing Concepts (Simple Terms)

#### 1. **Unit Test**
**What it is:** Test one function/component
**Like:** Testing if a calculator adds correctly
**Example:** Test `detect_hallucinations()` function

#### 2. **Integration Test**
**What it is:** Test multiple parts together
**Like:** Testing if calculator + display work together
**Example:** Test API endpoint end-to-end

#### 3. **Test Coverage**
**What it is:** How much of your code is tested
**Like:** Percentage of code that has tests
**Goal:** 60%+ coverage

---

### Step 1: Backend Testing Setup

**File:** `backend/pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v                    # Verbose output
    --cov=app            # Coverage for app folder
    --cov-report=html    # HTML report
    --cov-report=term    # Terminal report
```

**File:** `backend/tests/unit/test_detection.py`

```python
import pytest
from app.services.detection import detect_hallucinations

@pytest.mark.unit
class TestDetection:
    def test_detect_hallucination(self):
        """Test that we catch false information"""
        query = "What is Python in programming?"
        ai_response = "Python is a snake"
        
        result = await detect_hallucinations(
            query=query,
            ai_response=ai_response,
            organization_id="test-org"
        )
        
        # Assertions (what we expect)
        assert result['status'] == 'blocked'
        assert result['confidence_score'] < 0.5
        assert len(result['violations']) > 0
    
    def test_approve_correct_response(self):
        """Test that correct info is approved"""
        query = "What is Python?"
        ai_response = "Python is a programming language"
        
        result = await detect_hallucinations(
            query=query,
            ai_response=ai_response,
            organization_id="test-org"
        )
        
        assert result['status'] == 'approved'
        assert result['confidence_score'] > 0.7
```

**How to run:**
```bash
cd backend
pytest                    # Run all tests
pytest tests/unit/        # Run unit tests only
pytest --cov=app          # Run with coverage
```

---

### Step 2: Frontend Testing Setup

**File:** `frontend/jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**File:** `frontend/__tests__/components/SeverityBadge.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import SeverityBadge from '@/components/common/SeverityBadge'

describe('SeverityBadge', () => {
  it('renders critical severity correctly', () => {
    render(<SeverityBadge severity="critical" />)
    expect(screen.getByText('CRITICAL')).toBeInTheDocument()
  })
  
  it('applies correct color for high severity', () => {
    const { container } = render(<SeverityBadge severity="high" />)
    const badge = container.querySelector('span')
    expect(badge).toHaveClass('bg-[#f59e0b]')
  })
})
```

**How to run:**
```bash
cd frontend
npm test                  # Run tests
npm test -- --coverage   # Run with coverage
npm test -- --watch      # Watch mode
```

---

## 🎓 Learning Checkpoint 3

**After completing testing setup, you should understand:**
- ✅ Why testing is important
- ✅ Difference between unit and integration tests
- ✅ How to write tests
- ✅ How to measure coverage

**Test your knowledge:**
1. What's a unit test?
2. Why is test coverage important?
3. How do you run tests?

---

## 🚀 Level 4: Monitoring Basics

### Why Monitoring? (Simple Explanation)

**Without monitoring:**
- You don't know if app is broken
- Users report problems first
- Hard to debug issues

**With monitoring:**
- Know immediately if something breaks
- See performance issues
- Debug faster

**Real Example:**
```
App crashes
  ↓
Monitoring system sends alert
  ↓
You fix it before users notice
```

---

### Monitoring Concepts (Simple Terms)

#### 1. **Logging**
**What it is:** Recording what happens
**Like:** A diary for your app
**Contains:** Errors, info, warnings

#### 2. **Health Check**
**What it is:** Check if app is running
**Like:** Asking "Are you OK?"
**Returns:** Healthy or unhealthy

#### 3. **Metrics**
**What it is:** Numbers about your app
**Like:** How many requests, how fast
**Examples:** Response time, error rate

---

### Step 1: Structured Logging

**File:** `backend/app/utils/logging.py`

```python
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'message': record.getMessage(),
            'module': record.module,
        }
        return json.dumps(log_data)

# Set up logger
logger = logging.getLogger('truthguard')
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

**How to use:**
```python
from app.utils.logging import logger

logger.info("User validated response")
logger.error("Failed to connect to database")
logger.warning("Low confidence score detected")
```

---

### Step 2: Health Check Endpoint

**File:** `backend/app/api/v1/health.py`

```python
@router.get("/health")
async def health_check():
    """Check if app is healthy"""
    return {
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'services': {
            'database': 'healthy',
            'api': 'healthy'
        }
    }
```

**Why?**
- Docker uses this to check if container is running
- Monitoring tools check this
- Load balancers use this

---

## 🎓 Learning Checkpoint 4

**After completing monitoring setup, you should understand:**
- ✅ Why monitoring is important
- ✅ What logging is
- ✅ What health checks do
- ✅ How to use metrics

**Test your knowledge:**
1. Why do we log in JSON format?
2. What is a health check?
3. How does monitoring help?

---

## 📋 Complete Learning Checklist

### Week 1: Docker
- [ ] Understand what Docker is
- [ ] Create backend Dockerfile
- [ ] Create frontend Dockerfile
- [ ] Create docker-compose.yml
- [ ] Build and run containers
- [ ] Understand .dockerignore

### Week 2: CI/CD
- [ ] Understand CI/CD concepts
- [ ] Create GitHub Actions workflow
- [ ] Set up GitHub secrets
- [ ] Test workflow runs on push
- [ ] Understand triggers and jobs

### Week 3: Testing
- [ ] Understand why testing matters
- [ ] Set up pytest for backend
- [ ] Set up Jest for frontend
- [ ] Write 5+ unit tests
- [ ] Write 2+ integration tests
- [ ] Understand test coverage

### Week 4: Monitoring
- [ ] Understand monitoring concepts
- [ ] Set up structured logging
- [ ] Create health check endpoint
- [ ] Understand metrics
- [ ] Set up error tracking (optional)

---

## 🎯 Interview Talking Points (After Learning)

### Docker
- "I containerized the application using Docker, making deployment consistent across environments"
- "Used multi-stage builds to optimize image size"
- "Docker Compose allows running the entire stack with one command"

### CI/CD
- "Set up CI/CD pipeline that automatically tests code on every push"
- "GitHub Actions runs tests, linting, and builds Docker images automatically"
- "Automated deployment reduces manual errors and speeds up releases"

### Testing
- "Wrote comprehensive tests with 60%+ coverage"
- "Separated unit tests from integration tests for better organization"
- "Tests run automatically in CI/CD pipeline, catching bugs early"

### Monitoring
- "Implemented structured JSON logging for production observability"
- "Health check endpoints allow monitoring tools to track application status"
- "Logging helps debug issues quickly in production"

---

## 💡 Pro Tips for Learning

1. **Start Small**: Don't try to learn everything at once
2. **Practice**: Build, break, fix - that's how you learn
3. **Ask Questions**: If something doesn't make sense, ask!
4. **Read Error Messages**: They tell you what's wrong
5. **Experiment**: Try changing things and see what happens

---

## 🆘 Common Issues & Solutions

### Docker Issues

**Problem:** "Cannot connect to Docker daemon"
**Solution:** Make sure Docker Desktop is running

**Problem:** "Port already in use"
**Solution:** Stop other services using that port, or change port

**Problem:** "Build failed"
**Solution:** Check Dockerfile syntax, check if files exist

### CI/CD Issues

**Problem:** "Workflow not running"
**Solution:** Check file path (`.github/workflows/`), check YAML syntax

**Problem:** "Tests failing"
**Solution:** Check if tests work locally first

**Problem:** "Secrets not found"
**Solution:** Make sure secrets are set in GitHub Settings

### Testing Issues

**Problem:** "Tests can't find modules"
**Solution:** Check imports, check PYTHONPATH

**Problem:** "Tests pass locally but fail in CI"
**Solution:** Check environment variables, check dependencies

---

## 📚 Additional Resources

### Docker
- [Docker Official Docs](https://docs.docker.com/)
- [Docker Compose Guide](https://docs.docker.com/compose/)

### CI/CD
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GitHub Actions Examples](https://github.com/actions)

### Testing
- [Pytest Docs](https://docs.pytest.org/)
- [Jest Docs](https://jestjs.io/)

### Monitoring
- [Python Logging Guide](https://docs.python.org/3/howto/logging.html)
- [Structured Logging Best Practices](https://www.datadoghq.com/blog/python-logging-best-practices/)

---

## 🎉 You're Ready!

Once you complete all 4 levels, you'll have:
- ✅ Docker knowledge
- ✅ CI/CD experience
- ✅ Testing skills
- ✅ Monitoring understanding
- ✅ Production-ready project

**Remember:** Learning DevOps is a journey. Start with Docker, then move to CI/CD, then testing, then monitoring. Take your time and practice!

---

## 🤝 I'm Here to Help!

**When you're ready to start:**
1. Tell me which level you want to start with
2. I'll guide you step-by-step
3. We'll implement it together
4. I'll explain everything as we go

**Ready to begin?** Let's start with Docker (Level 1) - it's the foundation for everything else!

