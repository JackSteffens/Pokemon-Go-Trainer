angular.module('pogobot').directive('sidenav', [function() {
  return {
    restrict: 'EA',
    controller: 'SidenavCtrl',
    templateUrl: 'res/views/sidenav.html'
  };
}]);
