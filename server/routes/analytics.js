'use strict';

const body_parser = require('co-body');
var db = require('../lib/db'); 
var utils = require('../lib/utils');
var analytics = require('../lib/analytics');
var Q = require('q');
var co = require('co');

exports.addRoutes = function(app, config, jwt) {
	app.get('/websites/:domainuid', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_ANALYTICS) >= 0) || (this.state.user.admin == true))) {
			// console.log('POST /startjob - user is not allowed to access PAGE_PAGES -> denied');
			this.body = 'GET /websites - user is not allowed to access PAGE_ANALYTICS -> denied';
		 	this.status = 401;
		} else {
			var uid = this.params.uid;
  
 			console.log('GET /websites - calling "pages.getWebsites()"');
 			
 			var res = yield analytics.getWebsites(uid);
			 
 			console.log('GET /websites - returned from  "pages.getWebsites()"');
  
			this.response.body = res;
			this.response.status = 200;
		}
    });
	
	app.get('/websites', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		console.log('GET /websites - this' + JSON.stringify(this));
		console.log('GET /websites - this.state' + JSON.stringify(this.state));
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_ANALYTICS) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /startjob - user is not allowed to access PAGE_ANALYTICS -> denied');
			this.body = 'GET /websites - user is not allowed to access PAGE_ANALYTICS -> denied';
		 	this.status = 401;
		} else {
			console.log('GET /websites - calling "pages.getWebsites()"');
 			
 			var res = yield analytics.getWebsites();
			 
 			console.log('GET /websites - returned from  "pages.getWebsites()"');
  
			this.response.body = res;
			this.response.status = 200;
		}
    });
	
	app.post('/pages', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_ANALYTICS) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /startjob - user is not allowed to access PAGE_ANALYTICS -> denied');
			this.body = 'POST /pages - user is not allowed to access PAGE_ANALYTICS -> denied';
		 	this.status = 401;
		} else {
			var body = yield body_parser(this);

 			console.log('POST /pages - calling "pages.getPages()"');
 			
 			// this is the jobuid the user has selected
 			var jobuid = body.selectedWebsite.uid;
 			var maxNumber = 250	;
 			if (body.numberPages !== undefined) {
 	 			maxNumber = body.numberPages.maxCount; 
 			}

 			var websites = yield analytics.getPages(jobuid, maxNumber);
 			
 			var res = {
 				websites			: websites, 
 				screenShotDirClient : config.directories.screenShotDirClient
 			}
 			
 			console.log('POST /pages - returned from  "pages.getPages()"');
  
			this.response.body = res;
			this.response.status = 200;
		}
    });
	
	app.post('/screencomparisons', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_ANALYTICS) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /startjob - user is not allowed to access PAGE_ANALYTICS -> denied');
			this.body = 'GET /websites - user is not allowed to access PAGE_ANALYTICS -> denied';
		 	this.status = 401;
		} else {
			console.log('GET /websites - calling "pages.getWebsites()"');
			
 			var body = yield body_parser(this);
 
 			// this is the jobuid the user has selected
 			var jobuid = body.selectedComparison.uid;
 			var maxNumber = 250	;
 			if (body.numberPages !== undefined) {
 	 			maxNumber = body.numberPages.maxCount; 
 			}
  			var websites = yield analytics.getComparisons(jobuid, maxNumber);
 			
 			var res = {
 				websites: websites, 
 				screenShotDirClient : config.directories.screenShotDirClient
 			}
 			console.log('GET /websites - returned from  "pages.getWebsites()"');
  
			this.response.body = res;
			this.response.status = 200;
		}
    });
}
