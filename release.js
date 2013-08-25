var Logger = require("./logger.js");
module.exports = function Release(manga, chapter, url) {
	this.manga = manga;
	this.chapter = chapter;
	//this.source = source;
	this.url = url;
	this.mangaId=this.manga.replace(/'|!|,|-|\s|\.|:/g,"").toLowerCase();
	this.id=this.mangaId+this.chapter;
	this.toHTML = function() {
		Logger.trace("toHTML");
		var print = "<a href='"+this.url+"'>"+this.manga+" (" + this.chapter + ")"+"</a>";
		return print;
	}
	//Logger.debug("mangaId",this.getMangaId());
	//Logger.debug("chapter",this.chapter);
	//Logger.debug("Id",this.getId());
	//Logger.debug("release",this);
}


