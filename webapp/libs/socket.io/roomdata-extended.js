﻿var q = require('../Queue.js');
exports.Debug = true;

exports.rooms = {};

exports.roomExists = function (socket, room) {
    if (!this.rooms[room]) return false;
    return true;
};

exports.dataExists = function (socket, variable) {
    var res = (this.rooms[socket.roomdata_room].variables[variable] == 'undefined') ? "false" : "true";
    if (exports.Debug) console.log(socket.id + ": Testing variable: " + variable + ". Result: " + res);
    if (!this.roomExists(socket, socket.roomdata_room)) {
        console.error("You have tried testing a room variable but this socket is not in any room!");
        return false;
    }
    return (this.rooms[socket.roomdata_room].variables[variable] == 'undefined') ? false : true;
};

exports.createRoom = function (socket, room) {
    if (exports.Debug) console.log(socket.id + ": Creating Room: " + room);
    this.rooms[room] = { owner: socket.id, users: [], variables: {}, contentQueue: new q.Queue(), contentList: [],};
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
    if (variable == "owner") return this.rooms[socket.roomdata_room].owner
    if (variable == "users") return this.rooms[socket.roomdata_room].users
    if (variable == "contentList") {
        console.log("Should be returning contentQueue, and the length is: " + this.rooms[socket.roomdata_room].contentList.length);
        return this.rooms[socket.roomdata_room].contentList;
    }
    if (variable == "contentQueue") {
        console.log("Should be returning contentQueue, and the length is: " + this.rooms[socket.roomdata_room].contentQueue.getLength());
        return this.rooms[socket.roomdata_room].contentQueue;
    }
    return this.rooms[socket.roomdata_room].variables[variable];
}

exports.joinRoom = function (socket, room) {
    if (exports.Debug) console.log(socket.id + ": Joining room: " + room);
    if (!this.roomExists(socket, room)) this.createRoom(socket, room);
    this.rooms[room].users.push(socket.id);
    socket.join(room);
    socket.roomdata_room = room;
};

exports.clearRoom = function (room) {
    delete this.rooms[room];
};

exports.leaveRoom = function (socket) {
    var room = socket.roomdata_room;
    if (socket.roomdata_room == undefined) throw new Error("socket id:" + socket.id + " is not in a room!");
    if (exports.Debug) console.log(socket.id + ": Leaving room: " + socket.roomdata_room);
    var i = this.rooms[socket.roomdata_room].users.indexOf(socket.id);
    if (i != -1) this.rooms[socket.roomdata_room].users.splice(i, 1);
    socket.leave(socket.roomdata_room);
    if (this.rooms[room].users.length == 0) {
        this.clearRoom(room);
    }
}