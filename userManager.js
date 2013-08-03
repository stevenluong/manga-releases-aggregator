var Logger = require("./logger.js");
var logger = new Logger();

var Config = require("./config.js");
var config = new Config();

var User = require("./user.js");

module.exports=function UserManager(){
	this.getUsers=function(callback){
		logger.trace("getUsers");
		var users = new Array();
		var user1 = new User(config.user1Email,config.selectedMangas);
		var user2 = new User(config.user2Email,["Tower of God","Noblesse"]);
		//var user3 = {
		//	email:"user3",
		//	releases: new Array(),
		//	mangas:["Baby Steps","Tower of God","Noblesse"]};
		users.push(user1);
		users.push(user2);
		//users.push(user3);
		
		callback(users);
	}

}
