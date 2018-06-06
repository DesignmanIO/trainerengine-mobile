import { Constants } from 'expo';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import createEncryptor from 'redux-persist-transform-encrypt';
import { AsyncStorage } from 'react-native';
// import { btoa } from 'Base64';

import appState from './appState';
import userState from './userState';
import actions from './actions';
import C from './actionTypes';

const Store = createStore(persistReducer(
  { key: 'root', storage: AsyncStorage },
  combineReducers({ appState, userState }),
  applyMiddleware(middleware, thunk),
));

// encrypt stored state with hashed device ID
const encryptor = createEncryptor({ secretKey: btoa(Constants.deviceId) });

const persister = persistStore(Store);

export default Store;
export { persister, actions, C };
