angular.module('pogobot').directive('menubutton', [function() {
  return {
    restrict: 'EA',
    controller: 'MenuButtonCtrl',
    templateUrl: 'res/views/directives/menubutton.html'
  };
}]);
