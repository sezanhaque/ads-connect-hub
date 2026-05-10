## Mollie Top-Up + Balance System

### 1. Remove Stripe top-up
- Delete edge functions: `create-topup-session`, `create-virtual-card`, `get-wallet-balance`, `get-user-wallet`, `stripe-webhook`, `sync-campaign-spend` (re-implemented for Mollie/balance).
- Remove Stripe-specific columns from `wallets` later (kept for now to avoid data loss). Drop `STRIPE_*` secrets after Mollie is verified.
- Remove `src/pages/TopUp.tsx`, `src/pages/TopUpSuccess.tsx` and rewrite for Mollie.

### 2. Secrets
- Add `MOLLIE_API_KEY` (test key, `test_...`) via secrets tool.
- `RESEND_API_KEY` already configured — reuse for notification email.

### 3. Database (migration)
New tables:

**`topups`**
- id, user_id, org_id, mollie_payment_id (unique), amount (numeric), currency (default EUR), description, status (`open|pending|paid|failed|expired|canceled`), paid_at, created_at, updated_at.
- RLS: user can select own; service role full access.

**`balance_transactions`** (unified ledger; positive = credit, negative = debit)
- id, org_id, user_id (nullable for org-wide costs), source_type (`topup` | `campaign_spend`), source_ref (text, unique with source_type), amount (numeric, signed), currency, description, occurred_at, created_at.
- UNIQUE(source_type, source_ref) → guarantees no double-counting.
- RLS: org members can view; service role inserts.

**View `client_balances`**
- Aggregates per org_id (and per user_id) → total_topups, total_costs, current_balance.
- SECURITY INVOKER view, restricted by underlying RLS.

Indexes on (org_id), (user_id), (source_type, source_ref).

### 4. Edge functions (new, all `verify_jwt` defaults)

**`create-mollie-payment`** (JWT-required)
- Input: `{ amount: number, description?: string }`. Validates amount ≥ 50 with Zod.
- Creates Mollie payment via `https://api.mollie.com/v2/payments` with `redirectUrl` = `${origin}/topup/success?id={mollie_id}` and `webhookUrl` = `${SUPABASE_URL}/functions/v1/mollie-webhook`.
- Inserts `topups` row (status `open`).
- Returns `{ checkoutUrl }`.

**`mollie-webhook`** (`verify_jwt = false`)
- Receives `id` (form-urlencoded). Re-fetches payment from Mollie API to verify true status (never trust webhook body).
- Idempotently updates `topups.status` and on `paid`:
  - Inserts `balance_transactions` row (`source_type='topup'`, `source_ref=mollie_id`, positive amount).
  - Calls Resend (via existing connector pattern) to email `thealaminislam@gmail.com` with payment details.

**`get-balance`** (JWT-required)
- Returns balance for current user's org from `client_balances` view.

**`sync-campaign-costs`** (replaces `sync-campaign-spend`)
- Pulls daily Meta + TikTok spend per campaign and upserts into `balance_transactions` with `source_type='campaign_spend'`, `source_ref='${platform}:${campaign_id}:${date}'`, negative amount. UNIQUE constraint prevents double-counting.
- Triggered after `meta-sync` / `tiktok-sync` (call internally) and on a daily cron.

### 5. Frontend

**`src/pages/TopUp.tsx`** (rewritten, route already in sidebar under Settings):
- Title "Add Balance".
- Three amount choices: €50 button, €100 button, custom input (min 50, validated with Zod + inline error).
- Optional description textarea.
- "Pay with Mollie" button → calls `create-mollie-payment` → `window.location = checkoutUrl`.
- Loading state while invoking; toast on error.

**`src/pages/TopUpSuccess.tsx`** (rewritten):
- Reads `?id=` query, polls `topups` row by `mollie_payment_id` (max ~10s) to show paid / pending / failed states with appropriate copy and CTA back to dashboard / retry.

**Dashboard (`src/pages/Dashboard.tsx`)**:
- Add a "Current Balance" card at the top of the stats grid. Fetch via `get-balance`. Show `€XXX.XX` with a "Top up" button linking to `/topup`.
- Low balance (< €10) shows warning style.

### 6. Security
- All Mollie calls server-side; API key only in edge function env.
- Webhook re-verifies payment status with Mollie GET before crediting.
- RLS ensures users only see their org's topups + balances.
- Zod validation on all edge function inputs (min €50, max sane cap e.g. €10 000).

### 7. Out of scope (explicit)
- Stripe Issuing virtual cards — removed entirely.
- Multi-currency — EUR only.
- Refunds UI — not built; refunds via Mollie dashboard will flow through webhook and decrement balance via a future ledger entry.

### Technical notes
- Mollie REST: `POST /v2/payments` with `{ amount: { currency:'EUR', value:'50.00' }, description, redirectUrl, webhookUrl, method: ['ideal','creditcard','bancontact'] }`.
- Webhook is form-encoded `id=tr_xxx`; respond 200 quickly after processing.
- Use `SUPABASE_SERVICE_ROLE_KEY` inside webhook to bypass RLS for ledger insert.
