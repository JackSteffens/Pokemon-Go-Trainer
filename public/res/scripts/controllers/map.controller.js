angular.module('pogobot').controller('MapCtrl',
function($scope, $filter, $rootScope, $mdSidenav, $timeout, $http, NgMap, Api, TrainerService, Socket) {
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
  $scope.currentTrainer = TrainerService.getCurrentTrainer();
  $scope.trainers = TrainerService.getTrainers();
  $scope.pokemon = {};
  $scope.markerIcons = {};
  $scope.characterIcon = {
    url : '/res/images/character_icon.png',
    scaledSize: [$scope.iconSize.x, $scope.iconSize.y],
    origin: [0,0],
    anchor: [$scope.iconSize.x/2, $scope.iconSize.y]
  };
  $scope.pokemonDetails = {};
  $scope.path = {};
  $scope.pathLoading = false;
  $scope.polylineOptions = {
    current : {
      strokeColor : "green",
      onClick : polyLineClick()
    },
    suggested : {
      strokeColor : "grey",
      onClick : polyLineClick()
    }
  }

  // Scope functions
  $scope.displayPokemonInfo = displayPokemonInfo;
  $scope.displayTrainerInfo = displayTrainerInfo;
  $scope.getDirections = getDirections;
  $scope.getNearbyData = getNearbyData;
  $scope.getDirectionsToPokemon = getDirectionsToPokemon;
  $scope.polyLineClick = polyLineClick;
  $scope.setDirectionsToPokemon = setDirectionsToPokemon;

  function polyLineClick(event) {
    console.log(event);
  }

  // Functions
  function init() {
    getPokedex();
    getNearbyData();
    getMap();

    // Set websocket channels
    for (var i = 0; i < $scope.trainers.length; i++) {
      Socket.subscribe('location/'+$scope.trainers[i].username, function(trainerObj) {
        var trainer = $filter('filter')($scope.trainers, {username:trainerObj.username}, true)[0];
        var index = $scope.trainers.indexOf(trainer);
        $scope.trainers[index].location = trainerObj.location;
        $scope.$apply();
      });
    }

    // Set watcher with a delay. Wait for map to be initialized
    $timeout(function() {
      initWatchers();
    },2000);
  }

  function getDirectionsToPokemon(pokemon) {
    if ($scope.currentTrainer && pokemon) {
      getDirections(
        $scope.currentTrainer.location.latitude,
        $scope.currentTrainer.location.longitude,
        pokemon.lat,
        pokemon.lng
      );
    }
  }

  function setDirectionsToPokemon(pokemon) {
    if ($scope.currentTrainer && pokemon) {
      setDirections(pokemon.lat, pokemon.lng);
    }
  }

  function setDirections(destLat, destLng) {
    $scope.currentTrainer.destination = undefined;
    $scope.pathLoading = true;
    if ($scope.currentTrainer) {
      $http({
        method: 'POST',
        url: Api.url.destination+'?username='+$scope.currentTrainer.username+'&latitude='+destLat+'&longitude='+destLng
      }).then(function successCallback(response) {
        $scope.path = undefined;
        console.log(response.data);
        $timeout(function() {
          $scope.currentTrainer.destination = response.data;
          $scope.pathLoading = false;
        },750);
      }, function errorCallback() {
        $scope.pathLoading = false;
      });
    }
  }

  function initWatchers() {
    // Watch on current selected trainer
    $scope.$watch(function() {
      return TrainerService.getCurrentTrainer();
    }, function(trainer) {
      $scope.currentTrainer = trainer;
      if (trainer && trainer.location && trainer.location.latitude && trainer.location.longitude && this.map) {
        this.map.setCenter({lat: trainer.location.latitude, lng: trainer.location.longitude});
        $scope.path = undefined;
      }
    }, true);

    // Watch on all trainers
    $scope.$watch(function() {
      return TrainerService.getTrainers();
    }, function(trainers) {
      $scope.trainers = trainers;
      // Focus on curent character coordinates
    }, true);
  }

  function displayPokemonInfo(event, poke) {
    getDirectionsToPokemon(poke);
    $scope.pokemonDetails = poke;
    // console.log($scope.pokemonDetails);
    this.map.showInfoWindow('info-window-pokemon', this);
  }

  function displayTrainerInfo(event, trainer) {
    selectCurrentTrainer(trainer)
    $scope.trainerDetails = trainer;
    this.map.showInfoWindow('info-window-trainer', this);
  }

  function selectCurrentTrainer(trainer) {
    TrainerService.setTrainer(trainer.username);
  }

  function getDirections(originLat, originLng, destLat, destLng) {
    // Clear existing path
    $scope.path = undefined;
    $http({
      method: 'GET',
      url: Api.url.path+'?originlat='+originLat+'&originlng='+originLng+'&destlat='+destLat+'&destlng='+destLng
    }).then(function successCallback(response) {
      var directions = JSON.parse(response.data);

      var waypoints = [];
      var steps = directions.routes[0].legs[0].steps

      for (var i = 0; i < steps.length; i++) {
        var waypoint = {
          location : new google.maps.LatLng({
            lat:steps[i].end_location.lat,
            lng:steps[i].end_location.lng
          }),
          stopover : false
        }
        waypoints.push(waypoint);
      }

      $scope.path = {
        origin: new google.maps.LatLng({
          lat:directions.routes[0].legs[0].start_location.lat,
          lng:directions.routes[0].legs[0].start_location.lng
        }),
        destination: new google.maps.LatLng({
          lat:directions.routes[0].legs[0].end_location.lat,
          lng:directions.routes[0].legs[0].end_location.lng
        }),
        waypoints: waypoints
      };
    });
  }

  function getMap() {
    NgMap.getMap('map').then(function(map) {
      this.map = map;
      // If we don't have a trainer selected yet, just center aroud the first
      // trainer that's available in the trainer list. Else, wait for watcher.
      if (!TrainerService.getCurrentTrainer)
        if ($scope.trainers[0])
          this.map.setCenter({lat: $scope.trainers[0].location.latitude, lng: $scope.trainers[0].location.longitude});
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
  init();
});
