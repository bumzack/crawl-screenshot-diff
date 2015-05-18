'use strict';

const config = require('../config');

var db = require('../lib/db');
var utils = require('../lib/utils');
var co = require('co');
var fs = require('fs');
var mysql = require('mysql');
var util  = require('util');

var urlparser = require('url');

module.exports = function()
{ 
	function *getWebsites (domainuid) {  
		var res;
		try {
			console.log('"getWebsites"');
	 		 console.log('"getWebsites" - domainuid: '+domainuid);

			var ts = new Date().getTime();
	 		
			var sql = 	'SELECT ' + config.dbTableNames.jobs+'.jobtype, ' + config.dbTableNames.jobs+'.uid, ' + config.dbTableNames.jobs+'.description , '+ 
						config.dbTableNames.jobs+'.status , ' + config.dbTableNames.jobs+'.domainuid , ' +
						config.dbTableNames.domains+'.name FROM ' + config.dbTableNames.jobs+' ' +
						'LEFT JOIN ' + config.dbTableNames.domains+' ON ( ' + config.dbTableNames.jobs+'.domainuid = ' + config.dbTableNames.domains+'.uid)' +
						'WHERE (' + config.dbTableNames.jobs+'.deleted = false   OR ' + config.dbTableNames.jobs+'.deleted IS NULL)  ' + 
					// 	'AND jobtype = \"' + config.jobtypes.crawljob + '\"  ' + 
						'ORDER BY ' + config.dbTableNames.jobs+'.created DESC';
			
			if (domainuid !== undefined) {
				sql += ' AND '+ config.dbTableNames.jobs+'.domainuid = ' +  domainuid;
			}
			
			console.log('"getWebsites"   SQL: ' + sql);
			yield db.connect();
			res = yield db.query(sql); 
			yield db.disconnect();
			
		} catch(err) {
			console.log('"getWebsites"   something went wrong - err : ' + err);
			console.log('"getWebsites"   something went wrong - err.stack : ' + err.stack); 
		} 
		 
		return res; 
	}
	
	function *getPages (jobuid, maxNumber) {  
 		console.log('"getPages"');
 		var res;
		try {
			var ts = new Date().getTime();
 		
			var sql =	'SELECT uid, path, screenshootloadtime, imgdirectory, imgfilename FROM ' + config.dbTableNames.pages + ' ' + 
						'WHERE jobuid = ' + jobuid + ' AND (deleted = false OR deleted IS NULL) ' +
						'ORDER BY path ' +
						'LIMIT ' + maxNumber; 
	 		
			console.log('"getPages" SQL: ' + sql);
			yield db.connect();
			var res = yield db.query(sql); 
			yield db.disconnect();
			
		} catch(err) {
			console.log('"456getPages"   something went wrong - err : ' + err);
			console.log('"4456getPages"   something went wrong - err.stack : ' + err.stack); 
		} 
		return res; 
	}
	
	function *getComparisons (jobuid, maxNumber) {  
 		console.log('"getComparisons"');
		var ts = new Date().getTime();
 	 
		var sql =	'SELECT ' + config.dbTableNames.screenshotcomparison + '.uid, ' + config.dbTableNames.screenshotcomparison + '.jobuid, ' + config.dbTableNames.screenshotcomparison + '.path, img1uid, img2uid, ';
		sql 	+= 	'imgdirectoryallinone, imgfilenameallinone, percDiff, ';
		sql 	+= 	config.dbTableNames.screenshotcomparison + '.imgdirectory, ' + config.dbTableNames.screenshotcomparison + '.imgfilename,  ';
		sql 	+= 	'pages1.imgdirectory as imgdirectory1, pages1.imgfilename as imgfilename1,  ';
		sql 	+= 	'pages2.imgdirectory as imgdirectory2, pages2.imgfilename as imgfilename2  ';
		sql 	+= 	'FROM ' + config.dbTableNames.screenshotcomparison + ' 			 ';
		sql 	+= 	'LEFT JOIN ' + config.dbTableNames.pages + ' AS pages1 ON (pages1.uid = img1uid) ';
		sql 	+= 	'LEFT JOIN ' + config.dbTableNames.pages + ' AS pages2 ON (pages2.uid = img2uid)  ';
		sql 	+= 	'WHERE ' + config.dbTableNames.screenshotcomparison + '.jobuid = ' + jobuid + ' AND  ';
		sql		+=  '(' + config.dbTableNames.screenshotcomparison + '.deleted = false OR '  + config.dbTableNames.screenshotcomparison + '.deleted IS NULL) ';
		sql		+=  'ORDER BY path ';
		sql 	+=  'LIMIT ' + maxNumber;
		
		console.log('"getComparisons" SQL: ' + sql);
		yield db.connect();
		var res = yield db.query(sql); 
		// console.log('"getComparisons" - res: ' + JSON.stringify(res, null, 4));

		yield db.disconnect();
		 
		return res; 
	}
	
    return {
    	getWebsites : getWebsites,
    	getPages	: getPages,
    	getComparisons : getComparisons
    };
}();
