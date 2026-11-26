export function passwordLinkTarget(
  location: Pick<Location, 'pathname' | 'search' | 'hash'>,
  base: string,
): string | null {
  const params = new URLSearchParams(location.hash.slice(1));
  const type = params.get('type');
  if ((type !== 'invite' && type !== 'recovery') || !params.get('access_token')) return null;

  const path = `${base.replace(/\/$/, '')}/compte/mot-de-passe`;
  if (location.pathname === path) return null;
  return `${path}${location.search}${location.hash}`;
}
