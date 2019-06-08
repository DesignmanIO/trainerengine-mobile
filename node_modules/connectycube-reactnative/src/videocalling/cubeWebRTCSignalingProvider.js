'use strict';

var Helpers = require('./cubeWebRTCHelpers');
var SignalingConstants = require('./cubeWebRTCSignalingConstants');
var Utils = require('../cubeInternalUtils');
var config = require('../cubeConfig');
var ChatHelpers = require('../messaging/cubeChatInternalUtils');

function WebRTCSignalingProvider(service, connection) {
    this.service = service;
    this.connection = connection;
}

WebRTCSignalingProvider.prototype.sendCandidate = function(userId, iceCandidates, ext) {
    var extension = ext || {};
    extension.iceCandidates = iceCandidates;

    this.sendMessage(userId, extension, SignalingConstants.SignalingType.CANDIDATE);
};

WebRTCSignalingProvider.prototype.sendMessage = function(userId, ext, signalingType) {
    var extension = ext || {},
        self = this,
        msg, params;

    /** basic parameters */
    extension.moduleIdentifier = SignalingConstants.MODULE_ID;
    extension.signalType = signalingType;
    /** extension.sessionID */
    /** extension.callType */
    extension.platform = 'web';
    /** extension.callerID */
    /** extension.opponentsIDs */
    /** extension.sdp */

    if (extension.userInfo && !Object.keys(extension.userInfo).length) {
        delete extension.userInfo;
    }

    params = {
        to: Helpers.getUserJid(userId, config.creds.appId),
        type: 'headline',
        id: Utils.getBsonObjectId()
    };

    msg = ChatHelpers.createMessageStanza(params).c('extraParams', {
        xmlns: ChatHelpers.MARKERS.CLIENT
    });

    Object.keys(extension).forEach(function(field) {
        if (field === 'iceCandidates') {
            /** iceCandidates */
            msg = msg.c('iceCandidates');
            extension[field].forEach(function(candidate) {
                msg = msg.c('iceCandidate');
                Object.keys(candidate).forEach(function(key) {
                    msg = msg.c(key).t(candidate[key]).up();
                });
                msg = msg.up();
            });
            msg = msg.up();
        } else if (field === 'opponentsIDs') {
            /** opponentsIDs */
            msg = msg.c('opponentsIDs');
            extension[field].forEach(function(opponentId) {
                msg = msg.c('opponentID').t(opponentId).up();
            });
            msg = msg.up();
        } else if (typeof extension[field] === 'object') {
            ChatHelpers._JStoXML(field, extension[field], msg);
        } else {
            msg = msg.c(field).t(extension[field]).up();
        }
    });
    msg = msg.up();

    this.connection.send(msg);
};

module.exports = WebRTCSignalingProvider;
