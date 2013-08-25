var Logger = require("./logger.js");
var Source = require("./source.js");

	
exports.getLastReleases = function(callback){
	var sources = new Array();
  var source1 = new Source("http://www.mangareader.net", "/latest",".updates td a.chaptersrec",true);
	var source2 = new Source("http://www.mangahere.com", "/latest/",".manga_updates dl dd a",false);
	var source3 = new Source("http://www.mangabird.com", "",".lastest li a",true);
	var source4 = new Source("http://mangafox.me", "/releases/","#updates li div a",false);
	sources.push(source1);
	sources.push(source2);
	sources.push(source3);
	sources.push(source4);
	var sortedReleases = {};
	var length = 0;
	sources.forEach(function(source){
		source.getLastReleases(sortedReleases,function(){
			length++;	
			if(length==sources.length){
				var releases = new Array();
				Object.keys(sortedReleases).forEach(function(key){
					var release = sortedReleases[key];
					releases.push(release);
				});
				callback(releases);
			}
		});
	});
}
	


