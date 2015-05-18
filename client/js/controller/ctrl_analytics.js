'use strict'; 
 
app.controller('AnalyticsCtrl', function ($scope, factAnalytics, $timeout) {
	console.log ('AnalyticsCtrl');
	
	$scope.selectedwebsite; 
	
 	$scope.loadpages = function (pagedata) {
		console.log('loadpages: started  "loadpages"');
 		console.log('loadpages: pagedata: ' + JSON.stringify(pagedata));
  
 		factAnalytics.getPages(pagedata).then(function(data) {
 			
 			var websites = data.websites; 
			var screenShotDirClient = data.screenShotDirClient; 
			var s;
			console.log('"loadpages" - found a screenshot');

			for (var i = 0; i < websites.length; i++) {
	 			
		 		console.log('loadpages: (websites[i]): ' + JSON.stringify(websites[i]));
		 		if (((websites[i].imgdirectory !== null) && (websites[i].imgfilename !== null)) && 
		 			((websites[i].imgdirectory !== '') && (websites[i].imgfilename !== ''))) {
					console.log('"loadpages" - found a screenshot');
					websites[i].screenshoturl = screenShotDirClient + '/' + websites[i].imgdirectory +'/' + websites[i].imgfilename; 
					console.log('"loadpages" - websites[i].screenshoturl:  ' + websites[i].screenshoturl);
	
				} else {
					console.log('"loadpages" - found no screenshot');
					websites[i].screenshoturl = 'nope'; 
				}
			}
			
 			$scope.allPages = websites;
 			$scope.countPages = websites.length;
 			
 			// console.log('AnalyticsCtrl: $scope.allPages:   ' + JSON.stringify(data)); 
 			$scope.selectedwebsite = pagedata.selectedWebsite.name;
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "pages loaded!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000); 
 		}, function (error) {
  			console.log('JobCtrl: loadpages. ERROR: error: ' + JSON.stringify(error));
 		});	
 		 
		console.log('JobCtrl: ended  "loadpages"'); 
	};
	
	function loadWebsites() {
		// load existing domains and show them
		factAnalytics.getWebsites().then(function(data) { 
			var s;
			// add a useful text for the user to select
			for (var i = 0; i < data.length; i++) {
				s = 'uid: ' + data[i].uid + '  |  ' + data[i].name + ' |  ' + data[i].description + '  |  ' + data[i].status;
				data[i].text = s;
			}
			$scope.allWebsites = data; 

			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "webpages loaded!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000); 
		}, function(error) {
			$scope.allDomains = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "an error occured while loading the webpages!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
		});
	}
	
	$scope.numberPages = [];

	var entry= {
		text: '50',
		maxCount : 50
	}
	$scope.numberPages.push(entry);
	
	var entry= {
		text: '100',
		maxCount : 1000
	}
	$scope.numberPages.push(entry);
	
	var entry= {
		text: '250',
		maxCount : 250
	}
	$scope.numberPages.push(entry);
	
	var entry= {
		text: '500',
		maxCount : 500
	}
	$scope.numberPages.push(entry);
	
	var entry= {
		text: '1000',
		maxCount : 1000
	}
	$scope.numberPages.push(entry);
	
	var entry= {
		text: '5000',
		maxCount : 5000
	}
	$scope.numberPages.push(entry);

	var entry= {
		text: 'alle',
		maxCount : 100000000
	}
	$scope.numberPages.push(entry);
	
	loadWebsites();  
})
