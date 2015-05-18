'use strict'; 
 
app.controller('SeoKeywordsPerPageByContentTypeCtrl', function ($scope, factSeo, factDomains, $timeout, $q) {
	console.log ('SeoKeywordsPerPageByContentTypeCtrl');
	 
	function loadCrawlJobs() {
		factSeo.getCrawlJobs().then(function(data) {
			console.log('SeoKeywordsPerPageByContentTypeCtrl: getCrawlJobs. SUCCESS: status: ' + JSON.stringify(data));
			
			for (var i = 0; i < data.length; i++) {
				data[i].text = data[i].name + '  |  ' + data[i].description+ '  |  ' + data[i].status+ '  |  ' +   'uid: '+ data[i].uid ;
			}
			
			$scope.allJobs = data;
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "jobs loaded successfully from the server!";
//			loadDomains(); 

			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);  
			
		}, function (error) {
			console.log('SeoKeywordsPerPageByContentTypeCtrl: getCrawlJobs. ERROR: error: ' + JSON.stringify(error));
			
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
			
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the jobs from the server!";
		});	
	}
	
	$scope.loadKeywords = function(newKeywordList) {
		$scope.data = {};
 		var json = {
			jobuid : newKeywordList.selectedJob.uid,
		}
 		if (newKeywordList.maxKeywords !== undefined) {
 			json.numberKeywords =  newKeywordList.maxKeywords.maxCount
  		} else {
 			json.numberKeywords =  10000;

  		}
		console.log('SeoKeywordsPerPageByContentTypeCtrl: loadKeywords. josn: ' + JSON.stringify(json, null, 4));

		factSeo.getKeywordsPerPageByContentElement(json).then(function(data) {
			console.log('SeoKeywordsPerPageByContentTypeCtrl: getKeywords. SUCCESS: status: ' + JSON.stringify(data, null, 4));
  
			$scope.allCriteria = data;
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "keywords loaded successfully from the server!";
 
			for (var i = 0; i < data.length; i++) {
				console.log('SeoKeywordsPerPageByContentTypeCtrl: getKeywords. data[i]: ' + JSON.stringify(data[i], null, 4));
 			}
 
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);  
			
		}, function (error) {
			console.log('SeoKeywordsPerPageByContentTypeCtrl: getKeywords. ERROR: error: ' + JSON.stringify(error));
 			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
			
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the keywords from the server!";
		});	
	}
 
	loadCrawlJobs();
	
	$scope.numberKeywords = [];

	var entry= {
		text: '50',
		maxCount : 50
	}
	$scope.numberKeywords.push(entry);
	
	var entry= {
		text: '100',
		maxCount : 1000
	}
	$scope.numberKeywords.push(entry);
	
	var entry= {
		text: '250',
		maxCount : 250
	}
	$scope.numberKeywords.push(entry);
	
	var entry= {
		text: '500',
		maxCount : 500
	}
	$scope.numberKeywords.push(entry);
	
	var entry= {
		text: '1000',
		maxCount : 1000
	}
	$scope.numberKeywords.push(entry);
	
	var entry= {
		text: '5000',
		maxCount : 5000
	}
	$scope.numberKeywords.push(entry);

	var entry= {
		text: 'all',
		maxCount : 100000000
	}
	$scope.numberKeywords.push(entry);
})
