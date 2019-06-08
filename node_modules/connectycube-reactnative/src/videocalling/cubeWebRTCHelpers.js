'use strict';

var config = require('../cubeConfig');
const Utils = require('../cubeInternalUtils');

var WebRTCHelpers = {};

WebRTCHelpers = {
    getUserJid: function(id, appId) {
        return id + '-' + appId + '@' + config.endpoints.chat;
    },

    getIdFromNode: function(jid) {
        if (jid.indexOf('@') < 0) return null;
        return parseInt(jid.split('@')[0].split('-')[0]);
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

    trace: function(text) {
        if (config.debug) {
            console.log('[VideoChat]:', text);
        }
    },

    traceWarning: function(text) {
        if (config.debug) {
            console.warn('[VideoChat]:', text);
        }
    },

    traceError: function(text) {
        if (config.debug) {
            console.error('[VideoChat]:', text);
        }
    },

    // Convert Data URI to Blob
    dataURItoBlob: function(dataURI, contentType) {
        var arr = [],
            binary = window.atob(dataURI.split(',')[1]);

        for (var i = 0, len = binary.length; i < len; i++) {
            arr.push(binary.charCodeAt(i));
        }

        return new Blob([new Uint8Array(arr)], {type: contentType});
    },

    /**
     * It's functions to fixed issue
     * https://bugzilla.mozilla.org/show_bug.cgi?id=1377434
     */
    getVersionFirefox: function() {
        var ua = navigator ? navigator.userAgent : false;
        var version;

        if (ua) {
            var ffInfo = ua.match(/(?:firefox)[ \/](\d+)/i) || [];
            version = ffInfo[1] ? + ffInfo[1] : null;
        }

        return version;
    },

    getVersionSafari: function() {
        var ua = navigator ? navigator.userAgent : false;
        var version;

        if (ua) {
            var sInfo = ua.match(/(?:safari)[ \/](\d+)/i) || [];

            if (sInfo.length) {
                var sVer = ua.match(/(?:version)[ \/](\d+)/i) || [];

                if (sVer) {
                    version = sVer[1] ? + sVer[1] : null;
                } else {
                    version = null;
                }
            } else {
                version = null;
            }
        }

        return version;
    }
};

/**
 * [SessionConnectionState]
 * @type {Object}
 */
WebRTCHelpers.SessionConnectionState = {
    UNDEFINED: 0,
    CONNECTING: 1,
    CONNECTED: 2,
    FAILED: 3,
    DISCONNECTED: 4,
    CLOSED: 5,
    COMPLETED: 6
};

/**
 * [CallType]
 * @type {Object}
 */
WebRTCHelpers.CallType = {
    VIDEO: 1,
    AUDIO: 2
};

module.exports = WebRTCHelpers;
