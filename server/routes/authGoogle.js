const express=require('express')
const router=express.Router()
const passport=require('passport')

const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../model/UserPassport')

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async function(accessToken, refreshToken, profile, done) {
    const newUser = {
      accountId: profile.id,
      displayName: profile.displayName,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      profileImage: profile.photos[0].value,
      provider: 'google'
    }

    try {
      let user = await User.findOne({accountId: profile.id})

      if (user){
        
        done(null, user)
      } else{
        user = await User.create(newUser)
        done(null, user)
      }
      
    } catch (error) {
      console.log(error)
    }

  }
));

router.get('/auth/google',
  passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login-failure',
    successRedirect: '/dashboard'
}));

router.get('login-failure', (req,res)=>{
    res.send('Something went worng...')
});

// presist user data
passport.serializeUser(function(user, done){
    done(null, user.id)
})
// Retrieve user data from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
module.exports=router