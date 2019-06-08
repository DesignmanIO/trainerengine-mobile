'use strict';

var Janus = require('./janus.umd');
var Utils = require('../cubeInternalUtils');
var coreConfig = require('../cubeConfig');
var EventEmitter = require('fbemitter').EventEmitter;

var EVENT_PARTICIPANT_JOINED = "participantjoined";
var EVENT_PARTICIPANT_LEFT = "participantleft";
var EVENT_LOCAL_STREAM = "localstream";
var EVENT_REMOTE_STREAM = "remotestream";


/**
 * @class
 * @param {Object} configParams - a set of configuration parameters. The
 *  following parameters are applied:<br>
 * @param {String} configParams.server - (<b>required</b>) the address of the
 *  gateway as a specific address (e.g., http://yourserver:8088 to use
 *  the plain HTTP API or ws://yourserver:8188 for WebSockets).
 * @param {Boolean} configParams.debug - (<i>optional</i>) whether debug should
 *  be enabled on the JavaScript console (true/false). Default is true.
 * @throws "'server' parameter is mandatory" error if 'server' parameter is null
 *  or undefined.
 * @throws "missing adapter.js" error if the 'adapter.js' is not connected.
 */
function VideoConferencingClient(configParams) {
  if(!adapter){
    throw "Error: in order to use this library please connect adapter.js. More info https://github.com/webrtc/adapter";
  }

  this.configs = configParams;
  if(!this.configs.server){
    throw "'server' parameter is mandatory.";
  }else{
    if(this.configs.server.includes("http")){
      this.configs.server = this.configs.server + "/janus";
    }
  }
  if(!this.configs.debug){
    this.configs.debug = "all";
  }

  this.engine = null;
  this.videoRoomPlugin = null;
  this.isOnlyAudio = false;
  //
  this.currentDialogId = null;
  this.remoteFeeds = [];
  this.remoteJseps = [];
  this.remoteFeedsAttachingInProgress = [];
  //
  this.currentMidiaDeviceId = null;
  //
  this.bitrateTimers = [];
  //
  this.emitter = new EventEmitter();
}

/**
 * Attach media stream to HTML 'video' element
 *
 * @static
 * @param {Object} element - HTML 'video' element
 * @param {Object} stream - WebRTC media stream
 */
VideoConferencingClient.attachMediaStream = function(element, stream) {
  Janus.attachMediaStream(element, stream);
};

/**
 *  Get plugged devices
 *
 * @static
 * @param {function} callback - a callback to be notified about result
 *  (with single argument - array of all devices).
 */
VideoConferencingClient.listDevices = function(callback) {
  navigator.mediaDevices.enumerateDevices().then(function(devices) {
    console.debug(devices);
    callback(devices);
  }).catch(function(err) {
    console.error(err);
    callback([]);
  });;
};

/**
 *  Get plugged video input devices only
 *
 * @static
 * @param {function} callback - a callback to be notified about result
 *  (with single argument - array of video input devices).
 */
VideoConferencingClient.listVideoinputDevices = function(callback) {
  VideoConferencingClient.listDevices(function(devices){
    var videoSelect = [];
    // code sample
    // https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js#L27
    for (var i=0; i!==devices.length; ++i) {
      var deviceInfo = devices[i];
      if (deviceInfo.kind === 'videoinput') {
        var videoinputDescription = deviceInfo.label || 'camera ' + (videoSelect.length + 1);
        var videoinputId = deviceInfo.deviceId;
        videoSelect.push({"label": videoinputDescription, "deviceId": videoinputId});
      }
    }
    callback(videoSelect);
  });
};

