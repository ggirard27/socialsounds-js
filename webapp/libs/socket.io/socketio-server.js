var roomdata = require('./roomdata-extended.js');

module.exports.listen = function (server) {
    
    io = require('socket.io')({
        'transports': ['websockets'],
    }).listen(server);
    
    io.sockets.on('connection', function (socket) {
        
        var defaultRoom = {};
        defaultRoom.roomName = 'default-room';
        var rooms = [];
        defaultRoom.contentQueue = [];
        
        rooms[defaultRoom.roomName] = defaultRoom;
        socket.room = defaultRoom.roomName;
        roomdata.joinRoom(socket, socket.room);
        console.log('user connected');
        socket.emit('roomJoined', socket.room);
        
        socket.on('disconnect', function () {
            roomdata.leaveRoom(socket);
            console.log('user disconnected');
        });
        
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Player functions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        socket.on('getNextContent', function (room) {
            var nextContent = rooms[room].contentQueue.pop();         // using preliminary content queue
            socket.emit('playNextContent', nextContent);
        });
        
        socket.on('addContent', function (content, room) {
            console.log('Request to add ' + content.url + ' to queue of room '+ room);
            if (content) {
                console.log('Request accepted');
                rooms[room].contentQueue.push(content)               // using preliminary content queue
                socket.emit('contentAdded', content)
            }
            else {
                console.log('Request denied');
                socket.emit('contentRejected', content)
            }
        });

    });
    
    return io
};
