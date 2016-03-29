var socket = io();

socket.on('roomJoined', function (room) {
    console.log(room);
    socket.room = room;
});

socket.on('playNextContent', function (content) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.playContent(content);
});

socket.on('contentAdded', function (contentUrl) {
    console.log("Added" + contentUrl + "to the content queue");
});

socket.on('contentRejected', function (content) {
    console.log("Rejected" + content + "from the content queue");
});



var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOCKETIO = {

    getNextContentFromServer: function (){
        socket.emit('getNextContent', socket.room);
    },

    addContentToServer: function (content){
        console.log('Telling server to add ' + content.title + 'to the content queue');
        socket.emit('addContent', content, socket.room);
    },
}


