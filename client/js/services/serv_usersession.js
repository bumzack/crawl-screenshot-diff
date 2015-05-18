'use strict';

app.service('UserSession', function () {
	this.create = function (userId, userAccessrights) {
		console.log('UserSession.create: userId: %d, userAccessrights: %s ', userId, userAccessrights);
		this.userId = userId;
		this.userAccessrights = userAccessrights; 
	};
	this.destroy = function () {
		this.userId = null;
		this.userAccessrights = null;
	};
	return this;
});
