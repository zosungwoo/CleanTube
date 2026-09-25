const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { JSDOM } = require('jsdom');
const script = fs.readFileSync('content.js', 'utf8');
const css = fs.readFileSync('content.css', 'utf8');
const entry = (id, href, text, tag = 'ytd-guide-entry-renderer') =>
  `<${tag} id="${id}"><a ${href === null ? '' : `href="${href}"`} title="${text}">${text}</a></${tag}>`;
const section = (id, entries) => `<ytd-guide-section-renderer id="${id}">${entries}</ytd-guide-section-renderer>`;
function setup(html = '', path = '/feed/subscriptions') {
  const dom = new JSDOM(`<style>${css}</style>${html}`, { url: `https://www.youtube.com${path}` });
  const redirects = [];
  const location = {
    origin: 'https://www.youtube.com', pathname: new URL(dom.window.location.href).pathname,
    search: new URL(dom.window.location.href).search,
    replace: url => redirects.push(url), assign: url => redirects.push(url),
  };
  const context = vm.createContext({ window: dom.window, document: dom.window.document,
    location, URL, URLSearchParams, Element: dom.window.Element,
    MutationObserver: dom.window.MutationObserver, setTimeout: dom.window.setTimeout.bind(dom.window) });
  vm.runInContext(script, context);
  return { dom, location, redirects, rerun: () => vm.runInContext(script, context),
    node: id => dom.window.document.getElementById(id),
    navigate: path => { location.pathname = path; dom.window.document.dispatchEvent(new dom.window.Event('yt-navigate-finish')); } };
}
const hidden = node => node.hasAttribute('data-cleantube-hidden');
const delay = () => new Promise(resolve => setTimeout(resolve, 90));

test('current six-section Korean guide: hide discovery, preserve personal navigation', () => {
  const f = setup(section('main', entry('home', '/', '홈') + entry('shorts', null, 'Shorts')) +
    section('subs', entry('subscriptions', '/feed/subscriptions', '구독') + entry('channel', '/@example', '채널')) +
    section('you', entry('history', '/feed/history', '기록') + entry('playlist', '/playlist?list=WL', '나중에 볼 동영상')) +
    section('more', entry('premium', '/premium', 'YouTube Premium') + entry('music', 'https://music.youtube.com/', 'YouTube Music')) +
    section('explore', entry('store', '/feed/storefront?bp=test', '영화')) +
    section('settings', entry('report', '/reporthistory', '신고 기록')));
  for (const id of ['main', 'home', 'shorts', 'more', 'explore']) assert.ok(hidden(f.node(id)), id);
  for (const id of ['subs', 'subscriptions', 'channel', 'you', 'history', 'playlist', 'settings']) assert.ok(!hidden(f.node(id)), id);
  f.dom.window.close();
});

test('synthetic Premium layouts: arbitrary order/count, Downloads and library survive', () => {
  const f = setup(section('mixed', entry('downloads', '/feed/downloads', 'Downloads') +
    entry('originals', '/originals', 'Originals') + entry('library', '/feed/library', 'ライブラリ')) +
    section('extra', entry('premiumMusic', 'https://music.youtube.com/', 'Music')) +
    entry('miniHome', '/', 'Start', 'ytd-mini-guide-entry-renderer') +
    entry('miniSub', '/feed/subscriptions', 'Abos', 'ytd-mini-guide-entry-renderer') +
    entry('miniDownloads', '/feed/downloads', 'Downloads', 'ytd-mini-guide-entry-renderer'));
  for (const id of ['originals', 'extra', 'miniHome']) assert.ok(hidden(f.node(id)), id);
  for (const id of ['mixed', 'downloads', 'library', 'miniSub', 'miniDownloads']) assert.ok(!hidden(f.node(id)), id);
  f.dom.window.close();
});

test('observer handles async menus and recycled endpoints without deleting nodes', async () => {
  const f = setup(entry('recycled', '/', 'Home'));
  f.node('recycled').querySelector('a').href = '/feed/downloads';
  f.dom.window.document.body.insertAdjacentHTML('beforeend', entry('late', '/shorts/abc', 'Shorts'));
  await delay();
  assert.ok(!hidden(f.node('recycled')));
  assert.ok(hidden(f.node('late')));
  assert.equal(f.dom.window.document.querySelectorAll('ytd-guide-entry-renderer').length, 2);
  f.dom.window.close();
});

