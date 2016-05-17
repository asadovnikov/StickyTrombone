(function() {
  'use strict';

  angular
    .module('stickyTrombone')
    .controller('MainController', MainController)
    .filter('getById', function() {
    return function(input, id) {
      var i=0, len=input.length;
      for (; i<len; i++) {
        if (+input[i].id == +id) {
          return input[i];
        }
      }
      return null;
    }
  });

  /** @ngInject */
  function MainController($timeout, $http, toastr, $filter, $scope) {
    var vm = this;

    vm.awesomeThings = [];
    vm.toDoItems = [];
    vm.doLaterItems = [];
    vm.doNotDoItems = [];
    vm.classAnimation = '';
    vm.creationDate = 1463047443957;
    vm.showToastr = showToastr;
    vm.addLike = addLike;
    vm.orderField = '-likes';
    vm.orderTypeText = 'по просмотрам';
    var originatorEv;
    var selectOrderItem;


    vm.openSelectProjectMenu = function($mdOpenMenu, ev){
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    vm.openOrderType = function($mdOpenMenu, ev){
      selectOrderItem = ev;
      $mdOpenMenu(ev);
    };

    vm.changeOrderType = function(value, ev){
      vm.orderField = value;
      vm.orderTypeText = ev.currentTarget.innerText;
      $scope.$apply();
      $scope.$digest();
    };

    interact('.draggable')
      .draggable({
        // enable inertial throwing
        inertia: true,
        snap: {
          endOnly: true
        },
        // keep the element within the area of it's parent
        restrict: {
          restriction: "parent",
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        // enable autoScroll
        autoScroll: false,

        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
          event.target.setAttribute('startDrag', 'false');
          var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('initial-data-x')) || 0),
            y = (parseFloat(target.getAttribute('initial-data-y')) || 0);
          // translate the element
          target.style.webkitTransform =
            target.style.transform =
              'translate(' + x + 'px, ' + y + 'px)';
        }
      });

    function dragMoveListener (event) {
      if(event.target.getAttribute('startDrag') !== 'true')
      {
        event.target.setAttribute('initial-data-x', event.dx);
        event.target.setAttribute('initial-data-y', event.dy);
      }
      var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
      target.setAttribute('startDrag', 'true');
      // translate the element
      target.style.webkitTransform =
        target.style.transform =
          'translate(' + x + 'px, ' + y + 'px)';

      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }

    // this is used later in the resizing and gesture demos
    //window.dragMoveListener = dragMoveListener;

    interact('.dropzone').dropzone({
      // Require a 75% element overlap for a drop to be possible
      overlap: 0.10,

      // listen for drop related events:

      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
      },
      ondragenter: function (event) {
        var draggableElement = event.relatedTarget,
          dropzoneElement = event.target;

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        //draggableElement.textContent = 'Dragged in';
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        //event.relatedTarget.textContent = 'Dragged out';
      },
      ondrop: function (event) {
        var id = event.relatedTarget.getAttribute('item-id');
        var item = $filter('getById')(vm.awesomeThings, id);
        var index = vm.awesomeThings.indexOf(item);

        var areaType = event.target.getAttribute('drop-area');

        if(areaType === 'do-not-do'){
          vm.doNotDoItems.push(item);
        }
        else if(areaType === 'do-later'){
          vm.doLaterItems.push(item);
        }
        else if(areaType === 'do'){
          vm.toDoItems.push(item);
        }

        vm.awesomeThings.splice(index, 1);
        $scope.$apply();
        $scope.$digest();
        //event.relatedTarget.textContent = 'Dropped';
      },
      ondropdeactivate: function (event) {
        // remove active dropzone feedback
        event.target.classList.remove('drop-active');
        event.target.classList.remove('drop-target');
      }
    });

    activate();

    function activate() {
      $timeout(function() {
        vm.classAnimation = 'rubberBand';
      }, 4000);
    }

    function showToastr() {
      toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
      vm.classAnimation = '';
    }

    function addLike(postID){
      angular.forEach(vm.awesomeThings, function(item) {
        if(item.id === postID)
        {
          if(item.liked !== true) {
            item.likes += 1;
            item.liked = true;
          }
        }
      });
    }

    var config = {
      params: {
        'rows': 100,
        'fname': '{firstName}',
        'lname': '{lastName}',
        'description': '{lorem|10}',
        'likes' : '{number|50}',
        'callback': "JSON_CALLBACK",
        'id': '{index}'
      }
    };

    $http.jsonp("http://www.filltext.com", config, {}).
    success(function (data) {
      angular.forEach(data, function(received){
        //if has image, and col span 2 should be set

        var rowSpan  = Math.floor(received.likes/10);
        var colSpan = Math.floor(rowSpan/2);
        if(colSpan === 0)
        {
          colSpan +=1;
        }
        if(rowSpan%10 > 3)
        {
          received.img = "https://unsplash.it/172/338?random";
          colSpan+=2;
          received.hasImage = true;
        }
        received.row = rowSpan + 4;
        received.col = colSpan + 1;

      });
      vm.awesomeThings = data;

      //$scope.digest();
    });
  }
})();
