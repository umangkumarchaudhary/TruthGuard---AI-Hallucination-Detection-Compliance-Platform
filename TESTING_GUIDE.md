# 🧪 TruthGuard - Testing Guide

**Project:** TruthGuard - AI Hallucination Detection & Compliance Platform  
**Purpose:** Manual and automated testing procedures

---

## 📋 Testing Overview

This guide covers:
1. **Automated Tests:** Scripts that can run automatically
2. **Manual Tests:** Tests that require human interaction
3. **Integration Tests:** End-to-end flow testing
4. **Demo Scenarios:** Real-world test cases

---

## 🤖 Automated Tests

### 1. Integration Test Suite

**Location:** `backend/test_integration.py`

**Run:**
```bash
cd backend
python test_integration.py
```

**What it tests:**
- ✅ Database connection
- ✅ Detection pipeline
- ✅ Compliance checking
- ✅ Policy matching
- ✅ Audit logging
- ✅ Complete user flow

**Expected Output:**
```
━━━ Testing: Database Connection ━━━
✅ Database connection successful
━━━ Testing: Detection Pipeline ━━━
✅ Detection pipeline working - Status: flagged
...
```

---

### 2. Detection System Tests

**Location:** `backend/test_detection.py` (if exists)

**Run:**
```bash
cd backend
python test_detection.py
```

**What it tests:**
- Claim extraction
- Fact verification
- Citation validation
- Consistency checking
- Confidence scoring

---

### 3. Compliance System Tests

**Location:** `backend/test_compliance.py`

**Run:**
```bash
cd backend
python test_compliance.py
```

**What it tests:**
- Rule engine
- Compliance checking
- Policy matching
- Auto-correction

---

### 4. Audit System Tests

**Location:** `backend/test_audit.py`

**Run:**
```bash
cd backend
python test_audit.py
```

**What it tests:**
- Audit logging
- Explanation generation
- Query functionality
- Export functionality

---

## 👤 Manual Tests

### Test 1: Complete User Flow

**Steps:**
1. **Start Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Authentication:**
   - [ ] Visit http://localhost:3000/login
   - [ ] Create account or login
   - [ ] Verify redirect to dashboard

4. **Test Dashboard:**
   - [ ] Verify metrics cards display
   - [ ] Verify charts render
   - [ ] Verify recent interactions show

5. **Test Validation:**
   - [ ] Use API or frontend to validate a response
   - [ ] Verify detection works
   - [ ] Verify violations are detected
   - [ ] Verify audit log is created

6. **Test Interactions Page:**
   - [ ] View interactions list
   - [ ] Test search functionality
   - [ ] Test filtering
   - [ ] Click to view details
   - [ ] Verify full audit trail displays

7. **Test Violations Page:**
   - [ ] View violations list
   - [ ] Test severity filtering
   - [ ] Test type filtering
   - [ ] Click to view related interaction

8. **Test Policy Management:**
   - [ ] Create new policy
   - [ ] Edit existing policy
   - [ ] Delete policy
   - [ ] Verify policy is used in validation

9. **Test Compliance Rules:**
   - [ ] Create new rule
   - [ ] Edit rule
   - [ ] Test rule against sample response
   - [ ] Verify rule triggers violations

10. **Test Analytics:**
    - [ ] View analytics page
    - [ ] Verify charts display
    - [ ] Verify statistics are accurate

11. **Test Settings:**
    - [ ] Update organization name
    - [ ] Set API key
    - [ ] Configure notifications

**Expected Results:**
- All pages load correctly
- All features work as expected
- No console errors
- Data displays correctly

---

### Test 2: API Endpoint Testing

**Tools:** Postman, curl, or browser

**Endpoints to Test:**

1. **Health Check:**
   ```bash
   curl http://localhost:8000/health
   ```
   Expected: `{"status": "healthy"}`

2. **Validation Endpoint:**
   ```bash
   curl -X POST http://localhost:8000/api/v1/validate \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your_api_key" \
     -d '{
       "query": "What is my credit limit?",
       "ai_response": "Your credit limit is $50,000",
       "ai_model": "gpt-4",
       "organization_id": "your_org_id"
     }'
   ```
   Expected: Validation response with status, violations, etc.

3. **Get Interactions:**
   ```bash
   curl http://localhost:8000/api/v1/audit/interactions?limit=10 \
     -H "X-API-Key: your_api_key"
   ```
   Expected: List of interactions

4. **Get Stats:**
   ```bash
   curl http://localhost:8000/api/v1/audit/stats?organization_id=your_org_id \
     -H "X-API-Key: your_api_key"
   ```
   Expected: Statistics object

5. **Get Violations:**
   ```bash
   curl http://localhost:8000/api/v1/audit/violations?limit=10 \
     -H "X-API-Key: your_api_key"
   ```
   Expected: List of violations

**Check:**
- [ ] All endpoints return correct status codes
- [ ] Response format matches documentation
- [ ] Error handling works correctly
- [ ] Authentication works

---

### Test 3: Demo Scenarios

**Location:** `backend/scripts/seed_demo_data.py`

**Setup:**
```bash
cd backend
python scripts/seed_demo_data.py
```

**Scenarios to Test:**

1. **Financial Services - Investment Advice:**
   - Query: "Should I invest all my savings in cryptocurrency?"
   - AI Response: "Yes, crypto always goes up. Invest all your savings."
   - Expected: Blocked, compliance violations

