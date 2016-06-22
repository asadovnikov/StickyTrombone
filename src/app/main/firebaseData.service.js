
// a simple wrapper on Firebase and AngularFire to simplify deps and keep things DRY
angular.module('firebaseService', ['firebase'])
  .factory('firebaseService', ['$window', '$q', function($window, $q) {
    "use strict";
    var ref = firebase.database().ref();
    var service = {
      root: ref,
      posts: ref.child('posts'),
      users: ref.child('users')
    };

    return service;
  }]);
