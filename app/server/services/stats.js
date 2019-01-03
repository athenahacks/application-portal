var _ = require('underscore');
var async = require('async');
var User = require('../models/User');

// In memory stats.
var stats = {};
function calculateStats(){
  console.log('Calculating stats...');
  var newStats = {
    lastUpdated: 0,

    total: 0,
    demo: {
      gender: {
        Female: 0,
        Trans: 0,
        NonBinary: 0,
        PreferNotToAnswer: 0
      },
      schools: {},
      grade: {
        'HighSchool': 0,
        'Freshman': 0,
        'Sophomore': 0,
        'Junior': 0,
        'Senior': 0
      },
      ethnicity: {
        'Asian': 0,
        'African': 0,
        'Caucasian': 0, 
        'Hispanic': 0,
        'Other': 0,
        'PreferNotToAnswer': 0
      }
    },

    teams: {},
    verified: 0,
    submitted: 0,
    admitted: 0,
    confirmed: 0,
    declined: 0,

    confirmedFemale: 0,
    confirmedTrans: 0,
    confirmedNonBinary: 0,
    confirmedOther: 0,

    shirtSizes: {
      'XS': 0,
      'S': 0,
      'M': 0,
      'L': 0,
      'XL': 0
    },

    vegan: 0,

    vegetarian: 0,

    glutenfree: 0,

    bus: {
      'No': 0,
      'UCSD': 0,
      'UCI': 0,
      'CalPolySlo': 0,
      'CalPolyPomona': 0,
      'CalTech': 0
    },

    checkedIn: 0, 
    adult: 0
  };

  User
    .find({})
    .exec(function(err, users){
      if (err || !users){
        throw err;
      }

      newStats.total = users.length;

      async.each(users, function(user, callback){

        // Grab the email extension
        var email = user.email.split('@')[1];

        // Add to the gender
        newStats.demo.gender[user.profile.gender] += 1;

        // Add to grade
        newStats.demo.grade[user.profile.grade] += 1;

        // Add to ethnicity
        newStats.demo.ethnicity[user.profile.ethnicity] += 1;

        // Count verified
        newStats.verified += user.verified ? 1 : 0;

        // Count submitted
        newStats.submitted += user.status.completedProfile ? 1 : 0;

        // Count accepted
        newStats.admitted += user.status.admitted ? 1 : 0;

        // Count confirmed
        newStats.confirmed += user.status.confirmed ? 1 : 0;

        // Count confirmed by gender
        newStats.confirmedFemale += user.status.confirmed && user.profile.gender == "Female" ? 1 : 0;
        newStats.confirmedTrans += user.status.confirmed && user.profile.gender == "Trans" ? 1 : 0;
        newStats.confirmedNonBinary += user.status.confirmed && user.profile.gender == "NonBinary" ? 1 : 0;
        newStats.confirmedPreferNotToAnswer += user.status.confirmed && user.profile.gender == "PreferNotToAnswer" ? 1 : 0;

        // Count declined
        newStats.declined += user.status.declined ? 1 : 0;

        // Count schools
        if (!newStats.demo.schools[email]){
          newStats.demo.schools[email] = {
            submitted: 0,
            admitted: 0,
            confirmed: 0,
            declined: 0,
          };
        }
        newStats.demo.schools[email].submitted += user.status.completedProfile ? 1 : 0;
        newStats.demo.schools[email].admitted += user.status.admitted ? 1 : 0;
        newStats.demo.schools[email].confirmed += user.status.confirmed ? 1 : 0;
        newStats.demo.schools[email].declined += user.status.declined ? 1 : 0;

        // Count bus
        newStats.bus[user.profile.bus] += 1;

        newStats.adult += user.status.adult ? 1 : 0;

        // Grab the team name if there is one
        // if (user.teamCode && user.teamCode.length > 0){
        //   if (!newStats.teams[user.teamCode]){
        //     newStats.teams[user.teamCode] = [];
        //   }
        //   newStats.teams[user.teamCode].push(user.profile.name);
        // }

        // Count shirt sizes
        if (user.confirmation.shirtSize in newStats.shirtSizes){
          newStats.shirtSizes[user.confirmation.shirtSize] += 1;
        }

        // Dietary restrictions
        newStats.vegan += user.confirmation.vegan ? 1 : 0;
        newStats.vegetarian += user.confirmation.vegetarian ? 1 : 0;
        newStats.glutenfree += user.confirmation.glutenfree ? 1 : 0;

        // Count checked in
        newStats.checkedIn += user.status.checkedIn ? 1 : 0;

        callback(); // let async know we've finished
      }, function() {

        // Transform schools into an array of objects
        var schools = [];
        _.keys(newStats.demo.schools)
          .forEach(function(key){
            schools.push({
              email: key,
              count: newStats.demo.schools[key].submitted,
              stats: newStats.demo.schools[key]
            });
          });
        newStats.demo.schools = schools;

        // Likewise, transform the teams into an array of objects
        // var teams = [];
        // _.keys(newStats.teams)
        //   .forEach(function(key){
        //     teams.push({
        //       name: key,
        //       users: newStats.teams[key]
        //     });
        //   });
        // newStats.teams = teams;

        console.log('Stats updated!');
        newStats.lastUpdated = new Date();
        stats = newStats;
      });
    });

}

// Calculate once every five minutes.
calculateStats();
setInterval(calculateStats, 300000);

var Stats = {};

Stats.getUserStats = function(){
  return stats;
};

module.exports = Stats;