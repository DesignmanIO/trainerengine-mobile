/* Chat module: Contact List
 *
 * Integration of Roster Items and Presence Subscriptions
 * http://xmpp.org/rfcs/rfc3921.html#int
 * default - Mutual Subscription
 *
 ----------------------------------------------------------------------------- */

const ChatUtils = require('./cubeChatInternalUtils'),
    Utils = require('../cubeInternalUtils'),
    Config = require('../cubeConfig');

function ContactListProxy(options) {
    this.helpers = options.helpers;
    this.xmppClient = options.xmppClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
    //
    this.contacts = {};
}

ContactListProxy.prototype = {
    /**
     * Receive contact list.
     * @memberof CB.chat.roster
     * @param {getRosterCallback} callback - The callback function.
     * */
    get: function(callback) {
        /**
         * This callback Return contact list.
         * @callback getRosterCallback
         * @param {Object} roster - Object of subscribed users.
         * */

        const self = this,
            stanzaId = ChatUtils.getUniqueId('getRoster');

        let contacts = {},
            iqStanza = ChatUtils.createIqStanza({
                type: 'get',
                from: this.helpers.getUserCurrentJid(),
                id: stanzaId
            });

        iqStanza.c('query', {
            xmlns: ChatUtils.MARKERS.ROSTER
        });

        function _getItems(stanza) {
            if (Utils.getEnv().browser) {
                return stanza.getElementsByTagName('item');
            } else {
                return stanza.getChild('query').children;
            }
        }

        function _callbackWrap(stanza) {
            const items = _getItems(stanza);
            /** TODO */
            for (let i = 0, len = items.length; i < len; i++) {
                const userId = self.helpers.getIdFromNode(ChatUtils.getAttr(items[i], 'jid')),
                    ask = ChatUtils.getAttr(items[i], 'ask'),
                    subscription = ChatUtils.getAttr(items[i], 'subscription'),
                    name = ChatUtils.getAttr(items[i], 'name'),
                    isUniqName = userId + '-' + Config.creds.appId !== name;

                contacts[userId] = {
                    subscription: subscription,
                    ask: ask || null,
                    name: isUniqName ? name : null
                };
            }

            callback(contacts);
        }

        if (Utils.getEnv().browser) {
            self.xmppClient.sendIQ(iqStanza, _callbackWrap);
        } else {
            self.nodeStanzasCallbacks[stanzaId] = _callbackWrap;
            self.xmppClient.send(iqStanza);
        }
    },

    /**
     * Add users to contact list.
     * @memberof CB.chat.roster
     * @param {Object | Number} params - Object of parameters or user id.
     * @param {Number} params.userId - The contact's id.
     * @param {String} [params.name] - The contact's name.
     * @param {addRosterCallback} callback - The callback function.
     * */
    add: function(params, callback) {
        /**
         * Callback for CB.chat.roster.add(). Run without parameters.
         * @callback addRosterCallback
         * */
        const self = this,
            userId = params.userId || params,
            userJid = self.helpers.jidOrUserId(userId),
            stanzaId = ChatUtils.getUniqueId('addContactInRoster');

        let iqStanza = ChatUtils.createIqStanza({
            type: 'set',
            from: self.helpers.getUserCurrentJid(),
            id: stanzaId
        });

        self.contacts[userId] = {
            subscription: 'none',
            ask: 'subscribe',
            name: params.name || null
        };

        iqStanza
            .c('query', {
                xmlns: ChatUtils.MARKERS.ROSTER
            })
            .c('item', {
                jid: userJid,
                name: params.name || null
            });

        if (Utils.getEnv().browser) {
            self.xmppClient.sendIQ(iqStanza, _callbackWrap);
        } else {
            self.nodeStanzasCallbacks[stanzaId] = _callbackWrap;
            self.xmppClient.send(iqStanza);
        }

        function _callbackWrap() {
            self._sendSubscriptionPresence({
                jid: userJid,
                type: 'subscribe'
            });

            if (typeof callback === 'function') {
                callback();
            }
        }
    },

    /**
     * Confirm subscription with some user.
     * @memberof CB.chat.roster
     * @param {Object | Number} params - Object of parameters or user id.
     * @param {Number} params.userId - The contact's id.
     * @param {String} [params.name] - The contact's name.
     * @param {addRosterCallback} callback - The callback function.
     * */
    confirm: function(params, callback) {
        /**
         * Callback for CB.chat.roster.confirm(). Run without parameters.
         * @callback confirmRosterCallback
         * */
        const userId = params.userId || params,
            userJid = this.helpers.jidOrUserId(userId);

        this._sendSubscriptionPresence({
            jid: userJid,
            type: 'subscribed'
        });

        if (Config.chat.contactList.subscriptionMode.mutual) {
            this.add(params, function() {
                _callbackWrap();
            });
        } else {
            _callbackWrap();
        }

        function _callbackWrap() {
            if (typeof callback === 'function') {
                callback();
            }
        }
    },

    /**
     * Reject subscription with some user.
     * @memberof CB.chat.roster
     * @param {Number} userId - The contact's id.
     * @param {rejectRosterCallback} callback - The callback function.
     * */
    reject: function(userId, callback) {
        /**
         * Callback for CB.chat.roster.reject(). Run without parameters.
         * @callback rejectRosterCallback
         * */
        const userJid = this.helpers.jidOrUserId(userId);

        this.contacts[userId] = {
            subscription: 'none',
            ask: null
        };

        this._sendSubscriptionPresence({
            jid: userJid,
            type: 'unsubscribed'
        });

        if (typeof callback === 'function') {
            callback();
        }
    },

    /**
     * Update contact's name.
     * @memberof CB.chat.roster
     * @param {Object} params - Object of parameters.
     * @param {Number} params.userId - The contact's id.
     * @param {String} params.name - The new contact's name.
     * @param {updateNameRosterCallback} callback - The callback function.
     * */
    updateName: function(params, callback) {
        /**
         * Callback for CB.chat.roster.updateName(). Run without parameters.
         * @callback updateNameRosterCallback
         * */
        const userJid = this.helpers.jidOrUserId(params.userId),
            stanzaId = ChatUtils.getUniqueId('updateContactInRoster');

        let contact = this.contacts[params.userId];

        if (Utils.isObject(contact)) {
            contact.name = params.name || null;
        } else {
            _callbackWrap('No contact exists with provided user id');
            return;
        }

        let iqStanza = ChatUtils.createIqStanza({
            type: 'set',
            from: this.helpers.getUserCurrentJid(),
            id: stanzaId
        });

        iqStanza
            .c('query', {
                xmlns: ChatUtils.MARKERS.ROSTER
            })
            .c('item', {
                jid: userJid,
                name: params.name || null
            });

        if (Utils.getEnv().browser) {
            this.xmppClient.sendIQ(iqStanza, _callbackWrap);
        } else {
            this.nodeStanzasCallbacks[stanzaId] = _callbackWrap;
            this.xmppClient.send(iqStanza);
        }

        function _callbackWrap(error) {
            if (typeof callback === 'function') {
                if (error) {
                    callback(error);
                } else {
                    callback();
                }
            }
        }
    },

    /**
     * Remove subscription with some user from your contact list.
     * @memberof CB.chat.roster
     * @param {Number} userId - The contact's id.
     * @param {removeRosterCallback} callback - The callback function.
     * */
    remove: function(userId, callback) {
        /**
         * Callback for CB.chat.roster.remove(). Run without parameters.
         * @callback removeRosterCallback
         * */
        const self = this,
            userJid = this.helpers.jidOrUserId(userId),
            stanzaId = ChatUtils.getUniqueId('removeConactInRoster');

        let iqStanza = ChatUtils.createIqStanza({
            type: 'set',
            from: this.helpers.getUserCurrentJid(),
            id: stanzaId
        });

        iqStanza
            .c('query', {
                xmlns: ChatUtils.MARKERS.ROSTER
            })
            .c('item', {
                jid: userJid,
                subscription: 'remove'
            });

        if (Utils.getEnv().browser) {
            self.xmppClient.sendIQ(iqStanza, _callbackWrap);
        } else {
            self.nodeStanzasCallbacks[stanzaId] = _callbackWrap;
            self.xmppClient.send(iqStanza);
        }

        function _callbackWrap() {
            delete self.contacts[userId];

            if (typeof callback === 'function') {
                callback();
            }
        }
    },

    _sendSubscriptionPresence: function(params) {
        const presenceParams = {
            to: params.jid,
            type: params.type
        };

        const presenceStanza = ChatUtils.createPresenceStanza(presenceParams);

        this.xmppClient.send(presenceStanza);
    }
};

module.exports = ContactListProxy;
