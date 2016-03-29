var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER = {
    
    SC: SC,
    clientId: String('3d4d094dc75510a4b5ad612e2d249a41'),
    widget: String(''),
    songMedia: { title: String(''), uploader: String(''), url: String(''), apiId: String(''), provider: String('') },
    songList: [],
    

    //TODO: Add a button Open in soundcloud
    playSoundCloudContent: function (song) {
        var self = this;
        var iFrame = document.getElementById('soundcloudPlayer');
        //This is for debugging, should never be used in final product
        if (!song) {
            SOCIALSOUNDSCLIENT.BASEPLAYER.getNextContent();
        }
        else {
            //First time using the widget
            if (!self.widget) {
                    iFrame.src = 'https://w.soundcloud.com/player/?url=' + song.apiId;
                    self.widget = SC.Widget(iFrame);
                    self.widget.bind(SC.Widget.Events.READY, function () {
                        //When the widget is ready:
                        self.widget.play();
                    });
                    self.widget.bind(SC.Widget.Events.FINISH, function () {
                        SOCIALSOUNDSCLIENT.BASEPLAYER.getNextContent();
                    });
            }
            else {
                self.widget.load(song.apiId);
                self.widget.bind(SC.Widget.Events.READY, function () {
                    //When the widget is ready:
                    self.widget.play();
                });
            }
        }
    },
    
    stopSoundCloudContent: function () {
        if (this.widget) {
            this.widget.pause();
        }
    },
    
    muteSoundCloudContent: function () {
        if (this.widget) {
            this.widget.setVolume(0);
        }
    },

    getSoundCloudInfo: function (songUrl) {
        var self = SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER;
        $.getJSON('http://api.soundcloud.com/resolve.json?url=' + songUrl + '&client_id=' + this.clientId)
        .done(function (data) {
            if (data) {
                self.songMedia = { title: data.title, uploader: data.user.username, url: songUrl, apiId: data.uri, provider: 'soundcloud' };
            }
        })
         .fail(function () {
            self.songMedia = null;
        })
        .always(function () { 
            SOCIALSOUNDSCLIENT.BASEPLAYER.receiveContentInformation(self.songMedia);
        });
    },

};

