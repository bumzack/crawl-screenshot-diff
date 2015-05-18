'use strict'; 

app.factory('factSeo', function($http, $q) {
	
	var factSeo = {}; 

 	factSeo.updateWordlist = function( ) {
		var deferred = $q.defer();
 			
		$http({method: 'GET', url: '/seoupdatewordlist'}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factSeo" - GET /seoupdatewordlist:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factSeo" - GET /seoupdatewordlist:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	
	factSeo.getAllSEOWords = function( ) {
		var deferred = $q.defer();
 			
		$http({method: 'GET', url: '/seowords'}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factSeo" - GET /seowords:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factSeo" - GET /seowords:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	 
	factSeo.getCrawlJobs = function( ) {
		var deferred = $q.defer();
 			
		$http({method: 'GET', url: '/seocrawljobs'}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factSeo" - GET /seocrawljobs:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factSeo" - GET /seocrawljobs:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
 	
	factSeo.getKeywords = function(json) {
		var deferred = $q.defer(); 
 
		$http({method: 'POST', url: '/seokeywords', data : json}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factSeo" - POST /seokeywords:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factSeo" - POST /seokeywords:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	factSeo.getKeywordsPerPage = function(json) {
		var deferred = $q.defer(); 
 
		$http({method: 'POST', url: '/seokeywordsperpage', data : json}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factSeo" - POST /seokeywordsperpage:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factSeo" - POST /seokeywordsperpage:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	 
	factSeo.getKeywordsPerPageByContentElement = function(json) {
		var deferred = $q.defer(); 
 
		$http({method: 'POST', url: '/seokeywordsperpagebycontenttype', data : json}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factSeo" - POST /seokeywordsperpagebycontenttype:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factSeo" - POST /seokeywordsperpagebycontenttype:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	};  
	 
	factSeo.seoStemWords = function(json) {
		var deferred = $q.defer(); 
 
		$http({method: 'GET', url: '/seostemwords'}).
	    	success(function(data, status, headers, config) {
	    		console.log('factory "factSeo" - GET /seostemwords:  return success data: ' + JSON.stringify(data)); 
 	    		deferred.resolve(data);
	    	}).
		    error(function(data, status, headers, config) { 
		    	deferred.reject('factory "factSeo" - GET /seostemwords:  error loading data from server'); 		    
		    }); 			 
		return deferred.promise;   
	}; 
	
	return factSeo;  
});
