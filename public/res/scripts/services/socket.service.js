angular.module('pogobot').service('Socket',
  function($http, Api) {
    this.socket;

    this.init = function() {
      this.socket = io.connect('http://localhost:3000');

        // socket.join('connected');
        this.socket.on('test', function (data) {
          console.log(data);
          // socket.emit('my other event', { my: 'data' });
        });

        this.socket.on('update', function(data) {
          console.log(data);
        });
    }

    this.subscribe = function(channel, callback) {
      this.socket.on(channel, function(data) {
        callback(data);
      })
    };

    /**
    * Unsubscribe from channel
    * @param String channel
    */
    this.unsubscribe = function(channel) {
      // ??
    };

    return this;
});
