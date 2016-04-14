var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};
var contentProviderList = ['soundcloud', 'vimeo', 'youtube']; // This needs to go server side when we have time. - GG

var addContentButton = document.getElementById('addContentButton');
var startBroadcastButton = document.getElementById('startBroadcastButton');
var btnOpenInBrowser = document.getElementById('btnOpenInBrowser');
var btnMuteContent = document.getElementById('btnMuteContent');
var fbShareButton = document.getElementById('fbShareButton');
var gpShareButton = document.getElementById('gpShareButton');
var twitterShareButton = document.getElementById('twitterShareButton');
var btnSkip = document.getElementById('btnSkip');
var searchResultsDropdown = document.getElementById('searchResultsDropdown');
var currentContent = null;

searchButton.addEventListener('click', function () {
    var contentUrl = document.getElementById('searchBarInput').value;
    searchResultsDropdown.innerHTML = '';
    
    if (contentUrl) {
        SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.searchSoundCloud(contentUrl);
        SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.searchYoutube(contentUrl);
    }   
});

//TODO: If the URL can't be parsed correctly display a error for the user.
addContentButton.addEventListener('click', function () {
    var contentUrl = document.getElementById('searchBarInput').value;
     if (contentUrl) {
        SOCIALSOUNDSCLIENT.BASEPLAYER.addContentFromSearch(contentUrl);
        document.getElementById('searchBarInput').value = '';
    }
});

startBroadcastButton.addEventListener('click', function () {
    SOCIALSOUNDSCLIENT.BASEPLAYER.getNextContent();
});

btnOpenInBrowser.addEventListener('click', function () {    
    var win = window.open(currentContent.url, '_blank');
    win.focus();
});

btnMuteContent.addEventListener('click', function () {
    var currentMuteState = SOCIALSOUNDSCLIENT.BASEPLAYER.getPlayerMuteState();
    currentMuteState = !currentMuteState;
    SOCIALSOUNDSCLIENT.BASEPLAYER.setPlayerMuteState(currentMuteState);
    SOCIALSOUNDSCLIENT.BASEPLAYER.applyPlayerMuteState();
});

function googleApiClientReady() {
    gapi.client.setApiKey('AIzaSyCg16FmXMtMPUm86w6FT5prAJEqd8obOgU');
    gapi.client.load('youtube', 'v3', function () {
        SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.handleAPILoaded();
    });
};

searchResultsDropdown.addEventListener('change', function () {
    var selectedContentUrl = searchResultsDropdown[searchResultsDropdown.selectedIndex].value;
    document.getElementById('searchBarInput').value = selectedContentUrl;
})


