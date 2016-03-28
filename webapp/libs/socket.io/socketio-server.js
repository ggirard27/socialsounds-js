var roomdata = require('./roomdata-extended.js');

module.exports.listen = function (server) {
    
    io = require('socket.io')({
        'transports': ['websockets'],
    }).listen(server);
    
    io.sockets.on('connection', function (socket) {
        
        var defaultRoom = {};
        defaultRoom.roomName = 'default-room';
        var rooms = [];
        defaultRoom.contentQueue = ['https://www.youtube.com/watch?v=gAeWAwdZf9I', 'https://www.soundcloud.com/selected-stream/ansah-i-know/', 'https://www.youtube.com/watch?v=6CnP8ghhZPQ', 
            'https://www.soundcloud.com/e-monts/renegades/', 'https://www.youtube.com/watch?v=P_SlAzsXa7E', 'https://www.soundcloud.com/majorlazer/major-lazer-dj-snake-lean-on-feat-mo/'];
        
        rooms[defaultRoom.roomName] = defaultRoom;
        socket.room = defaultRoom.roomName;
        roomdata.joinRoom(socket, socket.room);
        console.log('user connected');
        socket.emit('roomJoined', socket.room);

        socket.emit('test', "web sockets in azure");      
        
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
        
        socket.on('addContent', function (contentUrl) {
            if (helpers.validateUrl(contentUrl)) {
                contentQueue.push(contentUrl)               // using preliminary content queue
                socket.emit('contentAdded', songUrl)
            }
            else {
                socket.emit('contentRejected', contentUrl)
            }
        });

    });
    
    return io
};
