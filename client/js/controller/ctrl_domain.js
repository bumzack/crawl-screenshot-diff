'use strict'; 

app.controller('DomainCtrl', function ($scope, factDomains, $timeout) {
	console.log ('DomainCtrl');
	
	$scope.showError = false; 
	$scope.showInfo = false; 
	$scope.showSuccess = false; 

	$scope.newdomain = {}; 
	
	$scope.addDomain = function () {
		var name = $scope.newdomain.name;
		var cronjob = $scope.newdomain.cronjob;

		console.log('DomainCtrl: started  " "');
 		console.log('DomainCtrl: newjob: ' + JSON.stringify(name));
  
 		factDomains.addDomain(name, cronjob).then(function(status) {
  			console.log('DomainCtrl: addDomain. SUCCESS: status: ' + JSON.stringify(status));
  			$scope.showSuccess = true; 
  			$scope.alertSuccessMessage = "domain saved!";
  			$timeout(function() {
  				$scope.showSuccess = false; 
  				$scope.alertSuccessMessage = '';
  			}, 3000);  		
  			loadDomains();
  			
 	 	}, function (error) {
  			console.log('DomainCtrl: addDomain. ERROR: error: ' + JSON.stringify(error));
  			$scope.showError = true; 
  			$scope.alertErrorMessage = "an error occured while saving the domain!";
  			$timeout(function() {
  				$scope.showError = false; 
  				$scope.alertErrorMessage = '';
  			}, 3000);
 		});	
 		 
		console.log('DomainCtrl: ended  "addDomain"'); 
	};
 
	$scope.domainDelete = function (uid) {
  
 		factDomains.deleteDomain(uid).then(function(status) {
  			console.log('DomainCtrl: deleteDomain. SUCCESS: status: ' + JSON.stringify(status));
  			$scope.showSuccess = true; 
  			$scope.alertSuccessMessage = "domain deleted!";
  			$timeout(function() {
  				$scope.showSuccess = false; 
  				$scope.alertSuccessMessage = '';
  			}, 3000);  			
  			loadDomains();
 	 	}, function (error) {
  			console.log('DomainCtrl: deleteDomain. ERROR: error: ' + JSON.stringify(error));
  			$scope.showError = true; 
  			$scope.alertErrorMessage = "an error occured while deleting the domain!";
  			$timeout(function() {
  				$scope.showError = false; 
  				$scope.alertErrorMessage = '';
  			}, 3000);
 		});	
 		 
		console.log('DomainCtrl: ended  "deleteDomain"'); 
	};
	
	function loadDomains() {
		// load existing domains and show them
		factDomains.getAll().then(function(data) {
			$scope.allDomains = data; 
			console.log('DomainCtrl: $scope.allDomains:   ' + JSON.stringify(data)); 
 	
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "domains loaded!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);
		}, function(error) {
			$scope.allDomains = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "an error occured while loading the domains!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
		});
	}
	
	loadDomains();
})
