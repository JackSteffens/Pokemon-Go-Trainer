angular.module('pogobot').controller('CharacterCtrl', [
  '$scope', '$rootScope', '$stateParams', '$http',
function($scope, $rootScope, $stateParams, $http) {
  $scope.user = $stateParams.user;
  $rootScope.currentUI = 'character';

  $http({
    method: 'GET',
    url: '/api/pokedex'
  }).then(function successCallback(response) {
    $scope.pokedex = response.data;
  }, function errorCallback(response) {
    console.warn('An error occured');
    console.log(response);
  });

}]);
