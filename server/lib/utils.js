'use strict';

var Q = require('q');
var tmp = require('tmp');
var fs = require('fs');
const config = require('../config');
 
var db = require('../lib/db');
var util = require('util');
var co = require('co');

var jsdom = require('jsdom');

var urlparser = require('url');
var path = require('path');

var imageDiff = require('image-diff');

var logger = require('../lib/logger');

module.exports = function()
{
	function readFile(filename) {
		return function(fn) {
			fs.readFile(filename, function (err, data) {
				if (err) {
					console.log('yieldable wrapper fs.readFile. error connecting: ' + err.stack);
					var s = 'yieldable wrapper  fs.readFile  error-msg: ' + err.stack;
					fs.appendFile(config.log.error, s);
					return fn(err);
				}
				// console.log('connected as id ' + bla.threadId);
				fn(null, data);
			});
		}
	} 
	
	function *takeABreak () {
 		var deferred = Q.defer();
		
 		var stop = config.takeabreak.start; 
 		var ts = new Date();
 		
 		var hour = ts.getHours();
 		var minute = ts.getMinutes();
 		var year = ts.getFullYear();
 		var month = ts.getMonth();
 		var day = ts.getDate();

 		console.log('lib/utils.js  (takeABreak):     ' + hour + ':' + minute);
 		logger.logInfo('lib/utils.js  (takeABreak): ', 'takeABreak', 'its now : ' +  hour + ':' + minute, '');
 		console.log('lib/utils.js  (takeABreak):    now it is ' + ts);
 		 
 		// it only works if start and stop are on the same day
 		
 		if ((hour >= config.takeabreak.start.hour)  && (hour <= config.takeabreak.end.hour) && 
 			(minute >= config.takeabreak.start.minute)  && (minute <= config.takeabreak.end.minute)) {
 			var stop = new Date(year, month, day, config.takeabreak.end.hour, config.takeabreak.end.minute);
 			var start = ts.getTime();
 			stop = stop.getTime(); 
 			
 			var duration = stop - start; 
 			console.log('"takeABreak"  taking a brek for  ' + duration + ' ms');
  			yield waitForMe(duration);
 		}
 		deferred.resolve(true);
	 	 
		return deferred.promise;
	} 
	
	 function getTmpFilename () {
 		var deferred = Q.defer();
  
	 	tmp.tmpName({ template: config.directories.tmpDir + '/crawlsearch-tmp-XXXXXX' }, function _tempNameGenerated(err, path) {
	 	    if (err) {
	 	    	deferred.reject(new Error(err));
	 	    } else {
	 	    	deferred.resolve(path);
	 	    }
	 	});
		return deferred.promise;
	} 
	
	function replaceSpecialCharacter(s) {
		s = s.replace(/ /g,"_");
		s = s.replace(/\'/g,"_");
		s = s.replace(/\"/g,"_");
		s = s.replace(/ä/g,"ae");
		s = s.replace(/ö/g,"oe");
		s = s.replace(/ü/g,"ue");
		s = s.replace(/ß/g,"ss");
		s = s.replace(/€/g,"euro");
		s = s.replace(/\§/g,"_");
		s = s.replace(/\?/g,"_");
		s = s.replace(/\!/g,"_");
		s = s.replace(/\$/g,"_");
		s = s.replace(/\%/g,"_");
		s = s.replace(/\&/g,"_");
		s = s.replace(/\//g,"_");
		s = s.replace(/\(/g,"_");
		s = s.replace(/\)/g,"_");
		s = s.replace(/\+/g,"_");
		s = s.replace(/\~/g,"_");
		s = s.replace(/\´/g,"_");
		s = s.replace(/\`/g,"_");
	
		return s; 
	}
	
	// replace specialcharacters width spaces, so the string can be split
	function replaceSpecialCharacterBlacklist(s) {
 		s = s.replace(/\'/g," ");
		s = s.replace(/\"/g," "); 
		s = s.replace(/\´/g," ");
		s = s.replace(/\`/g," ");
		s = s.replace(/\./g," ");
		s = s.replace(/\:/g," ");
		s = s.replace(/\;/g," "); 
		return s; 
	}
	
	function curlURL(url, opts) {
 		var deferred = Q.defer();
		
 		logger.logJob('lib/utils.js  (curlURL): ', 'STARTED', '', '');
 		logger.logInfo('lib/utils.js  (curlURL): ', 'curling url: ' + url, 'options: ', opts);

 		// if you want/have to use a proxy ...
// 	 	if (config.useProxy) {
// 	 		cmd += '-k -A "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0"  --connect-timeout 90 ###URL###';
//   		} else {
//   			cmd += '-k -A "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:32.0) Gecko/20100101 Firefox/32.0" --connect-timeout 90 ###URL###';	
//   		}
   		
		// ATTENTION: -k   means accept non-validated SSL certificates (required for developing purposes)
        var cmd = '--connect-timeout 90 -k ###URL###';
 	 	 
 		cmd = cmd.replace('###URL###', url);
	 	var cmdArray = cmd.split(' ');
	 	
	 	console.log('"utils.curlURL"     url : '+url);
	 	
	 	var spawn = require('child_process').spawn;
	 	var curl = spawn('curl', cmdArray);	
	 	var response = '';
	 	
	 	curl.stdout.on('data', function (data) { 
	 		if (data !== undefined) {
	 			response += data.toString();
	 			//console.log('"utils.curlURL; curl.stdout.on("data")  data: '+data.toString());
	 		}
	 	});
	
		curl.stderr.on('data', function (data) {
	 		//throw errors
			if (data !== undefined) {
 		 		// response += data.toString();
	 			//console.log('"utils.curlURL; curl.stderr.on("data")  data: '+data.toString());
  	 		}
		});
	
 		curl.on('close', function (code) {
 			if (code == 0)  {
 				deferred.resolve(response); 
 		 		logger.logJob('lib/utils.js  (curlURL): ', 'FINISHED', '', '');
 			} else {
 		 		logger.logJob('lib/utils.js  (curlURL): ', 'ABORTED', 'curl returned with exit code: ' + code + '; url: '+ url, '');
 		 		logger.logError('lib/utils.js  (curlURL): ', 'ABORTED', 'curl returned with exit code: ' + code + '; url: '+ url + '    ' +  response);
	 			console.log('"utils.curlURL; ERROR   code !== 0 (code = '+code+'),    curl returned: ' + response);
	 			deferred.resolve(false); 
 			}
	 	});
 		return deferred.promise; 
 	}
	  
	function pad(num, size) {
	    var s = num + "";
	    while (s.length < size) {
	    	s = "0" + s;
	    }
	    return s;
	}
	
	function *waitForMe(seconds) {
  		var deferred = Q.defer(); 
  		setTimeout(function() {
			deferred.resolve('waitfor me '); 
		}, seconds);
			
		return deferred.promise; 
	} 
	
	function analyzeHtml(htmlCode, url) {
  		var deferred = Q.defer(); 
 		// console.log('analyzeHtml htmlCode '  +htmlCode);
 		var jquery = fs.readFileSync("./jquery-2.1.3.min.js", "utf-8");
	 	logger.logJob('lib/utils.js  (analyzeHtml): ', 'STARTED', '', '');

  		jsdom.env({
   			html: htmlCode,
   			src: [jquery],
  			done:   function (errors, window) {
  				if (errors) {
  					logger.logJob('lib/utils.js  (analyzeHtml): ', 'ABORTED', 'jsdom.env returned an error analyzing url  '+ url, '');
  	 		 		logger.logError('lib/utils.js  (analyzeHtml): ', 'BORTED', 'jsdom.env returned an error analyzing url  '+ url, errors);
  					deferred.resolve(false);
  				} else {
  					var $ = window.jQuery;
  					var entry; 	
  					var internalLinks = [];
  					var externalLinks = [];
  					var iframes = [];
  					var images = [];
  					var forms = [];
  					var news = [];
  					var h1 = [];
  					var h2 = [];
  					var h3 = [];
  					var h4 = [];
  					var h5 = [];
  					var title = '';
  					var p = [];
 
  					var compareToStrings = [];
  					compareToStrings.push('http://');
  					compareToStrings.push('https://');
  					
  					var validExtensions = [];
  					validExtensions.push('html');
  					validExtensions.push('htm');
  					validExtensions.push('php');
  					validExtensions.push('php5');
   					
  					var isInternallink ; 
  					var isNews; 
  					var linktarget; 
  					var linktype;
  					
  					var res = urlparser.parse(url);
  					var hostname = res.hostname; 
	  				var pathname = res.pathname; 
	  				var protocol = res.protocol; 

  					var linkhostname;  
  					var linkpathname; 
  					
  					var filename;
  					var extname;	
  					
  					var linkurl; 
  					var j; 
  					var isNotALink = false; 
  					
   					$('a').each(function( index ) {
  						var link =  $( this ).attr('href');
  						console.log('"analyseHtml"   trying to find out what type of link this is: ' + link );
  						console.log('"analyseHtml"  page origin hostname : ' + hostname +',pathname: ' + pathname);

  						if (link !== undefined) {
  	  						// reset variables 
  							
  							isInternallink = true; 
  	  						isNotALink = false;
  							 
  	  						if (link == '') {
  								isNotALink = true;
  							} else {
  								for (j = 0; j < config.blackListCharactersforInternalLinks.length; j++) {
  			  	  					if (link.indexOf(config.blackListCharactersforInternalLinks[j]) != -1) {
  			  							console.log('"analyseHtml"  found a blacklisted  character "'+config.blackListCharactersforInternalLinks[j]+ '" in link : ' + link + ' --> ignore for now');
  			  							isNotALink = true;
  	 		  							continue; 
  			  	  					}
  		  	  					}
  								
  								// TODO dont treat news as "Not A Link"
  	  							for (j = 0; j < config.whiteListNewsLinks.length; j++) {
  			  	  					if (link.indexOf(config.whiteListNewsLinks[j]) != -1) {
  			  	  						console.log('"analyseHtml"  found a whiteListNewsLinks  "'+config.whiteListNewsLinks[j]+ '" in link : ' + link + ' --> marked as news');
  			  	  						isNotALink = true;
  	  		  	  					}
  	  							}
  	  							for (j = 0; j < config.whiteListNewsLinks.length; j++) {
			  	  					if (link.indexOf(config.whiteListNewsLinks[j]) != -1) {
			  							console.log('"analyseHtml"  found a whiteListNewsLinks  "'+config.whiteListNewsLinks[j]+ '" in link : ' + link + ' --> marked as news');
			  							isNews = true;
			  							isInternallink = false; 
	 		  	  					}
	  							}
  							}
  							// if it is not a real link, then skip the rest of the each( )  
  							if (isNotALink) {
  								return true; 
  							}
  							
   		  					res = urlparser.parse(link);
  							console.log('"analyseHtml" res = urlparser.parse(link)  "'+ JSON.stringify(res, null, 4));

	  		  				var linkhostname = res.hostname; 
	  	  					var linkpathname = res.pathname; 
	  	  					
	  						console.log('"analyseHtml"  page link linkhostname : ' + hostname +',linkpathname: ' + linkpathname);
	  						
	  	  					if (linkpathname == null) {
	  	  						isNotALink = true; 
	  	  						return true; 
	  	  					}
	  	  				 
	  	  					// if the hostname is empty, then it is a relative path -> add our hostname
	  	  					if ((linkhostname == '') || (linkhostname == null)) {
	  							console.log('"analyseHtml"  linkhostname is empty --> it is an internal link -> setting linkhostname to: ' + hostname);
 	  	  						linkhostname = hostname;
	  	  					}
	  	  					
  							console.log('"analyseHtml"   link: ' + link);
  							console.log('"analyseHtml"   linkhostname: ' + linkhostname +', linkpathname: ' + linkpathname);
  		  					console.log('"analyseHtml"   hostname: ' + hostname +', pathname: ' + pathname);

   							// its an internal link
  							// if the hosts are the same, otherwise its external
  							if (hostname !== linkhostname) {
  								isInternallink = false;
  	  							console.log('"analyseHtml"   link: ' + link + '   is EXTERNAL');
  							} else {
  	  							console.log('"analyseHtml"   link: ' + link + '   is INTERNAL');
  							}   
  							
  							extname = '';
  							// get the filename if there is any
  							filename = path.basename(linkpathname);
	  						console.log('"analyseHtml"   filename: ' + filename  );
	  						if (filename !== '') {
	  							extname = path.extname(filename);
		  						console.log('"analyseHtml"   extname: ' + extname  );
	  						}
	  						
	  						linktarget = config.linktarget.unknown; 
	  						
  							// set the correct linktarget depending on the file ending if there is any
	  						if (extname == '') {
	  							linktarget = config.linktarget.page
	  						}
	  						if (config.fileextensions.images.indexOf(extname) !== -1) {
	  							linktarget = config.linktarget.image;
 	  						}
	  						if (config.fileextensions.pages.indexOf(extname) !== -1) {
	  							linktarget = config.linktarget.page;
 	  						}
	  						if (config.fileextensions.pdf.indexOf(extname) !== -1) {
	  							linktarget = config.linktarget.pdf;
 	  						}
	  						if (config.fileextensions.video.indexOf(extname) !== -1) {
	  							linktarget = config.linktarget.video;
 	  						}
	  						if (config.fileextensions.audio.indexOf(extname) !== -1) {
	  							linktarget = config.linktarget.audio;
 	  						}
	  						
	  						var obj = {
	  							hostname : linkhostname, 
	  							pathname : linkpathname, 
	  							protocol : protocol
	  						} 
	  						linkurl = urlparser.format(obj);
	  						console.log('"analyseHtml"    linkurl created from path, host and protooll: ' + linkurl  );
	  						
	  						if (isNews) {
	  							linktype = config.linktype.news;
	  							linktarget = config.linktarget.page;
 	  						}
	  						 
	  						entry = {
		  	  					linkname 	: $( this ).text(),
		  	  	  				linkpathname 	: linkpathname,
		  	  	  				linkhostname	: linkhostname,
		  	  	  				linkurl			: linkurl,
		  	  	  				linktarget 		: linktarget,
			  	  	  			cssclass		: $(this).attr('class'),
		  	  	  				cssid			: $(this).attr('id')   
 		  	  				}
	  						
	  						if (isNews) {
	  							news.push(entry);
   	  							//console.log('"analyzeHtml"  adding '+link + ' to news: ' + JSON.stringify(entry, null, 4)); 
	  						} else if (isInternallink) {
	  							internalLinks.push(entry);
   	  							//console.log('"analyzeHtml"  adding '+link + ' tointernalLinks: ' + JSON.stringify(entry, null, 4)); 
	  						} else {
	  							externalLinks.push(entry);
   	  							//console.log('"analyzeHtml"  adding '+link + ' toexternalLinks: ' + JSON.stringify(entry, null, 4)); 
 	  						}
   						}
  					});
  					 
  					$('iframe').each(function( index ) {
  						var iframe =  $( this ).attr('src');
  						entry = {
    						src 		: $( this ).attr('src'),
    						cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						} 
  						iframes.push(entry);
  					});
  					 
  					$('img').each(function( index ) {
  						entry = {
   							imgsrc 		: $( this ).attr('src') ,
   							cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						}
  						images.push(entry);
   					});  
  					
  					var action; 
  					$('form').each(function( index ) {
  						action = $( this ).attr('action')
  						entry = {
  							from 	: $( this ).text(),
  							action 	: action
  						}
  						forms.push(entry);
   					}); 
  					
  					$('h1').each(function( index ) {
   						entry = {
  							text 		: $( this ).text(),
  							cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						}
  						h1.push(entry);
   					}); 
  					
  					$('h2').each(function( index ) {
   						entry = {
  							text 		: $( this ).text(),
  							cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						}
  						h2.push(entry);
   					}); 
  					
  					$('h3').each(function( index ) {
   						entry = {
  							text 		: $( this ).text() ,
  							cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						}
  						h3.push(entry);
   					}); 
  					
  					$('h4').each(function( index ) {
   						entry = {
  							text 		: $( this ).text(),
  							cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						}
  						h4.push(entry);
   					}); 
  					
  					$('h5').each(function( index ) {
   						entry = {
  							text 		: $( this ).text(),
  							cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						}
  						h5.push(entry);
   					}); 
  					
  					$('p').each(function( index ) {
   						entry = {
  							text 		: $(this).text(),
  							cssclass	: $(this).attr('class'),
	  	  	  				cssid		: $(this).attr('id') 
  						}
  						p.push(entry);
   					}); 
  					
  					title = $('title').text(); 
  					
  					var res = {
  	  					internalLinks 	: internalLinks,
  	  					externalLinks 	: externalLinks,
  	  					images			: images,
  	  					iframes			: iframes,
  	  					hostname		: linkhostname, 
  	  					pathname		: linkpathname,
  	  					news			: news,
  	  					h1				: h1, 
  	  					h2				: h2, 
  	  					h3				: h3, 
  	  					h4				: h4, 
  	  					h5				: h5, 
  	  					p				: p, 
  	  					title			: title
  	  				}
  					// console.log('"analyseHtml"  this is the result: ' + JSON.stringify(res, null, 4));
  					deferred.resolve(res); 
  					logger.logJob('lib/utils.js  (analyzeHtml): ', 'FINISHED', '', '');
   				}
  			}
  		}); 
		return deferred.promise;
	}
	
	function *makeFilename(pathname) {
 		var deferred = Q.defer();
 		var s = pathname;
 		// console.log('makeFilename: s before: ' + s);

 		if ((s == '') || (s == '/')|| (s == '//')) {
 			s = 'ROOT';
 		}
 		if (s[0] == '/') {
 			s = s.substr(1, s.length-1);
 		}
 		if (s[s.length-1] == '/') {
 			s = s.substr(0, s.length-1);
 		}
 		// console.log('makeFilename: s after: ' + s);
		s = s.replace(/ /g,"_");
		s = s.replace(/\'/g,"_");
		s = s.replace(/\"/g,"_");
		s = s.replace(/ä/g,"ae");
		s = s.replace(/ö/g,"oe");
		s = s.replace(/ü/g,"ue");
		s = s.replace(/ß/g,"ss");
		s = s.replace(/€/g,"euro");
		s = s.replace(/\§/g,"_");
		s = s.replace(/\?/g,"_");
		s = s.replace(/\!/g,"_");
		s = s.replace(/\$/g,"_");
		s = s.replace(/\%/g,"_");
		s = s.replace(/\&/g,"_");
		s = s.replace(/\//g,"_");
		s = s.replace(/\(/g,"_");
		s = s.replace(/\)/g,"_");
		s = s.replace(/\+/g,"_");
		s = s.replace(/\~/g,"_");
		s = s.replace(/\´/g,"_");
		s = s.replace(/\`/g,"_");
		 
		// console.log( 'makeFilename: done and s = ' +s);
 		deferred.resolve(s); 
		return deferred.promise; 
	}
	
	var makeFilenameAsync = co.wrap(function *(pathname) {
		return yield makeFilename(pathname);
	});  
	
	// create a directory for saving the snapshots
	function *makeDirectory(jobuid, domain, ts) {
 		var deferred = Q.defer();
 		var s = domain;
 		
		s = s.replace(/ /g,"_");
		s = s.replace(/\'/g,"_");
		s = s.replace(/\"/g,"_");
		s = s.replace(/ä/g,"ae");
		s = s.replace(/ö/g,"oe");
		s = s.replace(/ü/g,"ue");
		s = s.replace(/ß/g,"ss");
		s = s.replace(/€/g,"euro");
		s = s.replace(/\§/g,"_");
		s = s.replace(/\?/g,"_");
		s = s.replace(/\!/g,"_");
		s = s.replace(/\$/g,"_");
		s = s.replace(/\%/g,"_");
		s = s.replace(/\&/g,"_");
		s = s.replace(/\//g,"_");
		s = s.replace(/\(/g,"_");
		s = s.replace(/\)/g,"_");
		s = s.replace(/\+/g,"_");
		s = s.replace(/\~/g,"_");
		s = s.replace(/\´/g,"_");
		s = s.replace(/\`/g,"_");
		s = s.replace(/\./g,"_");

		s = jobuid + "_" + s + "_" + ts;
		// // console.log( 'makeFilename: done and s = ' +s);
 		deferred.resolve(s); 
		return deferred.promise; 
	}
	
	function *makeScreenshot(fulldirectory, directory, entry, options, domain) {
		logger.logJob('lib/utils.js  (makeScreenshot): ', 'STARTED', '', '');
		
		try {
			console.log('"makeScreenshot"   started: '  );
	
	 		// var deferred = Q.defer();
			var ts = new Date().getTime();
			
			var jobuid = options.jobuid; 
			var userid = options.userid;
			
	 		var address = urlparser.parse(domain + '/' + entry.path);	
		
	 		var hostname = address.hostname;
	 		var pathname = address.pathname;
	 
	 		var ext = 'png';
	 		
	 		// create a "clean" url 
	 		var url = urlparser.format(address); 
	 
	  		var filename = yield makeFilename(pathname);
	  		var filename = filename + '_' + ts + '.' + ext; 
	   		var fullpath = fulldirectory + '/' + filename; 
	
	  		// console.log('"utils.makeScreenshot" clean url  from  urlparser.format:    ' + url);
	 		var json = {
				filename 	: filename,
				directory 	: directory,
				fulldirectory : fulldirectory,
				fullpath	: fullpath,
	 			width		: options.screenResolution.width,
				height		: options.screenResolution.height,				
				url			: url,
				pageuid		: entry.uid
	 		}
	  		
	 		// console.log('"utils.makeScreenshot"   fullpath: ' +fullpath);
	 		// console.log('"utils.makeScreenshot"   fulldirectory: ' +fulldirectory);
	
	 		var res = yield execPhantomJs(json);
	  		console.log('utils.makeScreenshot  res from execPhantomJS', JSON.stringify(res));
			logger.logInfo('lib/utils.js  (makeScreenshot): ', 'res from execPhantomJS', url + ', but with an error',res);
 	 		
	 		if ((res == undefined) || (res == false)|| (res == 'undefined')) {
				logger.logInfo('lib/utils.js  (makeScreenshot): ', 'res from execPhantomJS was FALSE', url + ', but with an error','');
 				logger.logJob('lib/utils.js  (makeScreenshot): ', 'FINISHED', JSON.stringify(address) + ', but with an error','');
 				json.filename = null;
 				json.directory = null;
 				json.fulldirectory = null;
 				json.fullpath = null;
 				json.width = null;
 				json.height = null;
 				json.filename = null; 
 				json.loadtime = -1; 
	 		} else {
	 			if (isNaN(json.loadtime)) {
	 				json.loadtime = -1; 
	 			} else {
	 				json.loadtime = res; 
	 			} 
	 		}
			logger.logJob('lib/utils.js  (makeScreenshot): ', 'FINISHED', JSON.stringify(address),'');
 		}
		catch (err) {
			console.log('"utils.makeScreenshot"  - something went wrong. err: ' +err);
			console.log('"utils.makeScreenshot"  - something went wrong. err.stack: ' +err.stack	);
			
			logger.logJob('lib/utils.js  (makeScreenshot): ', 'ABORTED', 'an error was thrown -see error stack; url  ', address);
		 	logger.logError('lib/utils.js  (makeScreenshot): ', 'PHANTOMJS', 'phantomjs returned an error', err.stack);
		}
 		return yield Promise.resolve(json); 
 	}
	
	function *execPhantomJs(options) {
 		var deferred = Q.defer();
   	
 		// ATTENTION: --ignore-ssl-errors= true  - required for development server, remove if you 
 		// have a trusted SSL certificate 
  		var  cmd = '--ignore-ssl-errors=true ###SCRIPT### ###URL### ###FILENAME### ###WIDTH### ###HEIGHT###';
  		
	 	cmd = cmd.replace('###SCRIPT###', config.scripts.scriptMakeScreenshot);
	 	cmd = cmd.replace('###URL###', options.url);
	 	cmd = cmd.replace('###FILENAME###', options.fullpath);
	 	cmd = cmd.replace('###WIDTH###', options.width);
	 	cmd = cmd.replace('###HEIGHT###', options.height);

	 	var cmdArray = cmd.split(' ');
	 	
		console.log('"utils.execPhantomJs" cmd:      '+ cmd); 

  		var spawn = require('child_process').spawn;
 		var phantomjs = spawn(config.binaries.phantomjs, cmdArray);
 		
		var loadingTime = -1; 
 		phantomjs.stdout.on('data', function (data) { 
 			// read
 			var s = data.toString();
 			loadingTime = s.match("time(.*)msec");
 			if ((loadingTime !== null) && (loadingTime.length >= 2)){
 	 			loadingTime = loadingTime[1].trim(); 
  			} else {
 	 			loadingTime = -1; 
  			}
 			console.log('"utils.execPhantomJs" phantomjs.stderr.on("close"):   data    '+ s); 
		});
 		
 		phantomjs.stderr.on('data', function (data) {
 			console.log('"utils.execPhantomJs" phantomjs.stderr.on("close"):   data    '+ data.toString());
  		});

 		phantomjs.on('close', function (code) {
 			//cess exited with code ' + code)
 			console.log('"utils.execPhantomJs" phantomjs.on("close"):   code    '+ code);
	 		if (code == 0)  {
	 			deferred.resolve(loadingTime);
 	 			logger.logJob('lib/utils.js  (execPhantomJs): ', 'FINISHED', options.url, '');
 	 		} else {
	 			logger.logJob('lib/utils.js  (execPhantomJs): ', 'ABORTED', 'an error was thrown - return code:  ' + code, options.url);
			 	logger.logError('lib/utils.js  (execPhantomJs): ', 'PHANTOMJS', 'phantomjs returned an error - return code:  ' + code, '');
 	 			deferred.resolve(false); 
 	 		}
 		}); 
 		return deferred.promise;
 	}
	
	function *makeScreenshotComparison(entry, host, fulldirectory, ts) {
 		var deferred = Q.defer();
 		
		logger.logJob('lib/utils.js  (makeScreenshotComparison): ', 'STARTED','', '');
 
 		console.log('"makeScreenshotComparison"   started: '  );
		console.log('"makeScreenshotComparison"   entry: ' +JSON.stringify(entry, null, 4) );

		var prefix = entry.uid1 + '_' + entry.uid2; 
 		var ext = 'png'; 
   		
   		var png1 = config.directories.screenShotDir + '/' + entry.imgdirectory1 +  '/' + entry.imgfilename1;
   		var png2 = config.directories.screenShotDir + '/' + entry.imgdirectory2 +  '/' + entry.imgfilename2;
   		
 		var tmpFile = yield getTmpFilename();
 		var filename = yield makeFilename(entry.path);

 		var params = {
 	 		actualImage		: png1,
 	 		expectedImage	: png2,
 	 		diffImage		: tmpFile
 	 	};
 		
		console.log('"makeScreenshotComparison"   ImageDiff params: ' +JSON.stringify(params, null, 4));

 		var dim = null;
 		var countPixel = 0; 
  		imageDiff(params, function(error, res) {
 			// TODO: this looks like a necessary workaround for a dubious behaviour by image-diff
 			// it returns null as error, but an image is successfully created
 			if ((error !== undefined) && (error !== null)) {
 	 			deferred.resolve(false); 
 	 			console.log('"makeScreenshotComparison"   ImageDiff returned an error  : ' +error);
 	 			logger.logJob('lib/utils.js  (makeScreenshotComparison): ', 'ABORTED', 'an error was thrown - error:  ' + error, '');
			 	logger.logError('lib/utils.js  (makeScreenshotComparison): ', 'IMAGEDIFF', 'an error was thrown - error:  ' + error, params);
			} else {
				try {	
	 	  			console.log('"makeScreenshotComparison"   tmpFile: ' + tmpFile);

					execGetImageDimensions(tmpFile).then(function(dim) {
 						// now we have our diff image --> get the resolution and the 
						// number of red pixels
		 	  			console.log('"execGetImageDimensions"   countPixel: ' +JSON.stringify(dim)); 

						try {
							execCountPixels(tmpFile).then(function(countPixel) {
				 	  			console.log('"makeScreenshotComparison"   countPixel: ' +countPixel); 
								
								var diffPercentage = countPixel / (dim.width * dim.height) * 100; 
				 	  			console.log('"makeScreenshotComparison"   diffPercentage: ' +diffPercentage);
			 	 	 			var diffPercentage1 = diffPercentage.toFixed(5); 
			 	 	 			console.log('"makeScreenshotComparison"   diffPercentage formatted1: ' +diffPercentage1);
			 	 	 			var diffPercentage2 = pad(diffPercentage1, 5 + 1 + 3); 
			 	 	 			console.log('"makeScreenshotComparison"   diffPercentage formatted2: ' +diffPercentage2);				 	  				
				  	 			// filename for the difference file
			 	 	 			console.log('lib/utils.js  (makeScreenshotComparison)');

			 	 	 			filename = 'difference' + '_' + diffPercentage2  + '_' + prefix + '_' + filename + '_' + ts + '.' + ext; 
			 	 	 			console.log('lib/utils.js  (makeScreenshotComparison)');

			 	 	 			var fullpath = fulldirectory + '/' + filename; 
				 	 	 			
			 	 	 			// thats the result of out function
			 	 	 			var json = {
			 	 	 				png1	 	: png1,	
			 	 	 				png2 		: png2,
				 	 	 			difference	: fullpath,
				 	 	 			imgfilename	: filename,
				 	 	 			imgdirectory : fulldirectory,
				 	 				width 			: dim.width,
			 		  	 			height			: dim.height,
				  	  	 			countPixel 		: countPixel,
				 	  	 			percDiff		: diffPercentage2
				 		 		}  
				 	 	 			
			 	 	 			fs.renameSync(tmpFile, fullpath);
			 	 	 			console.log('lib/utils.js  (makeScreenshotComparison)');

			 	 				deferred.resolve(json); 
			 	 				logger.logJob('lib/utils.js  (makeScreenshotComparison): ', 'FINISHED', '', ''); 
							}); 
						}
						catch (error) {
		 	 	 			console.log('lib/utils.js  (makeScreenshotComparison): execGetImageDimensions   error : ' +error);
		 	 	 			console.log('lib/utils.js  (makeScreenshotComparison):  execGetImageDimensions  error.stack : ' +error.stack);
						}
  					}, function (error) {
	 	 	 			console.log('lib/utils.js  (makeScreenshotComparison):  execGetImageDimensions  prmoise rejected! err: ' +err);
 
  					}); 
				}
				catch (error) {
 	 	 			console.log('lib/utils.js  (makeScreenshotComparison):  execGetImageDimensions  error : ' +error);
 	 	 			console.log('lib/utils.js  (makeScreenshotComparison):  execGetImageDimensions  error.stack : ' +error.stack);
				}
  			}
 		});
 		return deferred.promise;
 	}

 	function *execConvertMergeImages(entry, host, fulldirectory, ts) {
 		var deferred = Q.defer();
 		
		logger.logJob('lib/utils.js  (execConvertMergeImages): ', 'STARTED', ' ', '');

 		// convert +append in-*.jpg out.jpg

 		var prefix = entry.uid1 + '_' + entry.uid2; 
 		var ext = 'png'; 
 
  		var filename = yield makeFilename(entry.path);
  		var filename = 'allinone' + '_' + entry.percDiff + '_' + prefix + '_' + filename + '_' + ts + '.' + ext; 
   		var fullpath = fulldirectory + '/' + filename; 
   		var png1 = config.directories.screenShotDir + '/' + entry.imgdirectory1 +  '/' + entry.imgfilename1;
   		var png2 = config.directories.screenShotDir + '/' + entry.imgdirectory2 +  '/' + entry.imgfilename2;
   		// thats the diff image
   		var png3 = entry.difference;
   		
   		entry.imgfilenameallinone = filename;
 
  		var cmd = '###COMMAND### ###FILENAME1### ###FILENAME2### ###FILENAME3### ###OUT###';
 		
	 	cmd = cmd.replace('###COMMAND###', '+append');
	 	cmd = cmd.replace('###FILENAME1###', png1);
	 	cmd = cmd.replace('###FILENAME2###', png2);
	 	cmd = cmd.replace('###FILENAME3###', png3);
	 	cmd = cmd.replace('###OUT###', fullpath);
 
	 	console.log('"utils.execConvertMergeImages"    cmd ' + JSON.stringify(cmd, null, 4));
	 	
	 	var cmdArray = cmd.split(' ');
  		
 		// image magick convert
 		var spawn = require('child_process').spawn;
 		var convert = spawn('convert', cmdArray);
 
		convert.on('close', function (code) {
 			//cess exited with code ' + code)
 			// console.log('"utils.execConvertMergeImages" convert.on("close"):   code    '+ code);
	 		if (code == 0)  {
	 			deferred.resolve(entry); 
	 			console.log('"utils.execConvertMergeImages" success   convert.on("close"):   code    '+ code);
	 			logger.logJob('lib/utils.js  (execConvertMergeImages): ', 'FINISHED', '', '');
	 		} else {
	 			deferred.resolve(false); 
	 			// console.log('"utils.execConvertMergeImages" error  convert.on("close"):   code    '+ code);
	 			logger.logJob('lib/utils.js  (execConvertMergeImages): ', 'ABORTED', '' , '');
			 	logger.logError('lib/utils.js  (execConvertMergeImages): ', 'IMAGEDIFF', 'an errorcode was returned. code:  ' + code, cmd);
 	 		}
 		}); 
 		return deferred.promise;
 	}
 	
 	function execGetImageDimensions(filename) {
 		var deferred = Q.defer();
 		
		logger.logJob('lib/utils.js  (execGetImageDimensions): ', 'STARTED', ' ', '');

 		// identify IAMGENAME
 
		// this is not working with all the cmd parameters
  		// var cmd = '###CMD### ###OPTIONS1### ###OPTIONS2### ###FILENAME###'; 
		// "%w\n%h\n"
		// var options1 = '"%w';
		// var options2 = ' %h"';
		
		// this works, but is "more difficult" to extract the dimensions
		var cmd = '###FILENAME###'; 

 	 	cmd = cmd.replace('###FILENAME###', filename); 

	 	console.log('"utils.execGetImageDimensions"    cmd ' +  cmd );
	 	
	 	var cmdArray = cmd.split(' ');
  		
 		// image magick convert
 		var spawn = require('child_process').spawn;
 		var convert = spawn('identify', cmdArray);
 		
		var response = ''; 
		convert.stdout.on('data', function (data) { 
 			try {
				response += data.toString();
				console.log('"utils.execGetImageDimensions"   convert.stdout.on  data: '+ data.toString() );
			}
			catch (error) {
				console.log('"utils.execGetImageDimensions"   ERROR in convert.stdout.on  data: error: ' +error ); 
			}
		});
 		
		convert.stderr.on('data', function (data) { 
			try {
				response += data.toString();
				console.log('"utils.execGetImageDimensions"   convert.stderr.on  data: '+ data.toString() );
			}
			catch (error) {
				console.log('"utils.execGetImageDimensions"   ERROR in convert.stderr.on  data: '  ); 
			} 
		});

		convert.on('close', function (code) {
 			//cess exited with code ' + code)
 			console.log('"utils.execGetImageDimensions" convert.on("close"):   response    '+ response);
	 		if (code == 0)  {
 	 			var dim = response.split(' ');
 	 			var bla = dim[2];
 	 			dim = bla.split('x');
 	 			var res = {
	 				width : dim[0],
	 				height: dim[1]
	 			}
	 			deferred.resolve(res); 
	 			console.log('"utils.execGetImageDimensions" success   convert.on("close"):   code    '+ code);
	 			logger.logJob('lib/utils.js  (execGetImageDimensions): ', 'FINISHED', '', '');

	 		} else {
	 			deferred.resolve(false); 
	 			// console.log('"utils.execGetImageDimensions" error  convert.on("close"):   code    '+ code);
	 			logger.logJob('lib/utils.js  (execGetImageDimensions): ', 'ABORTED', '' , '');
			 	logger.logError('lib/utils.js  (execGetImageDimensions): ', 'IDENTIFY', 'an errorcode was returned. code:  ' + code, cmd);
 	 		}
 		}); 
 		return deferred.promise;
 	} 
 	
 	function execCountPixels(filename) {
 		var deferred = Q.defer();
 		
		logger.logJob('lib/utils.js  (execCountPixels): ', 'STARTED', ' ', '');

 		// identify IAMGENAME
 
  		var cmd = '###FILENAME### ###OPTIONS###'; 
 		
  		var options = '-fill black +opaque rgb(255,0,0) -fill white -opaque rgb(255,0,0) -format %[fx:w*h*mean] info:';
  		
  		cmd = cmd.replace('###OPTIONS###', options); 
 	 	cmd = cmd.replace('###FILENAME###', filename); 

	 	console.log('"utils.execCountPixels"    cmd ' +  cmd );
	 	
	 	var cmdArray = cmd.split(' ');
  		
 		// image magick convert
 		var spawn = require('child_process').spawn;
 		var convert = spawn('convert', cmdArray);
 		
		var response=null;
 		
		convert.stderr.on('data', function (data) { 
			// response += data.toString();
 			console.log('"utils.execCountPixels" convert.stderr.on  response    '+ response);
		});

		convert.stdout.on('data', function (data) { 
 			response = data.toString();
			console.log('"utils.execCountPixels"   stdout.on(.on  data: '+ data.toString() )	 
		});
		
		convert.on('close', function (code) {
 			//cess exited with code ' + code)
 			console.log('"utils.execCountPixels" convert.on("close"):   code    '+ code);
 			console.log('"utils.execCountPixels" convert.on("close"):   response    '+ response);

	 		if (code == 0)  {
	 			deferred.resolve(response); 
	 			console.log('"utils.execCountPixels" success   convert.on("close"):   code    '+ code);
	 			logger.logJob('lib/utils.js  (execCountPixels): ', 'FINISHED', '', '');

	 		} else {
	 			deferred.resolve(false); 
	 			// console.log('"utils.execCountPixels" error  convert.on("close"):   code    '+ code);
	 			logger.logJob('lib/utils.js  (execCountPixels): ', 'ABORTED', '' , '');
			 	logger.logError('lib/utils.js  (execCountPixels): ', 'IDENTIFY', 'an errorcode was returned. code:  ' + code, cmd);
 	 		}
 		}); 
 		return deferred.promise;
 	}
 	 	
  	function *getAllExternalLinks(domainuid) {
		var sql; 
		var res;
		try {
			yield db.connect();
 			sql =  'SELECT uid, linkurl FROM ' + config.dbTableNames.pagecontent + ' ';
			sql += 'WHERE contenttype = "' + config.contenttype.externallink + '" AND status IS NULL ';
			sql += 'GROUP BY linkurl ';
			sql += 'ORDER BY created DESC '; 
			// TODO remove limit -> only for testing purposes
			// sql += 'LIMIT 100';
			console.log ('"getAllExternalLinks" - sql:  ' +sql);
			res = yield db.query(sql);
			console.log ('"getAllExternalLinks" - res:  ' +JSON.stringify(res, null, 4));

			yield db.disconnect();
		}
		catch (error){
			console.log ('"getAllExternalLinks" - error :  ' +error);
			console.log ('"getAllExternalLinks" - error.stack :  ' +error.stack); 
		}
		return yield Promise.resolve(res);
	}
 	
    return {
    	getTmpFilename				: getTmpFilename,
    	makeFilenameAsync			: makeFilenameAsync,
    	waitForMe					: waitForMe,
     	curlURL						: curlURL,
     	analyzeHtml					: analyzeHtml,
    	makeScreenshot				: makeScreenshot,
    	makeDirectory				: makeDirectory,
    	makeScreenshotComparison 	: makeScreenshotComparison,
    	execConvertMergeImages		: execConvertMergeImages,
    	takeABreak					: takeABreak,
    	execGetImageDimensions		: execGetImageDimensions,
    	readFile					: readFile,
    	getAllExternalLinks			: getAllExternalLinks
    };
}();