2. **Airlines - Refund Promise:**
   - Query: "Can I get a refund for my canceled flight?"
   - AI Response: "Yes, full refund within 24 hours guaranteed."
   - Expected: Flagged, policy violations

3. **Consulting - Regulatory Citation:**
   - Query: "What does GDPR Article 25 require?"
   - AI Response: "GDPR Article 25 requires annual data deletion. [fake URL]"
   - Expected: Flagged, hallucination and citation violations

**Verify:**
- [ ] Each scenario creates interaction
- [ ] Violations are detected correctly
- [ ] Explanations are generated
- [ ] Audit trail is complete

---

### Test 4: Mobile Responsiveness

**Steps:**
1. Open frontend in browser
2. Open DevTools (F12)
3. Toggle device toolbar
4. Test on different devices:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)

**Check:**
- [ ] Sidebar becomes hamburger menu on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Cards stack properly
- [ ] Buttons are touch-friendly
- [ ] Text is readable
- [ ] No horizontal scrolling issues

---

### Test 5: Performance Testing

**Tools:** Browser DevTools, Lighthouse

**Steps:**
1. Open frontend in browser
2. Open DevTools → Lighthouse
3. Run performance audit
4. Check:
   - [ ] First Contentful Paint < 1.5s
   - [ ] Time to Interactive < 3.5s
   - [ ] Total Blocking Time < 200ms
   - [ ] Cumulative Layout Shift < 0.1

**API Performance:**
- [ ] API response time < 2s
- [ ] Database queries optimized
- [ ] No N+1 queries
- [ ] Caching where appropriate

---

### Test 6: Error Handling

**Test Cases:**

1. **Invalid API Key:**
   - Send request with wrong API key
   - Expected: 401 Unauthorized

2. **Missing Required Fields:**
   - Send validation request without required fields
   - Expected: 400 Bad Request with error message

3. **Invalid Organization ID:**
   - Use non-existent organization ID
   - Expected: Appropriate error handling

4. **Database Connection Error:**
   - Simulate database downtime
   - Expected: Graceful error, no crash

5. **Network Error:**
   - Disconnect network during request
   - Expected: Error message, retry option

**Verify:**
- [ ] Errors are handled gracefully
- [ ] Error messages are user-friendly
- [ ] System doesn't crash
- [ ] Logs are created for errors

---

## 🎬 Demo Scenarios

### Scenario 1: Financial Services (AmEx/Barclays)

**Setup:**
1. Create financial services organization
2. Add SEC compliance rules
3. Add investment advice policies

**Demo Flow:**
1. User asks: "Should I invest in crypto?"
2. AI responds: "Yes, crypto always goes up. Invest all your savings."
3. TruthGuard detects:
   - Compliance violation (SEC - no guarantees)
   - Hallucination (crypto doesn't always go up)
   - Missing disclaimer
4. Corrected response shown
5. Audit trail created

**Expected Result:**
- Response blocked
- Multiple violations detected
- Corrected response generated
- Complete audit trail

---

### Scenario 2: Airlines (United)

**Setup:**
1. Create airline organization
2. Add refund policies
3. Add DOT compliance rules

**Demo Flow:**
1. User asks: "Can I get a refund for canceled flight?"
2. AI responds: "Yes, full refund within 24 hours guaranteed."
3. TruthGuard detects:
   - Policy violation (refunds take 7-10 days)
   - Compliance violation (can't guarantee timeline)
4. Corrected response shown

**Expected Result:**
- Response flagged
- Policy violations detected
- Corrected response generated

---

### Scenario 3: Consulting (KPMG)

**Setup:**
1. Create consulting organization
2. Add regulatory citation rules
3. Add accuracy policies

**Demo Flow:**
1. User asks: "What does GDPR Article 25 say?"
2. AI responds: "GDPR Article 25 requires annual data deletion. [fake URL]"
3. TruthGuard detects:
   - Hallucination (wrong interpretation)
   - Fake citation (URL doesn't exist)
4. Corrected response with accurate information

**Expected Result:**
- Response flagged
- Hallucination detected
- Citation validation failed
- Corrected response with accurate info

---

## 📊 Test Results Template

**Date:** _______________
**Tester:** _______________
**Environment:** Development / Staging / Production

### Automated Tests
- [ ] Integration tests: PASS / FAIL
- [ ] Detection tests: PASS / FAIL
- [ ] Compliance tests: PASS / FAIL
- [ ] Audit tests: PASS / FAIL

### Manual Tests
- [ ] User flow: PASS / FAIL
- [ ] API endpoints: PASS / FAIL
- [ ] Demo scenarios: PASS / FAIL
- [ ] Mobile responsiveness: PASS / FAIL
- [ ] Performance: PASS / FAIL
- [ ] Error handling: PASS / FAIL

### Issues Found
1. _______________________________
2. _______________________________
3. _______________________________

### Notes
_________________________________
_________________________________

---

## 🐛 Bug Reporting

**Template:**
```
**Title:** [Brief description]
**Severity:** Critical / High / Medium / Low
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- OS: 
- Browser: 
- Version: 

**Screenshots:**
[If applicable]
```

---

## ✅ Testing Checklist

### Pre-Release
- [ ] All automated tests passing
- [ ] All manual tests completed
- [ ] Demo scenarios tested
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable
- [ ] Error handling verified
- [ ] Security tested
- [ ] Documentation updated

### Post-Release
- [ ] Production health checks passing
- [ ] Monitoring configured
- [ ] Error tracking set up
- [ ] User feedback collected

---

**Happy Testing! 🧪**

