
/* Chat module: Group Chat (Dialog)
 *
 * Multi-User Chat
 * http://xmpp.org/extensions/xep-0045.html
 *
 ----------------------------------------------------------------------------- */

const ChatUtils = require('./cubeChatInternalUtils'),
    Utils = require('../cubeInternalUtils');


function MucProxy(options) {
    this.helpers = options.helpers;
    this.xmppClient = options.xmppClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
    //
    this.joinedRooms = {};
}

MucProxy.prototype = {

    /**
     * Join to the group dialog.
     * @memberof CB.chat.muc
     * @param {String} dialogIdOrJid - Use dialog jid or dialog id to join to this dialog.
     * @param {joinMacCallback} callback - The callback function.
     * */
    join: function (dialogIdOrJid, callback) {
        /**
         * Callback for CB.chat.muc.join().
         * @param {Object} error - Returns error object or null
         * @param {Object} responce - Returns responce
         * @callback joinMacCallback
         * */
        const self = this,
            id = ChatUtils.getUniqueId('join'),
            dialogJid = this.helpers.getDialogJid(dialogIdOrJid),
            presenceParams = {
                id: id,
                from: self.helpers.getUserCurrentJid(),
                to: self.helpers.getRoomJid(dialogJid)
            }

        let presenceStanza = ChatUtils.createPresenceStanza(presenceParams);

        presenceStanza.c('x', {
            xmlns: ChatUtils.MARKERS.MUC
        }).c('history', { maxstanzas: 0 });

        this.joinedRooms[dialogJid] = true;

        function handleJoinAnswer(stanza) {
            const from = ChatUtils.getAttr(stanza, 'from'),
                dialogId = self.helpers.getDialogIdFromNode(from),
                x = ChatUtils.getElement(stanza, 'x'),
                xXMLNS = ChatUtils.getAttr(x, 'xmlns'),
                status = ChatUtils.getElement(x, 'status'),
                statusCode = ChatUtils.getAttr(status, 'code');

            if (callback.length == 1) {
                Utils.safeCallbackCall(callback, stanza);
                return true;
            }

            if (status && statusCode == '110') {
                Utils.safeCallbackCall(callback, null, {
                    dialogId: dialogId
                });
            } else {
                const type = ChatUtils.getAttr(stanza, 'type');

                if (type && type === 'error' && xXMLNS == 'http://jabber.org/protocol/muc' && id.endsWith(':join')) {
                    const errorEl = ChatUtils.getElement(stanza, 'error'),
                        code = ChatUtils.getAttr(errorEl, 'code'),
                        errorMessage = ChatUtils.getElementText(errorEl, 'text');

                    Utils.safeCallbackCall(callback, {
                        code: code || 500,
                        message: errorMessage || 'Unknown issue'
                    }, { dialogId: dialogId });
                }
            }
        }

        if (Utils.getEnv().browser) {
            if (typeof callback === 'function') {
                self.xmppClient.XAddTrackedHandler(handleJoinAnswer, null, 'presence', null, id);
            }
        } else {
            if (typeof callback === 'function') {
                self.nodeStanzasCallbacks[id] = handleJoinAnswer;
            }
        }

        self.xmppClient.send(presenceStanza);
    },

    /**
     * Leave group chat dialog.
     * @memberof CB.chat.muc
     * @param {String} dialogJid - Use dialog jid to join to this dialog.
     * @param {leaveMacCallback} callback - The callback function.
     * */
    leave: function (jid, callback) {
        /**
         * Callback for CB.chat.muc.leave().
         * run without parameters;
         * @callback leaveMacCallback
         * */

        const self = this,
            presenceParams = {
                type: 'unavailable',
                from: self.helpers.getUserCurrentJid(),
                to: self.helpers.getRoomJid(jid)
            };

        let presenceStanza = ChatUtils.createPresenceStanza(presenceParams);

        delete this.joinedRooms[jid];

        if (Utils.getEnv().browser) {
            const roomJid = self.helpers.getRoomJid(jid);

            if (typeof callback === 'function') {
                self.xmppClient.XAddTrackedHandler(callback, null, 'presence', presenceParams.type, null, roomJid);
            }
        } else {
            /** The answer don't contain id */
            if (typeof callback === 'function') {
                self.nodeStanzasCallbacks['muc:leave'] = callback;
            }
        }
        self.xmppClient.send(presenceStanza);
    },

    /**
     * Leave group chat dialog.
     * @memberof CB.chat.muc
     * @param {String} dialogJid - Use dialog jid to join to this dialog.
     * @param {listOnlineUsersMacCallback} callback - The callback function.
     * */
    listOnlineUsers: function (dialogJID, callback) {
        /**
         * Callback for CB.chat.muc.leave().
         * @param {Object} Users - list of online users
         * @callback listOnlineUsersMacCallback
         * */

        const self = this,
            iqParams = {
                type: 'get',
                to: dialogJID,
                from: self.helpers.getUserCurrentJid(),
                id: ChatUtils.getUniqueId('muc_disco_items'),
            };

        let iqStanza = ChatUtils.createIqStanza(iqParams);

        iqStanza.c('query', {
            xmlns: 'http://jabber.org/protocol/disco#items'
        });

        function _getUsers(stanza) {
            var stanzaId = stanza.attrs.id;

            if (self.nodeStanzasCallbacks[stanzaId]) {
                const items = stanza.getChild('query').getChildElements('item');

                let users = [];

                for (var i = 0, len = items.length; i < len; i++) {
                    let userId = self.helpers.getUserIdFromRoomJid(items[i].attrs.jid);
                    users.push(parseInt(userId));
                }

                callback(users);
            }
        }

        if (Utils.getEnv().browser) {
            self.xmppClient.sendIQ(iqStanza, function (stanza) {
                const items = stanza.getElementsByTagName('item');

                let onlineUsers = [];

                for (let i = 0, len = items.length; i < len; i++) {
                    let userId = self.helpers.getUserIdFromRoomJid(items[i].getAttribute('jid'));
                    onlineUsers.push(parseInt(userId));
                }

                callback(onlineUsers);
            });
        } else {
            self.xmppClient.send(iqStanza);
            self.nodeStanzasCallbacks[iqParams.id] = _getUsers;
        }
    }
};

module.exports = MucProxy;
