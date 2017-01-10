angular.module('pogobot').controller('MapCtrl',
function($scope, $rootScope, $mdSidenav, $http, NgMap, Api) {
  // Variables
  var map;
  var EXTERNAL_SCANNER = false;

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

  function getDirections(originLat, originLng, destLat, destLng) {
    $http({
      method: 'GET',
      url: Api.url.path+'?originlat=52.360102&originlng=4.786153&destlat=52.350992&destlng=4.77924'
    }).then(function successCallback(response) {
      // var directionsObject = google.maps.DirectionsRenderer;
      // console.log(directionsObject)
      $scope.directions = JSON.parse(response.data);
      // console.log($scope.directions);
    });
  }

  function getMap() {
    NgMap.getMap('map').then(function(map) {
      this.map = map;
      // TODO Create a service for characters and center the map based on character's location rather than setting the char's location based on map's center.
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
      url: Api.url.pokedex
    }).then(function successCallback(response) {
      $scope.pokedex = response.data;
      createIcons();
    }, function errorCallback(response) {
      console.warn('An error occured');
      console.log(response);
    });
  }

  /**
  * Fetch data from static scanner file and save into scope
  */
  function getNearbyPokemon() {
    $http({
      method: 'GET',
      url: Api.url.scanner
    }).then(function successCallback(response) {
      $scope.pokemon = response.data;
    }, function errorCallback(response) {
      console.warn('An error occured');
      console.log(response);
    });
  }

  /**
  * Fetch data from scanner API and save into scope
  */
  function getNearbyData() {
    if (EXTERNAL_SCANNER) {
      $http({
        method: 'GET',
        url: Api.url.scannerExt
      }).then(function successCallback(response) {
        console.log(JSON.parse(response.data))
        $scope.pokemon = JSON.parse(response.data).pokemons;
        $scope.pokestops = JSON.parse(response.data).pokestops;
        $scope.gyms = JSON.parse(response.data).gyms;
      }, function errorCallback(response) {
        console.warn('An error occured');
        console.log(response);
      });
    } else {
      getNearbyPokemon();
    }
  }

  // Start
  getPokedex();
  getNearbyData();
  getDirections();
  getMap();
});
