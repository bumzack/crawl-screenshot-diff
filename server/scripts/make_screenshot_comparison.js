'use strict';

var co = require('co');
	
var cronjob = require('../lib/cronjob');
var process = require('process');

co(function* () {
	try { 
		var argv = process.argv;
		if (argv[2] !== undefined) {
			var domainuid = argv[2];
			var res = yield cronjob.executeDailyCronjobMakeScreenShot(domainuid);
		} else {
			console.log('"make_screenshot_comparison.js"  no domainuid found: ' );
		}
	} catch(err) {
		console.log('"make_screenshot_comparison.js"   something went wrong - err : ' + err);
		console.log('"make_screenshot_comparison.js"   something went wrong - err.stack : ' + err.stack); 
	}  
})
