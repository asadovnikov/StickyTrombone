(function() {
  'use strict';

  angular
    .module('stickyTrombone')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
