angular.module('pogobot').controller('MenuButtonCtrl', [
  '$scope', '$mdSidenav',
function($scope, $mdSidenav) {

  // Variables
  $scope.icon = "menu";

  // Functions
  $scope.toggleSidenav = toggleSidenav;

  $mdSidenav('left', true).then(function(instance) {
      $scope.$watch(
        instance.isOpen,
        function(newValue, oldValue) {
          if (!instance.isOpen()) {
              $scope.isOpen = false;
              $scope.icon = "menu";
          }
        }, true);
  });

  function toggleSidenav() {
    $mdSidenav('left').toggle();

    if ($mdSidenav('left').isOpen()) {
        $scope.isOpen = true;
        $scope.icon = "close";
    } else {
        $scope.isOpen = true;
        $scope.icon = "close";
    }
  }

}
]);
