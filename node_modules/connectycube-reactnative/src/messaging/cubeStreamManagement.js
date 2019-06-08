'use strict';

const Utils = require('../cubeInternalUtils'),
    ChatUtils = require('./cubeChatInternalUtils');

function StreamManagement() {
    this._NS = 'urn:xmpp:sm:3';

    this._isStreamManagementEnabled = false;

    // Counter of the incoming stanzas
    this._clientProcessedStanzasCounter = null;

    // The client send stanza counter.
    this._clientSentStanzasCounter = null;

    this._timeInterval = 2000;

    this.sentMessageCallback = null;

    if(Utils.getEnv().browser){
        this._parser = new DOMParser();
    }

    // connection
    this._c = null;

    // Original connection.send method
    this._originalSend = null;

    // In progress stanzas queue
    this._stanzasQueue = [];
}

StreamManagement.prototype.enable = function (connection) {
    var self = this,
        stanza,
        enableParams = {
            xmlns: self._NS
        };

    if(!self._isStreamManagementEnabled){
        self._c = connection;
        self._originalSend = this._c.send;
        self._c.send = this.send.bind(self);
    }

    if(Utils.getEnv().browser){
        this._clientProcessedStanzasCounter = null;
        this._clientSentStanzasCounter = null;
    }
    self._addEnableHandlers();

    stanza = ChatUtils.createNonza('enable', enableParams);

    self._c.send(stanza);
};

StreamManagement.prototype._timeoutCallback = function () {
    var self = this,
        now = Date.now(),
        updatedStanzasQueue = [];

    if(self._stanzasQueue.length){
        for(var i = 0; i < self._stanzasQueue.length; i++){
            if(self._stanzasQueue[i] && self._stanzasQueue[i].time < now){
                self.sentMessageCallback(self._stanzasQueue[i].message);
            } else {
                updatedStanzasQueue.push(self._stanzasQueue[i]);
            }
        }

        self._stanzasQueue = updatedStanzasQueue;
    }
};

StreamManagement.prototype._addEnableHandlers = function () {
    var self = this;

    if (Utils.getEnv().browser) {
        self._c.XAddTrackedHandler(_incomingStanzaHandler.bind(self));
    } else if (Utils.getEnv().reactnative){
        self._c.on('element', _incomingStanzaHandler.bind(self));
    } else { // Node.js & Native Script
        self._c.on('stanza', _incomingStanzaHandler.bind(self));
    }

    function _incomingStanzaHandler (stanza){
        /*
        * Getting incoming stanza tagName
        * */

        var tagName = stanza.name || stanza.tagName || stanza.nodeTree.tagName;

        if(tagName === 'enabled'){
            self._isStreamManagementEnabled = true;

            setInterval(self._timeoutCallback.bind(self), self._timeInterval);

            return true;
        }

        if(ChatUtils.getAttr(stanza, 'xmlns') !== self._NS){
            self._increaseReceivedStanzasCounter();
        }

        if(tagName === 'r'){
            var params = {
                    xmlns: self._NS,
                    h: self._clientProcessedStanzasCounter
                },
                answerStanza = ChatUtils.createNonza('a', params);

            self._originalSend.call(self._c, answerStanza);

            return true;
        }

        if(tagName === 'a'){
            var h = parseInt(ChatUtils.getAttr(stanza, 'h'));

            self._checkCounterOnIncomeStanza(h);
        }

        return true;
    }
};

StreamManagement.prototype.send = function (stanza, message) {
    var self = this,
        stanzaXML = stanza.nodeTree ? this._parser.parseFromString(stanza.nodeTree.outerHTML, "application/xml").childNodes[0] : stanza,
        tagName = stanzaXML.name || stanzaXML.tagName || stanzaXML.nodeTree.tagName,
        type = ChatUtils.getAttr(stanzaXML, 'type'),
        bodyContent = ChatUtils.getElementText(stanzaXML, 'body') || '',
        attachments = ChatUtils.getAllElements(stanzaXML, 'attachment') || '';

    self._originalSend.call(self._c, stanza);

    if (tagName === 'message' && (type === 'chat' || type === 'groupchat') && (bodyContent || attachments.length)) {
        self._sendStanzasRequest({
            message: message,
            time: Date.now() + self._timeInterval,
            expect: self._clientSentStanzasCounter
        });
    }

    self._clientSentStanzasCounter++;
};

StreamManagement.prototype._sendStanzasRequest = function (data) {
    var self = this;

    if(self._isStreamManagementEnabled){
        self._stanzasQueue.push(data);

        var stanza = ChatUtils.createNonza('r', {xmlns: self._NS});

        self._originalSend.call(self._c, stanza);
    }
};

StreamManagement.prototype.getClientSentStanzasCounter = function(){
    return this._clientSentStanzasCounter;
};

StreamManagement.prototype._checkCounterOnIncomeStanza = function (count){
    if (this._stanzasQueue[0].expect !== count){
        this.sentMessageCallback(this._stanzasQueue[0].message);
    } else {
        this.sentMessageCallback(null, this._stanzasQueue[0].message);
    }

    this._stanzasQueue.shift();
};

StreamManagement.prototype._increaseReceivedStanzasCounter = function(){
    this._clientProcessedStanzasCounter++;
};

module.exports = StreamManagement;
