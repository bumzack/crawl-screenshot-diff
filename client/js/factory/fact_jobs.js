'use strict'; 

app.factory('factJobs', function($http, $q) {
	
	var factJobs = {}; 

 	factJobs.getJobs = function( ) {
		var deferred = $q.defer();
 			
		$http({method: 'GET', url: '/jobs'}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "getJobs" - GET /jobs:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factJobs" - GET /jobs:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	factJobs.startCrawlJob = function(newcrawljob) {
		var deferred = $q.defer();
		console.log('factory "factJobs" - startJob   newjob: ' + JSON.stringify(newcrawljob)); 

		$http({method: 'POST', url: '/crawljob', data: newcrawljob}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factJobs" - POST /crawljob:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factJobs" - POST /crawljob:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};  
	
	factJobs.startScreenshotJob = function(newcrawljob ) {
		var deferred = $q.defer();
		console.log('factory "factJobs" - startScreenshotJob   crawljobuid: ' + JSON.stringify(newcrawljob)); 

		$http({method: 'POST', url: '/screenshotjob', data: newcrawljob}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factJobs" - POST /screenshotjob:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factJobs" - POST /screenshotjob:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};    
	
	factJobs.deleteJob = function(jobuid ) { 
		var deferred = $q.defer();
		console.log('factory "factJobs" - deleteJob   jobuid: ' + JSON.stringify(jobuid)); 

		var url = '/job/' + jobuid;
		$http({method: 'DELETE', url: url}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factJobs" - DELETE /job:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factJobs" - DELETE /job:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	factJobs.addComparejob = function(newscreenshotcomparisonjob) {
 		var deferred = $q.defer();
 	 
 		console.log('factory "factAnalytics" - POST /comparescreenshotsjob:  ' ); 

		$http({method: 'POST', url : '/comparescreenshotsjob', data: newscreenshotcomparisonjob}).
			success(function(data, status, headers, config) {
	    		console.log('factory "factJobs" - POST /comparescreenshotsjob:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factJobs" - POST /comparescreenshotsjob:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;
	};
	 
	return factJobs;  
});
