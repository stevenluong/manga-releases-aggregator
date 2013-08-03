var nodemailer = require("nodemailer");
var redis = require("redis");
var SourceManager = require("./sourceManager.js");
var Chrono = require("./chrono.js");
var Logger = require("./logger.js");
var Config = require("./config.js");
var config = new Config();
var client = redis.createClient();

var logger = new Logger();
var chrono = new Chrono();

var newReleases = new Array();
var processing = 0;

var main = function (){
	logger.info("start");
	var sourceManager = new SourceManager();
	if(true){
  	sourceManager.getLastReleases(function(releases){
  		logger.info("nb of distinct releases found on sources : "+Object.keys(releases).length);
  		getNewReleases(releases,function(newReleases){
				var newReleasesNb = newReleases.length;
  			logger.info("nb of new releases : "+newReleasesNb);
				if(newReleasesNb>0){
					warnUsers(newReleases,function(){
						logger.info("users warned");
					});
				}else{
					logger.info("no need to warn users");
				}
  			client.quit();
				logger.info("end");
  		});
  	});	
	}
	else{//DEBUG
		sourceManager.tmpGetLastReleases();
	}
}
if(require.main===module){
	main();
}
var warnUsers = function(releases,callback){
	logger.trace("warnUsers");
	if(releases.length>0){
		getUsers(function(users){
				users.forEach(function(user){
					releases.forEach(function(release){
						var manga = release.manga;
						if(user.mangas.indexOf(manga)>-1){
							user.releases.push(release);
						}
					});
				});
				sendMails(users,function(){
					callback();
				});
		});
	}
	else{
		callback();
	}
};

var getUsers = function(callback){
	logger.trace("getUsers");
	var users = new Array();
	var user1 = {
		email:config.user1Email,
		releases: new Array(),
		mangas:["Tower of God","Naruto","Bleach","Noblesse","The Breaker: New Waves","Baby Steps"]};
	var user2 = {
		email:config.user2Email,
		releases: new Array(),
		mangas:["Tower of God","Noblesse"]};
	//var user3 = {
	//	email:"user3",
	//	releases: new Array(),
	//	mangas:["Baby Steps","Tower of God","Noblesse"]};
	logger.debug(user1);
	logger.debug(user2);
	//logger.debug(user3);
	users.push(user1);
	users.push(user2);
	//users.push(user3);
	
	callback(users);
}
var getNewReleases = function(releases,callback){
	logger.trace("getNewReleases");
	releases = filterReleases(releases);
	var newReleases = new Array();
	var newReleaseLength = 0;
	releases.forEach(function(release){
		newReleaseLength++;
		logger.info("release found: "+release.manga+" - "+release.chapter);	
		logger.debug(release);	
		isNewRelease(release,function(isNew){
			newReleaseLength--;
			if(isNew){
				newReleases.push(release);
			}
			if(newReleaseLength==0){
				callback(newReleases);
			}
		});
	});
	return newReleases;
}
var filterReleases = function(releases){
	var filteredReleases = new Array();
	Object.keys(releases).forEach(function(key){
		var release = releases[key];
		if(isSelectedManga(release)){
			filteredReleases.push(release);
		};
	});
	return filteredReleases;
}
var isNewRelease= function(release,callback){
	logger.trace("isNewRelease");
	var manga = release.manga;
	var chapter = release.chapter;
	//console.log(manga);
	//console.log(chapter);
	client.get(manga,function(err,resp){
		//console.log("err:"+err);
		//console.log("resp:"+resp);
		logger.info("Last release in DB : "+manga+" - "+resp);
		if(resp<chapter){
			client.set(manga,chapter,function(err1,resp1){
				callback(true);
				//console.log("err1:"+err1);
				//console.log("resp1:"+resp1);
				logger.info("new release : "+manga+" - "+chapter + " (DB updated)");
			});
		}
		else{
			callback(false);
		}
	});
}
//TODO improve with user manga relationship
var isSelectedManga = function(release){
	//return true;
	if (release.manga == "Noblesse" 
							|| release.manga == "Naruto" 
							|| release.manga == "Tower of God" 
							|| release.manga == "The Breaker: New Waves" 
							|| release.manga == "Baby Steps" 
							|| release.manga == "Bleach") {
		return true;
	}
	else{
		return false;
	}
};
function toHTML(newReleases) {
	logger.trace("printNewReleases");
	var print = "<ul>";
	newReleases.forEach(function(release) {
		print += "<li>" + release.toHTML() + "</li>";
	});
	print += "</ul>";
	return print;
}
var sendMails =function(users,callback) {
	logger.trace("sendMails");
	var smtpTransport = nodemailer.createTransport("SMTP", {
		service : "Gmail",
		auth : {
			user : config.appEmail,
			pass : config.appEmailPassword
		}
	});
	var length = 0;
	users.forEach(function(user){
		length++;
		if(user.releases.length>0){
			var mailOptions = {
				from : config.senderEmail, // sender address
				to : user.email, // list of receivers
				subject : "New Releases !", // Subject line
				html : "<h1>New Releases</h1><b>" + toHTML(user.releases) + "</b>" // html body
			}
			logger.debug(mailOptions);
			smtpTransport.sendMail(mailOptions, function(error, response) {
				if (error) {
					logger.critic(error);
				} else {
					logger.info("Message sent: " + response.message);
				}
				if(length==users.length){
					smtpTransport.close();
					logger.info("SMTP closed");
					callback();
				}
			});
		}else{
			if(length==users.length){
				smtpTransport.close();
				logger.info("SMTP closed");
				callback();
			}
		}
	});
	
}



