'use strict';

const config = require('../config');

var db = require('../lib/db');
var utils = require('../lib/utils');
var seo = require('../lib/seo');

var co = require('co');
var fs = require('fs');
var mysql = require('mysql');
var util  = require('util');
var path  = require('path');

var urlparser = require('url');

var logger = require('../lib/logger');

module.exports = function()
{
	function *getlast2CrawlJobs(domainuid) {
		var sql; 
		var res;
		try {
			yield db.connect();
 		
			sql =  'SELECT  uid FROM `' + config.dbTableNames.jobs + '`  ';
			sql += 'WHERE domainuid  = ' + domainuid + ' ';
			sql += 'AND jobtype = ' + mysql.escape(config.jobtypes.crawljob) +'  AND ';
			sql += 'status = ' + mysql.escape(config.jobstatus.finished)  + '  ';
			sql += 'ORDER BY created DESC ';
			sql += 'LIMIT 2';

			console.log ('"getlast2CrawlJobs" - sql:  ' +sql);
			res = yield db.query(sql);
			
			yield db.disconnect();
		}
		catch (error){
			console.log ('"getlast2CrawlJobs" - error :  ' +error);
			console.log ('"getlast2CrawlJobs" - error.stack :  ' +error.stack); 
		}
		return yield Promise.resolve(res);
	}
	
	function *saveScreenshotComparisonData(screenshotComparisonData, options) {
		var sql  = 'INSERT INTO  `' + config.dbTableNames.screenshotcomparison + '` ';
		sql  += '(`jobuid`, `domainuid`, `useruid`, `path`, `img1uid`, `img2uid`, `imgdirectory`, `imgfilename`, ' +	
				'`imgdirectoryallinone`, `imgfilenameallinone`, `width`, `height`, `countPixel`, `percDiff`, `created`, `deleted`, `updated`) VALUES ';
 		
		var res; 
		var sqlArray = [];
		var s; 
		var entry;  
		
		var i; 
		for (i = 0; i < screenshotComparisonData.length; i++) {
			// page data
			entry = screenshotComparisonData[i];
			console.log('"jobs.screenshotComparisonData", entry: ' + JSON.stringify(entry, null, 4));
			s = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', ' + mysql.escape(entry.path) +  ' , ';
			
			if (entry.uid1 != null) {
				s += entry.uid1; 
			} else {
				s += 'NULL';
			}
			s += ',';
			if (entry.uid2 != null) {
				s += entry.uid2; 
			} else {
				s += 'NULL';
			}
			s += ',';
			if (entry.imgfilename != null) {
				s += ' ' + mysql.escape(entry.imgdirectory) + ', ' + mysql.escape(entry.imgfilename) + ' '; 
			} else {
				s += 'NULL, NULL';
			}
			s += ',';
			if (entry.imgfilenameallinone != null) {
				s += ' ' + mysql.escape(entry.imgdirectoryallinone) + ', ' + mysql.escape(entry.imgfilenameallinone)+ ' '; 
			} else {
				s += 'NULL, NULL';
			}
			s += ',';
			if (entry.width != null) {
				s += entry.width + ', ' + entry.height + ', '+ entry.countPixel + ', ' + entry.percDiff ; 
			} else {
				s += 'NULL, NULL, NULL, NULL';
			}
			s += ',' + options.ts + ', FALSE, 0)';
 			sqlArray.push(s);
		}
		
		yield db.connect();
		yield db.beginTransaction();
		if (sqlArray.length > 0) {
			sql += sqlArray.join(',');
			console.log('"jobs.screenshotComparisonData", sql: ' + sql);

 			res = yield db.query(sql);
 		}
		 
 		yield db.commitTransaction();
 		yield db.disconnect();  
	  	return true;
	}
				
	function *saveScreenshotData(screenshotData) {
		var sqlResponse;
		var entry = {};
		var sql;
		
		try {
			yield db.connect();
			yield db.beginTransaction();
			
			for (var i = 0; i < screenshotData.length; i++) {
				entry = screenshotData[i];
				sql =  'UPDATE `' + config.dbTableNames.pages + '` SET ';
				sql += 'screenshootloadtime = ' + entry.loadtime + ', ';
				sql += 'imgdirectory = ' + mysql.escape(entry.directory) +' , ';
				sql += 'imgfilename = ' +mysql.escape( entry.filename) +'  ';
				sql += 'WHERE uid  = ' + entry.pageuid  ;
				
				console.log ('"saveScreenshotData" - sql:  ' +sql);
				var res = yield db.query(sql);
			} 
			yield db.commitTransaction();
			yield db.disconnect();  
		}
		catch (err) {
 			console.log('"saveScreenshotData" -  there went something wrong:  err: ' + err);
			console.log('"saveScreenshotData" - there went something wrong:  err.stack: ' + err.stack);
			
 			logger.logJob('lib/jobs.js  (saveScreenshotData): ', 'ABORTED', 'MYSQL ERROR', err.stack);
			logger.logError('lib/jobs.js  (saveScreenshotData): ', 'MYSQL ERROR', sql, null);

			// try to disconnect
			yield db.disconnect();  

			return yield Promise.resolve(false);
		}
		return yield Promise.resolve(true)
	}
	
	function *saveCurlDataPages(visitedPages, options) {
		
 		logger.logJob('lib/jobs.js  (saveCurlDataPages): ', 'STARTED', '', options);

		var sql  = 'INSERT INTO  `' + config.dbTableNames.pages + '` ';
		sql		+= '(`jobuid`, `domainuid`, `useruid`, `path`, `created`, `htmlcode`,  `response`) VALUES ';
 
		var res; 
		var sqlArray = [];
		var s;  
		var entry;  
		
		var j; 
		var i; 
			
		for (i = 0; i < visitedPages.length; i++) {				
			// page data
			entry = visitedPages[i];
			if (entry.response == null) {
				console.log('"saveCurlDataPages"  --- entry.response IS NULL -> why?! : ' + JSON.stringify(entry, null, 4));
				entry.response = '';
			}
 			s = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ',  ' + mysql.escape(entry.pathname) + ' , ' +  options.ts + ', ';
			s +=  mysql.escape(entry.htmlCode) + ' ,  ' + mysql.escape(entry.response) + ' )';
				
			sqlArray.push(s); 
		} 
			
		yield db.connect();	
		yield db.beginTransaction();
		if (sqlArray.length > 0) {
			sql += sqlArray.join(',');
			console.log('"saveCurlDataPages"  --- sql: ' + sql);
			res = yield db.query(sql);
			console.log('"saveCurlDataPages"  --- sql  - res ----: ' + JSON.stringify(res, null, 4));
		}
		 
 		yield db.commitTransaction(); 
		yield db.disconnect();  
  		
 		logger.logJob('lib/jobs.js  (saveCurlDataPages): ', 'FINISHED', '', options);

		return yield Promise.resolve(res);
	}
	
	// takes the insertId and matches them against the 
	function *saveCurlDataStats(visitedPages, options) {
 		logger.logJob('lib/jobs.js  (saveCurlDataStats): ', 'STARTED', '', options);

 		try {
 			var sql	= 'INSERT INTO  `' + config.dbTableNames.pagecontent + '` ';
			sql		+= '(`jobuid`, `domainuid`, `useruid`, `pageuid`, `contenttype`, `contenttext`, '  
			sql		+= '`linktarget`, `linkurl`, `cssclass`, `cssid`, `created`) VALUES ';
	 		 
			var res; 
			var sqlArray = [];
			var s; 
			var entry;  
			for (var i = 0; i < visitedPages.length; i++) {	 
				// stats - internal links
				entry = visitedPages[i];
				entry.htmlCode = '';
				entry.curlresponse = '';
				
				console.log('"saveCurlDataStats"  --- entry : ' + JSON.stringify(entry, null, 4));

				// if analyzeHtml returned false, then .stats is not an array - skip everything
				if (!entry.stats) {
					continue; 
				}
				
				var dummy; 
				if ((entry.stats.internalLinks !== undefined) && (entry.stats.internalLinks.length > 0)) {
	 				for (var j = 0; j < entry.stats.internalLinks.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=  mysql.escape(config.contenttype.internallink) + ' , ';
  						s +=  mysql.escape(entry.stats.internalLinks[j].linkname.trim()) + ', ';
 						s +=  mysql.escape(entry.stats.internalLinks[j].linktarget.trim()) + ', ';
 						s +=  mysql.escape(entry.stats.internalLinks[j].linkurl.trim())   + ', ';
  						if (entry.stats.internalLinks[j].cssclass !== undefined) {
 							dummy  = entry.stats.internalLinks[j].cssclass.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.internalLinks[j].cssid !== undefined) {
 							dummy  = entry.stats.internalLinks[j].cssid.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						} 
 						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.externalLinks !== undefined) && (entry.stats.externalLinks.length > 0)) {
	 				for (var j = 0; j < entry.stats.externalLinks.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=  mysql.escape(config.contenttype.externallink) + ' , ';
  						s += mysql.escape(entry.stats.externalLinks[j].linkname.trim()) + ' , ';
 						s += mysql.escape(entry.stats.externalLinks[j].linktarget.trim()) + ' , ';
 						s += mysql.escape(entry.stats.externalLinks[j].linkurl.trim())   + ', ';
 						if (entry.stats.externalLinks[j].cssclass !== undefined) {
 							dummy  = entry.stats.externalLinks[j].cssclass.trim();
 	 						s +=  mysql.escape(dummy)   + ', '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.externalLinks[j].cssid !== undefined) {
 							dummy  = entry.stats.externalLinks[j].cssid.trim();
 	 						s +=  mysql.escape(dummy)   + ', '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.images !== undefined) && (entry.stats.images.length > 0)) {
	 				for (var j = 0; j < entry.stats.images.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s += ' ' + mysql.escape(config.contenttype.image) + ' , ';
 						if (entry.stats.images[j].imgsrc !== undefined) {
 	 						s +=  mysql.escape(entry.stats.images[j].imgsrc.trim()) + ' , ';
  						} else {
 	 						s += 'null, ';
   						}
 						s += 'null, ';
 						s += 'null, ';	
 						if (entry.stats.images[j].cssclass !== undefined) {
 							dummy  = entry.stats.images[j].cssclass.trim();
 	 						s +=   mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.images[j].cssid !== undefined) {
 							dummy  = entry.stats.images[j].cssid.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.h1 !== undefined) && (entry.stats.h1.length > 0)) {
	 				for (var j = 0; j < entry.stats.h1.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=   mysql.escape(config.contenttype.h1) + ' , ';
   						if (entry.stats.h1[j].text !== undefined) {
 							dummy  = entry.stats.h1[j].text.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}  
 						s += 'null, ';
 						s += 'null, ';	
 						if (entry.stats.h1[j].cssclass !== undefined) {
 							dummy  = entry.stats.h1[j].cssclass.trim();
 	 						s += mysql.escape(dummy)   + ', '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.h1[j].cssid !== undefined) {
 							dummy  = entry.stats.h1[j].cssid.trim();
 	 						s += mysql.escape(dummy)   + ', '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.h2 !== undefined) && (entry.stats.h2.length > 0)) {
	 				for (var j = 0; j < entry.stats.h2.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=  mysql.escape(config.contenttype.h2) + ' , ';
   						if (entry.stats.h2[j].text !== undefined) {
 							dummy  = entry.stats.h2[j].text.trim();
 	 						s += mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}  
 						s += 'null, ';
 						s += 'null, ';	
 						if (entry.stats.h2[j].cssclass !== undefined) {
 							dummy  = entry.stats.h2[j].cssclass.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.h2[j].cssid !== undefined) {
 							dummy  = entry.stats.h2[j].cssid.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.h3 !== undefined) && (entry.stats.h3.length > 0)) {
	 				for (var j = 0; j < entry.stats.h3.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=  mysql.escape(config.contenttype.h3) + ' , ';
  						if (entry.stats.h3[j].text !== undefined) {
 							dummy  = entry.stats.h3[j].text.trim();
 	 						s += ' ' + mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
 						s += 'null, ';
 						s += 'null, ';	
 						if (entry.stats.h3[j].cssclass !== undefined) {
 							dummy  = entry.stats.h3[j].cssclass.trim();
 	 						s += ' ' + mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.h3[j].cssid !== undefined) {
 							dummy  = entry.stats.h3[j].cssid.trim();
 	 						s +=   mysql.escape(dummy)   + ', '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.h4 !== undefined) && (entry.stats.h4.length > 0)) {
	 				for (var j = 0; j < entry.stats.h4.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=  mysql.escape(config.contenttype.h4 )+ ' , ';
 						if (entry.stats.h4[j].text !== undefined) {
 							dummy  = entry.stats.h4[j].text.trim();
 	 						s += mysql.escape(dummy)   + ', '; 
 						} else {
 							s += 'null, ';
 						}
 						s += 'null, ';
 						s += 'null, ';	
 						if (entry.stats.h4[j].cssclass !== undefined) {
 							dummy  = entry.stats.h4[j].cssclass.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.h4[j].cssid !== undefined) {
 							dummy  = entry.stats.h4[j].cssid.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.h5 !== undefined) && (entry.stats.h5.length > 0)) {
	 				for (var j = 0; j < entry.stats.h5.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=  mysql.escape(config.contenttype.h5) + ' , ';
   						if (entry.stats.h5[j].text !== undefined) {
 							dummy  = entry.stats.h5[j].text.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}  
  						s += 'null, ';
 						s += 'null, ';
 						if (entry.stats.h5[j].cssclass !== undefined) {
 							dummy  = entry.stats.h5[j].cssclass.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.h5[j].cssid !== undefined) {
 							dummy  = entry.stats.h5[j].cssid.trim();
 	 						s += mysql.escape(dummy)   + ', '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				
				if ((entry.stats.p !== undefined) && (entry.stats.p.length > 0)) {
	 				for (var j = 0; j < entry.stats.p.length; j++) {
						s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 						s +=  mysql.escape(config.contenttype.p )+ ' , ';
   						if (entry.stats.p[j].text !== undefined) {
 							dummy  = entry.stats.p[j].text.trim();
 	 						s +=   mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						s += 'null, ';
 						s += 'null, ';
 						if (entry.stats.p[j].cssclass !== undefined) {
 							dummy  = entry.stats.p[j].cssclass.trim();
 	 						s +=   mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						}
  						if (entry.stats.p[j].cssid !== undefined) {
 							dummy  = entry.stats.p[j].cssid.trim();
 	 						s +=  mysql.escape(dummy)   + ' , '; 
 						} else {
 							s += 'null, ';
 						} 
  						s += options.ts + ')'; 
						sqlArray.push(s); 
					}
				}
				if (entry.stats.title !== undefined)  {
 					s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 					s +=  mysql.escape(config.contenttype.title) + ', ';
   					if (entry.stats.title !== undefined) {
   						dummy  = entry.stats.title.trim();
	 					s +=   mysql.escape(dummy)   + ' , '; 
					} else {
						s += 'null, ';
					}
   					s += 'null, ';
 					s += 'null, ';
 					s += 'null, ';
 					s += 'null, ';
					s += options.ts + ')'; 						
					sqlArray.push(s);
				} 
				var pageurl = path.basename(entry.pathname);
				if (pageurl !== undefined)  {
 					s  = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
 					s +=  mysql.escape(config.contenttype.pagename) + ', ';
  					s +=  mysql.escape(pageurl) + ', ';
 					s += 'null, ';
 					s += 'null, ';
 					s += 'null, ';
 					s += 'null, ';
					s += options.ts + ')'; 						
					sqlArray.push(s);
				} 
//				// stats - news
//				if ((entry.stats.news !== undefined) && (entry.stats.news.length > 0)) {
//					for (j = 0; j < entry.stats.news.length; j++) {
//						s = '( ' + options.jobuid +', '  + options.domainuid +', '  + options.useruid + ', '  + entry.pageuid + ',';
//						s += '\"' + mysql.escape(entry.stats.news[j].linkpathname) + '\", ';
//						s += '\"' + mysql.escape(entry.stats.news[j].linkname) + '\", ';
//						s += '\"' + mysql.escape(config.linktype.news)   + '\", ';
//						s += '\"' + mysql.escape(entry.stats.news[j].linktarget)   + '\", ';
//						s += options.ts + ', FALSE, 0)'; 	
//						sqlArray.push(s);
//					}
//				}
			} 
				
			yield db.connect();	
			yield db.beginTransaction();
			if (sqlArray.length > 0) {
				sql += sqlArray.join(',');
				console.log('"saveCurlDataStats"  --- sql: ' + sql);
				res = yield db.query(sql);
				console.log('"saveCurlDataStats"  --- sql  - res ----: ' + JSON.stringify(res, null, 4));
			} 
	 		yield db.commitTransaction();
			yield db.disconnect();  
 		}
 		catch (err) {
 			console.log('"saveCurlDataStats" -  there went something wrong:  err: ' + err);
			console.log('"saveCurlDataStats" - there went something wrong:  err.stack: ' + err.stack);
			
 			logger.logJob('lib/jobs.js  (saveCurlDataStats): ', 'ABORTED', 'MYSQL ERROR', err.stack);
			logger.logError('lib/jobs.js  (saveCurlDataStats): ', 'MYSQL ERROR', sql, options);

			// try to disconnect
			yield db.disconnect();  

			return yield Promise.resolve(false);
		}
 		console.log('"saveCurlDataStats"');
		return yield Promise.resolve(true);
	}
	
	function *saveCurldata(visitedPages, options) {
 		logger.logJob('lib/jobs.js  (saveCurldata): ', 'STARTED', '', options);

		try {
			for (var i = 0; i<visitedPages.length; i++){
				 console.log('"saveCurldata" - visitedPages['+i+'].stats : ' + JSON.stringify(visitedPages[i].stats));
 			}
 			var pageids = yield saveCurlDataPages(visitedPages, options);
			
			// now we have an insertId and an affectedRows  -> we know the ids of the pages - hopefully mysql doesnt 
			// change the order ?
			var firstUid =  pageids.insertId  ;
	
			for (var i = 0; i < visitedPages.length; i++) {
				visitedPages[i].pageuid = firstUid + i; 
				console.log('"saveCurldata" - visitedPages['+i+'].pageuid: ' + visitedPages[i].pageuid);
 			} 
		 
			var res = yield saveCurlDataStats(visitedPages, options);
			console.log('"saveCurldata" - inserting stats res : ' + JSON.stringify(res));
			console.log('"saveCurldata" - done');
		}
		catch (err) {
			console.log('"saveCurldata" -  there went something wrong:  err: ' + err);
			console.log('"saveCurldata" - there went something wrong:  err.stack: ' + err.stack);
			
			logger.logJob('lib/jobs.js  (saveCurldata): ', 'ABORTED', 'MYSQL ERROR', err.stack);
			logger.logError('lib/jobs.js  (saveCurldata): ', 'ERROR', 'dont know who failed', options);
			
			yield db.disconnect();  
			return yield Promise.resolve(false); 
		}
		
		console.log('"saveCurldata" - done  ');
		logger.logJob('lib/jobs.js  (saveCurldata): ', 'FINISHED', '', '');

		return yield Promise.resolve(true);
	}
	
	// TODO: use a map or a set instead of the objects -> should be easier  
	
	// takes visitPages and returns the pages which have not been visited yes
	function *findNewPages(visitPages, domain) {
		var newPages = {};
		var actpage; 
		var hostname; 
		var pathname;  
		var entry; 
		
		logger.logJob('lib/jobs.js  (crawlDomain): ', 'STARTED', '', '');

		//// console.log('"findNewPages" visitPages: ' +  JSON.stringify(visitPages));

		// search for unvisited pages 
		for (var candidate in visitPages) {
			// if not visited then add to array "newpages" 				
			actpage = visitPages[candidate];
				
 			console.log('"findNewPages" candidate: ' + candidate);
 			console.log('"findNewPages" actpage: ' + JSON.stringify(actpage,null,4 ));
			console.log('"findNewPages" newPages[candidate]: ' + JSON.stringify(newPages[candidate]));

 			if (!actpage.visited) {
 				// avoid duplicates 
 				if (newPages[candidate] === undefined) {
		 			entry = {
		 				hostname	: actpage.hostname,
		 				pathname 	: actpage.pathname,
		 				protocol	: actpage.protocol
		 			}
		 			//// console.log('"findNewPages"  entry: ' + JSON.stringify(entry));
		 			newPages[candidate] = entry;
 				}
 			} else {
 				//// console.log('"findNewPages" -- actpage already visited');
			}
		} 
		console.log('"crawlDomain" --  newPages --  newPages ' +JSON.stringify(newPages));
		console.log('"crawlDomain" --   Object.keys(newPages).length ' +Object.keys(newPages).length);
		
		logger.logJob('lib/jobs.js  (crawlDomain): ', 'FINISHED', '', '');
 		
		return yield Promise.resolve(newPages); 
	} 
	
	var startcrawljobYieldable = function* (url, options) {
		var jobuid;
  		try {
 			logger.logJob('lib/jobs.js  (startcrawljob): ', 'STARTED', '', '');

			var ts = new Date().getTime();
			console.log('startcrawljob url: ' + url);
			console.log('startcrawljob options: ' + JSON.stringify(options));
			
			yield db.connect();
			yield db.beginTransaction();
			var sql = 'INSERT INTO  `' + config.dbTableNames.jobs + '` ';
			sql += '(`description`, `domainuid`, `useruid`, `jobtype`, `created`, `deleted`, `updated`, `status`, `starttime`, `endtime`) VALUES ';
			sql += '(' + mysql.escape(options.description) + ', ' + options.domainuid +', '  + options.useruid + ', ' + mysql.escape(config.jobtypes.crawljob) + ', ' + ts + ', FALSE, 0, ' + mysql.escape(config.jobstatus.running) + ',' + ts +',0)'; 
			console.log('"startcrawljob" INSERT statement SQL: ' + sql);
			var res = yield db.query(sql);			
			yield db.commitTransaction();
			yield db.disconnect();
			
			// save our new jobuid
			var jobuid = res.insertId; 
			console.log('"startcrawljob"  newjob inserted with uid: '+jobuid);
  
			res = yield crawlDomain(url, options, jobuid, ts);
			console.log('"startcrawljob" res: ' + JSON.stringify(res));

			// change the status to finished
			ts = new Date().getTime();

			yield db.connect();
			yield db.beginTransaction();
			var sql = 'UPDATE `' + config.dbTableNames.jobs + '` ';
			sql += 'SET  endtime = ' +ts +', status = \"finished\" WHERE uid =  ' + jobuid;
 			console.log('"startcrawljob" UPDATE   SQL: ' + sql);
			res = yield db.query(sql);			
			yield db.commitTransaction();
			yield db.disconnect(); 
			
			console.log('"startcrawljob"  finished: ');
		}
 		catch (err) {
			console.log('startcrawljob: there was error in my try-block err: ' + err);
			console.log('startcrawljob: there was error in my try-block err.stack: ' + err.stack); 
 
			logger.logJob('lib/jobs.js  (startcrawljob): ',   'ABORTED', 'MYSQL ERROR', options);
			logger.logError('lib/jobs.js  (startcrawljob): ', 'MYSQL ERROR', url, err.stack);
			
			yield db.disconnect();  
			
			return yield Promise.resolve(false);
 		}  
		logger.logJob('lib/jobs.js  (startcrawljob): ', 'FINISHED', '', '');

		return yield Promise.resolve(jobuid);
	} 
	 
	var startcrawljob = co.wrap(function *(url, options) {
		console.log('"startcrawljob"      CALLING yield startcrawljobYieldable(url, options)');
		yield startcrawljobYieldable(url, options);
		console.log('"startcrawljob"      CALLING yield seo.updatewordlist');
		// after we crawled a new domain -> update the seo word list ...
		try {
			yield seo.updatewordlist();
		}
		catch (err) {
			console.log('startcrawljob: there was error in "seo.updatewordlist";  err: ' + err);
			console.log('startcrawljob: there was error in "seo.updatewordlist";  err.stack: ' + err.stack); 				
			logger.logError('lib/jobs.js  (startcrawljob): ',   'ERROR', 'seo.updatewordlist returned an error: ', ''); 
		}  
		
		console.log('"startcrawljob"      AND AFTER yield seo.updatewordlist');
		return;
	});  
	
	function *crawlDomain (domain, options, jobuid, ts) {
		var maxDepth  = options.maxDepth;
		var maxPages  = options.maxPages;
		
		options.jobuid = jobuid; 
		options.ts = ts; 

		var url = urlparser.parse(domain);
		var hostname = url.hostname; 
		var pathname = url.pathname; 
		var protocol = url.protocol; 
		
		logger.logJob('lib/jobs.js  (crawlDomain): ', 'STARTED', '', '');
 		
		// we want these pages to be visited
		var visitPages = {};
		
		// this array holds the urls we have to "curl"
		var newPages = {};
		
		// holds the response from curl and the analyzed data -> will be written into database
		var visitedPages = [];
		
		var curlresponse; 
		var startPos;
		var htmlCode;
		var stats; 
		var path; 
		var res;

		var entry = {};
		
		entry = {
			visited 	: false,
			hostname 	: hostname, 
			pathname 	: pathname,
			protocol	: protocol
		}
		
		// use the full as array 'index'
		url = url.href; 
		// start with the domain name
		visitPages[url] = entry; 
		
		//console.log('"crawlDomain" url as key in array: ' + url);
		
		// we loop until done = true
		var done = false;
		var actpage; 
		
		var iteration =0; 
		var count = 0;
 	 
		while (!done) {
			//console.log('"crawlDomain" visitPages: ' + JSON.stringify(visitPages));
			//console.log('"crawlDomain" domain: ' + JSON.stringify(domain));
			// emtpy the array with new pages
		 	newPages = yield findNewPages(visitPages, url);

			//console.log('"crawlDomain" newPages: ' + JSON.stringify(newPages));
 	
 			if (Object.keys(newPages).length > 0) {
 	 			for (var url in newPages) {
 	 				hostname = newPages[url].hostname;
 	 				pathname = newPages[url].pathname;
 					console.log('"crawlDomain" calling url with  hostname: ' + hostname);
 					console.log('"crawlDomain" calling url with pathname: ' + pathname);
 					console.log('"crawlDomain" calling url curl:   url: ' + url);

					logger.logInfo('lib/jobs.js  (crawlDomain): ', 'curl url: ' + url, '', '');

					// everything which needs access to the web -> take a break
	 				// yield utils.takeABreak();
	 				
 					try {
 						curlresponse = yield utils.curlURL(url);
 						if ((curlresponse !== undefined) && (curlresponse !== false)) {
 							console.log('crawlDomain: length of curl response: ' + curlresponse.length + ';  url: ' +url);
 	 						logger.logInfo('lib/jobs.js  (crawlDomain): ',   'curlURL', 'length of curl response: ' + curlresponse.length, '');
 						} else {
 							if (curlresponse == undefined) {
 								console.log('crawlDomain: curl returned UNDEFINED for url: ' +url);
 	 	 						logger.logError('lib/jobs.js  (crawlDomain): ',   'curlURL', 'curl returned UNDEFINED for url: ' + url, '');
 	 	 						logger.logInfo('lib/jobs.js  (crawlDomain): ',   'curlURL', 'curl returned UNDEFINED for url: ' + url, '');
 	 	 						curlresponse = false;
 							} else {
 								console.log('crawlDomain: curl returned false for url: ' +url);
 	 	 						logger.logInfo('lib/jobs.js  (crawlDomain): ',   'curlURL', 'curl returned false for url: ' + url, '');
 	 	 						logger.logInfo('lib/jobs.js  (crawlDomain): ',   'curlURL', 'curl returned false for url: ' + url, '');
  							}
 						}
 					}
 					catch (err) {
 						console.log('crawlDomain: there was error in the curl request for url: ' + url + '; err: ' + err);
 						console.log('crawlDomain: there was error in the curl request for url: ' + url + '; err.stack: ' + err.stack); 
 						logger.logError('lib/jobs.js  (crawlDomain): ',   'ERROR', 'curlURL returned an error: ', ''); 
  					} 
		 			
 					if (curlresponse) {
 						// extract html code
 			 			startPos = curlresponse.indexOf(config.startHtml);
 			 			if (startPos == -1) {
 			 				// if there is no html tag, then ignore this
 			 				console.log('"crawlDomain" -url  has no html code: ' + url);
 	 						logger.logInfo('lib/jobs.js  (crawlDomain): ',   'curlURL', 'curlresponse returned no HTML Code ', ''); 
 			 				htmlCode = 'no html code on this page'; 
 	 		 			} else {
 	 						htmlCode = curlresponse.substr(startPos, curlresponse.length - startPos); 	 						
 	 						// "analyze" htmlcode 
 	 						stats = yield utils.analyzeHtml(htmlCode, url);
 	 						if (stats) {
 	 	 			  			console.log('"crawlDomain" stats" : ' + JSON.stringify(stats, null, 4));
 	 	 						logger.logInfo('lib/jobs.js  (crawlDomain): ',   'INFO', 'analyzeHtml stats for url: ' + url, stats); 
 	  						}
 	   		 			}
 	 
 	 					// save the data in an array
 						entry = {
 			 				htmlCode		: htmlCode,
 			 				curlresponse	: curlresponse,
 			 				stats			: stats,
 			 				pathname		: pathname,
 			 				hostname		: hostname
 						}
 					} else {
 						entry = {
 	 			 			htmlCode		: htmlCode,
 	 			 			curlresponse	: 'none',
 	 			 			stats			: [],
 	 			 			pathname		: pathname,
 	 						hostname		: hostname
 	 					}
 					}
		 			visitedPages.push(entry);
					
					var logInfo = {
						pathname		: entry.pathname,
			 			hostname		: entry.hostname
					}
 					logger.logInfo('lib/jobs.js  (crawlDomain): ', 'newpage added to array "visitedPages', 'source: ' + url, logInfo);

	 				// check if there is certain number of pages added to the array
	 				// if a threshold is reached -> write data to database
		 			if (Object.keys(visitedPages).length > config.curljobMaxarraylength) {
		 				res = yield saveCurldata(visitedPages, options);
		 				res = true; 
		 				//console.log('"crawlDomain" call to "saveCurldata" returned res: ' + JSON.stringify(res));
		 				visitedPages = [];
		 			}
		 		 	 
		 			// now we've been there
		 			visitPages[url].visited = true; 
		 			//console.log('"crawlDomain" visitPages[url]  after setting "visited = true" : ' + JSON.stringify(visitPages[url]));
 
		 			// and finally add all internal links from the current page to array of pages which should be visited
	 				// (but not in this current iteration)
		 			var internalLink; 
	 				entry = {
	 		 	 		visited	: false
	 		 	 	}
	 				
	 				// add all internal links to a "page" to the array of pages we want to visit
	 				if (stats !== undefined && stats.internalLinks !== undefined) {
	 					for (var i = 0; i < stats.internalLinks.length; i++) {
	 						if (stats.internalLinks[i].linktarget == config.linktarget.page) {
	 						// again: avoid duplicates
				 				internalLink =  stats.internalLinks[i].linkurl;		 						
		 						console.log('"crawlDomain" stats.internalLinks[i]  internalLink "visitPages" :    ' + internalLink);

			 	 				if (visitPages[internalLink] === undefined) {
			 	 					entry = {
			 	 						visited		: false,
			 	 			 			pathname	: stats.internalLinks[i].linkpathname,
			 	 						hostname	: stats.internalLinks[i].linkhostname
			 	 					}
			 						console.log('"crawlDomain" stats.internalLinks[i].linkpathname "visitPages" :    ' + stats.internalLinks[i].linkpathname);

			 						console.log('"crawlDomain" stats.internalLinks[i].linkhostname "visitPages" :    ' + stats.internalLinks[i].linkhostname);
 			 	 					visitPages[internalLink] = entry;
 			 	 					logger.logInfo('lib/jobs.js  (crawlDomain): ', 'new internal link added to array  "visitPages"', 'source: ' + url, entry);
 				 				} 
	 						}
			 			}
	 				}
	 				// take a break, so the server doesnt treat us badly and bans us or stuff like that ...
	 				console.log('"crawlDomain" taking a break after visiting url:  ' + url);
	 				yield utils.waitForMe(config.curljobPausebetweenRequests);
	 			}
	 		} else {
 				// if no more new pages available --> we are done
  				done = true; 
		  	 
   				if (visitedPages.length > 0) {
   					var res = yield saveCurldata(visitedPages, options); 
   					console.log('"crawlDomain" back from "saveCurldata"');
   	 			} 
 			}  
 		} 
		
		logger.logJob('lib/jobs.js  (crawlDomain): ',   'FINISHED', '', ''); 
		
		return yield Promise.resolve(true);
	} 
	
	var startscreenshotjob = co.wrap(function *(options) {
		return yield startscreenshotjobYieldable(options)
	}); 
	
	var startscreenshotjobYieldable = function* (options) {
		var res; 
		var entry;   // <-- for error logging

		logger.logJob('lib/jobs.js  (startscreenshotjobYieldable): ',   'FINISHED', '', '');
		
 		try {
			console.log('"startscreenshotjobYieldable"      started  !!!: ');			
			yield db.connect();
			console.log('"startscreenshotjobYieldable"      options: '+JSON.stringify(options));			

			// select all pages with no screenshot present
			
 			var sql = 'SELECT * FROM `' + config.dbTableNames.domains + '`  WHERE uid = ' + options.domainuid;
 			var res = yield db.query(sql);	
 			var domain = res[0].name;
 			var sql = 'SELECT uid, path FROM `' + config.dbTableNames.pages + '`  WHERE jobuid = ' + options.jobuid ;
 			sql += ' AND  (deleted = false OR deleted IS NULL) ';
 			sql += ' AND  imgfilename IS NULL';

			console.log('"startscreenshotjobYieldable"  SQL1   : ' +sql);

 			var ts = new Date().getTime();
  			var pages = yield db.query(sql);
			console.log('"startscreenshotjobYieldable"      pages.length: ' + pages.length);			

 			yield db.beginTransaction();
			var sql = 'INSERT INTO  `' + config.dbTableNames.jobs + '` ';
			sql += '(`description`, `domainuid`, `useruid`, `jobtype`, `created`, `deleted`, `updated`, `status`, `starttime`, `endtime`) VALUES ';
			sql += '( ' + mysql.escape(options.description) + ' , ' + options.domainuid +', '  + options.useruid + ', \"' + config.jobtypes.screenshotjob + '\", ' + ts + ', FALSE, 0, \"' + config.jobstatus.running + '\",' + ts +',0)'; 
 			console.log('"startscreenshotjobYieldable"  SQL2   : ' +sql);

			var res = yield db.query(sql);
			var thisjobuid = res.insertId; 
			console.log('"startscreenshotjobYieldable"  newjob inserted with uid: '+thisjobuid);
  
			yield db.commitTransaction();
			yield db.disconnect();
						
 			var helper = urlparser.parse(options.domain);
 			
 			// create the directoy for the series of screenshots
 			var directory = yield utils.makeDirectory(options.jobuid, helper.host, ts);
 			
 			var fulldirectory = config.directories.screenShotDir + '/' + directory;
 			console.log('"startscreenshotjobYieldable"   directory: ' + fulldirectory);
 			
 			// create the directory 
 			fs.mkdirSync(fulldirectory);
 			
 			var res; 
 			var screenshotData = [];
 			for (var i = 0; i < pages.length; i++) {
 				var entry = pages[i];
 				console.log('"startscreenshotjobYieldable" entry" :  ' + JSON.stringify(entry, null, 4));
 				
 				// everything which needs access to the web -> take a break
 				// yield utils.takeABreak();
 				
 				res = yield utils.makeScreenshot(fulldirectory, directory, entry, options, domain);
 				console.log('"startscreenshotjobYieldable" got res from "utils.makeScreenshot" :  ' + JSON.stringify(res));
 				
 				screenshotData.push(res); 
 			 				
 				// wait a little before the next request
 				// console.log('"startscreenshotjob" taking a break after screenshooting url:  ' + domain  + ' ' + entry.path);
 				yield utils.waitForMe(config.curljobPausebetweenRequests);
 				
 				// if the array has a certain size -> save data into database
 				if (screenshotData.length > config.curljobMaxarraylength) {
 					res = yield saveScreenshotData(screenshotData);
 					screenshotData = [];
 				}
 			}
 			
 			// save data 
 			if (screenshotData.length > 0) {
				res = yield saveScreenshotData(screenshotData);
				screenshotData = [];
			}
 			
 			// change the status to finished
			ts = new Date().getTime();

			yield db.connect();
			yield db.beginTransaction();
			var sql = 'UPDATE `' + config.dbTableNames.jobs + '` ';
			sql += 'SET  endtime = ' +ts +', status = \"'+config.jobstatus.finished+'\" WHERE uid =  ' + thisjobuid;
 			console.log('"startscreenshotjobYieldable"    SQL: ' + sql);
			res = yield db.query(sql);			
			yield db.commitTransaction();
			yield db.disconnect(); 
			
 			console.log('"startscreenshotjobYieldable"      finished!: ');		
		
		} catch (err) {
			console.log('startscreenshotjobYieldable: there was error in my try-block err: ' + err);
			console.log('startscreenshotjobYieldable: there was error in my try-block err.stack: ' + err.stack);
			
			logger.logJob('lib/jobs.js  (startscreenshotjob): ',   'ABORTED', 'MYSQL ERROR', err.stack);
			logger.logError('lib/jobs.js  (startscreenshotjob): ', 'MYSQL ERROR', 'options: ' +  JSON.stringify(options), entry);
			
			yield db.disconnect();  
			
			return yield Promise.resolve(false);
		} 
		
		console.log('"startscreenshotjobYieldable" inserted id from "addnewjob" :  ' + JSON.stringify(res));

		return yield Promise.resolve(res);
	};
	
	function *getJobs() {
		// console.log('"getJobs"');
		var ts = new Date().getTime();
	
		var sql = 	'SELECT ' + config.dbTableNames.jobs + '.description, ' + config.dbTableNames.jobs + '.jobtype, ' + config.dbTableNames.jobs + '.status,  ' + config.dbTableNames.domains + '.name , ' + config.dbTableNames.jobs + '.domainuid , ' + config.dbTableNames.jobs + '.uid ';
		sql += 		'FROM ' + config.dbTableNames.jobs + '   ';
		sql += 		'LEFT JOIN ' + config.dbTableNames.domains + ' ON ' + config.dbTableNames.domains + '.uid = ' + config.dbTableNames.jobs + '.domainuid  ';
		sql += 		'WHERE (' + config.dbTableNames.jobs + '.deleted = FALSE OR ' + config.dbTableNames.jobs + '.deleted IS NULL)    ';
		sql += 		'ORDER BY ' + config.dbTableNames.jobs + '.created DESC   ';

		console.log('"getJobs" SQL: ' + sql);
		yield db.connect();
		var res = yield db.query(sql); 
		yield db.disconnect();  
		return res; 
	}
	
 	function *deleteJob(uid) {
		// console.log('"deleteJob"');
 		var ts = new Date().getTime();
		var sql = 'UPDATE  `' + config.dbTableNames.jobs + '` SET deleted = true, updated = ' + ts + ' WHERE uid = ' + uid;
		// console.log('SQL: ' + sql);
		yield db.connect();
		var res = yield db.query(sql); 
		yield db.disconnect();  
		return res; 
	} 
 	
 	var startcomparescreenshotjob = co.wrap(function *(options) {
		return yield startcomparescreenshotjobYieldable(options)
	});  
 	
 	var startcomparescreenshotjobYieldable = function* (options) {
		var res; 
		
		logger.logJob('lib/jobs.js  (startcomparescreenshotjobYieldable): ',   'STARTED', '' ,'');

		try {
			// console.log('"startcomparescreenshotjob"      started  !!!: ');			
			
			console.log('"startcomparescreenshotjobYieldable"      options  : ' + JSON.stringify(options, null, 4));
			var url = urlparser.parse(options.domain);
			var host = url.host; 
			
			yield db.connect(); 
    			
 			var ts = new Date().getTime();

 			yield db.beginTransaction();
			var sql = 'INSERT INTO  `' + config.dbTableNames.jobs + '` ';
			sql += '(`description`, `domainuid`, `useruid`, `jobtype`, `created`, `deleted`, `updated`, `status`, `starttime`, `endtime`) VALUES ';
			sql += '(\"' + options.description + '\", ' + options.domainuid +', '  + options.useruid + ', \"' + config.jobtypes.comparejob + '\", ' + ts + ', FALSE, 0, \"' + config.jobstatus.running + '\",' + ts +',0)'; 
			console.log('lib/jobs.js  (startcomparescreenshotjobYieldable): SQL1: ' + sql);
			var res = yield db.query(sql);
			var thisjobuid = res.insertId; 
			// console.log('"startcomparescreenshotjob"  newjob inserted with uid: '+thisjobuid);
  
			yield db.commitTransaction();
			
			// read all pages from the 2 sets (jobuids)
			var sql = 'SELECT imgdirectory, imgfilename, path, uid FROM `' + config.dbTableNames.pages + '`  WHERE jobuid = ' + options.jobuid1 + ' AND  (deleted = false OR deleted IS NULL)';
			console.log('lib/jobs.js  (startcomparescreenshotjobYieldable): SQL2: ' + sql);
			var pageSet1 = yield db.query(sql);	
 			var sql = 'SELECT imgdirectory, imgfilename, path, uid FROM `' + config.dbTableNames.pages + '`  WHERE jobuid = ' + options.jobuid2 + ' AND  (deleted = false OR deleted IS NULL)'; 			
			console.log('lib/jobs.js  (startcomparescreenshotjobYieldable): SQL3: ' + sql);
			var pageSet2 = yield db.query(sql);	
			
 			console.log('"startcomparescreenshotjobYieldable" pageSet1: ' + JSON.stringify(pageSet1, null, 4));
 			console.log('"startcomparescreenshotjobYieldable" pageSet2: ' + JSON.stringify(pageSet2, null, 4));

 			yield db.disconnect();
			
			// create an array with page-paths as key and directory name and file name in an object
			var entry = {};
			var pages = {};
			for (var i = 0; i < pageSet1.length; i++) {
				if ((pageSet1[i].imgdirectory !== null) && (pageSet1[i].imgdirectory !== '')) {
					entry = {
						imgdirectory1 	: pageSet1[i].imgdirectory,
						imgfilename1	: pageSet1[i].imgfilename,
						uid1			: pageSet1[i].uid,
						imgdirectory2	: null,
						imgfilename2	: null,
						uid2			: null,
						path			: pageSet1[i].path
 					}
				} else {
					entry = {
						imgdirectory1 	: null,
						imgfilename1	: null,
						uid1			: null,
						imgdirectory2	: null,
						imgfilename2	: null,
						uid2			: null,
						path			: pageSet1[i].path
 					}
				}
				pages[pageSet1[i].path] = entry; 
			}
 			console.log('"startcomparescreenshotjobYieldable"   after set1  pages: ' + JSON.stringify(pages, null, 4));
			
			for (var i = 0; i < pageSet2.length; i++) {
				// if the path is already in the array, then add the information from site2
				// else add a new entry in the array
				if (pages[pageSet2[i].path] == undefined) {
					if ((pageSet2[i].imgdirectory !== null) && (pageSet2[i].imgdirectory !== '')) {
						entry = {
							imgdirectory2 	: pageSet2[i].imgdirectory,
							imgfilename2	: pageSet2[i].imgfilename,
							uid2			: pageSet2[i].uid,
							imgdirectory1	: null,
							imgfilename1	: null,
							uid1			: null,
							path			: pageSet2[i].path
	 					}
					} else {
						entry = {
							imgdirectory1 	: null,
							imgfilename1	: null,
							uid1			: null,
							imgdirectory2	: null,
							imgfilename2	: null,
							uid2			: pageSet2[i].uid,
							path			: pageSet2[i].path
	 					}
					}
					pages[pageSet2[i].path] = entry; 
				} else {
					entry = pages[pageSet2[i].path];
					entry.imgdirectory2 = pageSet2[i].imgdirectory;
					entry.imgfilename2	= pageSet2[i].imgfilename;
					entry.uid2			= pageSet2[i].uid; 
					pages[pageSet2[i].path] = entry; 
				} 
			}
 			console.log('"startcomparescreenshotjobYieldable"  found the following  pages: ' + JSON.stringify(pages, null, 4));
  			
			var idString = 'compare_' + options.jobuid1 + '_' + options.jobuid2;
 			// create the directoy for the series of screenshots
 			var directory = yield utils.makeDirectory(idString, host, ts);
 			
 			var fulldirectory = config.directories.screenShotDir + '/' + directory;
 			// console.log('"startcomparescreenshotjob"   directory: ' + fulldirectory);
 			
 			// create the directory 
 			fs.mkdirSync(fulldirectory);
 			
 			var entry; 
 			var res; 
 			var screenshotComparisonData = [];
 			
 			var arr = [];
 			// in Object.keys iojs does not like yield ?!
  			Object.keys(pages).forEach(function (key) {
  				arr.push(pages[key]);
  			});
  			var options2 = {
  				png1 : '',
  				png2 : '',
  				png3 : '',
  				fullpath : '' 
  			} 
  			var dimensions = [];
  			for (var i = 0; i < arr.length; i++) {
  				var entry = arr[i];
  					
  				// default values
  				entry.imgdirectory = null; 
  	 			entry.imgfilename = null; 	  	 			
  	 			entry.difference = null; 
	  	 				
  	 			console.log('"startcomparescreenshotjobYieldable" entry:  ' + JSON.stringify(entry,null,4));

  	 			// if the page is available in both screenshot sets,
  	 			// then create the diff image and make the "allinone" image
  				if ((arr[i].imgfilename1 !== null) && (arr[i].imgfilename2 !== null)) {
   					res = yield utils.makeScreenshotComparison(entry, host, fulldirectory, ts);
   	 				console.log('"startcomparescreenshotjobYieldable" got res from "utils.makeScreenshotComparison" :  ' + JSON.stringify(res));

   	 				// yield  utils.waitForMe(3000);
   					if (res !== false) {   	   					
   	 	  				entry.imgdirectory 	= directory; 
   	  	  	 			entry.imgfilename 	= res.imgfilename; 
   	  	  	 			entry.difference 	= res.difference; 
   	  	  	 			entry.width 		= res.width; 
   	  	  	 			entry.height 		= res.height; 
   	  	  	 			entry.countPixel	= res.countPixel; 
   	  	  	 			entry.percDiff   	= res.percDiff;
   	  	  	 			
   	  	  	 			res = yield utils.execConvertMergeImages(entry, host, fulldirectory, ts);
   	  	 				
   	  	  				entry.imgdirectoryallinone = directory; 
   	  					entry.imgfilenameallinone = res.imgfilenameallinone; 
    				}
  	 			}
 				screenshotComparisonData.push(entry); 
 			};

 			// save data 
 			if (screenshotComparisonData.length > 0) {
 				var options = {
 					jobuid 		: thisjobuid,
 					domainuid	: options.domainuid,
 					useruid		: options.useruid,
 					ts			: ts
 				}
				res = yield saveScreenshotComparisonData(screenshotComparisonData, options);
				screenshotComparisonData = [];
			}
 			
			// change the status to finished
			ts = new Date().getTime();

			yield db.connect();
			yield db.beginTransaction();
			var sql = 'UPDATE `' + config.dbTableNames.jobs + '` ';
			sql += 'SET  endtime = ' +ts +', status = \"'+config.jobstatus.finished+'\" WHERE uid =  ' + thisjobuid;
 			console.log('"startcomparescreenshotjobYieldable"   SQL: ' + sql);
			res = yield db.query(sql);			
			yield db.commitTransaction();
			yield db.disconnect(); 
			
 			console.log('"startcomparescreenshotjobYieldable"      finished  !!!: ');		
		
		} catch (err) {
			console.log('startcomparescreenshotjobYieldable: there was error in my try-block err: ' + err);
			console.log('startcomparescreenshotjobYieldable: there was error in my try-block err.stack: ' + err.stack);
			
			logger.logJob('lib/jobs.js  (startcomparescreenshotjobYieldable): ',   'ABORTED', 'MYSQL ERROR', err.stack);
			logger.logError('lib/jobs.js  (startcomparescreenshotjobYieldable): ', 'MYSQL ERROR', url, options);
			
			yield db.disconnect();  
			
			return yield Promise.resolve(false);
		} 
		
		logger.logJob('lib/jobs.js  (startcomparescreenshotjobYieldable): ',   'FINISHED', '', '');

		return yield Promise.resolve(res);
	};
 	
    return {
    	startcrawljob 		: startcrawljob,
    	startscreenshotjob	: startscreenshotjob,
    	getJobs				: getJobs,
    	deleteJob			: deleteJob,
    	startcomparescreenshotjob	: startcomparescreenshotjob,
    	startcomparescreenshotjobYieldable	: startcomparescreenshotjobYieldable,
    	getlast2CrawlJobs					: getlast2CrawlJobs
    };
}();
