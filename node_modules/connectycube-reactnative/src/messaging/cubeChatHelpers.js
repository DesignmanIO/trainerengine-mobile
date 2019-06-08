'use strict';

const Utils = require('../cubeInternalUtils'),
	Config = require('../cubeConfig'),
	ChatUtils = require('./cubeChatInternalUtils');

function Helpers() {
	this._userCurrentJid = '';
}
/**
 * @namespace CB.chat.helpers
 * */
Helpers.prototype = {
	/**
	 * Get unique id.
	 * @memberof CB.chat.helpers
	 * @param {String | Number} suffix - not required parameter.
	 * @returns {String} - UniqueId.
	 * */
	getUniqueId: ChatUtils.getUniqueId,

	/**
	 * Get unique id.
	 * @memberof CB.chat.helpers
	 * @param {String | Number} jidOrUserId - Jid or user id.
	 * @returns {String} - jid.
	 * */
	jidOrUserId: function(jidOrUserId) {
		var jid;
		if (typeof jidOrUserId === 'string') {
			jid = jidOrUserId;
		} else if (typeof jidOrUserId === 'number') {
			jid = jidOrUserId + '-' + Config.creds.appId + '@' + Config.endpoints.chat;
		} else {
			throw new Error('The method "jidOrUserId" may take jid or id');
		}
		return jid;
	},

	/**
	 * Get the chat type.
	 * @memberof CB.chat.helpers
	 * @param {String | Number} jidOrUserId - Jid or user id.
	 * @returns {String} - jid.
	 * */
	typeChat: function(jidOrUserId) {
		var chatType;
		if (typeof jidOrUserId === 'string') {
			chatType = jidOrUserId.indexOf('muc') > -1 ? 'groupchat' : 'chat';
		} else if (typeof jidOrUserId === 'number') {
			chatType = 'chat';
		} else {
			throw new Error('Unsupported chat type');
		}
		return chatType;
	},

	/**
	 * Get the recipint id.
	 * @memberof CB.chat.helpers
	 * @param {Array} occupantsIds - Array of user ids.
	 * @param {Number} UserId - Jid or user id.
	 * @returns {Number} recipient - recipient id.
	 * */
	getRecipientId: function(occupantsIds, UserId) {
		var recipient = null;
		occupantsIds.forEach(function(item) {
			if (item != UserId) {
				recipient = item;
			}
		});
		return recipient;
	},

	/**
	 * Get the User jid id.
	 * @memberof CB.chat.helpers
	 * @param {Number} UserId - The user id.
	 * @param {Number} appId - The application id.
	 * @returns {String} jid - The user jid.
	 * */
	getUserJid: function(userId, appId) {
		if (!appId) {
			return userId + '-' + Config.creds.appId + '@' + Config.endpoints.chat;
		}
		return userId + '-' + appId + '@' + Config.endpoints.chat;
	},

	/**
	 * Get the User nick with the muc domain.
	 * @memberof CB.chat.helpers
	 * @param {Number} UserId - The user id.
	 * @returns {String} mucDomainWithNick - The mac domain with he nick.
	 * */
	getUserNickWithMucDomain: function(userId) {
		return Config.endpoints.muc + '/' + userId;
	},

	/**
	 * Get the User id from jid.
	 * @memberof CB.chat.helpers
	 * @param {String} jid - The user jid.
	 * @returns {Number} id - The user id.
	 * */
	getIdFromNode: function(jid) {
		return jid.indexOf('@') < 0 ? null : parseInt(jid.split('@')[0].split('-')[0]);
	},

	/**
	 * Get the dialog id from jid.
	 * @memberof CB.chat.helpers
	 * @param {String} jid - The dialog jid.
	 * @returns {String} dialogId - The dialog id.
	 * */
	getDialogIdFromNode: function(jid) {
		if (jid.indexOf('@') < 0) return null;
		return jid.split('@')[0].split('_')[1];
	},

	/**
	 * Get the room jid from dialog id.
	 * @memberof CB.chat.helpers
	 * @param {String} dialogId - The dialog id.
	 * @returns {String} jid - The dialog jid.
	 * */
	getRoomJidFromDialogId: function(dialogId) {
		return Config.creds.appId + '_' + dialogId + '@' + Config.endpoints.muc;
	},

	/**
	 * Get the full room jid from room bare jid & user jid.
	 * @memberof CB.chat.helpers
	 * @param {String} jid - dialog's bare jid.
	 * @param {String} userJid - user's jid.
	 * @returns {String} jid - dialog's full jid.
	 * */
	getRoomJid: function(jid) {
		return jid + '/' + this.getIdFromNode(this._userCurrentJid);
	},

	/**
	 * Get user id from dialog's full jid.
	 * @memberof CB.chat.helpers
	 * @param {String} jid - dialog's full jid.
	 * @returns {String} user_id - User Id.
	 * */
	getIdFromResource: function(jid) {
		var s = jid.split('/');
		if (s.length < 2) return null;
		s.splice(0, 1);
		return parseInt(s.join('/'));
	},

	/**
	 * Get bare dialog's jid from dialog's full jid.
	 * @memberof CB.chat.helpers
	 * @param {String} jid - dialog's full jid.
	 * @returns {String} room_jid - dialog's bare jid.
	 * */
	getRoomJidFromRoomFullJid: function(jid) {
		var s = jid.split('/');
		if (s.length < 2) return null;
		return s[0];
	},

	/**
	 * Generate BSON ObjectId.
	 * @memberof CB.chat.helpers
	 * @returns {String} BsonObjectId - The bson object id.
	 **/
	getBsonObjectId: function() {
		return Utils.getBsonObjectId();
	},

	/**
	 * Get the user id from the room jid.
	 * @memberof CB.chat.helpers
	 * @param {String} jid - resourse jid.
	 * @returns {String} userId - The user id.
	 * */
	getUserIdFromRoomJid: function(jid) {
		var arrayElements = jid.toString().split('/');
		if (arrayElements.length === 0) {
			return null;
		}
		return arrayElements[arrayElements.length - 1];
	},

	userCurrentJid: function(client) {
		if (Utils.getEnv().browser) {
			return client.jid;
		} else if (Utils.getEnv().reactnative) {
			return client.jid._local + '@' + client.jid._domain + '/' + client.jid._resource;
		} else {
			// Node.js & Native Script
			return client.jid.user + '@' + client.jid._domain + '/' + client.jid._resource;
		}
	},

	getUserCurrentJid: function() {
		return this._userCurrentJid;
	},

	setUserCurrentJid: function(jid) {
		this._userCurrentJid = jid;
	},

	getDialogJid: function(identifier) {
		return identifier.indexOf('@') > 0 ? identifier : this.getRoomJidFromDialogId(identifier);
	}
};

module.exports = Helpers;
