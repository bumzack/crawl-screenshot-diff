'use strict';

const db = require('../lib/db');
const body_parser = require('co-body');

exports.addRoutes = function(app, config, jwt) {
	  
	app.get('/users', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		// console.log('GET /users  '  );
		
		if (!(this.state.user.admin)) {
			// console.log('user has not ADMIN role -> denied');
			this.body = 'must be admin to access this data';
		 	this.status = 401;
		} else  {
			yield db.connect();
			var sql = 'SELECT uid, firstname, lastname, shortname, color, username, admin FROM ' + config.dbTableNames.user +' WHERE deleted = false'; 
			var res = yield db.query(sql);
			yield db.disconnect();
			
			if (res.length >= 1) { 
	 			// console.log('users found: ' + JSON.stringify(res))
				this.body = res; 
				this.status = 200;  
			}
		}  
	});
	
	app.get('/usernames', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		// console.log('GET /usernames  '  );
		
		if (!(this.state.user.admin)) {
			
			// console.log('user has not ADMIN role -> denied');
			this.body = 'must be admin to access this data';
		 	this.status = 401;
		} else  {
			yield db.connect();
			var sql = 'SELECT username FROM ' + config.dbTableNames.user +''; 
			var res = yield db.query(sql);
			yield db.disconnect();
			
			if (res.length >= 1) { 
	 			// console.log('usernames found: ' + JSON.stringify(res));

				this.body = res; 
				this.status = 200;  
			}
		}  
	});
	 
	// add new user 
	app.post('/user', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		// console.log('POST /user    add new user  '  );
		
		if (!(this.state.user.admin)) { 
			// console.log('user has not ADMIN role -> denied');
			this.body = 'must be admin to access this data';
		 	this.status = 401;
		} else  { 
			var body = yield body_parser(this);
			// console.log('POST /user   json: ' + JSON.stringify(body));

			var ts = new Date().getTime(); 
			yield db.connect();
			// get unique id
			var uid = yield db.getUniqueId(config.databaseTables.user); 
			
			var sql = 'INSERT INTO ' + config.databaseTables.user + ' (`uid`,`username`,`firstname`,`lastname`,`password`,`shortname`,`admin`, `created`) VALUES ';    
			sql += '('+ uid+ ',"' + body.username + '", "' + body.firstname + '", "' + body.lastname + '", "' + body.password + '", "' + body.shortname + '", '+ body.admin + ', '+ ts + ')'
			var res = yield db.query(sql);
 			
			yield db.disconnect();
 			
			// console.log('POST /user    found: ' + JSON.stringify(res));
 
			// this.body = res; 
			this.status = 200;  
		}  
	});
	
	// delete a user with a specific uid (set deleted flag to true and set "updated" field) 
	app.delete('/user/:uid', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		// console.log('DELETE /user/uid  '  );
		
		if (!(this.state.user.admin)) {
			
			// console.log('user has not ADMIN role -> denied');
			this.body = 'must be admin to access this data';
		 	this.status = 401;
		} else  {
			var uid = this.params.uid; 
			// console.log('DELETE /user/uid  uid = ' + uid);
			var ts = new Date().getTime(); 
			yield db.connect();
			var sql = 'UPDATE ' + config.dbTableNames.user +' SET deleted = true, updated = ' + ts + ' WHERE uid = ' + uid;  
			var res = yield db.query(sql);
			yield db.disconnect();
			
 			this.body = 'User deleted successfully.'; 
			this.status = 200; 
		}  
	});
}
