(function() {
  'use strict';

  angular
    .module('stickyTrombone', ['ngAnimate'
      , 'ngCookies'
      , 'ngSanitize'
      , 'ngMessages'
      , 'ngAria'
      , 'ngResource'
      , 'ngRoute'
      , 'ngMaterial'
      , 'toastr'
      , 'cfp.hotkeys'
      , 'angularMoment'
      , 'firebase'
      , 'firebaseService'
      , 'postsService'
      , 'stickyTrombone.config'
      , 'stickyTrombone.security']).directive('ngEnter', function() {
    return function(scope, element, attrs) {
      element.bind("keydown keypress", function(event) {
        if(event.which === 13) {
          scope.$apply(function(){
            scope[attrs.ngEnter] = element.val();
          });

          event.preventDefault();
        }
      });
    };
  });
})();
