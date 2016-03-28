var SC;
var clientId = '3d4d094dc75510a4b5ad612e2d249a41';
var soundUrl, widget;
var iFrame = document.getElementById('soundcloudPlayer');

SC.initialize({
    client_id: clientId 
});

function playSoundCloudContent(song) {
    //This is for debugging, should never be used in final product
    if (!song) {
        getNextScContent();
    }
    else {
        //First time using the widget
        if (!widget) {
            $.getJSON('http://api.soundcloud.com/resolve.json?url=' + song + '&client_id=' + clientId).done(function (data) {
                soundUrl = data.uri;
                iFrame.src = 'https://w.soundcloud.com/player/?url=' + soundUrl;
                widget = SC.Widget(iFrame);
                widget.bind(SC.Widget.Events.READY, function () {
                    //When the widget is ready:
                    widget.play();
                });
                widget.bind(SC.Widget.Events.FINISH, function () {
                    getNextContent();
                });
            });
        }
        else {
            $.getJSON('http://api.soundcloud.com/resolve.json?url=' + song + '&client_id=' + clientId).done(function (data) {
                soundUrl = data.uri;
                widget.load(soundUrl, 'auto_play=true');
                widget.bind(SC.Widget.Events.READY, function () {
                    //When the widget is ready:
                    widget.play();
                });
            });
        }
    }
}

