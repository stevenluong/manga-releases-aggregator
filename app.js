var nodemailer = require("nodemailer");
var redis = require("redis");
var SourceManager = require("./sourceManager.js");
var Chrono = require("./chrono.js");
var client = redis.createClient();

var chrono = new Chrono();

var newReleases = new Array();
var processing = 0;

var main = function (){
	var sourceManager = new SourceManager();
	if(true){
  	sourceManager.getLastReleases(function(releases){
  		console.log("nb of releases :");
  		console.log(Object.keys(releases).length);
  		getNewReleases(releases,function(newReleases){
  			console.log("new releases :");
  			console.log(newReleases.length);
  			warnUsers(newReleases,function(){
  				console.log("users warned");
  				client.quit();
  
  			});
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
	console.log("-warnUsers");
	//console.log(releases);
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
				console.log(users);
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
	console.log("-getUsers");
	var users = new Array();
	var user1 = {
		email:"User1",
		releases: new Array(),
		mangas:["Tower of God","Naruto","Bleach","Noblesse","The Breaker: New Waves","Baby Steps"]};
	var user2 = {
		email:"user2",
		releases: new Array(),
		mangas:["Tower of God","Noblesse"]};
	//console.log(user);
	users.push(user1);
	//users.push(user2);
	
	callback(users);
}
var getNewReleases = function(releases,callback){
	console.log("-getNewReleases");
	releases = filterReleases(releases);
	var newReleases = new Array();
	var newReleaseLength = 0;
	releases.forEach(function(release){
		newReleaseLength++;
		//console.log("newReleaseLength a:"+newReleaseLength);	
		console.log(release);	
		//TODO Verify in DB
		isNewRelease(release,function(isNew){
			newReleaseLength--;
			//console.log("newReleaseLength b:"+newReleaseLength);	
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
	console.log("-isNewRelease");
	var manga = release.manga;
	var chapter = release.chapter;
	//console.log(manga);
	//console.log(chapter);
	client.get(manga,function(err,resp){
		//console.log("err:"+err);
		//console.log("resp:"+resp);
		if(resp<chapter){
			callback(true);
			client.set(manga,chapter,function(err1,resp1){
				console.log(manga+" "+chapter+" set in DB");
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
	console.log("-printNewReleases");
	var print = "<ul>";
	newReleases.forEach(function(release) {
		print += "<li>" + release.toHTML() + "</li>";
	});
	print += "</ul>";
	return print;
}
var sendMails =function(users,callback) {
	console.log("-sendMails");
	var smtpTransport = nodemailer.createTransport("SMTP", {
		service : "Gmail",
		auth : {
			user : "User",
			pass : ""
		}
	});
	console.log(users);
	users.forEach(function(user){
		var mailOptions = {
			from : "Sender", // sender address
			to : user.email, // list of receivers
			subject : "New Releases !", // Subject line
			html : "<h1>New Releases</h1><b>" + toHTML(user.releases) + "</b>" // html body
		}
		console.log(mailOptions);
		smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				console.log(error);
			} else {
				console.log("Message sent: " + response.message);
			}
		});
		smtpTransport.close();
		callback();
	});
	
}



