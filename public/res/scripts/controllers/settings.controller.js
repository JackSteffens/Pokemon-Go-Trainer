angular.module('pogobot')
.controller('SettingsCtrl', [
  '$scope', '$rootScope',
function($scope, $rootScope) {
  $rootScope.currentUI = 'settings';
}]);
