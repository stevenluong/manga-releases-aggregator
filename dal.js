var Logger = require("./logger.js");

var Config = require("./config.js");
var https = require('https');
var User = require("./user.js");

exports.getUsers = function(callback){
		Logger.trace("DAL.getUsers");
		var auth_token = "dM99a8T3XGzDHEbo7mhQ";
		var options = {
			hostname: config.rorHost,
			port: 443,
			path: config.rorRootPath+'/users.json?auth_token='+auth_token,
			method: 'GET',
			headers: {
						'Content-Type': 'application/json',
				}
		};
		Logger.debug(options);
		var req = https.request(options, function(res) {
			Logger.debug("statusCode: ");
			Logger.debug(res.statusCode);
			Logger.debug("headers: ");
			Logger.debug(res.headers);
			var data = '';
			res.on('data', function (chunk){
					data += chunk;
			});
			res.on('end',function(){
					var rorUsers = JSON.parse(data);
					console.log(rorUsers);
					var jsUsers = new Array();
					rorUsers.forEach(function(rorUser){
						console.log(rorUser);
						//Mapping
						//var user = new User(rorUser.email,rorUser.mangas);
						//TODO get mangas
						var user = new User(rorUser.email,["Naruto","Bleach"]);
						jsUsers.push(user);
					});

					callback(jsUsers);
			});
		});
		req.end();
		req.on('error', function(e) {
			console.error(e);
		});
}
