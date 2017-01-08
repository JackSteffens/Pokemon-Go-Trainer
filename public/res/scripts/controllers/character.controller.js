angular.module('pogobot').controller('CharacterCtrl',
function($scope, $rootScope, $stateParams, $http, Api) {
  $scope.user = $stateParams.user;
  $rootScope.currentUI = 'character';

  $http({
    method: 'GET',
    url: Api.url.pokedex
  }).then(function successCallback(response) {
    $scope.pokedex = response.data;
  }, function errorCallback(response) {
    console.warn('An error occured');
    console.log(response);
  });
});
