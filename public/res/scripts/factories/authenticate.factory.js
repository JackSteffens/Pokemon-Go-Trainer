angular.module('pogobot').factory('Authenticate',
  function($http, TrainerService, Api, $filter, $rootScope) {
    function login(authObj, callback) {
      $http({
        method: 'POST',
        url: Api.url.login,
        data: authObj
      }).then(function successCallback(response) {
        fetchTrainers();
        var trainer = response.data
        $rootScope.$broadcast(
          'login/'+authObj.username, {
          authenticated: true
        });
        return callback(null, trainer);
      }, function errorCallback(response) {
      $rootScope.$broadcast(
        'login/'+authObj.username, {
        authenticated: false
      });
        return callback(response)
      });
    }

    function logout(username) {
      $http({
        method: 'POST',
        url: Api.url.logout + '?username=' + username
      }).then(function successCallback(response) {
        fetchTrainers();
        return callback(null, response.data);
      }, function errorCallback(response) {
        console.log("Could not log out user : "+username);
        return callback(response);
      });
    }

    function fetchTrainers() {
      $http({
        method: 'GET',
        url: Api.url.trainer
      }).then(function successCallback(response) {
        TrainerService.trainers = response.data;
        TrainerService.onlineTrainers = $filter('filter')(response.data, {login:{accessToken:''}})
      }, function errorCallback(response) {
        console.log('An error occured');
        console.log(response);
      });
    }

    return {
      login : login,
      logout : logout,
      fetchTrainers : fetchTrainers
    }
});
