// Listen for tab activation
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (tab.url.startsWith("https://www.youtube.com/")) {
        async function getCurrentTab() {
            let queryOptions = { active: true, currentWindow: true };
            let [tab] = await chrome.tabs.query(queryOptions);
            return tab;
        }
        (async () => {
            let tab = await getCurrentTab();
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ["content.js"]
            });
        })();
    }
  });
});
// Listen for when the DOM content has loaded on the current page
chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    if (details.url.indexOf("https://www.youtube.com/") === 0) {
        async function getCurrentTab() {
            let queryOptions = { active: true, currentWindow: true };
            let [tab] = await chrome.tabs.query(queryOptions);
            return tab;
        }
        (async () => {
            let tab = await getCurrentTab();
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ["content.js"]
            });
        })();
    }
});