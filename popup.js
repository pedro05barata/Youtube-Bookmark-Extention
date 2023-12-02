// Import necessary utility function from the "utils.js" file
import { getActiveTabURL } from "./utils.js";

// Function to create a new bookmark element and append it to the bookmarks container
const createBookmarkElement = (bookmark) => {
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  // Set the bookmark title and classes
  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  // Add play and delete controls with event listeners
  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  // Set attributes and append child elements
  newBookmarkElement.id = `bookmark-${bookmark.time}`;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);
  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);

  return newBookmarkElement;
};

// Function to render bookmarks in the bookmarks container
const renderBookmarks = (bookmarks, currentBookmarks = []) => {
  bookmarks.innerHTML = "";

  if (currentBookmarks.length > 0) {
    // Loop through current bookmarks and append them to the container
    currentBookmarks.forEach((bookmark) => {
      const bookmarkElement = createBookmarkElement(bookmark);
      bookmarks.appendChild(bookmarkElement);
    });
  } else {
    // Display a message if there are no bookmarks
    bookmarks.innerHTML = '<i class="row">No bookmarks to show</i>';
  }
};

// Event handler for the "Play" button
const onPlay = async (e) => {
  const bookmarkTime = e.target.closest(".bookmark").getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  // Send a message to the active tab to play the video at the bookmarked time
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

// Event handler for the "Delete" button
const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.closest(".bookmark").getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(`bookmark-${bookmarkTime}`);

  // Remove the bookmark element from the DOM
  bookmarkElementToDelete?.remove();

  // Send a message to the active tab to delete the bookmark
  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, () => renderBookmarks(bookmarksElement, currentBookmarks));
};

// Function to set attributes for the play and delete controls
const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  // Set control attributes and add event listener
  controlElement.src = `assets/${src}.png`;
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// Event listener for the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", async () => {
  // Get the active tab and extract video parameters from the URL
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  // Check if the active tab is a YouTube video page
  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    // Retrieve stored bookmarks for the current video
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];
      // Render bookmarks in the container
      renderBookmarks(bookmarksElement, currentVideoBookmarks);
    });
  } else {
    // Display a message if the page is not a YouTube video page
    const container = document.querySelector(".container");
    container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
  }
});
