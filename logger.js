var Chrono = require("./chrono.js");
var chrono = new Chrono();
var Config = require("./config.js");
var config = new Config();
module.exports=function Logger(){
	var types = config.loggerTypes;
		//debug > info > critic
		if(types.indexOf("debug")>-1){
			this.debug=function(message){
				log(logDate("DEBUG: "));
				console.log(message);
			}
		}else{
			this.debug=function(){}
		}
		if(types.indexOf("info")>-1){
			this.info=function(message){
				log(logDate("INFO: "+message));
			}
		}else{
			this.info=function(){}
		}
		if(types.indexOf("critic")>-1){
			this.critic=function(message){
				log(logDate("CRITIC: "+message));
			}
		}else{
			this.critic=function(){}
		}
		if(types.indexOf("trace")>-1){
			this.trace=function(functionName){
				log(logDate("TRACE: "+functionName+"()"));
			}
		}else{
			this.trace=function(){}
		}
		
}
function logDate(message){
	return chrono.getCurrentTime()+":"+message;
}
function log(message){
	console.log(message);
}
