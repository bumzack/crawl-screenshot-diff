'use strict';

const config = require('../config');

var fs = require('fs');
var utils = require('./utils');

module.exports = function()
{
 	function logJob(str1, str2, str3, json1) {
		var ts = new Date();
		var d = ts.toUTCString();
 		var s = d +'\t' + str1 +'\t' + str2+ '\t' + str3+ '\t' + JSON.stringify(json1) +'\n';
		fs.appendFile(config.log.jobs, s);
 		s = 'JOB '+'\t' + d +'\t' + str1 +'\t' + str2+ '\t' + str3+ '\t' + JSON.stringify(json1) +'\n';
		fs.appendFile(config.log.full, s);
 	}
 
	function logError(str1, str2, str3, json1) {
		var ts = new Date();
		var d = ts.toUTCString();
 		var s = d +'\t' + str1 +'\t' + str2+ '\t' + str3+ '\t' + JSON.stringify(json1) +'\n';
		fs.appendFile(config.log.error, s);
 		s = 'ERROR' +'\t'+ d +'\t' + str1 +'\t' + str2+ '\t' + str3+ '\t' + JSON.stringify(json1) +'\n';
		fs.appendFile(config.log.full, s);
	}
	
	function logInfo(str1, str2, str3, json1) {
		var ts = new Date();
		var d = ts.toUTCString();
 		var s = d +'\t' + str1 +'\t' + str2+ '\t' + str3+ '\t' + JSON.stringify(json1) +'\n';
		fs.appendFile(config.log.info, s);
 		s = 'INFO'+'\t' + d +'\t' + str1 +'\t' + str2+ '\t' + str3+ '\t' + JSON.stringify(json1) +'\n';
		fs.appendFile(config.log.full, s);
 	}  
		
	return {
		logJob		: logJob,
	    logError	: logError,
	    logInfo		: logInfo 
    };
}();