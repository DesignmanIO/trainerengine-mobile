const config = require('./cubeConfig'),
	Utils = require('./cubeInternalUtils'),
	fetchImpl = require('./cubeDependencies').fetchImpl,
	formDataImpl = require('./cubeDependencies').formDataImpl;

function ServiceProxy() {
	this.sdkInstance = {
		config: config,
		session: null
	};

	this.currentUserId = null;

	this.reqCount = 0;
}

ServiceProxy.prototype = {
	setSession: function (session) {
		this.sdkInstance.session = session;
	},

	getSession: function () {
		return this.sdkInstance.session;
	},

	setCurrentUserId: function (userId) {
		this.currentUserId = userId;
	},

	getCurrentUserId: function () {
		return this.currentUserId;
	},

	handleResponse: function (error, response, next, retry) {
		// can add middleware here...
		if (Utils.isExpiredSessionError(error) && typeof config.on.sessionExpired === 'function') {
			config.on.sessionExpired(function () {
				next(error, response);
			}, retry);
		} else {
			if (error) {
				next(error, null);
			} else {
				next(null, response);
			}
		}
	},

	logRequest: function (params) {
		let clonedData;

		++this.reqCount;

		if (params.data && params.data.file) {
			clonedData = JSON.parse(JSON.stringify(params.data));
			clonedData.file = '...';
		} else if (Utils.getEnv().nativescript) {
			clonedData = JSON.stringify(params.data);
		} else {
			clonedData = params.data;
		}

		Utils.DLog(
			'[Request][' + this.reqCount + ']',
			(params.type || 'GET') + ' ' + params.url,
			clonedData ? clonedData : ''
		);
	},

	ajax: function (params, callback) {
		this.logRequest(params);

		const self = this,
			isGetOrHeadType = !params.type || params.type === 'GET' || params.type === 'HEAD',
			cbSessionToken = self.sdkInstance && self.sdkInstance.session && self.sdkInstance.session.token,
			iscbRequest = params.url.indexOf('s3.amazonaws.com') === -1,
			isMultipartFormData = params.contentType === false,
			cbDataType = params.dataType || 'json';

		let cbUrl = params.url,
			cbRequest = {},
			cbRequestBody,
			cbResponse;

		cbRequest.method = params.type || 'GET';

		if (params.data) {
			cbRequestBody = _getBodyRequest();

			if (isGetOrHeadType) {
				cbUrl += '?' + cbRequestBody;
			} else {
				cbRequest.body = cbRequestBody;
			}
		}

		if (!isMultipartFormData) {
			cbRequest.headers = {
				'Content-Type': params.contentType || 'application/x-www-form-urlencoded; charset=UTF-8'
			};
		}

		if (iscbRequest) {
			if (!cbRequest.headers) {
				cbRequest.headers = {};
			}

			cbRequest.headers['CB-SDK'] = 'JS ' + config.version + ' - Client';

			if (cbSessionToken) {
				cbRequest.headers['CB-Token'] = cbSessionToken;
			}
		}

		if (config.timeout) {
			cbRequest.timeout = config.timeout;
		}

		fetchImpl(cbUrl, cbRequest)
			.then(
				function (response) {
					cbResponse = response;

					if (cbDataType === 'text') {
						return response.text();
					} else {
						return response.json();
					}
				},
				function () {
					// Need to research this issue, response doesn't exist if server will return empty body (status 200)
					cbResponse = {
						status: 200
					};

					return ' ';
				}
			)
			.then(
				function (body) {
					_requestCallback(null, cbResponse, body);
				},
				function (error) {
					_requestCallback(error);
				}
			);

		/*
         * Private functions
         * Only for ServiceProxy.ajax() method closure
         */

		function _fixedEncodeURIComponent(str) {
			return encodeURIComponent(str).replace(/[#$&+,/:;=?@\[\]]/g, function (c) {
				return '%' + c.charCodeAt(0).toString(16);
			});
		}

		function _getBodyRequest() {
			const data = params.data;

			let cbData;

			if (isMultipartFormData) {
				cbData = new formDataImpl();

				Object.keys(data).forEach(function (item) {
					if (params.fileToCustomObject && item === 'file') {
						cbData.append(item, data[item].data, data[item].name);
					} else {
						cbData.append(item, params.data[item]);
					}
				});
			} else if (params.isNeedStringify) {
				cbData = JSON.stringify(data);
			} else {
				cbData = Object.keys(data)
					.map(function (k) {
						if (Utils.isObject(data[k])) {
							return Object.keys(data[k])
								.map(function (v) {
									return (
										_fixedEncodeURIComponent(k) +
										'[' +
										(Utils.isArray(data[k]) ? '' : v) +
										']=' +
										_fixedEncodeURIComponent(data[k][v])
									);
								})
								.sort()
								.join('&');
						} else {
							return (
								_fixedEncodeURIComponent(k) +
								(Utils.isArray(data[k]) ? '[]' : '') +
								'=' +
								_fixedEncodeURIComponent(data[k])
							);
						}
					})
					.sort()
					.join('&');
			}

			return cbData;
		}

		function _requestCallback(error, response, body) {
			const statusCode = response && (response.status || response.statusCode);

			let responseMessage, responseBody;

			if (error || (statusCode !== 200 && statusCode !== 201 && statusCode !== 202)) {
				let errorMsg;

				try {
					errorMsg = {
						code: (response && statusCode) || (error && error.code),
						status: (response && response.headers && response.headers.status) || 'error',
						message: body || (error && error.errno),
						detail: (body && body.errors) || (error && error.syscall)
					};
				} catch (e) {
					errorMsg = error;
				}

				responseBody = body || error || body.errors;
				responseMessage = Utils.getEnv().nativescript ? JSON.stringify(responseBody) : responseBody;

				Utils.DLog('[Response][' + self.reqCount + ']', 'error', statusCode, responseMessage);

				if (params.url.indexOf(config.urls.session) === -1) {
					self.handleResponse(errorMsg, null, callback, retry);
				} else {
					callback(errorMsg, null);
				}
			} else {
				responseBody = body && body !== ' ' ? body : 'empty body';
				responseMessage = Utils.getEnv().nativescript ? JSON.stringify(responseBody) : responseBody;

				Utils.DLog('[Response][' + self.reqCount + ']', responseMessage);

				if (params.url.indexOf(config.urls.session) === -1) {
					self.handleResponse(null, body, callback, retry);
				} else {
					callback(null, body);
				}
			}
		}

		function retry(session) {
			if (!!session) {
				self.setSession(session);
				self.ajax(params, callback);
			}
		}
	}
};

module.exports = ServiceProxy;
