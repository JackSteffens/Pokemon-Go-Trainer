angular.module('pogobot').controller('AccountsCtrl',
function($scope, $rootScope, $http, $mdDialog, Api) {
  // Scope variables
  $rootScope.currentUI = 'accounts';
  $scope.trainers = {};

  // Scope functions
  $scope.loginPopup = loginPopup;
  $scope.getTrainers = getTrainers;
  $scope.getAvailableTrainers = getAvailableTrainers;

  function getTrainers() {
    $http({
      method: 'GET',
      url: Api.url.trainer
    }).then(function successCallback(response) {
      $scope.trainers = response.data;
    }, function errorCallback(response) {
      console.log('An error occured');
      console.log(response);
    });
  }

  function getAvailableTrainers() {
    $http({
      method: 'GET',
      url: Api.url.availableTrainers
    }).then(function successCallback(response) {
      console.log(response.data);
    }, function errorCallback(response) {
      console.log('error fetching online trainers')
    });
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
      getTrainers();
    });
  }
  // Start
  getTrainers();
});
