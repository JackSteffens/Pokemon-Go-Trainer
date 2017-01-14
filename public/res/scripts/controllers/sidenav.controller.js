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

    $scope.$watch('selectedCharacterIndex', function(newVal, oldVal) {
      console.log(newVal)
      if (oldVal != newVal) {
        selectTrainer(newVal)
      }
    }, true);
  }

  function selectTrainer(index) {
    if (index || index === 0) {
      var newTrainer = TrainerService.getOnlineTrainers()[index];
      if (newTrainer)
        TrainerService.setTrainer(newTrainer.username);
      console.log(TrainerService.getCurrentTrainer());
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
