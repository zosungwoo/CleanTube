async function runContentScript(details) {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    if (details.url.startsWith("https://www.youtube.com/")) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });
    }
}

// Listen for tab activation
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        runContentScript({ url: tab.url });
    });
});

// Listen for when the DOM content has loaded on the current page
chrome.webNavigation.onDOMContentLoaded.addListener(runContentScript);