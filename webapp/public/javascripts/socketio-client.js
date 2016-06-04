
var socket = io();
socket.user = userCookie.general.username;
console.log('socket user is ' + socket.user);

socket.on("connect", function () {
    // roomId comes from the template and the request to render the template
    //Try and access the room mentionned, if it doesn't work then it creates it.
    SOCIALSOUNDSCLIENT.SOCKETIO.setUsername(socket.user);
    if (typeof (roomId) !== 'undefined') {
        if (roomId == 'default-room') {
            SOCIALSOUNDSCLIENT.SOCKETIO.switchRoom('default-room', false);
        }
        else {
            console.log("Testing room: " + roomId);
            SOCIALSOUNDSCLIENT.SOCKETIO.switchOrCreateIfNotExists(roomId);
        }
    }
});

socket.on('roomJoined', function (room) {
    console.log('Joined room: ' + room);
    socket.room = room;
    var chat = document.getElementById('chatBox');
    chat.scrollTop = chat.scrollHeight;
    SOCIALSOUNDSCLIENT.SOCKETIO.setUsername(socket.user);
    SOCIALSOUNDSCLIENT.BASEPLAYER.updateSocialMediaShareButtonsUrl();
});

socket.on('roomCreated', function (room) {
    console.log('Created room: ' + room);
    socket.room = room;
    $('#createChannelModal').modal('hide');
});

socket.on('roomSwitched', function (room) {
    console.log('Switched to room: ' + room);
    socket.room = room;
    $('#switchChannelModal').modal('hide');
});

socket.on('playNextContent', function (content, timestamp) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.playContent(content, timestamp);
    document.getElementById('btnSkip').disabled = false;
});

socket.on('contentAdded', function (content, index, user) {
    console.log('Added ' + content.title + ' to the content queue, at index: ' + index + ' by user ' + user);
    SOCIALSOUNDSCLIENT.BASEPLAYER.appendToContentList(content);
    if (usernameChat == user) {
        displayUndoAddContentLink(content, index);
    }
    if (socket.room == 'default-room' && currentContent === null) {
        SOCIALSOUNDSCLIENT.BASEPLAYER.getNextContent();
    }
});

socket.on('contentRejected', function (content) {
    console.log('Rejected ' + content.title + ' from the content queue');
});
    
socket.on('getChannelList', function (room, channels) {
    //Desktop site
    $('#channelList').html(""); //Empties it before filling it all, desktop website
    for (var i = 0; i < channels.length; i++) {
        $('#channelList').append('<li><a onclick=writeChannelUrlRequest("' + channels[i] + '")>' + channels[i] + '</a></li>');
    }
});

socket.on('logging', function (msg) {
    console.log('Server message: ' + msg);
});

socket.on('joinRoomFailed', function (room) {
    $('#switchChannelPasswordErrorMessage').show();
});

socket.on('createRoomFailed', function (room) {
  $('#channelNameErrorMessage').show();
});

socket.on('exportContentList', function(contentList) {
    var list = socket.user + ' playlist \r\n ';
    for (var i = 0; i < contentList.length; i++) {
        list += contentList[i].title + ' ' + contentList[i].url + ' \r\n';
    }
    var link = document.createElement('a');
    mimeType = 'text/plain';
    link.setAttribute('download', socket.user+'_playlist.txt');
    link.setAttribute('href', 'data:' + mimeType + ';charset=utf-16,' + encodeURIComponent(list));
    link.click();
});

socket.on('noContent', function () {
    // Alert the users in an unobtrusive way, while still being clear. flash message?
    currentContent = null;
    console.log('No more content in queue, please add more and press start broadcast.');
});

socket.on('chatMessage', function (msg) {
    $('#chatBox').append('<li>' + msg + '</li>');
    var chat = document.getElementById('chatBox');
    chat.scrollTop = chat.scrollHeight;
});

socket.on('displayContentList', function (contentList) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.displayContentList(contentList);
});

