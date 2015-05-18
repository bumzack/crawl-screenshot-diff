'use strict';

const db = require('../lib/db');
const body_parser = require('co-body');

exports.addRoutes = function(app, config, jwt) {
	  
	app.post('/login', function *(next) {
		var body = yield body_parser(this);
		// console.log('POST /login body' + JSON.stringify(body));
		
		yield db.connect();

		var sql = 'SELECT uid FROM ' + config.dbTableNames.user +'  WHERE username = "' + body.username + '" AND deleted = false'; 
		var usernameExist = yield db.query(sql);
 
		if (usernameExist.length == 1) {
			var userId = usernameExist[0].uid; 
			
			console.log('user found with uid = ' + userId + '  -> check password');
			
			sql = 'SELECT uid, firstname, lastname, shortname, color, username, admin, password, accessrights FROM ' + config.dbTableNames.user +'  WHERE uid = ' + userId; 
			var res = yield db.query(sql); 
 			var user = res[0]; 
 			
			console.log('user found with uid = ' + userId + '   password:  ' + user.password);

			if (user.password == body.password) {
				console.log('password is correct');
				this.body = 'authentication successful';
			 	this.status = 200;
			 	
			 	// we dont need and dont want the password in the token
			 	delete user.password; 
				console.log('signing user with secret. USER = ' + JSON.stringify(user));

			 	var token = jwt.sign(user, config.appSecret, {expiresInMinutes: config.token_expiration }); 
			 	console.log('token: ' + token);
			 	
			 	this.body = {token: token, user: user};
			} else {
				console.log('password is NOT correct');
				this.body = 'username/password incorrect - authentication rejected';
			 	this.status = 401;
			}		
		} else {
			this.body = 'not found';
		 	this.status = 401;
		} 
		yield db.disconnect();
	});
}
