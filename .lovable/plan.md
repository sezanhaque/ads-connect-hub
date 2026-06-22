## Goal

Restructure the admin **Invite Users** page so admins see a list of **companies** (grouped by email domain) instead of a flat list of individual accounts. Each company row shows the number of accounts; expanding it reveals the existing per-user rows (invite, balance, platform integrations). Users on personal email domains (gmail, yahoo, hotmail, outlook, icloud, proton, aol, gmx, yandex, mail.ru, live, me, msn) appear ungrouped below the company list, each as its own row, exactly as they do today.

No schema changes. No signup changes. No new edge functions. Production logic for everything else stays untouched.

## Scope

- Single file edit: `src/pages/InviteUsers.tsx`.
- Optional small helper: `src/lib/email-domain.ts` for `getEmailDomain(email)` and `isPersonalDomain(domain)` so the rule is reusable later.
- No DB migrations, no edge-function changes, no auth changes.

## UI layout

```
[Search bar] [back to dashboard]

Companies
─────────────────────────────────────────────
▸ cocacola.com           3 accounts        ⌄
▸ pepsico.com            1 account         ⌄
▸ ing.nl                 2 accounts        ⌄

Personal accounts
─────────────────────────────────────────────
jane@gmail.com    Jane Doe   [Invite] [Balance]
bob@outlook.com   Bob Smith  [Invite] [Balance]
```

Expanding a company row reveals the existing per-user table inline (same columns and actions as today: name, role badge, platforms, balance, Invite/Manage buttons). The expanded rows reuse the current `<TableRow>` rendering so all existing actions (`handleOpenDialog`, `handleOpenBalance`, etc.) keep working unchanged.

## Behavior details

- **Grouping**: client-side, after `fetchUsers()` returns. Build `Map<domain, User[]>` for company domains; collect personal-domain users into a separate `personalUsers` array.
- **Domain extraction**: lowercase the part after `@`; trim whitespace; ignore users without a parseable email.
- **Search**: filters across both sections. A company row stays visible if the domain string matches OR any member email/name matches; the expanded list inside is also filtered.
- **Sort**: companies sorted by account count desc, then domain asc. Personal users keep current `created_at desc` order.
- **Counts**: `N account` / `N accounts` pluralized.
- **Expand state**: local `useState<Set<string>>` of expanded domains; collapsed by default. A "Expand all / Collapse all" toggle above the companies list.
- **Empty states**: "No companies yet" and "No personal accounts" placeholders when sections are empty.

## Out of scope (explicitly)

- No `companyv2_*` tables, no shared wallet/jobs/integrations across domain members.
- No company-level invite action (each member is still invited individually for now).
- No signup-time domain enforcement.
- No changes to `Auth.tsx`, edge functions, or any other page.

## Technical notes

- Personal-domain set lives in `src/lib/email-domain.ts`:
  `gmail.com, googlemail.com, yahoo.com, yahoo.co.uk, hotmail.com, hotmail.co.uk, outlook.com, live.com, msn.com, icloud.com, me.com, mac.com, proton.me, protonmail.com, pm.me, aol.com, gmx.com, gmx.de, yandex.com, yandex.ru, mail.ru, zoho.com, fastmail.com, tutanota.com, qq.com, 163.com, naver.com`.
- The existing `User` type, `fetchUsers`, `handleInviteUser`, `handleSelectPlatform`, `handleOpenBalance`, and dialog code are kept as-is. Only the JSX between the search bar and the closing `</CardContent>` is restructured into the two-section layout.

## Deliverable

A single PR-style change to `InviteUsers.tsx` (+ the small `email-domain.ts` helper) that renders the new grouped view while preserving every existing per-user admin action.
