'use strict'; 

// https://medium.com/opinionated-angularjs/techniques-for-authentication-in-angularjs-applications-7bbf0346acec
 
app.controller('LoginCtrl', function ($scope, $rootScope, AUTH_EVENTS, AuthenticationService, $window) {
	console.log ('LoginCtrl');
	
	$scope.login = function (credentials) {
		console.log('clicked login');
		 
		console.log('LoginCtrl: credentials: ' + JSON.stringify(credentials));
		
		var shaPassword = new jsSHA(credentials.passwordClear, "TEXT");
		var hash = shaPassword.getHash("SHA-512", "HEX");
		
		credentials.password = hash; 		
		
		AuthenticationService.login(credentials).then(function (user) {
			console.log('ctrl_login: AuthenticationService.login.  user : ' + JSON.stringify(user)); 
 
	    	$scope.setCurrentUser(user);
 	       
 	    	console.log('login successful');
 	    	$scope.alertSuccessMessage = 'Authentication successful.';
 	    	$scope.showError = false;
 	    	$scope.showSuccess = true;
	    	 	    	
	    }, function (data) {
	    	delete $window.sessionStorage.token;
	    	delete $window.localStorage.token;
	    	console.log('login failed msg: ' + JSON.stringify(data.data)); 
 	    	$scope.alertErrorMessage = 'Authentication failed. Error mesage: ' + data.data;
 	    	$scope.showError = true;
 	    	$scope.showSuccess = false;	    	
	    });
	};
})
