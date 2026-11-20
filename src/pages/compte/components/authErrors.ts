/** Maps a Supabase auth error message onto a dictionary key. */
export function authErrorKey(message: string): string {
  const m = (message || '').toLowerCase();
  if (m.includes('already')) return 'acct.errExists';
  if (m.includes('invalid login') || m.includes('invalid credentials')) return 'acct.errCreds';
  if (m.includes('password should be') || m.includes('weak password') || m.includes('at least')) return 'acct.errPwdShort';
  if (m.includes('rate limit') || m.includes('too many')) return 'acct.errRate';
  if (m.includes('fetch') || m.includes('network') || m.includes('failed to fetch')) return 'acct.errNet';
  return 'acct.errGeneric';
}