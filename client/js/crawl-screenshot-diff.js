'use strict';

var app = angular.module('crawlscreenshotApp', ['ngRoute'])	 
 
// 	constant values for authentication service
	.constant('AUTH_EVENTS', {
		loginSuccess: 'auth-login-success',
		loginFailed: 'auth-login-failed',
		logoutSuccess: 'auth-logout-success',
		sessionTimeout: 'auth-session-timeout',
		notAuthenticated: 'auth-not-authenticated',
		notAuthorized: 'auth-not-authorized',
		isLoggedIn: 'user-is-logged-in'
	})
	
	.constant('PAGES', ['PAGE_JOBS', 'PAGE_ANALYTICS', 'PAGE_DOMAIN', 'PAGE_SEO'])

 	.config(function($routeProvider, $locationProvider, $httpProvider, AUTH_EVENTS) {
 			$locationProvider.html5Mode(false);
 			
 			var checkLoggedin = function($q, $timeout, $http, $location, AuthenticationService, $rootScope) {
				// Initialize a new promise
				var deferred = $q.defer();	
				if (AuthenticationService.isAuthenticated()) {
					// user is not allowed									
					console.log('checkLoggedIn: user  is loggedin ');
					$rootScope.$broadcast(AUTH_EVENTS.isLoggedIn);
					$timeout(deferred.resolve, 0);
				} else {
					//console.log('checkLoggedIn: user  is NOT loggedin ');
					// 	user is not logged in
					$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
					console.log('checkLoggedIn: broadcast msg "AUTH_EVENTS.notAuthenticated" ');
					$timeout(function() { deferred.reject(); }, 0);
					$location.url('/userlogin');
				}
				return deferred.promise;
			};
  
			$routeProvider.when('/jobs', {
				templateUrl : '/template/jobs.html',
				resolve : {
					loggedin : checkLoggedin
				}
			}).when('/joblist', {
				templateUrl : '/template/joblist.html',
				resolve : {
					loggedin : checkLoggedin
				}
			}).when('/domains', {
				templateUrl : '/template/domains.html',
				resolve : {
					loggedin : checkLoggedin
				}
			}).when('/seo', {
				templateUrl : '/template/seo.html',
				resolve : {
					loggedin : checkLoggedin
				}
			}).when('/seo-keywords', {
				templateUrl : '/template/seo_keywords.html',
				resolve : {
					loggedin : checkLoggedin
				}
			}).when('/seo-keywords-per-page', {
				templateUrl : '/template/seo_keywords_per_page.html',
				resolve : {
					loggedin : checkLoggedin
				} 
			}).when('/seo-keywords-per-page-by-contentelement', {
				templateUrl : '/template/seo_keywords_by_content_type.html',
				resolve : {
					loggedin : checkLoggedin
				}
			}).when('/analytics', {
				templateUrl : '/template/analytics.html',
				resolve : {
					loggedin : checkLoggedin
				} 
			}).when('/analyse-differences', {
				templateUrl : '/template/screencomparison.html',
				resolve : {
					loggedin : checkLoggedin
				}
			}).when('/userlogin', {
				templateUrl : '/template/login.html',				
			}).otherwise({
				redirectTo : '/userlogin',				
			}); 
		// add the token to each server request
		$httpProvider.interceptors.push('authenticationInterceptor');
	}); 
