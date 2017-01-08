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
    profile     : this.baseUrl + "/trainer/profile",
    pokedex     : this.baseUrl + "/pokedex",
    map         : this.baseUrl + "/map",
    path        : this.baseUrl + "/map/path",
    scanner     : this.baseUrl + "/map/scanner",
    scannerExt  : this.baseUrl + "/map/scanner/ext",
  }
});
