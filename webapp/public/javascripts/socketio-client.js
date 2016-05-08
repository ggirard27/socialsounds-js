var socket = io();

socket.on('roomJoined', function (room) {
    console.log('Joined room: ' + room);
    socket.room = room;
    SOCIALSOUNDSCLIENT.BASEPLAYER.updateSocialMediaButton
    if (history.pushState) {
        history.pushState(null, null, '#' + room);
    }
    else {
        location.hash = '#' + room;
    }
    $('#chatBox').append('<li> --- You have joined the channel ' + room + '</li>');
    var chat = document.getElementById('chatBox');
    chat.scrollTop = chat.scrollHeight;
});

socket.on('roomCreated', function (room) {
    console.log('Created room: ' + room);
    socket.room = room;
    $('#createChannelModal').modal('hide');
});

socket.on('roomSwitched', function (room) {
    console.log('Switched to room: ' + room);
    $('#switchChannelModal').modal('hide');
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
    //Desktop site
    $("#channelList").html(""); //Empties it before filling it all, desktop website
    $("#smallChannelList").html(""); //Empties it before filling it all, mobile website
    for (var i = 0; i < channels.length; i++) {
        if (channels[i] != "default-room") {
            $('#channelList').append('<li><a href="#" data-toggle="modal" data-target="#switchChannelModal" onclick=setSwitchRoomModalChannelNameValue("' + channels[i] + '")>' + channels[i] + '</a></li>');
            $('#smallChannelList').append('<li><a href="#" data-toggle="modal" data-target="#switchChannelModal" onclick=setSwitchRoomModalChannelNameValue("' + channels[i] + '")>' + channels[i] + '</a></li>');
        }
        else {
            $('#channelList').append('<li><a href="#" onclick=SOCIALSOUNDSCLIENT.SOCKETIO.switchRoom("' + channels[i] + '","")>' + channels[i] + '</a></li>');
            $('#smallChannelList').append('<li><a href="#" onclick=SOCIALSOUNDSCLIENT.SOCKETIO.switchRoom("' + channels[i] + '","")>' + channels[i] + '</a></li>');
        }
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

socket.on('noContent', function () {
    // Alert the users in an unobtrusive way, while still being clear. flash message?
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
    $('#labelSkip').text(votes + "/" + users + " users voted to skip");
    $('#smallLabelSkip').text(votes + "/" + users + " users voted to skip");
});

socket.on('skipSong', function () {
    SOCIALSOUNDSCLIENT.SOCKETIO.getNextContentFromServer();
    document.getElementById('btnSkip').disabled = false;
    document.getElementById('smallBtnSkip').disabled = false;

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
    if (room != '#default-room') {
        exists ? $('#switchChannelModal').modal('show') : $('#createChannelModal').modal('show');
        exists ? setSwitchRoomModalChannelNameValue(room.substring(1)) : setCreateRoomModalChannelNameValue(room.substring(1));
    }
});

function setSwitchRoomModalChannelNameValue(channelName){
    $('#switchChannelNameField').val(channelName);
};

function setCreateRoomModalChannelNameValue(channelName) {
    $('#createChannelNameField').val(channelName);
};

var SOCIALSOUNDSCLIENT = SOCIALSOUNDSCLIENT || {};

SOCIALSOUNDSCLIENT.SOCKETIO = {
    
    getNextContentFromServer: function () {
        socket.emit('getNextContent', socket.room);
    },
    
    addContentToServer: function (content) {
        console.log('Telling server to add ' + content.title + ' to the content queue');
        socket.emit('addContent', content, socket.room);
    },
    
    switchRoom: function (room, password) {
        if (password == null || password == 'undefined') {
            password = '';
        }
        console.log("requesting room switch to: " + room);
        socket.emit('switchRoom', room, password);
    },

    createRoom: function (room, password) {
        console.log("requesting to create room: " + room);
        socket.emit('createRoom', room, password);
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
}




