const config = require('./cubeConfig'),
	Utils = require('./cubeInternalUtils');

const DATE_FIELDS = ['created_at', 'updated_at', 'last_request_at'];
const NUMBER_FIELDS = ['id', 'external_user_id'];

const resetPasswordUrl = config.urls.users + '/password/reset';

function UsersProxy(service) {
	this.service = service;
}

UsersProxy.prototype = {
	/**
	 * Retrieve a specific user or users
	 * @memberof CB.users
	 * @param {(number|object)} params - A (number) or object of parameters (object with one of next required properties)
	 * @param {string} params.login - The login of the user to be retrieved.
	 * @param {string} params.full_name - The full name of users to be retrieved.
	 * @param {string} params.facebook_id - The user's facebook uid.
	 * @param {string} params.twitter_id - The user's twitter uid.
	 * @param {string} params.phone - The user's phone number
	 * @param {string} params.email - The user's email address.
	 * @param {(string|string[])} params.tags - A comma separated list of tags associated with users.
	 * @param {(number|string)} params.external - An uid that represents the user in an external user registry.
	 * @param {string} [params.page=1] - Used to paginate the results when more than one page of users retrieved (can be used with get by 'full_name' or 'tags')
	 * @param {string} [params.per_page=10] - The maximum number of users to return per page, if not specified then the default is 10 (can be used with get by 'full_name' or 'tags')
	 * @param {getUsersCallback} callback - The getUsersCallback function
	 */
	get: function (params, callback) {
		/**
		 * Callback for CB.users.get(params, callback)
		 * @callback getUsersCallback
		 * @param {object} error - The error object
		 * @param {object} response - The user object or object with Array of users
		 */
		let url,
			filters = [],
			item;

		if (params.order) {
			params.order = generateOrder(params.order);
		}

		if (params && params.filter) {
			if (Utils.isArray(params.filter)) {
				params.filter.forEach(function (el) {
					item = generateFilter(el);
					filters.push(item);
				});
			} else {
				item = generateFilter(params.filter);
				filters.push(item);
			}
			params.filter = filters;
		}

		if (typeof params === 'number') {
			url = params;
			params = {};
		} else {
			if (params.login) {
				url = 'by_login';
			} else if (params.full_name) {
				url = 'by_full_name';
			} else if (params.facebook_id) {
				url = 'by_facebook_id';
			} else if (params.twitter_id) {
				url = 'by_twitter_id';
			} else if (params.phone) {
				url = 'phone';
			} else if (params.email) {
				url = 'by_email';
			} else if (params.tags) {
				url = 'by_tags';
			} else if (params.external) {
				url = 'external/' + params.external;
				params = {};
			}
		}

		const ajaxParams = {
			url: Utils.getUrl(config.urls.users, url),
			data: params
		};

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, res.user || res);
			}
		});
	},

	/**
	 * Registers a new app user. Call this API to register a user for the app. You must provide either a user login or email address along with their password, passing both email address and login is permitted but not required.
	 * @memberof CB.users
	 * @param {object} params - object of user's parameters
	 * @param {string} params.login - The user's login name
	 * @param {string} params.password - The user's password for this app
	 * @param {string} params.email - The user's email address
	 * @param {string} [params.full_name] - The user's full name
	 * @param {string} [params.phone] - The user's phone number
	 * @param {string} [params.website] - The user's web address, or other url
	 * @param {string} [params.facebook_id] - The user's facebook uid
	 * @param {string} [params.twitter_id] - The user's twitter uid
	 * @param {number} [params.blob_id] - The id of an associated blob for this user, for example their photo
	 * @param {(number|string)} [params.external_user_id] - An uid that represents the user in an external user registry
	 * @param {(string|string[])} [params.tag_list] - A comma separated list of tags associated with the user. Set up user tags and address them separately in your app
	 * @param {string} [params.custom_data] - The user's additional info
	 * @param {createUserCallback} callback - The createUserCallback function
	 */
	signup: function (params, callback) {
		/**
		 * Callback for CB.users.signup(params, callback)
		 * @callback createUserCallback
		 * @param {object} error - The error object
		 * @param {object} response - The user object
		 */
		const ajaxParams = {
			url: Utils.getUrl(config.urls.users),
			type: 'POST',
			data: {
				user: params
			}
		};

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, res.user);
			}
		});
	},

	/**
	 * Update current user. In normal usage, nobody except the user is allowed to modify their own data. Any fields you don’t specify will remain unchanged, so you can update just a subset of the user’s data. login/email and password may be changed, but the new login/email must not already be in use.
	 * @memberof CB.users
	 * @param {object} params - object of user's parameters
	 * @param {string} [params.login] - The user's login name
	 * @param {string} [params.old_password] - The user's old password for this app
	 * @param {string} [params.password] - The user's new password for this app
	 * @param {string} [params.email] - The user's email address
	 * @param {string} [params.full_name] - The user's full name
	 * @param {string} [params.phone] - The user's phone number
	 * @param {string} [params.website] - The user's web address, or other url
	 * @param {string} [params.facebook_id] - The user's facebook uid
	 * @param {string} [params.twitter_id] - The user's twitter uid
	 * @param {number} [params.blob_id] - The id of an associated blob for this user, for example their photo
	 * @param {(number|string)} [params.external_user_id] - An uid that represents the user in an external user registry
	 * @param {(string|string[])} [params.tag_list] - A comma separated list of tags associated with the user. Set up user tags and address them separately in your app
	 * @param {string} [params.custom_data] - The user's additional info
	 * @param {updateUserCallback} callback - The updateUserCallback function
	 */
	update: function (params, callback) {
		/**
		 * Callback for CB.users.update(params, callback)
		 * @callback updateUserCallback
		 * @param {object} error - The error object
		 * @param {object} response - The user object
		 */
		const ajaxParams = {
			url: Utils.getUrl(config.urls.users, this.service.getCurrentUserId()),
			type: 'PUT',
			data: { user: params }
		};

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(null, res.user);
			}
		});
	},

	/**
	 * Remove a user from the app.
	 * @memberof CB.users
	 * @param {deleteUserCallback} callback - An uid that represents the user in an external user registry
	 */
	delete: function (callback) {
		/**
		 * Callback for CB.users.delete(callback)
		 * @callback deleteUserCallback
		 * @param {object} error - The error object
		 */
		const ajaxParams = {
			url: Utils.getUrl(config.urls.users, this.service.getCurrentUserId()),
			type: 'DELETE',
			dataType: 'text'
		};

		this.service.ajax(ajaxParams, callback);
	},

	/**
	 * You can initiate password resets for users who have emails associated with their account. Password reset instruction will be sent to this email address
	 * @memberof CB.users
	 * @param {string} email - The user's email to send reset password instruction
	 * @param {resetPasswordByEmailCallback} callback - The resetPasswordByEmailCallback function
	 */
	resetPassword: function (email, callback) {
		/**
		 * Callback for CB.users.resetPassword(email, callback)
		 * @callback resetPasswordByEmailCallback
		 * @param {object} error - The error object
		 */
		const ajaxParams = {
			url: Utils.getUrl(resetPasswordUrl),
			data: {
				email: email
			},
			dataType: 'text'
		};

		this.service.ajax(ajaxParams, callback);
	}
};

module.exports = UsersProxy;

/* Private
---------------------------------------------------------------------- */
function generateFilter(obj) {
	let type = obj.field in DATE_FIELDS ? 'date' : typeof obj.value;

	if (Utils.isArray(obj.value)) {
		if (type === 'object') {
			type = typeof obj.value[0];
		}
		obj.value = obj.value.toString();
	}

	return [type, obj.field, obj.param, obj.value].join(' ');
}

function generateOrder(obj) {
	const type = obj.field in DATE_FIELDS ? 'date' : obj.field in NUMBER_FIELDS ? 'number' : 'string';
	return [obj.sort, type, obj.field].join(' ');
}
