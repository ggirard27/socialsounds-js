var roomdata = require('./roomdata-extended.js');

module.exports.listen = function (server) {
    
    io = require('socket.io')({
        //'transports': ['websockets'],
    }).listen(server);
    
    var defaultRoom = 'default-room';
    
    io.sockets.on('connection', function (socket) {
        
        socket.room = defaultRoom;
        roomdata.joinRoom(socket, socket.room);  
        var contentList = roomdata.get(socket, 'contentList');
        io.to(socket.id).emit('roomJoined', socket.room);
        io.to(socket.id).emit('displayContentList', contentList);
        
        var channelList = roomdata.channels;
        for(var i = 0; i < channelList.length; i++) {
            console.log("Channel: " + channelList[i]);
        }
        io.to(socket.id).emit('getChannelList', channelList);

        socket.on('disconnect', function () {
            roomdata.leaveRoom(socket);
            console.log('user disconnected');
            io.to(socket.room).emit('logging', 'user disconnected');
        });
        
        socket.on('switchRoom', function (room) {
            if (room != socket.room) {
                roomdata.leaveRoom(socket);
                socket.room = room;
                roomdata.joinRoom(socket, socket.room);
                io.to(socket.room).emit('logging', 'user connected, new user count: ' + roomdata.get(socket, 'users').length);
                channelList = roomdata.channels;
                io.to(socket.id).emit('getChannelList', channelList);
            }
            io.to(socket.id).emit('roomJoined', socket.room);
            io.to(socket.id).emit('displayContentList', contentList);
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Player functions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        socket.on('getNextContent', function (room) {
            var contentQueue = roomdata.get(socket, 'contentQueue');
            if (contentQueue.getLength() > 0) {
                var nextContent = contentQueue.dequeue();
                io.to(socket.room).emit('playNextContent', nextContent);
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
    }); 
    
    return io
};
