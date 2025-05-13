// Listen for web requests
chrome.webRequest.onCompleted.addListener(
  (details) => {
    console.log("details.url", details.url);
    
    if (details.url.includes('synergyapi.helixbeat.com')) {
      console.log("ZebiHR API Request Captured:", details);
      
      // Send message to content script
        chrome.tabs.sendMessage(123,{
          type: 'API_REQUEST_COMPLETED',
          url: details.url
        });
    }
  },
  { 
    urls: [
      "https://synergyapi.helixbeat.com/*"
    ] 
  }
);

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "API_REQUEST_COMPLETED") {
    console.log("Received API_REQUEST_COMPLETED message:", message);
    
    console.log("Background script received:", message.url, "||", sender, sendResponse);
    // Forward the message to the React app
    chrome.runtime.sendMessage({
      type: "API_REQUEST_COMPLETED",
      url: message.url,
    }).catch(err => console.error("Error forwarding message:", err));
  }
});

chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;
  chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
  }).catch(err => console.error("Error executing script:", err));
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    console.log("Request Headers:", details.requestHeaders);

    const authHeader = details.requestHeaders?.find(header => header.name.toLowerCase() === "authorization");

    if (authHeader) {
      console.log("Captured Authorization Header:", authHeader.value);
      console.log("Captured Authorization details:", details);
      chrome.storage.local.set({
        apiUrl: details.url,
        apiHeaders: authHeader.value
      });
      // Send the Authorization header to the content script
      chrome.tabs.sendMessage(456,{
        type: "AUTH_HEADER",
        authorization: authHeader.value,
      });
    }
  },
  { urls: [
    "https://synergyapi.helixbeat.com/*"
  ]  },
  ["requestHeaders"]
);
