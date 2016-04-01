var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};
var contentProviderList = ['soundcloud', 'vimeo', 'youtube']; // This needs to go server side when we have time. - GG

var addContentButton = document.getElementById('addContentButton');
var startBroadcastButton = document.getElementById('startBroadcastButton');
var btnOpenInBrowser = document.getElementById('btnOpenInBrowser');
var btnMuteContent = document.getElementById('btnMuteContent');
var fbShareButton = document.getElementById('fbShareButton');
var btnSkip = document.getElementById('btnSkip');
var currentContent = null;

//For now the skip button is actually a search button, we will be adding an actual search button soon. It's 2am plz
btnSkip.addEventListener('click', function () {
    var contentUrl = document.getElementById('searchBarInput').value;
    if (contentUrl) {
        SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.searchSoundCloud(contentUrl);
    }
});

addContentButton.addEventListener('click', function () {
    var contentUrl = document.getElementById('searchBarInput').value;
    if (contentUrl) {
        SOCIALSOUNDSCLIENT.BASEPLAYER.addContentFromSearch(contentUrl);
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
            self.updateFacebookShareButtonUrl();
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

    updateFacebookShareButtonUrl: function () {
        $('#fbShareButton').html('<fb:share-button href=' + currentContent.url + ' type="button"> </fb:share-button>')
        if (typeof (FB) !== 'undefined')
            FB.XFBML.parse(document.getElementById('fbShareButton'));
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
    
    //Get selected song from the select menu
    getSelectedSong: function () 
    {
        var drop = document.getElementById('resultDrop');
        this.requestContentInformation(drop[drop.selectedIndex].value);
    },
}

