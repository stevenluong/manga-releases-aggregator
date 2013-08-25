var Logger = require("./logger.js");
module.exports = function Manga(name, lastChapterNb,id) {
	this.name= name;
	this.lastChapterNb= lastChapterNb;
	this.id= id;
	Logger.debug("new manga",this);
}


