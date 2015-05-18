'use strict'; 

app.controller('ApplicationCtrl', function ($scope, AuthenticationService, AUTH_EVENTS, $window) {
	console.log ('ApplicationCtrl');
	
	$scope.currentUser = null;
 	$scope.accessrights = AuthenticationService.accessrights;
	
	if ($window.localStorage.token) {
		console.log('ApplicationCtrl: token is set in localStorage -> call AuthenticationService.setUser');
		console.log('ApplicationCtrl: token ' + $window.localStorage.token); 
		$scope.currentUser = AuthenticationService.setUser($window.localStorage.token);
		$scope.isAuthorized = AuthenticationService.isAuthorized;
	} else if ($window.sessionStorage.token) {
		console.log('ApplicationCtrl: token is set in sessionStorage  -> call AuthenticationService.setUser');
		console.log('ApplicationCtrl: token is set in sessionStorage  -> call AuthenticationService.setUser');

		$scope.currentUser = AuthenticationService.setUser($window.sessionStorage.token);
		$scope.isAuthorized = AuthenticationService.isAuthorized;
	}
	
	$scope.setCurrentUser = function (user) {
		console.log('ApplicationCtrl: setCurrentUser');
		$scope.currentUser = user;
	};
	
	$scope.logout = function () {
		AuthenticationService.logout(); ;
		$scope.currentUser = null;
	};
	
	$scope.$on(AUTH_EVENTS.notAuthorized, function(event, args) {
		console.log('ApplicationCtrl - received event:  AUTH_EVENTS.notAuthorized');
 	});	
	
	$scope.$on(AUTH_EVENTS.notAuthenticated, function(event, args) {
		console.log('ApplicationCtrl - received event:  AUTH_EVENTS.notAuthenticated');
 	});

	$scope.$on(AUTH_EVENTS.isLoggedIn, function(event, args) {
		console.log('ApplicationCtrl - received event:  AUTH_EVENTS.isLoggedIn');
 	});
});
