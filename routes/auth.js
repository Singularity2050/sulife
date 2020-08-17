const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');
const { sequelize } = require('../models');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);// encrypt password 12 time
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

//Login 
router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => { //middleware in the middleware.note local -> passport.authenticate('local',func)
    if (authError) {   //If there is first element authError, then it's error
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => { //req.login call passport.serializeUser. req.login give user object to serializeUser.
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});
//Logout
router.get('/logout', isLoggedIn, (req, res) => { //req.logout method  remove req.user object, 
  console.log(req.user.dataValues.snsId);
  if(req.user.dataValues.provider === 'kakao'){
    req.logout();
    req.session.destroy(); //req.session.destroy delete req.session object 
    res.redirect('/');
  }else{
    res.clearCookie('connect.sid');
    req.logout();
    req.session.destroy(); //req.session.destroy delete req.session object 
    res.redirect('/');
 }
});
//Google Login
router.get('/google',passport.authenticate('google',{
  scope:['profile']
}));
//Google Login fail
router.get('/google/redirect',passport.authenticate('google',{
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

//Kakao Login
router.get('/kakao', passport.authenticate("kakao")); //call back function doesn't be needed
//Kakao Logout

//Kakao Login fail
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;