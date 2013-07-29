var YQL = require("yql");
var nodemailer = require("nodemailer");
var redis = require("redis");
var client = redis.createClient();
var source = new Source("www.mangareader.net", "/latest",".updates td a.chaptersrec");
var chrono = new Chrono();

var newReleases = new Array();
var processing = 0;
checkNewReleases(function() {
	console.log(processing);
	if (processing == 1) {
		sendMail();
	}
	processing--;
});

function printNewReleases(newReleases) {
	console.log("-printNewReleases");
	var print = "<ul>";
	newReleases.forEach(function(release) {
		print += "<li>" + release.print() + "</li>";
	});
	print += "</ul>";
	return print;
}

function sendMail() {
	console.log("-sendMail");
	var smtpTransport = nodemailer.createTransport("SMTP", {
		service : "Gmail",
		auth : {
			user : "",
			pass : ""
		}
	});
	var mailOptions = {
		from : "Slapps Server <slapps.paris@gmail.com>", // sender address
		to : "ste.luong@gmail.com", // list of receivers
		subject : "New Releases !", // Subject line
		html : "<h1>New Releases</h1><b>" + printNewReleases(newReleases) + "</b>" // html body
	}

	if (false) {
		smtpTransport.sendMail(mailOptions, function(error, response) {
			if (error) {
				console.log(error);
			} else {
				console.log("Message sent: " + response.message);
			}
		});
	}
	console.log(mailOptions);
	smtpTransport.close();
}

function updateDB(release, callback) {
	console.log("-updateDB");
	//console.log(release);
	client.set(release.manga, release.chapter, function(err, resp) {
		//console.log("err:"+err);
		//console.log("resp:"+resp);
		callback();
	});
}

function getLastRelease(releaseName, callback) {
	console.log("-getLastRelease");
	//console.log("releaseName:"+releaseName);
	client.get(releaseName, function(err, resp) {
		//console.log("error:" + err)
		console.log("Stored release of " + releaseName + ":" + resp);
		callback(resp);
	});
}

function checkNewReleases(callback) {
	console.log("-checkNewReleases");
	new YQL.exec('select * from data.html.cssselect where url="' + source.url + '" and css="'+source.css+'"', function(response) {
		if (false) {
			var chapter = 10;
			client.set("Noblesse", chapter, function(err, reply) {
				console.log("Noblesse : " + chapter);
			});
			client.set("Naruto", chapter, function(err, reply) {
				console.log("Naruto : " + chapter);
			});
		}
		//console.log("end parse : "+chrono.getTime());

		if (response.query == null) {
			console.log("query null");
			return false;
		}
		if (response.query.results == null) {
			console.log("results null");
			return false;
		}
		var results = response.query.results.results;
		var length = 0;
		results.a.forEach(function(a) {
			length++;
			//console.log(length);
			var release = new Release(a, source);
			//console.log(release)
			//console.log(release.manga);
			if (release.manga == "Noblesse" 
							|| release.manga == "Naruto" 
							|| release.manga == "Tower of God" 
							|| release.manga == "The Breaker: New Waves" 
							|| release.manga == "Baby Steps" 
							|| release.manga == "Bleach") {
				
				console.log(release)
				//console.log("Noblesse release retrieved");
				//console.log(release);
				getLastRelease(release.manga, function(n) {
					//console.log("n:"+n)
					if (release.chapter > n) {
						processing++;
						newReleases.push(release);
						updateDB(release, function() {
							//getLastRelease(release.manga, function() {
							//});
							if (length == results.a.length) {
								callback();
							}
						});
					}
				});
			}
			//console.log("actual length:" + length);

		});
		//console.log("max length" + results.a.length);

	});
}

function Chrono() {
	this.date = new Date();
	this.restart = function() {
		this.date = new Date();
	}
	this.getTime = function() {
		return new Date().getTime() - this.date.getTime();
	}
}

function Release(a, source) {
	this.manga = getManga(a.content);
	this.chapter = getChapter(a.content);
	this.source = source;
	this.url = this.source.root + a.href;
	this.print = function() {
		console.log("-release.print");
		var print = "<a href='"+this.url+"'>"+this.manga+"(" + this.chapter + ")"+"</a>";
		//var print = "manga:" + this.manga + " chapter:" + this.chapter + " url:" + this.url + ";";
		console.log(print);
		return print;
	}
	//console.log(this);
	function getChapter(content) {
		var split = content.split(' ');
		var chapter = split[split.length - 1];
		//console.log("release:"+release);
		return chapter;
	}

	function getManga(content) {
		var split = content.split(' ');
		split.pop();
		var manga = "";
		split.forEach(function(s, index) {
			//console.log(s);
			//console.log(index);
			if (index == split.length - 1) {
				manga += s;
			} else {
				manga += s + " ";
			}
		});
		//console.log("name:"+name);
		return manga;
	}

}

function Source(root, path,css) {
	this.root = root;
	//path listing all the releases to fetch
	this.url = this.root + path;
	this.css = css;
	//console.log(this);
}
