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
  function MainController($timeout, $http, toastr, $filter, $scope, $mdDialog) {
    var vm = this;

    vm.awesomeThings = [];
    vm.viewState = 'all';
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
    //vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

    vm.refresh = function(newItems, state){
      vm.awesomeThings = newItems;
      vm.viewState = state;
    };

    vm.loadAllPosts = function(){
      vm.viewState = 'all';
      vm.awesomeThings = vm.currentData;
    };

    vm.viewPost = function(postId, ev){
      ev.stopPropagation();
      var postItem = $filter('getById')(vm.awesomeThings, postId);
      $mdDialog.show({
        controller: ViewPostController,
        template: '<md-dialog aria-label="viewPost" ng-cloak>' +
        '<form class="a-md-dialog post-view-dialog">' +
          '<div flex layout="row">' +
            '<div flex layout="column" layout-align="center stretch" style="align-self: stretch">' +
              '<div flex class="tile-text">' +
                '<p>{{post.description }}</p>' +
              '</div>' +
            '<div class="action-panel">' +
              '<div flex layout="row">' +
                '<md-button aria-label="like" class="md-icon-button">' +
                  '<i class="material-icons">favorite_border</i>' +
                '</md-button>' +
                '<div class="likes-count">{{post.likes}}</div>' +
                '<div flex class="author">{{post.fname}} {{post.lname}}</div>' +
              '</div>' +
            '</div>' +
            '</div>' +
            '<div flex="40" ng-if="post.hasImage" class="tile-image" ng-style="{\'background\' : \'url({{post.img}}) no-repeat\'}"></div>' +
          '</div>' +
          '<div flex layout="column" class="post-comments-area">' +
            '<div class="comment-to-post" ng-repeat="comment in comments" layout="row">' +
                '<div>' +
                  '<div class="comment-avatar" ng-style="{\'background\' : \'url({{comment.avatar}}) no-repeat\'}"></div>' +
                '</div>' +
                '<div layout="column" class="comment-info">' +
                  '<div class="comment-user-name">{{comment.fname}} {{comment.lname}}</div>'+
                  '<div class="comment-text">{{comment.description}}</div>'+
                ' </div>' +
            '</div>' +
            '<div class="my-comment-container" layout="row">' +
              '<div class="avatar-container">' +
                '<div class="my-avatar-small"></div>'+
              '</div>'+
              '<md-input-container flex="100">' +
                '<label>Оставьте комментарий...</label>' +
                '<input ng-model="myComment">' +
              '</md-input-container>' +
            '</div>' +
          '</div>'+
        '</form>' +
        '</md-dialog>',
        locals:{
          post: postItem
        },
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: false
      });
    };

    function ViewPostController($scope, $mdDialog, post){
      $scope.post = post;
      $scope.myComment = "";
      var config = {
        params: {
          'rows': 3,
          'fname': '{firstName}',
          'lname': '{lastName}',
          'description': '{lorem|15}',
          'callback': "JSON_CALLBACK",
          'id': '{index}'
        }
      };
      $http.jsonp("http://www.filltext.com", config, {}).
      success(function (data) {
        angular.forEach(data, function(received){
            received.avatar = "https://unsplash.it/100/100?random";
        });
        $scope.comments = data;
        //$scope.digest();
      });
    };


    vm.openSelectProjectMenu = function($mdOpenMenu, ev){
      originatorEv = ev;
      $mdOpenMenu(ev);
    };

    vm.createPost = function(ev){
      //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
      $mdDialog.show({
        controller: DialogController,
        template: '<md-dialog aria-label="create a post" class="create-post-dailog" ng-cloak>' +
        '<form>' +
        '<div layout-align="column" class="a-md-dialog">' +
        '  <div flex="100" class="input-container">' +
        '   <md-input-container flex class="create-post-input md-block">' +
        '     <label>Есть идея? Пиши прямо тут!</label>' +
        '     <textarea rows="2" ng-paste="handlePaste($event)" ng-model="postText" hotkey="{\'shift+enter\': createNewPost}"></textarea> ' +
        '   </md-input-container>' +
          '<img src="{{imageUrl}}" style="height: 66px; width: 66px;" ng-show="imageUrl.length > 0" />'+
        ' </div>' +
        ' <div flex="100" class="create-post-hint" ng-hide="imageUrl.length > 0">Чтобы присоединить картинку, перетяни ее в окно браузера или просто вставь ссылку.</div>' +

        '</div>' +

        '<md-button flex="100" class="create-post-btn" ng-show="postText.length > 0" ng-click="createNewPost()">Запостить!</md-button>' +

        '<div class="create-post-action-hint" ng-show="postText.length > 0" >Подсказка: ⇧ + Enter</div>'+
        '</form>' +
        '</md-dialog>'
        ,
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:false,
        fullscreen: false
      }).then(function(post){
        var hasImage = post.image.length > 0;
        var col = 2;
        if(hasImage)
        {
          col +=1;
        }
        vm.awesomeThings.push(
          {
            'fname' : 'Me',
            'lname': 'Gusta',
            'description' : post.text,
            'likes' : 0,
            'img' : post.image,
            'hasImage' : hasImage,
            'col' : col,
            'row' : 4,
            'itemStyle' : "medium-item",
            'id' : 101
          });
          //$scope.$apply();
          //$scope.$digest();
      });
    };

    function DialogController($scope, $mdDialog) {
      $scope.postText = "";
      $scope.imageUrl = "";
      $scope.hide = function() {
        $mdDialog.hide();
      };
      $scope.cancel = function() {
        $mdDialog.cancel();
      };
      $scope.createNewPost = function() {
        console.log($scope.postText);
        $mdDialog.hide({'text' : $scope.postText, 'image' : $scope.imageUrl});
      };
      $scope.handlePaste = function(e){
        for (var i = 0 ; i < e.originalEvent.clipboardData.items.length ; i++) {
          var item = e.originalEvent.clipboardData.items[i];
          if (item.type.indexOf("image") != -1) {
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL( item.getAsFile() );
            $scope.imageUrl = imageUrl;
          } else {
            console.log("Discarding non-image paste data");
          }
        }
      };
    }

    vm.openOrderType = function($mdOpenMenu, ev){
      selectOrderItem = ev;
      $mdOpenMenu(ev);
    };

    vm.changeOrderType = function(value, ev){
      vm.orderField = value;
      vm.orderTypeText = ev.currentTarget.innerText;
      //$scope.$apply();
      //$scope.$digest();
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
          event.target.classList.remove('start-dragging');
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
      event.target.classList.add('start-dragging');
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

        var previousState = draggableElement.getAttribute('stored-state');
        draggableElement.classList.remove(previousState);

        var newState = dropzoneElement.getAttribute('drop-area');
        draggableElement.classList.add(newState);
        draggableElement.setAttribute('stored-state', newState);

        // feedback the possibility of a drop
        dropzoneElement.classList.add('drop-target');
        draggableElement.classList.add('can-drop');
        //draggableElement.textContent = 'Dragged in';
      },
      ondragleave: function (event) {
        // remove the drop feedback style
        var previousState = event.relatedTarget.getAttribute('stored-state');
        event.relatedTarget.classList.remove(previousState);

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
        //$scope.$apply();
        //$scope.$digest();
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
        'likes' : '{number|70}',
        'callback': "JSON_CALLBACK",
        'id': '{index}'
      }
    };

    $http.jsonp("http://www.filltext.com", config, {}).
    success(function (data) {
      angular.forEach(data, function(received){
        //if has image, and col span 2 should be set

        var ratio  = Math.floor(received.likes/10);
        var rowSpan = 1;
        var colSpan = 1;

        if(ratio > 4)
        {
          received.itemStyle = "big-item";
          rowSpan = 5;
          colSpan = 2;
        }
        else if(ratio >2 && ratio >= 4)
        {
          received.itemStyle = "medium-item";
          rowSpan = 4;
          colSpan = 2;
        } else{
          received.itemStyle = "small-item";
          rowSpan = 4;
          colSpan = 1
        }

        if(received.likes%10 > 3)
        {
          received.img = "https://unsplash.it/300/500?random";
          if(ratio > 4) {
            colSpan += 2;
          } else {
            colSpan += 1;
          }
          received.hasImage = true;

          if(received.likes%5 > 3){
            received.useVerticalImage = true;
          }
        }
        received.row = rowSpan;
        received.col = colSpan;

      });
      vm.awesomeThings = data;

      vm.currentData = data;

      //$scope.digest();
    });
  }
})();
