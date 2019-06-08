'use strict';

const Config = require('../cubeConfig'),
    Utils = require('../cubeInternalUtils'),
    ChatUtils = require('./cubeChatInternalUtils'),
    ChatHelpers = require('./cubeChatHelpers'),
    StreamManagement = require('./cubeStreamManagement'),
    ContactListProxy = require('./cubeContactList'),
    PrivacyListProxy = require('./cubePrivacyList'),
    MucProxy = require('./cubeMultiUserChat'),
    XMPPClient = require('../cubeDependencies').XMPPClient;

if (Utils.getEnv().browser) {
    Strophe.addNamespace('CARBONS', ChatUtils.MARKERS.CARBONS);
    Strophe.addNamespace('CHAT_MARKERS', ChatUtils.MARKERS.CHAT);
    Strophe.addNamespace('PRIVACY_LIST', ChatUtils.MARKERS.PRIVACY);
    Strophe.addNamespace('CHAT_STATES', ChatUtils.MARKERS.STATES);
}

function ChatProxy(service) {
    var self = this;

    self.webrtcSignalingProcessor = null;

    /**
     * Browser env.
     * Uses by Strophe
     */
    if (Utils.getEnv().browser) {
        self.xmppClient = new XMPPClient();

        /** Add extension methods to track handlers for removal on reconnect */
        self.xmppClient.XHandlerReferences = [];
        self.xmppClient.XAddTrackedHandler = function(handler, ns, name, type, id, from, options) {
            self.xmppClient.XHandlerReferences.push(
                self.xmppClient.addHandler(handler, ns, name, type, id, from, options)
            );
        };
        self.xmppClient.XDeleteHandlers = function() {
            while (self.xmppClient.XHandlerReferences.length) {
                self.xmppClient.deleteHandler(self.xmppClient.XHandlerReferences.pop());
            }
        };
    } else {
        // nativescript-xmpp-client
        if (Utils.getEnv().nativescript) {
            self.xmppClient = new XMPPClient.Client({
                websocket: {
                    url: Config.chatProtocol.websocket
                },
                autostart: false
            });
            // node-xmpp-client
        } else if (Utils.getEnv().node) {
            self.xmppClient = new XMPPClient({
                autostart: false
            });
        } else if (Utils.getEnv().reactnative) {
            self.xmppClient = XMPPClient.client({
                service: Config.chatProtocol.websocket,
                credentials: function authenticate(auth, mechanism) {
                    var crds = {
                        username: self.xmppClient.cbUserName,
                        password: self.xmppClient.cbUserPassword
                    };
                    return auth(crds);
                }
            });
        }

        // override 'send' function to add 'SENT' logs
        if (Utils.getEnv().node || Utils.getEnv().nativescript) {
            var originSendFunction = self.xmppClient.send;
            self.xmppClient.send = function(stanza) {
                Utils.DLog('[Chat]', 'SENT:', stanza.toString());
                originSendFunction.call(self.xmppClient, stanza);
            };
        }

        self.nodeStanzasCallbacks = {};
    }

    this.service = service;

    // Check the chat connection (return true/false)
    this.isConnected = false;
    // Check the chat connecting state (return true/false)
    this._isConnecting = false;
    this._isLogout = false;

    this._checkConnectionTimer = undefined;

    this.helpers = new ChatHelpers();

    this.xmppClientListeners = [];

    // Chat additional modules
    var options = {
        xmppClient: self.xmppClient,
        helpers: self.helpers,
        nodeStanzasCallbacks: self.nodeStanzasCallbacks
    };

    this.contactList = new ContactListProxy(options);
    this.privacylist = new PrivacyListProxy(options);
    this.muc = new MucProxy(options);

    if (Config.chat.streamManagement.enable) {
        if (Config.chatProtocol.active === 2) {
            this.streamManagement = new StreamManagement();
            self._sentMessageCallback = function(messageLost, messageSent) {
                if (typeof self.onSentMessageCallback === 'function') {
                    if (messageSent) {
                        self.onSentMessageCallback(null, messageSent);
                    } else {
                        self.onSentMessageCallback(messageLost);
                    }
                }
            };
        } else {
            Utils.DLog(
                '[Chat] StreamManagement:',
                'BOSH protocol doesn\'t support stream management. Set WebSocket as the "chatProtocol" parameter to use this functionality.'
            );
        }
    }

    /**
     * User's callbacks (listener-functions):
     * - onMessageListener (userId, message)
     * - onMessageErrorListener (messageId, error)
     * - onSentMessageCallback (messageLost, messageSent)
     * - onMessageTypingListener (isTyping, userId, dialogId)
     * - onDeliveredStatusListener (messageId, dialogId, userId);
     * - onReadStatusListener (messageId, dialogId, userId);
     * - onSystemMessageListener (message)
     * - onKickOccupant(dialogId, initiatorUserId)
     * - onJoinOccupant(dialogId, userId)
     * - onLeaveOccupant(dialogId, userId)
     * - onContactListListener (userId, type)
     * - onSubscribeListener (userId)
     * - onConfirmSubscribeListener (userId)
     * - onRejectSubscribeListener (userId)
     * - onLastUserActivityListener (userId, seconds)
     * - onDisconnectedListener
     * - onReconnectListener
     */

    /**
     * You need to set onMessageListener function, to get messages.
     * @function onMessageListener
     * @memberOf CB.chat
     * @param {Number} userId - Sender id
     * @param {Object} message - The message model object
     **/

    /**
     * Blocked entities receive an error when try to chat with a user in a 1-1 chat and receivie nothing in a group chat.
     * @function onMessageErrorListener
     * @memberOf CB.chat
     * @param {Number} messageId - The message id
     * @param {Object} error - The error object
     **/

    /**
     * This feature defines an approach for ensuring is the message delivered to the server. This feature is unabled by default.
     * @function onSentMessageCallback
     * @memberOf CB.chat
     * @param {Object} messageLost - The lost message model object (Fail)
     * @param {Object} messageSent - The sent message model object (Success)
     **/

    /**
     * Show typing status in chat or groupchat.
     * @function onMessageTypingListener
     * @memberOf CB.chat
     * @param {Boolean} isTyping - Typing Status (true - typing, false - stop typing)
     * @param {Number} userId - Typing user id
     * @param {String} dialogId - The dialog id
     **/

    /**
     * Receive delivery confirmations.
     * @function onDeliveredStatusListener
     * @memberOf CB.chat
     * @param {String} messageId - Delivered message id
     * @param {String} dialogId - The dialog id
     * @param {Number} userId - User id
     **/

    /**
     * You can manage 'read' notifications in chat.
     * @function onReadStatusListener
     * @memberOf CB.chat
     * @param {String} messageId - Read message id
     * @param {String} dialogId - The dialog id
     * @param {Number} userId - User Id
     **/

    /**
     * These messages work over separated channel and won't be mixed with the regular chat messages.
     * @function onSystemMessageListener
     * @memberOf CB.chat
     * @param {Object} message - The system message model object. Always have type: 'headline'
     **/

    /**
     * You will receive this callback when you are in group chat dialog(joined) and other user (chat dialog's creator) removed you from occupants.
     * @function onKickOccupant
     * @memberOf CB.chat
     * @param {String} dialogId - An id of chat dialog where you was kicked from.
     * @param {Number} initiatorUserId - An id of user who has kicked you.
     **/

    /**
     * You will receive this callback when some user joined group chat dialog you are in.
     * @function onJoinOccupant
     * @memberOf CB.chat
     * @param {String} dialogId - An id of chat dialog that user joined.
     * @param {Number} userId - An id of user who joined chat dialog.
     **/

    /**
     * You will receive this callback when some user left group chat dialog you are in.
     * @function onLeaveOccupant
     * @memberOf CB.chat
     * @param {String} dialogId - An id of chat dialog that user left.
     * @param {Number} userId - An id of user who left chat dialog.
     **/

    /**
     * Receive user status (online / offline).
     * @function onContactListListener
     * @memberOf CB.chat
     * @param {Number} userId - The sender ID
     * @param {String} type - If user leave the chat, type will be 'unavailable'
     **/

    /**
     * Receive subscription request.
     * @function onSubscribeListener
     * @memberOf CB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive confirm request.
     * @function onConfirmSubscribeListener
     * @memberOf CB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive reject request.
     * @function onRejectSubscribeListener
     * @memberOf CB.chat
     * @param {Number} userId - The sender ID
     **/

    /**
     * Receive user's last activity (time ago). {@link https://xmpp.org/extensions/xep-0012.html More info.}
     * @function onLastUserActivityListener
     * @memberOf CB.chat
     * @param {Number} userId - The user's ID which last activity time we receive
     * @param {Number} seconds - Time ago (last activity in seconds or 0 if user online or undefined if user never registered in chat)
     */

    /**
     * Run after disconnect from chat.
     * @function onDisconnectedListener
     * @memberOf CB.chat
     **/

    /**
     * By default Javascript SDK reconnects automatically when connection to server is lost.
     * @function onReconnectListener
     * @memberOf CB.chat
     **/

    this._onMessage = function(stanza) {
        var from = ChatUtils.getAttr(stanza, 'from'),
            type = ChatUtils.getAttr(stanza, 'type'),
            messageId = ChatUtils.getAttr(stanza, 'id'),
            markable = ChatUtils.getElement(stanza, 'markable'),
            delivered = ChatUtils.getElement(stanza, 'received'),
            read = ChatUtils.getElement(stanza, 'displayed'),
            composing = ChatUtils.getElement(stanza, 'composing'),
            paused = ChatUtils.getElement(stanza, 'paused'),
            invite = ChatUtils.getElement(stanza, 'invite'),
            delay = ChatUtils.getElement(stanza, 'delay'),
            extraParams = ChatUtils.getElement(stanza, 'extraParams'),
            bodyContent = ChatUtils.getElementText(stanza, 'body'),
            forwarded = ChatUtils.getElement(stanza, 'forwarded'),
            extraParamsParsed,
            recipientId,
            recipient;

        var forwardedMessage = forwarded ? ChatUtils.getElement(forwarded, 'message') : null;

        recipient = forwardedMessage ? ChatUtils.getAttr(forwardedMessage, 'to') : null;
        recipientId = recipient ? self.helpers.getIdFromNode(recipient) : null;

        var dialogId = type === 'groupchat' ? self.helpers.getDialogIdFromNode(from) : null,
            userId = type === 'groupchat' ? self.helpers.getIdFromResource(from) : self.helpers.getIdFromNode(from),
            marker = delivered || read || null;

        // ignore invite messages from MUC
        if (invite) return true;

        if (extraParams) {
            extraParamsParsed = ChatUtils.parseExtraParams(extraParams);

            if (extraParamsParsed.dialogId) {
                dialogId = extraParamsParsed.dialogId;
            }
        }

        if (composing || paused) {
            if (
                typeof self.onMessageTypingListener === 'function' &&
                (type === 'chat' || type === 'groupchat' || !delay)
            ) {
                Utils.safeCallbackCall(self.onMessageTypingListener, !!composing, userId, dialogId);
            }

            return true;
        }

        if (marker) {
            if (delivered) {
                if (typeof self.onDeliveredStatusListener === 'function' && type === 'chat') {
                    Utils.safeCallbackCall(
                        self.onDeliveredStatusListener,
                        ChatUtils.getAttr(delivered, 'id'),
                        dialogId,
                        userId
                    );
                }
            } else {
                if (typeof self.onReadStatusListener === 'function' && type === 'chat') {
                    Utils.safeCallbackCall(self.onReadStatusListener, ChatUtils.getAttr(read, 'id'), dialogId, userId);
                }
            }

            return true;
        }

        // autosend 'received' status (ignore messages from yourself)
        if (markable && userId != self.helpers.getIdFromNode(self.helpers.userCurrentJid(self.xmppClient))) {
            var autoSendReceiveStatusParams = {
                messageId: messageId,
                userId: userId,
                dialogId: dialogId
            };

            self.sendDeliveredStatus(autoSendReceiveStatusParams);
        }

        var message = {
            id: messageId,
            dialog_id: dialogId,
            recipient_id: recipientId,
            type: type,
            body: bodyContent,
            extension: extraParamsParsed ? extraParamsParsed.extension : null,
            delay: delay
        };

        if (markable) {
            message.markable = 1;
        }

        if (typeof self.onMessageListener === 'function' && (type === 'chat' || type === 'groupchat')) {
            Utils.safeCallbackCall(self.onMessageListener, userId, message);
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };

    this._onPresence = function(stanza) {
        var from = ChatUtils.getAttr(stanza, 'from'),
            id = ChatUtils.getAttr(stanza, 'id'),
            type = ChatUtils.getAttr(stanza, 'type'),
            currentUserId = self.helpers.getIdFromNode(self.helpers.userCurrentJid(self.xmppClient)),
            x = ChatUtils.getElement(stanza, 'x'),
            xXMLNS,
            status,
            statusCode,
            dialogId,
            userId,
            contact;

        if (x) {
            xXMLNS = ChatUtils.getAttr(x, 'xmlns');
            status = ChatUtils.getElement(x, 'status');
            if (status) {
                statusCode = ChatUtils.getAttr(status, 'code');
            }
        }

        // MUC presences go here
        if (xXMLNS && xXMLNS == 'http://jabber.org/protocol/muc#user') {
            dialogId = self.helpers.getDialogIdFromNode(from);
            userId = self.helpers.getUserIdFromRoomJid(from);

            // KICK from dialog event
            if (status && statusCode == '301') {
                if (typeof self.onKickOccupant === 'function') {
                    var actorElement = ChatUtils.getElement(ChatUtils.getElement(x, 'item'), 'actor');
                    var initiatorUserJid = ChatUtils.getAttr(actorElement, 'jid');
                    Utils.safeCallbackCall(self.onKickOccupant, dialogId, self.helpers.getIdFromNode(initiatorUserJid));
                }

                delete self.muc.joinedRooms[self.helpers.getRoomJidFromRoomFullJid(from)];

                return true;

                // Occupants JOIN/LEAVE events
            } else if (!status) {
                if (userId != currentUserId) {
                    // Leave
                    if (type && type === 'unavailable') {
                        if (typeof self.onLeaveOccupant === 'function') {
                            Utils.safeCallbackCall(self.onLeaveOccupant, dialogId, parseInt(userId));
                        }
                        return true;
                        // Join
                    } else {
                        if (typeof self.onJoinOccupant === 'function') {
                            Utils.safeCallbackCall(self.onJoinOccupant, dialogId, parseInt(userId));
                        }
                        return true;
                    }
                }
            }
        }

        if (!Utils.getEnv().browser) {
            /** MUC */
            if (xXMLNS) {
                if (xXMLNS == 'http://jabber.org/protocol/muc#user') {
                    /**
                     * if you make 'leave' from dialog
                     * stanza will be contains type="unavailable"
                     */
                    if (type && type === 'unavailable') {
                        /** LEAVE from dialog */
                        if (status && statusCode == '110') {
                            if (typeof self.nodeStanzasCallbacks['muc:leave'] === 'function') {
                                Utils.safeCallbackCall(self.nodeStanzasCallbacks['muc:leave'], null);
                            }
                        }

                        return true;
                    }

                    /** JOIN to dialog success */
                    if (id.endsWith(':join') && status && statusCode == '110') {
                        if (typeof self.nodeStanzasCallbacks[id] === 'function') {
                            self.nodeStanzasCallbacks[id](stanza);
                        }

                        return true;
                    }

                    // an error
                } else if (type && type === 'error' && xXMLNS == 'http://jabber.org/protocol/muc') {
                    /** JOIN to dialog error */
                    if (id.endsWith(':join')) {
                        if (typeof self.nodeStanzasCallbacks[id] === 'function') {
                            self.nodeStanzasCallbacks[id](stanza);
                        }
                    }

                    return true;
                }
            }
        }

        // ROSTER presences go here

        userId = self.helpers.getIdFromNode(from);
        contact = self.contactList.contacts[userId];

        if (!type) {
            if (typeof self.onContactListListener === 'function' && contact && contact.subscription !== 'none') {
                Utils.safeCallbackCall(self.onContactListListener, userId);
            }
        } else {
            switch (type) {
                case 'subscribe':
                    if (contact && contact.subscription === 'to') {
                        contact ? (contact.ask = null) : (contact = { ask: null });
                        contact.subscription = 'both';

                        self.contactList._sendSubscriptionPresence({
                            jid: from,
                            type: 'subscribed'
                        });
                    } else {
                        if (typeof self.onSubscribeListener === 'function') {
                            Utils.safeCallbackCall(self.onSubscribeListener, userId);
                        }
                    }
                    break;
                case 'subscribed':
                    if (contact && contact.subscription === 'from') {
                        contact ? (contact.ask = null) : (contact = { ask: null });
                        contact.subscription = 'both';
                    } else {
                        contact ? (contact.ask = null) : (contact = { ask: null });
                        contact.subscription = 'to';

                        if (typeof self.onConfirmSubscribeListener === 'function') {
                            Utils.safeCallbackCall(self.onConfirmSubscribeListener, userId);
                        }
                    }
                    break;
                case 'unsubscribed':
                    contact ? (contact.ask = null) : (contact = { ask: null });
                    contact.subscription = 'none';

                    if (typeof self.onRejectSubscribeListener === 'function') {
                        Utils.safeCallbackCall(self.onRejectSubscribeListener, userId);
                    }

                    break;
                case 'unsubscribe':
                    contact ? (contact.ask = null) : (contact = { ask: null });
                    contact.subscription = 'to';

                    break;
                case 'unavailable':
                    if (
                        typeof self.onContactListListener === 'function' &&
                        contact &&
                        contact.subscription !== 'none'
                    ) {
                        Utils.safeCallbackCall(self.onContactListListener, userId, type);
                    }

                    // send initial presence if one of client (instance) goes offline
                    if (userId === currentUserId) {
                        self.xmppClient.send(ChatUtils.createPresenceStanza());
                    }

                    break;
            }
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };

    this._onIQ = function(stanza) {
        var stanzaId = ChatUtils.getAttr(stanza, 'id'),
            isLastActivity = stanzaId.indexOf('lastActivity') > -1;

        if (typeof self.onLastUserActivityListener === 'function' && isLastActivity) {
            var from = ChatUtils.getAttr(stanza, 'from'),
                userId = self.helpers.getIdFromNode(from),
                query = ChatUtils.getElement(stanza, 'query'),
                error = ChatUtils.getElement(stanza, 'error'),
                seconds = error ? undefined : +ChatUtils.getAttr(query, 'seconds');

            Utils.safeCallbackCall(self.onLastUserActivityListener, userId, seconds);
        }

        if (!Utils.getEnv().browser) {
            if (self.nodeStanzasCallbacks[stanzaId]) {
                Utils.safeCallbackCall(self.nodeStanzasCallbacks[stanzaId], stanza);
                delete self.nodeStanzasCallbacks[stanzaId];
            }
        }

        return true;
    };

    this._onSystemMessageListener = function(stanza) {
        var from = ChatUtils.getAttr(stanza, 'from'),
            to = ChatUtils.getAttr(stanza, 'to'),
            messageId = ChatUtils.getAttr(stanza, 'id'),
            extraParams = ChatUtils.getElement(stanza, 'extraParams'),
            userId = self.helpers.getIdFromNode(from),
            delay = ChatUtils.getElement(stanza, 'delay'),
            moduleIdentifier = ChatUtils.getElementText(extraParams, 'moduleIdentifier'),
            bodyContent = ChatUtils.getElementText(stanza, 'body'),
            extraParamsParsed = ChatUtils.parseExtraParams(extraParams),
            message;

        if (moduleIdentifier === 'SystemNotifications' && typeof self.onSystemMessageListener === 'function') {
            message = {
                id: messageId,
                userId: userId,
                body: bodyContent,
                extension: extraParamsParsed.extension
            };

            Utils.safeCallbackCall(self.onSystemMessageListener, message);
        } else if (self.webrtcSignalingProcessor && !delay && moduleIdentifier === 'WebRTCVideoChat') {
            self.webrtcSignalingProcessor._onMessage(from, extraParams, delay, userId, extraParamsParsed.extension);
        }

        /**
         * we must return true to keep the handler alive
         * returning false would remove it after it finishes
         */
        return true;
    };

    this._onMessageErrorListener = function(stanza) {
        // <error code="503" type="cancel">
        //   <service-unavailable xmlns="urn:ietf:params:xml:ns:xmpp-stanzas"/>
        //   <text xmlns="urn:ietf:params:xml:ns:xmpp-stanzas" xml:lang="en">Service not available.</text>
        // </error>

        var messageId = ChatUtils.getAttr(stanza, 'id');
        var error = ChatUtils.getErrorFromXMLNode(stanza);

        // fire 'onMessageErrorListener'
        //
        if (typeof self.onMessageErrorListener === 'function') {
            Utils.safeCallbackCall(self.onMessageErrorListener, messageId, error);
        }

        // we must return true to keep the handler alive
        // returning false would remove it after it finishes
        return true;
    };
}

/* Chat module: Core
 ----------------------------------------------------------------------------- */
ChatProxy.prototype = {
    /**
     * Connect to chat
     *
     * @memberof CB.chat
     * @param {Object} params - Connect to the chat parameters
     * @param {Number} params.userId - Connect to the chat by user id (use instead params.email and params.jid)
     * @param {String} params.jid - Connect to the chat by user jid (use instead params.userId and params.email)
     * @param {String} params.email - Connect to the chat by user's email (use instead params.userId and params.jid)
     * @param {String} params.password - The user's password or session token
     * @param {chatConnectCallback} callback - The chatConnectCallback callback
     * */
    connect: function(params, callback) {
        /**
         * This callback Returns error or contact list.
         * @callback chatConnectCallback
         * @param {Object} error - The error object
         * @param {(Object|Boolean)} response - Object of subscribed users (roster) or empty body.
         * */
        Utils.DLog('[Chat]', 'Connect with parameters ' + JSON.stringify(params));

        var self = this,
            userJid = ChatUtils.buildUserJid(params),
            isInitialConnect = typeof callback === 'function',
            err;

        if (self._isConnecting) {
            err = Utils.getError(422, 'REJECT - The connection is still in the CONNECTING state', 'Chat');

            if (isInitialConnect) {
                callback(err, null);
            }

            return;
        }

        if (self.isConnected) {
            Utils.DLog('[Chat]', 'CONNECTED - You are already connected');

            if (isInitialConnect) {
                callback(null, self.contactList.contacts);
            }

            return;
        }

        self._isConnecting = true;
        self._isLogout = false;

        // connect for Browser
        //
        if (Utils.getEnv().browser) {
            self.xmppClient.connect(
                userJid,
                params.password,
                function(status) {
                    switch (status) {
                        case Strophe.Status.ERROR:
                            self.isConnected = false;
                            self._isConnecting = false;

                            err = Utils.getError(422, 'ERROR - An error has occurred', 'Chat');

                            if (isInitialConnect) {
                                callback(err, null);
                            }

                            break;
                        case Strophe.Status.CONNFAIL:
                            self.isConnected = false;
                            self._isConnecting = false;

                            err = Utils.getError(422, 'CONNFAIL - The connection attempt failed', 'Chat');

                            if (isInitialConnect) {
                                callback(err, null);
                            }

                            break;
                        case Strophe.Status.AUTHENTICATING:
                            Utils.DLog('[Chat]', 'AUTHENTICATING');

                            break;
                        case Strophe.Status.AUTHFAIL:
                            self.isConnected = false;
                            self._isConnecting = false;

                            err = Utils.getError(401, 'Status.AUTHFAIL - The authentication attempt failed', 'Chat');

                            if (isInitialConnect) {
                                callback(err, null);
                            }

                            if (!self.isConnected && typeof self.onReconnectFailedListener === 'function') {
                                Utils.safeCallbackCall(self.onReconnectFailedListener, err);
                            }

                            break;
                        case Strophe.Status.CONNECTING:
                            Utils.DLog(
                                '[Chat]',
                                'Status.CONNECTING',
                                '(Chat Protocol - ' + (Config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket' + ')')
                            );

                            break;
                        case Strophe.Status.CONNECTED:
                            // Remove any handlers that might exist from a previous connection via
                            // extension method added to the connection on initialization in cubeMain.
                            // NOTE: streamManagement also adds handlers, so do this first.
                            self.xmppClient.XDeleteHandlers();

                            self.xmppClient.XAddTrackedHandler(self._onMessage, null, 'message', 'chat');
                            self.xmppClient.XAddTrackedHandler(self._onMessage, null, 'message', 'groupchat');
                            self.xmppClient.XAddTrackedHandler(self._onPresence, null, 'presence');
                            self.xmppClient.XAddTrackedHandler(self._onIQ, null, 'iq');
                            self.xmppClient.XAddTrackedHandler(
                                self._onSystemMessageListener,
                                null,
                                'message',
                                'headline'
                            );
                            self.xmppClient.XAddTrackedHandler(self._onMessageErrorListener, null, 'message', 'error');

                            self._postConnectActions(function(roster) {
                                callback(null, roster);
                            }, isInitialConnect);

                            break;
                        case Strophe.Status.DISCONNECTING:
                            Utils.DLog('[Chat]', 'DISCONNECTING');
                            break;
                        case Strophe.Status.DISCONNECTED:
                            Utils.DLog('[Chat]', 'DISCONNECTED');

                            // fire 'onDisconnectedListener' only once
                            if (self.isConnected && typeof self.onDisconnectedListener === 'function') {
                                Utils.safeCallbackCall(self.onDisconnectedListener);
                            }

                            self.isConnected = false;
                            self._isConnecting = false;

                            // reconnect to chat and enable check connection
                            self._establishConnection(params);

                            break;
                        case Strophe.Status.ATTACHED:
                            Utils.DLog('[Chat]', 'Status.ATTACHED');
                            break;
                    }
                }
            );

            // connect for Node.js/Native-Script
            //
        } else if (Utils.getEnv().node || Utils.getEnv().nativescript) {
            // Remove all connection handlers exist from a previous connection
            self.xmppClient.removeAllListeners();

            self.xmppClient.on('connect', function() {
                Utils.DLog(
                    '[Chat]',
                    'CONNECTING',
                    '(Chat Protocol - ' + (Config.chatProtocol.active === 1 ? 'BOSH' : 'WebSocket' + ')')
                );
            });

            self.xmppClient.on('auth', function() {
                Utils.DLog('[Chat]', 'AUTHENTICATING');
            });

            self.xmppClient.on('online', function() {
                Utils.DLog('[Chat]', 'ONLINE');

                self._postConnectActions(function(roster) {
                    callback(null, roster);
                }, isInitialConnect);
            });

            self.xmppClient.on('stanza', function(stanza) {
                Utils.DLog('[Chat] RECV:', stanza.toString());
                /**
                 * Detect typeof incoming stanza
                 * and fire the Listener
                 */
                if (stanza.is('presence')) {
                    self._onPresence(stanza);
                } else if (stanza.is('iq')) {
                    self._onIQ(stanza);
                } else if (stanza.is('message')) {
                    if (stanza.attrs.type === 'headline') {
                        self._onSystemMessageListener(stanza);
                    } else if (stanza.attrs.type === 'error') {
                        self._onMessageErrorListener(stanza);
                    } else {
                        self._onMessage(stanza);
                    }
                }
            });

            self.xmppClient.on('disconnect', function() {
                Utils.DLog('[Chat]', 'DISCONNECTED');

                if (typeof self.onDisconnectedListener === 'function') {
                    Utils.safeCallbackCall(self.onDisconnectedListener);
                }

                self.isConnected = false;
                self._isConnecting = false;

                // reconnect to chat and enable check connection
                self._establishConnection(params);
            });

            self.xmppClient.on('error', function() {
                Utils.DLog('[Chat]', 'ERROR');
                err = Utils.getError(422, 'ERROR - An error has occurred', 'Chat');

                if (isInitialConnect) {
                    callback(err, null);
                }

                self.isConnected = false;
                self._isConnecting = false;
            });

            self.xmppClient.on('end', function() {
                self.xmppClient.removeAllListeners();
            });

            self.xmppClient.options.jid = userJid;
            self.xmppClient.options.password = params.password;
            self.xmppClient.connect();

            // connect for React-Native
            //
        } else if (Utils.getEnv().reactnative) {
            var removeAllListeners = function() {
                self.xmppClientListeners.forEach(function(listener) {
                    self.xmppClient.removeListener(listener.name, listener.callback);
                });
                self.xmppClientListeners = [];
            };
            removeAllListeners();

            const callbackConnect = function() {
                Utils.DLog('[Chat]', 'CONNECTING');
            };
            self.xmppClient.on('connect', callbackConnect);
            self.xmppClientListeners.push({ name: 'connect', callback: callbackConnect });

            const callbackOnline = function(jid) {
                Utils.DLog('[Chat]', 'ONLINE');

                self._postConnectActions(function(roster) {
                    callback(null, roster);
                }, isInitialConnect);
            };
            self.xmppClient.on('online', callbackOnline);
            self.xmppClientListeners.push({ name: 'online', callback: callbackOnline });

            const callbackOffline = function() {
                Utils.DLog('[Chat]', 'OFFLINE');
            };
            self.xmppClient.on('offline', callbackOffline);
            self.xmppClientListeners.push({ name: 'offline', callback: callbackOffline });

            const callbackDisconnect = function(data) {
                Utils.DLog('[Chat]', 'DISCONNECTED');

                var setIsConnectedToFalse = function() {
                    self.isConnected = false;
                    self._isConnecting = false;
                };

                // fire 'onDisconnectedListener' only once
                if (self.isConnected && typeof self.onDisconnectedListener === 'function') {
                    setIsConnectedToFalse();
                    Utils.safeCallbackCall(self.onDisconnectedListener);
                } else {
                    setIsConnectedToFalse();
                }

                // reconnect to chat and enable check connection
                self._establishConnection(params);
            };
            self.xmppClient.on('disconnect', callbackDisconnect);
            self.xmppClientListeners.push({ name: 'disconnect', callback: callbackDisconnect });

            const callbackStatus = function(status, value) {
                Utils.DLog('[Chat]', 'status', status, value ? value.toString() : '');
            };
            self.xmppClient.on('status', callbackStatus);
            self.xmppClientListeners.push({ name: 'status', callback: callbackStatus });

            // self.xmppClientReconnect.on('reconnecting', function() {
            //     Utils.DLog('[Chat]', 'RECONNECTING');
            // });
            //
            // self.xmppClientReconnect.on('reconnected', function() {
            //     Utils.DLog('[Chat]', 'RECONNECTED');
            // });

            const callbackStanza = function(stanza) {
                // console.log('stanza', stanza.toString())
                // after 'input' and 'element' (only if stanza, not nonza)

                if (stanza.is('presence')) {
                    self._onPresence(stanza);
                } else if (stanza.is('iq')) {
                    self._onIQ(stanza);
                } else if (stanza.is('message')) {
                    if (stanza.attrs.type === 'headline') {
                        self._onSystemMessageListener(stanza);
                    } else if (stanza.attrs.type === 'error') {
                        self._onMessageErrorListener(stanza);
                    } else {
                        self._onMessage(stanza);
                    }
                }
            };
            self.xmppClient.on('stanza', callbackStanza);
            self.xmppClientListeners.push({ name: 'stanza', callback: callbackStanza });

            const callbackError = function(err) {
                Utils.DLog('[Chat]', 'ERROR:', err);

                if (isInitialConnect) {
                    if (err.name == 'SASLError') {
                        err = err.condition;
                    }
                    callback(err, null);
                }

                self.isConnected = false;
                self._isConnecting = false;
            };
            self.xmppClient.on('error', callbackError);
            self.xmppClientListeners.push({ name: 'error', callback: callbackError });

            // self.xmppClient.on('element', function(element) {
            //     // console.log('element', element.toString())
            //     // after 'input'
            // });

            // self.xmppClient.on('send', function(element) {
            //     // console.log('send', element.toString())
            //     // after write to socket
            // });

            // self.xmppClient.on('outgoing', function(element) {
            //     // before send
            //     // console.log('outgoing', element.toString())
            // });

            const callbackOutput = function(str) {
                Utils.DLog('[Chat]', 'SENT:', str);
            };
            self.xmppClient.on('output', callbackOutput);
            self.xmppClientListeners.push({ name: 'output', callback: callbackOutput });

            const callbackInput = function(str) {
                Utils.DLog('[Chat]', 'RECV:', str);
            };
            self.xmppClient.on('input', callbackInput);
            self.xmppClientListeners.push({ name: 'input', callback: callbackInput });

            // define these properties so they will be used when authenticate (above)
            Object.defineProperty(self.xmppClient, 'cbUserName', {
                value: ChatUtils.buildUserJidLocalPart(params.userId),
                writable: false
            });
            Object.defineProperty(self.xmppClient, 'cbUserPassword', {
                value: params.password,
                writable: false
            });
            //
            self.xmppClient.start();
        } else {
            throw 'Unsupported platform for Chat/XMPP functionality';
        }
    },

    /**
     * Actions after the connection is established
     *
     * - enable stream management (the configuration setting);
     * - save user's JID;
     * - enable carbons;
     * - get and storage the user's roster (if the initial connect);
     * - recover the joined rooms and fire 'onReconnectListener' (if the reconnect);
     * - send initial presence to the chat server.
     */
    _postConnectActions: function(callback, isInitialConnect) {
        Utils.DLog('[Chat]', 'CONNECTED');

        var self = this,
            presence = ChatUtils.createPresenceStanza();

        if (Config.chat.streamManagement.enable && Config.chatProtocol.active === 2) {
            self.streamManagement.enable(self.xmppClient);
            self.streamManagement.sentMessageCallback = self._sentMessageCallback;
        }

        self.helpers.setUserCurrentJid(self.helpers.userCurrentJid(self.xmppClient));

        self.isConnected = true;
        self._isConnecting = false;

        self._enableCarbons();

        if (isInitialConnect) {
            self.contactList.get(function(contacts) {
                self.xmppClient.send(presence);

                self.contactList.contacts = contacts;
                callback(self.contactList.contacts);
            });
        } else {
            var rooms = Object.keys(self.muc.joinedRooms);

            self.xmppClient.send(presence);

            Utils.DLog('[Chat]', 'Re-joining ' + rooms.length + ' rooms...');

            for (var i = 0, len = rooms.length; i < len; i++) {
                self.muc.join(rooms[i]);
            }

            if (typeof self.onReconnectListener === 'function') {
                Utils.safeCallbackCall(self.onReconnectListener);
            }
        }
    },

    _establishConnection: function(params) {
        var self = this;

        if (self._isLogout || self._checkConnectionTimer) {
            return;
        }

        var _connect = function() {
            if (!self.isConnected && !self._isConnecting) {
                self.connect(params);
            } else {
                clearInterval(self._checkConnectionTimer);
                self._checkConnectionTimer = undefined;
            }
        };

        _connect();

        self._checkConnectionTimer = setInterval(function() {
            _connect();
        }, Config.chat.reconnectionTimeInterval * 1000);
    },

    /**
     * Send message to 1 to 1 or group dialog.
     * @memberof CB.chat
     * @param {String | Number} jidOrUserId - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * @param {Object} message - The message object.
     * @returns {String} messageId - The current message id (was generated by SDK)
     * */
    send: function(jidOrUserId, message) {
        var stanzaParams = {
            from: this.helpers.getUserCurrentJid(),
            to: this.helpers.jidOrUserId(jidOrUserId),
            type: message.type ? message.type : 'chat',
            id: message.id ? message.id : Utils.getBsonObjectId()
        };

        var messageStanza = ChatUtils.createMessageStanza(stanzaParams);

        if (message.body) {
            messageStanza
                .c('body', {
                    xmlns: ChatUtils.MARKERS.CLIENT
                })
                .t(message.body)
                .up();
        }

        if (message.markable) {
            messageStanza
                .c('markable', {
                    xmlns: ChatUtils.MARKERS.CHAT
                })
                .up();
        }

        if (message.extension) {
            messageStanza.c('extraParams', {
                xmlns: ChatUtils.MARKERS.CLIENT
            });

            messageStanza = ChatUtils.filledExtraParams(messageStanza, message.extension);
        }

        if (Config.chat.streamManagement.enable) {
            message.id = stanzaParams.id;
            this.xmppClient.send(messageStanza, message);
        } else {
            this.xmppClient.send(messageStanza);
        }

        return stanzaParams.id;
    },

    /**
     * Send system message (system notification) to 1 to 1 or group dialog.
     * @memberof CB.chat
     * @param {String | Number} jidOrUserId - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * @param {Object} message - The message object.
     * @returns {String} messageId - The current message id (was generated by SDK)
     * */
    sendSystemMessage: function(jidOrUserId, message) {
        var stanzaParams = {
            type: 'headline',
            id: message.id ? message.id : Utils.getBsonObjectId(),
            to: this.helpers.jidOrUserId(jidOrUserId)
        };

        var messageStanza = ChatUtils.createMessageStanza(stanzaParams);

        if (message.body) {
            messageStanza
                .c('body', {
                    xmlns: ChatUtils.MARKERS.CLIENT
                })
                .t(message.body)
                .up();
        }

        // custom parameters
        if (message.extension) {
            messageStanza
                .c('extraParams', {
                    xmlns: ChatUtils.MARKERS.CLIENT
                })
                .c('moduleIdentifier')
                .t('SystemNotifications')
                .up();

            messageStanza = ChatUtils.filledExtraParams(messageStanza, message.extension);
        }

        this.xmppClient.send(messageStanza);

        return stanzaParams.id;
    },

    /**
     * Send is typing status.
     * @memberof CB.chat
     * @param {String | Number} jidOrUserId - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * */
    sendIsTypingStatus: function(jidOrUserId) {
        var stanzaParams = {
            from: this.helpers.getUserCurrentJid(),
            to: this.helpers.jidOrUserId(jidOrUserId),
            type: this.helpers.typeChat(jidOrUserId)
        };

        var messageStanza = ChatUtils.createMessageStanza(stanzaParams);

        messageStanza.c('composing', {
            xmlns: ChatUtils.MARKERS.STATES
        });

        this.xmppClient.send(messageStanza);
    },

    /**
     * Send is stop typing status.
     * @memberof CB.chat
     * @param {String | Number} jidOrUserId - Use opponent id or jid for 1 to 1 chat, and room jid for group chat.
     * */
    sendIsStopTypingStatus: function(jidOrUserId) {
        var stanzaParams = {
            from: this.helpers.getUserCurrentJid(),
            to: this.helpers.jidOrUserId(jidOrUserId),
            type: this.helpers.typeChat(jidOrUserId)
        };

        var messageStanza = ChatUtils.createMessageStanza(stanzaParams);

        messageStanza.c('paused', {
            xmlns: ChatUtils.MARKERS.STATES
        });

        this.xmppClient.send(messageStanza);
    },

    /**
     * Send is delivered status.
     * @memberof CB.chats
     * @param {Object} params - Object of parameters
     * @param {Number} params.userId - The receiver id
     * @param {Number} params.messageId - The delivered message id
     * @param {Number} params.dialogId - The dialog id
     * */
    sendDeliveredStatus: function(params) {
        var stanzaParams = {
            type: 'chat',
            from: this.helpers.getUserCurrentJid(),
            id: Utils.getBsonObjectId(),
            to: this.helpers.jidOrUserId(params.userId)
        };

        var messageStanza = ChatUtils.createMessageStanza(stanzaParams);
        messageStanza
            .c('received', {
                xmlns: ChatUtils.MARKERS.MARKERS,
                id: params.messageId
            })
            .up();
        messageStanza
            .c('extraParams', {
                xmlns: ChatUtils.MARKERS.CLIENT
            })
            .c('dialog_id')
            .t(params.dialogId);

        this.xmppClient.send(messageStanza);
    },

    /**
     * Send is read status.
     * @memberof CB.chat
     * @param {Object} params - Object of parameters
     * @param {Number} params.userId - The receiver id
     * @param {Number} params.messageId - The delivered message id
     * @param {Number} params.dialogId - The dialog id
     * */
    sendReadStatus: function(params) {
        var stanzaParams = {
            type: 'chat',
            from: this.helpers.getUserCurrentJid(),
            to: this.helpers.jidOrUserId(params.userId),
            id: Utils.getBsonObjectId()
        };

        var messageStanza = ChatUtils.createMessageStanza(stanzaParams);
        messageStanza
            .c('displayed', {
                xmlns: ChatUtils.MARKERS.MARKERS,
                id: params.messageId
            })
            .up();
        messageStanza
            .c('extraParams', {
                xmlns: ChatUtils.MARKERS.CLIENT
            })
            .c('dialog_id')
            .t(params.dialogId);

        this.xmppClient.send(messageStanza);
    },

    /**
     * Send query to get last user activity by CB.chat.onLastUserActivityListener(userId, seconds). {@link https://xmpp.org/extensions/xep-0012.html More info.}
     * @memberof CB.chat
     * @param {(Number|String)} jidOrUserId - The user id or jid, that the last activity we want to know
     * */
    getLastUserActivity: function(jidOrUserId) {
        var iqParams = {
            from: this.helpers.getUserCurrentJid(),
            id: this.helpers.getUniqueId('lastActivity'),
            to: this.helpers.jidOrUserId(jidOrUserId),
            type: 'get'
        };

        var iqStanza = ChatUtils.createIqStanza(iqParams);
        iqStanza.c('query', {
            xmlns: ChatUtils.MARKERS.LAST
        });

        this.xmppClient.send(iqStanza);
    },

    /**
     * Logout from the Chat.
     * @memberof CB.chat
     * */
    disconnect: function() {
        clearInterval(this._checkConnectionTimer);
        this._checkConnectionTimer = undefined;
        this.muc.joinedRooms = {};
        this._isLogout = true;
        this.helpers.setUserCurrentJid('');

        if (Utils.getEnv().browser) {
            this.xmppClient.flush();
            this.xmppClient.disconnect();
        } else if (Utils.getEnv().reactnative) {
            this.xmppClient.stop();
        } else {
            // Node.js & Native Script
            this.xmppClient.end();
        }
    },

    /**
     * Carbons XEP [http://xmpp.org/extensions/xep-0280.html]
     */
    _enableCarbons: function() {
        var carbonParams = {
            type: 'set',
            from: this.helpers.getUserCurrentJid(),
            id: ChatUtils.getUniqueId('enableCarbons')
        };

        var iqStanza = ChatUtils.createIqStanza(carbonParams);
        iqStanza.c('enable', {
            xmlns: ChatUtils.MARKERS.CARBONS
        });

        if (Utils.getEnv().browser) {
            this.xmppClient.sendIQ(iqStanza);
        } else {
            this.xmppClient.send(iqStanza);
        }
    }
};

/**
 * @namespace CB.chat
 * */
module.exports = ChatProxy;
