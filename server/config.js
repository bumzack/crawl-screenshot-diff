'use strict';

var path = require('path');

module.exports = {

	server : {
		listenPort : 3000  
	},
	
	directories : {
		clientDir : path.resolve(__dirname, '../client'),
		tmpDir    : path.resolve(__dirname, '../server/tmp/'),
		screenShotDir : path.resolve(__dirname, '../client/img/screenshots/'),
		screenShotDirClient : 'img/screenshots/'
 	},
 	
 	binaries : {
 		phantomjs : path.resolve(__dirname, '../node_modules/phantomjs-1.9.7-macosx/bin/phantomjs') 
 	},
	
	database : {
		username 	: 'crawlscreendiff',
		password 	: 'crawlscreendiff',
		database 	: 'crawlscreendiff',
		host 		: 'localhost',
		socketPath 	: ''				 // '/run/mysqld/mysqld.sock'
	},
	
	dbTableNames  : {
		jobs 					: 'crawl_jobs',
		domains					: 'crawl_domains',
		user 					: 'crawl_user',
		pages					: 'crawl_allpages',
		blacklist				: 'crawl_blacklist',
		pagecontent				: 'crawl_pagecontent',
		screenshotcomparison 	: 'crawl_screenshotcomparison',
		seowords				: 'crawl_seowords',
		seowords_used_in_pagecontent 	: 'crawl_seowords_used_in_pagecontent'
	},
	
	jobtypes : {
		crawljob 		: 'crawljob',
		screenshotjob 	: 'screenshotjob',
		comparejob 		: 'comparejob'
	},
	
	contenttype : {
		internallink 	: 'internallink',
		externallink 	: 'externallink', 
		title 	: 'title',
		h1 		: 'h1', 
		h2 		: 'h2', 
		h3 		: 'h3', 
		h4 		: 'h4', 
		h5 		: 'h5',
		p 		: 'p',
		form 	: 'form' ,
		image	: 'image',
		pagename : 'pagename'
	},
	
	jobstatus : {
		running 		: 'running',
		finished 		: 'finished',
		paused			: 'paused'
	},
	
	appSecret : 'crawlScreenshotApp',
	
	token_expiration:  90 * 24 * 60,		/* 90 days */
	
	log : {
		access  : 'log/access.log',
		error   : 'log/error.log',
		db		: 'log/db.log',
		info	: 'log/info.log',
		jobs	: 'log/jobs.log',
		full	: 'log/full.log'
	},
	 
	pages : {
		PAGE_JOBS 		: 'PAGE_JOBS',
		PAGE_ANALYTICS	: 'PAGE_ANALYTICS',
		PAGE_DOMAIN		: 'PAGE_DOMAIN',
		PAGE_BLACKLIST	: 'PAGE_BLACKLIST',
		PAGE_SEO		: 'PAGE_SEO'
	},
	
	scripts : {
		scriptMakeScreenshot : path.resolve(__dirname, 'scripts/makescreenshot.js')
	},
	
	startHtml : '<html',
	
	curljobMaxarraylength : 50,
	
	curljobPausebetweenRequests : 500,
	
	linktype : {
		externallink 	: 'externallink',
		internallink 	: 'internallink',
		image		 	: 'image',
		unknown			: 'unknown',
		video			: 'video',
		audio			: 'audio',
		pdf				: 'pdf',
		news			: 'news',
		page		 	: 'page'
	},
	
	linktarget : {
		externallink 	: 'externallink',
		internallink 	: 'internallink',
		image		 	: 'image',
		unknown			: 'unknown',
		video			: 'video',
		audio			: 'audio',
		pdf				: 'pdf',
		news			: 'news',
 		email		 	: 'email',
 		page		 	: 'page'
	},
	
	fileextensions : {
		images 	: ['.png', '.jpg', '.jpeg', '.gif'],
		pages	: ['.htm', '.html', '.php'],
		pdf		: ['.pdf' ],
		audio 	: ['.mp3' ],
		video	: ['.mp4', '.flv' ]
	},
	
	blackListCharactersforInternalLinks : [],
	
	whiteListNewsLinks : [],

	takeabreak : {
		start 	: {
			hour 	: 2,
			minute 	: 55
		},
		end 	: {
			hour 	: 3,
			minute 	: 20
		}
	}, 
	
  	useProxy : false
};
