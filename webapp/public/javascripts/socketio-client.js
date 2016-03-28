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

socket.on('contentAdded', function (contentUrl) {
    console.log("Added" + contentUrl + "to the content queue");
});

socket.on('contentRejected', function (contentUrl) {
    console.log("Rejected" + contentUrl + "from the content queue");
});



var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOCKETIO = {

    getNextContentFromServer: function (){
        socket.emit('getNextContent', socket.room);
    },

    addContentToServer: function (contentUrl){
        console.log('Telling server to add ' + contentUrl + 'to the content queue');
        socket.emit('addContent', contentUrl, socket.room);
    },
}


