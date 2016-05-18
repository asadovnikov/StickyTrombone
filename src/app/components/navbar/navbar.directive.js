(function() {
  'use strict';

  angular
    .module('stickyTrombone')
    .directive('acmeNavbar', acmeNavbar);

  /** @ngInject */
  function acmeNavbar() {
    var directive = {
      restrict: 'E',
      templateUrl: 'app/components/navbar/navbar.html',
      scope: {
          creationDate: '=',
          parentModel: '='
      },
      controller: NavbarController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    /** @ngInject */
    function NavbarController(moment) {
      var vm = this;

      // "vm.creationDate" is available by directive option "bindToController: true"
      vm.relativeDate = moment(vm.creationDate).fromNow();

      vm.showDoLaterItems = function(){
        vm.parentModel.refresh(vm.parentModel.doLaterItems, 'doLater');
      };
      vm.showDoItems = function(){
        vm.parentModel.refresh(vm.parentModel.toDoItems, 'do');
      };
      vm.showDoNotDoItems = function(){
        vm.parentModel.refresh(vm.parentModel.doNotDoItems, 'doNotDo');
      };
    }
  }

})();
