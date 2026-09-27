# Changelog

## 1.2.0 — 2026-09-27

- Rename to CleanTube – Distraction-Free YouTube and clarify the summary and store descriptions.
- Localize the name, summary, popup and store descriptions in six languages.
- Include locale catalogs in the store package.

## 1.1.1 — 2026-09-27

- Hide the modern fullscreen recommendation grid shown after playback ends, in addition to the legacy end screen.
- Preserve replay, timeline, volume, and fullscreen controls.
- Add a regression test for the modern ended-player layout.

## 1.1.0 — 2026-09-26

- Update navigation handling for current YouTube layouts, including href-less Shorts entries and reordered sections.
- Replace active-tab script injection with one declarative content script per document, including background tabs.
- Handle initial loads, in-page navigation, browser history, and dynamically rendered menus.
- Preserve personal navigation and playlist controls across normal and synthetic Premium layouts.
- Display individual Shorts in the normal player instead of deleting YouTube's recycled player nodes.
- Hide watch-page recommendations and suggested end-screen videos without deleting DOM nodes.
- Restrict host access to YouTube and remove scripting, tabs, and webNavigation permissions.
- Add regression tests and a minimal, repeatable store package.

## 1.0.1

Previous Chrome Web Store release (2023-09-24).
