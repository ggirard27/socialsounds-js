var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER = {
    
    SC: SC,
    clientId: String('3d4d094dc75510a4b5ad612e2d249a41'),   //TODO: To store somewhere else later - TP
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
    
    muteSoundCloudContent: function (isMuted) {
        if (this.widget) {
            isMuted ? this.widget.setVolume(0) : this.widget.setVolume(75);
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

    searchSoundCloud: function (query) {
        
        SC.initialize({
            client_id: '3d4d094dc75510a4b5ad612e2d249a41'
        });
        // find all sounds of buskers licensed under 'creative commons share alike'
        SC.get('/tracks', {
            q: query
        }).then(function (tracks) {
            //Populates the search results
            // onchange="SOCIALSOUNDSCLIENT.BASEPLAYER.getSelectedSong()"
            if (tracks.length >= 6) {
            $('#SearchResults').html('<select id="resultDrop" style="height: 30px;margin-left: 5px;margin-right: 5px;width: 300px">' +
            '<option value="' + tracks[0].permalink_url + '">' + tracks[0].title + '</option>' +
            '<option value="' + tracks[1].permalink_url + '">' + tracks[1].title + '</option>' +
            '<option value="' + tracks[2].permalink_url + '">' + tracks[2].title + '</option>' +
            '<option value="' + tracks[3].permalink_url + '">' + tracks[3].title + '</option>' +
            '<option value="' + tracks[4].permalink_url + '">' + tracks[4].title + '</option>' +
            '<option value="' + tracks[5].permalink_url + '">' + tracks[5].title + '</option> </select>');
            }
            else if (tracks.length == 0) {
                $('#SearchResults').html('<select id="resultDrop" style="height: 30px;margin-left: 5px;margin-right: 5px;width: 300px">' +
            '<option value=""> No Result </option> </select>');
            }
        }); 
    },        
};

