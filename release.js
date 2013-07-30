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
//	this.print = function() {
//		console.log("-release.print");
//		var print = "<a href='"+this.url+"'>"+this.manga+"(" + this.chapter + ")"+"</a>";
//		//var print = "manga:" + this.manga + " chapter:" + this.chapter + " url:" + this.url + ";";
//		console.log(print);
//		return print;
//	}
	//console.log(this);
//	function getChapter(content) {
//		var split = content.split(' ');
//		var chapter = split[split.length - 1];
//		//console.log("release:"+release);
//		return chapter;
//	}
//
//	function getManga(content) {
//		var split = content.split(' ');
//		split.pop();
//		var manga = "";
//				//console.log("name:"+name);
//		return manga;
//	}

}


