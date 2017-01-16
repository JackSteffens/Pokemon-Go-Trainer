angular.module('pogobot').controller('PokemonDialogCtrl',
  function($scope, $http, Api, pokemonData) {
    $scope.pokemon = pokemonData;

    function init() {
      $http({
        method: 'GET',
        url: Api.url.convertS2 + "?s2=" + $scope.pokemon.captured_cell_id
      }).then(function successCallback(response) {
        var result = response.data;
        $scope.pokemon.lat = result.lat;
        $scope.pokemon.lng = result.lng;
      }, function errorCallback() {

      });
    }

    init();
});
