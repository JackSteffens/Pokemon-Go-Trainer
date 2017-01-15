angular.module('pogobot').service('TrainerService',
  function($filter, $http, Api) {
    this.currentTrainer = undefined; // Current globally selected user
    this.trainers = undefined; // All known trainers, logged in or not
    this.onlineTrainers = undefined;

    /**
    * Set globally visible character. This has effect on routing to pages
    * specifically meant for a single character such as the Pokedex.
    * @param String username
    */
    this.setTrainer = function(username) {
      if (!this.currentTrainer || (username !== this.currentTrainer.username)) {
        var trainer = $filter('filter')(this.onlineTrainers, {username:username}, true)[0];
        if (trainer) {
          this.currentTrainer = trainer;
        }
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
