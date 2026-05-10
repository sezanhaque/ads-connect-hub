## Plan

1. **Change the All-time spend calculation source**
   - Update `get-balance` so `totalCosts` no longer sums `client_balances.total_costs` across all organizations the user belongs to.
   - Instead, calculate lifetime spend only from campaign metrics tied to campaigns available through the authenticated user's own active Meta/TikTok integrations.

2. **Scope spend to the current user's integrations**
   - Find the signed-in user's active integrations in `integrations` where `user_id = current user` and `integration_type IN ('meta', 'tiktok')`.
   - Use only those integration orgs/platforms when selecting campaigns.
   - Avoid org-level fallback for this all-time total, because the user specifically wants spend from their integrated Meta/TikTok accounts only.

3. **Sum lifetime campaign spend safely**
   - Query campaigns in those integration orgs and platforms.
   - Prefer campaigns created by the current user to prevent shared-org campaigns from other users being counted.
   - Sum spend from `metrics` and `campaign_metrics` for those campaign IDs.
   - Return that as `totalCosts` to the Top Up page.

4. **Keep balance behavior unchanged**
   - Leave `balance`, `totalTopups`, and Recent Top-Ups behavior as-is, so this only fixes the All-time spend card.

5. **Validation**
   - Check the updated function for syntax and verify the Top Up page still consumes `totalCosts` from `get-balance`.