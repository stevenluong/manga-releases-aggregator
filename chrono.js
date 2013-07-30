module.exports = function Chrono() {
	this.date = new Date();
	this.restart = function() {
		this.date = new Date();
	}
	this.getTime = function() {
		return new Date().getTime() - this.date.getTime();
	}
}
