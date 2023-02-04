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
        if(recommend)
            recommend.parentNode.removeChild(recommend);
    }
    // Remove bad elements(Home, Shorts, Trending, etc.) in feed/playlist/... pages
    else {
        var guideSection = Array.from(document.getElementsByTagName("ytd-guide-section-renderer"));
        if(guideSection.length == 5){
            // Home, Shorts, ...
            var guideEntry = Array.from(document.getElementsByTagName("ytd-guide-entry-renderer"));
            
            var idx = [0,1,3];
            for (var i = 0; i < idx.length; i++)
              guideEntry[idx[i]].parentNode.removeChild(guideEntry[idx[i]]);

            // Trend, ...
            var idx = [1,2,3];
            for (var i = 0; i < idx.length; i++)
              guideSection[idx[i]].parentNode.removeChild(guideSection[idx[i]]);
        }

        // Home, Shorts, ... when the Chrome window is resized to be small(responsive web)
        var miniGuideEntry = Array.from(document.getElementsByTagName("ytd-mini-guide-entry-renderer"));
        if(miniGuideEntry.length == 7){
            var idx = [0,1,3];
            for (var i = 0; i < idx.length; i++)
              miniGuideEntry[idx[i]].parentNode.removeChild(miniGuideEntry[idx[i]]);
        }

        // Display only one Shorts when watching Shorts
        if(window.location.href.startsWith("https://www.youtube.com/shorts"))
        {
            var shortsVideos = Array.from(document.getElementsByTagName("ytd-reel-video-renderer"));
            var numShorts = shortsVideos.length;
            if(numShorts == 10)
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