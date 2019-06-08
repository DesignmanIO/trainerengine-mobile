const Config = require('../cubeConfig'),
    Utils = require('../cubeInternalUtils');

const DIALOGS_API_URL = Config.urls.chat + '/Dialog';

function DialogProxy(service) {
    this.service = service;
}

DialogProxy.prototype = {
    /**
     * Retrieve list of dialogs.
     * @memberof CB.chat.dialog
     * @param {Object} params - Some filters to get only chat dialogs you need.
     * @param {listDialogCallback} callback - The callback function.
     * */
    list: function (params, callback) {
        /**
         * Callback for CB.chat.dialog.list().
         * @param {Object} error - The error object
         * @param {Object} resDialogs - the dialog list
         * @callback listDialogCallback
         * */

        if (typeof params === 'function' && typeof callback === 'undefined') {
            callback = params;
            params = {};
        }

        const ajaxParams = {
            url: Utils.getUrl(DIALOGS_API_URL),
            data: params
        };

        this.service.ajax(ajaxParams, callback);
    },

    /**
     * Create new dialog.
     * @memberof CB.chat.dialog
     * @param {Object} params - Object of parameters.
     * @param {createDialogCallback} callback - The callback function.
     * */
    create: function (params, callback) {
        /**
         * Callback for CB.chat.dialog.create().
         * @param {Object} error - The error object
         * @param {Object} createdDialog - the dialog object
         * @callback createDialogCallback
         * */

        if (params && params.occupants_ids && Utils.isArray(params.occupants_ids)) {
            params.occupants_ids = params.occupants_ids.join(', ');
        }

        const ajaxParams = {
            url: Utils.getUrl(DIALOGS_API_URL),
            type: 'POST',
            data: params
        };

        this.service.ajax(ajaxParams, callback);
    },

    /**
     * Update group dialog.
     * @memberof CB.chat.dialog
     * @param {String} id - The dialog ID.
     * @param {Object} params - Object of parameters.
     * @param {updateDialogCallback} callback - The callback function.
     * */
    update: function (id, params, callback) {
        /**
         * Callback for CB.chat.dialog.update()
         * @param {Object} error - The error object
         * @param {Object} res - the dialog object
         * @callback updateDialogCallback
         * */

        const ajaxParams = {
            url: Utils.getUrl(DIALOGS_API_URL, id),
            type: 'PUT',
            contentType: 'application/json; charset=utf-8',
            isNeedStringify: true,
            data: params
        };

        this.service.ajax(ajaxParams, callback);
    },

    /**
     * Delete a dialog or dialogs.
     * @memberof CB.chat.dialog
     * @param {Array} id - The dialog IDs array.
     * @param {Object | function} params_or_callback - Object of parameters or callback function.
     * @param {deleteDialogCallback} callback - The callback function.
     * */
    delete: function (id, params_or_callback, callback) {
        /**
         * Callback for CB.chat.dialog.delete()
         * @param {Object} error - The error object
         * @callback deleteDialogCallback
         * */

        var ajaxParams = {
            url: Utils.getUrl(DIALOGS_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

        if (arguments.length === 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length === 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    }
};

module.exports = DialogProxy;
