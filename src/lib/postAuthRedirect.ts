const KEY = 'mnc_post_auth_redirect';

// Only same-origin relative paths are allowed.
function isSafePath(path: string) {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('\\');
}

export function rememberPostAuthPath(path: string) {
  if (!isSafePath(path)) return;
  try {
    sessionStorage.setItem(KEY, path);
  } catch {
    /* storage unavailable */
  }
}

export function consumePostAuthPath(): string | null {
  try {
    const path = sessionStorage.getItem(KEY);
    if (!path) return null;
    sessionStorage.removeItem(KEY);
    return isSafePath(path) ? path : null;
  } catch {
    return null;
  }
}
