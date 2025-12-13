# 🔧 Function Definition Fix

## Issue
Error: `name 'extract_claim_predicate' is not defined`

## Cause
The functions `extract_claim_predicate` and `extract_article_description` are defined at the top of the file, but the server may need to be restarted to load them.

## Solution
1. **Restart the backend server** to load the new function definitions
2. Added try-except blocks to gracefully handle NameError if functions aren't loaded

## Functions Added
- `extract_claim_predicate(claim_lower: str) -> str` - Extracts what the claim says the subject IS
- `extract_article_description(summary_lower: str, title_lower: str) -> str` - Extracts what the article says the subject IS

## Location
Both functions are defined at the **top of the file** (lines 21-89) before any async functions that use them.

## To Fix
1. Stop the backend server (Ctrl+C)
2. Restart it: `uvicorn app.main:app --reload`
3. The functions will now be available

## Verification
After restart, test with:
- Query: "What is React"
- Response: "React is a body part name"

Should now show:
- Status: BLOCKED
- Verification: FALSE
- Details: "INCORRECT: claim contradicts article content..."

