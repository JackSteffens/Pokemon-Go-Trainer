angular.module('pogobot').controller('SidenavCtrl',
function($scope, $mdSidenav, TrainerService) {
  $scope.closeSidenav = function() {
    $mdSidenav('left').close();
  };
  $scope.trainers = TrainerService.getOnlineTrainers();
  $scope.selectedCharacterIndex = 0;

  function init() {
    selectTrainer($scope.selectedCharacterIndex);
    $scope.$watch(function() {
      return TrainerService.getOnlineTrainers();
    }, function(trainers) {
      $scope.trainers = trainers;
    }, true);

    // Watcher on tabs index. Switching tabs selects a trainer.
    $scope.$watch('selectedCharacterIndex', function(newVal, oldVal) {
      if (oldVal != newVal) {
        selectTrainer(newVal)
      }
    }, true);

    // Watcher on getOnlineTrainers for auto selecting the first login.
    $scope.$watch(function() {
      return TrainerService.getOnlineTrainers().length;
    }, function(newVal, oldVal) {
      if (!oldVal && newVal > 0) {
        console.log('selectTrainer() because first login');
        selectTrainer($scope.selectedCharacterIndex);
      }
    }, true);
  }

  function selectTrainer(index) {
    if (index || index === 0) {
      var newTrainer = TrainerService.getOnlineTrainers()[index];
      if (newTrainer)
        TrainerService.setTrainer(newTrainer.username);
    }
  }




  $scope.routes = [
    {label:"map",        route:"map",        icon:"home",      auth:false},
    {label:"accounts",   route:"accounts",   icon:"people",    auth:false},
    {label:"settings",   route:"settings",   icon:"settings",  auth:false},
    {label:"Character Overview", route:"overview", icon:"folder_shared", auth:true}
  ];

  init();
});
