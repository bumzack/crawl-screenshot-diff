'use strict';

const koa = require('koa');
const app = koa();

var https = require('https');

var jwt = require('koa-jwt');
const config = require('./config');
var fs = require('fs');

var util = require('util');

var static_files_serve = require('koa-static');

console.log('clientDir: ' + config.directories.clientDir);

var forceSSL = require('koa-force-ssl');

//SSL options
var options = {
  key: fs.readFileSync('./crawlscreen.key'),
  cert: fs.readFileSync('./crawlscreen.crt')
}

app.use(forceSSL());

// ERROR handling
app.use(function *(next) {
	// console.log('error handler ');
	//try {
		//console.log('error handler yield next');
		yield next;
		
	//} catch (err) {
//		if (401 == err.status) {
//			console.log('error handler got an error: ' + err + ' when calling URL: %s \t METHOD: %s \t STATUS: %s', this.url, this.method, this.status);
//			this.status = 401;
//			this.body = 'Protected resource, use Authorization header to get access\n';
//	    } else {
//	    	console.log('error handler throwing an error: ' + err);
//	    	var ts = new Date.getTime();
//	    	var s = 'IP: ' + this.ip + '\t TIMESTAMP: '+ts+ '\t URL: '+this.url+'\t METHOD: ' + this.method + '\t STATUS: '+this.status;
//	    	s += '\t ERROR: ' + err + '\n';
//	    	fs.appendFile(config.log.error, s); 
//	    	// throw err;
//	    }
//	}
});

// write ACCESS log
app.use(function *(next) {
 	var start = new Date;
	var ts = start.getTime();
	yield next;
	var ms = new Date - start; 
	// write log file
	var s = 'IP: ' + this.ip + '\t DATE: '+start + '\t TIMESTAMP: '+ts+'\t duration: '+ms+' ms\t URL: '+this.url+'\t METHOD: ' + this.method + '\t STATUS: '+this.status + '\n';  
	fs.appendFile(config.log.access, s); 
});
  
// serve static files (html, js, css) 
app.use(static_files_serve(config.directories.clientDir));

//include routes from "route" directory 
var router = require('koa-router');
app.use(router(app));

//our own routes: without authentication
var routes_authentication = require('./routes/authentication');
routes_authentication.addRoutes(app, config, jwt);
 
//our own routes: with basic-user authentication
var route_jobs 		= require('./routes/jobs');
var route_domains	= require('./routes/domains');
var route_blacklist	= require('./routes/blacklist');
var route_analytics	= require('./routes/analytics');
var route_seo		= require('./routes/seo');

route_jobs.addRoutes(app, config, jwt);
route_domains.addRoutes(app, config, jwt);
route_blacklist.addRoutes(app, config, jwt);
route_analytics.addRoutes(app, config, jwt);
route_seo.addRoutes(app, config, jwt);

//our own routes: with ADMIN authentication
var routes_user = require('./routes/user');
routes_user.addRoutes(app, config, jwt);

// start server on port 

app.server = https.createServer(options, app.callback()).listen(config.server.listenPort);
 
