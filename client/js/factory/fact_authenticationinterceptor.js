app.factory('authenticationInterceptor', function ($rootScope, $q, $window, $location) {
    return {
        request: function (config) {
            config.headers = config.headers || {};
            
            var token = null; 
            if ($window.localStorage.token) {            	            	
                token = $window.localStorage.token;
                console.log('authenticationInterceptor: found token in localStorage');
            } else if ($window.sessionStorage.token) {
            	token = $window.sessionStorage.token;                
            	console.log('authenticationInterceptor: found token in sessionsStorage');
            }            
            if (token != null) {
            	config.headers.Authorization = 'Bearer ' + token;
            }            
            return config;
        },
        responseError: function (response) {
            if(response.status === 401) {
            	console.log('authenticationInterceptor: redirect to login');  
                $location.path('/userlogin');
            }
            return $q.reject(response);
        }
    };
});
