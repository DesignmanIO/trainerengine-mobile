const config = require('./cubeConfig'),
	Utils = require('./cubeInternalUtils');

function DataProxy(service) {
	this.service = service;
}

DataProxy.prototype = {
	/**
	 * Create new custom object.
	 *
	 * @memberof CB.data
	 *
	 * @param {string} className - A class name to which a new object belongs
	 * @param {object} data - Object of parameters (custom fields' names and their values)
	 * @param {createDataCallback} callback - The createDataCallback function
	 */
	create: function (className, data, callback) {
		/**
		 * Callback for CB.data.create(className, data, callback)
		 * @callback createDataCallback
		 * @param {object} error - The error object
		 * @param {object} response - An object
		 */
		const ajaxParams = {
			type: 'POST',
			data: data,
			isNeedStringify: true,
			contentType: 'application/json; charset=utf-8',
			url: Utils.getUrl(config.urls.data, className)
		};

		this.service.ajax(ajaxParams, function (err, res) {
			if (err) {
				callback(err, null);
			} else {
				callback(err, res);
			}
		});
	},

	/**
	 * Search for records of particular class.
	 *
	 * @memberof CB.data
	 *
	 * @param {string} className - A class name to which a new record belongs
	 * @param {(object|string[])} filters - Search records with field which contains exactly specified value or by array of records' ids to retrieve
	 * @param {number} [filters.skip=0] - Skip N records in search results. Useful for pagination. Default (if not specified) - 0
	 * @param {number} [filters.limit=100] - Limit search results to N records. Useful for pagination. Default and max values - 100. If limit is equal to -1 only last record will be returned
	 * @param {string} [filters.*] - filters
	 * @param {listOfDataCallback} callback - The listOfDataCallback function
	 */
	list: function (className, filters, callback) {
		/**
		 * Callback for CB.data.list(className, filters, callback)
		 * @callback listOfDataCallback
		 * @param {object} error - The error object
		 * @param {object} response - Object with Array of files
		 */

		// make filters an optional parameter
		if (typeof callback === 'undefined' && typeof filters === 'function') {
			callback = filters;
			filters = null;
		}

		this.service.ajax({ url: Utils.getUrl(config.urls.data, className), data: filters }, function (err, result) {
			if (err) {
				callback(err, null);
			} else {
				callback(err, result);
			}
		});
	},

	/**
	 * Update record by ID of particular class.
	 * @memberof CB.data
	 * @param {string} className - A class name of record
	 * @param {object} data - Object of parameters
	 * @param {string} data._id - An ID of record to update
	 * @param {updateDataCallback} callback - The updateDataCallback function
	 */
	update: function (className, data, callback) {
		/**
		 * Callback for CB.data.update(className, data, callback)
		 * @callback updateDataCallback
		 * @param {object} error - The error object
		 * @param {object} response - An object
		 */
		const ajaxParams = {
			url: Utils.getUrl(config.urls.data, className + '/' + data._id),
			type: 'PUT',
			contentType: 'application/json; charset=utf-8',
			isNeedStringify: true,
			data: data
		};

		this.service.ajax(ajaxParams, function (err, result) {
			if (err) {
				callback(err, null);
			} else {
				callback(err, result);
			}
		});
	},

	/**
	 * Delete record / records by ID, IDs or criteria (filters) of particular class. <br />
	 *
	 * @memberof CB.data
	 *
	 * @param {string} className - A class name of record
	 * @param {(string|array|object)} requestedData - An ID of record or an array of record's ids or object of criteria rules to delete
	 * @param {deletedDataCallback} callback - The deletedDataCallback function
	 *
	 */
	delete: function (className, requestedData, callback) {
		/**
		 * Callback for CB.data.delete(className, requestedData, callback)
		 * @callback deletedDataCallback
		 * @param {object} error - The error object
		 * @param {object|null} response
		 * @param {array} response.deleted - Array of ids of deleted records. If you delete BY CRITERIA this property will be null.
		 * @param {number} response.deletedCount - count of deleted records.
		 */
		const typesData = {
			id: 1,
			ids: 2,
			criteria: 3
		};

		let requestedTypeOf;

		let responceNormalized = {
			deleted: [],
			deletedCount: 0
		};

		let ajaxParams = {
			type: 'DELETE',
			dataType: 'text'
		};

		/** Define what type of data passed by client */
		if (typeof requestedData === 'string') {
			requestedTypeOf = typesData.id;
		} else if (Utils.isArray(requestedData)) {
			requestedTypeOf = typesData.ids;
		} else if (Utils.isObject(requestedData)) {
			requestedTypeOf = typesData.criteria;
		}

		if (requestedTypeOf === typesData.id) {
			ajaxParams.url = Utils.getUrl(config.urls.data, className + '/' + requestedData);
		} else if (requestedTypeOf === typesData.ids) {
			ajaxParams.url = Utils.getUrl(config.urls.data, className + '/' + requestedData.toString());
		} else if (requestedTypeOf === typesData.criteria) {
			ajaxParams.url = Utils.getUrl(config.urls.data, className + '/by_criteria');
			ajaxParams.data = requestedData;
		}

		function handleDeleteCO(error, result) {
			if (error) {
				callback(error, null);
			} else {
				let response;

				if (requestedTypeOf === typesData.id) {
					responceNormalized.deleted.push(requestedData);
					responceNormalized.deletedCount = responceNormalized.deleted.length;
				} else if (requestedTypeOf === typesData.ids) {
					response = JSON.parse(result);
					responceNormalized.deleted = response.SuccessfullyDeleted.ids.slice(0);
					responceNormalized.deletedCount = responceNormalized.deleted.length;
				} else if (requestedTypeOf === typesData.criteria) {
					response = JSON.parse(result);
					responceNormalized.deleted = null;
					responceNormalized.deletedCount = response.total_deleted;
				}

				callback(error, responceNormalized);
			}
		}

		this.service.ajax(ajaxParams, handleDeleteCO);
	},

	/**
	 * Upload file to file field.
	 * @memberof CB.data
	 * @param {string} className - A class name to which a new object belongs
	 * @param {object} params - Object of parameters
	 * @param {string} [params.field_name] - The file's field name
	 * @param {string} [params.name] - The file's name
	 * @param {object} [params.file] - File object
	 * @param {uploadFileToDataCallback} callback - The uploadFileToDataCallback function
	 */
	uploadFile: function (className, params, callback) {
		/**
		 * Callback for CB.data.uploadFile(className, params, callback)
		 * @callback uploadFileToDataCallback
		 * @param {object} error - The error object
		 * @param {object} response - The file object
		 */
		const ajaxParams = {
			url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'),
			type: 'POST',
			fileToCustomObject: true,
			contentType: false,
			data: {
				field_name: params.field_name,
				file: {
					data: params.file,
					name: params.name
				}
			}
		};

		this.service.ajax(ajaxParams, function (err, result) {
			if (err) {
				callback(err, null);
			} else {
				callback(err, result);
			}
		});
	},

	/**
	 * Download file from file field by ID.
	 * @memberof CB.data
	 * @param {string} className - A class name of record
	 * @param {object} params - Object of parameters
	 * @param {string} params.field_name - The file's field name
	 * @param {string} params.id - The record's ID
	 * @param {downloadFileFromDataCallback} callback - The downloadFileFromDataCallback function
	 */
	downloadFile: function (className, params, callback) {
		/**
		 * Callback for CB.data.downloadFile(className, params, callback)
		 * @callback downloadFileFromDataCallback
		 * @param {object} error - The error object
		 * @param {object} response - The file object
		 */
		const result = this.fileUrl(className, params);

		callback(null, result);
	},

	/**
	 * Return file's URL from file field by ID
	 * @memberof CB.data
	 * @param {string} className - A class name of record
	 * @param {object} params - Object of parameters
	 * @param {string} params.field_name - The file's field name
	 * @param {string} params.id - The record's ID
	 */
	fileUrl: function (className, params) {
		let result = Utils.getUrl(config.urls.data, className + '/' + params.id + '/file');

		result += '?field_name=' + params.field_name + '&token=' + this.service.getSession().token;

		return result;
	},

	/**
	 * Delete file from file field by ID
	 * @memberof CB.data
	 * @param {string} className - A class name of record
	 * @param {object} params - Object of parameters
	 * @param {string} params.field_name - The file's field name
	 * @param {string} params.id - The record's ID
	 * @param {deleteFileFromDataCallback} callback - The deleteFileFromDataCallback function
	 */
	deleteFile: function (className, params, callback) {
		/**
		 * Callback for CB.data.deleteFile(className, params, callback)
		 * @callback deleteFileFromDataCallback
		 * @param {object} error - The error object
		 * @param {object} response - Empty body
		 */
		const ajaxParams = {
			url: Utils.getUrl(config.urls.data, className + '/' + params.id + '/file'),
			data: { field_name: params.field_name },
			dataType: 'text',
			type: 'DELETE'
		};

		this.service.ajax(ajaxParams, function (err, result) {
			if (err) {
				callback(err, null);
			} else {
				callback(err, true);
			}
		});
	}
};

module.exports = DataProxy;
