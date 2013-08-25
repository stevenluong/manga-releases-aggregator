var Logger = require("./logger.js");
var Config = require("./config.js");
var DAL = require("./dal.js");
var Manga = require("./manga.js");
exports.isCleanRelease=function(release){
	if(isNaN(parseInt(release.chapter,10))||release.manga==""){
		return false;
	}else{
		return true;
	}
}
exports.getNewReleases = function(releases,callback){
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
		if(Config.selectedMangas.indexOf(release.mangaId)>-1){
			Logger.dev("selected filtered release",release);
			filteredReleases.push(release);
		};
	});
	return filteredReleases;
}

var isNewRelease= function(release,mangas,callback){
	//Logger.trace("isNewRelease");
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
	//Logger.trace("isNewManga");
	if(Object.keys(mangas).indexOf(mangaName)>-1){
		return false;
	}else{
		Logger.debug('new manga',mangaName);
		mangas[mangaName] = new Manga(mangaName,0,0);
		return true;
	}
}
var getLastChapterNb = function(mangaName,mangas,callback){
    //Logger.trace("getLastChapter");
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
