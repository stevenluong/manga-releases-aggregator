var Logger = require("./logger.js");

var DAL = require('./DAL.js');
var MailManager = require('./mailManager.js');

exports.warnUsers = function(releases,callback){
	Logger.trace("warnUsers");
	var areWarnedUsers = false;
	if(releases.length>0){
		getUsers(function(users){
				users.forEach(function(user){
					Logger.debug("user",user);
					releases.forEach(function(release){
						var manga = release.manga;
						if(user.mangas.indexOf(manga)>-1){
							areWarnedUsers = true;
							user.releases.push(release);
						}
					});
				});
				if(areWarnedUsers){
					MailManager.sendMails(users,function(){
						callback(true);
					});
				}else{
					callback(false);
				}
		});
	}
	else{
		callback();
	}
};

var getUsers=function(callback){
	Logger.trace("getUsers");
	DAL.getUsers(function(users){
		callback(users);
	});
}

