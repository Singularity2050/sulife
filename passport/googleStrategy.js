const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');

module.exports = () =>{
passport.use(
  new GoogleStrategy({
    //option for the google start
    callbackURL:'/auth/google/redirect',
    clientID:process.env.GOOGLE_ID,
    clientSecret:process.env.GOOGLE_SECRET,
  },async (accessToken,refreshToken,profile,done) =>{
    //passport callback function
    console.log('google profile', profile);
    try {
      const exUser = await User.findOne({
        where: { snsId: profile.id, provider: 'google' },
      });
      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({
          email: profile._json && profile._json.kaccount_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'google',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  })
)};
