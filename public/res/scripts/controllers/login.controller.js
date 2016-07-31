angular.module('pogobot')
  .controller('loginCtrl', [
    '$scope', '$rootScope', '$mdDialog', '$http', 'trainerObj',
    function($scope, $rootScope, $mdDialog, $http, trainerObj) {
      $scope.trainerObj = trainerObj;

      if (trainerObj) {
        $scope.authObj = {
          username: $scope.trainerObj.login.username,
          password: "",
          provider: $scope.trainerObj.login.type,
          latitude: $scope.trainerObj.location.latitude,
          longitude: $scope.trainerObj.location.longitude,
          altitude: $scope.trainerObj.location.altitude
        }
      } else {
        $scope.authObj = {
          username: "",
          password: "",
          provider: "",
          latitude: parseFloat(52.3730),
          longitude: parseFloat(4.8925),
          altitude: parseFloat(1)
        }
      }

      $scope.login = login;
      $scope.cancelLogin = cancelLogin;

      function login() {
        $scope.loginDisabled = true;
        $http({
          method: 'POST',
          url: 'http://localhost:3000/api/trainer/login/'+$scope.authObj.provider,
          data: $scope.authObj
        }).then(function successCallback(response) {
          console.log(response);
          updatePlayer(response.data[0]);
          // $scope.loginDisabled = false;
          $mdDialog.hide('succesful login');
        }, function errorCallback(error) {
          console.log(error);
          $scope.loginDisabled = false;
          // Display warning rather than closing the dialog
          // $mdDialog.cancel('Failed logging in');
        });
      }

      function updatePlayer(trainerObj) {
        $http({
          method: 'GET',
          url: 'http://localhost:3000/api/trainer/inventory?username='+(trainerObj.username).toString()
        }).then(function successCallback(response) {
          console.log(response);
          $scope.loginDisabled = false;
          $mdDialog.hide('Updating successful')
        }, function errorCallback(error) {
          console.log(error);
          $scope.loginDisabled = false;
          // Login was successsful.
          // No need to keep the login dialog open when an error occurs over here
          $mdDialog.cancel('Failed updating profile');
        });
      }

      function cancelLogin() {
        $mdDialog.cancel('Login cancelled')
      }

      function getPlayerInventory(trainerObj) {
        $http({
          method: 'GET',
          url: 'http://localhost:3000/api/trainer/inventory'
        }).then();
      }

    }
  ]);
