var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ip = require("ip");
const requestIp = require('request-ip')
var indexRouter = require('./routes/index');

//prom
const promBundle = require("express-prom-bundle");
const promClient = require("prom-client");


const register = new promClient.Registry()
// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'demoapp-app1'
})
//custom metrics
const http_request_counter = new promClient.Counter({
  name: 'app1_http_request_count',
  help: 'Count of HTTP requests made to my app',
  labelNames: ['method', 'route', 'statusCode', 'localIP','clientIP', 'remotePort'],
});
register.registerMetric(http_request_counter);

const metricsMiddleware = promBundle({
  includeMethod: true, 
  includePath: true, 
  includeStatusCode: true, 
  includeUp: true,
  customLabels: {project_name: 'demoapp', project_type: 'test_metrics_labels'},
  promClient: {
      collectDefaultMetrics: {
        register 
      }
    }
});


var app = express();
//to use req.ip req.ips
app.set('trust proxy', true)

app.use(metricsMiddleware);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

app.set('view engine', 'pug');
app.engine('html', require('ejs').renderFile); //<== add this

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
  console.log("incoming " + req.originalUrl)
  next();
});

app.use(function(req, res, next)
{
    // Increment the HTTP request counter
    var clientIp = requestIp.getClientIp(req)
    var remotePort = req.socket.remotePort;
    http_request_counter.labels({method: req.method, route: req.originalUrl, statusCode: res.statusCode, localIP: ip.address(), clientIP: clientIp, remotePort: remotePort }).inc();
    next();
});
//check request size
/*
app.use(async function(req, res, next) {
  req.bodySize = await new Promise(function(resolve) {
      let requestSize = 0;
      req.on('data', (chunk) => {
          requestSize += Buffer.from(chunk).length;
      });
      req.on('end', () => {
          resolve(requestSize);
      });
  });
  next();
});
*/
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

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
