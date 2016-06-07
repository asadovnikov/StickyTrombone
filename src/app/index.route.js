(function() {
  'use strict';

  angular
    .module('stickyTrombone')
    .config(routeConfig);

  function routeConfig($routeProvider) {
    $routeProvider
      .when('/posts', {
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main',
        resolve: {
          // forces the page to wait for this promise to resolve before controller is loaded
          // the controller can then inject `user` as a dependency. This could also be done
          // in the controller, but this makes things cleaner (controller doesn't need to worry
          // about auth status or timing of accessing data or displaying elements)
          user: ['Auth', function (Auth) {
            return Auth.$waitForSignIn();
          }]
        }
      })
      .when('/auth', {
        templateUrl: 'app/login.html',
        controller: 'AuthController',
        controllerAs: 'auth'
      })
      .otherwise({
        redirectTo: '/auth'
      });
  }

})();