test('home redirects on initial load and SPA/back navigation, not subscriptions or videos', () => {
  const f = setup('', '/?feature=home');
  assert.deepEqual(f.redirects, ['/feed/subscriptions']);
  f.navigate('/feed/subscriptions'); f.navigate('/watch');
  assert.equal(f.redirects.length, 1);
  f.navigate('/');
  assert.equal(f.redirects.length, 2);
  f.dom.window.close();
});

test('Shorts opens only requested video in regular player, preserving timestamp', () => {
  const f = setup('', '/shorts/abc_123-Z?t=12&feature=share');
  assert.deepEqual(f.redirects, ['https://www.youtube.com/watch?v=abc_123-Z&t=12']);
  f.dom.window.close();
});

test('logo redirects once even after duplicate execution; subscription links are untouched', () => {
  const f = setup('<ytd-topbar-logo-renderer><a id="logo" href="/"><span id="logoIcon">YouTube</span></a></ytd-topbar-logo-renderer>' + entry('sub', '/feed/subscriptions', 'Subscriptions'));
  f.rerun();
  f.node('logoIcon').dispatchEvent(new f.dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.deepEqual(f.redirects, ['/feed/subscriptions']);
  assert.equal(f.node('sub').querySelector('a').getAttribute('href'), '/feed/subscriptions');
  f.dom.window.close();
});

test('recommendation CSS preserves playlist, player, chat, and Premium controls', () => {
  const f = setup('<ytd-watch-flexy><div id="secondary"><ytd-playlist-panel-renderer id="playlist"></ytd-playlist-panel-renderer><div id="related"><ytd-watch-next-secondary-results-renderer id="suggestions"></ytd-watch-next-secondary-results-renderer></div><div id="chat">Chat</div></div><video id="player"></video><button id="download">Download</button></ytd-watch-flexy>', '/watch?v=test&list=PL123');
  assert.equal(f.dom.window.getComputedStyle(f.node('related')).display, 'none');
  for (const id of ['playlist', 'chat', 'player', 'download']) assert.notEqual(f.dom.window.getComputedStyle(f.node(id)).display, 'none', id);
  f.dom.window.close();
});

test('network redirect covers home query parameters only', () => {
  const rule = JSON.parse(fs.readFileSync('rules.json', 'utf8'))[0];
  const regex = new RegExp(rule.condition.regexFilter);
  for (const url of ['https://www.youtube.com/', 'https://youtube.com/?hl=ko', 'https://www.youtube.com/#home']) assert.ok(regex.test(url));
  for (const url of ['https://www.youtube.com/watch?v=x', 'https://www.youtube.com/feed/subscriptions', 'https://example.com/']) assert.ok(!regex.test(url));
});

test('menu order and extra sections cannot remove personal links or leave discovery visible', () => {
  const personalLinks = [
    ['/feed/subscriptions', '구독'], ['/@creator', '채널'], ['/feed/you', '내 페이지'],
    ['/feed/history', '기록'], ['/feed/playlists', '재생목록'], ['/playlist?list=WL', '나중에 볼 동영상'],
    ['/playlist?list=LL', '좋아요 표시한 동영상'],
    ['https://studio.youtube.com/channel/UC123/content', '내 동영상'], ['/feed/downloads', '오프라인 저장 동영상'],
  ];
  const sections = [section('homeSection', entry('home', '/', 'ホーム') + entry('shorts', null, 'Shorts')),
    section('personal', personalLinks.map(([href, label], i) => entry(`personal-${i}`, href, label)).join('')),
    section('explore', entry('explore-link', '/feed/storefront', '映画')),
    section('more', entry('music', 'https://music.youtube.com/', 'YouTube Music')),
    section('unknown', entry('unknown-link', '/new-personal-feature', 'Future menu'))];
  for (let offset = 0; offset < sections.length; offset++) {
    const f = setup([...sections.slice(offset), ...sections.slice(0, offset)].join(''));
    for (let i = 0; i < personalLinks.length; i++) assert.equal(f.node(`personal-${i}`).closest('[data-cleantube-hidden]'), null);
    assert.equal(f.node('unknown-link').closest('[data-cleantube-hidden]'), null);
    for (const id of ['home', 'shorts', 'explore-link', 'music']) assert.ok(f.node(id).closest('[data-cleantube-hidden]'), id);
    f.dom.window.close();
  }
});
