var Logger = require("./logger.js");
var logger = new Logger();

var DAL = require('./DAL.js');

module.exports=function UserManager(){
	this.getUsers=function(callback){
		logger.trace("getUsers");
		DAL.getUsers(function(users){
			callback(users);
		});
	}

}
