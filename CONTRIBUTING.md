# Contributing to WiseCat AI

## Code Review Requirements

### 🚨 MANDATORY: Code Review Before Deployment

**All code changes MUST pass `/code-review-checklist` before deployment.**

This applies to:
- CSS/styling changes
- JavaScript/TypeScript functionality
- HTML structure modifications
- Cloud Functions updates
- Configuration changes

### Workflow

```bash
# 1. Make your changes
# ... edit files ...

# 2. Run mandatory code review
/code-review-checklist

# 3. Address any blocking issues (🔴)
# ... fix issues ...

# 4. Only after approval, build and deploy
npm run build
npx firebase-tools deploy --project wisecat-8df8d --only hosting
```

### Review Criteria

The code review checks:

#### ✅ Correctness
- Functionality works as expected
- Edge cases handled
- No obvious bugs

#### ✅ Security
- No XSS/injection vulnerabilities
- No hardcoded secrets
- Input validation present
- Prompt injection protection (AI features)

#### ✅ Performance
- No N+1 queries
- Bundle size considered
- Appropriate caching

#### ✅ Code Quality
- Clear naming conventions
- DRY principle (no duplication)
- Appropriate abstraction level
- SOLID principles followed

#### ✅ Testing
- Unit tests for new features
- Edge cases tested

#### ✅ Documentation
- Complex logic commented
- README updated if needed

### Review Severity

- 🔴 **BLOCKING**: Must fix before deployment
- 🟡 **SUGGESTION**: Should fix if time permits
- 🟢 **NIT**: Minor improvements
- ❓ **QUESTION**: Clarifications needed

### Example Review Session

```
User: [Makes CSS changes to fix header layout]

Agent: I'll review the changes using /code-review-checklist

[Runs code review]

Review Results:
✅ Correctness: Header layout fixed properly
✅ Security: CSS-only changes, no security impact
✅ Performance: Removed duplicate CSS rules, improved bundle size
🟡 SUGGESTION: Consider reducing !important usage in future
✅ APPROVED

[Proceeds to build and deploy]
```

## Questions?

- Check [AGENTS_WORKFLOW.md](./AGENTS_WORKFLOW.md) for deployment standards
- See project documentation for specific feature requirements