SOCIALSOUNDSCLIENT.BASEPLAYER = {
    
    isMuted: Boolean(false),
       
    
    playContent: function (content) {

        currentContent = content;
        var self = this;

        // The player stopping code below should be removed eventually. The playContent function should only be called to play content, 
        // we should not verify if contentis already playing. The logic should be moved to the future "skipSong" function,
        // which should take care of stopping the currently playing media before calling the playContent function. - GG
        SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.pauseSoundCloudPlayer();

        if (SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.youtubePlayer === null) {
            // nothing to do
        } 
        else if (SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.youtubePlayer.getPlayerState() == 1) {
            SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.pauseYoutubeContent();
        }
        // until here
        
        if (contentProviderList.indexOf(content.provider) > -1) {

            self.showPlayer(content.provider);
            switch (content.provider) {
                case 'soundcloud':
                    SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.playSoundCloudContent(content);
                    break;
                case 'vimeo':
                    playVimeoContent(content);
                    break;
                case 'youtube':
                    SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.playYoutubeContent(content);
                    break;
                default :
                    console.log("Oops, something went wrong while trying to launch: " + content.provider);
                    break;
            };
            self.updateSocialMediaShareButtonsUrl();
        } 
        else {
            console.log("Invalid content provider passed to player: " + content.provider);
        };
    },
    
    getNextContent: function () {
        var nextContentUrl = SOCIALSOUNDSCLIENT.SOCKETIO.getNextContentFromServer();
    },
    
    
    showPlayer: function (content) {
        if (contentProviderList.indexOf(content) > -1) {
            for (var index = 0; index < contentProviderList.length; index++) {
                if (contentProviderList[index] == content) {
                    $(document.getElementById(contentProviderList[index] + 'Player')).show();
                } 
                else {
                    $(document.getElementById(contentProviderList[index] + 'Player')).hide();
                };
            };
        }
        else {
            console.log("Invalid content provider passed to showPlayer: " + content);
        }
    },
    
    
    hidePlayer: function () {
        for (var index = 0; index < contentProviderList.length; index++) {
            $(document.getElementById(contentProviderList[index] + 'Player')).hide();
        };
    },
    
    // It extracts the host name from the url, trust me it works, as long as it IS a valid url. - GG
    getHostName: function (url) {
        return url.split('//')[1].split('.')[0] != 'www' ?  url.split('//')[1].split('.')[0] : url.split('//')[1].split('.')[1];
    },
    

    requestContentInformation: function (contentUrl) {
        var contentProvider = this.getHostName(contentUrl);
        switch (contentProvider) {
            case 'soundcloud':
                SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.getSoundCloudInfo(contentUrl);
                break;
            case 'vimeo':
                break;
            case 'youtube':
                SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.getVideoInfo(contentUrl);
                break;
            default :
                console.log('Oops, something went wrong while trying to retrieve information for : ' + contentUrl);
                break;
        };
    },
    
    receiveContentInformation: function (content) {
        if (content === null) {
            console.log('Oops, request to content provider failed. Either the url is invalid or the content provider is unavailable.');
        }
        else if (content.title === null && content.uploader === null && content.apiId === null) {
            console.log('Oops, ' + content.provider + ' does not have any information for the requested content. Are you sure ' + content.url + ' is valid?');
        }
        else {
            this.displayContentInformation(content);
            SOCIALSOUNDSCLIENT.SOCKETIO.addContentToServer(content);
        }
    },
    
    displayContentInformation: function (content) {
        console.log('\nContent information successfully retrieved. ' +
                    '\nTitle:' + content.title + 
                    '\nUploader : ' + content.uploader +
                    '\nContent provider: ' + content.provider +
                    '\nUrl : ' + content.url +
                    '\napiId : ' + content.apiId + 
                    '\n'
        );
    },
    
/* Not sure whether we need to keep this function. We might want to do some stuff before 
 * passing the contentUrl to the next function... just not sure what. - GG
 */
    addContentFromSearch: function (contentUrl) {
        this.requestContentInformation(contentUrl);
    },
    
    updateSocialMediaShareButtonsUrl: function (){
        this.updateFacebookShareButtonUrl();
        this.updateGoogleShareButtonUrl();
        this.updateTwitterShareButtonUrl();
    },

    updateFacebookShareButtonUrl: function () {
        fbShareButton.innerHTML = '<fb:share-button href="' + currentContent.url + '" type="button"> </fb:share-button>';
        if (typeof (FB) !== 'undefined')
            FB.XFBML.parse(document.getElementById('fbShareButton'));
    },
    
    updateGoogleShareButtonUrl: function () {
        gpShareButton.setAttribute('data-href', currentContent.url);
        gpShareButton.innerHTML = '<a class="g-plus" data-action="share" data-annotation="none" data-height="24" data-href="' + currentContent.url + '"</a>';
        gapi.plus.go();
    },
    
    updateTwitterShareButtonUrl: function () {
        twitterShareButton.innerHTML = '<a class="twitter-share-button" href="https://twitter.com/intent/tweet" data-text=" " data-url="' + currentContent.url + '" data-hashtags="socialsounds">Tweet</a>';
        twttr.widgets.load();
    },

    getPlayerMuteState: function () {
        return this.isMuted;
    },

    setPlayerMuteState: function (muteState) {
        if (muteState != null) {
            this.isMuted = muteState;
        } 
    },

    applyPlayerMuteState: function () {
        var self = this;
        if (currentContent) {
            switch (currentContent.provider) {
                case 'soundcloud':
                    SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.muteSoundCloudPlayer(self.getPlayerMuteState());
                    break;
                case 'vimeo':
                    break;
                case 'youtube':
                    SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.muteYoutubePlayer(self.getPlayerMuteState());
                    break;
                default :
                    console.log('Oops, something went wrong while trying to mute : ' + currentContent.provider);
                    break;
            };
        }
    },

    renderSearchResults: function (results, provider) {

        searchResultsDropdown = document.getElementById('searchResultsDropdown');
        var htmlContent = '';

        if (results.length > 0) {
            for (var i = 0; i < results.length; i++) {
                htmlContent += '<option value="' + results[i].url + '">' + provider + " - " + results[i].title + '</option>';
            }
            htmlContent += '</select>';
            $('#searchResultsDropdown').append(htmlContent);
        }
        else {
            $('#searchResultsDropdown').append('<option value=""> No Result </option> </select>');
        }
        document.getElementById('searchBarInput').value = searchResultsDropdown.options[searchResultsDropdown.selectedIndex].value;
        searchResultsDropdown.style.display = 'inline';
    },

    appendToContentQueue: function (content) {
        var htmlContent = '';
        htmlContent += '<li> <img src="images/' + content.provider + '-playlist.png"> <a href="' + content.url + '" target="_blank"> ' + content.title + '</a></img></li>';
        $('#contentQueueList').append(htmlContent);
    },
}

