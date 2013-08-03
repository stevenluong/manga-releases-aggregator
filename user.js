var Logger = require("./logger.js");
var logger = new Logger();
module.exports=function User(email,mangas){
	this.email = email;
	this.mangas = mangas;
	this.releases = new Array();
	logger.debug(this);
}
