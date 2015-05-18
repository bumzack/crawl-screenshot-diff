'use strict'; 
 
app.controller('BlacklistCtrl', function ($scope, factBlacklist,factSeo,  $timeout) {
	console.log ('BlacklistCtrl');
	
	$scope.showError = false; 
	$scope.showInfo = false; 
	$scope.showSuccess = false; 

	$scope.newwordlist = {}; 
	
	$scope.addWordlist = function () {
		var newwordlist = $scope.newwordlist.words;
		console.log('BlacklistCtrl: started  " "');
 		console.log('BlacklistCtrl: newwordlist: ' + JSON.stringify(newwordlist));
  
 		factBlacklist.addWordlist(newwordlist).then(function(status) {
  			console.log('BlacklistCtrl: addWordlist. SUCCESS: status: ' + JSON.stringify(status));
  			$scope.showSuccess = true; 
  			$scope.alertSuccessMessage = "List with words saved!";
  			$timeout(function() {
  				$scope.showSuccess = false; 
  				$scope.alertSuccessMessage = '';
  			}, 3000);  
  			loadBlacklist();
 	 	}, function (error) {
  			console.log('BlacklistCtrl: addWordlist. ERROR: error: ' + JSON.stringify(error));
  			$scope.showError = true; 
  			$scope.alertErrorMessage = "an error occured while saving the wordlist!";
  			$timeout(function() {
  				$scope.showError = false; 
  				$scope.alertErrorMessage = '';
  			}, 3000);
 		});	
 		 
		console.log('BlacklistCtrl: ended  "addWordlist"'); 
	};
 
	$scope.wordDelete = function (uid) {
		console.log('BlacklistCtrl: $scope.wordDelete. uid' + uid);

  		factBlacklist.deleteWord(uid).then(function(status) {
  			console.log('BlacklistCtrl: wordDelete. SUCCESS: status: ' + JSON.stringify(status));
  			$scope.showSuccess = true; 
  			$scope.alertSuccessMessage = "word deleted!";
  			$timeout(function() {
  				$scope.showSuccess = false; 
  				$scope.alertSuccessMessage = '';
  			}, 3000);  		
  			loadBlacklist();
 	 	}, function (error) {
  			console.log('BlacklistCtrl: wordDelete. ERROR: error: ' + JSON.stringify(error));
  			$scope.showError = true; 
  			$scope.alertErrorMessage = "an error occured while deleting the word!";
  			$timeout(function() {
  				$scope.showError = false; 
  				$scope.alertErrorMessage = '';
  			}, 3000);
 		});	
 		 
		console.log('BlacklistCtrl: ended  "wordDelete"'); 
	};
	
	function loadBlacklist() {
		// load existing domains and show them
		factBlacklist.getAll().then(function(data) {
			$scope.allWords = data; 
			console.log('BlacklistCtrl: $scope.allWords:   ' + JSON.stringify(data)); 
	 
			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "words loaded!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);
			loadSEOWords();
		}, function(error) {
			$scope.allWords = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "an error occured while laoding the words!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
		});
	}
	
	function loadSEOWords() {
		// load existing domains and show them
		factSeo.getAllSEOWords().then(function(data) {
			console.log('BlacklistCtrl: $scope.allSEOWords:   ' + JSON.stringify(data, null, 4)); 
			$scope.allSEOWords = data; 

			$scope.showSuccess = true; 
			$scope.alertSuccessMessage = "seowords loaded successfully!";
			$timeout(function() {
				$scope.showSuccess = false; 
				$scope.alertSuccessMessage = '';
			}, 3000);
		}, function(error) {
			$scope.allWords = []; 
			$scope.showError = true; 
			$scope.alertErrorMessage = "an error occured while laoding the seowords!";
			$timeout(function() {
				$scope.showError = false; 
				$scope.alertErrorMessage = '';
			}, 3000);
		});
	}
	// first thing to do: load data
	loadBlacklist();
})
