'use strict';

const body_parser = require('co-body');
var db = require('../lib/db'); 
var utils = require('../lib/utils');
var seo = require('../lib/seo');
var Q = require('q');
var co = require('co');

exports.addRoutes = function(app, config, jwt) {
	app.get('/seocrawljobs', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_SEO) >= 0) || (this.state.user.admin == true))) {
			// console.log('POST /startjob - user is not allowed to access PAGE_SEO -> denied');
			this.body = 'GET /seocrawljobs - user is not allowed to access PAGE_SEO -> denied';
		 	this.status = 401;
		} else {
 			var useruid = this.state.user.uid; 
			 
 			console.log('GET /seowords - calling "seo.getCrawlJobs"');
 			
			var res = yield seo.getCrawlJobs();
			
 			console.log('GET /seowords - returned from  "seo.getCrawlJobs"');
 	 
 			this.response.body = res;
			this.response.status = 200;
		}
    }); 
 
	app.post('/seokeywords', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_SEO) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /seokeywords - user is not allowed to access PAGE_SEO -> denied');
			this.body = 'POST /seokeywords - user is not allowed to access PAGE_SEO -> denied';
		 	this.status = 401;
		} else {
			console.log('POST /seokeywords - start : ');
			try {
				var body = yield body_parser(this);
				var jobuid = body.jobuid; 
				var numberKeywords = body.numberKeywords;
				
				console.log('POST /seokeywords - body : ' + JSON.stringify(body));
	 			console.log('POST /seokeywords - this.path: ' + this.path);
				console.log('POST /seokeywords - this.method: ' + this.method);
				 
				var res = yield seo.getKeywords(jobuid, numberKeywords);
				
	 			this.response.status = 200;
	 			this.response.body = res;
			} 
			catch (error) {
				console.log('POST /seokeywords - body: error : ' + error.stack)
			}
		}
    }); 
	
	app.post('/seokeywordsperpage', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_SEO) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /seokeywordsperpage - user is not allowed to access PAGE_SEO -> denied');
			this.body = 'POST /seokeywordsperpage - user is not allowed to access PAGE_SEO -> denied';
		 	this.status = 401;
		} else {
			console.log('POST /seokeywordsperpage - start : ');
			try {
				var body = yield body_parser(this);
				var jobuid = body.jobuid; 
				var numberKeywords = body.numberKeywords;
				
				console.log('POST /seokeywordsperpage - body : ' + JSON.stringify(body));
	 			console.log('POST /seokeywordsperpage - this.path: ' + this.path);
				console.log('POST /seokeywordsperpage - this.method: ' + this.method);
				 
				var res = yield seo.getKeywordsPerPage(jobuid, numberKeywords);
				
	 			this.response.status = 200;
	 			this.response.body = res;
			} 
			catch (error) {
				console.log('POST /seokeywordsperpage - body: error : ' + error.stack)
			}
		}
    }); 
	
	app.post('/seokeywordsperpagebycontenttype', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_SEO) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /seokeywordsperpagebycontenttype - user is not allowed to access PAGE_SEO -> denied');
			this.body = 'POST /seokeywordsperpagebycontenttype - user is not allowed to access PAGE_SEO -> denied';
		 	this.status = 401;
		} else {
			console.log('POST /seokeywordsperpagebycontenttype - start : ');
			try {
				var body = yield body_parser(this);
				var jobuid = body.jobuid; 
				var numberKeywords = body.numberKeywords;
				
				var res = []; 
				console.log('POST /seokeywordsperpagebycontenttype - body : ' + JSON.stringify(body));
	 			console.log('POST /seokeywordsperpagebycontenttype - this.path: ' + this.path);
				console.log('POST /seokeywordsperpagebycontenttype - this.method: ' + this.method);
				
 				// try different combinations of html nodes
				var contentTypes  = [config.contenttype.pagename, config.contenttype.title, config.contenttype.h1, config.contenttype.h2, config.contenttype.p];
				console.log('POST /seokeywordsperpagebycontenttype - this.method: 1   contentTypes  -  ' + contentTypes);
				var result = yield seo.getKeywordsPerPageByContentType(jobuid, numberKeywords, contentTypes);

 				var entry = {
 					criteria	: contentTypes.join(' and '),
 					pages		: result
 				}
				res.push(entry);
				
				var contentTypes  = [config.contenttype.pagename, config.contenttype.title, config.contenttype.h1, config.contenttype.p];
				console.log('POST /seokeywordsperpagebycontenttype - this.method: 2   contentTypes  -  ' + contentTypes);
				var result = yield seo.getKeywordsPerPageByContentType(jobuid, numberKeywords, contentTypes);
				
 				var entry = {
 					criteria	: contentTypes.join(' and '),
 					pages		: result
 				}
				res.push(entry);
				
				var contentTypes  = [config.contenttype.title, config.contenttype.h1, config.contenttype.p];
				console.log('POST /seokeywordsperpagebycontenttype - this.method: 3    contentTypes  -  ' + contentTypes);
				var result = yield seo.getKeywordsPerPageByContentType(jobuid, numberKeywords, contentTypes);
				
 				var entry = {
 					criteria	: contentTypes.join(' and '),
 					pages		: result
 				}
				res.push(entry);
				
				var contentTypes  = [config.contenttype.title, config.contenttype.h1, config.contenttype.h2, config.contenttype.p];
				console.log('POST /seokeywordsperpagebycontenttype - this.method: 4    contentTypes  -  ' + contentTypes);
				var result = yield seo.getKeywordsPerPageByContentType(jobuid, numberKeywords, contentTypes);
				
 				var entry = {
 					criteria	: contentTypes.join(' and '),
 					pages		: result
 				}
				res.push(entry);
				
				var contentTypes  = [config.contenttype.h1, config.contenttype.h2, config.contenttype.p];
				console.log('POST /seokeywordsperpagebycontenttype - this.method: 5     contentTypes  -  ' + contentTypes);
				var result = yield seo.getKeywordsPerPageByContentType(jobuid, numberKeywords, contentTypes);
				
				var entry = {
					criteria	: contentTypes.join(' and '),
					pages		: result
				}
				res.push(entry);
				
				var contentTypes  = [config.contenttype.h1,  config.contenttype.p];
				console.log('POST /seokeywordsperpagebycontenttype - this.method: 6     contentTypes  -  ' + contentTypes);
				var result = yield seo.getKeywordsPerPageByContentType(jobuid, numberKeywords, contentTypes);
				
				var entry = {
					criteria	: contentTypes.join(' and '),
					pages		: result
				}
				res.push(entry);
				
	 			this.response.status = 200;
	 			this.response.body = res;
			} 
			catch (error) {
				console.log('POST /seokeywordsperpagebycontenttype - body: error : ' + error.stack)
			}
		}
    });
}
