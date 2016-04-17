var socket = io();

socket.on('roomJoined', function (room) {
    console.log('Joined room: ' + room);
    socket.room = room;
});

socket.on('playNextContent', function (content, timestamp) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.playContent(content, timestamp);
    document.getElementById('btnSkip').disabled = false;
});

socket.on('contentAdded', function (content) {
    console.log('Added ' + content.title + ' to the content queue');
    SOCIALSOUNDSCLIENT.BASEPLAYER.appendToContentList(content);
});

socket.on('contentRejected', function (content) {
    console.log('Rejected ' + content.title + ' from the content queue');
});

socket.on('getChannelList', function (channels) {
    $("#channelList").html(""); //Empties it before filling it all.
    for (var i = 0; i < channels.length; i++) {
        $('#channelList').append('<li><a href="#" onclick=SOCIALSOUNDSCLIENT.BASEPLAYER.switchChannel("' + channels[i] + '")>' + channels[i] + '</a></li>');
    }
});

socket.on('logging', function (msg) {
    console.log('Server message: ' + msg);
});

socket.on('noContent', function () {
    // Alert the users in an unobtrusive way, while still being clear. flash message?
    console.log('No more content in queue, please add more and press start broadcast.');
});

socket.on('chatMessage', function (msg) {
    console.log(msg);
    $('#chatBox').append('<li>' + msg + '</li>');
    var chat = document.getElementById('chatBox');
    chat.scrollTop = chat.scrollHeight;
});

socket.on('displayContentList', function (contentList) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.displayContentList(contentList);
});

socket.on('updateSkipLabel', function (users, votes) {
    $('#labelSkip').text(votes + "/"+users + " users voted to skip");
});

socket.on('skipSong', function () {
    SOCIALSOUNDSCLIENT.SOCKETIO.getNextContentFromServer();
    document.getElementById('btnSkip').disabled = false;
});

//Will eventually be removed when we will be able to join in a song at any moment.
socket.on('pauseContent', function () {
    SOCIALSOUNDSCLIENT.BASEPLAYER.pauseContent();
})

var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOCKETIO = {
    
    getNextContentFromServer: function () {
        socket.emit('getNextContent', socket.room);
    },
    
    addContentToServer: function (content) {
        console.log('Telling server to add ' + content.title + ' to the content queue');
        socket.emit('addContent', content, socket.room);
    },
    
    switchRoom: function (room) {
        console.log("requesting room switch to: " + room);
        socket.emit('switchRoom', room);
        //socket.emit('getNextContent', socket.room);
    },
    
    sendMessage: function (msg) {
        socket.emit('chatMessage', msg, socket.room);
    },

    voteSkip: function () {
        socket.emit('voteSkip', socket.room);
    }
}




