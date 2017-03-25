angular.module('pogobot').directive('threeWrapper', [function() {
    return {
      restrict: 'EA',
      controller: 'ThreeWrapperCtrl',
      templateUrl: 'res/views/directives/threewrapper.html',
      scope: {
        avatar:"@",
        elemId:"@"
      },
      link(scope, elements, attributes) {
        var wrapper = elements.children().first();
        wrapper.attr("id", 'model_wrapper_'+scope.elemId);
      }
    };
}]);
