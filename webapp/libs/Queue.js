/*

Queue.js

A function to represent a queue

Created by Stephen Morley - http://code.stephenmorley.org/ - and released under
the terms of the CC0 1.0 Universal legal code:

http://creativecommons.org/publicdomain/zero/1.0/legalcode

*/

/* Creates a new queue. A queue is a first-in-first-out (FIFO) data structure -
 * items are added to the end of the queue and removed from the front.
 */
/*
exports.Queue = function Queue() {
    
    // initialise the queue and offset
    var queue = [];
    var offset = 0;
    
    // Returns the length of the queue.
    this.getLength = function () {
        return (queue.length - offset);
    }
    
    // Returns true if the queue is empty, and false otherwise.
    this.isEmpty = function () {
        return (queue.length == 0);
    }
    
  this.enqueue = function (item) {
        queue.push(item);
    }

  this.dequeue = function () {
        
        // if the queue is empty, return immediately
        if (queue.length == 0) return undefined;
        
        // store the item at the front of the queue
        var item = queue[offset];
        
        // increment the offset and remove the free space if necessary
        if (++offset * 2 >= queue.length) {
            queue = queue.slice(offset);
            offset = 0;
        }
        
        // return the dequeued item
        return item;

    }
    
  this.peek = function () {
        return (queue.length > 0 ? queue[offset] : undefined);
    }

}
*/

exports.ContentList = function ContentList(owner) {

    var queueOwner = owner;
    var queue = [];
    var users = [];
    var currentIndex = 0;
    
    this.removeContent = function (index, user) {
        if (users[index] == user || user == queueOwner) {
            queue[index] = null;
        }
    }
    
    this.getLength = function () {
        return (queue.length);
    }
    
    this.getRemaining = function () {
        return (queue.length - currentIndex);
    }
    
    this.getCurrentIndex = function () {
        return (currentIndex);
    }
    
    this.isEmpty = function () {
        return (queue.length == 0);
    }
    
    this.enqueue = function (item, user) {
        queue.push(item);
        users.push(user);
        return queue.length;
    }
    
    this.dequeue = function () {

        if (queue.length == 0) return undefined;
        
        while (queue[currentIndex] == null) currentIndex++;
        
        var item = queue[currentIndex];

        currentIndex++;

        return item;
    }
    
    this.peek = function () {
        return (queue.length > 0 ? queue[offset] : undefined);
    }

}