(function() {
  'use strict';

  angular
      .module('stickyTrombone')
      .service('webDevTec', webDevTec);

  /** @ngInject */
  function webDevTec($http) {
    var dataObj;

    this.getTec = getTec;

    var config = {
      params: {
        'rows': 100,
        'fname': '{firstName}',
        'lname': '{lastName}',
        'description': '{lorem|30}',
        'likes' : '{number|100}',
        'callback': "JSON_CALLBACK",
        'id': '{index}'
      }
    };

    $http.jsonp("http://www.filltext.com", config, {}).
    success(function (data) {

      dataObj = data;
    });

    function getTec() {
      return dataObj;
    }
  }

})();
