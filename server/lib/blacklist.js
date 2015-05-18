'use strict';

const config = require('../config');

var db = require('../lib/db');
var utils = require('../lib/utils');

module.exports = function()
{
	function *insertWordlist(useruid, wordlist) {
		// console.log('"insertWordlist"');
		var ts = new Date().getTime();
		
		// wordlist = replaceSpecialCharacterBlacklist(wordlist);
		// console.log('"insertWordlist" - special characters replaced wordlist text: ' + wordlist);
		
		wordlist = wordlist.toLowerCase();
		// console.log('"insertWordlist" - toLowerCase() wordlist text: ' + wordlist);

		var wordlistArray = wordlist.split(',');
		// console.log('"insertWordlist" - wordlistArray : ' + JSON.stringify(wordlistArray));
 		
		yield db.connect();
		
		// read all words from table
		var sql = 'SELECT * FROM `' + config.dbTableNames.blacklist + '`'; 
		// console.log('SQL: ' + sql);
		var res = yield db.query(sql);
		
		// iterate over res and create an array with words and info whether or not it was deleted
		// also convert to lower case
		var existingWords = {};
		var key, entry;
		for (var i = 0; i < res.length; i++) {
			key = res[i].word;
			entry = {
				name	: key, 
				deleted	: res[i].deleted,
				uid		: res[i].uid
			}
			existingWords[key] = entry;
		}
		
		//now we have an array with the existing words
		// now check whether or not the new words are already available
		// if it already exists and is set as deleted = true, then update and set delete to false
		
		// contains the strings
		var newWords = [];
		
		// contains the uids of the words to undelete
		var undeleteWords = [];

		for (var i = 0; i < wordlistArray.length; i++) {
			key = wordlistArray[i];
			key = key.trim();
 			if (existingWords[key] === undefined) {
				// new word
				newWords.push(key);
			} else {
				// if marked as deleted, then undelete the uid
				if (existingWords[key].deleted) {
					undeleteWords.push(existingWords[key].uid)
				}
			}
		}

		// begin transactions and execute max   two statements
		yield db.beginTransaction();

		// create sql query for inserting new words

		if (newWords.length > 0) {
			var sqlNewWords = 'INSERT INTO  `' + config.dbTableNames.blacklist + '`   ';
			sqlNewWords += '(`word`, `useruid`, `created`, `deleted`, `updated`) VALUES ';

			var sqlArray = [];
			var s; 
			for (var i = 0; i < newWords.length; i++) {
				s = '(\"' + newWords[i] + '\", ' +  useruid +', '  + ts + ', FALSE, 0)';
				sqlArray.push(s);
			}
			sqlNewWords += sqlArray.join(',');
			// console.log('sqlNewWords: ' + sqlNewWords);
			var res = yield db.query(sqlNewWords);
		}
		
		if (undeleteWords.length > 0) {
			sqlUndeleteWords += '(`word`, `useruid`, `created`, `deleted`, `updated`) VALUES ';

			var sqlArray = [];
			var s; 
			for (var i = 0; i < undeleteWords.length; i++) {
				var sqlUndeleteWords = 'UPDATE `' + config.dbTableNames.blacklist + '` ';
				sqlUndeleteWords += ' SET deleted = false, updated = ts';
				// console.log('sqlUndeleteWords: ' + sqlUndeleteWords);
				var res = yield db.query(sqlUndeleteWords); 
 			} 
		}
		
		yield db.commitTransaction();
		yield db.disconnect();
		
		return res; 
	}
	
	function *getWordlist() {
		// console.log('"getWordlist"');
		var ts = new Date().getTime();
		var sql = 'SELECT * FROM `' + config.dbTableNames.blacklist + '` WHERE DELETED = FALSE ';
		sql += 'ORDER BY word ';

		// console.log('SQL: ' + sql);
		yield db.connect();
		var res = yield db.query(sql); 
		yield db.disconnect();

		return res; 
	}
	
	function *deleteWord(uid) {
		// console.log('"deleteWord"');
		var ts = new Date().getTime();
		var sql = 'UPDATE `' + config.dbTableNames.blacklist + '` SET DELETED = TRUE, updated = ' + ts + '  ';
		sql += 'WHERE uid = ' + uid;
		// console.log('SQL: ' + sql);
		yield db.connect();
		var res = yield db.query(sql); 
		yield db.disconnect();

		return res; 
	}
	
    return {
    	insertWordlist 	: insertWordlist,
    	getWordlist		: getWordlist,
    	deleteWord		: deleteWord
    };
}();
