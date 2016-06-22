
// a simple wrapper on Firebase and AngularFire to simplify deps and keep things DRY
angular.module('postsService', ['firebaseService'])
  .factory('postsService', ['$window', 'firebaseService', function($window, firebaseService) {
    "use strict";
    var ref = firebase.database().ref();
    var service = {
      root: ref,
      storage: firebase.storage().ref(),
      imageStorage: firebase.storage().ref().child("images"),
      projects: ref.child('projects'),
      posts: ref.child('posts').orderByChild("state").startAt("unprocessed").endAt("unprocessed"),
      doNotDoPosts : ref.child('posts').orderByChild("state").startAt("do-not-do").endAt("do-not-do"),
      doPosts : ref.child('posts').orderByChild("state").startAt("do").endAt("do"),
      doLaterPosts : ref.child('posts').orderByChild("state").startAt("do-later").endAt("do-later"),
      users: ref.child('users'),
      getPosts: function(projectId){
        return ref.child('projects/'+ projectId + '/posts').orderByChild("state").startAt("unprocessed").endAt("unprocessed");
      },
      getDoNotDoPosts: function(projectId){
        return ref.child('projects/'+ projectId + '/posts').orderByChild("state").startAt("do-not-do").endAt("do-not-do");
      },
      getDoPosts : function(projectId){
        return ref.child('projects/'+ projectId + '/posts').orderByChild("state").startAt("do").endAt("do");
      },
      getDoLaterPosts: function(projectId){
        return ref.child('projects/'+ projectId + '/posts').orderByChild("state").startAt("do-later").endAt("do-later");
      },
      getPost: function(projectId, postId){
        return ref.child('projects/'+ projectId + '/posts/' + postId);
      },
      getComments: function(projectId, postId){
        return ref.child('projects/'+ projectId + '/posts/' + postId + '/comments');
      },
      getUserPosts : function(projectId, userId){
        return ref.child('projects/'+ projectId + '/posts').orderByChild("user_id").startAt(userId).endAt(userId);
      },
      getUserObj : function(userId){
        return ref.child('users').orderByChild("uid").startAt(userId).endAt(userId);
      },
      getUser :function(id){
        return ref.child('users/' + id);
      }
    };

    return service;
  }]);
