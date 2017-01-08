angular.module('pogobot').controller('SidenavCtrl',
function($scope, $mdSidenav) {
  $scope.closeSidenav = function() {
    $mdSidenav('left').close();
  };

  $scope.names = ['Hypnoised', 'Account2', 'Account3'];
  // $scope.pages = ["map", "accounts", "settings"];
  // $scope.routes = ["map", "accounts", "settings"];
  // $scope.icons = ["home", "people", "settings"];
  $scope.selectedCharacterIndex = 0;

  $scope.routes = [
    {label:"map",        route:"map",        icon:"home",      auth:false},
    {label:"accounts",   route:"accounts",   icon:"people",    auth:false},
    {label:"settings",   route:"settings",   icon:"settings",  auth:false},
    {label:"Character Overview", route:"overview", icon:"folder_shared", auth:true}
  ];
});
