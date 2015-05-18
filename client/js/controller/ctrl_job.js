'use strict'; 
 
app.controller('JobCtrl', function ($scope, factJobs, factDomains, factAnalytics, $timeout, $q) {
	console.log ('JobCtrl');
	
	$scope.newcrawljob = {
		depth 		: -1,
		numberpages : -1
	} 
	
	$scope.addCrawljob = function (newcrawljob) {
		console.log('addCrawljob: started  "startJob"');
 		console.log('addCrawljob: newcrawljob: ' + JSON.stringify(newcrawljob));
  
 		factJobs.startCrawlJob(newcrawljob).then(function(status) {
  			console.log('JobCtrl: addCrawljob. SUCCESS: status: ' + JSON.stringify(status));
 		}, function (error) {
  			console.log('JobCtrl: addCrawljob. ERROR: error: ' + JSON.stringify(error));
 		});	
 		 
		console.log('JobCtrl: ended  "addCrawljob"'); 
	};
 	
	$scope.addScreenshotjob = function (newscreenshotjob) {
		console.log('addScreenshotjob: started  "addScreenshotjob"');
 		console.log('addScreenshotjob: newscreenshotjob: ' + JSON.stringify(newscreenshotjob));
 		
 		console.log('addScreenshotjob: newscreenshotjob.selectedWebsite: ' + JSON.stringify(newscreenshotjob.selectedWebsite));
 		
 		factJobs.startScreenshotJob(newscreenshotjob).then(function(status) {
  			console.log('JobCtrl: addScreenshotjob. SUCCESS: status: ' + JSON.stringify(status));
 		}, function (error) {
  			console.log('JobCtrl: addScreenshotjob. ERROR: error: ' + JSON.stringify(error));
 		});	
 		 
		console.log('JobCtrl: ended  "addScreenshotjob"'); 
	};
	
	function loadDomains() {
		var deferred = $q.defer();
		// load existing domains and show them
		factDomains.getAll().then(function(data) {
			$scope.allDomains = data; 
			console.log('JobCtrl: $scope.allDomains:   ' + JSON.stringify(data)); 
 	
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "domains loaded successfully from the server!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);
			deferred.resolve(true);
		}, function(error) {
			$scope.allDomains = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the domains from the server!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
			deferred.reject(false);
		});
		return deferred.promise;  
	}
	
	function loadJobs() {
 		var deferred = $q.defer();

		factJobs.getJobs().then(function(data) {
			$scope.allJobes = data; 
			console.log('JobCtrl: $scope.allJobes:   ' + JSON.stringify(data)); 
 	
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "jobs loaded successfully from the server!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000); 
			deferred.resolve(true);

		}, function(error) {
			$scope.allDomains = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the jobs from the server!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
			deferred.reject(false);
		});
		return deferred.promise;   
	}
	
	function loadWebsites() {
 		var deferred = $q.defer();

		factAnalytics.getWebsites().then(function(data) {
			console.log('JobCtrl: getWebsites success :  data returned:  ' + JSON.stringify(data)); 

			var s;
			// add a useful text for the user to select
			for (var i = 0; i < data.length; i++) {
				s = 'uid: ' + data[i].uid + '  |  ' + data[i].name + ' |  ' + data[i].description + '  |  ' + data[i].status;
				data[i].text = s; 
			}
			
			$scope.allWebsites = data; 
 
			console.log('JobCtrl: $scope.allWebsites:   ' + JSON.stringify(data)); 
 	
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "pages loaded successfully from the server!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000); 
			deferred.resolve(true);
		}, function(error) {
			$scope.allDomains = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the pages from the server";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
			deferred.reject(error);
		});
		return deferred.promise;
	}
	
	loadDomains().then(function () {
		console.log('JobCtrl: loadDomains() success');
		loadWebsites().then(function () {
			console.log('JobCtrl: loadWebsites() success');
			loadJobs().then(function () {
				console.log('JobCtrl: loadJobs() success');
 			},function (error){
				console.log('JobCtrl: loadJobs() ERROR: ' +error)
			});
		},function (error){
			console.log('JobCtrl: loadWebsites() ERROR: ' +error)
		});
	},function (error){
		console.log('JobCtrl: loadDomains() ERROR: ' +error)
	}); 
	
	// newscreenshotcomparisonjob.selectedDomain.name
 	$scope.$watch('compareJobSelectedDomain', function(newValue, oldValue) {
 		if ((newValue !== undefined) && (newValue.uid !== undefined)) {
			console.log('JobCtrl: factAnalytics.getPages(uid) newValue.uid:   ' + newValue.uid); 

 			factAnalytics.getWebsites(newValue.uid).then(function(data) {
 				var s;
 				// add a useful text for the user to select
 				for (var i = 0; i < data.length; i++) {
 					s = 'uid: ' + data[i].uid + '  |  ' + data[i].name + ' |  ' + data[i].description + '  |  ' + data[i].status;
 					data[i].text = s; 
 				}
 	 			$scope.selectedDomainWebsites = data;
 	 		}, function(error) {
 				console.log('JobCtrl: factAnalytics.getPages(uid) returned an error:   ' + JSON.stringify(error)); 
 				$scope.selectedDomainWebsites = [];
 	  		})
 		};
 	});
 	
	$scope.newscreenshotjob = {
		height 	: 768,
		width	: 1366
	} 
	
	$scope.addScreenshotcomparisonjob = function(newscreenshotcomparisonjob) {
		console.log('"addScreenshotcomparisonjob"  newscreenshotcomparisonjob: '+ JSON.stringify(newscreenshotcomparisonjob, null, 4));
		
		factJobs.addComparejob(newscreenshotcomparisonjob).then(function(status) {
  			console.log('JobCtrl: addScreenshotcomparisonjob. SUCCESS: status: ' + JSON.stringify(status));
 		}, function (error) {
  			console.log('JobCtrl: addScreenshotcomparisonjob. ERROR: error: ' + JSON.stringify(error));
 		});	
 		 
		console.log('JobCtrl: ended  "addScreenshotcomparisonjob"');
	};
})
