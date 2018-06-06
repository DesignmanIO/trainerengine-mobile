'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reduxPersist = require('redux-persist');

var _core = require('crypto-js/core');

var _core2 = _interopRequireDefault(_core);

var _helpers = require('./helpers');

var _AsyncCryptor = require('./AsyncCryptor');

var _AsyncCryptor2 = _interopRequireDefault(_AsyncCryptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var makeAsyncEncryptor = function makeAsyncEncryptor(cryptor) {
  return (0, _helpers.makeEncryptor)(function (state) {
    return cryptor.encrypt(state).then(function (encryptedState) {
      return encryptedState;
    });
  });
};

var makeAsyncDecryptor = function makeAsyncDecryptor(cryptor) {
  return (0, _helpers.makeDecryptor)(function (state) {
    return cryptor.decrypt(state).then(function (decryptedState) {
      return JSON.parse(decryptedState.toString(_core2.default.enc.Utf8));
    });
  });
};

exports.default = function (config) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('redux-persist-transform-encrypt: async support is still a work in progress.');
  }
  var asyncCryptor = new _AsyncCryptor2.default(config.secretKey);
  var inbound = makeAsyncEncryptor(asyncCryptor);
  var outbound = makeAsyncDecryptor(asyncCryptor);
  return (0, _reduxPersist.createTransform)(inbound, outbound, config);
};