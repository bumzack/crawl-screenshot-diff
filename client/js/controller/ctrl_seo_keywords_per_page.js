'use strict'; 
 
app.controller('SeoKeywordsPerPageCtrl', function ($scope, factSeo, factDomains, $timeout, $q) {
	console.log ('SeoKeywordsPerPageCtrl');
	 
	function loadCrawlJobs() {
		factSeo.getCrawlJobs().then(function(data) {
			console.log('SeoKeywordsPerPageCtrl: getCrawlJobs. SUCCESS: status: ' + JSON.stringify(data));
			
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
			console.log('SeoKeywordsPerPageCtrl: getCrawlJobs. ERROR: error: ' + JSON.stringify(error));
			
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
		console.log('SeoKeywordsPerPageCtrl: loadKeywords. josn: ' + JSON.stringify(json, null, 4));

		factSeo.getKeywordsPerPage(json).then(function(data) { 			
			// count how often each keyword appears per page 
			var pages = {};
			var path, keyword;
			for (var i = 0; i < data.length; i++) {
				path = data[i].path;
				console.log('SeoKeywordsPerPageCtrl: getKeywords. path' + JSON.stringify(path, null, 4));

				if (pages[path] == undefined) {
					keyword = data[i].word; 

					var entry = {
						keywords : {}
					}
					entry.keywords[keyword] = 1; 
 					pages[path] = entry;
 					
 					// console.log('SeoKeywordsPerPageCtrl: getKeywords. pages' + JSON.stringify(pages, null, 4));
 				} else {
 					// console.log('pages[path] already exists')
 					// console.log('SeoKeywordsPerPageCtrl: getKeywords. pages[path]' + JSON.stringify(pages[path], null, 4));
 					keyword = data[i].word; 
 					
 					if (pages[path].keywords[keyword] == undefined) {
 						var entry = {
 							count : 1
 		 				}
 						pages[path].keywords[keyword] = entry; 
					} else {
						pages[path].keywords[keyword].count++; 
					} 
				}
 			}
			 console.log('SeoKeywordsPerPageCtrl: getKeywords.pages: ' + JSON.stringify(pages, null, 4));

			// create an array from the key->value store
			var pageArr = [];
			var keywords;
 			if (Object.keys(pages).length > 0) {
 	 			for (var page in pages) {
 	 				var entry = {
 	 					pagename : page,
 	 					keywords : []
 	 				}; 
 	 				keywords = pages[page].keywords;
 	 	 			if (Object.keys(keywords).length > 0) { 
  	 	 	 			for (var keyword in keywords) {
  	 	 	 				console.log('keyword: '+ keyword);
 	 	 	 				var entryKeyword = {
 	 	 	 					keyword : keyword,
 	 	 	 					count	: keywords[keyword].count
 	 	 	 				}
 	 	  	 	 	 		entry.keywords.push(entryKeyword);
 	 	 	 			}	 	 			
  	 	 	 		}
 	 				pageArr.push(entry);
 	 			}
 			}
 			
			 console.log('SeoKeywordsPerPageCtrl: pageArr: ' + JSON.stringify(pageArr, null, 4));

			$scope.allPages = pageArr;
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "keywords loaded successfully from the server!";
//			loadDomains(); 
			$scope.countKeywords = data.length;

			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);  
			
		}, function (error) {
			console.log('SeoKeywordsPerPageCtrl: getKeywords. ERROR: error: ' + JSON.stringify(error));
			
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
			
			$scope.showError = true; 
			$scope.alertErrorMessage = "error while retrieving the jobs from the server!";
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
