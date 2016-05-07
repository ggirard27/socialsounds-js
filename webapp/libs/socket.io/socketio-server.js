var roomdata = require('./roomdata-extended.js');

module.exports.listen = function (server) {
    
    io = require('socket.io')({
        'transports': ['websockets'],
    }).listen(server);
    
    var defaultRoom = 'default-room';
    
    io.sockets.on('connection', function (socket) {
        
        socket.room = defaultRoom;
        var default_password = "";
        roomdata.joinRoom(socket, socket.room, default_password);  
        var contentList = roomdata.get(socket, 'contentList');
        io.to(socket.id).emit('roomJoined', socket.room);
        io.to(socket.id).emit('displayContentList', contentList);

        var content = roomdata.get(socket, 'currentContent');
        if (content) {
            var time = new Date().getTime();
            console.log("Current time: " + time)
            var elapsedTime = Math.round((time - roomdata.get(socket, 'currentContentTimestamp')) / 1000);
            console.log("timestamp: " + roomdata.get(socket, 'currentContentTimestamp'));
            console.log('Elapsed time: ', elapsedTime);
            io.to(socket.id).emit('playNextContent', content, elapsedTime);
        }
        
        var channelList = roomdata.channels;
        for(var i = 0; i < channelList.length; i++) {
            console.log("Channel: " + channelList[i]);
        }
        io.to(socket.id).emit('getChannelList', channelList);

        //This bothers me greatly. See implemetation & connection of the websocket why is # of user always n+1;
        io.to(socket.room).emit('updateSkipLabel', roomdata.get(socket, 'users').length, roomdata.get(socket, 'voteSkip'));

        socket.on('disconnect', function () {
            io.to(socket.room).emit('updateSkipLabel', (roomdata.get(socket, 'users').length) - 1, roomdata.get(socket, 'voteSkip')); //Updates the bar because the nummber of users has decreased.
            roomdata.leaveRoom(socket);
            console.log('user disconnected');
            io.to(socket.room).emit('logging', 'user disconnected' + socket);
        });
        
        socket.on('createRoom', function (room, password) {
            if (!roomdata.roomExists(socket, room)) {
                //Update the skip label of the room we are leaving
                io.to(socket.room).emit('updateSkipLabel', (roomdata.get(socket, 'users').length) - 1, roomdata.get(socket, 'voteSkip')); //Updates the bar because the nummber of users has decreased.
                //Tell player to pause the song for the user leaving.
                io.to(socket.id).emit('pauseContent');
                //Actually leave the room
                roomdata.leaveRoom(socket);
                socket.room = room;
                //Join new room
                roomdata.joinRoom(socket, socket.room, password);
                io.to(socket.id).emit('roomCreated', socket.room);
                var connectedUsers = roomdata.get(socket, 'users').length;
                io.to(socket.room).emit('logging', 'user connected, new user count: ' + connectedUsers);
                //Owner control if you are the owner.
                io.to(socket.id).emit('showOwnerControls', socket.id == roomdata.get(socket, 'owner'));
                //Update Channel list and sent it to the user
                channelList = roomdata.channels;
                io.emit('getChannelList', channelList);
                io.to(socket.id).emit('roomJoined', socket.room);
                //Update the skip label of the room that we joined
                io.to(socket.room).emit('updateSkipLabel', connectedUsers, roomdata.get(socket, 'voteSkip'));
                //Get Content list and send it to the user
                contentList = roomdata.get(socket, 'contentList');
                io.to(socket.id).emit('displayContentList', contentList);
                var content = roomdata.get(socket, 'currentContent');
                if (content) {
                    var time = new Date().getTime();
                    console.log("Current time: " + time)
                    var elapsedTime = Math.round((time - roomdata.get(socket, 'currentContentTimestamp')) / 1000);
                    console.log("timestamp: " + roomdata.get(socket, 'currentContentTimestamp'));
                    console.log('Elapsed time: ', elapsedTime);
                    io.to(socket.id).emit('playNextContent', content, elapsedTime);
                }
            } else {
                io.to(socket.id).emit('createRoomFailed', room);
            };
        });
        
        socket.on('switchRoom', function (room, password) {
            if (room != socket.room) {
                if (roomdata.authorize(socket, room, password)) {
                    //Update the skip label of the room we are leaving
                    io.to(socket.room).emit('updateSkipLabel', (roomdata.get(socket, 'users').length) - 1, roomdata.get(socket, 'voteSkip')); //Updates the bar because the nummber of users has decreased.
                    //Tell player to pause the song for the user leaving.
                    io.to(socket.id).emit('pauseContent');
                    //Actually leave the room
                    roomdata.leaveRoom(socket);
                    socket.room = room;
                    //Join new room
                    roomdata.joinRoom(socket, socket.room, password);
                    var connectedUsers = roomdata.get(socket, 'users').length;
                    io.to(socket.room).emit('logging', 'user connected, new user count: ' + connectedUsers);
                    //Update Channel list and sent it to the user
                    channelList = roomdata.channels;
                    io.emit('getChannelList', channelList);
                    io.to(socket.id).emit('roomJoined', socket.room);
                    io.to(socket.id).emit('roomSwitched', socket.room);
                    //Update the skip label of the room that we joined
                    io.to(socket.room).emit('updateSkipLabel', connectedUsers, roomdata.get(socket, 'voteSkip'));
                    //Get Content list and send it to the user
                    contentList = roomdata.get(socket, 'contentList');
                    io.to(socket.id).emit('displayContentList', contentList);
                    var content = roomdata.get(socket, 'currentContent');
                    if (content) {
                        var time = new Date().getTime();
                        console.log("Current time: " + time)
                        var elapsedTime = Math.round((time - roomdata.get(socket, 'currentContentTimestamp')) / 1000);
                        console.log("timestamp: " + roomdata.get(socket, 'currentContentTimestamp'));
                        console.log('Elapsed time: ', elapsedTime);
                        io.to(socket.id).emit('playNextContent', content, elapsedTime);
                    }
                } else {
                    io.to(socket.id).emit('joinRoomFailed', room);
                }
            } else {
                io.to(socket.id).emit('roomSwitched', socket.room);
            }
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Player functions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        socket.on('getNextContent', function (room) {
            var contentQueue = roomdata.get(socket, 'contentQueue');
            if (contentQueue.getLength() > 0) {
                var nextContent = contentQueue.dequeue();
                roomdata.set(socket, 'currentContent', nextContent);
                roomdata.set(socket, 'currentContentTimestamp', new Date().getTime());
                //Resets the voteskips probably pretty bad for the performances..
                roomdata.clearVoteSkip(socket.room);
                io.to(socket.room).emit('updateSkipLabel', roomdata.get(socket, 'users').length, 0);
                var timestamp = 0;
                io.to(socket.room).emit('playNextContent', nextContent, timestamp);
            }
            else {
                io.to(socket.room).emit('noContent');
            }
        });
        
        socket.on('addContent', function (content, room) {
            var contentQueue = roomdata.get(socket, 'contentQueue');
            var contentList = roomdata.get(socket, 'contentList');
            console.log('Request to add ' + content.url + ' to queue of room ' + room);
            if (content) {
                console.log('Request accepted');
                contentQueue.enqueue(content);
                contentList.push(content);
                io.to(socket.room).emit('contentAdded', content);
            }
            else {
                console.log('Request denied');
                io.to(socket.room).emit('contentRejected', content);
            }
        });
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Chat functions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        socket.on('chatMessage', function (msg, room) {
            io.to(socket.room).emit('chatMessage', msg);
        });

        socket.on('voteSkip', function (room) {
            var votes = roomdata.get(socket, 'voteSkip');
            var userConnected = roomdata.get(socket, 'users').length
            var votesRequired = Math.ceil(userConnected * 0.66) //two thirds of the people must agree to skip the song.
            roomdata.incrementVoteSkip(room);
            if (votes + 1 >= votesRequired)
                io.to(socket.room).emit('skipSong');
            else
                io.to(socket.room).emit('updateSkipLabel', userConnected, votes+1);
        });

        socket.on('controlPlayer', function (func) {
            if (socket.id == roomdata.get(socket, 'owner')) {         
                if (func == 'mute')
                    io.to(socket.room).emit('mutePlayer');
                else if (func == 'pause')
                    io.to(socket.room).emit('pausePlayer');
                else if (func == 'skip')
                    io.to(socket.room).emit('skipSong')
            }
        });

    }); 
    
    return io
};
