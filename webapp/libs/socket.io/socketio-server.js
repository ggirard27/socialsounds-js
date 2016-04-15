var roomdata = require('./roomdata-extended.js');

module.exports.listen = function (server) {
    
    io = require('socket.io')({
        //'transports': ['websockets'],
    }).listen(server);
    
    var defaultRoom = 'default-room';
    
    io.sockets.on('connection', function (socket) {
        
        socket.room = defaultRoom;
        roomdata.joinRoom(socket, socket.room);  
        io.to(socket.room).emit('logging', 'user connected');
        io.to(socket.room).emit('roomJoined', socket.room);
        
        socket.on('disconnect', function () {
            roomdata.leaveRoom(socket);
            console.log('user disconnected');
            io.to(socket.room).emit('logging', 'user disconnected');
        });
        
        socket.on('switchRoom', function (room) {
            roomdata.leaveRoom(socket);
            socket.room = room;
            roomdata.joinRoom(socket, socket.room);
            io.to(socket.room).emit('logging', 'user connected, new user count: ' + roomdata.get(socket, 'users').length);
            io.to(socket.room).emit('roomJoined', socket.room);
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Player functions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        socket.on('getNextContent', function (room) {
            var contentQueue = roomdata.get(socket, 'contentQueue');
            if (contentQueue.length > 0) {
                var nextContent = contentQueue.shift();         // using preliminary content queue
                io.to(socket.room).emit('playNextContent', nextContent);
            }
            else {
                io.to(socket.room).emit('noContent');
            }
        });
        
        socket.on('addContent', function (content, room) {
            var contentQueue = roomdata.get(socket, 'contentQueue');
            console.log('Request to add ' + content.url + ' to queue of room ' + room);
            if (content) {
                console.log('Request accepted');
                contentQueue.push(content);              // using preliminary content queue
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
