var Logger = require("./logger.js");
module.exports=function User(email,mangas){
	this.email = email;
	this.mangas = mangas;
	this.releases = new Array();
	Logger.debug(this);
}
