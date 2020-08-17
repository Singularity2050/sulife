//Tool (module)
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');
const helmet = require('helmet');
const hpp = require('hpp');
const redis = require('redis');
const RedisStore = require('connect-redis')(session);
//const flash =require('connect-flash');

dotenv.config(); //.env file crypto file

//module path Define
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  password: process.env.REDIS_PASSWORD,
});
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models');
const passportConfig = require('./passport');
const logger = require('./logger');
const passportGoogleConfig = require('./passport/googleStrategy');

//FrameWork 
const app = express();

//Basic Setting (Globally)
passportConfig(); // 패스포트 설정
passportGoogleConfig(); //구글 패스포트 등록
//app.set('views', path.join(__dirname,'views')); //set views path
app.set('port', process.env.PORT || 8001);//port setting default 8001
app.set('view engine', 'html'); // Engine Setting (set views files pug)
nunjucks.configure('views', {
  express: app,
  watch: true,
});
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
    app.use(helmet());
    app.use(hpp());
  } else {
    app.use(morgan('dev')); //debuger
  }
//Register module on middleware
app.use(express.static(path.join(__dirname,'public'))); //public file
app.use('/img',express.static(path.join(__dirname,'uploads')));
app.use(express.json()); //json available
app.use(express.urlencoded({extended:false}));
app.use(cookieParser(process.env.COOKIE_SECRET)); //cookie
const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ client: redisClient }),
};
if (process.env.NODE_ENV === 'production') {
  sessionOption.proxy = true;
  // sessionOption.cookie.secure = true;
}
//passport module should be after express-session middleware.
app.use(session(sessionOption));
app.use(passport.initialize()); // set req object in the passport module
app.use(passport.session()); // store req.session object in the passport.
//app.use(flash()); // one time cookie available

//Router
app.use('/',pageRouter); // '/' is /routes/page
app.use('/auth',authRouter);
app.use('/post',postRouter);
app.use('/user',userRouter);
//Error
app.use((req, res, next) => {
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.info('hello');
  logger.error(error.message);
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});


app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});
module.exports = app;