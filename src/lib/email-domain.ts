// Shared helpers for classifying email domains.
// Used by the admin Invite Users page to group accounts by company domain
// while keeping personal-email users in a separate ungrouped section.

export const PERSONAL_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'ymail.com',
  'hotmail.com',
  'hotmail.co.uk',
  'outlook.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'aol.com',
  'gmx.com',
  'gmx.de',
  'yandex.com',
  'yandex.ru',
  'mail.ru',
  'zoho.com',
  'fastmail.com',
  'tutanota.com',
  'qq.com',
  '163.com',
  '126.com',
  'naver.com',
]);

export function getEmailDomain(email: string | null | undefined): string | null {
  if (!email) return null;
  const at = email.lastIndexOf('@');
  if (at < 0 || at === email.length - 1) return null;
  return email.slice(at + 1).trim().toLowerCase();
}

export function isPersonalDomain(domain: string | null | undefined): boolean {
  if (!domain) return true; // treat unknown as personal so it shows ungrouped
  return PERSONAL_EMAIL_DOMAINS.has(domain.toLowerCase());
}
