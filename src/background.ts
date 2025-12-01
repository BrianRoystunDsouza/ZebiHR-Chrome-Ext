chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes('synergyapi.helixbeat.com')) {
      chrome.storage.local.set({
        lastApiRequest: {
          url: details.url,
          timestamp: Date.now(),
        }
      });

      chrome.runtime.sendMessage({
        type: "API_DATA_AVAILABLE",
        url: details.url
      }).catch(err => console.log("No receivers available:", err));

      if (details.tabId && details.tabId !== -1) {
        chrome.tabs.sendMessage(details.tabId, {
          type: 'API_REQUEST_COMPLETED',
          url: details.url
        }).catch(err => console.log("Tab may not be ready yet:", err));
      }
    }
  },
  { urls: ["https://synergyapi.helixbeat.com/*"] }
);


chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["content.js"],
  }).catch(err => console.error("Error executing script:", err));
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "API_REQUEST_COMPLETED") {
    console.log({ sender });

    sendResponse({ received: true });
    return true; 
  }
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    const authHeader = details.requestHeaders?.find(header =>
      header.name.toLowerCase() === "authorization"
    );

    if (authHeader) {
      chrome.storage.local.set({
        apiUrl: details.url,
        apiHeaders: authHeader.value,
        authTimestamp: Date.now()
      });

      chrome.runtime.sendMessage({
        type: "AUTH_HEADER_AVAILABLE",
        authorization: authHeader.value
      }).catch(err => console.log("No receivers available:", err));

      if (details.tabId && details.tabId !== -1) {
        chrome.tabs.sendMessage(details.tabId, {
          type: "AUTH_HEADER",
          authorization: authHeader.value,
        }).catch(err => console.log("Tab may not be ready yet:", err));
      }
    }
  },
  { urls: ["https://synergyapi.helixbeat.com/*"] },
  ["requestHeaders"]
);

