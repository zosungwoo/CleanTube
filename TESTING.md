# Validation for 1.1.0

## Automated regression tests

`npm test` verifies:

- Current six-section Korean navigation, including a Shorts entry without an href.
- Synthetic reordered Premium menus and the compact guide; preservation of Downloads, Library and Subscriptions.
- Late DOM insertion and recycled link destinations without destructive node removal.
- Home redirects on initial load and SPA navigation.
- An individual Short's video ID and timestamp in the normal player.
- Duplicate initialization and logo click handling.
- Recommendation hiding while preserving the playlist, player, chat and download control.
- The network rule matching only YouTube Home, including query strings.

## Live inspection

On 2026-09-26, inspected the signed-in, non-Premium desktop YouTube interface in Chrome. Observed six `ytd-guide-section-renderer` sections, a Shorts endpoint without `href`, `yt-lockup-view-model` recommendations, and the playlist as a sibling of `#related` under `#secondary-inner`.

Loaded version 1.1.0 as an unpacked extension in Chrome. Live checks and results are recorded below as they are completed.

## Limitations

Premium menu variations are simulated; paid-account playback/download behavior has not been tested. YouTube can independently roll out other layouts. Tests do not cover mobile YouTube, embedded players, or YouTube Music, which are outside the extension's host access.

## Completed live checks

- Watch page with a playlist: both `#related` containers are hidden; playlist remains `display: flex`, video player and Download button remain available.
- Clicking the YouTube logo navigates to `/feed/subscriptions`.
- Opening `https://www.youtube.com/?hl=ko` redirects to Subscriptions.
- Full guide: Home, href-less Shorts, Explore and More from YouTube are hidden. Subscriptions/channels, You, History, Playlists, Watch Later, Liked Videos, Your Videos, Downloads and Report History remain.
- Compact guide at a 1000×800 viewport: Home and Shorts are `display: none`; Subscriptions and You remain `display: block`. Viewport override reset after testing.
- Clicking a real subscription Short navigates to `/watch?v=<the same video ID>` and plays in the normal player.
- No extension load error was reported by `chrome://extensions`.
