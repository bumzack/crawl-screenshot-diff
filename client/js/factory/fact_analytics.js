'use strict'; 

app.factory('factAnalytics', function($http, $q) {
 	var factAnalytics = {}; 
 	
  	factAnalytics.getPages = function(pagedata) {
 		var deferred = $q.defer();
		$http({method: 'POST', url: '/pages', data: pagedata}).
			success(function(data, status, headers, config) {
	    		console.log('factory "factAnalytics" - POST /pages:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factAnalytics" - POST /pages:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	factAnalytics.getWebsites = function(domainuid) {
 		var deferred = $q.defer();
 		var url = '/websites';
 		if (domainuid !== undefined) {
 			url += '/' + domainuid;
 		}

 		console.log('factory "factAnalytics" - GET /websites: url: ' + url); 

		$http({method: 'GET', url: url}).
			success(function(data, status, headers, config) {
	    		console.log('factory "factAnalytics" - GET /websites:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factAnalytics" - GET /websites:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	factAnalytics.getScreenComparisons = function(pagedata) {
 		var deferred = $q.defer();
  
		$http({method: 'POST', url: '/screencomparisons', data : pagedata}).
			success(function(data, status, headers, config) {
	    		console.log('factory "factAnalytics" - POST /screencomparisons:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factAnalytics" - POST /screencomparisons:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
 	
	return factAnalytics;  
});
