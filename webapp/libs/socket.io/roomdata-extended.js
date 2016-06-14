var q = require('../Queue.js');
exports.Debug = true;

exports.rooms = {};
exports.channels = ['default-room'];

exports.roomExists = function (socket, room) {
    if (!this.rooms[room]) return false;
    return true;
};

exports.roomIsProtected = function (socket, room) {
    if (this.rooms[room])
        return this.rooms[room].passwordProtected;
}

exports.dataExists = function (socket, variable) {
    var res = (this.rooms[socket.roomdata_room].variables[variable] == 'undefined') ? "false" : "true";
    if (exports.Debug) console.log(socket.id + ": Testing variable: " + variable + ". Result: " + res);
    if (!this.roomExists(socket, socket.roomdata_room)) {
        console.error("You have tried testing a room variable but this socket is not in any room!");
        return false;
    }
    return (this.rooms[socket.roomdata_room].variables[variable] == 'undefined') ? false : true;
};

exports.createRoom = function (socket, room, password, privateChannel) {
    if (exports.Debug) console.log(socket.id + ": Creating Room: " + room);
    if (this.channels.indexOf(room) < 0 && !privateChannel) {
        this.channels.push(room);
    }
    var isPasswordProtected = (password == false ? false : true);
    var _owner = (room == 'default-room' ? 'gtfo' : socket.id);
    this.rooms[room] = { owner: socket.user, users: [], variables: {}, contentList: new q.ContentList(socket.id), voteSkip: 0, passwordProtected: isPasswordProtected, passwordValue: password, ownerId: _owner };
}

exports.set = function (socket, variable, content) {
    if (exports.Debug) console.log(socket.id + ": Creating variable: " + variable + " with content: " + content);
    if (!this.roomExists(socket, socket.roomdata_room)) {
        console.error("You have tried setting a room variable but this socket is not in any room!");
        return false;
    }
    this.rooms[socket.roomdata_room].variables[variable] = content;
}

exports.get = function (socket, variable, content) {
    if (exports.Debug) console.log(socket.id + ": Getting variable: " + variable);
    if (variable == "room") {
        if (!socket.roomdata_room) return undefined;
        return socket.roomdata_room;
    }
    if (!this.roomExists(socket, socket.roomdata_room)) {
        console.error("You have tried getting a room variable but this socket is not in any room!");
        return undefined;
    }
    if (variable == "rooms") return channelList;
    if (variable == "owner") return this.rooms[socket.roomdata_room].owner;
    if (variable == "users") return this.rooms[socket.roomdata_room].users;
    if (variable == "voteSkip") return this.rooms[socket.roomdata_room].voteSkip;
    if (variable == "contentList") return this.rooms[socket.roomdata_room].contentList;
    if (variable == "ownerId") return this.rooms[socket.roomdata_room].ownerId;
    return this.rooms[socket.roomdata_room].variables[variable];
}

exports.joinRoom = function (socket, room, password, privateChannel) {

    if (exports.Debug) console.log(socket.id + ": Joining room: " + room);
    var userObject = { id: socket.id, name: socket.user }

    if (!this.roomExists(socket, room)) {
        this.createRoom(socket, room, password, privateChannel);
        this.rooms[room].users.push(userObject);
        socket.join(room);
        socket.roomdata_room = room;
    } 
    else {
        if (this.rooms[room].passwordProtected) {
            if (this.authorize(room, password)) {
                this.rooms[room].users.push(userObject);
                socket.join(room);
                socket.roomdata_room = room;
                console.log("authorized request");
            } 
            else {
                console.log("rejected request");
            }
        } 
        else {
            this.rooms[room].users.push(userObject);
            socket.join(room);
            socket.roomdata_room = room;
            console.log("no password, automatically authorized request");
        }
    }
    if ((room != 'default-room') && socket.user == this.rooms[room].owner) {
        this.rooms[room].ownerId = socket.id;
    }
};

exports.clearRoom = function (room) {
    delete this.rooms[room];
    //We don't want to remove the default-room shortcut.
    if (room != 'default-room' && this.channels.indexOf(room) > -1) {
        this.channels.splice(this.channels.indexOf(room), 1);
    }
};

exports.incrementVoteSkip = function (room) {
    this.rooms[room].voteSkip += 1;
}

exports.clearVoteSkip = function (room) {
    this.rooms[room].voteSkip = 0;
}

exports.authorize = function (socket, room, password) {
    if (this.roomExists(socket, room) && this.rooms[room].passwordProtected) {
        console.log("socket: " + socket + " room: " + room + "password: " + password+ "real password: " + this.rooms[room].passwordValue);
        return this.rooms[room].passwordValue == password ? true : false;
    }
    // Room does not exist, so all auth attempts are valid.
    return true;
}


exports.leaveRoom = function (socket) {
    var room = socket.roomdata_room;
    if (socket.roomdata_room == undefined) throw new Error("socket id:" + socket.id + " is not in a room!");
    if (exports.Debug) console.log(socket.id + ": Leaving room: " + socket.roomdata_room);
    var i = findWithAttr(this.rooms[socket.roomdata_room].users, 'id', socket.id);
    if (i != -1) {
        this.rooms[socket.roomdata_room].users.splice(i, 1);
        console.log("successfully removed user"+ socket.id + "from room");
    }
    socket.leave(socket.roomdata_room);
    if (this.rooms[room].users.length == 0) {
        this.clearRoom(room);
    }
}

function findWithAttr(array, attr, value) {
    for (var i = 0; i < array.length; i += 1) {
        if (array[i][attr] === value) {
            return i;
        }
    }
}