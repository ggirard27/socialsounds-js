var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.YOUTUBEPLAYER = {
    
        youtubePlayer: youtubePlayer,
        
        // The API will call this function when the video player is ready.
        onPlayerReady: function onPlayerReady(event) {
            event.target.playVideo();
        },
        
        
        // The API calls this function when the player's state changes.
        onPlayerStateChange: function (event) {
            if (event.data == YT.PlayerState.ENDED) {
                // tell player to get next song from queue
                SOCIALSOUNDSCLIENT.BASEPLAYER.getNextContent();
                console.log('Youtube content ended, new content is needed.');
            };
        },
        
    playYoutubeContent: function (contentUrl) {
            var self = this;
            if (typeof (YT) == 'undefined' || typeof (YT.Player) == 'undefined') {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                var firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                
                window.onYouTubePlayerAPIReady = function () {
                    youtubePlayer = new YT.Player('youtubePlayer', {
                        videoId: self.getYoutubeId(contentUrl),
                        playerVars: { 'autoplay': 1, 'controls': 1 },
                        events: {
                            'onReady': self.onPlayerReady,
                            'onStateChange': self.onPlayerStateChange
                        }
                    });
                };
            } 
            else {
                    youtubePlayer.loadVideoById({
                    'videoId': self.getYoutubeId(contentUrl),
                    'suggestedQuality': 'large'
                });
            };
        },
        
        // It extracts the videoId from the url, trust me it works, as long as it IS a valid youtube url. - GG
        getYoutubeId: function (youtubeUrl) {
            var videoId = youtubeUrl.split('v=')[1];
            return videoId.indexOf('&') != -1 ? videoId.substring(0, videoId.indexOf('&')) : videoId;
        },      
};

