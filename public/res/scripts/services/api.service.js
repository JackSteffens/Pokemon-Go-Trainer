angular.module('pogobot').service('Api',
function() {
  this.baseUrl = window.location.href.substr(0,
      window.location.href.length - window.location.hash.length - 1) + "/api";

  this.url = {
    trainer     : this.baseUrl + "/trainer",
    login       : this.baseUrl + "/trainer/login",
    logout      : this.baseUrl + "/trainer/logout",
    inventory   : this.baseUrl + "/trainer/inventory",
    pokemonTeam : this.baseUrl + "/trainer/pokemon",
    trainerPokedex: this.baseUrl + "/trainer/pokedex",
    profile     : this.baseUrl + "/trainer/profile",
    availableTrainers: this.baseUrl + "/trainer/available",
    destination : this.baseUrl + "/trainer/destination",
    pokedex     : this.baseUrl + "/pokedex",
    map         : this.baseUrl + "/map",
    path        : this.baseUrl + "/map/path",
    convertS2   : this.baseUrl + "/map/convert",
    scanner     : this.baseUrl + "/map/scanner",
    scannerExt  : this.baseUrl + "/map/scanner/ext",
    walk        : this.baseUrl + "/task/walk",
    scan        : this.baseUrl + "/task/scan",
  }
});
