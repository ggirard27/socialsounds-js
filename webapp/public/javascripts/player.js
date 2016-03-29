var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};
var contentProviderList = ['soundcloud', 'vimeo', 'youtube'];


SOCIALSOUNDSCLIENT.BASEPLAYER = {
    
    playContent: function (content) {
        
        var self = this;
        
        if (contentProviderList.indexOf(content.provider) > -1) {
            
            self.showPlayer(content.provider);
            switch (content.provider) {
                case 'soundcloud':
                    SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.playSoundCloudContent(content.url);
                    break;
                case 'vimeo':
                    playVimeoContent(content.url);
                    break;
                case 'youtube':
                    SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.playYoutubeContent(content.url);
                    break;
                default :
                    console.log("Oops, something went wrong while trying to launch: " + content.provider);
                    break;
            };
        } 
        else {
            console.log("Invalid content provider passed to player: " + content.provider);
        };
    },
    
    getNextContent: function () {
        var nextContentUrl = SOCIALSOUNDSCLIENT.SOCKETIO.getNextContentFromServer();
    },
    
    
    showPlayer: function (content) {
        if (contentProviderList.indexOf(content.provider) > -1) {
            for (var index = 0; index < contentProviderList.length; index++) {
                if (contentProviderList[index] == content.provider) {
                    $(document.getElementById(contentProviderList[index] + 'Player')).show();
                } 
                else {
                    $(document.getElementById(contentProviderList[index] + 'Player')).hide();
                };
            };
        }
        else {
            console.log("Invalid content provider passed to showPlayer: " + content.provider);
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
    
    // Call this function via the search bar 'add' button. - GG
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
}

