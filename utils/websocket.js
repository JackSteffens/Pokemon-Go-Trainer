// Configuration
function init(server) {
  io = require('socket.io')(server);          // Socket.io
  io.on('connection', function(){
    console.log('[i] Client connected to websocket');
    io.emit('test', 'You were already connected. Someone else just did too');
  });
}

/**
* Broadcast websocket message or object to a specific channel
* @param String channel
* @param Object {message}
*/
function broadcast(channel, message) {
  io.emit(channel, message);
}

module.exports = {
  init:init,
  broadcast : broadcast
}
