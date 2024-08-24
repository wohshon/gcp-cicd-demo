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
  res.render('index.html', { msg: process.env.HEADER_MSG ||" CICD test-v1.0" 
  ,app_version: version});
//*/
});

//for demo services
// invoke directly via 
// curl -XPOST -H'Content-type: application/json' -d '{ "email": "test@example.com", "txt": "test"}' http://localhost:8080/submitForm
router.post('/submitForm', function(req, res, next){

  //make 2 async call to app2 and app3 
  const payload = req.body;
  console.log(payload);
  senddata(payload)
  .then(resp=> {
    //console.log((resp[0]))
    finalResponse = [];
    resp.forEach(
      (result) => {
        console.log(result.status);
        if (result.status=='fulfilled') {
          console.log(result.value.data);
          finalResponse.push(result.value.data)  
        } else {
          console.log(Object.keys(result.reason));

          finalResponse.push({'error': result.reason.cause}) 
        }
      }
    );    
    res.status(200).send(finalResponse);

  })
  .catch(err => {
    console.log('Error: ', err.message);
    res.status(500).send(err);
  }); 
})

async function senddata(payload) {
  // resolve if all calls resolves else will 
  //const [prom1, prom2] = await Promise.all([app2(payload), app3(payload)])
  return await Promise.allSettled([app2(payload), app3(payload)])
}
//end
//async call app2
async function app2(payload) {
  let baseUrl=process.env.DEMO_BACKEND_URL || 'http://localhost:8081/app2/submitData';
  const url = baseUrl;
  return axios.post(url, payload)

 
}

//async call app3
async function app3(payload) {
  let baseUrl=process.env.DEMO_BACKEND_URL || 'http://localhost:8082/app3/message';
  const url = baseUrl;
  p = {};
  p.message = payload.txt;
  return axios.post(url, p)
 
}

/*
router.get('/', function(req, res, next) {
  res.status(200).send("app1-ok")
});
*/

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

// call app2 - GET 
//curl -X GET -H "Content-type: application/json" localhost:8080/callapp2/hello

router.get('/callapp2/:message', function(req, res, next){

  var message = req.params.message;
  console.log("Message: %s",message);
  //pass header to downstream
  const h = req.headers;
  console.log(h);
  var hdr = {}
  //testing , just check for end-user
  console.log(h["end-user"])
  if (h["end-user"]) {
    console.log('found header')
    hdr["end-user"] = h["end-user"];
  }
  //calling app2
  let baseUrl=process.env.APP2_URL || 'http://localhost:8081/app2'
  const url = baseUrl+'/'+message;
  console.log('**********************URL '+url)
  //axios.get(url)
  axios.get(url,{ headers: hdr })
  .then(resp => {
    const headerDate = resp.headers && resp.headers.date ? resp.headers.date : 'no response date';
    console.log('Status Code:', resp.status);
    console.log('Date in Response header:', headerDate);
    const data = resp.data;
    console.log(data);
    res.status(200).send(data);
  })
  .catch(err => {
    console.log('Error calling '+url+': ', err.message);
  }); 

});

//call app2 POST
//curl -X POST -H "Content-type: application/json" -d '{"message":"hello"}' localhost:8080/callapp2

router.post('/callapp2', function(req, res, next){
  
  const payload = req.body;
  console.log(payload);
  let baseUrl=process.env.APP2_URL || 'http://localhost:8081/app2'
  const url = baseUrl;

  axios.post(url, payload)
  .then(resp => {
    const headerDate = resp.headers && resp.headers.date ? resp.headers.date : 'no response date';
    console.log('Status Code:', resp.status);
    console.log('Date in Response header:', headerDate);

    const data = resp.data;
    console.log(data);
    res.status(200).send(data);
  })
  .catch(err => {
    console.log('Error: ', err.message);
  });  

});

// call app3 - GET 
//curl -X GET -H "Content-type: application/json" localhost:8080/callapp3/hello

router.get('/callapp3/:message', function(req, res, next){
  var message = req.params.message;
  console.log("Message: %s",message);
  //pass header to downstream
  const h = req.headers;
  console.log(h);  
  //calling app3
  let baseUrl=process.env.APP3_URL || 'http://localhost:8082/app3'
  const url = baseUrl+'/'+message;
  console.log('**********************URL '+url)
  axios.get(url)
  //axios.get(url,{ headers: h })
  .then(resp => {
    const headerDate = resp.headers && resp.headers.date ? resp.headers.date : 'no response date';
    console.log('Status Code:', resp.status);
    console.log('Date in Response header:', headerDate);
    const data = resp.data;
    console.log(data);
    res.status(200).send(data);
  })
  .catch(err => {
    console.log('Error calling '+url+': ', err.message);
  }); 
});

function getHeaders(req) {
  const h = req.headers;
  console.log(h);
  return h;
}

module.exports = router;
