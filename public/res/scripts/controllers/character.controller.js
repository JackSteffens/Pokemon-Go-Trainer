angular.module('pogobot').controller('CharacterCtrl',
  function($scope, $rootScope, $filter, $timeout, $mdDialog, $stateParams, $http, Api) {
  $rootScope.currentUI = $stateParams.username;
  $scope.username = $stateParams.username;
  $scope.inventory = undefined;
  $scope.pokedex = undefined;
  $scope.pokemonTeam = [];
  $scope.trainer = undefined;
  $scope.tabIndex = 0;
  $scope.tabPokemon = false;
  $scope.isLoading = false;
  $scope.pokemonStats = {
    cp : "CP",
    nickname : "Nickname",
    favorite : "Favorite",
    battles_defended : "Gyms defended",
    battles_attacked : "Gyms attacked",
    pokeball : "Pokeball",
    weight_kg : "Weight",
    height_m : "Height",
    stamina : "Current HP",
    stamina_max: "Max HP",
    num: "Pokédex #",
    name : "Name",
    id : "ID",
    cp_multiplier : "CP Multiplier",
    additional_cp_multiplier: "CP Multiplier 2"
  }
  $scope.query = {
    order : undefined,
    label : 'Order by',
    ordertoggle : false,
    page : 0,
    limit_options : [5,10,50,$scope.pokemonTeam.length],
    limit : 5,
    search : {
      text : '',
      selected : undefined
    },
    name : '',
  }
  var BUFFER_TIME = 1000;


  // Scope functions
  $scope.setOrder = setOrder;
  $scope.querySearch = querySearch;
  $scope.openPokemonDialog = openPokemonDialog;

  function init() {
    if (!$stateParams.username) {
      // goto character screen and pick again
      return;
    }

    $scope.$watch('tabIndex', function(index) {
      if (index == 0 && !$scope.inventory) {
        getInventory();
      } else if (index == 1 && (!$scope.pokemonTeam || $scope.pokemonTeam.length == 0)) {
        getPokemon();
      } else if (index == 2 && !$scope.pokedex) {
        getPokedex();
      } else if (index == 3 && !$scope.trainer) {
        getTrainer()
      } else if (index == 4 && !$scope.badges) {
        getBadges()
      }

      if (index == 1) {
        $scope.isLoading = true;
        $timeout(function() {
          $scope.isLoading = false;
          $scope.tabPokemon = true;
        }, BUFFER_TIME);
      } else {
        $scope.tabPokemon = false;
      }
    },true);
  }

  function setOrder(key, label) {
    $scope.query.order = key;
    $scope.query.label = label;
  }

  function openPokemonDialog(ev, pokemon) {
    $mdDialog.show({
      controller: 'PokemonDialogCtrl',
      templateUrl: './res/views/dialogs/pokemon.dialog.html',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose:true,
      resolve: {
        pokemonData : function() {
          return pokemon;
        }
      }
    });
  }

  function querySearch(name) {
    var result = name ?
      $filter('filter')($scope.pokemonTeam, {name:name}) :
      $scope.pokemonTeam;
      result = $filter('unique')(result,'name');
      return result;
  }

  function getTrainer() {
    $scope.isLoading = true;
    $timeout( function () {
      $http({
        method: 'GET',
        url: Api.url.trainer+'?username='+$scope.username
      }).then(function successCallback(response) {
        $scope.isLoading = false;
        $scope.trainer = response.data;
      }, function errorCallback(response) {
        $scope.isLoading = false;
      });
    },BUFFER_TIME);
  }

  function getBadges() {
    $scope.isLoading = true;
    $timeout( function () {
      $http({
        method: 'GET',
        url: Api.url.profile+'?username='+$scope.username
      }).then(function successCallback(response) {
        $scope.badges = response.data;
          $scope.isLoading = false;
      }, function errorCallback(response) {
        $scope.isLoading = false;
      });
    },BUFFER_TIME);
  }

  function getPokedex() {
    $scope.isLoading = true;
    $timeout( function () {
      $http({
        method: 'GET',
        url: Api.url.trainerPokedex+'?username='+$scope.username
      }).then(function successCallback(response) {
        $scope.pokedex = response.data;
          $scope.isLoading = false;
      }, function errorCallback(response) {
        $scope.isLoading = false;
      });
    },BUFFER_TIME);
  }

  function getPokemon() {
    $scope.isLoading = true;
    $timeout( function () {
      $http({
        method: 'GET',
        url: Api.url.pokemonTeam+'?username='+$scope.username
      }).then(function successCallback(response) {
        var team = $filter('filter')(response.data.pokemons, {is_egg:false},true);
        for (var i = 0; i < team.length; i++) {
          team[i].name = $filter('PokemonFilter')(team[i].pokemon_id, 'name', true);
          team[i].num = $filter('PokemonFilter')(team[i].pokemon_id, 'num', true);
        }
        $scope.pokemonTeam = team;
        $scope.isLoading = false;
      }, function errorCallback(response) {
        $scope.isLoading = false;
      });
    },BUFFER_TIME);
  }

  function getInventory() {
    $scope.isLoading = true;
    $timeout( function () {
      $http({
        method: 'GET',
        url: Api.url.inventory+'?username='+$scope.username
      }).then(function successCallback(response) {
        $scope.inventory = response.data;
        $scope.isLoading = false;
      }, function errorCallback(response) {
        $scope.isLoading = false;
      });
    },BUFFER_TIME);
  }

  init();
});
