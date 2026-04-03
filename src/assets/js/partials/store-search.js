/**
 * Redirect to the storefront search page with a keyword (same mechanism as Salla theme search).
 */
export function navigateToStoreSearch(keyword) {
  const q = String(keyword ?? '').trim();
  if (!q) {
    return false;
  }

  let href = `/search?q=${encodeURIComponent(q)}`;
  try {
    if (typeof salla !== 'undefined' && salla.url && typeof salla.url.get === 'function') {
      const searchRoute = salla.url.get('search');
      if (searchRoute && typeof searchRoute === 'string') {
        const u = new URL(searchRoute, window.location.href);
        u.searchParams.set('q', q);
        if (u.origin !== window.location.origin) {
          href = u.href;
        } else {
          href = `${u.pathname}${u.search}${u.hash}`;
        }
      }
    }
  } catch (_) {
    /* keep fallback */
  }

  window.location.href = href;
  return true;
}
