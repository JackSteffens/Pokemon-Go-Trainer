angular.module('pogobot')
.controller('MapCtrl', [
  '$scope', '$rootScope', '$mdSidenav', '$http', 'NgMap',
function($scope, $rootScope, $mdSidenav, $http, NgMap) {
  // Variables
  var map;

  // Scope variables
  $rootScope.currentUI = 'map';
  $scope.iconSize = {
    x : 80,
    y : 60
  };
  $scope.markerEnabled = {
    pokemon : true,
    pokestop : true,
    gym : true
  }
  $scope.directions = [];
  $scope.character = {};
  $scope.pokemon = {};
  $scope.markerIcons = {};
  $scope.characterIcon = {
    url : '/res/images/character_icon.png',
    scaledSize: [$scope.iconSize.x, $scope.iconSize.y],
    origin: [0,0],
    anchor: [$scope.iconSize.x/2, $scope.iconSize.y]
  };
  $scope.pokemonDetails = {};

  // Scope functions
  $scope.displayPokemonInfo = displayPokemonInfo;
  $scope.getDirections = getDirections;
  $scope.getNearbyData = getNearbyData;

  // Functions
  function displayPokemonInfo(event, poke) {
    $scope.pokemonDetails = poke;
    // console.log($scope.pokemonDetails);
    this.map.showInfoWindow('info-window-pokemon', this);
  }

  function getDirections(oLat, oLng, dLat, dLng) {
    $http({
      method: 'GET',
      url: 'http://localhost:3000/api/map/path?originlat=52.360102&originlng=4.786153&destlat=52.350992&destlng=4.77924'
    }).then(function successCallback(response) {
      // var directionsObject = google.maps.DirectionsRenderer;
      // console.log(directionsObject)
      $scope.directions = JSON.parse(response.data);
      // console.log($scope.directions);
    });
  }

  function getMap() {
    NgMap.getMap('map').then(function(map) {
      console.log(map);
      this.map = map;
      $scope.character.lat = map.center.lat();
      $scope.character.lng = map.center.lng();
    });
  }

  function createIcons() {
    for (index in $scope.pokedex.pokemon) {
      var pokemon = $scope.pokedex.pokemon[index]
      $scope.markerIcons[pokemon.id] = {
        url: '/res/images/pokemons_icon/'+(parseInt(index)+1)+'.png', // +1 because of ID's and array start[0]
        scaledSize: [$scope.iconSize.x, $scope.iconSize.y],
        origin: [0,0],
        anchor: [$scope.iconSize.x/2, $scope.iconSize.x]
      };
    }
  }

  function getPokedex() {
    $http({
      method: 'GET',
      url: '/api/pokedex'
    }).then(function successCallback(response) {
      $scope.pokedex = response.data;
      createIcons();
    }, function errorCallback(response) {
      console.warn('An error occured');
      console.log(response);
    });
  }

  function getNearbyPokemon() {
    $http({
      method: 'GET',
      url: '/api/nearby/pokemon'
    }).then(function successCallback(response) {
      $scope.pokemon = response.data;
    }, function errorCallback(response) {
      console.warn('An error occured');
      console.log(response);
    });
  }

  function getNearbyData() {
    $http({
      method: 'GET',
      url: '/api/nearby/pokemon/ext'
    }).then(function successCallback(response) {
      console.log(JSON.parse(response.data))
      $scope.pokemon = JSON.parse(response.data).pokemons;
      $scope.pokestops = JSON.parse(response.data).pokestops;
      $scope.gyms = JSON.parse(response.data).gyms;
    }, function errorCallback(response) {
      console.warn('An error occured');
      console.log(response);
    });
  }

  // Start
  getPokedex();
  // getNearbyPokemon();
  getNearbyData();
  getDirections();
  getMap();
}]);
