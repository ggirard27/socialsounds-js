var roomdata = require('./roomdata-extended.js');

module.exports.listen = function (server) {
    
    io = require('socket.io')({
        //'transports': ['websockets'],
    }).listen(server);
    
    //https://gist.github.com/nfroidure/5472480#file-queue-js
    var Queue = function () {
        var functionSet = (function () {
            var _elements = []; // creating a private array
            return [
		        // push function
                function () { return _elements.push.apply(_elements, arguments); },
		        // shift function
                function () { return _elements.shift.apply(_elements, arguments); },
                function () { return _elements.length; },
                function (n) { return _elements.length = n; }];
        })();
        this.push = functionSet[0];
        this.shift = functionSet[1];
        Object.defineProperty(this, 'length', {
            'get': functionSet[2],
            'set': functionSet[3],
            'writeable': true,
            'enumerable': false,
            'configurable': false
        });
        // initializing the queue with given arguments
        this.push.apply(this, arguments);
    };
    
    var defaultRoom = {};
    defaultRoom.roomName = 'default-room';
    defaultRoom.contentQueue = new Queue();
    var rooms = [];
    rooms[defaultRoom.roomName] = defaultRoom;
    
    
    io.sockets.on('connection', function (socket) {
        
        
        socket.room = defaultRoom.roomName;
        //roomdata.joinRoom(socket, socket.room);
        io.emit('logging', 'user connected');
        console.log('user connected');
        io.emit('roomJoined', socket.room);
        
        socket.on('disconnect', function () {
            //roomdata.leaveRoom(socket);
            console.log('user disconnected');
            socket.emit('logging', 'user disconnected');
        });

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Player functions
        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        
        socket.on('getNextContent', function (room) {
            if (rooms[room].contentQueue.length > 0) {
                var nextContent = rooms[room].contentQueue.shift();         // using preliminary content queue
                io.emit('playNextContent', nextContent);
            }
            else {
                io.emit('noContent');
            }
        });
        
        socket.on('addContent', function (content, room) {
            console.log('Request to add ' + content.url + ' to queue of room ' + room);
            if (content) {
                console.log('Request accepted');
                rooms[room].contentQueue.push(content)               // using preliminary content queue
                io.emit('contentAdded', content)
            }
            else {
                console.log('Request denied');
                io.emit('contentRejected', content)
            }
        });

    }); 
    
    return io
};
