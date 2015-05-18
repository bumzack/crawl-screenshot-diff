'use strict';

const body_parser = require('co-body');
var db = require('../lib/db'); 
var utils = require('../lib/utils');
var blacklist = require('../lib/blacklist');
var Q = require('q');
var co = require('co');

exports.addRoutes = function(app, config, jwt) {
	app.post('/blacklist', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_BLACKLIST) >= 0) || (this.state.user.admin == true))) {
			console.log('POST /blacklist - user is not allowed to access PAGE_BLACKLIST -> denied');
			this.body = 'POST /blacklist - user is not allowed to access PAGE_BLACKLIST -> denied';
		 	this.status = 401;
		} else {
			console.log('POST /blacklist - start : ');
			
			var body = yield body_parser(this);
			var useruid = this.state.user.uid; 

			console.log('POST /blacklist - this.path: ' + this.path);
			console.log('POST /blacklist - this.method: ' + this.method);
			console.log('POST /blacklist - body : ' + JSON.stringify(body));
			 
			var res = yield blacklist.insertWordlist(useruid, body.wordlist);
			
 			this.response.status = 200;
		}
    }); 
	
	app.get('/blacklist', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_BLACKLIST) >= 0) || (this.state.user.admin == true))) {
			console.log('GET   /blacklist - user is not allowed to access PAGE_BLACKLIST -> denied');
			this.body = 'GET   /blacklist - user is not allowed to access PAGE_BLACKLIST -> denied';
		 	this.status = 401;
		} else {
			var res = yield blacklist.getWordlist();
			this.body = res; 
			this.status = 200;  
 		}
    }); 
	
	app.delete('/blacklist/:uid', jwt({ secret: config.appSecret, passthrough: false }), function *(next) {
		if (!((this.state.user.accessrights.indexOf(config.pages.PAGE_BLACKLIST) >= 0) || (this.state.user.admin == true))) {
			console.log('DELETE   /blacklist - user is not allowed to access PAGE_BLACKLIST -> denied');
			this.body = 'DELETE   /blacklist - user is not allowed to access PAGE_BLACKLIST -> denied';
		 	this.status = 401;
		} else {
 			
			console.log('DELETE /blacklist - this.path: ' + this.path);
			console.log('DELETE /blacklist - this.method: ' + this.method);
			console.log('DELETE /blacklist - uid : ' + JSON.stringify(uid));
			
			var uid = this.params.uid;
			var useruid = this.state.user.uid; 
			
			var res = yield blacklist.deleteWord(uid);
			
			this.body = res; 
			this.status = 200;  
 		}
    });	
}
