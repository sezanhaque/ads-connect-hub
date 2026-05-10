## Wire campaign spend into the balance ledger + show All-time spend on Top Up page

Top-ups currently credit the ledger but campaign spend never debits it, so **Current Balance** keeps showing the full top-up amount even after ads have run. We'll fix that and surface lifetime spend on the Top Up page only — the Dashboard stays untouched.

### 1. Ledger debits from Meta/TikTok sync

Whenever `meta-sync` or `tiktok-sync` writes daily insights into `campaign_metrics`, also write a matching row into `balance_transactions`:

| field | value |
|---|---|
| `org_id` | campaign's org |
| `source_type` | `'campaign_spend'` |
| `source_ref` | `meta:{campaign_id}:{YYYY-MM-DD}` (or `tiktok:…`) |
| `amount` | **negative** spend for that day |
| `currency` | `EUR` |
| `occurred_at` | the metric's day |

Re-runs are safe — `upsert` on `(source_type, source_ref)` updates the existing row instead of duplicating. Sync functions already use the service-role client, so RLS isn't an issue.

### 2. One-time backfill (`backfill-spend-ledger`)

A tiny one-shot edge function that reads existing `campaign_metrics` rows and writes the matching negative `balance_transactions` rows. Idempotent thanks to the unique constraint, safe to re-run.

### 3. Top Up page — add "All-time spend" card

- Render a second card next to **Current Balance**.
- Title: `All-time spend`
- Value: from `get-balance` (already returns `totalCosts`).
- Subtitle: `Across all campaigns`

### Out of scope / no impact on existing features

- **Dashboard untouched** — CTR card and everything else stay exactly as they are.
- **Campaigns table untouched** — same data source, same columns.
- **Top-up flow untouched** — Mollie payment + webhook unchanged; we only add a read-only card on the page.
- **No DB schema changes** — `balance_transactions` and its unique constraint already exist; we only insert new rows of a new `source_type`.
- **No changes to `campaign_metrics`, `metrics`, `campaigns`, or `integrations`** — sync still writes spend exactly as before; we only add a parallel insert into `balance_transactions`.
- **Existing top-up credits unaffected** — they use a different `source_type`, so totals stay correct.
- **No new dependencies, no new routes, no auth changes.**

### Why this is safe

- The new debit rows only ever appear under a brand-new `source_type='campaign_spend'`, so no existing query that filters by today's source types changes behavior.
- `get-balance` already sums all debits/credits via `client_balances`, so the new rows automatically flow through without code changes there.
- If the backfill is interrupted or re-run, the unique constraint prevents double-counting.