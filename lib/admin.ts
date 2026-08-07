// Admin identity is an email allowlist supplied via the ADMIN_EMAILS env var
// (comma-separated). Admins can edit/delete any card.
export function isAdminEmail(email?: string | null): boolean {
  if (!email) {
    return false;
  }

  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(email.toLowerCase());
}