socket.on('updateSkipLabel', function (users, votes) {
    $('#nbUsers').text(users);
    $('#labelSkip').text(votes + "/" + users + " users voted to skip");

    var progessBar = document.getElementById('progessBar');
    progessBar.style.width = (votes / users) * 100 + '%';
    progessBar.setAttribute('aria-valuenow', (votes / users) * 100);
});

socket.on('skipSong', function () {
    SOCIALSOUNDSCLIENT.SOCKETIO.getNextContentFromServer();
    document.getElementById('btnSkip').disabled = false;
});

socket.on('showOwnerControls', function (show) {
    if (show)
        $('#ownerDashboard').show();
    else
        $('#ownerDashboard').hide();           
});

//Will eventually be removed when we will be able to join in a song at any moment.
socket.on('pauseContent', function () {
    SOCIALSOUNDSCLIENT.BASEPLAYER.pauseContent();
});

socket.on('pausePlayer', function (elapsedTime) {
    SOCIALSOUNDSCLIENT.BASEPLAYER.pauseContent(elapsedTime);
});

socket.on('mutePlayer', function () {
    SOCIALSOUNDSCLIENT.BASEPLAYER.muteContent();
});

socket.on('showProperChannelModal', function (room, exists) {
    console.log("showing proper modal for room " + room)
    if (room != 'default-room') {
        exists ? $('#switchChannelModal').modal('show') : $('#createChannelModal').modal('show');
        exists ? setSwitchRoomModalChannelNameValue(room) : setCreateRoomModalChannelNameValue(room);
    }
});

socket.on('joinUnprotectedChannel', function (room) {
    SOCIALSOUNDSCLIENT.SOCKETIO.switchRoom(room, false);
});

socket.on('contentRemoved', function (content, index, user) {
    console.log('Removed ' + content.title + ' at index ' + index + ' by user ' + user);
});

function setSwitchRoomModalChannelNameValue(channelName){
    $('#switchChannelNameField').val(channelName);
};

function setCreateRoomModalChannelNameValue(channelName) {
    $('#createChannelNameField').val(channelName);
};

function writeChannelUrlRequest(channelName) {
    document.location = document.location.protocol + '/player/rooms/' + channelName;
};

function displayUndoAddContentLink(content, index) {

    $('#undoLink').off();
    $('#undoLink').on('click', function () {
        SOCIALSOUNDSCLIENT.SOCKETIO.removeContentFromServer(content, index, usernameChat);
        console.log("Just sent removal request to server with " + content.title + " at index " + index);
    });
};

var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOCKETIO = {
    
    getNextContentFromServer: function () {
        socket.emit('getNextContent', socket.room);
    },
    
    addContentToServer: function (content, user) {
        console.log('Telling server to add ' + content.title + ' to the content queue');
        socket.emit('addContent', content, socket.room, user);
    },
    
    removeContentFromServer: function (content, index, user) {
        console.log('User ' + user + ' telling server to remove ' + content.title + ' at index ' + index + ' from the content queue');
        socket.emit('removeContent', content, socket.room, index, user);
    },
    
    switchRoom: function (room, password) {
        if (password == null || password == 'undefined') {
            password = false;
        }
        console.log("requesting room switch to: " + room);
        socket.emit('switchRoom', room, password);
    },

    createRoom: function (room, password, privateChannel) {
        console.log("requesting to create room: " + room);
        socket.emit('createRoom', room, password, privateChannel);
    },

    
    sendMessage: function (msg) {
        socket.emit('chatMessage', msg, socket.room);
    },

    voteSkip: function () {
        socket.emit('voteSkip', socket.room);
    },

    controlPlayer: function (func)
    {
        socket.emit('controlPlayer', func);
    },

    testRoomExists: function (room) {
        socket.emit('testRoomExists', room);
    },

    setUsername: function (user) {
        socket.emit('setUsername', user);
    },

    switchOrCreateIfNotExists: function (room) {
        socket.emit('switchOrCreateIfNotExists', room);
    },

    exportContent: function () {
        socket.emit('getContentList');
    },
}




