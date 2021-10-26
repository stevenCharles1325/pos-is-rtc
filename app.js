// var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var json2xls = require('json2xls');
var indexRouter = require('./routes/index');

var app = express();

app.set('view engine', 'jade');


app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(json2xls.middleware);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/', indexRouter);

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
