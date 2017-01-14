angular.module('pogobot').controller('AccountsCtrl',
function($scope, $rootScope, $http, $mdDialog, Api, TrainerService, Authenticate, $timeout) {
  // Scope variables
  $rootScope.currentUI = 'accounts';
  $scope.trainers = TrainerService.getTrainers();

  // Scope functions
  $scope.loginPopup = loginPopup;
  $scope.getAvailableTrainers = Authenticate.fetchTrainers;

  function init() {
    // Set watcher
    $scope.$watch(function() {
      return TrainerService.trainers;
    }, function(newVal, oldVal) {
      $scope.trainers = newVal;
    }, true);
  }

  function loginPopup(event, account) {
    $mdDialog.show({
      controller: 'loginCtrl',
      templateUrl: './res/views/dialogs/login.dialog.html',
      parent: angular.element(document.body),
      targetEvent: event,
      clickOutsideToClose: false,
      scope: $scope.$new(),
      preserveScope: false,
      resolve: {
        trainerObj: function () {
            return account;
        }
      }
    }).then(function successCallback() {
      console.log('Login successfull');
    });
  }

  init();
});
