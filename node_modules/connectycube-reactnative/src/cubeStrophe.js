const config = require('./cubeConfig'),
	chatPRTCL = config.chatProtocol,
	Utils = require('./cubeInternalUtils');

function Connection() {
	const protocol = chatPRTCL.active === 1 ? chatPRTCL.bosh : chatPRTCL.websocket,
		conn = new Strophe.Connection(protocol);

	if (chatPRTCL.active === 1) {
		conn.xmlInput = function (data) {
			if (data.childNodes[0]) {
				for (let i = 0, len = data.childNodes.length; i < len; i++) {
					Utils.DLog('[Chat]', 'RECV:', data.childNodes[i]);
				}
			}
		};
		conn.xmlOutput = function (data) {
			if (data.childNodes[0]) {
				for (let i = 0, len = data.childNodes.length; i < len; i++) {
					Utils.DLog('[Chat]', 'SENT:', data.childNodes[i]);
				}
			}
		};
	} else {
		conn.xmlInput = function (data) {
			Utils.DLog('[Chat]', 'RECV:', data);
		};
		conn.xmlOutput = function (data) {
			Utils.DLog('[Chat]', 'SENT:', data);
		};
	}

	return conn;
}

module.exports = Connection;
