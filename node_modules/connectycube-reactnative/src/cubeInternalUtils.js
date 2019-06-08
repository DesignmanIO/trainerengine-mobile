const config = require('./cubeConfig'),
	Utils = require('./cubeUtils');

// The object for type MongoDB.Bson.ObjectId
// http://docs.mongodb.org/manual/reference/object-id/
let ObjectId = {
	machine: Math.floor(Math.random() * 16777216).toString(16),
	pid: Math.floor(Math.random() * 32767).toString(16),
	increment: 0
};

const InternalUtils = {
	getEnv: function () {
		return Utils.getEnv();
	},

	isWebRTCAvailble: function () {
		return Utils.isWebRTCAvailble();
	},

	safeCallbackCall: function () {
		let listenerString = arguments[0].toString(),
			listenerName = listenerString.split('(')[0].split(' ')[1],
			argumentsCopy = [],
			listenerCall;

		for (let i = 0; i < arguments.length; i++) {
			argumentsCopy.push(arguments[i]);
		}

		listenerCall = argumentsCopy.shift();

		try {
			listenerCall.apply(null, argumentsCopy);
		} catch (err) {
			if (listenerName === '') {
				console.error('Error: ' + err);
			} else {
				console.error('Error in listener ' + listenerName + ': ' + err);
			}
		}
	},

	randomNonce: function () {
		return Math.floor(Math.random() * 10000);
	},

	unixTime: function () {
		return Math.floor(Date.now() / 1000);
	},

	getUrl: function (base, id) {
		var resource = id ? '/' + id : '';
		return 'https://' + config.endpoints.api + '/' + base + resource + config.urls.type;
	},

	isArray: function (arr) {
		return Object.prototype.toString.call(arr) === '[object Array]';
	},

	isObject: function (obj) {
		return Object.prototype.toString.call(obj) === '[object Object]';
	},

	isFunction: function (func) {
		return !!(func && func.constructor && func.call && func.apply);
	},

	// Generating BSON ObjectId and converting it to a 24 character string representation
	// Changed from https://github.com/justaprogrammer/ObjectId.js/blob/master/src/main/javascript/Objectid.js
	getBsonObjectId: function () {
		let timestamp = this.unixTime().toString(16),
			increment = (ObjectId.increment++).toString(16);

		if (increment > 0xffffff) ObjectId.increment = 0;

		return (
			'00000000'.substr(0, 8 - timestamp.length) +
			timestamp +
			'000000'.substr(0, 6 - ObjectId.machine.length) +
			ObjectId.machine +
			'0000'.substr(0, 4 - ObjectId.pid.length) +
			ObjectId.pid +
			'000000'.substr(0, 6 - increment.length) +
			increment
		);
	},

	DLog: function () {
		const self = this;

		if (self.loggers) {
			for (let i = 0; i < self.loggers.length; ++i) {
				self.loggers[i](arguments);
			}

			return;
		}

		let logger;

		self.loggers = [];

		let consoleLoggerFunction = function () {
			let logger = function (args) {
				console.log.apply(console, Array.prototype.slice.call(args));
			};

			return logger;
		};

		// Build loggers
		// format "debug: { }"

		if (typeof config.debug === 'object') {
			if (typeof config.debug.mode === 'number') {
				if (config.debug.mode == 1) {
					logger = consoleLoggerFunction();
					self.loggers.push(logger);
				}
			} else if (typeof config.debug.mode === 'object') {
				config.debug.mode.forEach(function (mode) {
					if (mode === 1) {
						logger = consoleLoggerFunction();
						self.loggers.push(logger);
					}
				});
			}

			// format "debug: true"
			// backward compatibility
		} else if (typeof config.debug === 'boolean') {
			if (config.debug) {
				logger = consoleLoggerFunction();
				self.loggers.push(logger);
			}
		}

		if (self.loggers) {
			for (let j = 0; j < self.loggers.length; ++j) {
				self.loggers[j](arguments);
			}
		}
	},

	getError: function (code, detail, moduleName) {
		let errorMsg = {
			code: code,
			status: 'error',
			detail: detail
		};

		switch (code) {
			case 401:
				errorMsg.message = 'Unauthorized';
				break;

			case 403:
				errorMsg.message = 'Forbidden';
				break;

			case 408:
				errorMsg.message = 'Request Timeout';
				break;

			case 422:
				errorMsg.message = 'Unprocessable Entity';
				break;

			case 502:
				errorMsg.message = 'Bad Gateway';
				break;

			default:
				errorMsg.message = 'Unknown error';
				break;
		}

		this.DLog('[' + moduleName + ']', 'Error:', detail);

		return errorMsg;
	},

	isExpiredSessionError: function (error) {
		try {
			return error && error.code === 401 && error.message.errors.base[0] === 'Required session does not exist';
		} catch (ex) {
			return false;
		}
	},

	MergeArrayOfObjects: function (arrayTo, arrayFrom) {
		const merged = JSON.parse(JSON.stringify(arrayTo));

		firstLevel: for (let i = 0; i < arrayFrom.length; i++) {
			const newItem = arrayFrom[i];

			for (let j = 0; j < merged.length; j++) {
				if (newItem.user_id === merged[j].user_id) {
					merged[j] = newItem;
					continue firstLevel;
				}
			}
			merged.push(newItem);
		}
		return merged;
	},

	toBase64: function (str) {
		if (this.getEnv().browser) {
			return btoa(
				encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
					return String.fromCharCode('0x' + p1);
				})
			);
		} else if (this.getEnv().reactnative) {
			return global.btoa(str);
		} else {
			// Node.js & Native Script
			return new Buffer(str).toString('base64');
		}
	}
};

module.exports = InternalUtils;
