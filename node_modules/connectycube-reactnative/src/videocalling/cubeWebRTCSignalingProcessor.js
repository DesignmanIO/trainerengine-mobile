'use strict';

var SignalingConstants = require('./cubeWebRTCSignalingConstants');
var ChatHelpers = require('../messaging/cubeChatInternalUtils');

function WebRTCSignalingProcessor(service, delegate, connection) {
    var self = this;

    self.service = service;
    self.delegate = delegate;
    self.connection = connection;

    this._onMessage = function(from, extraParams, delay, userId) {

        var extension = self._getExtension(extraParams),
            sessionId = extension.sessionID,
            signalType = extension.signalType;

        /** cleanup */
        delete extension.moduleIdentifier;
        delete extension.sessionID;
        delete extension.signalType;

        switch (signalType) {
            case SignalingConstants.SignalingType.CALL:
                if (typeof self.delegate._onCallListener === 'function'){
                    self.delegate._onCallListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.ACCEPT:
                if (typeof self.delegate._onAcceptListener === 'function'){
                    self.delegate._onAcceptListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.REJECT:
                if (typeof self.delegate._onRejectListener === 'function'){
                    self.delegate._onRejectListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.STOP:
                if (typeof self.delegate._onStopListener === 'function'){
                    self.delegate._onStopListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.CANDIDATE:
                if (typeof self.delegate._onIceCandidatesListener === 'function'){
                    self.delegate._onIceCandidatesListener(userId, sessionId, extension);
                }
                break;

            case SignalingConstants.SignalingType.PARAMETERS_CHANGED:
                if (typeof self.delegate._onUpdateListener === 'function'){
                    self.delegate._onUpdateListener(userId, sessionId, extension);
                }
                break;
        }
    };

    this._getExtension = function(extraParams) {
        if (!extraParams) {
            return null;
        }

        var extension = {}, iceCandidates = [], opponents = [],
            candidate, opponent, childrenNodes;

        var extraParamsChildNodes = extraParams.childNodes || extraParams.children;

        for (var i = 0, len = extraParamsChildNodes.length; i < len; i++) {
            const items = extraParamsChildNodes[i].childNodes || extraParamsChildNodes[i].children;
            const itemTagName = extraParamsChildNodes[i].tagName || extraParamsChildNodes[i].name;

            if (itemTagName === 'iceCandidates') {

                /** iceCandidates */
                for (var j = 0, len2 = items.length; j < len2; j++) {
                    candidate = {};
                    childrenNodes = items[j].childNodes || items[j].children;

                    for (var k = 0, len3 = childrenNodes.length; k < len3; k++) {
                        var childName = childrenNodes[k].tagName || childrenNodes[k].name;
                        var childValue = childrenNodes[k].textContent || childrenNodes[k].children[0];
                        candidate[childName] = childName === 'sdpMLineIndex' ? parseInt(childValue) : childValue;
                    }

                    iceCandidates.push(candidate);
                }

            } else if (itemTagName === 'opponentsIDs') {
                /** opponentsIDs */
                for (var v = 0, len2v = items.length; v < len2v; v++) {
                    opponent = items[v].textContent || items[v].children[0];
                    opponents.push(parseInt(opponent));
                }
            } else {
                if (items.length > 1) {
                    var nodeTextContentSize = (extraParamsChildNodes[i].textContent || extraParamsChildNodes[i].children[0]).length;

                    if (nodeTextContentSize > 4096) {
                        var wholeNodeContent = "";

                        for (var t=0; t<items.length; ++t) {
                            wholeNodeContent += (items.textContent || items.children[0]);
                        }
                        extension[itemTagName] = wholeNodeContent;
                    } else {
                        extension = ChatHelpers._XMLtoJS(extension, itemTagName, extraParamsChildNodes[i]);
                    }
                } else {
                    if (extraParamsChildNodes[i].tagName === 'userInfo') {
                        extension = ChatHelpers._XMLtoJS(extension, itemTagName, extraParamsChildNodes[i]);
                    } else {
                        extension[itemTagName] = extraParamsChildNodes[i].textContent || extraParamsChildNodes[i].children[0];
                    }
                }
            }
        }
        if (iceCandidates.length > 0){
            extension.iceCandidates = iceCandidates;
        }
        if (opponents.length > 0){
            extension.opponentsIDs = opponents;
        }

        return extension;
    };
}

module.exports = WebRTCSignalingProcessor;
