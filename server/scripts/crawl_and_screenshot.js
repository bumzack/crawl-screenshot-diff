'use strict';

var co = require('co');
	
var cronjob = require('../lib/cronjob');
var process = require('process');

co(function* () {
	try { 
		var argv = process.argv;
		if (argv[2] !== undefined) {
			var domainuid = argv[2];
			var mobile = argv[3];

			if (mobile == undefined) {
				mobile = false;
			} else {
				mobile = true; 
			}
			console.log('"crawl_and_screenshot.js"   domainuid  : ' + domainuid);
			console.log('"crawl_and_screenshot.js"   mobile  : ' + mobile);
			var res = yield cronjob.executeDailyCronjob(domainuid, mobile);
		} else {
			console.log('"crawl_and_screenshot.js"  no domainuid found: ' );
		}
		
	} catch(err) {
		console.log('"crawl_and_screenshot.js"   something went wrong - err : ' + err);
		console.log('"crawl_and_screenshot.js"   something went wrong - err.stack : ' + err.stack); 
	}  
})
