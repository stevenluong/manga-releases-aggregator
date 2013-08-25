var nodemailer = require("nodemailer");

var SourceManager = require("./sourceManager.js");
var sourceManager = new SourceManager();

var Chrono = require("./chrono.js");
var chrono = new Chrono();

var Logger = require("./logger.js");

var Config = require("./config.js");

var UserManager = require("./userManager.js");
var userManager = new UserManager();

var DAL = require("./dal.js");

var Manga = require("./manga.js");

var main = function (){
	Logger.trace("main");
	if(true){
  	sourceManager.getLastReleases(function(releases){
  		Logger.debug("nb of distinct releases found on sources",Object.keys(releases).length);
  		getNewReleases(releases,function(newReleases){
				Logger.debug("new releases",newReleases);
				var newReleasesNb = newReleases.length;
  			Logger.debug("nb of new releases",newReleasesNb);
				if(newReleasesNb>0){
					warnUsers(newReleases,function(areWarnedUsers){
						if(areWarnedUsers){
							Logger.info("users warned");
						}else{
							Logger.info("no warned users");
						}
					});
				}else{
					Logger.info("no new releases");
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
	Logger.trace("warnUsers");
	var areWarnedUsers = false;
	if(releases.length>0){
		userManager.getUsers(function(users){
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
					sendMails(users,function(){
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

var getNewReleases = function(releases,callback){
	Logger.trace("getNewReleases");
	releases = filterReleases(releases);
	var newReleases = new Array();
	DAL.getMangas(function(mangas){
		releases.forEach(function(release){
			//Logger.info("release found: "+release.manga+" - "+release.chapter);	
			Logger.debug(release);	
			isNewRelease(release,mangas,function(isNew){
				if(isNew){
					Logger.debug("new release",release);
					newReleases.push(release);
				}
			});
		});
		callback(newReleases);
	});
}
var filterReleases = function(releases){
	var filteredReleases = new Array();
	//Logger.debug("releases",releases);
	releases.forEach(function(release){
		if(Config.selectedMangas.indexOf(release.manga)>-1){
			filteredReleases.push(release);
		};
	});
	return filteredReleases;
}
var isNewRelease= function(release,mangas,callback){
	Logger.trace("isNewRelease");
	var mangaName = release.manga;
	Logger.debug("mangaName",mangaName);
	var chapterNb = release.chapter;
	if(isNewManga(mangas,mangaName)){
		Logger.info("new manga : "+mangaName);
		//TODO set new manga & set new chapter
		DAL.addNewManga(release,function(){
			Logger.info("new manga added");
		});
		callback(true);
	}else
	{
		getLastChapterNb(mangaName,mangas,function(lastChapter){
			var foundChapter= parseInt(chapterNb,10);
			Logger.debug("lastChapter",lastChapter);
			Logger.debug("foundChapter",foundChapter);
			if(lastChapter<foundChapter){
				callback(true);
				Logger.info("New Release : "+mangaName+" - "+chapterNb);
				Logger.debug("manga",mangas[mangaName]);
				var mangaId = mangas[mangaName].id;
				Logger.debug("mangaId",mangaId);
				addNewChapter(release,mangaId,function(){
					Logger.info("new chapter added");
				});
			}
			else{
				callback(false);
				Logger.debug("callback","!isNewChapter");
			}
		});
	}
}
var isNewManga = function(mangas,mangaName){
	Logger.trace("isNewManga");
	if(Object.keys(mangas).indexOf(mangaName)>-1){
		return false;
	}else{
		Logger.dev('new manga',mangaName);
		mangas[mangaName] = new Manga(mangaName,0,0);
		return true;
	}
}
var getLastChapterNb = function(mangaName,mangas,callback){
    Logger.trace("getLastChapter");
    Logger.debug("mangaName",mangaName);
		var lastChapterNb = mangas[mangaName].lastChapterNb;
		Logger.debug("lastChapterNb",lastChapterNb);
		callback(lastChapterNb);
}
var addNewChapter = function(release,mangaId,callback){
  Logger.trace("addNewChapter");
	DAL.addNewChapter(release,mangaId,function(){
		callback();
	});
}
function toHTML(newReleases) {
	Logger.trace("printNewReleases");
	var print = "<ul>";
	newReleases.forEach(function(release) {
		print += "<li>" + release.toHTML() + "</li>";
	});
	print += "</ul>";
	return print;
}
var sendMails =function(users,callback) {
	Logger.trace("sendMails");
	var length = 0;
	Logger.debug("users",users);
	users.forEach(function(user){
		if(user.releases.length>0){
      var smtpTransport = nodemailer.createTransport("SMTP", {
		    service : "Gmail",
		    auth : {
			    user : Config.appEmail,
			    pass : Config.appEmailPassword
		    }
	    });
			var mailOptions = {
				from : Config.senderEmail, // sender address
				to : user.email, // list of receivers
				subject : "New Releases !", // Subject line
				html : "<h1>New Releases</h1><b>" + toHTML(user.releases) + "</b>" // html body
			}
			Logger.debug("mailOptions",mailOptions);
			smtpTransport.sendMail(mailOptions, function(error, response) {
				if (error) {
					Logger.critic(error);
				} else {
				  Logger.info(user.email+" warned");
					Logger.debug("Message sent",response.message);
				}
				length++;
				//Logger.info("users length: "+length);
				//Logger.debug(length);
				//Logger.debug(users.length);
				if(length==users.length){
								smtpTransport.close();
					Logger.debug("SMTP closed");
					callback();
				}
			});
		}else{
      length++;
      //Logger.info("users length: "+length);
      //Logger.debug(length);
      //Logger.debug(users.length);
			if(length==users.length){
				callback();
			}
		}
	});
	
}



