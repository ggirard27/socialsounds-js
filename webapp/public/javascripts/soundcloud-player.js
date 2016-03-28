var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOUNDCLOUDPLAYER = {
    
    SC: SC,
    clientId: String('3d4d094dc75510a4b5ad612e2d249a41'),
    soundUrl: String(''), 
    widget: String(''),

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
                $.getJSON('http://api.soundcloud.com/resolve.json?url=' + song + '&client_id=' + self.clientId).done(function (data) {
                    self.soundUrl = data.uri;
                    iFrame.src = 'https://w.soundcloud.com/player/?url=' + self.soundUrl;
                    self.widget = SC.Widget(iFrame);
                    self.widget.bind(SC.Widget.Events.READY, function () {
                        //When the widget is ready:
                        self.widget.play();
                    });
                    self.widget.bind(SC.Widget.Events.FINISH, function () {
                        SOCIALSOUNDSCLIENT.BASEPLAYER.getNextContent();
                    });
                });
            }
            else {
                $.getJSON('http://api.soundcloud.com/resolve.json?url=' + song + '&client_id=' + self.clientId).done(function (data) {
                    soundUrl = data.uri;
                    self.widget.load(self.soundUrl, 'auto_play=true');
                    self.widget.bind(SC.Widget.Events.READY, function () {
                        //When the widget is ready:
                        self.widget.play();
                    });
                });
            }
        }
    },
};

