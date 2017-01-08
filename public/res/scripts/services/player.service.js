angular.module('pogobot').service('PlayerService',
  function($filter, $http, Api) {
    this.currentPlayer = {}; // Current globally selected user
    this.players = []; // All known players, logged in or not

    /**
    * Set globally visible character. This has effect on routing to pages
    * specifically meant for a single character such as the Pokedex.
    * @Params String username
    */
    this.setPlayer = function(username) {
      // For each players[], check if 'username' exists.
      // 'currentPlayer' = players[index]
      var player = $filter(this.players)({username:username});
      if (player) {
        this.currentPlayer = player;
      } else {
        console.error("Player ["+username+"] doesn't exist");
      }
    }

    /**
    * Set login state to online and unlock features
    */
    this.login = function(args) {

    }

    /**
    * Set login state to offline and block features
    */
    this.logout = function(args) {

    }

    /**
    * Fetches all known players from the database using the API
    */
    this.fetchPlayers = function() {
      // $http();
    }

});
