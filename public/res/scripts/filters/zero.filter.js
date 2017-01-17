angular.module('pogobot').filter('zero', function () {
    return function(a,b){
        return(1e6+""+a).slice(-b);
    };
});
