var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.YOUTUBEPLAYER = {
    
    youtubePlayer: null,
    youtubeDataApiKey: 'AIzaSyCg16FmXMtMPUm86w6FT5prAJEqd8obOgU',
    youtubeApiUrl: 'https://www.googleapis.com/youtube/v3/videos?id=',
    videoInfo: null,
    
    // The API will call this function when the video player is ready.
    onPlayerReady: function onPlayerReady(event) {
        event.target.playVideo();
        SOCIALSOUNDSCLIENT.BASEPLAYER.applyPlayerMuteState();
    },
    
    // The API calls this function when the player's state changes.
    onPlayerStateChange: function (event) {
        if (event.data == YT.PlayerState.ENDED) {
            // tell player to get next song from queue
            SOCIALSOUNDSCLIENT.BASEPLAYER.getNextContent();
            console.log('Youtube content ended, new content is needed.');
        };
    },
    
    playYoutubeContent: function (content) {
        var self = this;
        if (typeof (YT) == 'undefined' || typeof (YT.Player) == 'undefined') {
            var tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            window.onYouTubePlayerAPIReady = function () {
                self.youtubePlayer = new YT.Player('youtubePlayer', {
                    videoId: self.getYoutubeId(content.url),
                    playerVars: { 'autoplay': 1, 'controls': 1 },
                    events: {
                        'onReady': self.onPlayerReady,
                        'onStateChange': self.onPlayerStateChange
                    }
                });
            };
        } 
        else {
            self.youtubePlayer.loadVideoById({
                'videoId': self.getYoutubeId(content.url),
                'suggestedQuality': 'large'
            });
        };
    },
    
    // It extracts the videoId from the url, trust me it works, as long as it IS a valid youtube url. - GG
    getYoutubeId: function (contentUrl) {
        var videoId = contentUrl.split('v=')[1];
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
    
    muteYoutubePlayer: function (isMuted){
        if (this.youtubePlayer) {
            isMuted === true ? this.youtubePlayer.mute() : this.youtubePlayer.unMute();
        }
    },  
     
    isMutedYoutubePlayer: function () {
        if (this.youtubePlayer) {
            return this.youtubePlayer.isMuted();
        }
    },

    pauseYoutubeContent: function () {
        if (this.youtubePlayer) {
            this.youtubePlayer.pauseVideo();
        }
    },

    handleAPILoaded: function handleAPILoaded() {
        $('#searchYoutubeButton').attr('disabled', false);
    },  
    
    searchYoutube: function search() {
        var q = $('#searchBarInput').val();
        var numberOfResults = 5;
        var request = gapi.client.youtube.search.list({
            q: q,
            part: 'snippet',
            maxResults: numberOfResults,
        });
    
        request.execute(function (response) {
            var searchResults = response.result.items;
            var youtubeVideoUrl = 'https://www.youtube.com/watch?v=';
            var responseLength = searchResults.length < numberOfResults ? searchResults.length : numberOfResults;
            var htmlContent = '';
            
            if (responseLength > 0) {
                for (var i = 0; i < responseLength; i++) {
                    htmlContent += '<option value="' + youtubeVideoUrl + searchResults[i].id.videoId + '">' + "YouTube - " + searchResults[i].snippet.title + '</option>';
                }
                htmlContent += '</select>';
                $('#searchResultsDropdown').append(htmlContent);
                document.getElementById('searchBarInput').value = youtubeVideoUrl + searchResults[0].id.videoId;
            }
            else if (searchResults.length == 0) {
                $('#searchResultsDropdown').append('<option value=""> No Result </option> </select>');
            }
        });
    },
};

