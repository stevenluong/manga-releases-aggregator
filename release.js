module.exports = function Release(manga, chapter, url) {
	this.manga = manga;
	this.chapter = chapter;
	//this.source = source;
	this.url = url;
	this.getId=function(){
		var id = manga.replace(/\s/g,"").toLowerCase()+chapter;
		return id;
	}
	//console.log(this.getId());
	this.toHTML = function() {
		console.log("-release.print");
		var print = "<a href='"+this.url+"'>"+this.manga+" (" + this.chapter + ")"+"</a>";
		return print;
	}

}


