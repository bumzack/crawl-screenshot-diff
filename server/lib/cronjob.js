'use strict';
 
var co = require('co');
	
var jobs = require('../lib/jobs');
var domains = require('../lib/domains');
var logger = require('../lib/logger');
var utils = require('../lib/utils');
var mysql = require('mysql');
var db = require('../lib/db');
var config = require('../config');

var util = require('util');
var libAlldomains = require('../lib/alldomains');
var urlparser = require('url');

module.exports = function()
{ 
	function *executeDailyCronjob (domainuid, mobile) {  
		var res; 
		try {
			logger.logJob('executeDailyCronjob (executeDailyCronjob): ', 'STARTED', 'domainuid = ' + domainuid, '');
 			// user = cronjob
			var useruid = 3; 

			var allDomains = yield domains.getDomains(true);

			if (allDomains == false) {
				logger.logError('cronjob - cronjob.js', 'domains.getDomains(true) returned an error -> quitting', '', '');
				console.log('"cronjob - cronjob.js"   domains.getDomains(true) returned an error -> quitting  : ');
				return; 
			}

			var options = {
				maxDepth		: -1,
				maxPages 		: -1,
				description		: '',
				domainuid 		: domainuid,
				useruid			: useruid
			}
			 
			var crawljobuid; 
			var url; 
			var domain = {};

			for (var i = 0; i < allDomains.length; i++) {
				if (allDomains[i].uid == domainuid) {
					domain = allDomains[i];
					break;
				}
			}
			var ts = new Date(); 
			
			if (config.useProxy) {
				if (mobile) {
					options.description     = 'crawl (cronjob):  PROXY  MOBILE 480x800    ' +ts;
				} else {
					options.description	= 'crawl (cronjob):  PROXY  DESKTOP   1366X768    ' +ts; 
				} 		
			} else {
				if (mobile) {
					options.description     = 'crawl (cronjob):  KLONE  MOBILE   480x800   ' +ts;
				} else {
					options.description     = 'crawl (cronjob): DESKTOP 1366X768     ' +ts;
				}
 			}
			console.log('"cronjob.js"   options  : ' + JSON.stringify(options, null, 4));
   		
			url = domain.name;
				
			console.log('crawl (cronjob): ', 'START', url, options);

			logger.logJob('crawl (cronjob): ', 'START', url, options);
				
			crawljobuid = yield jobs.startcrawljob(url, options);
				
			if (crawljobuid == false) {
				logger.logJob('crawl (cronjob): ', 'ABORTED', url, options);
				logger.logError('crawl - cronjob.js ', 'yield jobs.startcrawljob(url, options) returned an error', '', '');
			} else {
				logger.logJob('crawl (cronjob): ', 'FINISHED', url, options);
			}		
			logger.logInfo('crawl (cronjob): ', 'INFO', 'this is the return object from "jobs.startcrawl"', crawljobuid);

			// save jobuid for later fpor the screenshot job
			domain.crawljobuid = crawljobuid;
				
			// screenshotjobs

			var options = {
				screenResolution : {
					width	: 1366,
					height	: 768
				},
				domainuid 	: domainuid,
				domain 		: -1,
				description : '',						
				jobuid 		: crawljobuid,
				useruid 	: useruid
			}

			if (mobile) {
				options.screenResolution.width = 480; 
                options.screenResolution.height = 800;
			}		

			options.domain = domain.name;
			var ts = new Date(); 

			if (config.useProxy) {
				if (mobile) {
					options.description	= 'screenshot (cronjob):  Proxy  MOBIL 480x800  ' +ts; 
				} else {
					options.description     = 'screenshot (cronjob):  Proxy  DESKTOP 1366x768 ' +ts;
				} 
			} else {
				if (mobile) {
                                        options.description     = 'screenshot (cronjob):   MOBIL 480x800  ' +ts;
                                } else {
                                        options.description     = 'screenshot (cronjob):   DESKTOP 1366x768 ' +ts;
                                }
 			}
			logger.logJob('screenshot (cronjob): ', 'START', url, options);

		 	var res = yield jobs.startscreenshotjob(options);

		 	if (res == false) {
				logger.logJob('screenshot (cronjob): ', 'ABORTED', url, options);
				logger.logError('cronjob - cronjob.js', 'jobs.startscreenshotjob(options) returned an error', '', '');
			} else {
				logger.logJob('screenshot (cronjob): ', 'FINISHED', url, options);				
			}
					 
			logger.logJob('cronjob (cronjob): ', 'FINISHED', '', '');
		} catch(err) {
			console.log('cronjob (cronjob):    something went wrong - err : ' + err);
			console.log('cronjob (cronjob):    something went wrong - err.stack : ' + err.stack);
			logger.logError('cronjob - cronjob.js', 'jobs.startscreenshotjob(options) something went wrongreturned ', 'error: ' +err, '');
                        logger.logError('cronjob - cronjob.js', 'jobs.startscreenshotjob(options) something went wrongreturned ', 'error.stack: ' +err.stack, '');
		} 
		logger.logInfo('crawl (cronjob): ', 'INFO', 'all jobuid from the crawl cronjob', crawljobuid);

		return res; 
	}
	
	function *executeDailyCronjobMakeScreenShot (domainuid) {  
		var res; 
		var newscreenshotcomparisonjob;
		try {
			logger.logJob('cronjob.js (executeDailyCronjobMakeScreenShot): ', 'STARTED', 'domainuid = ' + domainuid, '');

			var useruid = 3;
			
			var domain = yield domains.getDomains(false, domainuid);
			if (domain == false) {
				logger.logError('cronjob.js (executeDailyCronjobMakeScreenShot): ', 'domains.getDomains(true, domainuid) returned an error -> quitting', '', '');
				return; 
			}
			
			// console.log('cronjob.js (executeDailyCronjobMakeScreenShot):   domain : ' + JSON.stringify(domain, null, 4)); 

			// get the last 2 crawljobs and compare them
			var screenshotJobs = yield jobs.getlast2CrawlJobs(domainuid);
			// console.log('cronjob.js (executeDailyCronjobMakeScreenShot):   screenshotJobs : ' + JSON.stringify(screenshotJobs, null, 4)); 
 			
			newscreenshotcomparisonjob = {
				domain 		: domain[0].name, 
				description	: 'cronjob screencomparison ',
				domainuid	: domain[0].uid,
				useruid		: useruid,
				jobuid1		: screenshotJobs[1].uid ,
				jobuid2		: screenshotJobs[0].uid 
			};    
 			
			var res = yield jobs.startcomparescreenshotjobYieldable(newscreenshotcomparisonjob);
			
			if (res == false) {
				logger.logJob('cronjob.js (executeDailyCronjobMakeScreenShot):  ', 'ABORTED', '', newscreenshotcomparisonjob);
				logger.logError('cronjob.js (executeDailyCronjobMakeScreenShot):   ', 'jobs.startscreenshotjob(options) returned an error', '', '');
			} else {
				logger.logJob('cronjob.js (executeDailyCronjobMakeScreenShot):  ', 'FINISHED', '', newscreenshotcomparisonjob);				
			}
					 
			logger.logJob('cronjob.js (executeDailyCronjobMakeScreenShot):  ', 'FINISHED', '', '');
		} catch (err) {
			console.log('cronjob.js (executeDailyCronjobMakeScreenShot):   something went wrong - err : ' + err);
			console.log('cronjob.js (executeDailyCronjobMakeScreenShot):   something went wrong - err.stack : ' + err.stack); 
		}
		return res; 
	}
	
	function *execTestExternalLinks () {  
		var res;
		try { 
			var link; 
			var response; 
			var linkStatus;
			var sql; 
		   	var res;
		   	var ts;
		   	var start, end, httpstatus;
		   	
		   	var allLinks = yield utils.getAllExternalLinks();
		   	var url; 
 			yield db.connect();
		   	yield db.beginTransaction();
			console.log('"execTestExternalLinks"  -   allLinks.length:  ' +  allLinks.length); 

 			if (allLinks.length > 0) {
 				for (var i = 0; i < allLinks.length; i++) {
 	 				link = allLinks[i].linkurl; 
// 					link = link.trim(); 
// 					link = link.replace(/'/g,"");
 					console.log('"execTestExternalLinks"  -  linkurl:  ' + link); 

  					url = urlparser.parse(link);
 					link = url.hostname; 
 					response = '';
 					httpstatus = '';
 					response = yield utils.execCurlStatus(link);
 						
 					if (response != 'nope') {
 						console.log('"execTestExternalLinks"  - link:  ' + link + ', response:  '+ response);

 	 					start = response.indexOf('HTTP');
 						end = response.indexOf('\n', start)-1;
 						// console.log('"execTestExternalLinks"  - httpstatus: start' + start + ', end :  ' + end);

 						httpstatus = response.substr(start, end-start);
 						httpstatus = httpstatus.trim();
 						console.log('"execTestExternalLinks" -   link  ' + link + '     httpstatus: "' + httpstatus);
 					} else {
 						httpstatus = 'unreachable';
 					}
					
					ts = new Date().getTime();
	 			   	sql = 	'UPDATE  ' +config.dbTableNames.pagecontent + ' ';
		 			sql += 	'SET status = ' +  mysql.escape(httpstatus) +', ';
	 	 			sql += 	'updated  = ' + ts + ' ';
	 	 			sql += 	'WHERE linkurl  = ' +  mysql.escape(allLinks[i].linkurl); 
	 				console.log('"execTestExternalLinks"   update query  : ' +sql);
	 				res = yield db.query(sql);
	 				
	 				console.log('"execTestExternalLinks"   update query  : ' +sql);
	 				yield utils.waitForMe(config.curljobPausebetweenRequests); 
  				}
 			} 
 			 
   	   		yield db.commitTransaction();
	   		yield db.disconnect();  
			console.log('"execTestExternalLinks"   DONE: ' );
 		} catch(err) {
			console.log('"execTestExternalLinks"   something went wrong - err : ' + err);
			console.log('"execTestExternalLinks"   something went wrong - err.stack : ' + err.stack); 
		} 
		return yield Promise.resolve(res);
	}
	
    return {
    	executeDailyCronjob					: executeDailyCronjob,
    	executeDailyCronjobMakeScreenShot	: executeDailyCronjobMakeScreenShot,
    	execTestExternalLinks				: execTestExternalLinks
    };
}();
