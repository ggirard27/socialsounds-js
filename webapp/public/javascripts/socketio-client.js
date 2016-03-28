var socket = io();

socket.on('test', function (msg) {
    console.log(msg);
});

socket.on('roomJoined', function (room) {
    console.log(room);
    socket.room = room;
});

socket.on('playNextContent', function (contentUrl) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.playContent(contentUrl);
});


var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOCKETIO = {

    getNextContentFromServer: function (){
        socket.emit('getNextContent', socket.room);
    },
}


