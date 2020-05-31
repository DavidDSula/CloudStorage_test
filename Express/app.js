var createError  = require('http-errors');
var express      = require('express');
var path         = require('path');
var cookieParser = require('cookie-parser');
var session      = require('express-session');
var FileStore    = require('session-file-store')(session);
var logger       = require('morgan');
var hpp          = require('hpp');
var contentLength = require('express-content-length-validator');


var storage      = require('./routes/storage');
var usersRouter  = require('./routes/users');


let sessionStore = new FileStore({})

var app = express();
app.use(contentLength.validateMax({max: 20000000, status: 400, message: "stop it!"}));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(hpp());
app.use(cookieParser(process.env.COOKY_SECRET));
app.use(session({
                  secret: process.env.SESSION_SECRET_STR,
                  store : sessionStore,
                  resave: true,
                  saveUninitialized: false,
                  cookie: { maxAge: 3600000, secure: false, httpOnly: false, SameSite: 'none' }

                }));
app.use(express.static(path.join(__dirname, 'public')));

// Enable CORS
const allowedOrigins = process.env.ALLOWED_DOMAINS.split(',')
app.use( function(req, res, next)
  {

    if ( allowedOrigins.indexOf(req.get('origin')) > -1 )
      {

        res.header("Access-Control-Allow-Origin",  req.headers.origin ); // update to match the domain you will make the request from
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Range");
        res.header('Access-Control-Expose-Headers', 'Content-Length');
      }

    res.header('Access-Control-Allow-Credentials', true);
    res.header("preflightContinue", true);
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");


    if ( req.method === 'OPTIONS')
      {
        res.status(204).end();
      }
    else
      next();
  });


app.use('/users', usersRouter);
app.use('/', storage);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if(err.status == 411)
    return res.status(411).json( { msg: err.text });

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
