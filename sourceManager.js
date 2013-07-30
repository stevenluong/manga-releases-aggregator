var yql = require("yql");
var Release = require("./release.js");
module.exports = function SourceManager() {
	
	var source1 = new Source("www.mangareader.net", "/latest",".updates td a.chaptersrec");
	var tmpSource = new TmpSource();
	this.getLastReleases = function(callback){
		//console.log(sources.length);
	  var length = 0;
		sources.forEach(function(source){
			source.getLastReleases(function(){
				length++;	
				console.log(sources.length +"-"+ length);
				if(length==sources.length){
					callback(releases);
				}
			});
		});
	}
	//this.tmpGetLastReleases = function(){
		//var tmpSource = new TmpSource();
		//tmpSource.getLastReleases(function(){
			//console.log("done");
		//});
	//}
}
var releases = {};
var sources = new Array();
var Source = function(root, path,css){
	this.root = root;
	//path listing all the releases to fetch
	this.url = this.root + path;
	this.css = css;
	this.getLastReleases = function(callback){
		//console.log("-getLastReleases");
		new yql.exec('select * from data.html.cssselect where url="' + this.url + '" and css="'+this.css+'"', function(response) {
			var results = response.query.results.results;
			console.log(root+" results nb : "+results.a.length);	
			var length = 0;
			results.a.forEach(function(a){
				length++;
				//console.log(a);
				var chapter = getChapter(a.content);
				var manga = getManga(a.content);
				var url = root+a.href;
				var release = new Release(manga,chapter,url)
				releases[release.getId()]=release;
				if(results.a.length==length){
					//console.log("getLastRelease Done 1")
					callback();
				}
			});
		});
	}
	sources.push(this);
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
var TmpSource = function(){
	var url= "http://mangafox.me/releases/";
	var css= "#updates li div a"
	this.getLastReleases = function(callback){
		console.log("-getLastReleases");
		new yql.exec('select * from data.html.cssselect where url="' + url + '" and css="'+css+'"', function(response) {
			//console.log(response);	
			//console.log(response.query.results.results);	
			var results = response.query.results.results;	
			console.log("mangafox"+" results nb : "+results.a.length);	
			var length = 0
			results.a.forEach(function(a){
				length++;
				//console.log(a);
				var manga = getManga(a.content);
				var chapter = getChapter(a.content);
				var url = a.href;
				var release = new Release(manga,chapter,url);
				releases[release.getId()]=release;
				//console.log(release);
				//console.log(length);
				//console.log(results.a.length);
				if(length == results.a.length){
					//console.log("getLastRelease Done 2")
					callback();
				}
			});
		});
	}
	sources.push(this);
}
