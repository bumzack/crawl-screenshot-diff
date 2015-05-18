'use strict';

const config = require('../config');

var db = require('../lib/db');
var utils = require('../lib/utils');
var urlparser = require('url');

module.exports = function()
{
	function *insertDomain(useruid, name, cronjob) {
		// console.log('"insertDomain"');
		var ts = new Date().getTime();
		yield db.connect();
		yield db.beginTransaction();
		
		var sql = 'INSERT INTO  `' + config.dbTableNames.domains + '` (`name`, `useruid`, `cronjob`, `created`, `deleted`, `updated`) VALUES ';
		sql += '(\"' + name + '\", ' + useruid +',' + cronjob  + ', ' + ts + ', FALSE, 0)'; 
		console.log('"insertDomain"  SQL: ' + sql);
		var res = yield db.query(sql);
		
		yield db.commitTransaction();
		yield db.disconnect();
		
		return res; 
	}
	
	function *getDomains(onlyCronJob, domainuid) {
		// console.log('"getDomains"');
		var ts = new Date().getTime();
		var sql = 'SELECT * FROM `' + config.dbTableNames.domains + '` WHERE deleted = FALSE ';
		if (onlyCronJob) {
			sql += ' AND cronjob = true';
		}
		if (domainuid) {
			sql += ' AND uid = ' + domainuid;
		}
		sql += ' ORDER BY name' ;
		console.log('SQL: ' + sql);
		yield db.connect();
		var res = yield db.query(sql); 
		yield db.disconnect();

		return res; 
	}
	
	function *deleteDomain(uid) {
		// console.log('"deleteDomain"');
		var ts = new Date().getTime();
		var sql = 'UPDATE `' + config.dbTableNames.domains + '` SET DELETED = TRUE, updated = ' + ts + '  ';
		sql += 'WHERE uid = ' +uid;
		// console.log('SQL: ' + sql);
		yield db.connect();
		var res = yield db.query(sql); 
		yield db.disconnect();

		return res; 
	}
	 
    return {
    	insertDomain 	: insertDomain,
    	getDomains		: getDomains,
    	deleteDomain	: deleteDomain 
    };
}();
