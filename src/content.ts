// Intercept fetch requests
(function () {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
console.log("wwewewewewE",{args, url, options});

    const response = await originalFetch(...args);

    const contentScriptData = {
      type: "API_REQUEST_COMPLETED",
      url: url.toString(),
      headers: options?.headers || {},
      method: options?.method || 'GET'
    };

    chrome.runtime.sendMessage(contentScriptData);

    return response;
  };
})();

// Listen for messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Content script received:", message, sender);
 if (message.type === "AUTH_HEADER") {
    console.log("Received Authorization Header in Content Script:", message.authorization);
  }
  // Create an observer for network requests
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.entryType === 'resource') {
        const resourceEntry = entry as PerformanceResourceTiming;
console.log("Resource entry:", resourceEntry);

        const contentScriptData = {
          type: "API_REQUEST_COMPLETED",
          url: resourceEntry.name,
          headers: resourceEntry.initiatorType,
          timing: {
            duration: resourceEntry.duration,
            startTime: resourceEntry.startTime,
          }
        };

        chrome.runtime.sendMessage(contentScriptData);
      }
    });
  });

  // Start observing resource timing entries
  observer.observe({ entryTypes: ['resource'] });

  if (message.type === "GET_LOCAL_STORAGE") {
    const storage: { [key: string]: string } = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        storage[key] = localStorage.getItem(key) || "";
      }
    }
    sendResponse(storage);
  }
});

