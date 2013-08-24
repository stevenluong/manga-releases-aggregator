var Logger = require("./logger.js");
module.exports = function Release(manga, chapter, url) {
	this.manga = manga;
	this.chapter = chapter;
	//this.source = source;
	this.url = url;
	this.getId=function(){
		//Logger.trace("getId");
		var id = manga.replace(/\s/g,"").toLowerCase()+chapter;
		//Logger.debug(id);
		return id;
	}
	this.toHTML = function() {
		Logger.trace("toHTML");
		var print = "<a href='"+this.url+"'>"+this.manga+" (" + this.chapter + ")"+"</a>";
		return print;
	}

}


