# Changelog

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
