  
const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const google = require('./googleStrategy');
const User = require('../models/user');

module.exports = () =>{
  //Cookie store
  passport.serializeUser((user, done) => { //receive user info, and use 'done' method which define in node_module/passport/lib/...
    done(null, user.id); //done(err,store) method pass user.id to 'req.session' method to tell to store user.id.
  });

  //Cookie Loading 
  passport.deserializeUser((id, done) => {//receive user.id from 'passport.session' 
    User.findOne({ 
        where: { id },
        include: [{
          model: User,
          attributes:['id','nick'],
          as: 'Followers',
        }, {
          model: User,
          attributes: ['id','nick'],
          as: 'Followings',
        }],
    })//(SQL)and select that userinfo from the database. userinfo be stored req.user
      .then(user => done(null, user))
      .catch(err => done(err));
  });
  local();
  kakao();
  google();
};
//whole Login process.
//1. receive login request
//2. call passport.authenticate method.
//3. process login strategy ->ex) localStrategy, kakaoStrategy file (Passport module define the term strategy as process of login which is the instruction of how to process course of login )
//4. when login successd, call req.login with userInfo
//5. req.login call passport.serializeUser
//6. store userId to req.session
//7. complete login.

//After Login.
//1. passport.session() middleware call passport.deserializeUeser method from all request
//2. using stored id in the req.session, select user from database.
//3. store selected userInfo to req.user
//4. req.user object available on router.