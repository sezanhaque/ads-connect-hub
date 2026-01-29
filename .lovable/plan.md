
# Plan: Remove Google Sheets Integration

## Overview
This plan removes all Google Sheets integration functionality from the codebase, including frontend components, hooks, edge functions, routes, and database references.

---

## Files to Delete Completely

### Frontend Components & Pages
| File | Purpose |
|------|---------|
| `src/components/GoogleSheetsSelector.tsx` | UI for authenticating with Google and selecting private sheets |
| `src/pages/GoogleAuthCallback.tsx` | OAuth redirect handler for Google authentication |
| `src/pages/OrganizationSettings.tsx` | Entire page is dedicated to Google Sheets setup |

### Edge Functions (Supabase)
| File | Purpose |
|------|---------|
| `supabase/functions/google-auth/index.ts` | Google OAuth flow handling |
| `supabase/functions/google-sheets-list/index.ts` | Lists spreadsheets from user's Google Drive |
| `supabase/functions/google-sheets-sync/index.ts` | Syncs jobs from public Google Sheets |
| `supabase/functions/google-sheets-private-sync/index.ts` | Syncs jobs from private Google Sheets |

---

## Files to Modify

### 1. `src/App.tsx`
- Remove import of `GoogleAuthCallback`
- Remove import of `OrganizationSettings`
- Remove route: `/auth/google/callback`
- Remove route: `/settings/organization`

### 2. `src/hooks/useIntegrations.ts`
- Remove `syncGoogleSheets` function
- Remove `syncJobsFromSheet` function
- Remove `syncPrivateGoogleSheets` function
- Update the return statement to exclude these functions

### 3. `src/pages/Jobs.tsx`
- Remove import of `useIntegrations` (if only used for Google Sheets)
- Remove `syncJobsFromSheet` and `integrationsLoading` from destructuring
- Remove `organization` state and `fetchOrganization` function
- Remove `handleSync` function
- Update page description to remove "sync with Google Sheets" text
- Remove the commented-out Sync button (already hidden but should be deleted)

### 4. `src/components/IntegrationGuide.tsx`
- Remove the entire `googleSheetsSteps` array
- Update the component logic to only handle Meta Ads (or remove entirely if Google Sheets was the primary use case)

### 5. `supabase/config.toml`
- Remove configuration blocks for:
  - `[functions.google-sheets-sync]`
  - `[functions.google-auth]`
  - `[functions.google-sheets-list]`
  - `[functions.google-sheets-private-sync]`

---

## Database Changes
A migration will be created to remove the `google_sheet_id` column from the `organizations` table:

```sql
ALTER TABLE public.organizations DROP COLUMN IF EXISTS google_sheet_id;
```

---

## Secrets to Consider Removing
The following secrets are currently configured in Supabase and were used for Google Sheets:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

These can be removed manually from the Supabase dashboard after the code is cleaned up.

---

## Summary

| Action | Count |
|--------|-------|
| Files to delete | 7 |
| Files to modify | 5 |
| Edge functions to delete (deployed) | 4 |
| Database columns to drop | 1 |

---

## Technical Notes
- The `useIntegrations` hook will still be useful for Meta Ads sync and campaign email functionality
- The `IntegrationGuide` component can be simplified to only show Meta Ads steps or removed if not needed elsewhere
- After implementation, the deployed edge functions need to be deleted from Supabase using the delete tool
