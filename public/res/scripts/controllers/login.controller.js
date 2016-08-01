angular.module('pogobot')
  .controller('loginCtrl', [
    '$scope', '$rootScope', '$mdDialog', '$http', 'trainerObj', 'NgMap',
    function($scope, $rootScope, $mdDialog, $http, trainerObj, NgMap) {
      $scope.trainerObj = trainerObj;

      if (trainerObj) {
        $scope.authObj = {
          username: $scope.trainerObj.login.username,
          password: "",
          provider: $scope.trainerObj.login.type,
          latitude: parseFloat($scope.trainerObj.location.latitude),
          longitude: parseFloat($scope.trainerObj.location.longitude),
          altitude: parseFloat($scope.trainerObj.location.altitude)
        }
      } else {
        $scope.authObj = {
          username: "",
          password: "",
          provider: "",
          latitude: parseFloat(52.359),
          longitude: parseFloat(4.7816),
          altitude: parseFloat(-1.07)
        }
      }

      // Google Maps doesn't like redrawing itself. Force a redraw by faking a resize event.
      setTimeout(
        NgMap.getMap({id:"coordMap"}).then(function(map) {
          var coords = new google.maps.LatLng($scope.authObj.latitude, $scope.authObj.longitude);
          window.map = map;
          google.maps.event.trigger(map,'resize');
          map.setZoom(15);
          map.setCenter(coords);
        }),
      2000);

      $scope.login = login;
      $scope.cancelLogin = cancelLogin;

      function login() {
        $scope.loginDisabled = true;
        $scope.isLoading = true;
        $http({
          method: 'POST',
          url: 'http://localhost:3000/api/trainer/login',
          data: $scope.authObj
        }).then(function successCallback(response) {
          console.log(response);
          setTimeout(getPlayerInventory(response.data) ,1000); // Doing requests too quickly fucks shit up
          // $scope.loginDisabled = false;
          $mdDialog.hide('succesful login');
        }, function errorCallback(error) {
          console.log(error);
          $scope.loginDisabled = false;
          $scope.isLoading = false;
          // Display warning rather than closing the dialog
          // $mdDialog.cancel('Failed logging in');
        });
      }

      function getPlayerInventory(trainerObj) {
        $http({
          method: 'GET',
          url: 'http://localhost:3000/api/trainer/inventory?username='+(trainerObj.username).toString()
        }).then(function successCallback(response) {
          console.log('Updating inventory successful');
          console.log(response);
          setTimeout(getPlayerProfile(trainerObj), 1000); // Don't spam the PoGo servers
        }, function errorCallback(error) {
          console.log(error);
          if (error.status == 400) {
            console.log('Retrying')
            setTimeout(getPlayerInventory(trainerObj), 2000);
          } else {
            $scope.loginDisabled = false;
            $scope.isLoading = false;
            // Login was successsful.
            // No need to keep the login dialog open when an error occurs over here
            $mdDialog.cancel('Failed updating profile');
          }
        });
      }

      function cancelLogin() {
        $mdDialog.hide('Login cancelled');
      }

      function getPlayerProfile(trainerObj) {
        $http({
          method: 'GET',
          url: 'http://localhost:3000/api/trainer/profile?username='+(trainerObj.username).toString()
        }).then(function successCallback(response) {
          console.log('Updating profile successful');
          console.log(response);
          $scope.loginDisabled = false;
          $scope.isLoading = false;
          $mdDialog.hide('Updating profile successful')
        }, function errorCallback(error) {
          console.log(error);
          if (error.status == 400) {
            console.log('Retrying');
            setTimeout(getPlayerProfile(trainerObj), 2000);
          } else {
            $scope.loginDisabled = false;
            $scope.isLoading = false;
            // Login was successsful.
            // No need to keep the login dialog open when an error occurs over here
            $mdDialog.cancel('Failed updating profile');
          }
        });
      }

    }
  ]);
