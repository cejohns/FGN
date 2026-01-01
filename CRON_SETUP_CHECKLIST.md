# CRON_SECRET Setup Checklist

Quick reference checklist for setting up CRON_SECRET authentication in your FireStar Gaming Network.

## ✅ Pre-Deployment Checklist

### 1. Generate Secret
- [ ] Generate a cryptographically secure random secret (32+ bytes)
  ```bash
  openssl rand -base64 32
  ```

### 2. Configure Edge Functions
- [ ] Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
- [ ] Add secret:
  - Key: `CRON_SECRET`
  - Value: Your generated secret
- [ ] Click Save

### 3. Configure Database
- [ ] Open Supabase SQL Editor
- [ ] Run:
  ```sql
  INSERT INTO public.app_secrets (key, value, description)
  VALUES (
    'cron_secret',
    'YOUR_SECRET_HERE',
    'Secret for authenticating scheduled cron jobs'
  )
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, updated_at = now();
  ```

### 4. Verify Configuration
- [ ] Check database:
  ```sql
  SELECT key, description FROM public.app_secrets WHERE key = 'cron_secret';
  ```
- [ ] Check scheduled jobs:
  ```sql
  SELECT * FROM public.scheduled_jobs;
  ```

### 5. Test Security
- [ ] Run verification script:
  ```bash
  SUPABASE_URL=https://your-project.supabase.co \
  CRON_SECRET=your-secret \
  ./verify-cron-security.sh
  ```
- [ ] Verify all tests pass

### 6. Monitor First Run
- [ ] Wait for first scheduled job to run (or trigger manually)
- [ ] Check edge function logs for success
- [ ] Verify data was synced correctly

## 📋 Post-Deployment Checklist

### Security Verification
- [ ] CRON_SECRET not in version control
- [ ] CRON_SECRET not prefixed with `VITE_`
- [ ] Secret not exposed in build output
- [ ] RLS policies active on all content tables
- [ ] Admin authentication working correctly

### Scheduled Jobs Status
- [ ] `daily-game-releases-sync` - Active
- [ ] `sync-platform-news-6h` - Active
- [ ] `sync-youtube-news-12h` - Active
- [ ] `update-game-images-weekly` - Active

### Testing Completed
- [ ] Unauthenticated calls return 403
- [ ] Invalid secret returns 401
- [ ] Valid secret returns 200/success
- [ ] Admin JWT authentication still works
- [ ] Manual triggers from admin panel work

## 🔄 Maintenance Schedule

### Every 90 Days
- [ ] Rotate CRON_SECRET
- [ ] Update both Edge Functions and database
- [ ] Test with new secret
- [ ] Monitor for 24 hours

### Monthly
- [ ] Review cron job execution logs
- [ ] Check for failed jobs
- [ ] Verify data sync is current

### As Needed
- [ ] Update API keys if rate limits reached
- [ ] Adjust schedules based on usage patterns
- [ ] Add new scheduled jobs as features expand

## 📚 Documentation References

- **[CRON_SECURITY.md](./CRON_SECURITY.md)** - Complete security guide
- **[AUTOMATED_SYNC_GUIDE.md](./AUTOMATED_SYNC_GUIDE.md)** - Sync setup and monitoring
- **[EDGE_FUNCTION_SECURITY.md](./EDGE_FUNCTION_SECURITY.md)** - Edge function auth overview

## 🆘 Quick Troubleshooting

### Jobs Not Running
```sql
-- Check job status
SELECT * FROM cron.job_run_details
WHERE status = 'failed'
ORDER BY start_time DESC;

-- Verify secret exists
SELECT key FROM public.app_secrets WHERE key = 'cron_secret';
```

### 401 Errors
Secret mismatch between Edge Functions and database. Update database:
```sql
UPDATE public.app_secrets
SET value = 'YOUR_SECRET_HERE', updated_at = now()
WHERE key = 'cron_secret';
```

### No Data Updates
Check API keys are configured:
- TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET (for IGDB)
- RAWG_API_KEY (for RAWG)
- YOUTUBE_API_KEY (for YouTube sync)

## ✨ Success Criteria

Your CRON_SECRET setup is complete when:

✅ All scheduled jobs appear in `public.scheduled_jobs` view
✅ Verification script passes all tests
✅ Unauthenticated requests are blocked (403)
✅ Invalid secrets are rejected (401)
✅ Valid secret authenticates successfully
✅ Admin panel manual triggers work
✅ First automated job runs successfully
✅ Content syncs appear in database
✅ No security warnings in logs
✅ CRON_SECRET not in client bundle

---

**Last Updated**: 2026-01-01
**Version**: 1.0
