var Release = require("./release.js");
var ReleaseManager = require("./releaseManager.js");
var yql = require("yql");
var Logger = require("./logger.js");
module.exports = function Source(root, relativeUrl,css,isRelativePath){
	this.root = root;
	//path listing all the releases to fetch
	this.indexUrl = this.root + relativeUrl;
	this.css = css;
	this.getLastReleases = function(sortedReleases,callback){
		Logger.trace("getLastReleases");
		new yql.exec('select * from data.html.cssselect where url="' + this.indexUrl + '" and css="'+this.css+'"', function(response) {
			if(response==null||response.query==null||response.query.results==null){
				Logger.debug("http request error",root);
				return false;
			}
			var results = response.query.results.results;
			if(results==null){
				Logger.debug("no result",root);
				Logger.debug("css",css);
				Logger.debug("results",results);
				return false;
			}
			Logger.debug("results found on "+root,results.a.length);
			var length = 0;
			results.a.forEach(function(a){
				length++;
				//Logger.debug(a);
				var chapter = getChapter(a.content);
				var manga = getManga(a.content);
				var url = isRelativePath==true?root+a.href:a.href;
				var release = new Release(manga,chapter,url)
				//filter/delete/clean release
				if(ReleaseManager.isCleanRelease(release)){
					sortedReleases[release.id]=release;
				}
				else{
					//Logger.debug("not clean release",release);
				}
				//console.log(release);
				if(results.a.length==length){
					//console.log("getLastRelease Done 1")
					callback();
				}
			});
		});
	}
	Logger.debug("new source",this);
}
var getManga = function(description){
	var split = description.split(' ');
	var manga = "";
	split.pop();
	split.forEach(function(s, index) {
		if (index == split.length - 1) {
			manga += s;
		} else {
			manga += s + " ";
		}
	});
	return manga;
}
var getChapter = function(description){
	var split = description.split(' ');
	var chapter = split[split.length-1] ;
	return chapter;
}


