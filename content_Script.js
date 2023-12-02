(() => {
    // Variables to store elements and data related to the YouTube player and bookmarks
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];

    // Listener for messages from the background script
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, value, videoId } = obj;

        // Check if the message type is "NEW"
        if (type === "NEW") {
            // Update the current video and handle the new video loaded event
            currentVideo = videoId;
            newVideoLoaded();
        }
    });

    // Function to handle the event when a new video is loaded
    const newVideoLoaded = () => {
        // Check if the bookmark button already exists
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        console.log(bookmarkBtnExists);

        // If the bookmark button doesn't exist, create and append it
        if (!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");

            bookmarkBtn.src = chrome.runtime.getURL("imagens/bookmark.png");
            bookmarkBtn.className = "ytp-button " + "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";

            // Get YouTube player elements
            youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
            youtubePlayer = document.getElementsByClassName("video-stream")[0];
            
            // Append the bookmark button to the YouTube left controls
            youtubeLeftControls.append(bookmarkBtn);

            // Add a click event listener to the bookmark button
            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
        }
    }

    // Event handler for adding a new bookmark
    const addNewBookmarkEventHandler = () => {
        // Get the current time of the YouTube player
        const currentTime = youtubePlayer.currentTime;
        
        // Create a new bookmark object
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        console.log(newBookmark);

        // Update the bookmarks in Chrome storage
        chrome.storage.sync.set({
            [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
        });
    }

    // Initial call to newVideoLoaded function
    newVideoLoaded();
})();

// Function to convert seconds to HH:MM:SS format
const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);

    return date.toISOString().substr(11, 8);
}
