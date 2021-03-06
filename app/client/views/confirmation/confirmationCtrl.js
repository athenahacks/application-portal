angular.module('reg')
  .controller('ConfirmationCtrl', [
    '$scope',
    '$rootScope',
    '$state',
    'currentUser',
    'Utils',
    'UserService',
    function($scope, $rootScope, $state, currentUser, Utils, UserService){

      // Set up the user
      var user = currentUser.data;
      $scope.user = user;
      $scope.pastConfirmation = Date.now() > user.status.confirmBy;

      $scope.formatTime = Utils.formatTime;

      _setupForm();

      $scope.fileName = user._id + "_" + user.profile.name;

      // -------------------------------

      function _updateUser(e){
        var confirmation = $scope.user.confirmation;

        UserService
          .updateConfirmation(user._id, confirmation)
          .then(response => {
            swal("Woo!", "You're confirmed!", "success").then(value => {
              $state.go("app.dashboard");
            });
          }, response => {
            swal("Uh oh!", "Something went wrong.", "error");
          });
      }

      function _setupForm(){
        // Semantic-UI form validation
        $('.ui.form').form({
          fields: {
            birthdate: {
              identifier: 'birthdate',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please give us a birthdate!'
                }
              ]
            },
            gradYear: {
              identifier: 'gradYear',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please give us a graduation year!'
                }
              ]
            },
            shirt: {
              identifier: 'shirt',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please give us a shirt size!'
                }
              ]
            },
            phone: {
              identifier: 'phone',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter a phone number.'
                }
              ]
            },
            bus: {
              identifier: 'bus',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please choose a bus option!'
                }
              ]
            },
            econtact: {
              identifier: 'econtact',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter an emergency contact.'
                }
              ]
            },
            enumber: {
              identifier: 'enumber',
              rules: [
                {
                  type: 'empty',
                  prompt: 'Please enter an emergency phone number.'
                }
              ]
            // },
            // mlh: {
            //   identifier: 'mlh',
            //   rules: [
            //     {
            //       type: 'checked',
            //       prompt: 'Please click the checkbox.'
            //     }
            //   ]
            // },
            // mlhauth: {
            //   identifier: 'mlhauth',
            //   rules: [
            //     {
            //       type: 'checked',
            //       prompt: 'Please click the checkbox.'
            //     }
            //   ]
            }
          }
        });
      }

      $scope.submitForm = function(){
        if ($('.ui.form').form('is valid')){
          _updateUser();
          $state.go('app.dashboard');
        }
      };

    }]);
