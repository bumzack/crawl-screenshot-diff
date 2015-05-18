'use strict'; 

app.factory('factDomains', function($http, $q) {
	
	var factDomains = {}; 

 	factDomains.getAll = function( ) {
			
		var deferred = $q.defer();
 			
		$http({method: 'GET', url: '/domain'}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factDomains" - GET /domains:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factDomains" - GET /domains:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	factDomains.addDomain = function(name, cronjob) {
		var deferred = $q.defer();
		console.log('factory "factDomains" - newdomain   name: ' + JSON.stringify(name)); 
		var json = {
			name: name,
			cronjob : cronjob
		};
		
		$http({method: 'POST', url: '/domain', data: json}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factDomains" - POST /domain:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factDomains" - POST /domain:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};
	
	factDomains.deleteDomain = function(uid) {
		var deferred = $q.defer();
		console.log('factory "factDomains" - deleteDomain   uid: ' + JSON.stringify(uid)); 
		 
		var url = '/domain/' + uid
		
		$http({method: 'DELETE', url: url}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factDomains" - DELETE /domain:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factDomains" - DELETE /domain:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};
	
	
	
	factDomains.addDomainList = function(name) {
		var deferred = $q.defer();
		console.log('factory "factDomains" - addDomainList   name: ' + JSON.stringify(name)); 
		var json = {
			name: name,
			cronjob : cronjob
		};
		
		$http({method: 'POST', url: '/domainsfromcsv', data: json}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factDomains" - POST /domainsfromcsv:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factDomains" - POST /domainsfromcsv:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};
	return factDomains;  
});
