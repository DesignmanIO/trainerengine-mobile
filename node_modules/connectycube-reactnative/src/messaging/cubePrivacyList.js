
/* Chat module: Privacy list
 *
 * Privacy list
 * http://xmpp.org/extensions/xep-0016.html
 * by default 'mutualBlock' is work in one side
----------------------------------------------------------------------------- */

const ChatUtils = require('./cubeChatInternalUtils'),
    Utils = require('../cubeInternalUtils');


function PrivacyListProxy(options) {
    this.helpers = options.helpers;
    this.xmppClient = options.xmppClient;
    this.nodeStanzasCallbacks = options.nodeStanzasCallbacks;
}

/**
 * @namespace CB.chat.privacylist
 **/
PrivacyListProxy.prototype = {
    /**
     * Create a privacy list.
     * @memberof CB.chat.privacylist
     * @param {Object} list - privacy list object.
     * @param {createPrivacylistCallback} callback - The callback function.
     * */
    create: function (list, callback) {
        /**
         * Callback for CB.chat.privacylist.create().
         * @param {Object} error - The error object
         * @callback createPrivacylistCallback
         * */

        const self = this;

        let userId,
            userJid,
            userMuc,
            userAction,
            mutualBlock,
            listPrivacy = {},
            listUserId = [];

        /** Filled listPrivacys */
        for (let i = list.items.length - 1; i >= 0; i--) {
            const user = list.items[i];

            listPrivacy[user.user_id] = {
                action: user.action,
                mutualBlock: user.mutualBlock === true ? true : false
            };
        }

        /** Filled listUserId */
        listUserId = Object.keys(listPrivacy);

        const iqParams = {
            type: 'set',
            from: self.helpers.getUserCurrentJid(),
            id: ChatUtils.getUniqueId('edit')
        };

        let iq = ChatUtils.createIqStanza(iqParams);

        iq.c('query', {
            xmlns: ChatUtils.MARKERS.PRIVACY
        }).c('list', {
            name: list.name
        });

        function createPrivacyItem(iq, params) {
            if (Utils.getEnv().browser) {
                iq.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).c('message', {})
                    .up().c('presence-in', {})
                    .up().c('presence-out', {})
                    .up().c('iq', {})
                    .up().up();
            } else {
                let list = iq.getChild('query').getChild('list');

                list.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).c('message', {})
                    .up().c('presence-in', {})
                    .up().c('presence-out', {})
                    .up().c('iq', {})
                    .up().up();
            }

            return iq;
        }

        function createPrivacyItemMutal(iq, params) {
            if (Utils.getEnv().browser) {
                iq.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).up();
            } else {
                let list = iq.getChild('query').getChild('list');

                list.c('item', {
                    type: 'jid',
                    value: params.jidOrMuc,
                    action: params.userAction,
                    order: params.order
                }).up();
            }

            return iq;
        }

        for (let index = 0, j = 0, len = listUserId.length; index < len; index++ , j = j + 2) {
            userId = listUserId[index];
            mutualBlock = listPrivacy[userId].mutualBlock;

            userAction = listPrivacy[userId].action;
            userJid = self.helpers.jidOrUserId(parseInt(userId, 10));
            userMuc = self.helpers.getUserNickWithMucDomain(userId);

            if (mutualBlock && userAction === 'deny') {
                iq = createPrivacyItemMutal(iq, {
                    order: j + 1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItemMutal(iq, {
                    order: j + 2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                }).up().up();
            } else {
                iq = createPrivacyItem(iq, {
                    order: j + 1,
                    jidOrMuc: userJid,
                    userAction: userAction
                });
                iq = createPrivacyItem(iq, {
                    order: j + 2,
                    jidOrMuc: userMuc,
                    userAction: userAction
                });
            }
        }

        if (Utils.getEnv().browser) {
            self.xmppClient.sendIQ(
                iq,
                function (stanzaResult) {
                    callback(null);
                },
                function (stanzaError) {
                    if (stanzaError) {
                        callback(ChatUtils.getErrorFromXMLNode(stanzaError));
                    } else {
                        callback(Utils.getError(408));
                    }
                }
            );
        } else {
            self.xmppClient.send(iq);

            self.nodeStanzasCallbacks[iqParams.id] = function (stanza) {
                if (!stanza.getChildElements('error').length) {
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };
        }
    },

    /**
     * Get the privacy list.
     * @memberof CB.chat.privacylist
     * @param {String} name - The name of the list.
     * @param {getListPrivacylistCallback} callback - The callback function.
     * */
    getList: function (name, callback) {
        /**
         * Callback for CB.chat.privacylist.getList().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object
         * @callback getListPrivacylistCallback
         * */

        const self = this;

        let items,
            userJid,
            userId,
            usersList = [],
            list = {};

        const iqParams = {
            type: 'get',
            from: self.helpers.getUserCurrentJid(),
            id: ChatUtils.getUniqueId('getlist')
        };

        let iq = ChatUtils.createIqStanza(iqParams);

        iq.c('query', {
            xmlns: ChatUtils.MARKERS.PRIVACY
        }).c('list', {
            name: name
        });

        if (Utils.getEnv().browser) {
            self.xmppClient.sendIQ(
                iq,
                function (stanzaResult) {
                    items = stanzaResult.getElementsByTagName('item');

                    for (let i = 0, len = items.length; i < len; i = i + 2) {
                        userJid = items[i].getAttribute('value');
                        userId = self.helpers.getIdFromNode(userJid);
                        usersList.push({
                            user_id: userId,
                            action: items[i].getAttribute('action')
                        });
                    }

                    list = {
                        name: name,
                        items: usersList
                    };

                    callback(null, list);
                },
                function (stanzaError) {
                    if (stanzaError) {
                        callback(ChatUtils.getErrorFromXMLNode(stanzaError), null);
                    } else {
                        callback(Utils.getError(408), null);
                    }
                }
            );
        } else {
            self.nodeStanzasCallbacks[iqParams.id] = function (stanza) {
                const stanzaQuery = stanza.getChild('query');

                list = stanzaQuery ? stanzaQuery.getChild('list') : null;
                items = list ? list.getChildElements('item') : null;

                for (let i = 0, len = items.length; i < len; i = i + 2) {
                    userJid = items[i].attrs.value;
                    userId = self.helpers.getIdFromNode(userJid);
                    usersList.push({
                        user_id: userId,
                        action: items[i].attrs.action
                    });
                }

                list = {
                    name: list.attrs.name,
                    items: usersList
                };

                callback(null, list);

                delete self.nodeStanzasCallbacks[iqParams.id];
            };

            self.xmppClient.send(iq);
        }
    },

    /**
     * Update the privacy list.
     * @memberof CB.chat.privacylist
     * @param {String} name - The name of the list.
     * @param {updatePrivacylistCallback} callback - The callback function.
     * */
    update: function (listWithUpdates, callback) {
        /**
         * Callback for CB.chat.privacylist.update().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object
         * @callback updatePrivacylistCallback
         * */

        const self = this;

        self.getList(listWithUpdates.name, function (error, existentList) {
            if (error) {
                callback(error, null);
            } else {
                const updatedList = {
                    items: Utils.MergeArrayOfObjects(existentList.items, listWithUpdates.items),
                    name: listWithUpdates.name
                };

                self.create(updatedList, function (err, result) {
                    if (error) {
                        callback(err, null);
                    } else {
                        callback(null, result);
                    }
                });
            }
        });
    },

    /**
     * Get names of privacy lists.
     * Run without parameters
     * @memberof CB.chat.privacylist
     * @param {getNamesPrivacylistCallback} callback - The callback function.
     * */
    getNames: function (callback) {
        /**
         * Callback for CB.chat.privacylist.getNames().
         * @param {Object} error - The error object
         * @param {Object} response - The privacy list object (let names = response.names;)
         * @callback getNamesPrivacylistCallback
         * */

        const self = this,
            iqParams = {
                'type': 'get',
                'from': self.helpers.getUserCurrentJid(),
                'id': ChatUtils.getUniqueId('getNames')
            };

        let iq = ChatUtils.createIqStanza(iqParams);

        iq.c('query', {
            xmlns: ChatUtils.MARKERS.PRIVACY
        });

        if (Utils.getEnv().browser) {
            self.xmppClient.sendIQ(iq, function (stanzaResult) {
                const defaultList = stanzaResult.getElementsByTagName('default'),
                    activeList = stanzaResult.getElementsByTagName('active'),
                    allLists = stanzaResult.getElementsByTagName('list');

                let defaultName = defaultList && defaultList.length > 0 ? defaultList[0].getAttribute('name') : null,
                    activeName = activeList && activeList.length > 0 ? activeList[0].getAttribute('name') : null;

                let allNames = [];

                for (let i = 0, len = allLists.length; i < len; i++) {
                    allNames.push(allLists[i].getAttribute('name'));
                }

                const namesList = {
                    default: defaultName,
                    active: activeName,
                    names: allNames
                };

                callback(null, namesList);
            }, function (stanzaError) {
                if (stanzaError) {
                    callback(ChatUtils.getErrorFromXMLNode(stanzaError), null);
                } else {
                    callback(Utils.getError(408), null);
                }
            });
        } else {
            self.nodeStanzasCallbacks[iq.attrs.id] = function (stanza) {
                if (stanza.attrs.type !== 'error') {
                    const query = stanza.getChild('query'),
                        defaultList = query.getChild('default'),
                        activeList = query.getChild('active'),
                        allLists = query.getChildElements('list');

                    let defaultName = defaultList ? defaultList.attrs.name : null,
                        activeName = activeList ? activeList.attrs.name : null;

                    let allNames = [];

                    for (let i = 0, len = allLists.length; i < len; i++) {
                        allNames.push(allLists[i].attrs.name);
                    }

                    const namesList = {
                        default: defaultName,
                        active: activeName,
                        names: allNames
                    };

                    callback(null, namesList);
                } else {
                    callback(Utils.getError(408));
                }
            };

            self.xmppClient.send(iq);
        }
    },

    /**
     * Delete privacy list.
     * @param {String} name - The name of privacy list.
     * @memberof CB.chat.privacylist
     * @param {deletePrivacylistCallback} callback - The callback function.
     * */
    delete: function (name, callback) {
        /**
         * Callback for CB.chat.privacylist.delete().
         * @param {Object} error - The error object
         * @callback deletePrivacylistCallback
         * */

        const iqParams = {
            from: this.xmppClient.jid || this.xmppClient.jid.user,
            type: 'set',
            id: ChatUtils.getUniqueId('remove')
        };

        let iq = ChatUtils.createIqStanza(iqParams);

        iq.c('query', {
            xmlns: ChatUtils.MARKERS.PRIVACY
        }).c('list', {
            name: name ? name : ''
        });

        if (Utils.getEnv().browser) {
            this.xmppClient.sendIQ(
                iq,
                function (stanzaResult) {
                    callback(null);
                },
                function (stanzaError) {
                    if (stanzaError) {
                        callback(ChatUtils.getErrorFromXMLNode(stanzaError));
                    } else {
                        callback(Utils.getError(408));
                    }
                }
            );
        } else {
            this.nodeStanzasCallbacks[iq.attrs.id] = function (stanza) {
                if (!stanza.getChildElements('error').length) {
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };

            this.xmppClient.send(iq);
        }
    },

    /**
     * Set as default privacy list.
     * @param {String} name - The name of privacy list.
     * @memberof CB.chat.privacylist
     * @param {setAsDefaultPrivacylistCallback} callback - The callback function.
     * */
    setAsDefault: function (name, callback) {
        /**
         * Callback for CB.chat.privacylist.setAsDefault().
         * @param {Object} error - The error object
         * @callback setAsDefaultPrivacylistCallback
         * */

        const iqParams = {
            from: this.xmppClient.jid || this.xmppClient.jid.user,
            type: 'set',
            id: ChatUtils.getUniqueId('default')
        };

        let iq = ChatUtils.createIqStanza(iqParams);

        iq.c('query', {
            xmlns: ChatUtils.MARKERS.PRIVACY
        }).c('default', name && name.length > 0 ? { name: name } : {});

        if (Utils.getEnv().browser) {
            this.xmppClient.sendIQ(
                iq,
                function (stanzaResult) {
                    callback(null);
                },
                function (stanzaError) {
                    if (stanzaError) {
                        callback(ChatUtils.getErrorFromXMLNode(stanzaError));
                    } else {
                        callback(Utils.getError(408));
                    }
                }
            );
        } else {
            this.nodeStanzasCallbacks[iq.attrs.id] = function (stanza) {
                if (!stanza.getChildElements('error').length) {
                    callback(null);
                } else {
                    callback(Utils.getError(408));
                }
            };

            this.xmppClient.send(iq);
        }
    }

};

module.exports = PrivacyListProxy;
