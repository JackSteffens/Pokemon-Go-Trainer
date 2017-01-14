angular.module('pogobot').service('TrainerService',
  function($filter, $http, Api) {
    this.currentTrainer = {}; // Current globally selected user
    this.trainers = []; // All known trainers, logged in or not
    this.onlineTrainers = [];

    /**
    * Set globally visible character. This has effect on routing to pages
    * specifically meant for a single character such as the Pokedex.
    * @param String username
    */
    this.setTrainer = function(username) {
      // For each trainers[], check if 'username' exists.
      // 'currentPlayer' = trainers[index]
      var trainer = $filter('filter')(this.trainers, {username:username}, true)[0];
      if (trainer) {
        this.currentTrainer = trainer;
      } else {
        console.error("Trainer ["+username+"] doesn't exist");
      }
    }

    this.getTrainers = function() {
      return this.trainers;
    }

    this.getOnlineTrainers = function() {
      return this.onlineTrainers;
    }

    this.getCurrentTrainer = function() {
      return this.currentTrainer;
    }

    return this;
});
