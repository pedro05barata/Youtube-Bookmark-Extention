// Add a listener for tab updates
chrome.tabs.onUpdated.addListener((tabId, tab) => {
    // Check if the tab URL includes "youtube.com/watch"
    if (tab.url && tab.url.includes("youtube.com/watch")) {
      try {
        // Extract query parameters from the tab URL
        const queryParameters = tab.url.split("?")[1];
        
        // Ensure that query parameters exist before further processing
        if (!queryParameters) {
          throw new Error("No query parameters found in the URL.");
        }
  
        // Create a URLSearchParams object for easier parameter extraction
        const urlParameters = new URLSearchParams(queryParameters);
  
        // Get the videoId parameter from the URL
        const videoId = urlParameters.get("v");
  
        // Ensure that videoId is not null before sending the message
        if (!videoId) {
          throw new Error("No 'v' parameter found in the URL.");
        }
  
        // Send a message to the content script with type "NEW" and the videoId parameter
        chrome.tabs.sendMessage(tabId, {
          type: "NEW",
          videoId: videoId,
        });
  
      } catch (error) {
        // Handle any errors that occur during parameter extraction or message sending
        console.error("Error:", error.message);
      }
    }
  });
  
  