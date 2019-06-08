const config = require('./cubeConfig'),
	Utils = require('./cubeInternalUtils'),
	sha1 = require('crypto-js/hmac-sha1'),
	sha256 = require('crypto-js/hmac-sha256');

function AuthProxy(service) {
	this.service = service;
	this.webSessionCheckInterval = null;
}

AuthProxy.prototype = {
	getSession: function (callback) {
		const ajaxParams = {
			url: Utils.getUrl(config.urls.session)
		};

		this.service.ajax(ajaxParams, function (err, res) {
			callback(err, res && res.session);
		});
	},

	createSession: function (paramsOrCallback, callback) {
		if (config.creds.appId === '' || config.creds.authKey === '' || config.creds.authSecret === '') {
			throw new Error('Cannot create a new session without app credentials (app ID, auth key and auth secret)');
		}

		const self = this;

		let route = config.urls.session,
			message;

		if (typeof paramsOrCallback === 'function' && typeof callback === 'undefined') {
			callback = paramsOrCallback;
			paramsOrCallback = {};
		}

		// Changes URL if it's web session.
		if (paramsOrCallback.hasOwnProperty('long')) {
			route = config.urls.webSession;
		}

		// Signature of message with SHA-1 or SHA-256 using secret key
		message = generateAuthMsg(paramsOrCallback);
		message.signature = signMessage(message, config.creds.authSecret);

		const ajaxParams = {
			url: Utils.getUrl(route),
			type: 'POST',
			data: message
		};

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				const response = res.qr_code ? res.qr_code : res.session;

				self.service.setSession(res.session);
				self.service.setCurrentUserId(res.session.user_id);
				callback(null, response);
			}
		});
	},

	destroySession: function (callback) {
		const self = this;

		const ajaxParams = {
			url: Utils.getUrl(config.urls.session),
			type: 'DELETE',
			dataType: 'text'
		};

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				self.service.setSession(null);
				callback(null);
			}
			self.service.setCurrentUserId(null);
		});
	},

	createWebSession: function (paramsOrCallback, callback) {
		const self = this;

		if (typeof paramsOrCallback === 'function' && typeof callback === 'undefined') {
			callback = paramsOrCallback;
			paramsOrCallback = {
				long: 0
			};
		}

		// the createSession method returns QR code for web session instead of session object
		self.createSession(paramsOrCallback, function (err, qrCode) {
			callback(err, qrCode);
		});
	},

	checkWebSessionUntilUpgrade: function (callback) {
		const self = this,
			interval = config.webSession.getSessionTimeInterval,
			timeoutError = new Error('The web session check interval was stopped (timeout)');

		let timeleft = config.webSession.getSessionTimeout;

		_clearWebSessionCheckTimer();

		self.webSessionCheckInterval = setInterval(function () {
			self.getSession(function (error, session) {
				if (error) {
					_clearWebSessionCheckTimer();
					callback(error, null);
				} else if (session.user_id !== 0) {
					_clearWebSessionCheckTimer();
					self.service.setCurrentUserId(session.user_id);
					self.service.setSession(session);
					callback(null, session);
				} else {
					if (timeleft > interval) {
						timeleft -= interval;
					} else {
						_clearWebSessionCheckTimer();
						callback(timeoutError, null);
						throw timeoutError;
					}
				}
			});
		}, interval * 1000);

		function _clearWebSessionCheckTimer() {
			if (self.webSessionCheckInterval) {
				clearInterval(self.webSessionCheckInterval);
			}
		}

		return self.webSessionCheckInterval;
	},

	upgradeWebSession: function (webToken, callback) {
		const ajaxParams = {
			url: Utils.getUrl(config.urls.webSession),
			type: 'PATCH',
			dataType: 'text',
			data: {
				web_token: webToken
			}
		};

		this.service.ajax(ajaxParams, function (err) {
			if (err) {
				callback(err);
			}
		});
	},

	login: function (params, callback) {
		const self = this;

		const ajaxParams = {
			type: 'POST',
			url: Utils.getUrl(config.urls.login),
			data: params
		};

		function handleResponce(err, res) {
			if (err) {
				callback(err, null);
			} else {
				self.service.setCurrentUserId(res.user.id);
				callback(null, res.user);
			}
		}

		this.service.ajax(ajaxParams, handleResponce);
	},

	logout: function (callback) {
		const ajaxParams = {
			url: Utils.getUrl(config.urls.login),
			type: 'DELETE',
			dataType: 'text'
		};

		this.service.ajax(ajaxParams, callback);
		this.service.setCurrentUserId(null);
	}
};

module.exports = AuthProxy;

/* Private
---------------------------------------------------------------------- */
function generateAuthMsg(params) {
	let message = {
		application_id: config.creds.appId,
		auth_key: config.creds.authKey,
		nonce: Utils.randomNonce(),
		timestamp: Utils.unixTime()
	};

	// With user authorization
	if (params.login && params.password) {
		message.user = { login: params.login, password: params.password };
	} else if (params.email && params.password) {
		message.user = { email: params.email, password: params.password };
	} else if (params.provider) {
		// Via social networking provider (e.g. facebook, twitter etc.)
		message.provider = params.provider;
		if (params.scope) {
			message.scope = params.scope;
		}
		if (params.keys && params.keys.token) {
			message.keys = { token: params.keys.token };
		}
		if (params.keys && params.keys.secret) {
			message.keys.secret = params.keys.secret;
		}
	} else if (params.hasOwnProperty('long')) {
		message.long = params.long;
	}

	return message;
}

function signMessage(message, secret) {
	let sessionMsg = Object.keys(message)
		.map(function (val) {
			if (typeof message[val] === 'object') {
				return Object.keys(message[val])
					.map(function (val1) {
						return val + '[' + val1 + ']=' + message[val][val1];
					})
					.sort()
					.join('&');
			} else {
				return val + '=' + message[val];
			}
		})
		.sort()
		.join('&');

	let cryptoSessionMsg;

	if (config.hash === 'sha1') {
		cryptoSessionMsg = sha1(sessionMsg, secret).toString();
	} else if (config.hash === 'sha256') {
		cryptoSessionMsg = sha256(sessionMsg, secret).toString();
	} else {
		throw new Error('Unknown crypto standards, available sha1 or sha256');
	}

	return cryptoSessionMsg;
}
