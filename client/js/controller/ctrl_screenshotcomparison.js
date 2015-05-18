'use strict'; 
 
app.controller('ScreenshotCompareCtrl', function ($scope, factAnalytics, $timeout) {
	console.log ('ScreenshotCompareCtrl');
	
	$scope.selectedComparison; 
	
 	$scope.loadpages = function (pagedata) {
		console.log('loadpages: started  "loadpages"');
 		console.log('loadpages: pagedata: ' + JSON.stringify(pagedata));
  
 		factAnalytics.getScreenComparisons(pagedata).then(function(data) {
 			var websites = data.websites; 
			var screenShotDirClient = data.screenShotDirClient; 
			var s;
			console.log('"loadpages" - found a screenshot');

			for (var i = 0; i < websites.length; i++) {
	 			
		 		console.log('loadpages: (websites[i]): ' + JSON.stringify(websites[i], null, 4));
		 		
		 		// create the different urls for the hrefs 
		 		// diff image
		 		if (((websites[i].imgdirectory !== null) && (websites[i].imgfilename !== null)) && 
		 			((websites[i].imgdirectory !== '') && (websites[i].imgfilename !== ''))) {
					//console.log('"loadpages" - found a screenshot');
					websites[i].screenshotdiff = screenShotDirClient + '/' + websites[i].imgdirectory +'/' + websites[i].imgfilename; 
					// console.log('"loadpages" - websites[i].screenshoturl:  ' + websites[i].screenshoturl);
 				} else {
 					websites[i].screenshotdiff = 'nope'; 
				}
		 		
		 		// screenshoturl1
		 		if (((websites[i].imgdirectory1 !== null) && (websites[i].imgfilename1 !== null)) && 
		 			((websites[i].imgdirectory1 !== '') && (websites[i].imgfilename1 !== ''))) {
					//console.log('"loadpages" - found a screenshot');
					websites[i].screenshoturl1 = screenShotDirClient + '/' + websites[i].imgdirectory1 +'/' + websites[i].imgfilename1; 
					// console.log('"loadpages" - websites[i].screenshoturl:  ' + websites[i].screenshoturl);
 				} else {
 					websites[i].screenshoturl1 = 'nope'; 
				}
		 		
		 		// screenshoturl2
		 		if (((websites[i].imgdirectory2 !== null) && (websites[i].imgfilename2 !== null)) && 
		 			((websites[i].imgdirectory2 !== '') && (websites[i].imgfilename2 !== ''))) {
					//console.log('"loadpages" - found a screenshot');
					websites[i].screenshoturl2 = screenShotDirClient + '/' + websites[i].imgdirectory2 +'/' + websites[i].imgfilename2; 
					// console.log('"loadpages" - websites[i].screenshoturl:  ' + websites[i].screenshoturl);
 				} else {
 					websites[i].screenshoturl2 = 'nope'; 
				}
		 		
		 		// allinone image
		 		if (((websites[i].imgdirectoryallinone !== null) && (websites[i].imgfilenameallinone !== null)) && 
		 			((websites[i].imgdirectoryallinone !== '') && (websites[i].imgfilenameallinone !== ''))) {
					//console.log('"loadpages" - found a screenshot');
					websites[i].screenshotallinone = screenShotDirClient + '/' + websites[i].imgdirectoryallinone +'/' + websites[i].imgfilenameallinone; 
					// console.log('"loadpages" - websites[i].screenshoturl:  ' + websites[i].screenshoturl);
 				} else {
 					websites[i].screenshotallinone = 'nope'; 
				}
			}
			
 			$scope.allPages = websites;
 			$scope.countPages = websites.length;
 			
 			// console.log('ScreenshotCompareCtrl: $scope.allPages:   ' + JSON.stringify(data)); 
 			$scope.selectedComparison = pagedata.selectedComparison.name;
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "pages succesfully laoded !";
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
			var arr = [];
			// add a useful text for the user to select
			for (var i = 0; i < data.length; i++) {
				if (data[i].jobtype == 'comparejob') {
					s = 'uid: ' + data[i].uid + '  |  ' + data[i].name + ' |  ' + data[i].description + '  |  ' + data[i].status;
					data[i].text = s;
					arr.push(data[i]);
				} 
			}
			$scope.allComparisons = arr; 

			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "pages succesfully laoded!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000); 
		}, function(error) {
			$scope.allDomains = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the domains from the server!";
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
