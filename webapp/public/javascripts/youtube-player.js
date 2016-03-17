var youtubePlayer;

// The API will call this function when the video player is ready.
function onPlayerReady(event) {
    event.target.playVideo();
};


// The API calls this function when the player's state changes.
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.ENDED) {
        // tell player to get next song from queue
        getNextContent();
        console.log('Youtube content ended, new content is needed.');
    };
};

function playYoutubeContent(contentUrl){
    if (typeof (YT) == 'undefined' || typeof (YT.Player) == 'undefined') {
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        window.onYouTubePlayerAPIReady = function () {
            youtubePlayer = new YT.Player('youtubePlayer', {
                videoId: getYoutubeId(contentUrl),
                playerVars: { 'autoplay': 1, 'controls': 0 },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange
                }
            });
        };
    } 
    else {
        youtubePlayer.loadVideoById({
        'videoId': getYoutubeId(contentUrl),
        'suggestedQuality': 'large'
        });
    };
};


// It extracts the videoId from the url, trust me it works, as long as it IS a valid youtube url. - GG
function getYoutubeId(youtubeUrl) {
    var videoId = youtubeUrl.split('v=')[1];
    return videoId.indexOf('&') != -1 ? videoId.substring(0, videoId.indexOf('&')) : videoId;
};
