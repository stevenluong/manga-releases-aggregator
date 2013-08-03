var Logger = require("./logger.js");
var logger = new Logger();
module.exports = function Release(manga, chapter, url) {
	this.manga = manga;
	this.chapter = chapter;
	//this.source = source;
	this.url = url;
	this.getId=function(){
		//logger.trace("getId");
		var id = manga.replace(/\s/g,"").toLowerCase()+chapter;
		//logger.debug(id);
		return id;
	}
	this.toHTML = function() {
		logger.trace("toHTML");
		var print = "<a href='"+this.url+"'>"+this.manga+" (" + this.chapter + ")"+"</a>";
		return print;
	}

}


