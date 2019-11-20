import * as Font from 'expo-font';
import { Asset } from 'expo-asset';
import { SQLite } from 'expo-sqlite';
import _ from 'lodash';
// import { ConnectyCube } from 'connectycube-reactnative';
// import Ably from 'ably-react-native';
import PubNub from 'pubnub';
import Meteor from 'react-native-meteor';
import { databaseActions } from './utils';
import {
  // ABLY_API_KEY as ablyKey,
  PUBNUB_PUBLISH_KEY as publishKey,
  PUBNUB_SUBSCRIBE_KEY as subscribeKey
} from 'react-native-dotenv';

import { fonts, images } from './assets';
import dbDefinitions from './database/databaseDefinitions';

export default async function startup() {
  await Font.loadAsync(fonts);
  await Asset.loadAsync(_.map(images, image => image));
  // const ably = new Ably.Realtime(ablyKey);
  const pubnub = new PubNub({ publishKey, subscribeKey });
  const meteor = Meteor.connect('ws://localhost:3000/websocket');
  const database = SQLite.openDatabase('db');
  database.transaction(
    tx => dbDefinitions(tx),
    err => console.log('db err', err),
    res => console.log('db res', res)
  );
  database.actions = databaseActions(database);

  return { meteor, pubnub, database };
}
