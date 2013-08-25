var SourceManager = require("./sourceManager.js");

var Chrono = require("./chrono.js");
var chrono = new Chrono();

var Logger = require("./logger.js");

var UserManager = require("./userManager.js");
var ReleaseManager = require("./releaseManager.js");

var main = function (){
	Logger.trace("main");
	SourceManager.getLastReleases(function(releases){
		Logger.debug("nb of distinct releases found on sources",Object.keys(releases).length);
		ReleaseManager.getNewReleases(releases,function(newReleases){
			Logger.debug("new releases",newReleases);
			var newReleasesNb = newReleases.length;
			Logger.debug("nb of new releases",newReleasesNb);
			if(newReleasesNb>0){
				UserManager.warnUsers(newReleases,function(areWarnedUsers){
					if(areWarnedUsers){
						Logger.info("users warned");
					}else{
						Logger.info("no warned users");
					}
				});
			}else{
				//Logger.info("no new releases");
			}
		});
	});	
}
if(require.main===module){
	main();
}





