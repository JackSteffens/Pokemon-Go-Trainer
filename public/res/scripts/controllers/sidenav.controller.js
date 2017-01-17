angular.module('pogobot').controller('SidenavCtrl',
function($scope, $mdSidenav, $filter, TrainerService) {
  $scope.closeSidenav = function() {
    $mdSidenav('left').close();
  };
  $scope.trainers = TrainerService.getOnlineTrainers();
  $scope.selectedCharacterIndex = 0;

  function init() {
    selectTrainer($scope.selectedCharacterIndex);

    // Watcher on online trainers
    $scope.$watch(function() {
      return TrainerService.getOnlineTrainers();
    }, function(trainers) {
      $scope.trainers = trainers;
      if (trainers.length == 1) {
        selectTrainer(0);
      }
    }, true);

    // Watcher on tabs index. Switching tabs selects a trainer.
    $scope.$watch('selectedCharacterIndex', function(newVal, oldVal) {
      if (oldVal != newVal) {
        selectTrainer(newVal)
      }
    }, true);

    $scope.$watch(function() {
      var trainer = TrainerService.getCurrentTrainer();
      if (trainer) return trainer.username; else return null;
    }, function(newVal, oldVal) {
      if (newVal !== oldVal) {
        for (var i = 0; i < $scope.trainers.length; i++) {
          if  (newVal == $scope.trainers[i].username) {
            $scope.selectedCharacterIndex = i;
          }
        }
      }
    },true);
  }

  function selectTrainer(index) {
    if (index || index === 0 && TrainerService.getOnlineTrainers().length > 0) {
      var newTrainer = TrainerService.getOnlineTrainers()[index];
      if (newTrainer)
        TrainerService.setTrainer(newTrainer.username);
    }
  }

  $scope.routes = [
    {label:"map",        route:"map",        icon:"map"     },
    {label:"accounts",   route:"accounts",   icon:"people"  },
    {label:"history",    route:"history",    icon:"timeline"},
    {label:"settings",   route:"settings",   icon:"settings"}
  ];

  init();
});
