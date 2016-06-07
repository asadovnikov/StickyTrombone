(function() {
  'use strict';

  angular
    .module('stickyTrombone')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log, $rootScope, $location, Auth, $firebaseAuth) {

    $log.debug('runBlock end');

    Auth.$onAuthStateChanged(function(user) {
      $rootScope.loggedIn = !!user;
      $rootScope.currentUserAuthData = user;
      //$location.path("/posts");
    });

    $rootScope.$on("$routeChangeError", function(event, next, previous, error) {
      // We can catch the error thrown when the $requireAuth promise is rejected
      // and redirect the user back to the home page
      if (error === "AUTH_REQUIRED") {
        $location.path("/auth");
      }
    });

    $rootScope.$on('$routeChangeStart', function (event, toState, toParams) {
      //event.preventDefault();
      //if (typeof $rootScope.logedInUser === 'undefined') {
      //  var auth = $firebaseAuth();
      //  auth.$signInWithPopup('google').then(function(authData) {
      //    $rootScope.logedInUser = authData;
      //    $rootScope.authData = authData;
      //    $location.path('/posts');
      //    console.log("Logged in as:", authData);
      //  }).catch(function(error) {
      //    $scope.error = error;
      //    console.log("Authentication failed:", error);
      //  });
      //  event.preventDefault();
        console.log('==========');
        console.log(toState);
        console.log(toParams);
        console.log('==========');
        // get me a login modal!
      //}
    });
  }

})();
