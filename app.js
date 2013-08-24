var nodemailer = require("nodemailer");

var redis = require("redis");
var client = redis.createClient();

var SourceManager = require("./sourceManager.js");
var sourceManager = new SourceManager();

var Chrono = require("./chrono.js");
var chrono = new Chrono();

var Logger = require("./logger.js");
var logger = new Logger();

var Config = require("./config.js");
var config = new Config();

var UserManager = require("./userManager.js");
var userManager = new UserManager();



var newReleases = new Array();
var processing = 0;

var main = function (){
	logger.debug("start");
	if(true){
  	sourceManager.getLastReleases(function(releases){
  		logger.debug("nb of distinct releases found on sources : "+Object.keys(releases).length);
  		getNewReleases(releases,function(newReleases){
				var newReleasesNb = newReleases.length;
  			logger.debug("nb of new releases : "+newReleasesNb);
				if(newReleasesNb>0){
					warnUsers(newReleases,function(){
						logger.info("users warned");
						client.quit();
						logger.debug("end");
					});
				}else{
					logger.debug("no new releases");
					client.quit();
					logger.debug("end");
				}
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
	//TODO Verify this condition ?
	if(releases.length>0){
		userManager.getUsers(function(users){
				users.forEach(function(user){
					logger.debug(user);
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

var getNewReleases = function(releases,callback){
	logger.trace("getNewReleases");
	releases = filterReleases(releases);
	var newReleases = new Array();
	var newReleaseLength = 0;
	var mangas = new Array();
	releases.forEach(function(release){
		newReleaseLength++;
		logger.debug("release found: "+release.manga+" - "+release.chapter);	
		//logger.debug(release);	
		isNewRelease(release,mangas,function(isNew){
			logger.debug(newReleaseLength);	
			newReleaseLength--;
			if(isNew){
				newReleases.push(release);
			}
			if(newReleaseLength==0){
				callback(newReleases);
			}
		});
	});
}
//TODO Delete this filter
var filterReleases = function(releases){
	var filteredReleases = new Array();
	Object.keys(releases).forEach(function(key){
		var release = releases[key];
		if(config.selectedMangas.indexOf(release.manga)>-1){
			filteredReleases.push(release);
		};
	});
	return filteredReleases;
}
var isNewRelease= function(release,mangas,callback){
	logger.trace("isNewRelease");
	var manga = release.manga;
	var chapter = release.chapter;
	//console.log(manga);
	//console.log(chapter);
	getLastChapter(manga,function(lastChapter){
		var foundChapter= parseInt(chapter,10);
		logger.debug("lastChapter : "+lastChapter);
		logger.debug("foundChapter : "+foundChapter);
		if(lastChapter<foundChapter){
      logger.info("New Release : "+manga+" - "+chapter);
			setNewChapter(manga,chapter,function(){
				callback(true);
			});
		}
		else{
			callback(false);
		}
	});
}
var getLastChapter = function(manga,callback){
    logger.trace("getLastChapter");
    logger.debug(manga);
		client.get(manga,function(err,resp){
			logger.debug("Last release in DB : "+manga+" - "+resp);
			callback(parseInt(resp,10));
		});
}
var setNewChapter = function(manga,chapter,callback){
  logger.trace("setNewChapter");
	client.set(manga,chapter,function(err1,resp1){
		logger.info("DB updated : "+manga+" - "+chapter);
		callback();
		//console.log("err1:"+err1);
		//console.log("resp1:"+resp1);
	});
}
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
	var length = 0;
	users.forEach(function(user){
		if(user.releases.length>0){
      var smtpTransport = nodemailer.createTransport("SMTP", {
		    service : "Gmail",
		    auth : {
			    user : config.appEmail,
			    pass : config.appEmailPassword
		    }
	    });
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
				  logger.info(user.email+" warned");
					logger.debug("Message sent: " + response.message);
				}
				length++;
				//logger.info("users length: "+length);
				//logger.debug(length);
				//logger.debug(users.length);
				if(length==users.length){
								smtpTransport.close();
					logger.debug("SMTP closed");
					callback();
				}
			});
		}else{
      length++;
      //logger.info("users length: "+length);
      //logger.debug(length);
      //logger.debug(users.length);
			if(length==users.length){
				callback();
			}
		}
	});
	
}



