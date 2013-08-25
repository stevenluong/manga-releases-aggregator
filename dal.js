var Logger = require("./logger.js");

var Config = require("./config.js");
var https = require('https');
var http = require('http');
var User = require("./user.js");
var Manga = require("./manga.js");
var querystring = require('querystring');

exports.getUsers = function(callback){
	Logger.trace("DAL.getUsers");
	getData('/users.json',function(rorUsers){
		Logger.debug("rorUsers",rorUsers);
		var jsUsers = new Array();
		rorUsers.forEach(function(rorUser){
			//mapping
			var user = new User(rorUser.email,rorUser.manga_names);
			jsUsers.push(user);
		});
		callback(jsUsers);
	});
}

exports.getMangas = function(callback){
	Logger.trace("DAL.getMangas");
	var mangas = {};
	getData('/mangas.json',function(rorMangas){
		Logger.debug("rorMangas",rorMangas);
		rorMangas.forEach(function(rorManga){
			//mapping
			var jsManga = new Manga(rorManga.display_name,rorManga.last_chapter_nb,rorManga.id);
			mangas[jsManga.name]=jsManga;
		})
		Logger.debug("mangas",mangas);
		callback(mangas);
	});
}
exports.addNewChapter = function(release,mangaId,callback){
	Logger.trace("DAL.addNewChapter");
	var data = querystring.stringify({
		'chapter[link]':release.url,
		'chapter[manga_id]':mangaId,
		'chapter[nb]':release.chapter,
	});
	postData('/chapters',data,function(){
		callback();
	});
}

exports.addNewManga = function(release,callback){
	Logger.trace("DAL.addNewManga");
	var data = querystring.stringify({
		'manga[name]':release.mangaId,
		'manga[display_name]':release.manga
	});
	postData('/mangas',data,function(){
		callback();
	});
}


var postData = function(url,data,callback){
	Logger.trace("postData");
	var options = {
		hostname: Config.rorHost,
		rejectUnauthorized:false,
		port: Config.rorPort,
		path: Config.rorRootPath+url+'?auth_token='+Config.rorAuthToken,
		method: 'POST',
		headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
			}
	};
	Logger.debug("postOptions",options);
	
	Logger.debug("postData",data);
	//https for prod
	var req = https.request(options, function(res) { 
		Logger.debug("statusCode",res.statusCode);
		Logger.debug("headers",res.headers);
		var data = '';
		res.on('data', function (chunk){
				data += chunk;
		});
		res.on('end',function(){
				Logger.debug("postResp",data);
		});
	});
	req.write(data);
	req.end();
	req.on('error', function(e) {
		console.error(e);
	});
	callback();
}
var getData=function(url,callback){
	var options = {
		hostname: Config.rorHost,
		rejectUnauthorized:false,
		port: Config.rorPort,
		path: Config.rorRootPath+url+'?auth_token='+Config.rorAuthToken,
		method: 'GET',
		headers: {
					'Content-Type': 'application/json',
			}
	};
	Logger.debug("getOptions",options);
	//https for prod
	var req = https.request(options, function(res) { 
		Logger.debug("statusCode",res.statusCode);
		Logger.debug("headers",res.headers);
		var data = '';
		res.on('data', function (chunk){
				data += chunk;
		});
		res.on('end',function(){
				Logger.debug("getResp",data);
				callback(JSON.parse(data));
		});
	});
	req.end();
	req.on('error', function(e) {
		console.error(e);
	});
}
