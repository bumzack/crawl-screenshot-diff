'use strict';

const config = require('../config');

var db = require('../lib/db');
var utils = require('../lib/utils');
var logger = require('../lib/logger');


var mysql = require('mysql');

var urlparser = require('url');
var fs = require('fs');

module.exports = function()
{ 
	function splitTextInWords(s) {
		// first replace special characters 
		s = s.replace(/ /g," ");
		s = s.replace(/\'/g," ");
		s = s.replace(/\"/g," ");
		s = s.replace(/ä/g,"ae");
		s = s.replace(/ö/g,"oe");
		s = s.replace(/ü/g,"ue");
		s = s.replace(/ß/g,"ss");
		s = s.replace(/€/g,"euro");
		s = s.replace(/\§/g," ");
		s = s.replace(/\?/g," ");
		s = s.replace(/\!/g," ");
		s = s.replace(/\$/g," ");
		s = s.replace(/\%/g," ");
		s = s.replace(/\&/g," ");
		s = s.replace(/\//g," ");
		s = s.replace(/\(/g," ");
		s = s.replace(/\)/g," ");
		s = s.replace(/\+/g," ");
		s = s.replace(/\~/g," ");
		s = s.replace(/\´/g," ");
		s = s.replace(/\`/g," ");
		s = s.replace(/,/g," ");
		s = s.replace(/:/g," ");
		s = s.replace(/\./g," ");
		s = s.replace(/ - /g," ");
		s = s.replace(/-/g," ");
		s = s.replace(/[0-9]/g," ");

		// multiple spaces replaced with one
		s = s.replace(/ +(?= )/g,'');
		s = s.toLowerCase(); 
		
		var arr = s.split(' ');
		return arr; 
	}
	
	
	// there has to be a smarter way to do this. 
	// this is just brute force ....
	function *updatewordlist( ) {
 		console.log('"updatewordlist" - START: ');

 		yield db.connect();
		var sql = 'SELECT contenttext, contenttype, uid, pageuid FROM ' + config.dbTableNames.pagecontent + ' WHERE (deleted = FALSE  OR deleted IS NULL) AND (inwordlist = FALSE OR inwordlist IS NULL)';
 		console.log('"updatewordlist" - sql : ' + sql);

		var dummy = yield db.query(sql);
 		console.log('"updatewordlist" - new words: ' + JSON.stringify(dummy));
  		
 		var sql = 'SELECT uid, word FROM ' + config.dbTableNames.seowords + ' WHERE (deleted = FALSE)';
		var dummyExistingWords = yield db.query(sql);
 		console.log('"updatewordlist" - sql : ' + sql);
 		console.log('"updatewordlist" - dummyExistingWords: ' + JSON.stringify(dummyExistingWords));
 		
   		var sql = 'SELECT  word FROM ' + config.dbTableNames.blacklist + ' WHERE (deleted = FALSE)';
		var blacklistWords = yield db.query(sql);
		console.log('"updatewordlist" - sql : ' + sql);
 		console.log('"updatewordlist" - blacklistWords: ' + JSON.stringify(blacklistWords));

   		console.log('"updatewordlist" - existingWords: ' + JSON.stringify(dummyExistingWords, null,4));
		
  		var existingWords = new Set();
    	for (var i = 0; i < dummyExistingWords.length; i++) {
  			existingWords.add(dummyExistingWords[i].word);
 		}
    		
  		var newWords = new Set();
 		var wordArray = [];
 		var arr; 
 		for (var i = 0; i < dummy.length; i++) {
 			arr = splitTextInWords(dummy[i].contenttext);
 			for (var j = 0; j < arr.length; j++) {
 				newWords.add(arr[j].trim());
 			}
  		} 
   		
   		// remove all words from the blacklist
   		for (var i = 0; i < blacklistWords.length; i++) {
   			if (newWords.has(blacklistWords[i])) {
   				newWords.delete(blacklistWords[i])
   			}
   		}
   		 
   		// in missingWords we collect the missing words in table "seowords"
   		// we remove the words, which already exist in the table
   		
   		var missingWords = newWords;
   		
   		// check which words are already in our "seowords" table
   		for (let existingWord of existingWords) {
      		if (missingWords.has(existingWord)) {
   				console.log('"updatewordlist" -deleting existing word "' + existingWord +'" from set "missingWords"')
   				missingWords.delete(existingWord)
   			}
   		}
   		
		var ts = new Date().getTime();

		// add new words to table "seowords"
   		var sql = 'INSERT INTO  '  + config.dbTableNames.seowords + ' (word, created, deleted) VALUES ';
   		var s; 
   		var arr = []; 
   		// create sql query
   		for (let word of missingWords) {
   			if (word !== '') {
   				s = '(' + mysql.escape(word) + ' , ' + ts+', false)'; 
   	   			arr.push(s);
   			} 
   		}
   		
   		if (arr.length > 0) {
   			sql +=  arr.join(',')  ;
   			
   			// only for debugging purposes
	   	 	fs.writeFileSync('sql_query_seo.txt', sql);
   	   		console.log('"updatewordlist" - sql: ' + sql);
   	   		yield db.beginTransaction();
   	 		var res = yield db.query(sql);
   	 		
   	 		arr = [];
   	 		// in case another query added data -> use the uid to update the column "inwordlist"
   	 		for (var i = 0; i < dummy.length; i++) {
   	 			arr.push(dummy[i].uid);
   	 		}
   			sql = arr.join(',');

   	 		// and set the col "inwordlist" to true
   	 		sql = 'UPDATE ' + config.dbTableNames.pagecontent + ' SET inwordlist = TRUE WHERE uid IN (' + sql + ')';
   	 		var res = yield db.query(sql);
    	 		
   	   		yield db.commitTransaction();

   		}
   
   		// now  we have all the words in table "seowords" that we can add the references between the table "seoword" and 
   		// " crawl_seowords_used_in_pagecontent"  
   		  	   	 	
	   	// dummy has all the text elements 
	   	// for these text elements we now have an entry in seowords for all relevant words
	   	// find these relevant words in the text element and add a refernce to seowordlist in 
	   	// table "seowords_used_in_pagecontent"
   		
   		// select all the words from table "seowords"
   		var sql = 'SELECT uid, word FROM ' + config.dbTableNames.seowords  + ' ';
   		sql += 'WHERE (deleted = FALSE OR deleted IS NULL) ';
   		var allExistingWordsArray = yield db.query(sql);
   		
   		// create an array with the words as index (use it as a lookup table)
   		// TODO: use a map or set?
   		var allExistingWords = {};
   		var w;
   		for (i = 0; i < allExistingWordsArray.length; i++) { 
   			w = allExistingWordsArray[i].word;
   			allExistingWords[w] = allExistingWordsArray[i].uid; 
		}

   		// insert the references into the table "seowords_used_in_pagecontent"
   	 	var relevantWords = [];
   	 	var s = '';
   	 	var sql = ' INSERT INTO '  + config.dbTableNames.seowords_used_in_pagecontent + '  (worduid, pagecontentuid, created) VALUES ';
   	 	var arr = [];
   	 	var pageuid;
   	 	var missingWords = [];
	   	for (var i = 0; i < dummy.length; i++) {
	   		relevantWords = splitTextInWords(dummy[i].contenttext);
	   		pageuid = dummy[i].uid
	   		for (j = 0; j < relevantWords.length; j++) {
	   			w = relevantWords[j];
	   			if (allExistingWords[w] !== undefined) {
	   				s = '(' + allExistingWords[w] + ',' + pageuid +',' + ts +')';
	   				arr.push(s);
	   			} else {
	   				missingWords.push(w);
	   			}
	   		} 
   	 	}
	   	sql = sql + arr.join(',');
	   		
	   	yield db.beginTransaction();
	   	var res = yield db.query(sql);
   	   	yield db.commitTransaction();
	   	yield db.disconnect();  

   		// // console.log('"updatewordlist" - sql: ' + sql); 
	   	fs.writeFileSync('sql_query_seo_updatewordlist.txt', sql);
    	
	   	// in theory the array "missingWords" should always be empty, but if not -> take a "note" here and log the error
		logger.logError('lib/jobs.js  (saveScreenshotData): ', 'missing words in table "seowords', 'when inserting the references from seowords to pagecontent into "seowords_used_in_pagecontent" some words were missing in "seowords". this happend for pageuid: ' + pageuid, missingWords);
	   	
   		return yield Promise.resolve(true); 	
   	}
	
	function *getCrawlJobs( ) {
		var sql = 'SELECT  ' + config.dbTableNames.jobs + ' .uid, ' + config.dbTableNames.jobs + ' .status, ' + config.dbTableNames.jobs + ' .description, ' + config.dbTableNames.domains + '.name ';
		sql 	+= 'FROM  ' + config.dbTableNames.jobs + '  ';
		sql 	+= 'LEFT JOIN ' + config.dbTableNames.domains + ' ON (' + config.dbTableNames.jobs + ' .domainuid = ' + config.dbTableNames.domains + ' .uid)';
		sql 	+= 'WHERE ' + config.dbTableNames.jobs + ' .jobtype = \"crawljob\" AND ';
		sql 	+= '(' + config.dbTableNames.jobs + ' .deleted = FALSE OR ' + config.dbTableNames.jobs + ' .deleted IS NULL) ';
		sql 	+= 'ORDER BY uid DESC';
  	   
 	   	// console.log('"getCrawlJobs" - sql: ' + sql);
	   	yield db.connect();
   		var res = yield db.query(sql);
   		yield db.disconnect(); 
   		return yield Promise.resolve(res); 	 
	}
	
	function *getKeywords(jobuid, numberKeywords) {
		// console.log('"getKeywordsPerPage" - jobuid: '+ jobuid);
 		// console.log('"getKeywordsPerPage" - numberKeywords: '+ numberKeywords)
	
		var sql = 	'SELECT worduid , pagecontentuid ,' + config.dbTableNames.pagecontent +  '.contenttext, ' + config.dbTableNames.seowords +  '.word , count(*) as anzahl ';
			sql += 'FROM ' + config.dbTableNames.seowords_used_in_pagecontent +  '  ';
			sql += 'LEFT JOIN ' + config.dbTableNames.pagecontent +  ' ON (' + config.dbTableNames.pagecontent +  '.uid = pagecontentuid)    ';
			sql += 'LEFT JOIN ' + config.dbTableNames.seowords +  ' ON (worduid = ' + config.dbTableNames.seowords +  '.uid)    ';
			sql += 'WHERE ' + config.dbTableNames.pagecontent +  '.jobuid= '+jobuid+' ';
			sql += 'GROUP BY worduid ';
			sql += 'ORDER BY anzahl DESC ';
			sql += 'LIMIT ' + numberKeywords;
  		 
 		// console.log('"getKeywordsPerPage" - sql: ' + sql);
 	  	
	   	yield db.connect();
   		var res = yield db.query(sql);
		// console.log('"getKeywordsPerPage" - res.length: ' + res.length);

   		yield db.disconnect(); 
   		return yield Promise.resolve(res); 	 
	} 
	
	function *getKeywordsPerPage(jobuid, numberKeywords) {
		// console.log('"getKeywordsPerPage" - jobuid: '+ jobuid);
 		// console.log('"getKeywordsPerPage" - numberKeywords: '+ numberKeywords)
	 
 		var sql = 'SELECT ' + config.dbTableNames.pages +  '.path, ' + config.dbTableNames.seowords +  '.word ';
 		 	sql += 'FROM  ' + config.dbTableNames.pages +  ' ' ;
 		 	sql += 'LEFT JOIN ' + config.dbTableNames.pagecontent +  ' ON (' + config.dbTableNames.pagecontent +  '.pageuid = ' + config.dbTableNames.pages +  '.uid) ';
 		 	sql += 'LEFT JOIN ' + config.dbTableNames.seowords_used_in_pagecontent +  ' ON ( ' + config.dbTableNames.pagecontent +  '.uid = ' + config.dbTableNames.seowords_used_in_pagecontent +  '.pagecontentuid)  ' ;
 			sql += 'LEFT JOIN ' + config.dbTableNames.seowords +  ' ON (' + config.dbTableNames.seowords_used_in_pagecontent +  '.worduid = ' + config.dbTableNames.seowords +  '.uid)  ';
 			// sql += 'GROUP BY ' + config.dbTableNames.seowords +  '.word,' + config.dbTableNames.pages +  '.path ';
 			sql += 'LIMIT ' + numberKeywords;

 		// console.log('"getKeywordsPerPage" - sql: ' + sql);
 	  	
	   	yield db.connect();
   		var res = yield db.query(sql);
		// console.log('"getKeywordsPerPage" - res.length: ' + res.length);

   		yield db.disconnect(); 
   		return yield Promise.resolve(res); 	 
	}

	function *getKeywordsPerPageByContentType(jobuid, numberKeywords, contenttypes) {
		
		console.log('"getKeywordsPerPageByContentType" - jobuid: '+ jobuid);
 		console.log('"getKeywordsPerPageByContentType" - numberKeywords: '+ numberKeywords)
 
 		var node1 = config.contenttype.h1;
 		var node2 = config.contenttype.h2;
 		
 		var sqlSelectWord = [];
 		var sqlSelectPageContent = [];
 		var sqlLeftJoin0 = [];
 		var sqlLeftJoin1 = [];
 		var sqlLeftJoin2 = [];
 		
 		var sqlWhere = [];
 		var sqlWhere2 = [];
 		
 		var sqlSelectWordStr;
 		var sqlSelectPageContentStr;
 		var sqlLeftJoin0Str;
 		var sqlLeftJoin1Str; 
 		var sqlLeftJoin2Str; 
 		var sqlWhereStr;
 		var sqlWhere2Str;

 		var s;
 		for (var i = 0; i < contenttypes.length; i++) {
 			s = 'sw' + i + '.word as word'+ i;
 			sqlSelectWord.push(s);
 			
 			s = 'pc' + i + '.contenttype as contenttype' + i; 
 			sqlSelectPageContent.push(s);
 			
  			s = 'LEFT JOIN ' + config.dbTableNames.pagecontent +  ' AS pc' + i + ' ON (pc' + i + '.pageuid = ' + config.dbTableNames.pages +  '.uid) '; 
 			sqlLeftJoin0.push(s);
 			
 			s += 'LEFT JOIN ' + config.dbTableNames.seowords_used_in_pagecontent +  ' AS suipc' + i + ' ON (pc' + i + '.uid  = suipc' + i + '.pagecontentuid ) '; 
  			sqlLeftJoin1.push(s);
 			 
 			s = 'LEFT JOIN  ' + config.dbTableNames.seowords +  ' AS sw' + i + ' ON (suipc' + i + '.worduid = sw' + i + '.uid) '; 
 			sqlLeftJoin2.push(s);
 			
 			s = 'pc' + i + '.contenttype = \"'+contenttypes[i]  +'\"';
 			sqlWhere.push(s);
 		}
 		
 		for (var i = 0; i < contenttypes.length-1; i++) {
 			s = 'suipc' + i + '.worduid  = suipc' + (i+1) + '.worduid';
 			sqlWhere2.push(s);
  		}

 		sqlSelectWordStr = sqlSelectWord.join (',');
 		sqlSelectPageContentStr = sqlSelectPageContent.join (',');

 		sqlLeftJoin0Str = sqlLeftJoin0.join (' '); 
 		sqlLeftJoin1Str = sqlLeftJoin1.join (' ');
 		sqlLeftJoin2Str = sqlLeftJoin2.join (' ');
 		sqlWhereStr = sqlWhere.join (' AND ');
 		sqlWhere2Str = sqlWhere2.join (' AND ');
  
 		var sql = 'SELECT  ' + config.dbTableNames.pages +  '.domainuid, ' + config.dbTableNames.domains +  '.name, ' + config.dbTableNames.pages +  '.path, '
 			sql += sqlSelectWordStr + ',  ';
			sql += sqlSelectPageContentStr + ' ';
 			sql += 'FROM ' + config.dbTableNames.pages +  '  ';
			sql += sqlLeftJoin1Str + ' ';
			sql += sqlLeftJoin2Str + ' '; 
			sql += 'LEFT JOIN ' + config.dbTableNames.domains + '  ON (' + config.dbTableNames.pages +  '.domainuid = ' + config.dbTableNames.domains + '.uid) ';
 			sql += ' WHERE  ';
			sql += sqlWhereStr + ' AND '; 
			sql += sqlWhere2Str + ' AND '; 
			sql += '' + config.dbTableNames.pages +  '.jobuid = ' + jobuid;
 		 
  		console.log('"getKeywordsPerPageByContentType" - sql: ' + sql);
 	  	
	   	yield db.connect();
   		var res = yield db.query(sql);
		console.log('"getKeywordsPerPageByContentType" - res.length: ' + res.length);
		console.log('"getKeywordsPerPageByContentType" - res : ' + JSON.stringify(res, null, 4));

   		yield db.disconnect(); 
   		return yield Promise.resolve(res); 	 
	}  
	
    return {
    	updatewordlist 	: updatewordlist,
     	getCrawlJobs	: getCrawlJobs,
    	getKeywords		: getKeywords,
    	getKeywordsPerPage : getKeywordsPerPage,
    	getKeywordsPerPageByContentType : getKeywordsPerPageByContentType
    };
}();
