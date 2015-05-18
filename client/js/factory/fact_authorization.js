'use strict';

app.factory('AuthenticationService', function ($http, UserSession, PAGES, $window) {
	var AuthenticationService = {};
	
	AuthenticationService.login = function (credentials) {
		return $http.post('/login', credentials)
			.then(function (data) {
				// console.log('AuthenticationServe post /login credentials success. data: ' + JSON.stringify(data));  
				$window.sessionStorage.token = data.data.token;
				$window.localStorage.token = data.data.token;
		    	var user = angular.fromJson($window.atob(data.data.token.split('.')[1]));
				console.log('AuthenticationServe post /login was success -> user: ' + JSON.stringify(user));
				console.log('AuthenticationServe post /login was success -> setting UserSession: ' );
				
				user = AuthenticationService.extractPageAccessRights(user); 
				UserSession.create(user.uid, user.accessrights);
				
				return user;
			});
	};
	 
	AuthenticationService.isAuthenticated = function () {
		return !!UserSession.userId;
	};
	
	AuthenticationService.extractPageAccessRights = function (user) {
		// set all access rights to false
		if (user.admin) {
			console.log('extractPageAccessRights:   user is admin');
			for (var i = 0; i < PAGES.length; i++) {
				user[PAGES[i]] = true;			
			}	
		} else {
			console.log('extractPageAccessRights:   user is NOT admin');
			for (var i = 0; i < PAGES.length; i++) {
				user[PAGES[i]] = false;			
			}			
			// split the string into an array and overwrite the "false" values from above
			var allowed = user.accessrights.split(',');
			console.log('AuthenticationService.extractPageAccessRights : allowed: ' + JSON.stringify(allowed));
	
			for (var i = 0; i < allowed.length; i++) {
				user[allowed[i]] = true;			
			}
			
			console.log('AuthenticationService.extractPageAccessRights : user: ' + JSON.stringify(user));
		}
		return user; 
	}
	
	AuthenticationService.setUser = function (token) {
		if (token === undefined) {
			console.log('AuthenticationService.setUser::  got an token === undefined   - WHY');
			return null; 
		}
		var user = angular.fromJson($window.atob(token.split('.')[1]));
		console.log('AuthenticationServe setUser    user: ' + JSON.stringify(user));  
		console.log('AuthenticationServe setUser    call extractPageAccessRights: ');
		user = this.extractPageAccessRights(user);
		
    	UserSession.create(user.uid, user.accessrights);
    	return user;
	}; 

	AuthenticationService.logout = function () {
		delete $window.sessionStorage.token;
		delete $window.localStorage.token;
		UserSession.destroy();				
	};
	 
	return AuthenticationService;
});
