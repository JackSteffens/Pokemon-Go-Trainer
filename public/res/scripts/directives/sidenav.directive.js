angular.module('pogobot').directive('sidenav', [function() {
  return {
    restrict: 'EA',
    controller: 'SidenavCtrl',
    templateUrl: 'res/views/directives/sidenav.html'
  };
}]);
