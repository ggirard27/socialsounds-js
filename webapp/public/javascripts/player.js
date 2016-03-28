var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};
var contentProviderList = ['soundcloud', 'vimeo', 'youtube'];


SOCIALSOUNDSCLIENT.BASEPLAYER = {

    playContent: function (contentUrl) {

            var self = this;
            var contentProvider = self.getHostName(contentUrl);
    
            if (contentProviderList.indexOf(contentProvider) > -1) {
        
                self.showPlayer(contentProvider);
                switch (contentProvider) {
                    case 'soundcloud':
                        SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER.playSoundCloudContent(contentUrl);
                        break;
                    case 'vimeo':
                        playVimeoContent(contentUrl);
                        break;
                    case 'youtube':
                        SOCIALSOUNDSCLIENT.YOUTUBEPLAYER.playYoutubeContent(contentUrl);
                        break;
                    default :
                        console.log("Oops, something went wrong while trying to launch: " + contentProvider);
                        break;
                };
            } 
            else {
                console.log("Invalid content provider passed to player: " + contentProvider);
            };
        },

        getNextContent: function () {
            var nextContentUrl = SOCIALSOUNDSCLIENT.SOCKETIO.getNextContentFromServer();
        },


        showPlayer: function (contentProvider) {
            if (contentProviderList.indexOf(contentProvider) > -1) {
                for (var index = 0; index < contentProviderList.length; index++) {
                    if (contentProviderList[index] == contentProvider) {
                        $(document.getElementById(contentProviderList[index] + 'Player')).show();
                    } 
                    else {
                        $(document.getElementById(contentProviderList[index] + 'Player')).hide();
                    };
                };
            }
            else {
                console.log("Invalid content provider passed to showPlayer: " + contentProvider);
            }
        },


        hidePlayer: function (){
            for (var index = 0; index < contentProviderList.length; index++) {
                $(document.getElementById(contentProviderList[index] + 'Player')).hide();
            };
        },

        // It extracts the domain name from the url, trust me it works, as long as it IS a valid url. - GG
        getHostName: function (url) {
            var hostName = url.split('.')[1];
            return hostName;
        },
}

