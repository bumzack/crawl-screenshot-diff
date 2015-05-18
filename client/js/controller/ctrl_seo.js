'use strict'; 
 
app.controller('SeoCtrl', function ($scope, factSeo, factDomains, $timeout, $q) {
	console.log ('SeoCtrl');
	
	function loadDomains() {
		var deferred = $q.defer();
		// load existing domains and show them
		factDomains.getAll().then(function(data) {
			$scope.allDomains = data; 
			console.log('SeoCtrl: $scope.allDomains:   ' + JSON.stringify(data)); 
 	
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "domains successfully loaded!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);
			deferred.resolve(true);
		}, function(error) {
			$scope.allDomains = []; 
			console.log('SeoCtrl: ERROR  fetching Domains  $scope.allDomains:   ' + JSON.stringify(error)); 

			$scope.showError = true; 
			$scope.alertErrorMessage = "error while laoding domains from the server!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
			deferred.reject(false);
		});
		return deferred.promise;  
	}
	  
	$scope.seoWordlistUpdate = function () {
		console.log('seoWordlistUpdate: started  "startJob"');
   
		factSeo.updateWordlist().then(function(status) {
  			console.log('SeoCtrl: seoWordlistUpdate. SUCCESS: status: ' + JSON.stringify(status));
  			
  			$scope.showSuccess = true; 
  			$scope.alertSuccessMessage = "job successfully sent to the server!";
  			
  			$timeout(function() {
  				$scope.showSuccess = false; 
  				$scope.alertSuccessMessage = '';
  			}, 3000);  
  			
 		}, function (error) {
  			console.log('SeoCtrl: seoWordlistUpdate. ERROR: error: ' + JSON.stringify(error));
  			
  			$timeout(function() {
  				$scope.showError = false; 
  				$scope.alertErrorMessage = '';
  			}, 3000);
  			
  			$scope.showError = true; 
  			$scope.alertErrorMessage = "error while sending job to the server!";
 		});	
 		 
		console.log('SeoCtrl: ended  "seoWordlistUpdate"'); 
	}; 
	
	loadDomains();
});
