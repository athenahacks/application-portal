angular.module('reg')
  .controller('AdminUsersCtrl',[
    '$scope',
    '$state',
    '$stateParams',
    'UserService',
    function($scope, $state, $stateParams, UserService){

      $scope.pages = [];
      $scope.users = [];

      // Semantic-UI moves modal content into a dimmer at the top level.
      // While this is usually nice, it means that with our routing will generate
      // multiple modals if you change state. Kill the top level dimmer node on initial load
      // to prevent this.
      $('.ui.dimmer').remove();
      // Populate the size of the modal for when it appears, with an arbitrary user.
      $scope.selectedUser = {};
      $scope.selectedUser.sections = generateSections({status: '', confirmation: {
        dietaryRestrictions: []
      }, profile: ''});

      function updatePage(data){
        $scope.users = data.users;
        $scope.currentPage = data.page;
        $scope.pageSize = data.size;

        var p = [];
        for (var i = 0; i < data.totalPages; i++){
          p.push(i);
        }
        $scope.pages = p;
      }

      UserService
        .getPage($stateParams.page, $stateParams.size, $stateParams.query, $scope.statusFilters)
        .success(function(data){
          updatePage(data);
        });

      $scope.$watch('queryText', function(queryText){
        UserService
          .getPage($stateParams.page, $stateParams.size, queryText, $scope.statusFilters)
          .success(function(data){
            updatePage(data);
          });
      });

      $scope.applyStatusFilter = function () {
        UserService
          .getPage($stateParams.page, $stateParams.size, $scope.queryText, $scope.statusFilters)
          .success(function (data) {
            updatePage(data);
          });
      };

      $scope.goToPage = function(page){
        $state.go('app.admin.users', {
          page: page,
          size: $stateParams.size || 50
        });
      };

      $scope.goUser = function($event, user){
        $event.stopPropagation();

        $state.go('app.admin.user', {
          id: user._id
        });
      };

      $scope.toggleCheckIn = function($event, user, index) {
        $event.stopPropagation();

        if (!user.status.checkedIn){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about to check in " + user.profile.fname + " " + user.profile.lname + "!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, check them in.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .checkIn(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Accepted", user.profile.fname + " " + user.profile.lname + ' has been checked in.', "success");
                });
            }
          );
        } else {
          UserService
            .checkOut(user._id)
            .success(function(user){
              $scope.users[index] = user;
              swal("Accepted", user.profile.fname + " " + user.profile.lname + ' has been checked out.', "success");
            });
        }
      };

      $scope.acceptUser = function($event, user, index) {
        $event.stopPropagation();

        swal({
          title: "Whoa, wait a minute!",
          text: "You are about to accept " + user.profile.fname + " " + user.profile.lname + "!",
          type: "warning",
          showCancelButton: true,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "Yes, accept them.",
          closeOnConfirm: false
          }, function(){

            swal({
              title: "Are you sure?",
              text: "Your account will be logged as having accepted this user. " +
                "Remember, this power is a privilege.",
              type: "warning",
              showCancelButton: true,
              confirmButtonColor: "#DD6B55",
              confirmButtonText: "Yes, accept this user.",
              closeOnConfirm: false
              }, function(){

                UserService
                  .admitUser(user._id)
                  .success(function(user){
                    $scope.users[index] = user;
                    swal("Accepted", user.profile.fname + " " + user.profile.lname + ' has been admitted.', "success");
                  });

              });

          });

      };

      $scope.toggleAdmin = function($event, user, index) {
        $event.stopPropagation();

        if (!user.admin){
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about make " + user.profile.fname + " " + user.profile.lname + " an admin!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, make them an admin.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .makeAdmin(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Made", user.profile.fname + " " + user.profile.lname + ' an admin.', "success");
                });
            }
          );
        } else {
          swal({
            title: "Whoa, wait a minute!",
            text: "You are about remove " + user.profile.fname + " " + user.profile.lname + " as admin!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, remove them as admin.",
            closeOnConfirm: false
            },
            function(){
              UserService
                .removeAdmin(user._id)
                .success(function(user){
                  $scope.users[index] = user;
                  swal("Removed", user.profile.fname + " " + user.profile.lname + ' an admin.', "success");
                });
            }
          );
        }
      };

      function formatTime(time){
        if (time) {
          return moment(time).format('MMMM Do YYYY, h:mm:ss a');
        }
      }

      $scope.rowClass = function(user) {
        if (user.admin){
          return 'admin';
        }
        if (user.status.confirmed) {
          return 'positive';
        }
        if (user.status.admitted && !user.status.confirmed) {
          return 'warning';
        }
      };

      function selectUser(user){
        $scope.selectedUser = user;
        $scope.selectedUser.sections = generateSections(user);
        $('.long.user.modal')
          .modal('show');
      }

      function generateSections(user){
        if (user.status.confirmed || user.status.checkedIn) {
          //Basic, Profile, and Confirmation sections
          return [
            {
              name: 'Basic Info',
              fields: [
                {
                  name: 'Created On',
                  value: formatTime(user.timestamp)
                },{
                  name: 'Last Updated',
                  value: formatTime(user.lastUpdated)
                },{
                  name: 'Confirm By',
                  value: formatTime(user.status.confirmBy) || 'N/A'
                },{
                  name: 'Checked In',
                  value: formatTime(user.status.checkInTime) || 'N/A'
                },{
                  name: 'Email',
                  value: user.email
                }
              ]
            },{
              name: 'Profile',
              fields: [
                {
                  name: 'First Name',
                  value: user.profile.fname
                },{
                  name: 'Last Name',
                  value: user.profile.lname
                },{
                  name: 'School',
                  value: user.profile.school
                },{
                  name: 'Grade',
                  value: user.profile.grade
                },{
                  name: 'Major',
                  value: user.profile.major
                },{
                  name: 'Gender',
                  value: user.profile.gender
                },{ 
                  name: 'Ethnicity',
                  value: user.profile.ethnicity
                },{   
                  name: 'Attended Hackathons',
                  value: user.profile.hacks
                },{    
                  name: 'Attended AthenaHacks',
                  value: user.profile.attended
                },{                    
                  name: 'Topic',
                  value: user.profile.topic
                },{
                  name: 'Essay',
                  value: user.profile.essay
                },{
                  name: 'Links',
                  value: user.profile.links
                },{
                  name: 'Adult',
                  value: user.profile.adult
                },{
                  name: 'Transportation',
                  value: user.profile.transportation
                }
  
              ]
            },{
              name: 'Confirmation',
              fields: [
                {
                  name: 'Phone Number',
                  value: user.confirmation.phoneNumber
                },{
                  name: 'Birthdate',
                  value: user.confirmation.birthdate
                },{
                  name: 'GradYear',
                  value: user.confirmation.gradYear
                },{
                  name: 'Vegetarian',
                  value: user.confirmation.vegetarian
                },{
                  name: 'Vegan',
                  value: user.confirmation.vegan
                },{
                  name: 'GlutenFree',
                  value: user.confirmation.glutenfree
                },{
                  name: 'Shirt Size',
                  value: user.confirmation.shirtSize
                },{
                  name: 'Resume',
                  value: user.confirmation.resume
                },{
                  name: 'Travel',
                  value: user.confirmation.bus
                },{
                  name: 'Emergency Contact',
                  value: user.confirmation.econtact
                },{
                  name: 'Emergency Number',
                  value: user.confirmation.enumber,
                },{
                  name: 'Notes',
                  value: user.confirmation.notes
                },{
                  name: 'MLH Code of Conduct',
                  value: user.confirmation.mlh
                },{
                  name: 'MLH Auth',
                  value: user.confirmation.mlhauth
                }
              ]
            }
          ];
        }
        if (user.status.admitted || user.status.completedProfile || user.status.declined) {
          return [
            //Basic and Profile sections
            {
            name: 'Basic Info',
              fields: [
                {
                  name: 'Created On',
                  value: formatTime(user.timestamp)
                },{
                  name: 'Last Updated',
                  value: formatTime(user.lastUpdated)
                },{
                  name: 'Confirm By',
                  value: formatTime(user.status.confirmBy) || 'N/A'
                },{
                  name: 'Checked In',
                  value: formatTime(user.status.checkInTime) || 'N/A'
                },{
                  name: 'Email',
                  value: user.email
                }
              ]
            },{
              name: 'Profile',
              fields: [
                {
                  name: 'First Name',
                  value: user.profile.fname
                },{
                  name: 'Last Name',
                  value: user.profile.lname
                },{
                  name: 'School',
                  value: user.profile.school
                },{
                  name: 'Grade',
                  value: user.profile.grade
                },{
                  name: 'Major',
                  value: user.profile.major
                },{
                  name: 'Gender',
                  value: user.profile.gender
                },{ 
                  name: 'Ethnicity',
                  value: user.profile.ethnicity
                },{   
                  name: 'Attended Hackathons',
                  value: user.profile.hacks
                },{    
                  name: 'Attended AthenaHacks',
                  value: user.profile.attended
                },{                    
                  name: 'Topic',
                  value: user.profile.topic
                },{
                  name: 'Essay',
                  value: user.profile.essay
                },{
                  name: 'Links',
                  value: user.profile.links
                },{
                  name: 'Adult',
                  value: user.profile.adult
                },{
                  name: 'Transportation',
                  value: user.profile.transportation
                }
  
              ]
            }
          ];        
        }
        else {
          return [];
        }
      }

      $scope.selectUser = selectUser;

    }]);


