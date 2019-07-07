import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import _ from 'lodash';
// import { ConnectyCube } from 'connectycube-reactnative';
import PubNub from 'pubnub';
import Meteor from 'react-native-meteor';
import {
  PUBNUB_PUBLISH_KEY as publishKey,
  PUBNUB_SUBSCRIBE_KEY as subscribeKey,
} from 'react-native-dotenv';

import { fonts, images } from './assets';

export default async function startup() {

  await Font.loadAsync(fonts);
  await Asset.loadAsync(_.map(images, image => image));
  const pubNub = new PubNub({ publishKey, subscribeKey });
  const meteor = Meteor.connect('ws://localhost:3000/websocket');

  return { meteor, pubNub };
}
