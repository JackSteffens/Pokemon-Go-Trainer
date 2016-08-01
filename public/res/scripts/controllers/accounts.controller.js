angular.module('pogobot')
  .controller('AccountsCtrl', [
  '$scope', '$rootScope', '$http', '$mdDialog',
function($scope, $rootScope, $http, $mdDialog) {
  // Scope variables
  $rootScope.currentUI = 'accounts';
  $scope.accounts = {};

  // Scope functions
  $scope.loginPopup = loginPopup;
  $scope.getAccounts = getAccounts;

  function getAccounts() {
    $http({
      method: 'GET',
      url: 'http://localhost:3000/api/trainer'
    }).then(function successCallback(response) {
      $scope.accounts = response.data;
    }, function errorCallback(response) {
      console.log('An error occured');
      console.log(response);
    });
  }

  function loginPopup(event, account) {
    $mdDialog.show({
      controller: 'loginCtrl',
      templateUrl: './res/views/login.dialog.html',
      parent: angular.element(document.body),
      targetEvent: event,
      clickOutsideToClose: false,
      scope: $scope,
      preserveScope: true,
      resolve: {
        trainerObj: function () {
            return account;
            console.log(account);
        }
      }
    }).then(function successCallback() {
      getAccounts();
    }, function errorCallback() {
      $mdDialog.show(
        $mdDialog.alert()
          .parent(document.body)
          .clickOutsideToClose(true)
          .title('Error')
          .textContent('Something went wrong while logging in')
          .ariaLabel('Login error')
          .ok('Ok')
          .targetEvent(event)
      );
    });
  }
  // Start
  getAccounts();
}
]);
