import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import _ from 'lodash';
import PubNub from 'pubnub';
import Meteor from 'react-native-meteor';
import {
  // ABLY_API_KEY as ablyKey,
  PUBNUB_PUBLISH_KEY as publishKey,
  PUBNUB_SUBSCRIBE_KEY as subscribeKey
} from 'react-native-dotenv';

import { fonts, images } from './assets';
import store from './redux';

export default async function startup() {
  const t = new Date();
  await Font.loadAsync(fonts);
  await Asset.loadAsync(_.map(images, image => image));
  // const ably = new Ably.Realtime(ablyKey);
  const pubnub = new PubNub({ publishKey, subscribeKey });
  const meteor = Meteor.connect('ws://localhost:3000/websocket');
  // wait for redux to be ready
  let reduxReady = store.getState();
  if (!reduxReady) {
    await new Promise(resolve => {
      const unsubscribe = store.subscribe(() => {
        ({ reduxReady } = store.getState().appState);
        if (reduxReady) {
          unsubscribe();
          resolve(true);
        }
      });
    });
  }
  console.log(`startup complete in ${new Date() - t}ms`);

  return { meteor, pubnub };
}