VideoConferencingClient.prototype = {

  /**
   * Create video session
   *
   * @param {Object} callbacks - a set of callbacks to be notified about result,
   *  namely:<br>
   * @param {function} callbacks.success - the session was successfully created
   *  and is ready to be used.
   * @param {function} callbacks.error - the session was NOT successfully
   *  created. This callback passes single argument - text description of error.
   * @param {function} callbacks.destroyed - the session was destroyed and
   *  can't be used any more.
   */
   createSession: function(callbacks) {
      var self = this;

      Janus.init({debug: this.configs.debug, callback: function() {

        if(!Janus.isWebrtcSupported()) {
          if(typeof callbacks.error === 'function'){
            callbacks.error("Your browser does not support WebRTC, so you can't use this functionality.");
          }
          return;
        }

        self.engine = new Janus({
          server: self.configs.server,
          iceServers: coreConfig.videochat.iceServers,

          success: function() {
            if(typeof callbacks.success === 'function'){
              Utils.safeCallbackCall(callbacks.success);
            }
          },
          error: function(error) {
            if(typeof callbacks.error === 'function'){
              Utils.safeCallbackCall(callbacks.error, error);
            }
          },
          destroyed: function() {
            if(typeof callbacks.destroyed === 'function'){
              Utils.safeCallbackCall(callbacks.destroyed);
            }
          },
          timeoutSessionCallback: function(){
            if(typeof callbacks.timeoutSessionCallback === 'function'){
              Utils.safeCallbackCall(callbacks.timeoutSessionCallback);
            }
          }
        });

      }});
    },

    /**
     * Returns the unique session identifier
     *
     * @returns {String} unique session identifier or null.
     */
    getSessionId: function(){
      if(this.engine){
        return this.engine.getSessionId();
      }
      return null;
    },

   /**
    * Destroy video session
    *
    * @param {Object} callbacks - a set of callbacks to be notified about
    *  result, namely:<br>
    * @param {function} callbacks.success - the session was successfully
    *  destroyed and no longer available.
    * @param {function} callbacks.error - the session was NOT successfully
    *  destroyed. This callback passes single argument - text description
    *  of error.
    */
    destroySession: function(callbacks) {
      var self = this;
      this.engine.destroy({});

      if(typeof callbacks.success === 'function'){
        Utils.safeCallbackCall(callbacks.success);
      }
    },

    /**
     * Сreate a video conferencing plugin handle.
     *
     * @param  {Boolean} isRemote  To pass 'false' when you attach plugin to
     *  current user and pass 'true' when attach to remote user.
     * @param  {Number}  userId  To pass 'null' when you attach plugin to
     *  current user and pass remote user id when attach to remote user.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the handle was successfully
     *  created and is ready to be used.
     * @param {function} callbacks.error - the handle was NOT successfully
     *  created or some error has occured. The format of error is the following:
     *  {"error_code": "some integer code", "error": "some text description"}.
     *  Possible values of 'error_code': <br>
     * <ul>
     * <li>428: No such feed - can happen when a user joins room and quickly
     * leaves it so other user tries to subscribe to none existend feed.
     * Usually, this error can be ignored.</li>
     * <li>433: Unauthorized - do not have proper rights to join this room.</li>
     * <li>436: User ID already exists in this room.</li>
     * <li>400: Some not usual error occured, for example - no connection to
     *  server. </li>
     * </ul>
     *
     * @param {function} callbacks.consentDialog - this callback is triggered
     *  just before <b>getUserMedia</b> is called (parameter=<b>true</b>) and
     *  after it is completed (parameter=<b>false</b>); this means it can be
     *  used to modify the UI accordingly, e.g., to prompt the user about the
     *  need to accept the device access consent requests.
     * @param {function} callbacks.mediaState - this callback is triggered
     *  when server starts or stops receiving your media: for instance,
     *  a <b>mediaState</b> with type=audio and on=true means server started
     *  receiving your audio stream (or started getting them again after
     *  a pause of more than a second); a mediaState with type=video
     *  and on=false means server hasn't received any video from you in the
     *  last second, after a start was detected before; useful to figure out
     *  when server actually started handling your media, or to detect problems
     *  on the media path (e.g., media never started, or stopped at some time).
     * @param {function} callbacks.webrtcState - this callback is triggered
     *  with a <b>true</b> value when the PeerConnection associated to a handle
     *  becomes active (so ICE, DTLS and everything else succeeded) from
     *  the library perspective, while <b>false</b> is triggered when
     *  the PeerConnection goes down instead; useful to figure out when WebRTC
     *  is actually up and running between you and server (e.g., to notify
     *  a user they're actually now active in a conference).
     * @param {function} callbacks.slowLink - this callback is triggered when
     *  server reports trouble either sending or receiving media on the
     *  specified PeerConnection, typically as a consequence of too many NACKs
     *  received from/sent to the user in the last second: for instance,
     *  a slowLink with uplink=true means you notified several missing packets
     *  from server, while uplink=false means server is not receiving all your
     *  packets; useful to figure out when there are problems on the media
     *  path (e.g., excessive loss), in order to possibly react accordingly
     *  (e.g., decrease the bitrate if most of our packets are getting lost).
     * @param {function} callbacks.oncleanup - the WebRTC PeerConnection with
     *  the plugin was closed.
     */
    attachVideoConferencingPlugin: function(isRemote, userId, callbacks){
      var self = this;
      var remoteFeed = null;

      this.engine.attach({
        plugin: "janus.plugin.videoroom",
        success: function(pluginHandle) {
          if(isRemote){
            remoteFeed = pluginHandle;
            remoteFeed.userId = userId;
            self.remoteFeedsAttachingInProgress[userId] = remoteFeed;

            // join remote's feed (listen)
            var listen = { "request": "join", "room": self.currentDialogId,
                        "ptype": "listener", "feed": userId};

            // If the publisher is VP8 and this is Safari, let's avoid video
            if(adapter.browserDetails.browser === "safari") {
              listen["offer_video"] = false;
            }

            remoteFeed.send({"message": listen});
          }else{
            self.videoRoomPlugin = pluginHandle;
          }

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error) {
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, Utils.wrapError(error));
          }
        },
        consentDialog: function(on) {
          if(typeof callbacks.consentDialog === 'function'){
            Utils.safeCallbackCall(callbacks.consentDialog, on);
          }
        },
        mediaState: function(medium, on) {
          if(typeof callbacks.mediaState === 'function'){
            Utils.safeCallbackCall(callbacks.mediaState, medium, on);
          }
        },
        webrtcState: function(on) {
          if(typeof callbacks.webrtcState === 'function'){
            Utils.safeCallbackCall(callbacks.webrtcState, on);
          }
        },
        slowLink: function(uplink, nacks){
          if(typeof callbacks.slowLink === 'function'){
            Utils.safeCallbackCall(callbacks.slowLink, uplink, nacks);
          }
        },
        iceState: function(iceConnectionState){
          if(typeof callbacks.iceState === 'function'){
            Utils.safeCallbackCall(callbacks.iceState, iceConnectionState);
          }
        },
        onmessage: function(msg, jsep) {
          var event = msg["videoroom"];

          // remote feed
          if(isRemote){
            if(event) {
              // Remote feed attached
              if(event === "attached") {
                var feedId = msg["id"];
                self.remoteFeeds[feedId] = self.remoteFeedsAttachingInProgress[feedId];
                self.remoteFeedsAttachingInProgress[feedId] = null;
              }else if(msg["error"]) {
                // #define VIDEOROOM_ERROR_NO_SUCH_FEED		428
                //
                if(typeof callbacks.error === 'function'){
                  Utils.safeCallbackCall(callbacks.error, Utils.wrapError(msg["error"]));
                }
              }
            }

            if(jsep) {
              var feedId = msg["id"];

              // ICE restart case
              if(!feedId){
              }

              self.remoteJseps[feedId] = jsep;

              self.createAnswer(self.remoteFeeds[feedId], jsep, {
                success: function() {

                },
                error: function(error) {
                  if(typeof callbacks.error === 'function'){
                    Utils.safeCallbackCall(callbacks.error, Utils.wrapError(error));
                  }
                }
              });
            }

          // local feed
          }else{
            if(event) {
              // We JOINED
              if(event === "joined") {
                self.createOffer({useAudio: true, useVideo: !self.isOnlyAudio}, {
                  success: function() {
                    // Any new feed to attach to?
                    if(msg["publishers"]) {
                      var publishers = msg["publishers"];
                      for(var f in publishers) {
                        var userId = publishers[f]["id"];
                        var userDisplayName = publishers[f]["display"];
                        self.emitter.emit(EVENT_PARTICIPANT_JOINED, userId, userDisplayName);
                      }
                    }
                  },
                  error: function(error) {
                    if(typeof callbacks.error === 'function'){
                      Utils.safeCallbackCall(callbacks.error, Utils.wrapError(error));
                    }
                  }
                });

              // We JOINED and now receiving who is online
              }else if(event === "event") {
                // Any new feed to attach to?
                if(msg["publishers"]) {
                  var publishers = msg["publishers"];

                  for(var f in publishers) {
                    var userId = publishers[f]["id"];
                    var userDisplayName = publishers[f]["display"];

                    self.emitter.emit(EVENT_PARTICIPANT_JOINED, userId, userDisplayName);
                  }

                // Someone is LEAVING
                } else if(msg["leaving"]) {
                  // One of the publishers has gone away?
                  var feedId = msg["leaving"];
                  var success = self.detachRemoteFeed(feedId);
                  if(success) {
                    self.emitter.emit(EVENT_PARTICIPANT_LEFT, feedId, null);
                  }

                } else if(msg["unpublished"]) {

                  // One of the publishers has gone away?
                  var feedId = msg["unpublished"];
                  if(feedId != 'ok'){
                    var success = self.detachRemoteFeed(feedId);
                    if(success){
                      self.emitter.emit(EVENT_PARTICIPANT_LEFT, feedId, null);
                    }
                  }

                } else if(msg["error"]) {
                  // #define VIDEOROOM_ERROR_ID_EXISTS			436
                  // #define VIDEOROOM_ERROR_UNAUTHORIZED		433
                  //
                  if(typeof callbacks.error === 'function'){
                    Utils.safeCallbackCall(callbacks.error, Utils.wrapError(msg["error"]));
                  }
                }
              }
            }

            if(jsep) {
              self.videoRoomPlugin.handleRemoteJsep({jsep: jsep});

              // TODO:
              // handle wrong or unsupported codecs here...
              // var video = msg["video_codec"];
              // if(mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
              // 		"Our video stream has been rejected, viewers won't see us";
              // }

            }

          }
        },
        onlocalstream: function(stream) {
          self.emitter.emit(EVENT_LOCAL_STREAM, stream);
        },
        onremotestream: function(stream) {
          remoteFeed.stream = stream;

          self.emitter.emit(EVENT_REMOTE_STREAM, stream, remoteFeed.userId);
        },
        oncleanup: function() {
          console.info("ON CLEANUP");
          if(typeof callbacks.oncleanup === 'function'){
            Utils.safeCallbackCall(callbacks.oncleanup);
          }
        },
        detached: function() {

        }
      });
    },

    /**
     * Returns the unique plugin identifier
     *
     * @returns {String} unique plugin identifier or null.
     */
    getPluginId: function(){
      if(this.videoRoomPlugin){
        return this.videoRoomPlugin.getId();
      }
      return null;
    },

    /**
     * Detach a video conferencing plugin handle.
     *
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the handle was successfully
     *  destroyed.
     * @param {function} callbacks.error - the handle was NOT successfully
     *  destroyed. This callback passes single argument - text description
     *  of error.
     */
    detachVideoConferencingPlugin: function(callbacks){
      var self = this;

      var clean = function(){
        self.videoRoomPlugin = null;

        // detach all remote feeds
        Object.keys(self.remoteFeeds).forEach(function(userId){
          self.detachRemoteFeed(userId);
        });

        self.remoteFeeds = [];
        self.remoteJseps = [];

        self.currentMidiaDeviceId = null;
      };

      this.videoRoomPlugin.detach({
        success: function() {
          clean();

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error) {
          clean();

          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        },
      });
    },

    /**
     * Join video conference room
     *
     * @param {String} chatDialogId - a chat dialog ID to join
     * @param {Number} userId - an id of current user.
     * @param {Boolean} isOnlyAudio - to join current room as audio-only.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the chat dialog was successfully
     *  joined.
     * @param {function} callbacks.error - the chat dialog was NOT successfully
     *  joined. This callback passes single argument - text description
     *  of error.
     */
    join: function(chatDialogId, userId, isOnlyAudio, callbacks) {
      var self = this;

      if(typeof(isOnlyAudio) !== "boolean"){
        throw "'isOnlyAudio' parameter can be of type 'boolean' only.";
      }
      self.isOnlyAudio = isOnlyAudio;
      if(adapter.browserDetails.browser === "safari") {
        self.isOnlyAudio = true;
      }

      console.info("isOnlyAudio: " + self.isOnlyAudio);

      var joinEvent = { "request": "join", "room": chatDialogId,
                    "ptype": "publisher", "id": userId}; //"display": null
    	this.videoRoomPlugin.send({"message": joinEvent,
        success: function(resp) {
          self.currentDialogId = chatDialogId;
          self.currentUserId = userId;

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error) {
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        }
      });
    },

    /**
     * Leave video conference room
     *
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - the chat dialog was successfully
     *  left.
     * @param {function} callbacks.error - the chat dialog was NOT successfully
     *  left. This callback passes single argument - text description of error.
     */
    leave: function(callbacks){
      var self = this;

      console.warn("leave");

      if(!self.engine.isConnected()){
        if(typeof callbacks.success === 'function'){
          Utils.safeCallbackCall(callbacks.success);
        }
        return;
      }

      var leaveEvent = { "request": "leave", "room": this.currentDialogId, "id": this.currentUserId};
      if(this.videoRoomPlugin){
        this.videoRoomPlugin.send({"message": leaveEvent});
      }
      this.currentDialogId = null;
      this.currentUserId = null;

      console.warn("resp");
      if(typeof callbacks.success === 'function'){
        Utils.safeCallbackCall(callbacks.success);
      }
    },

    /**
     * List online participants
     *
     * @param {String} chatDialogId - a chat dialog ID to list online
     *  participants in.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - when everything is ok and you will
     *  receive one argument - array of online participants.
     * @param {function} callbacks.error - when an error occured. This callback
     *  passes single argument - text description of error.
     */
    listOnlineParticipants: function(chatDialogId, callbacks) {
      var listRequest = {"request": "listparticipants", "room": chatDialogId};
      //
      this.videoRoomPlugin.send({"message": listRequest,
        success: function(data) {
          var participants = [];
          if(data){
            participants = data.participants;
          }
          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success, participants);
          }
        },
        error: function(error) {
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        }
      });
    },

    /**
     * Toggle audio mute.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    toggleAudioMute: function(){
      var muted = this.videoRoomPlugin.isAudioMuted();
    	if(muted){
    		this.videoRoomPlugin.unmuteAudio();
    	}else{
    		this.videoRoomPlugin.muteAudio();
      }
      return this.videoRoomPlugin.isAudioMuted();
    },

    /**
     * Is audio muted.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    isAudioMuted: function(){
      return this.videoRoomPlugin.isAudioMuted();
    },

    /**
     * Toggle remote user audio mute.
     *
     * @param {Number} userId - an id of user to mute audio.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    toggleRemoteAudioMute: function(userId){
      var remoteFeed = this.remoteFeeds[userId];
      if(!remoteFeed){
        return false;
      }

      var audioTracks = remoteFeed.stream.getAudioTracks();
      if(audioTracks && audioTracks.length > 0) {
        for(var i=0; i<audioTracks.length; ++i){
          audioTracks[i].enabled = !audioTracks[i].enabled;
        }
        return !audioTracks[0].enabled;
      }

      return false;
    },

    /**
     * Is remote audio muted.
     *
     * @param {Number} userId - an id of user to check audio mute
     *  state.
     *
     * @returns {Boolean} true if audio is muted, otherwise - false.
     */
    isRemoteAudioMuted: function(userId){
      var remoteFeed = this.remoteFeeds[userId];
      if(!remoteFeed){
        return false;
      }

      var audioTracks = remoteFeed.stream.getAudioTracks();
      if(audioTracks && audioTracks.length > 0) {
        return !audioTracks[0].enabled;
      }

      return false;
    },

    /**
     * Toggle video mute.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    toggleVideoMute: function(){
        var muted = this.videoRoomPlugin.isVideoMuted();
        if(muted){
            this.videoRoomPlugin.unmuteVideo();
        }else{
            this.videoRoomPlugin.muteVideo();
        }
        return this.videoRoomPlugin.isVideoMuted();
    },

    /**
     * Is video muted.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    isVideoMuted: function(){
        return this.videoRoomPlugin.isVideoMuted();
    },

    /**
     * Toggle remote user video mute.
     *
     * @param {Number} userId - an id of user to mute video.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    toggleRemoteVideoMute: function(userId){
        var remoteFeed = this.remoteFeeds[userId];
        if(!remoteFeed){
            return false;
        }

        var videoTracks = remoteFeed.stream.getVideoTracks();
        if(videoTracks && videoTracks.length > 0) {
            for(var i=0; i<videoTracks.length; ++i){
                videoTracks[i].enabled = !videoTracks[i].enabled;
            }
            return !videoTracks[0].enabled;
        }

        return false;
    },

    /**
     * Is remote video muted.
     *
     * @param {Number} userId - an id of user to check video mute
     *  state.
     *
     * @returns {Boolean} true if video is muted, otherwise - false.
     */
    isRemoteVideoMuted: function(userId){
        var remoteFeed = this.remoteFeeds[userId];
        if(!remoteFeed){
            return false;
        }

        var videoTracks = remoteFeed.stream.getVideoTracks();
        if(videoTracks && videoTracks.length > 0) {
            return !videoTracks[0].enabled;
        }

        return false;
    },

    /**
     * Switch video input source.
     *
     * @param {String} mediaDeviceId - an id of media device (camera) to switch to.
     *  Can be obtained via 'VideoConferencingClient.listVideoinputDevices'.
     * @param {Object} callbacks - a set of callbacks to be notified about
     *  result, namely:<br>
     * @param {function} callbacks.success - when everything is ok.
     * @param {function} callbacks.error - when an error occured. This callback
     *  passes single argument - text description of error.
     */
    switchVideoinput: function(mediaDeviceId, callbacks){

      if(!this.videoRoomPlugin){
        if(typeof callbacks.error === 'function'){
          Utils.safeCallbackCall(callbacks.error, "No active stream");
        }
        return;
      }

      if(this.isOnlyAudio){
        throw "Can't switch video input in audio only call.";
      }

      this.currentMidiaDeviceId = null;

      var self = this;

      this.createOffer({video: {deviceId: mediaDeviceId}, replaceVideo: true}, {
        success: function() {
          console.info("switchVideoinput: success");

          self.currentMidiaDeviceId = mediaDeviceId;

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
        },
        error: function(error){
          console.info("switchVideoinput: error", error);

          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
        }
      });
    },

    /**
     * Initiate ICE restart for remote peer.
     * These are typically needed whenever something in your network changes
     * (e.g., you move from WiFi to mobile or a different WiFi) but want to
     * keep the conversation going: in this case, an ICE restart needs to take
     * place, as the peers need to exchange the new candidates they can be
     * reached on.
     *
     * @param {Number} userIdOrCallbacks - an id of user to initiate ICE restart with or callbacks if it's a local peer.
     * @param {function} callbacks.success - when everything is ok.
     * @param {function} callbacks.error - when an error occured. This callback
     *  passes single argument - text description of error.
     */
    iceRestart: function(userIdOrCallbacks, callbacks){
      // remote ICE restart
      if(callbacks){
        console.info("Performing remote ICE restart for user: ", userIdOrCallbacks);

        var remoteFeed = this.remoteFeeds[userIdOrCallbacks];

        if(!remoteFeed){
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, "No such user feed");
          }
          return;
        }

        var req = {"request": "configure", "restart": true};
        remoteFeed.send({"message": req});

        if(typeof callbacks.success === 'function'){
          Utils.safeCallbackCall(callbacks.success);
        }

      // local ICE restart
      }else{
        console.info("Performing local ICE restart");

        this.createOffer({iceRestart: true}, {
          success: function() {
            if(typeof userIdOrCallbacks.success === 'function'){
              Utils.safeCallbackCall(userIdOrCallbacks.success);
            }
          },
          error: function(error){
            if(typeof userIdOrCallbacks.error === 'function'){
              Utils.safeCallbackCall(userIdOrCallbacks.error, error);
            }
          }
        });
      }
    },

    /**
     * @private
     */
    createOffer: function(inputParams, callbacks){
      console.log("createOffer, inputParams: ", inputParams);
      var self = this;

      var useAudio = inputParams.useAudio;
      var useVideo = inputParams.useVideo;
      var stream = inputParams.stream;
      var replaceVideo = inputParams.replaceVideo;
      var iceRestart = inputParams.iceRestart;

      var videoQuality = self.configs.video ? self.configs.video.quality : null;
      var videoFrameRate = self.configs.video ? self.configs.video.frameRate : null;

      var params;
      if(stream){
          params = {stream: stream};
      }else if(replaceVideo){
          params = {media: inputParams};
          if (videoQuality) {
              params["media"]["video"] = videoQuality;
          }
          if (videoFrameRate){
              params["media"]["videoFrameRate"] = {min: videoFrameRate, max: videoFrameRate}
          }
      }else if(iceRestart){
          params = inputParams;
      }else{
          params = {media: {audioRecv: false,
                            videoRecv: false,
                            audioSend: useAudio,
                            videoSend: useVideo}}; // Publishers are sendonly
          if (videoQuality) {
              params["media"]["video"] = videoQuality;
          }
          if (videoFrameRate){
              params["media"]["videoFrameRate"] = {min: videoFrameRate, ideal: videoFrameRate}
          }
      }

      console.info("createOffer params: ", params);

      params.success = function(jsep) {
          var publish = {"request": "configure"};
          if(replaceVideo || iceRestart){
            // publish["update"] = true;
          }else{
            publish["audio"] = useAudio;
            publish["video"] = useVideo;
          }
          console.info("createOffer publish: ", publish);

          self.videoRoomPlugin.send({"message": publish, "jsep": jsep});

          if(typeof callbacks.success === 'function'){
              callbacks.success();
          }
      };

      params.error = function(error) {
          console.error("Error in createOffer: ", error);
          if (useAudio) {
              self.createOffer({useAudio: false, useVideo: false}, callbacks);
          } else {
              if(typeof callbacks.error === 'function'){
                  callbacks.error(error);
              }
          }
      };

      this.videoRoomPlugin.createOffer(params);
    },

    /**
     * @private
     */
    createAnswer: function(remoteFeed, jsep, callbacks){
      var self = this;

      remoteFeed.createAnswer({
				jsep: jsep,
				media: { audioSend: false, videoSend: false },	// We want recvonly audio/video
				success: function(jsep) {
					var body = { "request": "start", "room": self.currentDialogId};
					remoteFeed.send({"message": body, "jsep": jsep});

          if(typeof callbacks.success === 'function'){
            Utils.safeCallbackCall(callbacks.success);
          }
				},
				error: function(error) {
          console.error("createAnswer error: ", error);
          if(typeof callbacks.error === 'function'){
            Utils.safeCallbackCall(callbacks.error, error);
          }
				}
			});
    },

    /**
     * @private
     */
    detachRemoteFeed: function(userId){
      var remoteFeed = this.remoteFeeds[userId];
      if(remoteFeed) {
        remoteFeed.detach();
        this.remoteFeeds[userId] = null;
        this.remoteJseps[userId] = null;
        return true;
      }
      return false;
    },

    /**
     * Start show a verbose description of the user's stream bitrate.
     * Refresh it every 1 second.
     *
     * @param {Number} userId - an id of user to gets stream bitrate.
     * @param {Object} element - DOM element to display bitrate on.
     */
    showBitrate: function(userId, element){
      var remoteFeed = this.remoteFeeds[userId];

      if(adapter.browserDetails.browser === "chrome" || adapter.browserDetails.browser === "firefox") {
        this.bitrateTimers[userId] = setInterval(function() {
          var bitrate = remoteFeed.getBitrate();
          element.text(bitrate);
        }, 1000);
      }
    },

    /**
     * Stop show a verbose description of the user's stream bitrate.
     *
     * @param {Number} userId - an id of user to stop show stream
     * bitrate.
     * @param {Object} element - DOM element to stop display bitrate on.
     */
    hideBitrate: function(userId, element){
      if(this.bitrateTimers[userId]){
        clearInterval(this.bitrateTimers[userId]);
      }
      this.bitrateTimers[userId] = null;
      element.text = null;
    },

    /**
     * Adds a listener to be invoked when events of the specified type are
     * emitted. The data arguments emitted will be passed to the listener
     * function. <br>
     * Possible events:
     * <ul>
     * <li>'participantjoined': (userId, userDisplayName)</li>
     * <li>'participantleft': (userId, userDisplayName)</li>
     * <li>'localstream': (stream)</li>
     * <li>'remotestream': (stream, userId)</li>
     * </ul>
     *
     * @param {String} eventType - Name of the event to listen to
     * @param {function} listener - Function to invoke when the specified
     *  event is emitted
     */
    on: function(eventType, listener){
      var token = this.emitter.addListener(eventType, listener);
    },

    /**
     * Removes all of the registered listeners.
     *
     * @param {?String} eventType - Optional name of the event whose registered
     *   listeners to remove.
     */
    removeAllListeners: function(eventType){
      if(eventType){
        this.emitter.removeAllListeners(eventType);
      }else{
        this.emitter.removeAllListeners();
      }
    }
};

module.exports = {Client: VideoConferencingClient};
