// Importing the getActiveTabURL function from the utils.js file
import { getActiveTabURL } from "./utils.js";

// Function to add a new bookmark to the bookmarks container
const addNewBookmark = (bookmarks, bookmark) => {
  // Creating elements for the bookmark
  const bookmarkTitleElement = document.createElement("div");
  const controlsElement = document.createElement("div");
  const newBookmarkElement = document.createElement("div");

  // Setting properties for the bookmark elements
  bookmarkTitleElement.textContent = bookmark.desc;
  bookmarkTitleElement.className = "bookmark-title";
  controlsElement.className = "bookmark-controls";

  // Adding play and delete controls to the bookmark
  setBookmarkAttributes("play", onPlay, controlsElement);
  setBookmarkAttributes("delete", onDelete, controlsElement);

  // Setting ID, class, and timestamp attribute for the new bookmark element
  newBookmarkElement.id = "bookmark-" + bookmark.time;
  newBookmarkElement.className = "bookmark";
  newBookmarkElement.setAttribute("timestamp", bookmark.time);

  // Appending bookmark elements to the new bookmark element
  newBookmarkElement.appendChild(bookmarkTitleElement);
  newBookmarkElement.appendChild(controlsElement);
  bookmarks.appendChild(newBookmarkElement);
};

// Function to display bookmarks in the bookmarks container
const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  // Checking if there are bookmarks to display
  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    // Displaying a message if there are no bookmarks
    bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
  }

  return;
};

// Function to handle the play action on a bookmark
const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  // Sending a message to the active tab to play the video from the bookmarked time
  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

// Function to handle the delete action on a bookmark
const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

  // Deleting the bookmark element from the DOM
  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  // Sending a message to the active tab to delete the bookmarked time
  chrome.tabs.sendMessage(activeTab.id, {
    type: "DELETE",
    value: bookmarkTime,
  }, viewBookmarks);
};

// Function to set attributes for a bookmark control element
const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
  const controlElement = document.createElement("img");

  // Setting properties for the control element
  controlElement.src = "assets/" + src + ".png";
  controlElement.title = src;
  controlElement.addEventListener("click", eventListener);
  controlParentElement.appendChild(controlElement);
};

// Event listener for the DOMContentLoaded event
document.addEventListener("DOMContentLoaded", async () => {
  // Getting the URL of the active tab and extracting video parameters
  const activeTab = await getActiveTabURL();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  // Getting the current video ID from the URL
  const currentVideo = urlParameters.get("v");

  // Checking if the active tab is a YouTube video page
  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    // Retrieving bookmarks for the current video from storage
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideoBookmarks = data[currentVideo] ? JSON.parse(data[currentVideo]) : [];

      // Displaying the bookmarks on the page
      viewBookmarks(currentVideoBookmarks);
    });
  } else {
    // Displaying a message if the active tab is not a YouTube video page
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
  }
});
