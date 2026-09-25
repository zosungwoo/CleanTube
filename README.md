<div align="center">
  <img src="https://user-images.githubusercontent.com/30895117/216979319-2b2c8f9f-060c-44bb-baad-0f5655840c94.png" alt="CleanTube" width="450"/>
  <h2>Watch only what you need on YouTube</h2>

  [Chrome Web Store](https://chromewebstore.google.com/detail/cleantube-watch-only-need/ffalnkpnbohljeiehcghmpdoljajbanj)
</div>

CleanTube reduces distractions on desktop YouTube:

- Open YouTube Home (including the logo) in Subscriptions.
- Hide Home, Shorts, Explore and More from YouTube navigation.
- Keep subscriptions, channels, history, playlists and downloads accessible.
- Hide recommendations and suggested end-screen videos while keeping the player, playlist, comments and chat.
- Open an individually selected Short in the regular player, without the infinite Shorts feed.

Search and direct video links remain available. CleanTube does not filter every video by subscription status and does not block ads or unlock paid features.

### YouTube Premium

Navigation is matched by destination, not menu position, section count, language, or Premium membership. Premium playback/download controls are left intact. Automated tests cover synthetic Premium menus with extra/reordered items. A paid Premium account was **not** available for live verification; those tests do not establish full Premium compatibility.

### Development

Requires Node.js 20+ and Python 3. Chrome 105+ is required for the CSS selectors; use current stable Chrome for testing.

```sh
npm ci
npm test
npm run package
```

In `chrome://extensions`, enable Developer mode and load this directory as an unpacked extension. Reload the extension and the YouTube tab after making changes. The upload artifact is `dist/cleantube-1.1.0.zip`. The packaging allowlist excludes tests, dependencies, screenshots and Chrome-generated `_metadata`.

### Privacy and permissions

The extension runs only on `https://www.youtube.com/*` and `https://youtube.com/*`. `declarativeNetRequestWithHostAccess` redirects top-level Home requests to Subscriptions. A declarative content script handles YouTube's in-page navigation and interface changes. There is no background service worker, analytics, remote code, external API, or collection/transmission of user data.

See [CHANGELOG.md](CHANGELOG.md) for releases and [TESTING.md](TESTING.md) for validation details.
