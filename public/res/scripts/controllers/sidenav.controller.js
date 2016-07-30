angular.module('pogobot')
.controller('SidenavCtrl', [
  '$scope', '$mdSidenav',
function($scope, $mdSidenav) {
  $scope.closeSidenav = function() {
    $mdSidenav('left').close();
  };

  $scope.names = ['Hypnoised', 'Account2', 'Account3'];
  $scope.pages = ["map", "accounts", "settings"];
  $scope.routes = ["map", "accounts", "settings"];
  $scope.icons = ["home", "people", "settings"];
}]);
