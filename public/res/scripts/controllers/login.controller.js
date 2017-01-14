angular.module('pogobot').controller('loginCtrl',
function($scope, $timeout, $rootScope, $mdDialog, $http, trainerObj, NgMap, Api, Authenticate, $mdToast) {
  $scope.trainerObj = trainerObj;

  if (trainerObj) {
    $scope.authObj = {
      username: $scope.trainerObj.login.username,
      password: "",
      provider: $scope.trainerObj.login.provider,
      latitude: parseFloat($scope.trainerObj.location.latitude),
      longitude: parseFloat($scope.trainerObj.location.longitude)
    }
  } else {
    $scope.authObj = {
      username: "",
      password: "",
      provider: "",
      latitude: parseFloat(52.359),
      longitude: parseFloat(4.7816)
    }
  }

  // Google Maps doesn't like redrawing itself. Force a redraw by faking a resize event.
  $timeout(
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
    $scope.$on('login/'+$scope.authObj.username, postLogin);
    Authenticate.login($scope.authObj, function(error, trainer) {
        console.log(trainer);
    })
  }

  function postLogin(event, args) {
    var authenticated = args.authenticated;
    if (authenticated) {
      $scope.isLoading = false;
      $mdDialog.hide('Successfully logged in');
      $mdToast.show(
        $mdToast.simple()
          .textContent('Successfully logged in!')
          .position("top right")
          .hideDelay(3000)
      );
    } else {
      $scope.isLoading = false;
      $scope.loginDisabled = false;
      $mdToast.show(
        $mdToast.simple()
          .textContent('Login failed!')
          .position("top right")
          .hideDelay(3000)
      );
    }
    // Remove listener
    $scope.$on('login/'+$scope.authObj.username, postLogin);
  }

  function getPlayerInventory(trainerObj) {
    $http({
      method: 'GET',
      url: Api.url.inventory + '?username='+(trainerObj.username).toString()
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
      url: Api.url.profile+'?username='+(trainerObj.username).toString()
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
});
