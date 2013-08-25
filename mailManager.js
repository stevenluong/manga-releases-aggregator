var nodemailer = require("nodemailer");
var Logger = require("./logger.js");
var Config = require("./config.js");

exports.sendMails =function(users,callback) {
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

function toHTML(newReleases) {
	Logger.trace("printNewReleases");
	var print = "<ul>";
	newReleases.forEach(function(release) {
		print += "<li>" + release.toHTML() + "</li>";
	});
	print += "</ul>";
	return print;
}

