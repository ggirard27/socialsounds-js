module.exports = function (io) {
    io.on('connection', function (socket) {
        socket.emit('test', "web sockets in azure");
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });
}