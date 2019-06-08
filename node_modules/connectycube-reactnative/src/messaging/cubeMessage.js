const Config = require('../cubeConfig'),
    Utils = require('../cubeInternalUtils');

const MESSAGES_API_URL = Config.urls.chat + '/Message';

function MessageProxy(service) {
    this.service = service;
}

MessageProxy.prototype = {
    /**
     * get a chat history
     * @memberof CB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {listMessageCallback} callback - The callback function.
     * */
    list: function (params, callback) {
        /**
         * Callback for CB.chat.message.list()
         * @param {Object} error - The error object
         * @param {Object} messages - The messages object.
         * @callback listMessageCallback
         * */

        const ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL),
            data: params
        };

        this.service.ajax(ajaxParams, callback);
    },

    /**
     * Create message.
     * @memberof CB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {createMessageCallback} callback - The callback function.
     * */
    create: function (params, callback) {
        /**
         * Callback for CB.chat.message.create()
         * @param {Object} error - The error object
         * @param {Object} messages - The message object.
         * @callback createMessageCallback
         * */

        const ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL),
            type: 'POST',
            data: params
        };

        this.service.ajax(ajaxParams, callback);
    },

    /**
     * Update message.
     * @memberof CB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters
     * @param {Number} [params.read] - Mark message as read (read=1)
     * @param {Number} [params.delivered] - Mark message as delivered (delivered=1)
     * @param {String} [params.message] - The message's text
     * @param {updateMessageCallback} callback - The callback function
     * */
    update: function (id, params, callback) {
        /**
         * Callback for CB.chat.message.update()
         * @param {Object} error - The error object
         * @param {Object} response - Empty body.
         * @callback updateMessageCallback
         * */

        const ajaxParams = {
            type: 'PUT',
            dataType: 'text',
            url: Utils.getUrl(MESSAGES_API_URL, id),
            data: params
        };

        this.service.ajax(ajaxParams, callback);
    },

    /**
     * Delete message.
     * @memberof CB.chat.message
     * @param {String} id - The message id.
     * @param {Object} params - Object of parameters.
     * @param {deleteMessageCallback} callback - The callback function.
     * */
    delete: function (id, params_or_callback, callback) {
        /**
         * Callback for CB.chat.message.delete()
         * @param {Object} error - The error object.
         * @param {String} res - Empty string.
         * @callback deleteMessageCallback
         * */

        const ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL, id),
            type: 'DELETE',
            dataType: 'text'
        };

        if (arguments.length === 2) {
            this.service.ajax(ajaxParams, params_or_callback);
        } else if (arguments.length === 3) {
            ajaxParams.data = params_or_callback;

            this.service.ajax(ajaxParams, callback);
        }
    },

    /**
     * Get unread messages counter for one or group of dialogs.
     * @memberof CB.chat.message
     * @param {Object} params - Object of parameters.
     * @param {unreadCountMessageCallback} callback - The callback function.
     * */
    unreadCount: function (params, callback) {
        /**
         * Callback for CB.chat.message.unreadCount()
         * @param {Object} error - The error object.
         * @param {Object} res - The requested dialogs Object.
         * @callback unreadCountMessageCallback
         * */

        if (params && params.chat_dialog_ids && Utils.isArray(params.chat_dialog_ids)) {
            params.chat_dialog_ids = params.chat_dialog_ids.join(', ');
        }

        const ajaxParams = {
            url: Utils.getUrl(MESSAGES_API_URL + '/unread'),
            data: params
        };

        this.service.ajax(ajaxParams, callback);
    }
};

module.exports = MessageProxy;
