module.exports = function Chrono() {
	this.getCurrentTime=function(){
		return new Date();	
	}
	this.date = new Date();
	this.restart = function() {
		this.date = new Date();
	}
	this.getTime = function() {
		return new Date().getTime() - this.date.getTime();
	}
}
