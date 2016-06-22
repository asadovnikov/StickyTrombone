(function() {

  'use strict';

  angular
    .module('stickyTrombone')
    .controller('AuthController', AuthController);

  function AuthController($scope, $firebaseAuth, $rootScope, $location, $firebaseArray, postsService) {

    var vm = this;

    //vm.createUser = createUser;
    //vm.login = login;

    var auth = $firebaseAuth();

    auth.$signInWithPopup('google').then(function(authData) {
      postsService.getUserObj(authData.user.uid).once('value', function(response){
        var user = response.val();
        if(!user)
        {
          $firebaseArray(postsService.users).$add({
            'uid' :authData.user.uid,
            'displayName' : authData.user.displayName,
            'photoURL' : authData.user.photoURL,
            'email' : authData.user.email,
            'read' : true,
            'edit' : false,
            'comment' : false,
            'rating' : 1,
            'created-posts' : 0,
            'do-later' : 0,
            'do' : 0,
            'do-not-do' : 0
          });
        }
      });

      $scope.authData = authData;
      $rootScope.authData = authData;
      $location.path('/posts');
      console.log("Logged in as:", authData);
    }).catch(function(error) {
      $scope.error = error;
      console.log("Authentication failed:", error);
    });

    $scope.login = function() {
      $scope.authData = null;
      $scope.error = null;

      auth.$signInAnonymously().then(function(authData) {
        $scope.authData = authData;
      }).catch(function(error) {
        $scope.error = error;
      });
    };

    // login with Facebook
    //auth.$authWithOAuthPopup("facebook").then(function(authData) {
    //  console.log("Logged in as:", authData.uid);
    //}).catch(function(error) {
    //  console.log("Authentication failed:", error);
    //});

    //function createUser() {
    //
    //  // If there is already a user logged in,
    //  // log them out before proceeding
    //  Auth.$unauth();
    //
    //  Auth.$createUser({
    //    email: vm.email,
    //    password: vm.password
    //  }).then(function(userData) {
    //    saveUser(userData);
    //    login()
    //  }).catch(function(error) {
    //    vm.error = error;
    //  });
    //}
    //
    //function saveUser(userData) {
    //
    //  var user = User.newUserRef(userData);
    //  user.username = vm.username;
    //  user.email = vm.email;
    //
    //  user.$save().then(function(success) {
    //    vm.username = null;
    //    vm.email = null;
    //    vm.password = null;
    //
    //    $state.go('status');
    //  }, function(error) {
    //    console.log("there was an error! " + error);
    //  });
    //}
    //
    //function login() {
    //
    //  Auth.$authWithPassword({
    //
    //    email: vm.email,
    //    password: vm.password
    //  }).then(function(data) {
    //    vm.email = null;
    //    vm.password = null;
    //    $state.go('status');
    //  }).catch(function(error) {
    //    console.log(error);
    //  });
    //}
  }

})();
