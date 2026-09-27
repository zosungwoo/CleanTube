document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  document.title = chrome.i18n.getMessage("extensionName");
  document.getElementById("description").textContent = chrome.i18n.getMessage("extensionDescription");
});
