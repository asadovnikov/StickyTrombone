(function() {
  'use strict';

  if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun/*, thisArg*/) {
      'use strict';

      if (this === void 0 || this === null) {
        throw new TypeError();
      }

      var t = Object(this);
      var len = t.length >>> 0;
      if (typeof fun !== 'function') {
        throw new TypeError();
      }

      var res = [];
      var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
      for (var i = 0; i < len; i++) {
        if (i in t) {
          var val = t[i];

          // NOTE: Technically this should Object.defineProperty at
          //       the next index, as push can be affected by
          //       properties on Object.prototype and Array.prototype.
          //       But that method's new, and collisions should be
          //       rare, so use the more-compatible alternative.
          if (fun.call(thisArg, val, i, t)) {
            res.push(val);
          }
        }
      }

      return res;
    };
  }

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
  function MainController($timeout, $http, toastr, $filter, $scope, $mdDialog, $firebaseObject, $firebaseArray, $cookies, Auth, postsService, $document) {
    var vm = this;
    vm.$document = $document;
    vm.authenticatedUser= Auth.$getAuth();
    postsService.getUserObj(vm.authenticatedUser.uid).once('value', function(response){
      var users = response.val();
      for(var userInfo in users){
        vm.currentSystemUser = users[userInfo];
      }
      //users.$save(userRecord);
    });
    vm.selectedUser = {'photoURL' : 'https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg'};
    vm.fireBasePosts = postsService.root;
    vm.showClosed = false;
    vm.allProjects = $firebaseArray(postsService.projects);
    vm.awesomeThings = [];
    vm.currentUserDoPosts = [];
    vm.currentUserDoLaterPosts = [];
    vm.currentUserDoNotDoPosts = [];
    vm.currentUserUnclassifiedPosts = [];
    vm.viewState = 'all';
    vm.classAnimation = '';
    vm.orderField = '';
    vm.newProjectCreation = false;
    vm.newProjectName = '';
    vm.orderTypeText = 'по просмотрам';
    vm.newProjectName = '';
    vm.currentProject;
    vm.fireBaseArrayPosts = [];

    var loadProject = function(){
      if(vm.currentProject){
        vm.toDoItems = $firebaseArray(postsService.getDoPosts(vm.currentProject.$id));
        vm.doLaterItems = $firebaseArray(postsService.getDoLaterPosts(vm.currentProject.$id));
        vm.doNotDoItems = $firebaseArray(postsService.getDoNotDoPosts(vm.currentProject.$id));
        vm.fireBaseArrayPosts = $firebaseArray(postsService.getPosts(vm.currentProject.$id));
        vm.fireBaseArrayPosts.$loaded().then(function(posts){
          angular.forEach(posts, function(post){
            var postUser = {};
            angular.forEach(vm.availableUsers, function(user){
              if(user.uid === post.user_id){
                postUser = user;
              }
            });
            if(postUser.rating == 1){
              post.itemStyle = 'small-item';
              post.row = 4;
              post.col = post.img.length > 0 ? 2: 1;
            }
            else if(postUser.rating == 2){
              post.itemStyle = 'medium-item';
              post.row = 4;
              post.col = post.img.length > 0 ? 3: 2;
            }
            else{
              post.itemStyle = 'big-item';
              post.row = 5;
              post.col = post.img.length > 0 ? 4: 2;
            }

            post.rating = postUser.rating;

          });
        });
        vm.awesomeThings = vm.fireBaseArrayPosts;
      }
    };
    vm.allProjects.$loaded().then(function(result){
      var storedPost = $cookies.get('project-id');
      angular.forEach(result, function(item){
        if(!storedPost)
        {
          vm.currentProject = item;
        }
        else if(item.$id === storedPost){
          vm.currentProject = item;
        }
      });
      loadProject();
    });

    vm.toggleCreateProject = function($event){
      vm.newProjectCreation = true;
    };

    vm.setActiveProject = function($event, project){
      vm.currentProject = project;
      $cookies.put('project-id', project.$id);
      loadProject();
    };

    vm.currentDialog;
    vm.newProject = function(event){
        if(event.keyCode === 13)
        {
          $timeout(function(){
            vm.$document.find('.md-menu-backdrop').triggerHandler('click');
            vm.newProjectCreation = false;
            if(vm.newProjectName.length > 0) {
              vm.allProjects.$add(
                {
                  'project': vm.newProjectName,
                  'created_by': vm.authenticatedUser.uid,
                  'created_date': Date.now()
                }
              ).then(function(ref){
                vm.setActiveProject(null, vm.allProjects[vm.allProjects.$indexFor(ref.key)]);
              });
            }
            vm.newProjectName = '';
          });
        }
    };
    vm.showOnlyUsers = [];
    vm.availableUsers = $firebaseArray(postsService.users);
    vm.availableUsers.$loaded().then(function(result){
      angular.forEach(result, function(item){
        if(item.uid === vm.currentSystemUser.uid){
          vm.currentUserId = item.$id;
        }
        vm.showOnlyUsers.push(item.uid);
      });
    });

    $scope.filterByUser = function(item){
      for(var user in vm.showOnlyUsers)
      {
        if(item.user_id === vm.showOnlyUsers[user])
        {
          return true;
        }
      }
      return false;
    };


    vm.closeOpennedDialog = function(){
      if(vm.currentDialog){
        vm.currentDialog.hide();
      }
    };

    var originatorEv;
    var selectOrderItem;
    //vm.customFullscreen = $mdMedia('xs') || $mdMedia('sm');

    vm.newGuid = function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };

    vm.isURL = function(str) {
      var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
      return pattern.test(str);
    };

    vm.refresh = function(newItems, state){
      vm.awesomeThings = newItems;
      vm.viewState = state;
      vm.currentView = state;
    };

    vm.openUser = function(userId, userName){
      vm.currentView = 'userView';
      vm.currentUser = userName;
      vm.allUserPosts = [];
      angular.forEach(vm.allProjects, function(project){
        $firebaseArray(postsService.getUserPosts(project.$id, userId)).$loaded().then(function(result){
          angular.forEach(result, function(item){
            item.project = project.$id;
            vm.allUserPosts.push(item);
            if(item.state === 'do'){
              vm.currentUserDoPosts.push(item);
            }
            else if(item.state === 'do-later'){
              vm.currentUserDoLaterPosts.push(item);
            }
            else if(item.state === 'do-not-do'){
              vm.currentUserDoNotDoPosts.push(item)
            }
            else{
              vm.currentUserUnclassifiedPosts.push(item);
            }
          });
        });
      });

      vm.awesomeThings = vm.allUserPosts;

      vm.currentUserDoPosts = [];
      vm.currentUserDoLaterPosts = [];
      vm.currentUserDoNotDoPosts = [];
      vm.currentUserUnclassifiedPosts = [];

      postsService.getUserObj(userId).once('value', function(response){
        var users = response.val();
        for(var userInfo in users){
          vm.selectedUser = users[userInfo];
        }
      });

    };

    vm.loadAllPosts = function(){
      vm.viewState = 'all';
      vm.currentView = 'all';
      loadProject();
    };

    vm.showImage = function(ev, image_src){
      vm.showClosed = true;
      $mdDialog.show({
        controller: ViewImageController,
        template: '<md-dialog aria-label="user settings" class="user-settings-dailog " ng-cloak>' +
        '<form>' +
        '<div layout-align="column" class="a-md-dialog image-preview">' +
        '<img style="max-width: 60vw;" ng-src="{{image_src}}"/>'+
        '</div>' +
        '</form>' +
        '</md-dialog>',
        locals:{
          parentModel: vm,
          image_src: image_src
        },
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: false
      }).finally(function(){
        vm.showClosed = false;
      });
    };

    function ViewImageController($scope, $mdDialog, parentModel, image_src){
      parentModel.currentDialog = $mdDialog;
      $scope.parentModel = parentModel;
      $scope.image_src = image_src;
    }

    vm.viewUsetSettings = function(ev){
      vm.showClosed = true;
      $mdDialog.show({
        controller: UserSettingsController,
        template: '<md-dialog aria-label="user settings" class="user-settings-dailog " ng-cloak>' +
        '<form>' +
        '<div layout-align="column" class="a-md-dialog">' +
        '<div layout="row" ng-repeat="user in users" class="container">' +
          '<div class="user">{{user.displayName}}</div>' +
          '<md-checkbox ng-model="user.comment">Коментирование</md-checkbox>'+
          '<md-checkbox ng-model="user.edit">Создание</md-checkbox>'+
        '</div>' +
        '<md-button flex="100" class="create-post-btn" ng-click="updateUsers()">Сохранить!</md-button>' +
        '</div>' +
        '</form>' +
        '</md-dialog>',
        locals:{
          parentModel: vm
        },
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: false
      }).finally(function(){
        vm.showClosed = false;
      });
    };

    function UserSettingsController($scope, $mdDialog, parentModel){
      parentModel.currentDialog = $mdDialog;
      $scope.users = parentModel.availableUsers;
      $scope.updateUsers = function(){
        angular.forEach($scope.users, function(user){
          var userRecord = $scope.users.$getRecord(user.$id);
          $scope.users.$save(userRecord);
        });
        $mdDialog.hide();
      }
    }

    vm.viewPost = function(post, ev){
      console.log('view-post');
      var postId = post.$id;
      document.body.style.cursor = 'pointer';
      if(vm.dirtyItem) {
        vm.dirtyItem = false;
        return;
      }
      console.log('stop propagation');
      ev.stopPropagation();
      var projectId = post.project || vm.currentProject.$id;
      postsService.getPost(projectId, postId).once('value', function(snap){
        var postItem = snap.val();
        vm.showClosed = true;
          $mdDialog.show({
        controller: ViewPostController,
        template: '<md-dialog aria-label="viewPost" ng-cloak>' +
        '<form class="a-md-dialog post-view-dialog" ng-submit="addComment()">' +
          '<div flex layout="row" class="post-description-container">' +
            '<div flex layout="column" layout-align="center stretch" style="align-self: stretch">' +
              '<div flex class="tile-text">' +
                '<p>{{post.description }}</p>' +
              '</div>' +
              '<div class="action-panel">' +
                '<div flex layout="row">' +
                  '<div class="post-creation-time" am-time-ago="{{post.created_date}}"></div>' +
                  '<div flex class="author">— {{post.user_name}}</div>' +
                  '<div flex class="brunch-btn" ng-show="post.user_id === parentModel.currentSystemUser.uid || parentModel.currentSystemUser.superUser"><md-button ng-click="deletePost(post)"><i class="material-icons">delete</i>УДАЛИТЬ</md-button></div>' +
                '</div>' +
              '</div>' +
            '</div>' +
            '<div flex="40" ng-if="post.hasImage" class="tile-image" ng-style="{\'background\' : \'url({{post.img}}) no-repeat\'}"></div>' +
          '</div>' +
          '<div flex layout="column" class="post-comments-area">' +
            '<div class="comment-to-post" ng-repeat="comment in comments" layout="row">' +
                '<div>' +
                  '<div class="comment-avatar" ng-style="{\'background\' : \'url({{comment.author_avatar}}) no-repeat center/100% \'}"></div>' +
                '</div>' +
                '<div layout="column" class="comment-info">' +
                  '<div class="comment-user-name" ng-click="openUser(comment.author_id, comment.author)">{{comment.author}}</div>'+
                  '<div class="comment-text">{{comment.comment}}</div>'+
                ' </div>' +
            '</div>' +

            '<div class="my-comment-container" layout="row" ng-show="parentModel.currentSystemUser.comment || parentModel.currentSystemUser.superUser">' +
              '<div class="avatar-container">' +
                '<div class="my-avatar-small" ng-style="{\'background\' : \'url({{parentModel.currentSystemUser.photoURL}}) no-repeat center/100% \'}"></div>'+
              '</div>'+
              '<md-input-container flex="100">' +
                '<label>Оставьте комментарий...</label>' +
                '<input ng-model="text" autofocus md-maxlength="150"/>' +
              '</md-input-container>' +
            '</div>' +
          '</div>'+
        '</form>' +
        '</md-dialog>',
        locals:{
          post: postItem,
          parentModel: vm,
          post_id: postId
        },
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose:true,
        fullscreen: false
      }).then(function(post){
            //vm.currentItem = post;
            //vm.currentView = 'forkItem';
          }).finally(function(){
            vm.showClosed = false;
          });
      });
    };

    function ViewPostController($scope, $mdDialog, post, parentModel, post_id){
      $scope.text = "";
      $scope.parentModel = parentModel;
      $scope.parentModel.currentDialog = $mdDialog;
      $scope.post = post;
      $scope.postId = post_id;
      $scope.comments = $firebaseArray(postsService.getComments($scope.parentModel.currentProject.$id, post_id));
      $scope.deletePost = function(post){
        //console.log($scope.postText);
        $scope.parentModel.awesomeThings.$remove($scope.parentModel.awesomeThings.$indexFor(post_id));
        $mdDialog.hide();
      };

      $scope.openUser = function(user_id, user_name){
        $mdDialog.hide();
        $scope.parentModel.openUser(user_id, user_name);
      };
      $scope.addComment = function(){
        $scope.comments.$add({
          'comment' : $scope.text,
          'created' : Date.now(),
          'author' : parentModel.authenticatedUser.displayName,
          'author_id' : parentModel.authenticatedUser.uid,
          'author_avatar' : parentModel.authenticatedUser.photoURL
        });
        $scope.text = "";
      };

    }


    vm.openSelectProjectMenu = function($mdOpenMenu, $event){
      originatorEv = $event;
      $mdOpenMenu($event);
    };

    vm.createPost = function(ev){
      //var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && vm.customFullscreen;
      vm.showClosed = true;
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
          '<img src="{{imageUrl}}" style="height: 66px; width: 66px;border-radius: 4px;border: 1px solid #ccc; margin-bottom: 15px;" ng-if="imageUrl.length > 0" />'+
          '<i class="material-icons delete-image" ng-click="removeImage()" ng-if="imageUrl.length > 0">close</i>'+
        ' </div>' +
        ' <div flex="100" class="create-post-hint" ng-hide="imageUrl.length > 0">Чтобы присоединить картинку, перетяни ее в окно браузера или просто вставь ссылку.</div>' +

        '</div>' +

        '<md-button flex="100" class="create-post-btn" ng-show="postText.length > 0" ng-disabled="disablePost" ng-click="createNewPost()">Запостить!</md-button>' +

        '<div class="create-post-action-hint" ng-show="postText.length > 0" >Подсказка: ⇧ + Enter</div>'+
        '</form>' +
        '</md-dialog>'
        ,
        parent: angular.element(document.body),
        targetEvent: ev,
        locals: {
          parentModel: vm
        },
        clickOutsideToClose:false,
        fullscreen: false
      }).then(function(post){
        vm.showClosed = false;
        var hasImage = post.image.length > 0;
        var col = 2;
        if(hasImage)
        {
          col +=1;
        }

        if(!post.text && post.text.length === 0)
        {
          return;
        }

        var count = vm.currentSystemUser['created-posts'] || 0;
        count = count+1;

        vm.currentSystemUser['created-posts'] = count;

        postsService.getUser(vm.currentUserId).update({
          'created-posts' : count
        });

        vm.fireBaseArrayPosts.$add({
          'user_name': vm.currentSystemUser.displayName,
          'user_id': vm.currentSystemUser.uid,
          'created_date': Date.now(),
          'description' : post.text,
          'img' : post.image,
          'hasImage' : hasImage,
          'col' : col,
          'row' : 4,
          'itemStyle' : "medium-item",
          'state' : 'unprocessed'
        });

      }).finally(function(){
        vm.showClosed = false;
      });
    };

    function DialogController($scope, $mdDialog, parentModel) {
      parentModel.currentDialog = $mdDialog;
      $scope.parentModel = parentModel;
      $scope.postText = "";
      $scope.imageUrl = "";
      $scope.removeImage = function(){$scope.imageUrl = '';};
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
        if(e.originalEvent.clipboardData.items) {
          for (var i = 0; i < e.originalEvent.clipboardData.items.length; i++) {
            var item = e.originalEvent.clipboardData.items[i];
            if (item.type.indexOf("image") != -1) {

              $scope.disablePost = true;
              var upload = postsService.storage.child("images/" + parentModel.newGuid()).put(item.getAsFile());
              upload.on('state_changed', function (snapshot) {
              }, function (error) {
              }, function () {
                $scope.imageUrl = upload.snapshot.downloadURL;
                $scope.disablePost = false;
                $timeout(function () {
                  $scope.parentModel.$document.find('.create-post-hint').triggerHandler('click');
                });
              });

            } else if (item.kind === 'string') {
              e.preventDefault();
              item.getAsString(function (result) {
                if (parentModel.isURL(result)) {
                  $scope.imageUrl = result;
                  e.preventDefault();
                }
                else {
                  $scope.postText = $scope.postText + result;
                }
              });

              console.log("Discarding non-image paste data");
            }
            $timeout(function () {
              $scope.parentModel.$document.find('.create-post-hint').triggerHandler('click');
            });
          }
        }
        else{
          var pastedText = e.originalEvent.clipboardData.getData('text/plain');
          if(parentModel.isURL(pastedText))
          {
            e.preventDefault();
            $scope.imageUrl = pastedText;
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
        //inertia: true,
        //snap: {
        //  endOnly: true
        //},
        // keep the element within the area of it's parent
        restrict: {
          restriction: "parent",
          endOnly: true,
          elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
        },
        // enable autoScroll
        autoScroll: false,

        onstart: function(event){
          console.log('doing start');
          angular.element('.st-backdrop').removeClass('disabled');
          angular.element('.decision-panel').addClass('active');

          vm.dirtyItem = true;
          vm.doingDragging = true;
        },
        // call this function on every dragmove event
        onmove: dragMoveListener,
        // call this function on every dragend event
        onend: function (event) {
          console.log('onend');
          event.target.setAttribute('startDrag', 'false');
          event.target.classList.remove('start-dragging');
          var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
            x = (parseFloat(target.getAttribute('initial-data-x')) || 0),
            y = (parseFloat(target.getAttribute('initial-data-y')) || 0);

          event.target.setAttribute('data-x', x);
          event.target.setAttribute('data-y', y);

          // translate the element
          target.style.webkitTransform =
            target.style.transform =
              'translate(' + x + 'px, ' + y + 'px)';
          console.log('start dragging set to false');
          vm.doingDragging = false;
          console.log('remove backdrop');
          angular.element('.st-backdrop').addClass('disabled');
          angular.element('.decision-panel').removeClass('active');
        }
      });

    function dragMoveListener (event) {
      console.log('onmove');
      event.target.classList.add('start-dragging');
      vm.startPostOpenning = true;

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
      overlap: 0.40,
      accept: '.allow',

      // listen for drop related events:

      ondropactivate: function (event) {
        // add active dropzone feedback
        event.target.classList.add('drop-active');
        console.log('ondropactivate');
      },
      ondragenter: function (event) {
        console.log('ondragenter');
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

        console.log('ondragleave');

        event.target.classList.remove('drop-target');
        event.relatedTarget.classList.remove('can-drop');
        //event.relatedTarget.textContent = 'Dragged out';
      },
      ondrop: function (event) {
        console.log('ondrop');
        var postId = event.relatedTarget.getAttribute('item-id');
        console.log(event.target.getAttribute('drop-area'));
        var previousState = event.relatedTarget.getAttribute('item-status');
        postsService.getPost(vm.currentProject.$id, postId).update({
          "state" : event.target.getAttribute('drop-area')
        });
        $timeout(function(){
          postsService.getPost(vm.currentProject.$id, postId).once('value', function(snap){
            var postItem = snap.val();
            var updateObj = {};
            created-posts

            var postUser = {};
            angular.forEach(vm.availableUsers, function(user){
              if(user.uid === postItem.user_id){
                postUser = user;
              }
            });
            var count = postUser[postItem.state] || 0;
            updateObj[postItem.state] = count+1;
            if(postUser[previousState] > 0)
            {
              updateObj[previousState] = postUser[previousState] - 1;
            }
            postsService.getUser(postUser.$id).update(updateObj);
          });
        });

        //postsService.getPost(postId).once('value', function(snap){
        //    var postItem = snap.val();
        //  postItem.update({
        //    "state" : event.target.getAttribute('drop-area')
        //  })
        //});

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
  }
})();
