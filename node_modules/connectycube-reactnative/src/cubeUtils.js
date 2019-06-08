const Utils = {
	isBrowser: typeof document !== 'undefined',
	isReactNative: typeof navigator != 'undefined' && navigator.product == 'ReactNative',
	isNativeScript:
		typeof global === 'object' && (typeof global.android !== 'undefined' || typeof global.NSObject !== 'undefined'),

	/**
	 * [getEnv get a name of an execution environment]
	 * @return {object} return names of env. (node/browsernativescript/reactnative)
	 */
	getEnv: function () {
		return {
			nativescript: this.isNativeScript,
			reactnative: this.isReactNative,
			browser: this.isBrowser,
			node: !this.isBrowser && !this.isNativeScript && !this.isReactNative
		};
	},

	isWebRTCAvailble: function () {

		let isAvaible = false;

		if (this.isBrowser) {
			if (window.RTCPeerConnection && window.RTCIceCandidate && window.RTCSessionDescription) {
				isAvaible = true;
			}
		} else if (this.isReactNative){
			isAvaible = true;
		}

		return isAvaible;
	}
};

module.exports = Utils;
