'use strict';

var co = require('co');
	
var cronjob = require('../lib/cronjob');

co(function* () {
	try { 		
		var res = yield cronjob.execTestExternalLinks();
	} catch(err) {
		console.log('"exec_external_links.js"   something went wrong - err : ' + err);
		console.log('"exec_external_links.js"   something went wrong - err.stack : ' + err.stack); 
	}  
})
