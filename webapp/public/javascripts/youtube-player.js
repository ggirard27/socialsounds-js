﻿var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.YOUTUBEPLAYER = {
    
    youtubePlayer: youtubePlayer,
    youtubeDataApiKey: 'AIzaSyCg16FmXMtMPUm86w6FT5prAJEqd8obOgU',
    youtubeApiUrl: 'https://www.googleapis.com/youtube/v3/videos?id=',
    videoInfo: null,
    
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
        
    
    getVideoInfo: function (contentUrl) {
        var self = this;
        var videoId = this.getYoutubeId(contentUrl);
        self.videoInfo = new Object;
        
        $.getJSON(self.youtubeApiUrl + videoId + '&key=' + this.youtubeDataApiKey + '&part=snippet&callback=?')
        .done(function (data) {
            if (typeof (data.items[0]) != "undefined") {
                self.videoInfo.title = data.items[0].snippet.title;
                self.videoInfo.uploader = data.items[0].snippet.channelTitle;
                self.videoInfo.url = contentUrl;
                self.videoInfo.provider = 'youtube';
                self.videoInfo.apiId = videoId;
            } 
            else {
                self.videoInfo.title = null;
                self.videoInfo.uploader = null;
                self.videoInfo.url = contentUrl;
                self.videoInfo.provider = 'youtube';
                self.videoInfo.apiId = null;
            }
        })
        .fail(function () {
            self.videoInfo = null;
        })
        .always(function () { 
            SOCIALSOUNDSCLIENT.BASEPLAYER.receiveContentInformation(self.videoInfo);
        });
    },       
};

