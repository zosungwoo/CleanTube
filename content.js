(() => {
  'use strict';
  // A declarative content script runs once per document, including background tabs.
  if (window.__cleanTubeInitialized) return;
  window.__cleanTubeInitialized = true;

  const subscriptions = '/feed/subscriptions';
  const entrySelector = 'ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer';
  const hiddenAttribute = 'data-cleantube-hidden';
  const blockedPaths = new Set([
    '/', '/feed/explore', '/feed/trending', '/feed/guide_builder',
    '/feed/storefront', '/feed/gaming', '/gaming', '/premium', '/originals',
    '/feed/originals', '/channel/UC-9-kyTW8ZkZNDHQJ6FgpwQ',
    '/channel/UCkYQyvc_i9hXEo4xic9Hh2g',
  ]);

  function urlFor(anchor) {
    const href = anchor?.getAttribute('href');
    if (!href) return null;
    try { return new URL(href, location.origin); } catch { return null; }
  }

  function isYouTube(url) {
    return url && ['www.youtube.com', 'youtube.com'].includes(url.hostname);
  }

  function isBlocked(anchor) {
    const url = urlFor(anchor);
    // Current YouTube sometimes renders the Shorts endpoint without an href.
    // The product name is also used in non-English navigation.
    if (!url) return anchor?.getAttribute('title') === 'Shorts' ||
      anchor?.getAttribute('aria-label') === 'Shorts';
    return isYouTube(url) && (blockedPaths.has(url.pathname.replace(/\/$/, '') || '/') ||
      /^\/shorts(?:\/|$)/.test(url.pathname));
  }

  function setHidden(element, hidden) {
    if (element.hasAttribute(hiddenAttribute) !== hidden) {
      element.toggleAttribute(hiddenAttribute, hidden);
    }
  }

  function cleanGuide() {
    document.querySelectorAll(entrySelector).forEach(entry => {
      setHidden(entry, isBlocked(entry.querySelector('a')));
    });
    document.querySelectorAll('ytd-guide-section-renderer').forEach(section => {
      const anchors = [...section.querySelectorAll('a[href]')];
      const urls = anchors.map(urlFor).filter(Boolean);
      // Identify Explore / More from YouTube by destinations, never section order
      // or translated headings. Keep mixed sections with personal navigation.
      const personal = urls.some(url => isYouTube(url) &&
        (/^\/feed\/(subscriptions|you|library|history|playlists|downloads|channels)(\/|$)/.test(url.pathname) ||
         url.pathname === '/playlist' || url.pathname.startsWith('/@')));
      const discovery = urls.some(url => isYouTube(url) &&
        ['/feed/explore', '/feed/trending', '/feed/storefront', '/premium', '/originals', '/feed/originals'].includes(url.pathname)) ||
        urls.some(url => ['music.youtube.com', 'www.youtubekids.com'].includes(url.hostname));
      const entries = [...section.querySelectorAll(entrySelector)];
      const allHidden = entries.length > 0 && entries.every(e => e.hasAttribute(hiddenAttribute));
      setHidden(section, !personal && (discovery || allHidden));
    });
  }

  function redirect() {
    if (location.pathname === '/') {
      location.replace(subscriptions);
      return true;
    }
    const short = location.pathname.match(/^\/shorts\/([\w-]+)\/?$/);
    if (short) {
      // Use the normal player to retain the requested Short without an infinite
      // swipe feed. Do not remove player nodes owned/recycled by YouTube.
      const target = new URL('/watch', location.origin);
      target.searchParams.set('v', short[1]);
      for (const key of ['t', 'start']) {
        const value = new URLSearchParams(location.search).get(key);
        if (value) target.searchParams.set(key, value);
      }
      location.replace(target.href);
      return true;
    }
    return false;
  }

  function update() {
    if (!redirect()) cleanGuide();
  }
  let scheduled = false;
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; update(); }, 50);
  }
  // Intercept only the logo, preserving ordinary subscription/channel links.
  document.addEventListener('click', event => {
    const anchor = event.target instanceof Element ? event.target.closest('a#logo') : null;
    if (!anchor || !anchor.closest('ytd-topbar-logo-renderer')) return;
    anchor.setAttribute('href', subscriptions);
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(subscriptions);
  }, true);
  document.addEventListener('yt-navigate-finish', update);
  document.addEventListener('yt-page-data-updated', schedule);
  window.addEventListener('popstate', update);
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true,
    attributeFilter: ['href', 'title', 'aria-label'],
  });
  update();
})();
