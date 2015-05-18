'use strict';

const body_parser = require('co-body');
var db = require('../lib/db'); 
var utils = require('../lib/utils');
var domains = require('../lib/domains');
var Q = require('q');
var co = require('co');
var parse = require('co-busboy');
var fs = require('fs');

exports.addRoutes = function(app, config, jwt) {
	app.post('/domain', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_DOMAIN) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /domain - user is not allowed to access PAGE_DOMAIN -> denied');
			this.body = 'POST /domain - user is not allowed to access PAGE_DOMAIN -> denied';
		 	this.status = 401;
		} else {
			console.log('POST /domain - start : ');
			var body = yield body_parser(this);
			var useruid = this.state.user.uid; 
			var cronjob = body.cronjob;
			
			if (cronjob === undefined) {
				cronjob = false; 
			}

			console.log('POST /domain - this.path: ' + this.path);
			console.log('POST /domain - this.method: ' + this.method);
			console.log('POST /domain - body : ' + JSON.stringify(body));
			 
			var res = yield domains.insertDomain(useruid, body.name, cronjob);
			
 			this.response.status = 200;
		}
    }); 
	
	app.get('/domain', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_DOMAIN) >= 0) || (this.state.user.admin == true))) {
			console.log('GET   /domain - user is not allowed to access PAGE_DOMAIN -> denied');
			this.body = 'GET   /domain - user is not allowed to access PAGE_DOMAIN -> denied';
		 	this.status = 401;
		} else {
			var res = yield domains.getDomains();
			this.body = res; 
			this.status = 200;  
 		}
    }); 
	
	app.delete('/domain/:uid', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_DOMAIN) >= 0) || (this.state.user.admin == true))) {
			console.log('DELETE   /domain - user is not allowed to access PAGE_DOMAIN -> denied');
			this.body = 'DELETE   /domain - user is not allowed to access PAGE_DOMAIN -> denied';
		 	this.status = 401;
		} else {
 			
			console.log('DELETE /domain - this.path: ' + this.path);
			console.log('DELETE /domain - this.method: ' + this.method);
			console.log('DELETE /domain - uid : ' + JSON.stringify(uid));
			
			var uid = this.params.uid;
			var useruid = this.state.user.uid; 
			
			var res = yield domains.deleteDomain(uid);
			
			this.body = res; 
			this.status = 200;  
 		}
    });	
}
