var Logger = require("./logger.js");

var DAL = require('./DAL.js');

module.exports=function UserManager(){
	this.getUsers=function(callback){
		Logger.trace("getUsers");
		DAL.getUsers(function(users){
			callback(users);
		});
	}

}
