// Listen for web requests
chrome.webRequest.onCompleted.addListener(
  (details) => {
    if (details.url.includes('api.zebihr.com')) {
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
      "https://api.zebihr.com/*",
      "https://app.zebihr.com/*"
    ] 
  }
);

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  
  if (message.type === "API_REQUEST_COMPLETED") {
    console.log("Background script received:",message.data.url ,"||",sender, sendResponse);
    // Forward the message to the React app
    chrome.runtime.sendMessage({
      type: "API_REQUEST_COMPLETED",
      url: message.data.url,
    });
  }
});


chrome.action.onClicked.addListener((tab) => {
  if (tab.id === undefined) return;
  chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
  });
});

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    console.log("Request Headers:", details.requestHeaders);

    const authHeader = details.requestHeaders?.find(header => header.name.toLowerCase() === "authorization");

    if (authHeader) {
      console.log("Captured Authorization Header:", authHeader.value);
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
    "https://api.zebihr.com/*",
    "https://app.zebihr.com/*"
  ]  }, // Capture requests from all domains (adjust if needed)
  ["requestHeaders"]
);


