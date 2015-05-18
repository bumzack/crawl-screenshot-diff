var page = require('webpage').create();
var	system = require('system');
var	fs = require('fs');
 
var args = system.args;
var address;
var t; 

function logPhantomjs(str1, str2, str3, json1) {
	var ts = new Date();
	var d = ts.toUTCString();
	var s = d +'\t' + str1 +'\t' + str2+ '\t' + str3+ '\t' + JSON.stringify(json1) +'\n';
	fs.write('phantomjs.log', s, 'a'); 
}

try {
	logPhantomjs('scrips/makescreenshot.js', 'STARTED', '', '');
 
	page.viewportSize = {
		width: args[3],
		height:  args[4]
	};

	// try for 30secs, then give up on the server :-(
	page.settings.resourceTimeout = 30000; 

	t = Date.now();
	address = args[1];
	filename = args[2];

	console.log('address  ' + address);
	console.log('filename  ' + filename);
	console.log('width  ' + page.viewportSize.width);
	console.log('height  ' + page.viewportSize.height);
	
	logPhantomjs('scrips/makescreenshot.js', 'URL', address	, '');
	
	// use this for http authentication 
	page.customHeaders={'Authorization': 'Basic '+btoa('username:password')};
	
	// callback: if timeout limit is reached
	page.onResourceTimeout = function(request) {
	    console.log('scrips/makescreenshot.js Response (#' + request.id + '): ' + JSON.stringify(request));
	    console.log('scrips/makescreenshot.js ERROR screenshot address: ' + address);
		logPhantomjs('scrips/makescreenshot.js', 'ERROR', 'onResourceTimeout: when trying to access: ' + address	, request);

		var diff = Date.now() - t;
		
		logPhantomjs('scrips/makescreenshot.js', 'ABORTED', 'timeout error in page.onResourceTimeout', 'duration: ' + diff +' ms');

	    phantom.exit(10);
	};
	
	page.onResourceRequested = function (request) {
		// console.log('Request ' + JSON.stringify(request, undefined, 4));
		//	logPhantomjs('scrips/makescreenshot.js', 'ABORTED', 'onResourceRequested', request);
	};

	page.onError = function (msg, trace) {
		// console.log(msg);
 		logPhantomjs('scrips/makescreenshot.js', 'JavaScriptErrors', 'onError for address: ' + address, '');

	    trace.forEach(function(item) {
	        //console.log('  ', item.file, ':', item.line);
	 		logPhantomjs('scrips/makescreenshot.js', 'JavaScriptErrors', 'error msg', item);
	    });
	};

	page.open(address, function(status) {
		var diff;
		if (status !== 'success') {
			console.log('FAIL to load the address');
			console.log(  "Error opening url \"" + page.reason_url    + "\": " + page.reason );
	 		logPhantomjs('scrips/makescreenshot.js', 'page.open ERROR',"Error opening url \"" + page.reason_url    + "\": " + page.reason, '');
			phantom.exit(99);
		} else {
			diff = Date.now() - t;
			//  console.log('Loading ' + system.args[1]);
			console.log('Loading time ' + diff + ' msec');
			logPhantomjs('scrips/makescreenshot.js', 'Loading time',  diff + ' msec for address: ' + address, '');
			
			page.render(filename);
			var out = {
				filename : filename,
				loadingtime : diff
			}
		}	
		// logger.logJob('scrips/makescreenshot.js', 'FINISHED', '', '');
		var diff1 = Date.now() - t;
		console.log('Total timing loading and rendering an taking a screenshot ');
		console.log('Loading time ' + diff + ' msec');
		
		var saveRender = diff1 - diff; 
		// logger.logInfo('scrips/makescreenshot.js', 'FINISHED', 'loading time: ' + diff + ' ms; rendering and saving time: ' + saveRender, '');
		console.log('rendering and saving time ' + saveRender + ' msec');
	 	logPhantomjs('scrips/makescreenshot.js', 'rendering and saving',  saveRender + ' msec for address: ' + address, '');

		phantom.exit();
	});
	
} catch (err) {
	console.log('scrips/makescreenshot.js: there was error in my try-block err: ' + err);
	console.log('scrips/makescreenshot.js: there was error in my try-block err.stack: ' + err.stack);
	
 	logPhantomjs('scrips/makescreenshot.js', 'ABORTED',  'error', '');

 	logger.logJob('scrips/makescreenshot.js  (page.open): ', 'ERROR','err.stack',  err.stack);
 	logger.logJob('scrips/makescreenshot.js  (page.open): ', 'ERROR', 'err', err);
 }
