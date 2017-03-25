var module = angular.module('pogobot', [
  'ngMaterial',
  'ngMessages',
  'ui.router',
  'oc.lazyLoad',
  'nvd3',
  'ngMap'
]);

module.config(function($stateProvider, $urlRouterProvider, $mdThemingProvider) {
  // Picking default pallets for gym teams
  $mdThemingProvider.theme('mystic')
    .primaryPalette('indigo')
    .accentPalette('light-blue');

  $mdThemingProvider.theme('valor')
    .primaryPalette('red')
    .accentPalette('orange');

  $mdThemingProvider.theme('instinct')
    .primaryPalette('amber')
    .accentPalette('cyan');

  // Extending default pallets for backgrounds
  var mysticBackground = $mdThemingProvider.extendPalette('indigo', {
    'A100': '#3F51B5',
    '800' : '#C5CAE9',
    'contrastDefaultColor': 'light',
    'contrastDarkColors': undefined,
    'contrastLightColors': ['50', '100','200', '300', '400', 'A100']
  });
  var valorBackground = $mdThemingProvider.extendPalette('red', {
    'A100': '#F44336',
    '800' : '#FFCDD2',
    'contrastDefaultColor': 'light'
  });
  var instinctBackground = $mdThemingProvider.extendPalette('amber', {
    'A100': '#FFC107',
    '800' : '#FFCDD2',
    'contrastDefaultColor': 'dark'
  });

 // Registering themes
 $mdThemingProvider.definePalette('mysticBackground', mysticBackground);
 $mdThemingProvider.definePalette('valorBackground', valorBackground);
 $mdThemingProvider.definePalette('instinctBackground', instinctBackground);

  // Color themes : backgrounds
  $mdThemingProvider.theme('mysticBackground')
    .backgroundPalette('mysticBackground');
  $mdThemingProvider.theme('valorBackground')
    .backgroundPalette('valorBackground');
  $mdThemingProvider.theme('instinctBackground')
    .backgroundPalette('instinctBackground');

  // Routing
  $urlRouterProvider.otherwise('/map');
  $stateProvider
    .state('map', {
      url: '/map',
      templateUrl: './res/views/map.html',
      controller: 'MapCtrl',
      resolve: {
        loadMyFiles: function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [
              './res/scripts/controllers/map.controller.js'
            ]
          });
        }
      }
    })
    .state('accounts', {
      url: '/accounts',
      templateUrl: './res/views/accounts.html',
      controller: 'AccountsCtrl',
      resolve: {
        loadMyFiles: function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [
              // Controllers
              './res/scripts/controllers/accounts.controller.js',
              './res/scripts/controllers/login.controller.js',
              './res/scripts/controllers/threewrapper.controller.js',
              // Directives
              './res/scripts/directives/threewrapper.directive.js'
            ]
          });
        }
      }
    })
    .state('settings', {
      url: '/settings',
      templateUrl: './res/views/settings.html',
      controller: 'SettingsCtrl',
      resolve: {
        loadMyFiles: function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [
              './res/scripts/controllers/settings.controller.js'
            ]
          });
        }
      }
    })
    .state('character', {
      url: '/character?username',
      templateUrl: './res/views/character.html',
      controller: 'CharacterCtrl',
      resolve: {
        loadMyFiles: function($ocLazyLoad) {
          return $ocLazyLoad.load({
            files: [
              './res/scripts/controllers/character.controller.js',
              './res/scripts/controllers/pokemon.dialog.controller.js'
            ]
          })
        }
      }
    })
}).run(function(Authenticate, Socket) {
  Authenticate.fetchTrainers();
  Socket.init();
});
