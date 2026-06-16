## Goal

Make the TopUp page show a **shared, pooled view** for any users whose active Meta/TikTok integrations have at least one ad account ID in common. Shared scope: balance, all-time spend, AND top-up history. Anyone in a shared group can top up, and every payment counts toward the shared balance.

## Concept: "Account group"

An account group = the transitive set of users/orgs whose active integrations share at least one `ad_account_id` (per platform). Computed at request time from the `integrations` table.

```
User A ── meta:[acct_1, acct_2]
User B ── meta:[acct_2]          → A, B, C all in one group
User C ── tiktok:[acct_9] + meta:[acct_1]
```

The group contributes:
- a set of `user_ids` (used to query `topups`)
- a set of `org_ids` (used to aggregate `client_balances`)
- a deduplicated set of `{platform, ad_account_id, access_token}` (used to fetch lifetime spend)

## Changes

### 1. `supabase/functions/get-balance/index.ts` — pool the data

- After loading the current user's active Meta/TikTok integrations, query all integrations (admin client, bypassing RLS) where `integration_type` matches and `ad_account_id` overlaps any of the user's account IDs (use `.overlaps('ad_account_id', [...])` since the column is an array). Repeat per platform.
- From the matched rows, collect:
  - `groupUserIds` (union of `user_id` values, plus current user)
  - `groupOrgIds` (union of `org_id` values, plus current user's primary org)
  - `groupAccounts` — a map keyed by `${platform}:${accountId}` so each ad account is fetched only once, picking any one valid `access_token` for that account.
- **Balance / totalTopups**: sum `current_balance` and `total_topups` across `client_balances` rows where `org_id IN groupOrgIds`. (Pooled wallet.)
- **totalCosts**: iterate `groupAccounts` and call the existing `fetchMetaLifetimeSpend` / `fetchTikTokLifetimeSpend` once per unique account.
- Return the aggregated values plus `groupUserIds` so the frontend can fetch the shared top-up history (or return the rows directly — see step 2).

### 2. Top-up history — return from the edge function

`src/pages/TopUp.tsx` currently queries `topups` directly with `eq("user_id", user.id)`, which RLS enforces anyway. To show the pooled list, extend `get-balance` to also return the recent top-ups for `user_id IN groupUserIds` (limit 20, ordered by `created_at desc`) and have the page render that array instead of querying the table directly. No RLS change needed — service role does the read.

### 3. `supabase/functions/create-mollie-payment/index.ts` — no behavioral change

Still records the top-up under the paying user's own `user_id` / `org_id`. Because aggregation in step 1 unions all orgs in the group, every member's payment automatically increases the shared balance. The existing Mollie webhook (which credits `client_balances` for the payer's org) keeps working as-is.

### 4. `src/pages/TopUp.tsx`

- Remove the direct `supabase.from("topups").select(...)` call.
- Read `topups` from the `get-balance` response.
- Add a small note under "Recent Top-Ups" like "Shared with N team member(s)" when `groupUserIds.length > 1` (count comes from the function response).

## Things explicitly NOT changing

- No DB migrations, no RLS changes, no new tables. The grouping is computed on read using existing data.
- `client_balances`, `topups`, and the Mollie webhook keep their current per-org/per-user semantics. Sharing is purely a read-side aggregation.
- Dashboard's "Remaining Balance" card already calls `get-balance`, so it inherits the pooled values automatically.
- Spend logic (lifetime spend per ad account) is unchanged — only the input set of ad accounts grows.

## Edge cases handled

- Current user has no integrations → group = just themselves (current behavior).
- Two users share one ad account but are in different orgs → both orgs' `client_balances` are summed; both users' Mollie top-ups appear in the list.
- Same ad account appears in multiple integration rows with different access tokens → fetched only once, using the first usable token.
- Inactive integrations are ignored (filtered by `status = 'active'`).
