'use strict'; 

app.factory('factBlacklist', function($http, $q) {
	
	var factBlacklist = {}; 

 	factBlacklist.getAll = function( ) {
 		var deferred = $q.defer();
 			
		$http({method: 'GET', url: '/blacklist'}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factBlacklist" - GET /blacklist:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factBlacklist" - GET /blacklist:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	factBlacklist.addWordlist = function(wordlist) {
		
		var deferred = $q.defer();
		console.log('factory "factBlacklist" - addWordlist   wordlist: ' + JSON.stringify(wordlist)); 

		var json = {
			wordlist : wordlist
		}
		
		$http({method: 'POST', url: '/blacklist', data: json}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factBlacklist" - POST /blacklist:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factBlacklist" - POST /blacklist:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};  
	
	factBlacklist.deleteWord = function(uid) {
		var deferred = $q.defer();
		console.log('factory "factBlacklist" - deleteDomain   uid: ' + JSON.stringify(uid)); 
		 
		var url = '/blacklist/' + uid
		
		$http({method: 'DELETE', url: url}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factBlacklist" - DELETE /blacklist:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factBlacklist" - DELETE /blacklist:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};
	  
	return factBlacklist;  
});
