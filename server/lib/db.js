'use strict';

const config = require('../config');
const mysql = require('mysql');
const fs = require('fs');
const util = require('util');

module.exports = function()
{	 
	var db_connection = null; 
	
	function dbCreateConnection() {
		return function(fn){
			db_connection = mysql.createConnection({ 
				user		: config.database.username, 
				database	: config.database.database, 
				password	: config.database.password,
				socketPath	: config.database.socketPath
			});
			//console.log('dbCreatedb_connection ... conn: ' + connection);
			//console.log('dbCreatedb_connection ... conn: ' + util.inspect(connection));
			fn(null, true); 
		}
	}
	
	// wrapper for yieldable
	function dbConnect() {
		return function(fn) {
			db_connection.connect(function(err) {
				if (err) {
					// console.log('yieldable wrapper dbConnect. error connecting: ' + err.stack);
 					var s = 'yieldable wrapper  dbConnect threadId ' + db_connection.threadId + ' error-msg: ' + err.stack;
					fs.appendFile(config.log.db, s);
					return fn(err);
				}
				//console.log('connected as id ' + db_connection.threadId);
				fn(null, true);
			});
		}
	}
	
	// wrapper for yieldable
	function dbEnd() {
		return function(fn) {
 			db_connection.end(function(err) {
				if (err) {
					// console.log('yieldable wrapper dbEnd - error releasing: ' + err.stack);
					var s = 'yieldable wrapper  dbEnd threadId ' + db_connection.threadId + ' error-msg: ' + err.stack; 
					fs.appendFile(config.log.db, s);
					return fn(err);
				}

				// console.log('dbEnd - db_connection released ');
				fn(null, true);
			});
		}
	}
	
	// wrapper for yieldable
	function dbQuery(sql) {
		return function(fn) {
			db_connection.query(sql, function(err, rows) {
				if (err) {
					// console.log('yieldable wrapper  dbQuery error: ' + err.stack);
					var s = 'yieldable wrapper  dbQuery threadId ' + db_connection.threadId + ' error-msg: ' + err.stack; 
					fs.appendFile(config.log.db, s);
					return fn(err);
				}
				//console.log('query succesful');
				fn(null, rows);
			});
		}
	}
	
	function *connect() {
		// console.log('db_connection.connect');
		var res = yield dbCreateConnection();
		//console.log('db_connection.connect - dbCreateConnectio: ' + res);
		res = yield dbConnect(); 
		//console.log('db_connection.connect - dbConnect: ' + res);
		//console.log('db_connection.connect. connected as id ' + db_connection.threadId);
 	}; 
 	
	function *disconnect() {
		// console.log('db_connection.disconnect');
		yield dbEnd();
		return true; 
		// util.inspect(connection));
	}; 
	
	function *query(sql) {
		var start = new Date().getTime(); 
		var res = yield dbQuery(sql);
		var duration = new Date().getTime() - start;		
		var s = 'duration: ' + duration + ' ms\t SQL: ' +sql + '\n';
		fs.appendFile(config.log.db, s);
		return res;
	}
	
	function *beginTransaction() { 
 		// console.log('db_connection.beginTransaction');	
		var sql = 'BEGIN';
		var res = yield query(sql); 
		return res;
	}

	function *commitTransaction() {  
		// console.log('db_connection.commitTransaction');	
		var sql = 'COMMIT';
		var res = yield query(sql); 
		return res; 
	} 

	function *rollbackTransaction() { 
		// console.log('db_connection.rollbackTransaction');	
		var sql = 'ROLLBACK';
		var res = yield query(sql); 
		return res;  
	}  

    return {
    	connect				: connect,
    	disconnect			: disconnect,
    	beginTransaction	: beginTransaction,
    	commitTransaction	: commitTransaction, 
    	rollbackTransaction	: rollbackTransaction,
    	query				: query
    };
}();
