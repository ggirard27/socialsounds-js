var socket = io();

socket.on('roomJoined', function (room) {
    console.log(room);
    socket.room = room;
});

socket.on('playNextContent', function (content) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.playContent(content);
});

socket.on('contentAdded', function (content) {
    console.log('Added ' + content.title + ' to the content queue');
});

socket.on('contentRejected', function (content) {
    console.log('Rejected ' + content.title + ' from the content queue');
});

socket.on('logging', function (msg) {
    console.log('Server message: ' + msg);
});

socket.on('noContent', function () {
    // Alert the users in an unobtrusive way, while still being clear. flash message?
    console.log('No more content in queue, please add more and press start boradcast.');
});



var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOCKETIO = {

    getNextContentFromServer: function (){
        socket.emit('getNextContent', socket.room);
    },

    addContentToServer: function (content){
        console.log('Telling server to add ' + content.title + ' to the content queue');
        socket.emit('addContent', content, socket.room);
    },
}


