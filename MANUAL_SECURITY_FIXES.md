# Manual Security Fixes Required

## Overview

After applying comprehensive database security fixes via migrations, only two security improvements remain that require manual configuration changes in the Supabase Dashboard. These cannot be applied via SQL migrations.

**All Other Issues:** ✅ Fixed via migrations (45+ security issues resolved)
**Status:** ⚠️ 2 Manual Actions Required
**Priority:** Medium (Auth Connection Strategy), High (Password Protection)

---

## 1. Enable Leaked Password Protection

### Why This Matters
Prevents users from using passwords that have been compromised in data breaches. Supabase checks passwords against the HaveIBeenPwned.org database.

### Steps to Enable

1. **Navigate to Auth Settings**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Click "Authentication" in the left sidebar
   - Click "Settings" tab

2. **Enable Password Protection**
   - Find "Leaked Password Protection" section
   - Toggle the switch to **Enabled**
   - Save changes

3. **User Communication**
   - Notify existing users that weak/compromised passwords will need to be changed
   - Users with leaked passwords will be prompted to reset on next login
   - New users cannot register with compromised passwords

### Security Impact
- ✅ Prevents use of known compromised passwords
- ✅ Reduces account takeover risk
- ✅ Industry best practice for auth security
- ✅ No performance impact (checked at signup/password change only)

### Testing
After enabling:
1. Try to create a test account with password: `password123`
2. Should be rejected with "Password has been leaked" error
3. Use a strong unique password instead

---

## 2. Configure Auth Connection Strategy

### Why This Matters
Currently, the Auth server uses a fixed number of database connections (10). If you increase your database instance size, Auth won't automatically use more connections. Using percentage-based allocation is more flexible.

### Steps to Configure

1. **Navigate to Database Settings**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Click "Settings" in the left sidebar
   - Click "Database" tab

2. **Change Connection Strategy**
   - Find "Connection Pooling" section
   - Locate "Auth Pooler Connections"
   - Change from **Fixed (10)** to **Percentage-based**
   - Set to **10-20%** of total connections
   - Save changes

3. **Calculate Percentage**
   ```
   Example: If you have 100 total connections:
   - 10% = 10 connections (current)
   - 15% = 15 connections (recommended)
   - 20% = 20 connections (if auth-heavy workload)
   ```

### Performance Impact
- ✅ Scales automatically with instance upgrades
- ✅ Better resource utilization
- ✅ Prevents auth connection saturation
- ✅ No immediate impact (same connection count initially)

### When to Prioritize
- If you plan to upgrade database instance
- If experiencing auth connection timeouts
- If auth workload is increasing
- Not urgent if auth is working fine

---

## 3. Optional: Review Other Auth Settings

While making these changes, consider reviewing other auth settings:

### Email Templates
- Customize password reset emails
- Add your branding
- Improve user experience

### Email Providers
- Configure custom SMTP (production)
- Better deliverability
- Professional sender addresses

### Rate Limiting
- Protect against brute force attacks
- Configure rate limits for login attempts
- Already reasonable defaults

### Session Management
- JWT expiry time (default: 1 hour)
- Refresh token expiry (default: 30 days)
- Consider your security vs. UX tradeoff

---

## Verification Checklist

After making these changes, verify:

### Leaked Password Protection
- [ ] Setting is enabled in dashboard
- [ ] Test user cannot register with weak password
- [ ] Existing users with weak passwords prompted to change
- [ ] Error messages are user-friendly

### Connection Strategy
- [ ] Setting changed to percentage-based
- [ ] Percentage set to appropriate value (10-20%)
- [ ] Auth connections working normally
- [ ] No connection timeout errors

### Monitoring
- [ ] Check Auth error logs for issues
- [ ] Monitor connection pool usage
- [ ] Watch for user complaints about password resets
- [ ] Track failed login attempts

---

## Timeline

### Priority 1: Leaked Password Protection
**Timeline:** Enable within 24-48 hours
**Impact:** High security benefit
**Risk:** Low (only affects new passwords)

### Priority 2: Connection Strategy
**Timeline:** Enable within 1-2 weeks
**Impact:** Medium (future-proofing)
**Risk:** Very low (no behavior change initially)

---

## Support Resources

### Supabase Documentation
- [Auth Security Best Practices](https://supabase.com/docs/guides/auth/auth-helpers/security)
- [Database Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [HaveIBeenPwned Integration](https://supabase.com/docs/guides/auth/auth-password-reset)

### Getting Help
If you encounter issues:
1. Check Supabase status page
2. Review error logs in dashboard
3. Contact Supabase support
4. Check community forums

---

## Notes

### Why Not Via Migration?
These settings are:
- Auth service configuration (not database)
- Project-level settings (not SQL objects)
- Require API/service restarts
- Only accessible via dashboard/API

### Impact on Development
- Changes apply immediately
- No code changes needed
- No database schema changes
- Transparent to application

### Testing in Development
If you have a staging environment:
1. Enable these settings in staging first
2. Test for 24-48 hours
3. Monitor for issues
4. Then enable in production

---

**Document Version:** 1.0
**Last Updated:** 2026-01-03
**Status:** ⚠️ Manual Action Required
