const config = require('./cubeConfig');

function ConnectyCube() { }

ConnectyCube.prototype = {
	/**
	 * Return current version of ConnectyCube JS SDK
	 * @memberof ConnectyCube
	 * */
	version: config.version,

	/**
	 * @memberof ConnectyCube
	 * @param {Object} credentials - A map with App credentials.
	 * @param {Object} configMap - A map with SDK configs.
	 */
	init: function (credentials, configMap) {
		if (configMap && typeof configMap === 'object') {
			config.set(configMap);
		}

		/** include dependencies */
		const Proxy = require('./cubeProxy'),
			Auth = require('./cubeAuth'),
			Users = require('./cubeUsers'),
			Storage = require('./cubeStorage'),
			PushNotifications = require('./cubePushNotifications'),
			Data = require('./cubeData'),
			AddressBook = require('./cubeAddressBook'),
			Chat = require('./messaging/cubeChat'),
			DialogProxy = require('./messaging/cubeDialog'),
			MessageProxy = require('./messaging/cubeMessage'),
			Utils = require('./cubeUtils');

		this.service = new Proxy();
		this.auth = new Auth(this.service);
		this.users = new Users(this.service);
		this.storage = new Storage(this.service);
		this.pushnotifications = new PushNotifications(this.service);
		this.data = new Data(this.service);
		this.addressbook = new AddressBook(this.service);
		this.chat = new Chat(this.service);
		this.chat.dialog = new DialogProxy(this.service);
		this.chat.message = new MessageProxy(this.service);
		this.utils = Utils;

		// add WebRTC API if API is avaible
		if (Utils.isWebRTCAvailble()) {
			// p2p calls client
			const WebRTCClient = require('./videocalling/cubeWebRTCClient');

			this.videochat = new WebRTCClient(this.service, this.chat.xmppClient);
			this.chat.webrtcSignalingProcessor = this.videochat.signalingProcessor;
			// conf calls client
			this.videochatconference = require('./videocalling_conference/cubeVideoCallingConference');
		} else {
			this.videochat = false;
			this.videochatconference = false;
		}

		// Initialization by outside token
		if (credentials.token) {
			config.creds.appId = credentials.appId;
			this.service.setSession({ token: credentials.token });
		} else {
			config.creds.appId = credentials.appId;
			config.creds.authKey = credentials.authKey;
			config.creds.authSecret = credentials.authSecret;
		}
	},

	/**
	 * Retrieve current session
	 * @memberof ConnectyCube
	 * @param {getSessionCallback} callback - The getSessionCallback function.
	 * */
	getSession: function (callback) {
		/**
		 * This callback return return error or session object.
		 * @callback getSessionCallback
		 * @param {Object} error - The error object
		 * @param {Object} session - Contains of session object
		 * */
		this.auth.getSession(callback);
	},

	/**
	 * Creat new session.
	 * @memberof ConnectyCube
	 * @param {Object} params Parameters.
	 * @param {createSessionCallback} callback -
	 * */
	createSession: function (params, callback) {
		/**
		 * This callback return error or session object.
		 * @callback createSessionCallback
		 * @param {Object} error - The error object
		 * @param {Object} session - Contains of session object
		 * */
		this.auth.createSession(params, callback);
	},

	/**
	 * Destroy current session.
	 * @memberof ConnectyCube
	 * @param {destroySessionCallback} callback - The destroySessionCallback function.
	 * */
	destroySession: function (callback) {
		/**
		 * This callback returns error or null.
		 * @callback destroySessionCallback
		 * @param {Object | Null} error - The error object if got en error and null if success.
		 * */
		this.auth.destroySession(callback);
	},

	/**
	 * Create web session.
	 * @memberof ConnectyCube
	 * @param {Object} params - Params object with the web session settings.
	 * @param {createWebSessionCallback} callback - The createWebSessionCallback function.
	 * */
	createWebSession: function (params, callback) {
		/**
		 * This callback return error or SVG with QR code.
		 * @callback createWebSessionCallback
		 * @param {Object} params - Params object for create web session.
		 * @param {number} [params.long=0] - Used to set web session lifetime ("0" - 2 hours, "1" - 30 days).
		 * @param {Object | Null} error - The error object if got en error and null if success.
		 * @param {Null | String} qr_code - The QR code's XML string if everything goes well and null on error.
		 * */
		this.auth.createWebSession(params, callback);
	},

	/**
	 * Check the web session state and wait until a user_id field is upgraded.
	 * A common flow here is when a mobile phone scans a QR code and then upgrade a Web session token with its user_id.
	 * @memberof ConnectyCube
	 * @param {checkWebSessionUntilUpgradeCallback} callback - The checkWebSessionUntilUpgradeCallback function.
	 * @returns {Number} - The timer's ID.
	 * */
	checkWebSessionUntilUpgrade: function (callback) {
		/**
		 * This callback return error or updated web session.
		 * @callback checkWebSessionUntilUpgradeCallback
		 * @param {Object | Null} error - The timeout error object and null if success.
		 * @param {Null | Object} session - The upgraded session object if everything goes well and null on error.
		 * */
		return this.auth.checkWebSessionUntilUpgrade(callback);
	},

	/**
	 * Upgrade the web session.
	 * @memberof ConnectyCube
	 * @param {upgradeWebSessionCallback} callback - The upgradeWebSessionCallback function.
	 * */
	upgradeWebSession: function (webToken, callback) {
		/**
		 * This callback return error or null.
		 * @callback upgradeWebSessionCallback
		 * @param {Object | Null} error - The error object if got en error and null if success.
		 * */
		this.auth.upgradeWebSession(webToken, callback);
	},

	/**
	 * User login.
	 * @memberof ConnectyCube
	 * @param {Object} params - Params object for login into the session.
	 * @param {loginCallback} callback - The loginCallback function.
	 * */
	login: function (params, callback) {
		/**
		 * This callback return error or user Object.
		 * @callback loginCallback
		 * @param {Object | Null} error - The error object if got en error and null if success.
		 * @param {Null | Object} result - User data object if everything goes well and null on error.
		 * */
		this.auth.login(params, callback);
	},

	/**
	 * User logout.
	 * @memberof ConnectyCube
	 * @param {logoutCallback} callback - The logoutCallback function.
	 * */
	logout: function (callback) {
		/**
		 * This callback return error or null.
		 * @callback logoutCallback
		 * @param {Object | Null} error - The error object if got en error and null if success.
		 * */
		this.auth.logout(callback);
	}
};

/**
 * @namespace
 */
let CB = new ConnectyCube();
CB.ConnectyCube = ConnectyCube;

module.exports = CB;
