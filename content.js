function removeElements() {
    // Remove Youtube guide button
    var guideButton = document.getElementById("guide-button");
    if(guideButton)
        guideButton.parentNode.removeChild(guideButton);

    // Redirect to subscriptions when the YouTube logo is clicked
    var ytLogo = document.getElementById("logo");
    if(ytLogo)
        ytLogo.onclick = function() { window.location.href = "https://www.youtube.com/feed/subscriptions"; };



    // Remove recommended videos when watching a video
    if (window.location.href.startsWith("https://www.youtube.com/watch")) {
        var recommend = document.getElementById("secondary-inner");
        if(recommend) {
            playlist = recommend.getElementsByTagName("ytd-playlist-panel-video-renderer");
            // If there's a playlist
            if(playlist.length > 0) {
                recommend = document.getElementById("related");
                if(recommend)
                    recommend.parentNode.removeChild(recommend);
            }
            else{
                recommend.parentNode.removeChild(recommend);
            }

        }
    }
    // Remove bad elements(Home, Shorts, Trending, etc.) in feed/playlist/... pages
    else {
        var guideSection = Array.from(document.getElementsByTagName("ytd-guide-section-renderer"));
        if(guideSection.length == 5){

            guideSection[2].parentNode.removeChild(guideSection[2]);  // 'Explore' section
            guideSection[3].parentNode.removeChild(guideSection[3]);  // 'More from YouTube' section

            
            guideEntry = Array.from(guideSection[0].getElementsByTagName("ytd-guide-entry-renderer"));

            guideEntry[0].parentNode.removeChild(guideEntry[0]);  // 'Home' Entry
            guideEntry[1].parentNode.removeChild(guideEntry[1]);  // 'Shorts' Entry
            // Youtube Premium user
            if(guideEntry[3].getElementsByTagName("a")[0].title == "Originals"){
                guideEntry[3].parentNode.removeChild(guideEntry[3]);  // 'Originals' Entry
            }

        }

        // When the Chrome window is resized to be small(responsive web)
        var miniGuideEntry = Array.from(document.getElementsByTagName("ytd-mini-guide-entry-renderer"));
        
        if(miniGuideEntry.length != 0 && miniGuideEntry[0].getAttribute("aria-label") == "Home") {
            miniGuideEntry[0].parentNode.removeChild(miniGuideEntry[0]);  // 'Home' Entry
            miniGuideEntry[1].parentNode.removeChild(miniGuideEntry[1]);  // 'Shorts' Entry
            // Youtube Premium user
            if(miniGuideEntry.length == 7){
                miniGuideEntry[3].parentNode.removeChild(miniGuideEntry[3]);  // 'Originals' Entry
            }
        }

        // Display only one Shorts when watching Shorts
        if(window.location.href.startsWith("https://www.youtube.com/shorts"))
        {
            var shortsVideos = Array.from(document.getElementsByTagName("ytd-reel-video-renderer"));
            var numShorts = shortsVideos.length;
            if(numShorts > 1)
                for (var i = 1; i < numShorts; i++)
                  shortsVideos[i].parentNode.removeChild(shortsVideos[i]);
        }
    }
}

var observer = new MutationObserver(removeElements);
observer.observe(document.body, {
    childList: true,
    subtree: true
});