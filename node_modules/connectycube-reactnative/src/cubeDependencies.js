'use strict';

var base64 = require('base-64');
global.btoa = base64.encode;
global.atob = base64.decode;
var XMPPClient = require('@xmpp/client');

import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  getUserMedia,
  MediaStream,
  mediaDevices
} from 'react-native-webrtc';

var SDPTransform = require('sdp-transform');

module.exports = {fetchImpl: fetch,
               formDataImpl: FormData,
                 XMPPClient: XMPPClient,
     XMPPWebSocketTransport: null,
          RTCPeerConnection: RTCPeerConnection,
      RTCSessionDescription: RTCSessionDescription,
            RTCIceCandidate: RTCIceCandidate,
                MediaStream: MediaStream,
               mediaDevices: mediaDevices,
               SDPTransform: SDPTransform};
