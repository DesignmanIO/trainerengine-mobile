const Utils = require('./cubeInternalUtils'),
	config = require('./cubeConfig');

function AddressBook(service) {
	this.service = service;
}

AddressBook.prototype = {
	/**
	 * The method is used to create, update and delete contacts in address book.<br />
	 * If contact doesn't exist in address book then it will be created. If contacts exists then it will be updated.
	 * If pass 'destroy: 1' then the contact will be removed.<br />
	 * The method accepts 2 or 3 parameters.
	 * @memberof CB.addressbook
	 * @param {Object[]} list - A list of contacts to create / update / delete.
	 * @param {Object} [options]
	 * @param {string} [options.udid] - User's device identifier. If specified all operations will be in this context. Max length 64 symbols.
	 * If not - it means a user has one global address book across all his devices.
	 * @param {number} [options.force] - Defines force rewrite mode.
	 * If set 1 then all previous contacts for device context will be replaced by new ones.
	 * @param {Function} callback - The savedAddressBookCallback function
	 */
	uploadAddressBook: function (list, optionsOrcallback, callback) {
		if (!Utils.isArray(list)) {
			new Error('First parameter must be an Array.');

			return;
		}

		let opts, cb;

		if (Utils.isFunction(optionsOrcallback)) {
			cb = optionsOrcallback;
		} else {
			opts = optionsOrcallback;
			cb = callback;
		}

		let data = { contacts: list };

		if (opts) {
			if (opts.force) {
				data.force = opts.force;
			}

			if (opts.udid) {
				data.udid = opts.udid;
			}
		}

		const ajaxParams = {
			type: 'POST',
			url: Utils.getUrl(config.urls.addressbook),
			data: data,
			contentType: 'application/json; charset=utf-8',
			isNeedStringify: true
		};

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				cb(err, null);
			} else {
				cb(null, res);
			}
		});
	},

	/**
	 * Retrive all contacts from address book.
	 * The method accepts 1 or 2 parameters.
	 * @memberof CB.addressbook
	 * @param {string|function} udidOrCallback - You could pass udid of address book or
	 * callback function if you want to get contacts from global address book.
	 * @param {function} [callback] - Callback function is used as 2nd parameter if you pass udid as 1st parameters.
	 * This callback takes 2 arguments: an error and a response.
	 */
	get: function (udidOrCallback, callback) {
		let udid, cb;

		if (Utils.isFunction(udidOrCallback)) {
			cb = udidOrCallback;
		} else {
			udid = udidOrCallback;
			cb = callback;
		}

		if (!Utils.isFunction(cb)) {
			throw new Error('A callback function is required.');
		}

		let ajaxParams = {
			type: 'GET',
			url: Utils.getUrl(config.urls.addressbook),
			contentType: 'application/json; charset=utf-8',
			isNeedStringify: true
		};

		if (udid) {
			ajaxParams.data = { udid: udid };
		}

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				const isFakeErrorEmptyAddressBook = _isFakeErrorEmptyAddressBook(err);

				if (isFakeErrorEmptyAddressBook) {
					cb(null, []);
				} else {
					cb(err, null);
				}
			} else {
				cb(null, res);
			}
		});
	},

	/**
	 * Retrieve users that have phone numbers from your address book.
	 * The methods accepts 1 or 2 parameters.
	 * @memberof CB.addressbook
	 * @param {boolean|function} udidOrCallback - You can pass isCompact parameter or callback object. If isCompact is passed then only user's id and phone fields will be returned from server. Otherwise - all standard user's fields will be returned.
	 * @param {function} [callback] - Callback function is useв as 2nd parameter if you pass `isCompact` as 1st parameter.
	 * This callback takes 2 arguments: an error and a response.
	 */
	getRegisteredUsers: function (isCompactOrCallback, callback) {
		let isCompact, cb;

		if (Utils.isFunction(isCompactOrCallback)) {
			cb = isCompactOrCallback;
		} else {
			isCompact = isCompactOrCallback;
			cb = callback;
		}

		if (!Utils.isFunction(cb)) {
			throw new Error('A callback function is required.');
		}

		let ajaxParams = {
			type: 'GET',
			url: Utils.getUrl(config.urls.addressbookRegistered),
			contentType: 'application/json; charset=utf-8'
		};

		if (isCompact) {
			ajaxParams.data = { compact: 1 };
		}

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				const isFakeErrorEmptyAddressBook = _isFakeErrorEmptyAddressBook(err);

				if (isFakeErrorEmptyAddressBook) {
					cb(null, []);
				} else {
					cb(err, null);
				}
			} else {
				cb(null, res);
			}
		});
	}
};

module.exports = AddressBook;

// Emulates normal response from the REST API server
function _isFakeErrorEmptyAddressBook(err) {
	const errDetails = err.detail ? err.detail : err.message.errors;

	return err.code === 404 && errDetails[0] === 'Empty address book';
}
