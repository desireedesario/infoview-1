var passport         = require('passport');
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
var User             = require('../models/User');

//////////////////////////////
/// LinkedIn Authorization ///
//////////////////////////////

passport.use(new LinkedInStrategy({
  // pull in the app id and secret from .env file
  clientID     : process.env.LINKEDIN_CLIENT_ID,
  clientSecret : process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL  : process.env.LINKEDIN_CALLBACK,
  scope        : ['r_emailaddress', 'r_basicprofile'],
  state        : true
},
// linkedin will send back token and profile, we will give a cb fcn
function(accessToken, refreshToken, profile, cb) {
  // asynchronous verification
  // console.log('this is your json: ', profile._json);
  console.log('profile id: ', profile.id);
  console.log('email: ', profile.emails[0].value);
  console.log('firstName: ', profile._json.firstName);
  console.log('lastName: ', profile._json.lastName);
  console.log('location: ', profile._json.location.name);
  console.log('industry: ', profile._json.industry);
  console.log('picture: ', profile._json.pictureUrl);
  // // console.log(r_basicprofile)
  // console.log(profile.lastName);

  // asynchronous verification
  process.nextTick(function () {

    // find the user in the db based on their linkedin id
    User.findOne({'linkedin.id': profile.id}, function(err, user) {
      // console.log('user is ' + user.linkedin.email)
      // if there's an error:
      if(err) return cb(err);

      // if the user is found, log them in:
      if(user) {
        console.log('found user' + user);
        return cb(null, user);
      } else {

        console.log('creating user');
        // if no user is found with that linkedin id, create them by setting fields from the returned profile attributes
        var newUser = new User({
          linkedin : {
            id          : profile.id,
            email       : profile.emails[0].value,
            firstName   : profile._json.firstName,
            lastName    : profile._json.lastName,
            headline    : profile._json.headline,
            location    : profile._json.location.name,
            industry    : profile._json.industry,
            profileUrl  : profile._json.publicProfileUrl,
            pictureUrl  : profile._json.pictureUrl
          }
        });
        // save user to our db
        newUser.save(function(err) {
          // what to do if there is an error
          if(err) return cb(err);
          // if successful, return the new user
          return cb(null, newUser);
        });
      }
    })
  });

}));

// serialize user
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialize user
passport.deserializeUser(function(id, callback) {
  User.findById(id, function(err, user) {
    callback(err, user);
  });
});

// export the linked in strategy and passport
module.exports = LinkedInStrategy;
module.exports = passport;
