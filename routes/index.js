var express = require('express');
var router = express.Router();
const axios = require('axios');
const requestIp = require('request-ip')

const version = process.env.VERSION || 'v1';

//***test */
const {GoogleAuth} = require('google-auth-library');

const {google} = require('googleapis');



// GET home page. 
//curl -X GET localhost:8080
router.get('/', function(req, res, next) {
  res.render('index.html', { msg: process.env.HEADER_MSG ||"CICD on Google Cloud" 
  ,app_version: version});
//*/
});


//curl -X GET localhost:8080
router.get('/app1/test', function(req, res, next) {
  res.status(200).send('ok-app1')
});
router.get('/app1/requestinfo', function(req, res, next) {
  let headers = getHeaders(req);
  
  //console.log(Object.keys(headers))
  let headerStr;
  console.log("showing headers: ");
  Object.keys(headers).map(hdr => {
    console.log(hdr+":"+headers[hdr]);
    headerStr+=hdr+":"+headers[hdr]+'\n';
  });
  console.log("test remote ip:");
  console.log(`X-Forwarded-For: ${headers['X-Forwarded-For']}`);
  console.log(`req.socket.remoteAddress  :  ${req.socket.remoteAddress}`);
  console.log(`req.socket.remotePort: ${req.socket.remotePort}` );

  //console.log(`req.connection.socket.remoteAddress:  ${req.connection.socket.remoteAddress}`);
  //console.log(`req.info.remoteAddress:  ${req.info.remoteAddress}`);
  var clientIp = requestIp.getClientIp(req)
  console.log(`clientIP: ${clientIp}.`)

  let requestInfo = {};
  requestInfo.clientIp = clientIp;
  requestInfo.reqIp = req.ip;
  requestInfo.reqIps = req.ips;
  requestInfo.xForwardedFor = headers['X-Forwarded-For'];
  requestInfo.remoteAddress = req.socket.remoteAddress;
  requestInfo.remotePort = req.socket.remotePort;
  requestInfo.remoteAddress=req.socket.remoteAddress;
  requestInfo.headers = headers;

  res.status(200).send(requestInfo)

});


function getHeaders(req) {
  const h = req.headers;
  console.log(h);
  return h;
}

module.exports = router;
