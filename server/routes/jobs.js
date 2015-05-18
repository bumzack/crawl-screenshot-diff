'use strict';

const body_parser = require('co-body');
var db = require('../lib/db'); 
var utils = require('../lib/utils');
var jobs = require('../lib/jobs');
var Q = require('q');
var co = require('co');

exports.addRoutes = function(app, config, jwt) {
	app.post('/crawljob', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_JOBS) >= 0) || (this.state.user.admin == true))) {
			// console.log('POST /startjob - user is not allowed to access PAGE_JOBS -> denied');
			this.body = 'POST /startjob - user is not allowed to access PAGE_JOBS -> denied';
		 	this.status = 401;
		} else {
 			console.log('POST /crawljob');

 			var body = yield body_parser(this);
			var useruid = this.state.user.uid; 
			var url = body.selectedDomain.name; 

			var options = {
 				maxDepth		: body.depth,
				maxPages 		: body.numberpages,
				description		: body.description,
				domainuid 		: body.selectedDomain.uid,
				useruid			: useruid
			}
 			
 			console.log('POST /crawljob - calling "jobs.startcrawljob(url, options)"');
 			
			jobs.startcrawljob(url, options);
			
 			console.log('POST /crawljob - returned from  "jobs.startcrawljob(url, options)"');
 	 
 			this.response.body = "success";
			this.response.status = 200;
		}
    });   
	
	app.post('/screenshotjob', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_JOBS) >= 0) || (this.state.user.admin == true))) {
			// console.log('POST /screenshotjob - user is not allowed to access PAGE_JOBS -> denied');
			this.body = 'POST /screenshotjob - user is not allowed to access PAGE_JOBS -> denied';
		 	this.status = 401;
		} else {
 			var body = yield body_parser(this);
			var useruid = this.state.user.uid; 
			
			console.log('POST /screenshotjob - body  ' + JSON.stringify(body));
	 		
			if (body.selectedWebsite.jobtype !== config.jobtypes.crawljob) {
				this.response.body = "wrong job type - " + body.selectedJob.jobtype + ';  need a "crawljob"';
				this.response.status = 400;
			} else {
				var options = {
					screenResolution : {
						width: body.width,
						height: body.height	
					},
					domainuid : body.selectedWebsite.domainuid,
					domain 		: body.selectedWebsite.name,
					description : body.description,						
					jobuid : body.selectedWebsite.uid,
					useruid : useruid
				}
		 		console.log('POST /screenshotjob - calling "jobs.startscreenshotjob(url, options)"');
		 		console.log('POST /screenshotjob - options  ' + JSON.stringify(options));

				jobs.startscreenshotjob(options);
				
	 			console.log('POST /screenshotjob - calling "jobs.startscreenshotjob(url, options)"');
	 			
 				this.response.body = "success";
				this.response.status = 200;
			}
		}
    });   
	
	app.get('/jobs', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_JOBS) >= 0) || (this.state.user.admin == true))) {
			console.log('GET   /jobs - user is not allowed to access PAGE_JOBS -> denied');
			this.body = 'GET   /jobs - user is not allowed to access PAGE_JOBS -> denied';
		 	this.status = 401;
		} else {
			var res = yield jobs.getJobs();
			
			this.body = res; 
			this.status = 200;  
 		}
    }); 
	
	app.delete('/job/:uid', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_JOBS) >= 0) || (this.state.user.admin == true))) {
			console.log('DELETE   /job - user is not allowed to access PAGE_JOBS -> denied');
			this.body = 'DELETE   /job - user is not allowed to access PAGE_JOBS -> denied';
		 	this.status = 401;
		} else {
			console.log('DELETE /job - this.path: ' + this.path);
			console.log('DELETE /job - this.method: ' + this.method);
			console.log('DELETE /job - uid : ' + JSON.stringify(uid));
			
			var uid = this.params.uid;
			console.log('DELETE /job - uid : ' + uid);
			var useruid = this.state.user.uid; 
			
			var res = yield jobs.deleteJob(uid);
			
			this.body = res; 
			this.status = 200;  
 		}
    });	 
	
	app.get('/comparescreenshotsjob/:uid', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_JOBS) >= 0) || (this.state.user.admin == true))) {
			// console.log('GET /screenshotjob - user is not allowed to access PAGE_JOBS -> denied');
			this.body = 'GET /comparescreenshotsjob - user is not allowed to access PAGE_JOBS -> denied';
		 	this.status = 401;
		} else {
			var body = yield body_parser(this);
			var useruid = this.state.user.uid; 
			console.log('GET /comparescreenshotsjob - body  ' + JSON.stringify(body));
 			 
			var res = yield jobs.getComparisons(jobuid);
			var duration = (new Date().getTime()) - start; 
			
			this.response.body = "success";
			this.response.status = 200;
		}
    });  
	
	app.post('/comparescreenshotsjob', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_JOBS) >= 0) || (this.state.user.admin == true))) {
			// console.log('POST /screenshotjob - user is not allowed to access PAGE_JOBS -> denied');
			this.body = 'POST /screenshotjob - user is not allowed to access PAGE_JOBS -> denied';
		 	this.status = 401;
		} else {
			var body = yield body_parser(this);
			var useruid = this.state.user.uid; 
			
			console.log('POST /comparescreenshotsjob - body  ' + JSON.stringify(body));
	 	 
			var options = {
				jobuid1 	: body.selectedWebsiteSet1.uid,
				jobuid2		: body.selectedWebsiteSet2.uid,
				useruid 	: useruid,
				description	: body.description,
				domain		: body.selectedWebsiteSet1.name,
				domainuid	: body.selectedWebsiteSet1.domainuid
			}
		 	console.log('GET /comparescreenshotsjob - calling "jobs.startcomparescreenshotjob(url, options)"');
			console.log('GET /comparescreenshotsjob - options  ' + JSON.stringify(options, null, 4));
			
			jobs.startcomparescreenshotjob(options);
				
	 		console.log('POST /comparescreenshotsjob - calling "jobs.startcomparescreenshotjob(url, options)"');
	 		
	 		var duration = (new Date().getTime()) - start; 
			this.response.body = "success";				
			this.response.status = 200;
		}
    }); 
}
