'use strict'; 
 
app.controller('JobListCtrl', function ($scope, factJobs, factDomains, factAnalytics, $timeout) {
	console.log ('JobListCtrl');
	
	$scope.newcrawljob = {
		depth 		: -1,
		numberpages : -1
	}  
	
	$scope.jobDelete = function (jobuid) {
		factJobs.deleteJob(jobuid).then(function(status) {
  			console.log('DomainCtrl: jobDelete. SUCCESS: status: ' + JSON.stringify(status));
  			$scope.showSuccess = true; 
  			$scope.alertSuccessMessage = "job successfully deleted!";
  			$timeout(function() {
  				$scope.showSuccess = false; 
  				$scope.alertSuccessMessage = '';
  			}, 3000);  		
  			var idx; 
  			for (var i = 0; i < $scope.allJobs.length; i++) {
  				if ($scope.allJobs[i].uid == jobuid) {
  					idx = i;
  					break; 
  				}
  			}
  			if (idx !== -1) {
  				$scope.allJobs.splice(idx, 1);
  			} 
  	 	}, function (error) {
  			console.log('JobListCtrl: deleteJob. ERROR: error: ' + JSON.stringify(error));
  			$scope.showError = true; 
  			$scope.alertErrorMessage = "an error occured while deleting the job";
  			$timeout(function() {
  				$scope.showError = false; 
  				$scope.alertErrorMessage = '';
  			}, 3000);
 		});	
 		 
		console.log('DomainCtrl: ended  "jobDelete"'); 
	}
	
	function loadJobs() {
		factJobs.getJobs().then(function(data) {
			$scope.allJobs = data; 
			console.log('JobListCtrl: $scope.allJobes:   ' + JSON.stringify(data)); 
 	
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "jobs loaded successfully from the server!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000); 
		}, function(error) {
			$scope.allDomains = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the jobs from the server!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
		});
	} 
	 
	loadJobs(); 
})
