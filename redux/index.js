import Constants from 'expo-constants';
import { createStore, combineReducers } from 'redux';
// import thunk from 'redux-thunk';
import { persistStore, persistReducer, createMigrate } from 'redux-persist';
import createEncryptor from 'redux-persist-transform-encrypt';
import { AsyncStorage } from 'react-native';
import { btoa } from 'Base64';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import thunkSubscribe from 'redux-thunk-subscribe';

import appState from './appState';
import userState from './userState';
import userActions from './userActions';
import appActions, { reduxReady } from './appActions';
import C from './actionTypes';

// encrypt stored state with hashed device ID
const encryptor = createEncryptor({
  secretKey: btoa(Constants.deviceId),
  onError(err) {
    console.warn(err);
  }
});

const migrate = createMigrate(
  {
    0: state => ({
      ...state
    })
  },
  { debug: true }
);

const store = createStore(
  persistReducer(
    {
      key: 'root',
      storage: AsyncStorage,
      blacklist: ['appState'],
      transforms: [encryptor],
      version: 0,
      stateReconciler: autoMergeLevel2
    },
    combineReducers({ appState, userState })
  ),
  thunkSubscribe
);

const persister = persistStore(store, null, () => store.dispatch(reduxReady()));

export default store;
export { persister, userActions, appActions, C };
