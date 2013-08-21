var Logger = require("./logger.js");
var logger = new Logger();

var Config = require("./config.js");
var config = new Config();
var https = require('https');

var User = require("./user.js");
var querystring = require('querystring');
module.exports=function UserManager(){
	this.getUsers=function(callback){
		logger.trace("getUsers");
		var auth_token = "";
		var options = {
  hostname: config.rorHost,
  port: 443,
  path: config.rorRootPath+'/users.json?auth_token='+auth_token,
  method: 'GET',
	headers: {
        'Content-Type': 'application/json',
        //'Content-Length': data.length
    }
};
logger.debug(options);
var req = https.request(options, function(res) {
  logger.info("statusCode: ");
	logger.debug(res.statusCode);
  logger.info("headers: ");
	logger.debug(res.headers);

  res.on('data', function(d) {
		logger.debug(d);
    //process.stdout.write(d);
  });
});
req.end();

req.on('error', function(e) {
  console.error(e);
});	
//		https.get(config.rorRootPath+'/users.json', function(res) {
//		console.log("statusCode: ", res.statusCode);
//		console.log("headers: ", res.headers);
//
//		res.on('data', function(d) {
//			process.stdout.write(d);
//			var users = new Array()
//			callback(users);
//		});
//
//	}).on('error', function(e) {
//		console.error(e);
//	});		
	}

}
