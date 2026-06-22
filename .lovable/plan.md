# Company-Based Management Migration Plan

Shift from individual user accounts to **company accounts grouped by verified email domain**, while keeping existing production data and flows fully intact behind a feature flag.

---

## 1. Guiding principles

- **Zero impact on production users today.** All new logic lives behind a `company_mode` feature flag (off by default). Existing `members` / `organizations` data stays untouched and keeps working.
- **Domain = company.** A verified `@cocacola.com` user joins the `cocacola.com` company automatically. No owner role — all members are equal.
- **Verified email required.** No account creation without email confirmation. Personal domains (Gmail, Outlook, Yahoo, iCloud, Proton, etc.) are blocked unless explicitly allow-listed for testing.
- **Existing accounts can opt-in** to test the new flow even if they use a non-company domain (via a `legacy_test_allowlist`).

---

## 2. Database changes (new tables, no breaking edits)

New tables, additive only:

- `companies` — one row per domain. Fields: `domain` (unique), `name`, `display_name`, `created_at`.
- `company_members` — links `user_id` to `company_id`. No `role` column (all equal). Unique on `(company_id, user_id)`.
- `company_credits` — shared credit/balance pool per company.
- `personal_email_domains` — blocklist seed (gmail.com, outlook.com, hotmail.com, yahoo.com, icloud.com, proton.me, protonmail.com, aol.com, live.com, msn.com, gmx.com, mail.com, zoho.com, yandex.com, qq.com, 163.com).
- `legacy_test_allowlist` — `user_id` of existing users allowed to test company mode with any domain.
- `feature_flags` — single-row table holding `company_mode_enabled` (default `false`).

Helper functions:
- `public.extract_email_domain(email text)` — lowercases and returns domain part.
- `public.is_personal_domain(domain text)` — checks blocklist.
- `public.get_or_create_company_for_email(email text)` — returns company_id, creates if missing.
- `public.is_company_member(p_company_id uuid, p_user_id uuid)` — RLS helper (SECURITY DEFINER).

RLS:
- All new tables enable RLS. Users can read their own company + members; only service role can insert into `companies` / `company_members` (done via SECURITY DEFINER function called from edge function after email verification).

Existing tables (`members`, `organizations`, `client_balances`, etc.) are **not modified**. The two systems coexist; the UI picks one based on the flag.

---

## 3. Signup / verification flow (new, gated)

Two edge functions:

1. `validate-signup-email` — called pre-signup. Rejects:
   - invalid format
   - personal domain (unless user is in `legacy_test_allowlist`)
   - disposable domain (basic list)
2. `provision-company-membership` — called after Supabase email confirmation (auth hook or first authenticated request). Calls `get_or_create_company_for_email(auth.email)` and inserts into `company_members`.

Supabase Auth setting: **email confirmation required = true** (only enforced when `company_mode_enabled`; existing users already verified are unaffected). I'll document the dashboard toggle for the user rather than flip it silently.

Frontend signup page (new variant gated by flag):
- Client-side domain check + clear error: "Please use your company email address."
- Show "Verify your email" screen after signup.
- After confirmation, route to company dashboard.

---

## 4. Admin UI — companies view

New page `/admin/companies` (in addition to existing `/invite-users`, which stays as-is for now):

- Table of companies: `Domain | Display Name | # Members | Total Credits | Created`
- Expand row → list of member emails, joined date, last sign-in.
- Search by domain or member email.
- Per-company actions: rename, adjust shared credits, view activity.
- When `company_mode_enabled` is on, the admin nav swaps "Users" → "Companies". When off, the current "Invite Users" page is shown.

---

## 5. Shared company data

Behind the flag, the following reads/writes scope to `company_id` instead of `user_id`/`org_id`:
- Credits / balance → `company_credits`
- Folders (if/when added)
- Jobs and campaigns will get an optional `company_id` column (nullable, additive). Existing rows keep using `org_id`. New code path writes both during transition.

This dual-write phase is what makes the rollback safe.

---

## 6. Rollout phases

1. **Phase 0 (this change set):** migrations, edge functions, admin Companies page, signup variant — all hidden behind `company_mode_enabled = false`. Production users see nothing new.
2. **Phase 1 (testing):** enable flag for internal/test accounts via `legacy_test_allowlist`. QA the full flow.
3. **Phase 2 (release):** flip `company_mode_enabled = true` for everyone. Existing users keep their data; new signups go through the company flow. Old `/invite-users` page is removed.
4. **Phase 3 (cleanup, later):** backfill existing users into companies based on their email domain (one-off script, run only after sign-off).

---

## Technical details (for reference)

- All new SQL in a single migration with proper `GRANT` + RLS per Lovable rules.
- Edge functions: `validate-signup-email`, `provision-company-membership`. Both use `verify_jwt = false` with in-code JWT validation where needed.
- Frontend: new `useCompanyMode()` hook reads the flag once at app boot; components branch on it. No existing component behavior changes when the flag is off.
- Personal-domain list stored in DB so it can be tuned without redeploys.
- No changes to `useAuth`, `App.tsx` routing logic, or existing pages in this phase beyond mounting the new admin route.

---

## Open questions before I start

1. **Phase scope** — do you want me to ship **all of Phase 0** in one go (migrations + edge functions + admin Companies page + gated signup), or just the foundation (migrations + flag + admin page) first and signup flow second?
2. **Company display name** — when auto-creating `cocacola.com`, should the default display name be `Cocacola` (capitalized domain root) or just the bare domain until an admin renames it?
3. **Personal-domain list** — happy with the seed list above, or do you want to add/remove any?
4. **Existing-user backfill** — should I include a *dry-run* report (which existing users would land in which company) in this phase, even though no rows get written?
