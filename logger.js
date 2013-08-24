var Chrono = require("./chrono.js");
var chrono = new Chrono();
var Config = require("./config.js");
var types = Config.loggerTypes;

exports.debug = function(message){
	if(types.indexOf("debug")>-1){
		log(logDate("DEBUG: "));
		console.log(message);
	}
}
exports.info = function(message){
	if(types.indexOf("info")>-1){
		log(logDate("INFO: "));
		console.log(message);
	}
}
exports.critic = function(message){
	if(types.indexOf("critic")>-1){
		log(logDate("CRITIC: "));
		console.log(message);
	}
}
exports.trace = function(functionName){
	if(types.indexOf("trace")>-1){
		log(logDate("TRACE: "+functionName+"()"));
	}
}
function logDate(message){
	return chrono.getCurrentTime()+":"+message;
}
function log(message){
	console.log(message);
}
